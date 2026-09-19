<template>
	<div class="brain-detection-container" id="id" v-loading="state.loading">
		<!-- 顶部导航栏 -->
		<div class="top-nav">
			<div class="logo">
				<i class="icon-brain"></i>
				<span>Computer Vision</span>
			</div>
			<div class="user-info">
				<el-avatar :size="32" :src="resolveFileUrl(userInfos.photo)" />
				<span class="username">{{ userInfos.userName }}</span>
			</div>
		</div>

		<div class="main-content">
			<!-- 左侧功能区 -->
			<div class="left-panel">
				<div class="panel-section model-config">
					<h3 class="section-title">模型配置</h3>
					<div class="config-item">
						<label>选择模型</label>
						<el-select v-model="weight" placeholder="请选择模型" size="large">
							<el-option v-for="item in state.weight_items" :key="item.value" :label="item.label"
								:value="item.value" />
						</el-select>
					</div>
					<div class="config-item">
						<label>置信度阈值: {{ (conf/100).toFixed(2) }}</label>
						<el-slider v-model="conf" :format-tooltip="formatTooltip" show-stops :max="100" :step="5" />
					</div>
					<div class="action-buttons">
						<el-button type="primary" @click="upData" class="predict-btn">
							<i class="icon-scan"></i>
							开始检测
						</el-button>
						<el-button @click="resetForm" class="reset-btn">
							<i class="icon-reset"></i>
							重置
						</el-button>
					</div>
				</div>
			</div>

			<!-- 中间内容区 -->
			<div class="center-panel">
				<div class="upload-section">
					<el-card class="upload-card">
						<template #header>
							<div class="card-header">
								<span>上传图片</span>
								<el-button link type="primary" @click="showExample">查看示例</el-button>
							</div>
						</template>
						<el-upload v-model="state.img" ref="uploadFile" class="avatar-uploader"
							:action="SPRING_FILES_UPLOAD" :show-file-list="false"
							:limit="1"
							accept=".jpg,.jpeg,.png,.webp"
							:before-upload="beforeImageUpload"
							:on-error="handleUploadError"
							:on-success="handleAvatarSuccessone" drag>
							<div class="upload-area">
								<el-icon v-if="!imageUrl" class="upload-icon">
									<Plus />
								</el-icon>
								<img v-else :src="imageUrl" class="uploaded-image" />
								<div v-if="!imageUrl" class="upload-text">
									<p>将图片拖拽到此处，或<em>点击上传</em></p>
									<p class="upload-tip">支持 JPG、PNG 格式，大小不超过 10MB</p>
								</div>
							</div>
						</el-upload>
					</el-card>
				</div>

				<div class="result-section" v-if="state.predictionResult.label">
					<el-card class="result-card">
						<template #header>
							<div class="card-header">
								<span>检测结果</span>
								<el-button type="primary" @click="() => htmlToPDF('id', '检测报告')" size="small">
									<i class="icon-download"></i>
									导出报告
								</el-button>
							</div>
						</template>
						<div class="result-content">
							<div class="result-overview">
								<div class="result-item">
									<div class="result-icon diagnosis"></div>
									<div class="result-info">
										<div class="result-label">诊断结果</div>
										<div class="result-value highlight">{{ state.predictionResult.label || '-' }}</div>
									</div>
								</div>
								<div class="result-item">
									<div class="result-icon confidence"></div>
									<div class="result-info">
										<div class="result-label">置信度</div>
										<div class="result-value accent">{{ state.predictionResult.confidence || '-' }}</div>
									</div>
								</div>
								<div class="result-item">
									<div class="result-icon time"></div>
									<div class="result-info">
										<div class="result-label">分析用时</div>
										<div class="result-value">{{ state.predictionResult.allTime ? `${state.predictionResult.allTime}` : '-' }}</div>
									</div>
								</div>
							</div>
						</div>
					</el-card>
				</div>
			</div>

			<!-- 右侧原 AI 建议区已移除，避免触发外部大模型分析调用 -->
		</div>

		<!-- 底部状态栏 -->
		<div class="status-bar">
			<div class="status-item">
				<i class="icon-status"></i>
				<span>系统状态: 正常</span>
			</div>
			<div class="status-item">
				<i class="icon-time"></i>
				<span>最后更新: {{ currentTime }}</span>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="brainDetection">
import { reactive, ref, onMounted, computed } from 'vue';
import type { UploadInstance, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { Plus } from '@element-plus/icons-vue';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';
import { formatDate } from '/@/utils/formatTime';
import { htmlToPDF } from '/@/utils/pdf'
import { resolveFileUrl, SPRING_FILES_UPLOAD } from '/@/utils/resolveFileUrl';
import { loadModelWeights } from '/@/utils/modelWeights';
import { marked } from 'marked';

const imageUrl = ref('');
const conf = ref(60);
const weight = ref('');
const uploadFile = ref<UploadInstance>();
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

// 新增功能：当前时间显示
const currentTime = computed(() => {
	return formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');
});

const state = reactive({
	loading: false,
	weight_items: [] as any,
	img: '',
	data: [] as any,
	history: [] as any, // 新增历史记录功能
	predictionResult: {
		label: '',
		confidence: '',
		allTime: '',
		suggestion: '' as any
	},
	form: {
		username: '',
		inputImg: null as any,
		weight: '',
		conf: null as any,
		startTime: ''
	},
});

// 新增功能：格式化工具提示
const formatTooltip = (val: number) => {
	return val / 100
}

// 新增功能：重置表单
const resetForm = () => {
	imageUrl.value = '';
	state.img = '';
	state.predictionResult = {
		label: '',
		confidence: '',
		allTime: '',
		suggestion: ''
	};
	state.data = [];
	conf.value = 60;
	weight.value = '';
	ElMessage.success('已重置表单');
};

// 新增功能：显示示例图片
const showExample = () => {
	ElMessage.info('示例功能开发中...');
};

const extractUploadedPath = (response: any): string => {
	return (
		response?.data?.path ||
		response?.data?.url ||
		response?.data ||
		response?.path ||
		response?.url ||
		''
	);
};

const handleAvatarSuccessone: UploadProps['onSuccess'] = (response, uploadFile) => {
	const r = response as any;
	const uploadedPath = extractUploadedPath(r);
	if (!uploadedPath || typeof uploadedPath !== 'string') {
		state.img = '';
		imageUrl.value = '';
		ElMessage.error('上传返回异常，请重试');
		return;
	}
	state.img = uploadedPath;
	imageUrl.value = URL.createObjectURL(uploadFile.raw!);
	ElMessage.success('图片上传成功！');
};

const beforeImageUpload: UploadProps['beforeUpload'] = (rawFile: any) => {
	const ext = rawFile.name.split('.').pop()?.toLowerCase() || '';
	const extAllowed = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);
	const mimeAllowed = ['image/jpeg', 'image/png', 'image/webp'].includes(rawFile.type);
	if (!(extAllowed || mimeAllowed)) {
		ElMessage.warning('仅支持 JPG/JPEG/PNG/WEBP 格式');
		return false;
	}
	const maxSizeMB = 10;
	const isSizeOk = rawFile.size / 1024 / 1024 <= maxSizeMB;
	if (!isSizeOk) {
		ElMessage.warning(`图片不能超过 ${maxSizeMB}MB`);
		return false;
	}
	return true;
};

const handleUploadError: UploadProps['onError'] = () => {
	state.img = '';
	imageUrl.value = '';
	ElMessage.error('图片上传失败，请检查网络或稍后重试');
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

// 加载最近的识别历史（从后端记录表取前 5 条）
const loadHistory = () => {
	// 当前需求：清空管理端图像分析历史记录展示
	state.history = [];
};

const transformData = (rawData: any): any => {
	return rawData.label.map((label, index) => ({
		allTime: rawData.allTime,
		confidence: rawData.confidence[index],
		label: label,
	}));
}

const parsePredictPayload = (res: any): any | null => {
	if (res?.code === '200' || res?.code === 200) {
		let p = res.data;
		if (typeof p === 'string') {
			try {
				p = JSON.parse(p);
			} catch {
				return null;
			}
		}
		return p;
	}
	if (res != null && (res.label != null || res.outImg != null || res.confidence != null)) {
		return res;
	}
	return null;
};

/** 与实时监控类似：推理完成后写入 Spring「图像识别记录」表；此前页面只展示结果从未调用保存接口 */
const persistImgRecord = async (payload: any) => {
	const labelStr =
		typeof payload.label === 'string' ? payload.label : JSON.stringify(payload.label ?? []);
	const confStr =
		typeof payload.confidence === 'string'
			? payload.confidence
			: JSON.stringify(payload.confidence ?? []);
	try {
		const res: any = await request.post('/api/imgRecords', {
			username: state.form.username,
			inputImg: state.form.inputImg,
			outImg: payload.outImg ?? '',
			weight: state.form.weight,
			conf: state.form.conf,
			label: labelStr,
			confidence: confStr,
			allTime: payload.allTime ?? '',
			startTime: state.form.startTime,
			ai: payload.ai ?? '',
			suggestion: typeof payload.suggestion === 'string' ? payload.suggestion : '',
		});
		if (res?.code !== '200' && res?.code !== 200) {
			ElMessage.warning(res?.msg || '检测已完成，但记录未写入数据库');
		}
	} catch {
		ElMessage.warning('检测已完成，但保存识别记录失败（请在后端提供 POST /api/imgRecords 或与后端约定路径一致）');
	}
};

const upData = () => {
	if (!state.img) {
		ElMessage.warning('请先上传图片');
		return;
	}
	if (!weight.value) {
		ElMessage.warning('请先选择模型');
		return;
	}
	state.loading = true;
	state.form.weight = weight.value;
	state.form.conf = parseFloat(conf.value.toString()) / 100;
	state.form.username = userInfos.value.userName;
	state.form.inputImg = state.img;
	state.form.startTime = formatDate(new Date(), 'YYYY-mm-dd HH:MM:SS');

	request
		.post('/flask/predictImg', state.form)
		.then(async (res: any) => {
			const payload = parsePredictPayload(res);
			if (!payload) {
				ElMessage.error((res as any)?.msg ?? (res as any)?.message ?? '检测失败或返回格式异常');
				return;
			}
			try {
				if (payload.outImg) {
					imageUrl.value = payload.outImg;
				}
				state.predictionResult.label =
					typeof payload.label === 'string' ? JSON.parse(payload.label) : payload.label;
				state.predictionResult.confidence =
					typeof payload.confidence === 'string'
						? JSON.parse(payload.confidence)
						: payload.confidence;
				state.predictionResult.allTime = payload.allTime;
				state.predictionResult.suggestion = marked(String(payload.suggestion ?? ''), { async: false });
				state.data = transformData(state.predictionResult);
				await persistImgRecord(payload);
				ElMessage.success('检测完成！');
			} catch (error) {
				console.error('解析检测结果出错:', error);
				ElMessage.error('解析检测结果失败');
			}
		})
		.catch(() => {})
		.finally(() => {
			state.loading = false;
		});
};

onMounted(() => {
	getData();
	loadHistory();
});
</script>

<style scoped lang="scss">
.brain-detection-container {
	width: 100%;
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: transparent;
	overflow: hidden;
	font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;

	.top-nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 28px;
		background: radial-gradient(circle at top left, rgba(0, 212, 255, 0.16), transparent 60%),
		            radial-gradient(circle at top right, rgba(139, 120, 255, 0.14), transparent 60%),
		            rgba(8, 13, 24, 0.95);
		backdrop-filter: blur(18px);
		box-shadow:
			0 10px 30px rgba(0, 0, 0, 0.7),
			0 0 32px rgba(0, 212, 255, 0.24);
		
		.logo {
			display: flex;
			align-items: center;
			font-size: 22px;
			font-weight: 700;
			color: #e8f5ff;
			
			.icon-brain {
				display: inline-block;
				width: 32px;
				height: 32px;
				background: linear-gradient(135deg, #00d4ff 0%, #8b78ff 100%);
				border-radius: 8px;
				margin-right: 10px;
				position: relative;
				
				&:before {
					content: "";
					position: absolute;
					top: 8px;
					left: 8px;
					width: 16px;
					height: 16px;
					border: 2px solid white;
					border-radius: 50%;
				}
				
				&:after {
					content: "";
					position: absolute;
					bottom: 8px;
					right: 8px;
					width: 8px;
					height: 8px;
					background: white;
					border-radius: 50%;
				}
			}
		}
		
		.user-info {
			display: flex;
			align-items: center;
			
			.username {
				margin-left: 10px;
				font-weight: 500;
				color: rgba(255, 255, 255, 0.75);
			}
		}
	}

	.main-content {
		flex: 1;
		display: flex;
		padding: 18px;
		gap: 20px;
		overflow: hidden;
		
		.left-panel, .right-panel {
			width: 300px;
			display: flex;
			flex-direction: column;
			gap: 20px;
		}
		
		.center-panel {
			flex: 1;
			display: flex;
			flex-direction: column;
			gap: 20px;
			overflow-y: auto;
		}
		
		.panel-section {
			position: relative;
			isolation: isolate;
			background:
				radial-gradient(circle at 20% 18%, rgba(56, 189, 248, 0.18) 0%, rgba(56, 189, 248, 0) 40%),
				radial-gradient(circle at 82% 84%, rgba(129, 140, 248, 0.2) 0%, rgba(129, 140, 248, 0) 46%),
				linear-gradient(135deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 41, 59, 0.9) 56%, rgba(51, 65, 85, 0.9) 100%);
			border-radius: 20px;
			padding: 20px;
			border: 1px solid rgba(148, 163, 184, 0.3);
			box-shadow: 0 8px 24px rgba(2, 6, 23, 0.2);

			&::before {
				content: "";
				position: absolute;
				inset: 0;
				border-radius: 20px;
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.14'%3E%3Cpath d='M0 36h180M0 72h180M0 108h180M0 144h180M36 0v180M72 0v180M108 0v180M144 0v180'/%3E%3C/g%3E%3C/svg%3E");
				background-size: 180px 180px;
				mix-blend-mode: soft-light;
				opacity: 0.4;
				pointer-events: none;
				z-index: 0;
			}

			> * {
				position: relative;
				z-index: 1;
			}
			
			.section-title {
				font-size: 16px;
				font-weight: 600;
				color: #f8fafc;
				margin-bottom: 15px;
				padding-bottom: 10px;
				border-bottom: 1px solid rgba(148, 163, 184, 0.3);
			}
		}

		/* 模型配置卡片与上传图片卡片高度一致 */
		.left-panel .model-config {
			height: 420px;
			display: flex;
			flex-direction: column;

			:deep(.el-input__wrapper) {
				background: rgba(15, 23, 42, 0.45);
				box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.28);
			}

			:deep(.el-input__inner),
			:deep(.el-select__selected-item) {
				color: #f8fafc;
			}

			:deep(.el-select__placeholder),
			:deep(.el-input__inner::placeholder) {
				color: rgba(203, 213, 225, 0.85);
			}

			:deep(.el-select__caret) {
				color: rgba(226, 232, 240, 0.9);
			}

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

		.left-panel .model-config .config-item,
		.left-panel .model-config .action-buttons {
			margin-bottom: 20px;
			
			.config-item {
				margin-bottom: 20px;
				
				label {
					display: block;
					margin-bottom: 8px;
					font-size: 14px;
					color: #ffffff;
					font-weight: 600;
				}
			}
			
			.action-buttons {
				display: flex;
				flex-direction: row;
				gap: 12px;
				
				.predict-btn,
				.reset-btn {
					flex: 1;
					height: 44px;
				}
				
				.predict-btn {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					border: none;
					font-weight: 600;
					
					.icon-scan {
						display: inline-block;
						width: 16px;
						height: 16px;
						background: white;
						border-radius: 50%;
						margin-right: 8px;
						position: relative;
						
						&:before {
							content: "";
							position: absolute;
							top: 3px;
							left: 3px;
							width: 10px;
							height: 10px;
							border: 2px solid #764ba2;
							border-radius: 50%;
						}
					}
				}
				
				.reset-btn {
					.icon-reset {
						display: inline-block;
						width: 16px;
						height: 16px;
						border: 2px solid rgba(148, 163, 184, 0.9);
						border-radius: 50%;
						margin-right: 8px;
						position: relative;
						
						&:before {
							content: "";
							position: absolute;
							top: 2px;
							right: 2px;
							width: 6px;
							height: 2px;
							background: #5a6c7d;
							transform: rotate(45deg);
						}
					}
				}
			}
			
			.history-list {
				max-height: 200px;
				overflow-y: auto;
				
				.history-item {
					padding: 10px 0;
					border-bottom: 1px solid #f0f0f0;
					
					&:last-child {
						border-bottom: none;
					}
					
					.history-time {
						font-size: 12px;
						color: #909399;
					}
					
					.history-result {
						font-size: 14px;
						color: #2c3e50;
						margin-top: 4px;
					}
				}
				
				.empty-history {
					text-align: center;
					color: #909399;
					font-style: italic;
					padding: 20px 0;
				}
			}
			
			.ai-suggestion {
				max-height: 400px;
				overflow-y: auto;
				padding: 10px;
				background: #f8f9fa;
				border-radius: 8px;
			}
			
			.suggestion-actions {
				display: flex;
				justify-content: flex-end;
				margin-top: 15px;
				
				.icon-copy, .icon-save {
					display: inline-block;
					width: 14px;
					height: 14px;
					margin-right: 5px;
					background: #5a6c7d;
				}
			}
		}
		
		.upload-card, .result-card {
			border-radius: 12px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
			border: none;
			
			:deep(.el-card__header) {
				border-bottom: 1px solid #eaeaea;
				padding: 15px 20px;
				
				.card-header {
					display: flex;
					justify-content: space-between;
					align-items: center;
					
					span {
						font-weight: 600;
						color: #2c3e50;
					}
				}
			}
		}

		/* 只通过“上传图片”卡片高度来和左侧“历史记录”对齐，不改历史记录样式 */
		.upload-section .upload-card {
			height: 420px; /* 如需微调对齐，可调整这一行数值 */
			display: flex;
			flex-direction: column;
		}
		
		.avatar-uploader {
			:deep(.el-upload) {
				width: 100%;
			}
			
			:deep(.el-upload-dragger) {
				width: 100%;
				height: 300px;
				border: 1px solid rgba(148, 163, 184, 0.36);
				border-radius: 10px;
				background:
					radial-gradient(circle at 22% 18%, rgba(56, 189, 248, 0.22) 0%, rgba(56, 189, 248, 0) 42%),
					radial-gradient(circle at 84% 80%, rgba(129, 140, 248, 0.24) 0%, rgba(129, 140, 248, 0) 46%),
					linear-gradient(135deg, #0f172a 0%, #1e293b 58%, #334155 100%);
				display: flex;
				align-items: center;
				justify-content: center;
				flex-direction: column;
				position: relative;
				overflow: hidden;
				
				&:hover {
					border-color: rgba(125, 211, 252, 0.75);
					box-shadow: inset 0 0 0 1px rgba(125, 211, 252, 0.18);
				}

				&::before {
					content: "";
					position: absolute;
					inset: 0;
					background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180' viewBox='0 0 180 180'%3E%3Cg fill='none' stroke='%23ffffff' stroke-opacity='0.16'%3E%3Cpath d='M0 36h180M0 72h180M0 108h180M0 144h180M36 0v180M72 0v180M108 0v180M144 0v180'/%3E%3C/g%3E%3C/svg%3E");
					background-size: 180px 180px;
					mix-blend-mode: soft-light;
					opacity: 0.45;
					pointer-events: none;
				}
			}
			
			.upload-area {
				width: 100%;
				height: 100%;
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				position: relative;
				z-index: 1;
				
				.upload-icon {
					font-size: 48px;
					color: rgba(226, 232, 240, 0.9);
					margin-bottom: 15px;
				}
				
				.uploaded-image {
					max-width: 100%;
					max-height: 280px;
					border-radius: 6px;
				}
				
				.upload-text {
					text-align: center;
					
					p {
						margin: 5px 0;
						color: rgba(226, 232, 240, 0.95);
						
						em {
							color: #7dd3fc;
							font-style: normal;
						}
					}
					
					.upload-tip {
						font-size: 12px;
						color: rgba(203, 213, 225, 0.88);
					}
				}
			}
		}
		
		.result-content {
			.result-overview {
				display: flex;
				justify-content: space-between;
				margin-bottom: 20px;
				
				.result-item {
					display: flex;
					align-items: center;
					flex: 1;
					padding: 15px;
					background: #f8f9fa;
					border-radius: 8px;
					margin: 0 10px;
					
					.result-icon {
						width: 40px;
						height: 40px;
						border-radius: 8px;
						margin-right: 15px;
						display: flex;
						align-items: center;
						justify-content: center;
						color: white;
						font-size: 18px;
						
						&.diagnosis {
							background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
						}
						
						&.confidence {
							background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
						}
						
						&.time {
							background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
						}
					}
					
					.result-info {
						.result-label {
							font-size: 14px;
							color: #909399;
							margin-bottom: 5px;
						}
						
						.result-value {
							font-size: 18px;
							font-weight: 600;
							
							&.highlight {
								color: #43e97b;
							}
							
							&.accent {
								color: #fa709a;
							}
						}
					}
				}
			}
			
			.detailed-results {
				h4 {
					margin-bottom: 15px;
					color: #2c3e50;
				}
			}
		}
	}

	.status-bar {
		display: flex;
		justify-content: space-between;
		padding: 10px 30px;
		background: rgba(255, 255, 255, 0.8);
		border-top: 1px solid #eaeaea;
		font-size: 14px;
		color: #5a6c7d;
		
		.status-item {
			display: flex;
			align-items: center;
			
			.icon-status, .icon-time {
				display: inline-block;
				width: 12px;
				height: 12px;
				border-radius: 50%;
				background: #43e97b;
				margin-right: 8px;
			}
			
			.icon-time {
				background: #fa709a;
			}
		}
	}
}

.markdown-body {
	line-height: 1.6;
	font-size: 14px;
	
	h1, h2, h3, h4, h5, h6 {
		margin-top: 0;
		margin-bottom: 10px;
		color: #2c3e50;
	}
	
	p {
		margin-bottom: 10px;
	}
	
	pre {
		background: #f4f4f4;
		padding: 10px;
		border-radius: 5px;
		overflow-x: auto;
		margin: 10px 0;
	}
	
	code {
		background: #f4f4f4;
		padding: 2px 5px;
		border-radius: 3px;
		font-family: 'Courier New', monospace;
	}
	
	ul, ol {
		padding-left: 20px;
		margin: 10px 0;
	}
}

/* 响应式设计 */
@media (max-width: 1200px) {
	.brain-detection-container .main-content {
		flex-direction: column;
		
		.left-panel, .right-panel {
			width: 100%;
		}
		
		.result-overview {
			flex-direction: column;
			
			.result-item {
				margin: 10px 0;
			}
		}
	}
}
</style>