import base64
import json
import os
import shutil
import subprocess
import time

import cv2
import numpy as np
import requests
from flask import Flask, Response, request, jsonify
from flask_socketio import SocketIO, emit
from ultralytics import YOLO

from utils import predictImg

# Flask 应用设置
class VideoProcessingApp:
    def __init__(self, host='0.0.0.0', port=5000):
        """初始化 Flask 应用并设置路由"""
        self.app = Flask(__name__)
        self.app.config['JSON_AS_ASCII'] = False
        self.app.config['JSONIFY_MIMETYPE'] = 'application/json; charset=utf-8'
        self.socketio = SocketIO(self.app, cors_allowed_origins="*")
        self.host = host
        self.port = port
        self.setup_routes()
        self.data = {}
        self.paths = {
            'download': './runs/video/download.mp4',
            'output': './runs/video/output.mp4',
            'camera_output': "./runs/video/camera_output.avi",
            'video_output': "./runs/video/camera_output.avi"
        }
        self.recording = False
        # 前端传帧推理：按权重缓存模型，避免每帧重复加载
        self._yolo_models = {}
        # 浏览器实时流：按 sessionId 写 AVI，结束时转码上传并写入 cameraRecords
        self._camera_stream_sessions = {}

    def setup_routes(self):
        self.app.add_url_rule('/file_names', 'file_names', self.file_names, methods=['GET'])
        self.app.add_url_rule('/predictImg', 'predictImg', self.predictImg, methods=['POST'])
        self.app.add_url_rule('/predictFrame', 'predictFrame', self.predictFrame, methods=['POST'])
        self.app.add_url_rule(
            '/finalizeCameraSession', 'finalizeCameraSession', self.finalizeCameraSession, methods=['POST']
        )
        self.app.add_url_rule('/predictVideo', 'predictVideo', self.predictVideo)
        self.app.add_url_rule('/predictCamera', 'predictCamera', self.predictCamera)
        self.app.add_url_rule('/stopCamera', 'stopCamera', self.stopCamera, methods=['GET'])

        @self.socketio.on('connect')
        def handle_connect():
            print("WebSocket connected!")
            emit('message', {'data': 'Connected to WebSocket server!'})

        @self.socketio.on('disconnect')
        def handle_disconnect():
            print("WebSocket disconnected!")

    def run(self):
        self.socketio.run(self.app, host=self.host, port=self.port, allow_unsafe_werkzeug=True)

    def file_names(self):
        weight_files = self.get_file_names("./weights")
        weight_items = []
        for rel_path in weight_files:
            top = rel_path.split('/', 1)[0]
            top_noext = os.path.splitext(top)[0]
            weight_items.append({'value': rel_path, 'label': top_noext})
        # 替换：用 jsonify 并强制 UTF-8 编码
        response = jsonify({'weight_items': weight_items})
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response

    def predictImg(self):
        data = request.get_json()
        self.data.clear()
        self.data.update({
            "weight": data['weight'],
            "conf": data['conf'], "startTime": data['startTime'],
            "inputImg": data['inputImg']
        })
        print(self.data)
        predict = predictImg.ImagePredictor(weights_path=f'./weights/{self.data["weight"]}',
                                            img_path=self.data["inputImg"], save_path='./runs/result.jpg',
                                            conf=float(self.data["conf"]))
        results = predict.predict()
        uploadedUrl = self.upload('./runs/result.jpg')
        if results['labels'] != '预测失败':
            self.data["status"] = 200
            self.data["message"] = "预测成功"
            self.data["outImg"] = uploadedUrl
            self.data["allTime"] = results['allTime']
            self.data["confidence"] = json.dumps(results['confidences'], ensure_ascii=False)
            self.data["label"] = json.dumps(results['labels'], ensure_ascii=False)
        else:
            self.data["status"] = 400
            self.data["message"] = "该图片无法识别，请重新上传！"
        path = self.data["inputImg"].split('/')[-1]
        if os.path.exists('./' + path):
            os.remove('./' + path)
        # 替换：用 jsonify 并强制 UTF-8 编码
        response = jsonify(self.data)
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response

    def _get_yolo_model(self, weight_rel):
        if weight_rel not in self._yolo_models:
            self._yolo_models[weight_rel] = YOLO(f'./weights/{weight_rel}')
        return self._yolo_models[weight_rel]

    def _safe_session_file_part(self, session_id):
        s = ''.join(c for c in str(session_id) if c.isalnum() or c in '-_')
        return (s or 'sess')[:80]

    def _ensure_stream_session_writer(self, session_id):
        if session_id in self._camera_stream_sessions:
            return self._camera_stream_sessions[session_id]
        os.makedirs('./runs', exist_ok=True)
        part = self._safe_session_file_part(session_id)
        avi_path = f"./runs/browser_stream_{part}.avi"
        writer = cv2.VideoWriter(avi_path, cv2.VideoWriter_fourcc(*'XVID'), 10, (640, 480))
        self._camera_stream_sessions[session_id] = {
            'writer': writer,
            'path': avi_path,
            'frame_count': 0,
        }
        return self._camera_stream_sessions[session_id]

    def _append_stream_session_frame(self, session_id, processed_bgr):
        if not session_id:
            return
        sess = self._ensure_stream_session_writer(session_id)
        if sess.get('writer') is None:
            return
        h, w = processed_bgr.shape[:2]
        frame = processed_bgr if (w == 640 and h == 480) else cv2.resize(processed_bgr, (640, 480))
        sess['writer'].write(frame)
        sess['frame_count'] = sess.get('frame_count', 0) + 1

    def predictFrame(self):
        """浏览器摄像头：前端传 JPEG base64 帧，返回带检测框的 JPEG base64（服务器无需本地摄像头）。"""
        data = request.get_json(force=True, silent=True) or {}
        weight = data.get('weight')
        conf = data.get('conf', 0.25)
        frame_raw = data.get('frame') or data.get('image')
        if not weight or not frame_raw:
            return jsonify({"status": 400, "message": "缺少 weight 或 frame"}), 400
        try:
            conf_f = float(conf)
        except (TypeError, ValueError):
            conf_f = 0.25
        if isinstance(frame_raw, str) and ',' in frame_raw:
            frame_raw = frame_raw.split(',', 1)[1]
        try:
            img_bytes = base64.b64decode(frame_raw)
        except Exception:
            return jsonify({"status": 400, "message": "frame 不是合法 base64"}), 400
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if frame is None:
            return jsonify({"status": 400, "message": "无法解码图片"}), 400

        try:
            model = self._get_yolo_model(weight)
            t0 = time.time()
            results = model.predict(source=frame, imgsz=640, conf=conf_f, show=False)
            elapsed = time.time() - t0
            r0 = results[0]
            processed = r0.plot()
            record_sid = data.get('recordSessionId') or data.get('sessionId')
            if record_sid:
                try:
                    # 强制统一尺寸，让英文模型也能保存视频
                    write_frame = cv2.resize(processed, (640, 480))
                    self._append_stream_session_frame(record_sid, write_frame)
                except Exception as wex:
                    print(f"append stream frame failed: {wex}")

            ok, buf = cv2.imencode('.jpg', processed)
            if not ok:
                raise RuntimeError("imencode failed")
            out_b64 = base64.b64encode(buf).decode('utf-8')

            # ====================== 【修复：中英文实时识别】 ======================
            # 这里 100% 调用你写好的中英文标签逻辑
            label_names = predictImg.resolve_label_names(weight)

            labels = []
            confidences = []
            if r0.boxes is not None and len(r0.boxes):
                cls_arr = r0.boxes.cls.cpu().numpy()
                cf_arr = r0.boxes.conf.cpu().numpy()
                for idx, c in zip(cls_arr, cf_arr):
                    ii = int(idx)
                    # 自动取中文 或 英文
                    if 0 <= ii < len(label_names):
                        labels.append(label_names[ii])
                    else:
                        labels.append(str(ii))
                    confidences.append(f"{float(c) * 100:.2f}%")
            # ====================================================================

            payload = {
                "status": 200,
                "message": "预测成功",
                "outFrame": out_b64,
                "label": json.dumps(labels, ensure_ascii=False),
                "confidence": json.dumps(confidences, ensure_ascii=False),
                "allTime": f"{elapsed:.3f}秒",
            }
            response = jsonify(payload)
            response.headers['Content-Type'] = 'application/json; charset=utf-8'
            return response
        except Exception as e:
            print(f"predictFrame error: {e}")
            return jsonify({"status": 500, "message": str(e)}), 500


    def finalizeCameraSession(self):
        """结束浏览器实时会话：将已写入的标注 AVI 转 MP4、上传，并 POST 到 Spring cameraRecords 入库。"""
        data = request.get_json(force=True, silent=True) or {}
        session_id = data.get('sessionId') or data.get('recordSessionId')
        username = data.get('username', '')
        start_time = data.get('startTime', '')
        weight = data.get('weight', '')
        conf = data.get('conf', '')

        if not session_id:
            return jsonify({"status": 400, "message": "缺少 sessionId", "saved": False}), 400

        sess = self._camera_stream_sessions.pop(session_id, None)
        if not sess:
            return jsonify({"status": 200, "message": "无本地录制会话", "saved": False})

        writer = sess.get('writer')
        avi_path = sess.get('path')
        frame_count = int(sess.get('frame_count', 0))

        try:
            if writer is not None:
                writer.release()
        except Exception:
            pass

        if frame_count < 1 or not avi_path or not os.path.exists(avi_path):
            try:
                if avi_path and os.path.exists(avi_path):
                    os.remove(avi_path)
            except Exception:
                pass
            return jsonify({"status": 200, "message": "未录制到有效帧", "saved": False})

        try:
            for _ in self.convert_avi_to_mp4(avi_path):
                pass
        except Exception as conv_ex:
            print(f"finalizeCameraSession ffmpeg: {conv_ex}")
            try:
                self.cleanup_files([avi_path, self.paths['output']])
            except Exception:
                pass
            return jsonify({"status": 500, "message": str(conv_ex), "saved": False}), 500

        uploaded_url = None
        try:
            if os.path.exists(self.paths['output']):
                uploaded_url = self.upload(self.paths['output'])
        except Exception as up_ex:
            print(f"finalizeCameraSession upload: {up_ex}")

        row = {
            "username": username,
            "weight": weight,
            "conf": str(conf),
            "startTime": start_time,
            "outVideo": uploaded_url,
        }
        try:
            self.save_data(json.dumps(row, ensure_ascii=False), 'http://localhost:9999/cameraRecords')
            # self.save_data(json.dumps(row, ensure_ascii=False), 'http://springboot.jiutian.icu/cameraRecords')
        except Exception as save_ex:
            print(f"finalizeCameraSession save_data: {save_ex}")

        try:
            self.cleanup_files([self.paths['output'], avi_path])
        except Exception:
            pass

        return jsonify({
            "status": 200,
            "message": "预测成功",
            "saved": True,
            "outVideo": uploaded_url,
        })

    def predictVideo(self):
        self.data.clear()
        self.data.update({
            "username": request.args.get('username'), "weight": request.args.get('weight'),
            "conf": request.args.get('conf'), "startTime": request.args.get('startTime'),
            "inputVideo": request.args.get('inputVideo')
        })
        self.download(self.data["inputVideo"], self.paths['download'])
        cap = cv2.VideoCapture(self.paths['download'])
        if not cap.isOpened():
            raise ValueError("无法打开视频文件")
        fps = int(cap.get(cv2.CAP_PROP_FPS))

        video_writer = cv2.VideoWriter(
            self.paths['video_output'],
            cv2.VideoWriter_fourcc(*'XVID'),
            fps,
            (640, 480)
        )
        model = YOLO(f'./weights/{self.data["weight"]}')

        def generate():
            try:
                while cap.isOpened():
                    ret, frame = cap.read()
                    if not ret:
                        break
                    frame = cv2.resize(frame, (640, 480))
                    results = model.predict(source=frame, conf=float(self.data['conf']), show=False)
                    processed_frame = results[0].plot()
                    video_writer.write(processed_frame)
                    _, jpeg = cv2.imencode('.jpg', processed_frame)
                    yield b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n'
            finally:
                self.cleanup_resources(cap, video_writer)
                self.socketio.emit('message', {'data': '处理完成，正在保存！'})
                for progress in self.convert_avi_to_mp4(self.paths['video_output']):
                    self.socketio.emit('progress', {'data': progress})
                uploadedUrl = self.upload(self.paths['output'])
                self.data["outVideo"] = uploadedUrl
                self.save_data(json.dumps(self.data, ensure_ascii=False), 'http://localhost:9999/videoRecords')
                # self.save_data(json.dumps(self.data, ensure_ascii=False), 'http://springboot.jiutian.icu/videoRecords')
                self.cleanup_files([self.paths['download'], self.paths['output'], self.paths['video_output']])

        return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

    def predictCamera(self):
        self.data.clear()
        self.data.update({
            "username": request.args.get('username'), "weight": request.args.get('weight'),
            "conf": request.args.get('conf'), "startTime": request.args.get('startTime')
        })
        self.socketio.emit('message', {'data': '正在加载，请稍等！'})
        model = YOLO(f'./weights/{self.data["weight"]}')
        cap = cv2.VideoCapture(0)
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 640)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 480)
        video_writer = cv2.VideoWriter(self.paths['camera_output'], cv2.VideoWriter_fourcc(*'XVID'), 20, (640, 480))
        self.recording = True

        def generate():
            try:
                while self.recording:
                    ret, frame = cap.read()
                    if not ret:
                        break
                    results = model.predict(source=frame, imgsz=640, conf=float(self.data['conf']), show=False)
                    processed_frame = results[0].plot()
                    if self.recording and video_writer:
                        video_writer.write(processed_frame)
                    _, jpeg = cv2.imencode('.jpg', processed_frame)
                    yield b'--frame\r\n' b'Content-Type: image/jpeg\r\n\r\n' + jpeg.tobytes() + b'\r\n'
            finally:
                self.cleanup_resources(cap, video_writer)
                self.socketio.emit('message', {'data': '处理完成，正在保存！'})
                for progress in self.convert_avi_to_mp4(self.paths['camera_output']):
                    self.socketio.emit('progress', {'data': progress})
                uploadedUrl = self.upload(self.paths['output'])
                self.data["outVideo"] = uploadedUrl
                self.save_data(json.dumps(self.data, ensure_ascii=False), 'http://localhost:9999/cameraRecords')
                # self.save_data(json.dumps(self.data, ensure_ascii=False), 'http://springboot.jiutian.icu/cameraRecords')
                self.cleanup_files([self.paths['download'], self.paths['output'], self.paths['camera_output']])

        return Response(generate(), mimetype='multipart/x-mixed-replace; boundary=frame')

    def stopCamera(self):
        self.recording = False
        # 替换：用 jsonify 并强制 UTF-8 编码
        response = jsonify({"status": 200, "message": "预测成功", "code": 0})
        response.headers['Content-Type'] = 'application/json; charset=utf-8'
        return response

    def process_list(self, input_list):
        unique_list = []
        seen = set()
        for item in input_list:
            if item not in seen:
                seen.add(item)
                unique_list.append(item)

        if '正常' in unique_list and len(unique_list) > 1:
            unique_list = [item for item in unique_list if item != '正常']

        return unique_list

    def save_data(self, data, path):
        headers = {'Content-Type': 'application/json; charset=utf-8'}  # 新增：指定请求编码
        try:
            response = requests.post(path, data=data, headers=headers)
            print("记录上传成功！" if response.status_code == 200 else f"记录上传失败，状态码: {response.status_code}")
        except requests.RequestException as e:
            print(f"上传记录时发生错误: {str(e)}")

    # def convert_avi_to_mp4(self, temp_output):
    #     ffmpeg_cmd = self.get_ffmpeg_command()
    #     ffmpeg_command = f"\"{ffmpeg_cmd}\" -i \"{temp_output}\" -vcodec libx264 \"{self.paths['output']}\" -y"
    #     process = subprocess.Popen(
    #         ffmpeg_command,
    #         shell=True,
    #         stdout=subprocess.PIPE,
    #         stderr=subprocess.PIPE,
    #         text=True,
    #     )
    #     total_duration = self.get_video_duration(temp_output)
    #
    #     for line in process.stderr:
    #         if "time=" in line:
    #             try:
    #                 time_str = line.split("time=")[1].split(" ")[0]
    #                 h, m, s = map(float, time_str.split(":"))
    #                 processed_time = h * 3600 + m * 60 + s
    #                 if total_duration > 0:
    #                     progress = (processed_time / total_duration) * 100
    #                     yield progress
    #             except Exception as e:
    #                 print(f"解析进度时发生错误: {e}")
    #
    #     process.wait()
    #     if process.returncode != 0 or not os.path.exists(self.paths['output']):
    #         raise RuntimeError("FFmpeg 转码失败，请检查 ffmpeg 是否已正确安装并可执行。")
    #     yield 100
    #
    # def get_ffmpeg_command(self):
    #     cmd = shutil.which("ffmpeg")
    #     if cmd:
    #         return cmd
    #
    #     # 当前文件所在目录（main.py 同级）
    #     current_dir = os.path.dirname(os.path.abspath(__file__))
    #
    #     # 路径：同级 → ffmpeg → bin → ffmpeg.exe
    #     candidates = [
    #         os.path.join(current_dir, "ffmpeg", "bin", "ffmpeg.exe"),
    #     ]
    #
    #     for path in candidates:
    #         if os.path.exists(path):
    #             return path
    #
    #     raise FileNotFoundError(
    #         "未找到 ffmpeg，请确保 ffmpeg/bin/ffmpeg.exe 放在与当前脚本同级的目录。"
    #     )

    def convert_avi_to_mp4(self, temp_output):
        import shutil
        import subprocess

        # 直接调用系统 ffmpeg
        ffmpeg = shutil.which("ffmpeg")

        # 最简命令：只转格式，不做任何花里胡哨的操作
        cmd = [
            ffmpeg,
            "-i", temp_output,
            self.paths['output'],
            "-y"
        ]

        # 直接执行，不解析进度，不搞复杂逻辑
        subprocess.run(cmd)

        # 直接返回完成
        yield 100

    def get_ffmpeg_command(self):
        import shutil
        return shutil.which("ffmpeg")








    def get_video_duration(self, path):
        try:
            cap = cv2.VideoCapture(path)
            if not cap.isOpened():
                return 0
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            cap.release()
            return total_frames / fps if fps > 0 else 0
        except Exception:
            return 0

    def get_file_names(self, directory):
        try:
            weight_files = []
            for root, _, files in os.walk(directory):
                for file in files:
                    if file.lower().endswith(".pt"):
                        full_path = os.path.join(root, file)
                        rel_path = os.path.relpath(full_path, directory)
                        rel_path = rel_path.replace("\\", "/")
                        weight_files.append(rel_path)
            return sorted(weight_files)
        except Exception as e:
            print(f"发生错误: {e}")
            return []

    def upload(self, out_path):
        upload_url = "http://localhost:9999/files/upload"
        # upload_url = "http://springboot.jiutian.icu/files/upload"
        try:
            with open(out_path, 'rb') as file:
                files = {'file': (os.path.basename(out_path), file)}
                response = requests.post(upload_url, files=files)
                if response.status_code == 200:
                    print("文件上传成功！")
                    return response.json()['data']
                else:
                    print("文件上传失败！")
        except Exception as e:
            print(f"上传文件时发生错误: {str(e)}")

    def download(self, url, save_path):
        os.makedirs(os.path.dirname(save_path), exist_ok=True)
        try:
            with requests.get(url, stream=True) as response:
                response.raise_for_status()
                with open(save_path, 'wb') as file:
                    for chunk in response.iter_content(chunk_size=8192):
                        if chunk:
                            file.write(chunk)
            print(f"文件已成功下载并保存到 {save_path}")
        except requests.RequestException as e:
            print(f"下载失败: {e}")

    def cleanup_files(self, file_paths):
        for path in file_paths:
            if os.path.exists(path):
                os.remove(path)

    def cleanup_resources(self, cap, video_writer):
        if cap.isOpened():
            cap.release()
        if video_writer is not None:
            video_writer.release()
        cv2.destroyAllWindows()


if __name__ == '__main__':
    video_app = VideoProcessingApp()
    video_app.run()