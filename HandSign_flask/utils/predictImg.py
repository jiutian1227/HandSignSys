# utils/predictImg.py
import json
import time
import cv2
import os
from ultralytics import YOLO


class SignLanguagePredictor:
    def __init__(self, weights_path, img_path, save_path="./runs/result.jpg", conf=0.5):
        """
        初始化预测器
        :param weights_path: 训练好的权重文件路径（如best.pt）
        :param img_path: 输入图像路径
        :param save_path: 结果保存路径
        :param conf: 置信度阈值（过滤低置信度检测结果）
        """
        self.model = YOLO(weights_path)
        self.conf = conf
        self.img_path = img_path
        self.save_path = save_path
        # 通过权重“名称”选择中文/英文标签。
        # 约定：权重值形如 '中文-轻量模型/best.pt' 或 '英文-小型模型.pt'。
        # 规则：用 '-' 截断，取前缀判断是 '中文' 还是 '英文'。
        weights_path_norm = str(weights_path).replace("\\", "/")
        # 尝试从 './weights/<模型名>/...' 中截出 '<模型名>'
        after_weights = weights_path_norm
        if "weights/" in weights_path_norm:
            after_weights = weights_path_norm.split("weights/", 1)[1]
        top = after_weights.split("/", 1)[0]  # '<模型名>.pt' 或 '<模型名>'
        top_noext = os.path.splitext(top)[0]
        prefix = top_noext.split("-", 1)[0].strip()

        if prefix == "英文" or "英文" in top_noext:
            self.labels = [chr(ord("A") + i) for i in range(26)]
        else:
            # 加载 data.yaml 中的中文手语类别（35 类）
            self.labels = [
                '时间/时候', '你/您/你的/这', '早上', '9', '0', '快乐/高兴', '新', '祝', '请', '路',
                '生日', '平', '安', '朋友', '8', '认识', '名片', '结婚/妻子', '茶', '有',
                '花', '今天', '门', '停', '谢谢', '慢', '走', '晚', '我', '爱',
                '好', '人', '什么', '名字', '介绍'
            ]

    def predict(self):
        """预测图片中的中文手语，返回检测结果并保存可视化图片"""
        start_time = time.time()

        # 执行预测（half=True加速推理，save_conf保存置信度）
        results = self.model(
            source=self.img_path,
            conf=self.conf,
            half=True,
            save_conf=True
        )

        elapsed_time = time.time() - start_time
        # 初始化结果字典
        all_results = {
            'labels': [],  # 检测到的手语标签（中文）
            'confidences': [],  # 对应置信度
            'allTime': f"{elapsed_time:.3f}秒"
        }

        try:
            if len(results) == 0:
                print("未检测到手语目标，保存原始图片")
                self._save_original_image()
                all_results['labels'] = '预测失败'  # 与main.py逻辑匹配
                return all_results

            has_detection = False
            for result in results:
                # 提取检测框的类别和置信度
                if hasattr(result.boxes, 'cls') and hasattr(result.boxes, 'conf'):
                    labels_idx = result.boxes.cls.cpu().numpy()  # 类别索引
                    confidences = result.boxes.conf.cpu().numpy()  # 置信度

                    if len(labels_idx) > 0 and len(confidences) > 0:
                        has_detection = True
                        # 转换为中文标签
                        label_names = []
                        for idx in labels_idx:
                            ii = int(idx)
                            label_names.append(self.labels[ii] if 0 <= ii < len(self.labels) else str(ii))
                        # 整理结果
                        for label, conf in zip(label_names, confidences):
                            all_results['labels'].append(label)
                            all_results['confidences'].append(f"{conf * 100:.2f}%")

                # 保存带检测框的图片
                try:
                    result.save(filename=self.save_path)
                except Exception as draw_error:
                    # 字体缺失时至少保留检测框，避免整图回退成原图
                    print(f"绘制标签失败，降级为仅画框: {draw_error}")
                    fallback = result.plot(labels=False)
                    cv2.imwrite(self.save_path, fallback)

            if not has_detection:
                print("未检测到手语目标，但已保存图片")
                all_results['labels'] = '预测失败'

            return all_results

        except Exception as e:
            print(f"预测异常: {e}")
            self._save_original_image()
            all_results['labels'] = '预测失败'  # 与main.py逻辑匹配
            return all_results

    def _save_original_image(self):
        """保存原始图片（无检测结果时）"""
        os.makedirs(os.path.dirname(self.save_path), exist_ok=True)
        img = cv2.imread(self.img_path)
        if img is not None:
            cv2.imwrite(self.save_path, img)
            print(f"原始图片保存至: {self.save_path}")
        else:
            print("无法读取原始图片")

# 关键：添加别名，适配main.py中的 ImagePredictor 调用
ImagePredictor = SignLanguagePredictor


def resolve_label_names(weights_value: str):
    """
    修复版：只要名字里包含 "英文" → 返回A-Z，否则返回中文
    不管路径多复杂，永远稳定识别
    """
    name = str(weights_value).lower()

    # 核心：只要包含 "英文" 就返回字母A-Z
    if "英文" in weights_value:
        return [chr(ord("A") + i) for i in range(26)]

    # 否则 一律返回中文手语
    return [
        '时间/时候', '你/您/你的/这', '早上', '9', '0', '快乐/高兴', '新', '祝', '请', '路',
        '生日', '平', '安', '朋友', '8', '认识', '名片', '结婚/妻子', '茶', '有',
        '花', '今天', '门', '停', '谢谢', '慢', '走', '晚', '我', '爱',
        '好', '人', '什么', '名字', '介绍'
    ]
if __name__ == '__main__':
    predictor = SignLanguagePredictor(
        weights_path="../runs/train/sign_language2/weights/best.pt",
        img_path="../test_sign.jpg",
        save_path="../runs/result_sign.jpg",
        conf=0.5
    )

    # 执行预测
    result = predictor.predict()
    # 打印结果（确保中文正常显示）
    print(f"检测到的手语标签: {json.dumps(result['labels'], ensure_ascii=False)}")
    print(f"对应置信度: {json.dumps(result['confidences'], ensure_ascii=False)}")
    print(f"检测用时: {result['allTime']}")
    print(f"结果图片保存至: {predictor.save_path}")