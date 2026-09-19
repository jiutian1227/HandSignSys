<template>
	<div class="ai-predict-container">
		<div class="ai-predict-content">
			<!-- 顶部控制面板 -->
			<div class="control-panel">
				<div class="panel-card model-selector">
					<div class="panel-label">AI模型选择</div>
					<el-select v-model="weight" placeholder="选择检测模型" size="large" class="model-select">
						<el-option v-for="item in state.weight_items" :key="item.value" :label="item.label"
							:value="item.value" />
					</el-select>
				</div>

				<div class="panel-card confidence-control">
					<div class="panel-label">检测灵敏度</div>
					<div class="confidence-slider">
						<span class="confidence-value">{{ (conf/100).toFixed(2) }}</span>
						<el-slider v-model="conf" :format-tooltip="formatTooltip" class="slider-custom" />
					</div>
				</div>

				<div class="panel-card action-buttons">
					<el-button type="primary" @click="start" class="action-btn record-btn">
						<span class="btn-icon">▶</span>
						开始检测
					</el-button>
					<el-button type="danger" @click="stop" class="action-btn stop-btn">
						<span class="btn-icon">⏹</span>
						停止检测
					</el-button>
				</div>

			</div>

			<!-- 浏览器采集（不展示）；画布用于截帧 -->
			<video ref="videoRef" class="hidden-capture" playsinline muted></video>
			<canvas ref="canvasRef" class="hidden-capture" width="640" height="480"></canvas>

			<!-- 视频展示区域：显示后端返回的标注图 -->
			<div class="video-display" ref="cardsContainer">
				<div class="video-container" v-if="state.cameraisShow">
					<img v-if="state.resultFrameSrc" class="video-stream" :src="state.resultFrameSrc" alt="实时检测画面">
					<div v-else class="video-waiting">
						<span>摄像头已开启，正在等待首帧识别…</span>
					</div>
					<div class="video-overlay">
						<div class="status-indicator">
							<div class="pulse-dot"></div>
							<span>实时检测中（浏览器采集 → 服务器推理）</span>
						</div>
					</div>
				</div>
				<div class="video-placeholder" v-else>
					<div class="placeholder-content">
						<div class="camera-icon">📷</div>
						<h3>等待开始检测</h3>
						<p>请选择模型并设置参数后启动实时检测</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';
import { formatDate } from '/@/utils/formatTime';
import { loadModelWeights } from '/@/utils/modelWeights';

const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

const conf = ref(50);
const weight = ref('');

const state = reactive({
	weight_items: [] as any,
	resultFrameSrc: '',
	cameraisShow: false,
});

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);

/** 约 5fps，减轻服务器压力；可按需调小间隔 */
// 降低逐帧请求频率，避免后端压力过大
const FRAME_INTERVAL_MS = 600;
let mediaStream: MediaStream | null = null;
let captureTimer: ReturnType<typeof setInterval> | null = null;
let sending = false;
let frameErrorCount = 0;
let framePauseUntil = 0;
/** 单次「开始检测」会话：用于服务端拼 AVI 并入库 cameraRecords */
let recordSessionId = '';
let sessionMeta = {
	startTime: '',
	username: '',
	weight: '',
	confStr: '',
};

const formatTooltip = (val: number) => {
	return val / 100;
};

const unwrapPredictFrame = (res: any) => {
	if (res && typeof res.outFrame === 'string') return res;
	if (res?.code === '200' && res.data != null) {
		return typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
	}
	throw new Error(res?.msg || res?.message || '识别失败');
};

const unwrapFinalize = (res: any) => {
	if (res && typeof res.saved === 'boolean') return res;
	if (res?.code === '200' && res.data != null) {
		return typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
	}
	throw new Error(res?.msg || res?.message || '保存失败');
};

const getData = () => {
	loadModelWeights().then(({ items, blocked }) => {
		if (items.length) {
			state.weight_items = items;
			return;
		}
		if (blocked) ElMessage.warning('模型服务冷却中，请稍后再试');
		else ElMessage.error('加载模型列表失败（后端 /flask/file_names 500）');
	});
};

const stopMedia = () => {
	if (captureTimer != null) {
		clearInterval(captureTimer);
		captureTimer = null;
	}
	if (mediaStream) {
		mediaStream.getTracks().forEach((t) => t.stop());
		mediaStream = null;
	}
	if (videoRef.value) {
		videoRef.value.srcObject = null;
	}
};

const sendOneFrame = async () => {
	if (!state.cameraisShow || sending) return;
	if (Date.now() < framePauseUntil) return;
	const v = videoRef.value;
	const c = canvasRef.value;
	if (!v || !c || v.readyState < 2) return;

	sending = true;
	try {
		const ctx = c.getContext('2d');
		if (!ctx) return;
		ctx.drawImage(v, 0, 0, 640, 480);
		const dataUrl = c.toDataURL('image/jpeg', 0.72);
		const res = await request.post('/flask/predictFrame', {
			weight: weight.value,
			conf: (parseFloat(String(conf.value)) || 0) / 100,
			frame: dataUrl,
			recordSessionId: recordSessionId || undefined,
		});
		const inner = unwrapPredictFrame(res);
		if (inner.status !== 200) {
			throw new Error(inner.message || '识别失败');
		}
		state.resultFrameSrc = `data:image/jpeg;base64,${inner.outFrame}`;
		frameErrorCount = 0;
		framePauseUntil = 0;
	} catch (e) {
		frameErrorCount += 1;
		// 连续失败时短暂熔断，避免短时间内持续冲击后端
		if (frameErrorCount >= 3) {
			framePauseUntil = Date.now() + Math.min(5000, frameErrorCount * 500);
		}
		if (frameErrorCount === 1 || frameErrorCount % 15 === 0) {
			ElMessage.error(e instanceof Error ? e.message : '识别请求失败');
		}
	} finally {
		sending = false;
	}
};

const start = async () => {
	if (state.cameraisShow) return;
	if (!weight.value) {
		ElMessage.warning('请先选择模型');
		return;
	}
	if (!navigator.mediaDevices?.getUserMedia) {
		ElMessage.error('当前浏览器不支持摄像头采集');
		return;
	}

	try {
		mediaStream = await navigator.mediaDevices.getUserMedia({
			video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
			audio: false,
		});
	} catch {
		ElMessage.error('无法打开摄像头，请检查权限或设备');
		return;
	}

	const v = videoRef.value;
	if (!v) {
		stopMedia();
		return;
	}
	v.srcObject = mediaStream;
	try {
		await v.play();
	} catch {
		ElMessage.error('无法播放摄像头画面');
		stopMedia();
		return;
	}

	state.resultFrameSrc = '';
	recordSessionId =
		typeof crypto !== 'undefined' && crypto.randomUUID
			? crypto.randomUUID()
			: `sess-${Date.now()}-${Math.random().toString(16).slice(2)}`;
	sessionMeta = {
		startTime: formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS'),
		username: userInfos.value.userName || '',
		weight: weight.value,
		confStr: String((parseFloat(String(conf.value)) || 0) / 100),
	};
	state.cameraisShow = true;
	captureTimer = setInterval(sendOneFrame, FRAME_INTERVAL_MS);
};

const stop = async () => {
	if (!state.cameraisShow) return;
	state.cameraisShow = false;
	state.resultFrameSrc = '';
	stopMedia();
	frameErrorCount = 0;
	framePauseUntil = 0;

	const sid = recordSessionId;
	const meta = { ...sessionMeta };
	recordSessionId = '';
	sessionMeta = { startTime: '', username: '', weight: '', confStr: '' };

	// 等待最后一帧请求结束，避免与服务端收尾竞态
	for (let i = 0; i < 80 && sending; i += 1) {
		await new Promise((r) => setTimeout(r, 50));
	}

	if (!sid) return;

	try {
		const res = await request.post('/flask/finalizeCameraSession', {
			sessionId: sid,
			username: meta.username,
			startTime: meta.startTime,
			weight: meta.weight,
			conf: meta.confStr,
		});
		const fin = unwrapFinalize(res);
		if (fin.saved) {
			ElMessage.success('检测录像已上传并写入记录');
		} else if (fin.message) {
			ElMessage.info(String(fin.message));
		}
	} catch (e) {
		ElMessage.error(e instanceof Error ? e.message : '结束会话/保存记录失败');
	}
};

onMounted(() => {
	getData();
});

onUnmounted(() => {
	stop();
});
</script>

<style scoped lang="scss">
.ai-predict-container {
	width: 100%;
	height: 100%;
	background: transparent;
	padding: 20px;
	box-sizing: border-box;
}

.ai-predict-content {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.control-panel {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 16px;
	padding: 20px;
	background: var(--app-card-glass);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	border: 1px solid var(--app-glass-border);
	border-radius: 18px;
	box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.panel-card {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
	background: #ffffff;
	border-radius: 16px;
	border: 1px solid #e4e7ed;
}

.panel-label {
	font-size: 15px;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 4px;
	letter-spacing: 0.02em;
}

.model-select {
	width: 100%;

	:deep(.el-input__wrapper) {
		--el-input-text-color: #0f172a;
	}

	:deep(.el-select__placeholder) {
		color: #64748b;
	}

	:deep(.el-select__selected-item) {
		color: #0f172a;
		font-weight: 600;
	}
}

.confidence-slider {
	display: flex;
	align-items: center;
	gap: 12px;
}

.confidence-value {
	font-size: 15px;
	font-weight: 700;
	color: #0369a1;
	min-width: 44px;
}

.slider-custom {
	flex: 1;

	:deep(.el-slider__button) {
		border-color: #0369a1;
	}
}

.action-buttons {
	flex-direction: row;
	justify-content: space-between;
	gap: 12px;
}

.action-btn {
	flex: 1;
	height: 44px;
	border-radius: 10px;
	font-weight: 600;
	transition: all 0.3s ease;
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	
	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
}

.record-btn {
	background: linear-gradient(135deg, #00d4ff 0%, #6366f1 100%);
	border: none;
}

.stop-btn {
	background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
	border: none;
}

.btn-icon {
	font-size: 16px;
}

.hidden-capture {
	position: fixed;
	left: -9999px;
	top: 0;
	width: 640px;
	height: 480px;
	opacity: 0;
	pointer-events: none;
}

.video-display {
	flex: 1;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
	background: #000;
}

.video-container {
	position: relative;
	width: 100%;
	height: 100%;
}

.video-stream {
	width: 100%;
	height: 100%;
	object-fit: contain;
}

.video-waiting {
	width: 100%;
	height: 100%;
	min-height: 280px;
	display: flex;
	align-items: center;
	justify-content: center;
	color: #94a3b8;
	font-size: 15px;
	background: #0f172a;
}

.video-overlay {
	position: absolute;
	top: 20px;
	right: 20px;
}

.status-indicator {
	display: flex;
	align-items: center;
	gap: 8px;
	padding: 8px 16px;
	background: rgba(0, 0, 0, 0.7);
	border-radius: 20px;
	color: white;
	font-size: 14px;
	font-weight: 500;
}

.pulse-dot {
	width: 8px;
	height: 8px;
	background: #10b981;
	border-radius: 50%;
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% { opacity: 1; }
	50% { opacity: 0.5; }
	100% { opacity: 1; }
}

.video-placeholder {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
	isolation: isolate;
	background:
		radial-gradient(circle at 20% 18%, rgba(56, 189, 248, 0.24) 0%, rgba(56, 189, 248, 0) 40%),
		radial-gradient(circle at 82% 84%, rgba(129, 140, 248, 0.26) 0%, rgba(129, 140, 248, 0) 46%),
		linear-gradient(135deg, #0f172a 0%, #1e293b 56%, #334155 100%);
}

.video-placeholder::before {
	content: '';
	position: absolute;
	inset: 0;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.16'%3E%3Cpath d='M0 36h180M0 72h180M0 108h180M0 144h180M36 0v180M72 0v180M108 0v180M144 0v180'/%3E%3C/g%3E%3C/svg%3E");
	background-size: 180px 180px;
	mix-blend-mode: soft-light;
	opacity: 0.5;
	z-index: 0;
}

.placeholder-content {
	text-align: center;
	color: #f8fafc;
	position: relative;
	z-index: 1;
	padding: 24px 28px;
	border-radius: 18px;
	background: rgba(15, 23, 42, 0.5);
	backdrop-filter: blur(6px);
	-webkit-backdrop-filter: blur(6px);
	border: 1px solid rgba(148, 163, 184, 0.35);
	box-shadow: 0 12px 28px rgba(2, 6, 23, 0.28);
}

.camera-icon {
	font-size: 64px;
	margin-bottom: 16px;
	opacity: 0.95;
	filter: drop-shadow(0 5px 12px rgba(56, 189, 248, 0.35));
}

.placeholder-content h3 {
	font-size: 24px;
	font-weight: 600;
	margin-bottom: 8px;
	color: #f8fafc;
	letter-spacing: 0.02em;
}

.placeholder-content p {
	font-size: 14px;
	color: rgba(226, 232, 240, 0.92);
}
</style>