<template>
	<div class="ai-predict-container">
		<div class="ai-predict-content">
			<div class="page-hero">
				<div class="hero-title-wrap">
					<div class="hero-badge">VIDEO AI</div>
					<h2 class="hero-title">视频检测</h2>
				</div>
				<p class="hero-desc">上传视频后进行手势识别，实时查看处理结果与进度</p>
			</div>

			<div class="control-panel">
				<div class="panel-card model-selector">
					<div class="panel-label">AI模型选择</div>
					<el-select v-model="weight" placeholder="选择检测模型" size="large" class="model-select">
						<el-option v-for="item in state.weight_items" :key="item.value" :label="item.label" :value="item.value" />
					</el-select>
				</div>

				<div class="panel-card confidence-control">
					<div class="panel-label">检测灵敏度</div>
					<div class="confidence-slider">
						<span class="confidence-value">{{ (conf / 100).toFixed(2) }}</span>
						<el-slider v-model="conf" :format-tooltip="formatTooltip" class="slider-custom" />
					</div>
				</div>

				<div class="panel-card action-buttons">
					<el-upload
						v-model="state.form.inputVideo"
						ref="uploadFile"
						class="video-upload"
						action="http://47.108.20.251:9999/files/upload"
						:show-file-list="false"
						:on-success="handleAvatarSuccessone"
					>
						<el-button type="primary" class="action-btn upload-btn">
							<span class="btn-icon">⤴</span>
							上传视频
						</el-button>
					</el-upload>
					<el-button type="success" @click="upData" class="action-btn process-btn">
						<span class="btn-icon">▶</span>
						开始检测
					</el-button>
					<div class="action-tip">建议先选择模型，再上传视频并开始检测</div>
				</div>
			</div>

			<div class="progress-section" v-if="state.isShow">
				<div class="progress-info">
					<span class="progress-text">{{ state.type_text }}中...</span>
					<span class="progress-percent">{{ state.percentage }}%</span>
				</div>
				<el-progress :text-inside="true" :stroke-width="16" :percentage="state.percentage" :stroke-color="progressColor" class="custom-progress" />
			</div>

			<div class="video-display" ref="cardsContainer">
				<div class="video-container" v-if="state.video_path">
					<img class="result-video" :src="state.video_path" alt="分析结果" />
					<div class="video-overlay">
						<div class="status-indicator">
							<div class="pulse-dot"></div>
							<span>视频检测结果预览</span>
						</div>
					</div>
				</div>
				<div class="video-placeholder" v-else>
					<div class="placeholder-content">
						<div class="camera-icon">📹</div>
						<h3>等待上传视频</h3>
						<p>请先上传视频文件，再点击开始检测</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';
import type { UploadInstance, UploadProps } from 'element-plus';
import { SocketService } from '/@/utils/socket';
import { formatDate } from '/@/utils/formatTime';

const uploadFile = ref<UploadInstance>();
const stores = useUserInfo();
const conf = ref(50);
const weight = ref('');
const { userInfos } = storeToRefs(stores);

const handleAvatarSuccessone: UploadProps['onSuccess'] = (response, uploadFile) => {
	ElMessage.success('视频上传成功！');
	state.form.inputVideo = response.data;
};

const state = reactive({
	weight_items: [] as any,
	data: {} as any,
	video_path: '',
	type_text: "正在保存",
	percentage: 50,
	isShow: false,
	form: {
		username: '',
		inputVideo: null as any,
		weight: '',
		conf: null as any,
		startTime: ''
	},
});

const progressColor = computed(() => {
	if (state.percentage < 30) return '#e6a23c';
	if (state.percentage < 70) return '#409eff';
	return '#67c23a';
});

const socketService = new SocketService();

socketService.on('message', (data) => {
	console.log('Received message:', data);
	ElMessage.success(data);
});

const formatTooltip = (val: number) => {
	return val / 100
}

socketService.on('progress', (data) => {
	state.percentage = parseInt(data);
	if (parseInt(data) < 100) {
		state.isShow = true;
	} else {
		ElMessage.success("处理完成！");
		setTimeout(() => {
			state.isShow = false;
			state.percentage = 0;
		}, 2000);
	}
	console.log('Received message:', data);
});

const getData = () => {
	request.get('/api/flask/file_names').then((res) => {
		if (res.code === '200') {
			res.data = JSON.parse(res.data);
			console.log(res.data);
			state.weight_items = res.data.weight_items;
		} else {
			ElMessage.error(res.msg);
		}
	});
};

const upData = () => {
	state.form.weight = weight.value;
	state.form.conf = parseFloat(String(conf.value)) / 100;
	state.form.username = userInfos.value.userName;
	state.form.startTime = formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');
	console.log(state.form);
	const queryParams = new URLSearchParams(state.form).toString();
	state.video_path = `http://47.108.20.251:5000/predictVideo?${queryParams}`;
	ElMessage.success('开始处理视频...');
};

onMounted(() => {
	getData();
});
</script>

<style scoped lang="scss">
.ai-predict-container {
	width: 100%;
	height: 100%;
	background: transparent;
	padding: 18px;
	box-sizing: border-box;
}

.ai-predict-content {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.page-hero {
	padding: 18px 22px;
	border-radius: 18px;
	background:
		radial-gradient(circle at 10% 20%, rgba(56, 189, 248, 0.28), transparent 42%),
		radial-gradient(circle at 90% 30%, rgba(99, 102, 241, 0.26), transparent 45%),
		linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.92) 100%);
	border: 1px solid rgba(148, 163, 184, 0.35);
	box-shadow: 0 10px 26px rgba(2, 6, 23, 0.22);
}

.hero-title-wrap {
	display: flex;
	align-items: center;
	gap: 12px;
}

.hero-badge {
	font-size: 12px;
	font-weight: 700;
	letter-spacing: 0.08em;
	color: #e0f2fe;
	padding: 4px 10px;
	border-radius: 999px;
	background: rgba(14, 165, 233, 0.22);
	border: 1px solid rgba(125, 211, 252, 0.45);
}

.hero-title {
	margin: 0;
	font-size: 24px;
	color: #f8fafc;
	font-weight: 700;
}

.hero-desc {
	margin: 8px 0 0;
	font-size: 14px;
	color: rgba(226, 232, 240, 0.92);
}

.control-panel {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 16px;
	padding: 18px;
	background: var(--app-card-glass);
	backdrop-filter: blur(12px);
	-webkit-backdrop-filter: blur(12px);
	border: 1px solid var(--app-glass-border);
	border-radius: 18px;
	box-shadow: 0 10px 26px rgba(15, 23, 42, 0.08);
}

.panel-card {
	display: flex;
	flex-direction: column;
	gap: 12px;
	padding: 16px;
	background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
	border-radius: 16px;
	border: 1px solid #e4e7ed;
	transition: transform 0.25s ease, box-shadow 0.25s ease;

	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 10px 18px rgba(15, 23, 42, 0.08);
	}
}

.panel-label {
	font-size: 15px;
	font-weight: 700;
	color: #0f172a;
	margin-bottom: 4px;
	letter-spacing: 0.02em;
	display: flex;
	align-items: center;
	gap: 8px;
}

.panel-label::before {
	content: '';
	width: 6px;
	height: 16px;
	border-radius: 999px;
	background: linear-gradient(180deg, #0ea5e9 0%, #6366f1 100%);
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
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	gap: 16px;
	flex-wrap: wrap;
}

.video-upload {
	flex: 1;
}

.action-btn {
	width: 100%;
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
		box-shadow: 0 8px 18px rgba(15, 23, 42, 0.22);
	}
}

.upload-btn {
	background: linear-gradient(135deg, #00d4ff 0%, #6366f1 100%);
	border: none;
}

.process-btn {
	flex: 1;
	background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
	border: none;
}

.action-tip {
	width: 100%;
	font-size: 12px;
	color: #64748b;
	line-height: 1.4;
	padding-top: 2px;
}

.btn-icon {
	font-size: 16px;
}

.progress-section {
	padding: 16px 20px;
	background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
	border-radius: 14px;
	border: 1px solid #e4e7ed;
	box-shadow: 0 8px 18px rgba(15, 23, 42, 0.06);

	.progress-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}
}

.progress-text {
	font-size: 14px;
	color: #64748b;
}

.progress-percent {
	font-size: 14px;
	font-weight: 700;
	color: #0369a1;
}

.custom-progress {
	width: 100%;

	:deep(.el-progress-bar__outer) {
		background: #e2e8f0;
	}

	:deep(.el-progress-bar__inner) {
		background-image: linear-gradient(90deg, #0ea5e9 0%, #6366f1 55%, #10b981 100%);
	}
}

.video-display {
	flex: 1;
	width: 100%;
	margin: 0;
	border-radius: 16px;
	overflow: hidden;
	box-shadow: 0 16px 36px rgba(2, 6, 23, 0.16);
	background: #000;
	border: 1px solid rgba(148, 163, 184, 0.38);
}

.video-container {
	position: relative;
	width: 100%;
	height: 100%;
	min-height: 320px;
	max-height: 620px;
	display: flex;
	align-items: center;
	justify-content: center;
	background:
		radial-gradient(circle at 18% 18%, rgba(56, 189, 248, 0.2) 0%, rgba(56, 189, 248, 0) 40%),
		radial-gradient(circle at 82% 82%, rgba(129, 140, 248, 0.18) 0%, rgba(129, 140, 248, 0) 46%),
		#0f172a;
}

.result-video {
	width: 100%;
	height: 100%;
	object-fit: contain;
	object-position: center center;
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
	background: rgba(2, 6, 23, 0.72);
	border-radius: 20px;
	color: white;
	font-size: 14px;
	font-weight: 500;
	border: 1px solid rgba(148, 163, 184, 0.35);
	backdrop-filter: blur(4px);
	-webkit-backdrop-filter: blur(4px);
}

.pulse-dot {
	width: 8px;
	height: 8px;
	background: #10b981;
	border-radius: 50%;
	animation: pulse 2s infinite;
}

@keyframes pulse {
	0% {
		opacity: 1;
	}
	50% {
		opacity: 0.5;
	}
	100% {
		opacity: 1;
	}
}

.video-placeholder {
	width: 100%;
	height: 100%;
	min-height: 320px;
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

@media (max-width: 768px) {
	.ai-predict-container {
		padding: 12px;
	}

	.video-container,
	.video-placeholder {
		min-height: 260px;
		max-height: 460px;
	}

	.action-buttons {
		flex-direction: column;
	}

	.hero-title {
		font-size: 20px;
	}
}
</style>