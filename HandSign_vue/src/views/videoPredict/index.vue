<template>
	<div class="predict-container">
		<div class="predict-content">
			<div class="control-panel">
				<div class="panel-header">
					<h3 class="panel-title">视频分析控制台</h3>
					<div class="panel-subtitle">配置参数并开始处理</div>
				</div>

				<div class="control-group">
					<div class="control-item">
						<label class="control-label">模型选择</label>
						<el-select v-model="weight" placeholder="选择分析模型" size="large" class="model-select">
							<el-option v-for="item in state.weight_items" :key="item.value" :label="item.label" :value="item.value" />
						</el-select>
					</div>

					<div class="control-item">
						<label class="control-label">置信度阈值</label>
						<div class="confidence-control">
							<span class="confidence-value">{{ (conf / 100).toFixed(2) }}</span>
							<el-slider v-model="conf" :format-tooltip="formatTooltip" class="confidence-slider" />
						</div>
					</div>
				</div>

				<div class="action-group">
					<el-upload
						ref="uploadFile"
						class="video-upload"
						:action="SPRING_FILES_UPLOAD"
						:show-file-list="false"
						:limit="1"
						accept=".mp4,.avi,.mov,.mkv,.webm"
						:before-upload="beforeVideoUpload"
						:on-exceed="handleUploadExceed"
						:on-error="handleUploadError"
						:on-success="handleAvatarSuccessone"
					>
						<el-button type="primary" class="upload-btn">
							<i class="upload-icon"></i>
							上传视频文件
						</el-button>
					</el-upload>

					<el-button type="success" @click="upData" class="process-btn" :loading="state.isAnalyzing" :disabled="state.isAnalyzing">
						<i class="process-icon"></i>
						开始分析处理
					</el-button>
				</div>

				<div class="progress-section" v-if="state.isShow">
					<div class="progress-info">
						<span class="progress-text">{{ state.type_text }}中...</span>
						<span class="progress-percent">{{ state.percentage }}%</span>
					</div>
					<el-progress :text-inside="true" :stroke-width="16" :percentage="state.percentage" :stroke-color="progressColor" class="custom-progress" />
				</div>
			</div>

			<div class="preview-section" ref="cardsContainer">
				<div class="preview-header">
					<h4>分析结果预览</h4>
					<div class="preview-tips">左侧原始视频，右侧检测结果</div>
				</div>
				<div class="dual-video-grid">
					<div class="video-container">
						<div class="video-title">原始视频</div>
						<video v-if="originalVideoPreview" class="result-video" controls preload="metadata">
							<source :src="originalVideoPreview" type="video/mp4" />
						</video>
						<div v-else class="empty-preview">
							<div class="empty-icon">📹</div>
							<div class="empty-text">请先上传原始视频</div>
						</div>
					</div>
					<div class="video-container">
						<div class="video-title">检测结果视频</div>
						<video v-if="resultVideoPreview" class="result-video" controls preload="metadata">
							<source :src="resultVideoPreview" type="video/mp4" />
						</video>
						<img
							v-else-if="state.video_path"
							class="result-video"
							:key="state.video_path"
							:src="state.video_path"
							@load="onAnalysisResultReady"
							@error="onAnalysisResultError"
						/>
						<div v-else class="empty-preview">
							<div class="empty-icon">📹</div>
							<div class="empty-text">等待视频处理结果</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';
import type { UploadInstance, UploadProps, UploadRawFile } from 'element-plus';
import { SocketService } from '/@/utils/socket';
import { formatDate } from '/@/utils/formatTime';
import { loadModelWeights } from '/@/utils/modelWeights';
import { SPRING_FILES_UPLOAD, resolveFileUrl } from '/@/utils/resolveFileUrl';

const uploadFile = ref<UploadInstance>();
const stores = useUserInfo();
const conf = ref(60);
const weight = ref('');
const { userInfos } = storeToRefs(stores);
const FLASK_ORIGIN = ((import.meta.env.VITE_FLASK_ORIGIN as string) || 'https://flask.fanzengxie.icu').replace(/\/+$/, '');
const USE_DEV_PROXY = import.meta.env.DEV && String(import.meta.env.VITE_USE_DEV_PROXY || '').toLowerCase() === 'true';

const extractUploadedPath = (response: any): string => {
	return response?.data?.path || response?.data?.url || response?.data || response?.path || response?.url || '';
};

const handleAvatarSuccessone: UploadProps['onSuccess'] = (response) => {
	const r = response as any;
	const uploadedPath = extractUploadedPath(r);
	if (!uploadedPath || typeof uploadedPath !== 'string') {
		state.form.inputVideo = null;
		ElMessage.error('上传返回异常，请重试');
		return;
	}
	state.form.inputVideo = uploadedPath;
	ElMessage.success('视频上传成功！');
};

const beforeVideoUpload: UploadProps['beforeUpload'] = (rawFile: UploadRawFile) => {
	const allowed = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm', 'video/x-matroska'];
	const ext = rawFile.name.split('.').pop()?.toLowerCase() || '';
	const extAllowed = ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext);
	if (!(allowed.includes(rawFile.type) || extAllowed)) {
		ElMessage.warning('仅支持 mp4/mov/avi/webm/mkv 格式');
		return false;
	}
	const maxSizeMB = 200;
	const isSizeOk = rawFile.size / 1024 / 1024 <= maxSizeMB;
	if (!isSizeOk) {
		ElMessage.warning(`视频不能超过 ${maxSizeMB}MB`);
		return false;
	}
	return true;
};

const handleUploadExceed = () => {
	ElMessage.warning('一次仅允许上传 1 个视频，请先等待当前上传完成');
};

const handleUploadError: UploadProps['onError'] = () => {
	state.form.inputVideo = null;
	ElMessage.error('视频上传失败，请检查文件大小或稍后重试');
};

const state = reactive({
	weight_items: [] as any,
	data: {} as any,
	video_path: '',
	outputVideoPath: '',
	type_text: '正在保存',
	percentage: 50,
	isShow: false,
	isAnalyzing: false,
	isRecordSaved: false,
	form: {
		username: '',
		inputVideo: null as any,
		weight: '',
		conf: null as any,
		startTime: '',
	},
});

const progressColor = computed(() => {
	if (state.percentage < 30) return '#e6a23c';
	if (state.percentage < 70) return '#409eff';
	return '#67c23a';
});

const originalVideoPreview = computed(() => resolveFileUrl(state.form.inputVideo));
const resultVideoPreview = computed(() => resolveFileUrl(state.outputVideoPath));

let socketService: SocketService | null = null;
let isPageAlive = true;
let progressResetTimer: ReturnType<typeof setTimeout> | null = null;

const disconnectSocket = () => {
	if (!socketService) return;
	try {
		socketService.disconnect();
	} finally {
		socketService = null;
	}
};

const safeSuccessMessage = (data: unknown, payload?: any) => {
	let text = '';
	if (payload?.msg && typeof payload.msg === 'string') text = payload.msg;
	else if (payload?.message && typeof payload.message === 'string') text = payload.message;
	else if (typeof data === 'string') text = data;
	else if (typeof data === 'number') text = String(data);
	if (!text.trim()) text = '任务状态已更新';
	ElMessage.success(text);
};

const tryParseMessageAsJson = (data: unknown): any | null => {
	if (typeof data !== 'string') return null;
	try {
		return JSON.parse(data);
	} catch {
		return null;
	}
};

const tryExtractPathFromMessage = (data: unknown): string => {
	if (typeof data !== 'string') return '';
	// 兼容后端仅返回纯文本路径的场景
	const m = data.match(/(\/files\/[^\s"']+\.(mp4|avi|mov|mkv|webm))/i);
	return m?.[1] || '';
};

// 写库前统一清洗路径：去域名、去 query，避免字段过长/格式异常导致后端 500
const sanitizeRecordPath = (v: unknown) => {
	const s = String(v ?? '').trim();
	if (!s) return '';
	return s;
};

const truncate = (v: string, max = 255) => (v.length > max ? v.slice(0, max) : v);

const persistVideoRecord = async () => {
	if (state.isRecordSaved) return;
	// 防止同一任务多次触发落库
	if ((persistVideoRecord as any).inFlight) return;
	if (!state.form.inputVideo || !state.form.username || !state.form.startTime) return;
	try {
		(persistVideoRecord as any).inFlight = true;
		// 按参考实现：优先用后端 outVideo，拿不到时用 predictVideo 直连URL
		const outVideo = sanitizeRecordPath(state.outputVideoPath) || sanitizeRecordPath(state.video_path);
		if (!outVideo) {
			ElMessage.warning('视频已处理，但结果路径为空，暂无法写入记录');
			return;
		}
		const inputVideo = sanitizeRecordPath(state.form.inputVideo);
		if (!inputVideo) {
			ElMessage.warning('视频已处理，但输入视频路径无效，暂无法写入记录');
			return;
		}
		const res: any = await request.post('/api/videoRecords', {
			username: truncate(String(state.form.username || '').trim(), 64),
			inputVideo: truncate(inputVideo),
			outVideo: truncate(outVideo),
			weight: truncate(String(state.form.weight || '').trim(), 120),
			conf: String(state.form.conf ?? ''),
			startTime: state.form.startTime,
		});
		if (res?.code === '200' || res?.code === 200 || res?.code === 0 || res?.code === '0' || res?.success === true) {
			state.isRecordSaved = true;
		} else {
			ElMessage.warning(res?.msg || '视频已处理，但记录未写入数据库');
		}
	} catch (e: any) {
		const serverMsg = e?.response?.data?.msg || e?.response?.data?.message || e?.message || '保存视频检测记录失败';
		ElMessage.warning(serverMsg);
	} finally {
		(persistVideoRecord as any).inFlight = false;
	}
};

let analyzingSafetyTimer: ReturnType<typeof setTimeout> | null = null;

const clearAnalyzingSafetyTimer = () => {
	if (analyzingSafetyTimer != null) {
		clearTimeout(analyzingSafetyTimer);
		analyzingSafetyTimer = null;
	}
};

/** 结果视频首帧可解码即视为处理完成（不依赖 WebSocket progress=100，避免按钮一直转圈） */
const finishAnalysisUi = (from: 'socket' | 'video' | 'timeout') => {
	if (!state.isAnalyzing) return;
	state.isAnalyzing = false;
	state.isShow = false;
	if (from !== 'socket') {
		state.percentage = 100;
	}
	clearAnalyzingSafetyTimer();
	// timeout 场景通常 outVideo 尚未生成；避免无效/失败的 POST
	if (from !== 'timeout') void persistVideoRecord();
	if (from === 'video') {
		ElMessage.success('分析结果已就绪');
	}
	// 注意：video 首帧就绪不代表后端已推送 outVideo 路径；
	// 若此时断开 socket，可能导致后续无法写入记录。
	if (from === 'timeout') disconnectSocket();
};

const onAnalysisResultReady = () => {
	if (!state.isAnalyzing) return;
	finishAnalysisUi('video');
};

const onAnalysisResultError = () => {
	if (!state.isAnalyzing) return;
	state.isAnalyzing = false;
	state.isShow = false;
	clearAnalyzingSafetyTimer();
	ElMessage.error('结果视频加载失败，请检查后端或网络');
};

const bindSocketListeners = () => {
	if (socketService) return;
	socketService = new SocketService();
	socketService.on('message', (data) => {
		if (!isPageAlive) return;
		const payload = tryParseMessageAsJson(data);
		if (payload?.outVideo && typeof payload.outVideo === 'string') {
			state.outputVideoPath = payload.outVideo;
		}
		if (payload?.video_path && typeof payload.video_path === 'string') {
			state.outputVideoPath = payload.video_path;
		}
		if (!state.outputVideoPath) {
			const txtPath = tryExtractPathFromMessage(data);
			if (txtPath) state.outputVideoPath = txtPath;
		}
		if (payload?.status === 200 || payload?.done === true) {
			void persistVideoRecord();
		}
		safeSuccessMessage(data, payload);
	});

	socketService.on('progress', (data) => {
		if (!isPageAlive) return;
		const n = parseInt(String(data), 10);
		if (Number.isNaN(n)) return;
		state.percentage = n;
		if (n < 100) {
			state.isShow = true;
		} else {
			ElMessage.success('处理完成！');
			finishAnalysisUi('socket');
			disconnectSocket();
			if (progressResetTimer) clearTimeout(progressResetTimer);
			progressResetTimer = setTimeout(() => {
				if (!isPageAlive) return;
				state.isShow = false;
				state.percentage = 0;
			}, 2000);
		}
	});
};

const formatTooltip = (val: number) => {
	return val / 100;
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

const upData = () => {
	if (state.isAnalyzing) return;
	if (!state.form.inputVideo) {
		ElMessage.warning('请先上传视频文件');
		return;
	}
	if (!weight.value) {
		ElMessage.warning('请先选择模型');
		return;
	}
	state.form.weight = weight.value;
	state.form.conf = conf.value / 100;
	state.form.username = userInfos.value.userName;
	state.form.startTime = formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');
	state.isRecordSaved = false;
	state.outputVideoPath = '';
	// 只有真正开始检测时才建立 socket 连接，避免页面一打开就压垮后端
	bindSocketListeners();
	const queryParams = new URLSearchParams(state.form).toString();
	state.video_path = USE_DEV_PROXY ? `/flask/predictVideo?${queryParams}` : `${FLASK_ORIGIN}/predictVideo?${queryParams}`;
	state.isAnalyzing = true;
	clearAnalyzingSafetyTimer();
	// WebSocket 异常时可能永远收不到 progress=100，用超时兜底结束加载态并尝试落库
	analyzingSafetyTimer = setTimeout(() => {
		if (state.isAnalyzing) {
			ElMessage.warning('长时间未收到进度推送，已自动结束加载状态；若画面已显示可忽略');
			finishAnalysisUi('timeout');
		}
	}, 15 * 60 * 1000);
	ElMessage.success('开始处理视频...');
};

onMounted(() => {
	getData();
});

onUnmounted(() => {
	isPageAlive = false;
	if (progressResetTimer) {
		clearTimeout(progressResetTimer);
		progressResetTimer = null;
	}
	clearAnalyzingSafetyTimer();
	disconnectSocket();
});
</script>

<style scoped lang="scss">
.predict-container {
	width: 100%;
	height: 100%;
	background: transparent;
	padding: 20px;
	box-sizing: border-box;
}

.predict-content {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.control-panel {
	position: relative;
	isolation: isolate;
	background:
		radial-gradient(circle at 18% 18%, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0) 38%),
		radial-gradient(circle at 82% 84%, rgba(129, 140, 248, 0.2) 0%, rgba(129, 140, 248, 0) 44%),
		linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.9) 56%, rgba(51, 65, 85, 0.9) 100%);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	border-radius: 18px;
	padding: 24px;
	box-shadow: 0 10px 28px rgba(2, 6, 23, 0.22);
	border: 1px solid rgba(148, 163, 184, 0.3);
}

.control-panel::before {
	content: '';
	position: absolute;
	inset: 0;
	border-radius: 18px;
	background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.14'%3E%3Cpath d='M0 36h180M0 72h180M0 108h180M0 144h180M36 0v180M72 0v180M108 0v180M144 0v180'/%3E%3C/g%3E%3C/svg%3E");
	background-size: 180px 180px;
	mix-blend-mode: soft-light;
	opacity: 0.4;
	z-index: 0;
	pointer-events: none;
}

.control-panel > * {
	position: relative;
	z-index: 1;
}

.panel-header {
	margin-bottom: 24px;

	.panel-title {
		font-size: 20px;
		font-weight: 600;
		color: #f8fafc;
		margin: 0 0 8px 0;
	}

	.panel-subtitle {
		font-size: 14px;
		color: rgba(203, 213, 225, 0.92);
	}
}

.control-group {
	display: flex;
	gap: 32px;
	margin-bottom: 24px;
	flex-wrap: wrap;
}

.control-item {
	display: flex;
	flex-direction: column;
	gap: 8px;
	min-width: 250px;

	.control-label {
		font-size: 14px;
		font-weight: 500;
		color: rgba(226, 232, 240, 0.95);
	}
}

.model-select {
	width: 100%;

	:deep(.el-input__wrapper) {
		background: rgba(15, 23, 42, 0.45);
		box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.28);
	}

	:deep(.el-input__inner),
	:deep(.el-select__selected-item) {
		color: #f8fafc;
	}

	:deep(.el-input__inner::placeholder),
	:deep(.el-select__placeholder) {
		color: rgba(203, 213, 225, 0.85);
	}

	:deep(.el-select__caret) {
		color: rgba(226, 232, 240, 0.9);
	}
}

.confidence-control {
	display: flex;
	align-items: center;
	gap: 16px;

	.confidence-value {
		font-size: 14px;
		font-weight: 500;
		color: #7dd3fc;
		min-width: 40px;
	}

	.confidence-slider {
		flex: 1;

		:deep(.el-slider__runway) {
			background: rgba(148, 163, 184, 0.35);
		}

		:deep(.el-slider__bar) {
			background: linear-gradient(90deg, #38bdf8 0%, #6366f1 100%);
		}

		:deep(.el-slider__button) {
			border-color: #7dd3fc;
		}
	}
}

.action-group {
	display: flex;
	gap: 16px;
	align-items: center;
	flex-wrap: wrap;
}

.video-upload {
	.upload-btn {
		background: linear-gradient(135deg, #00d4ff 0%, #3b82f6 100%);
		border: none;
		border-radius: 8px;
		padding: 12px 24px;
		font-weight: 500;

		.upload-icon {
			display: inline-block;
			width: 16px;
			height: 16px;
			background: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z'/%3E%3Cpolyline points='14,2 14,8 20,8'/%3E%3Cline x1='16' y1='13' x2='8' y2='13'/%3E%3Cline x1='16' y1='17' x2='8' y2='17'/%3E%3Cpolyline points='10,9 9,9 8,9'/%3E%3C/svg%3E")
				no-repeat center;
			margin-right: 8px;
		}
	}
}

.process-btn {
	background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%);
	border: none;
	border-radius: 8px;
	padding: 12px 24px;
	font-weight: 500;

	.process-icon {
		display: inline-block;
		width: 16px;
		height: 16px;
		background: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E")
			no-repeat center;
		margin-right: 8px;
	}
}

.progress-section {
	margin-top: 20px;
	padding-top: 20px;
	border-top: 1px solid rgba(148, 163, 184, 0.28);

	.progress-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}
}

.progress-text {
	font-size: 14px;
	color: rgba(226, 232, 240, 0.92);
}

.progress-percent {
	font-size: 14px;
	font-weight: 600;
	color: #7dd3fc;
}

.custom-progress {
	width: 100%;
}

.preview-section {
	background: white;
	border-radius: 12px;
	padding: 24px;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	border: 1px solid #e1e4e8;
	flex: 1;
	display: flex;
	flex-direction: column;
}

.preview-header {
	margin-bottom: 16px;

	h4 {
		font-size: 18px;
		font-weight: 600;
		color: #303133;
		margin: 0 0 4px 0;
	}

	.preview-tips {
		font-size: 14px;
		color: #909399;
	}
}

.dual-video-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 16px;
	flex: 1;
}

.video-container {
	flex: 1;
	border-radius: 8px;
	background:
		radial-gradient(circle at 18% 18%, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0) 40%),
		radial-gradient(circle at 82% 82%, rgba(129, 140, 248, 0.18) 0%, rgba(129, 140, 248, 0) 46%),
		#0f172a;
	border: 1px solid rgba(148, 163, 184, 0.35);
	display: flex;
	justify-content: center;
	align-items: center;
	overflow: hidden;
	position: relative;
	flex-direction: column;
	padding-top: 36px;
}

.video-title {
	position: absolute;
	top: 10px;
	left: 12px;
	font-size: 13px;
	font-weight: 600;
	color: rgba(226, 232, 240, 0.96);
	z-index: 2;
}

.result-video {
	max-width: 100%;
	max-height: 100%;
	object-fit: contain;
}

.empty-preview {
	text-align: center;
	color: #f8fafc;
	width: 100%;
	height: 100%;
	min-height: 260px;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	position: relative;
	isolation: isolate;
	background:
		radial-gradient(circle at 22% 20%, rgba(56, 189, 248, 0.24) 0%, rgba(56, 189, 248, 0) 42%),
		radial-gradient(circle at 78% 78%, rgba(129, 140, 248, 0.26) 0%, rgba(129, 140, 248, 0) 48%),
		linear-gradient(135deg, #0f172a 0%, #1e293b 58%, #334155 100%);

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.16'%3E%3Cpath d='M0 36h180M0 72h180M0 108h180M0 144h180M36 0v180M72 0v180M108 0v180M144 0v180'/%3E%3C/g%3E%3C/svg%3E");
		background-size: 180px 180px;
		mix-blend-mode: soft-light;
		opacity: 0.45;
		z-index: 0;
	}

	.empty-icon {
		font-size: 48px;
		margin-bottom: 16px;
		position: relative;
		z-index: 1;
		filter: drop-shadow(0 5px 12px rgba(56, 189, 248, 0.35));
	}

	.empty-text {
		font-size: 16px;
		color: rgba(226, 232, 240, 0.96);
		position: relative;
		z-index: 1;
	}
}

@media (max-width: 768px) {
	.control-group {
		flex-direction: column;
		gap: 20px;
	}

	.action-group {
		flex-direction: column;
		align-items: stretch;
	}

	.predict-container {
		padding: 12px;
	}

	.dual-video-grid {
		grid-template-columns: 1fr;
	}
}
</style>