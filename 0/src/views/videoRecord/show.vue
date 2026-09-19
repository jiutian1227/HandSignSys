<template>
	<div class="video-compare-container">
		<div class="compare-main">
			<div class="compare-header">
				<div class="header-content">
					<div class="info-grid">
						<div class="info-item">
							<div class="info-label">
								<el-icon><ele-Cpu /></el-icon>
								使用权重
							</div>
							<el-input v-model="state.form.weight" class="info-value" size="large" disabled />
						</div>
						<div class="info-item">
							<div class="info-label">
								<el-icon><ele-Scale /></el-icon>
								最小阈值
							</div>
							<el-input v-model="state.form.conf" class="info-value" size="large" disabled />
						</div>
						<div class="info-item">
							<div class="info-label">
								<el-icon><ele-User /></el-icon>
								用户
							</div>
							<el-input v-model="state.form.username" class="info-value" size="large" disabled />
						</div>
						<div class="info-item">
							<div class="info-label">
								<el-icon><ele-Clock /></el-icon>
								开始时间
							</div>
							<el-input v-model="state.form.startTime" class="info-value" size="large" disabled />
						</div>
					</div>
					<div class="control-buttons">
						<el-button type="primary" @click="playVideos" class="control-btn play-btn">
							<el-icon><ele-VideoPlay /></el-icon>
							同步播放
						</el-button>
						<el-button type="warning" @click="pauseVideos" class="control-btn pause-btn">
							<el-icon><ele-VideoPause /></el-icon>
							暂停播放
						</el-button>
					</div>
				</div>
			</div>

			<div class="compare-body">
				<div class="video-panel left-panel" :style="{ width: leftWidth + '%' }">
					<div class="panel-header">
						<div class="panel-title">
							<el-icon><ele-VideoCamera /></el-icon>
							原视频
						</div>
					</div>
					<div class="video-wrapper">
						<video 
							class="video-player" 
							v-if="state.form.inputVideo" 
							preload="auto" 
							controls
						>
							<source :src="state.playableInputVideo || state.form.inputVideo" type="video/mp4" />
						</video>
						<div v-else class="video-placeholder">
							<el-icon><ele-Picture /></el-icon>
							<span>暂无视频</span>
						</div>
					</div>
				</div>

				<div class="splitter-bar" @mousedown="startDrag">
					<div class="splitter-handle">
						<el-icon><ele-DArrowLeft /></el-icon>
						<el-icon><ele-DArrowRight /></el-icon>
					</div>
				</div>

				<div class="video-panel right-panel" :style="{ width: 100 - leftWidth + '%' }">
					<div class="panel-header">
						<div class="panel-title">
							<el-icon><ele-Monitor /></el-icon>
							处理结果
						</div>
					</div>
					<div class="video-wrapper">
						<video 
							class="video-player" 
							preload="auto" 
							v-if="state.form.outVideo" 
							controls
						>
							<source :src="state.playableOutVideo || state.form.outVideo" type="video/mp4" />
						</video>
						<div v-else class="video-placeholder">
							<el-icon><ele-Picture /></el-icon>
							<span>暂无视频</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { reactive, ref, onBeforeUnmount, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { useRoute } from 'vue-router';

const route = useRoute();
const leftWidth = ref(50);
const state = reactive({
	form: {} as any,
	id: '' as any,
	playableInputVideo: '',
	playableOutVideo: '',
});

const revokePlayableUrls = () => {
	if (state.playableInputVideo) URL.revokeObjectURL(state.playableInputVideo);
	if (state.playableOutVideo) URL.revokeObjectURL(state.playableOutVideo);
	state.playableInputVideo = '';
	state.playableOutVideo = '';
};

const toPlayableVideoUrl = async (url: string) => {
	// 后端 files 接口是 “下载” 响应，这里转成 Blob 再交给 video 播放
	const resp = await fetch(url);
	if (!resp.ok) throw new Error(`视频加载失败(${resp.status})`);
	const blob = await resp.blob();
	const videoBlob = blob.type ? blob : new Blob([blob], { type: 'video/mp4' });
	return URL.createObjectURL(videoBlob);
};

const getData = () => {
	request.get('/api/videoRecords/' + state.id).then((res) => {
		if (res.code === '200') {
			state.form = res.data;
			console.log(state.form);
			revokePlayableUrls();
			Promise.allSettled([
				state.form?.inputVideo ? toPlayableVideoUrl(state.form.inputVideo) : Promise.resolve(''),
				state.form?.outVideo ? toPlayableVideoUrl(state.form.outVideo) : Promise.resolve(''),
			]).then(([inputRes, outRes]) => {
				if (inputRes.status === 'fulfilled' && inputRes.value) state.playableInputVideo = inputRes.value;
				if (outRes.status === 'fulfilled' && outRes.value) state.playableOutVideo = outRes.value;
			});
		} else {
			ElMessage.error(res.msg);
		}
	});
};

const playVideos = () => {
    const leftVideo = document.querySelector('.left-panel .video-player') as HTMLVideoElement;
    const rightVideo = document.querySelector('.right-panel .video-player') as HTMLVideoElement;

    if (leftVideo) leftVideo.play();
    if (rightVideo) rightVideo.play();
};

const pauseVideos = () => {
    const leftVideo = document.querySelector('.left-panel .video-player') as HTMLVideoElement;
    const rightVideo = document.querySelector('.right-panel .video-player') as HTMLVideoElement;

    if (leftVideo) leftVideo.pause();
    if (rightVideo) rightVideo.pause();
};

const startDrag = (e: MouseEvent) => {
	const compareBody = document.querySelector('.compare-body') as HTMLElement;
	const startX = e.clientX;
	const startLeftWidth = leftWidth.value;

	const containerLeft = compareBody.getBoundingClientRect().left;
	const containerWidth = compareBody.offsetWidth;

	const onMouseMove = (moveEvent: MouseEvent) => {
		const deltaX = moveEvent.clientX - startX;
		let newLeftWidth = startLeftWidth + (deltaX / containerWidth) * 100;
		newLeftWidth = Math.min(Math.max(newLeftWidth, 10), 90);
		leftWidth.value = newLeftWidth;
	};

	const onMouseUp = () => {
		document.removeEventListener('mousemove', onMouseMove);
		document.removeEventListener('mouseup', onMouseUp);
	};

	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mouseup', onMouseUp);
};

onMounted(() => {
	state.id = route.query.id;
	console.log(state.id);
	getData();
});

onBeforeUnmount(() => {
	revokePlayableUrls();
});
</script>

<style scoped lang="scss">
.video-compare-container {
	width: 100%;
	height: 100%;
	padding: 20px;
	background: linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%);

	.compare-main {
		width: 100%;
		height: 100%;
		background: white;
		border-radius: 16px;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}
}

.compare-header {
	padding: 24px;
	border-bottom: 1px solid #f0f2f5;
	background: linear-gradient(90deg, #fafbfc 0%, #ffffff 100%);

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: flex-end;
		gap: 24px;
	}
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(4, 1fr);
	gap: 16px;
	flex: 1;

	.info-item {
		.info-label {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 14px;
			font-weight: 500;
			color: #606266;
			margin-bottom: 8px;

			.el-icon {
				color: #409eff;
			}
		}

		.info-value {
			:deep(.el-input__inner) {
				background: #f8f9fa;
				border: 1px solid #e4e7ed;
				border-radius: 8px;
				color: #1f2d3d;
				font-weight: 500;
			}
		}
	}
}

.control-buttons {
	display: flex;
	gap: 12px;

	.control-btn {
		border-radius: 10px;
		padding: 12px 24px;
		font-weight: 500;
		border: none;
		transition: all 0.3s ease;
		box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);

		&.play-btn {
			background: linear-gradient(135deg, #409eff 0%, #3375b9 100%);
			
			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 6px 20px rgba(64, 158, 255, 0.4);
			}
		}

		&.pause-btn {
			background: linear-gradient(135deg, #e6a23c 0%, #b8822b 100%);
			
			&:hover {
				transform: translateY(-2px);
				box-shadow: 0 6px 20px rgba(230, 162, 60, 0.4);
			}
		}

		.el-icon {
			margin-right: 6px;
		}
	}
}

.compare-body {
	flex: 1;
	display: flex;
	position: relative;
	background: #f8f9fa;
}

.video-panel {
	height: 100%;
	display: flex;
	flex-direction: column;
	background: white;
	transition: all 0.3s ease;

	.panel-header {
		padding: 16px 24px;
		border-bottom: 1px solid #f0f2f5;
		background: linear-gradient(90deg, #fafbfc 0%, #ffffff 100%);

		.panel-title {
			display: flex;
			align-items: center;
			gap: 8px;
			font-size: 16px;
			font-weight: 600;
			color: #1f2d3d;

			.el-icon {
				color: #409eff;
			}
		}
	}

	.video-wrapper {
		flex: 1;
		padding: 24px;
		display: flex;
		justify-content: center;
		align-items: center;
		background: #000;
		position: relative;

		.video-player {
			width: 100%;
			height: 100%;
			max-height: 100%;
			object-fit: contain;
			border-radius: 8px;
			background: #000;
		}

		.video-placeholder {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 12px;
			color: #909399;
			font-size: 14px;

			.el-icon {
				font-size: 48px;
				color: #c0c4cc;
			}
		}
	}
}

.splitter-bar {
	width: 4px;
	background: linear-gradient(to bottom, #409eff, #79bbff);
	cursor: ew-resize;
	position: relative;
	transition: all 0.3s ease;
	z-index: 10;

	&:hover {
		width: 6px;
		background: linear-gradient(to bottom, #3375b9, #409eff);
		box-shadow: 0 0 20px rgba(64, 158, 255, 0.4);

		.splitter-handle {
			opacity: 1;
			transform: translateX(-50%) scale(1.1);
		}
	}

	.splitter-handle {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translateX(-50%) translateY(-50%);
		background: white;
		border-radius: 50%;
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		opacity: 0.8;
		transition: all 0.3s ease;
		color: #409eff;

		.el-icon {
			font-size: 14px;
		}
	}
}

.left-panel {
	border-right: 1px solid #f0f2f5;
}

.right-panel {
	border-left: 1px solid #f0f2f5;
}

@media (max-width: 1200px) {
	.info-grid {
		grid-template-columns: repeat(2, 1fr);
	}
	
	.header-content {
		flex-direction: column;
		align-items: stretch !important;
	}
	
	.control-buttons {
		justify-content: center;
		margin-top: 16px;
	}
}
</style>