<template>
	<div class="detection-history-container">
		<div class="history-content">
			<!-- 搜索筛选区域 -->
			<div class="search-panel">
				<div class="search-title">历史记录筛选</div>
				<div class="search-controls">
					<div class="search-group">
						<label class="search-label">识别时间</label>
						<el-input 
							v-model="state.tableData.param.search1" 
							size="large" 
							placeholder="请输入识别时间" 
							class="search-input"
							clearable>
						</el-input>
					</div>
					<div class="search-group">
						<label class="search-label">置信度阈值</label>
						<el-input 
							v-model="state.tableData.param.search3" 
							size="large" 
							placeholder="请输入最小阈值" 
							class="search-input"
							clearable>
						</el-input>
					</div>
					<el-button size="large" type="primary" class="search-btn" @click="getTableData()">
						<el-icon class="search-icon">
							<ele-Search />
						</el-icon>
						搜索记录
					</el-button>
				</div>
			</div>

			<!-- 数据表格区域 -->
			<div class="table-container">
				<el-table 
					:data="state.tableData.data" 
					v-loading="state.tableData.loading" 
					class="history-table"
					style="width: 100%"
					:fit="true"
					:header-cell-style="{ background: '#f8fafc', color: '#475569' }">
					<el-table-column prop="num" label="序号" width="80" align="center">
						<template #default="scope">
							<div class="serial-number">{{ scope.row.num }}</div>
						</template>
					</el-table-column>
					
					<el-table-column prop="outVideo" label="检测结果" min-width="240" align="center">
						<template #default="scope">
							<el-button type="primary" plain @click="onPreviewVideo(scope.row)">
								<el-icon><VideoPlay /></el-icon>
								播放结果
							</el-button>
						</template>
					</el-table-column>
					
					<el-table-column prop="weight" label="检测模型" align="center" min-width="140">
						<template #default="scope">
							<el-tag type="info" class="model-tag">{{ scope.row.weight }}</el-tag>
						</template>
					</el-table-column>
					
					<el-table-column prop="conf" label="置信阈值" min-width="120" align="center">
						<template #default="scope">
							<div class="confidence-value">{{ scope.row.conf }}</div>
						</template>
					</el-table-column>
					
					<el-table-column prop="username" label="操作用户" min-width="120" align="center">
						<template #default="scope">
							<div class="user-info">
								<span class="username">{{ scope.row.username }}</span>
							</div>
						</template>
					</el-table-column>
					
					<el-table-column prop="startTime" label="检测时间" min-width="180" align="center">
						<template #default="scope">
							<div class="time-display">
								<el-icon class="time-icon"><Clock /></el-icon>
								{{ scope.row.startTime }}
							</div>
						</template>
					</el-table-column>
					
					<el-table-column label="操作" min-width="180" align="center">
						<template #default="scope">
							<div class="action-buttons">
								<el-button 
									size="small" 
									type="primary" 
									class="detail-btn"
									@click="onViewDetail(scope.row)">
									<el-icon><View /></el-icon>
									查看详情
								</el-button>
								<el-button 
									size="small" 
									text 
									type="danger" 
									class="delete-btn"
									@click="onRowDel(scope.row)">
									<el-icon><Delete /></el-icon>
									删除
								</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>

				<!-- 分页组件 -->
				<div class="pagination-container">
					<el-pagination 
						@size-change="onHandleSizeChange" 
						@current-change="onHandleCurrentChange"
						:pager-count="5" 
						:page-sizes="[10, 20, 30]" 
						v-model:current-page="state.tableData.param.pageNum"
						background 
						v-model:page-size="state.tableData.param.pageSize"
						layout="total, sizes, prev, pager, next, jumper" 
						:total="state.tableData.total"
						class="custom-pagination">
					</el-pagination>
				</div>
			</div>
		</div>

		<!-- 详情弹窗 -->
		<el-dialog 
			v-model="state.detailDialogVisible" 
			title="检测记录详情" 
			width="80%"
			class="detail-dialog"
			:close-on-click-modal="false">
			
			<div class="detail-content" v-if="state.currentRecord">
				<div class="detail-header">
					<div class="record-info">
						<div class="info-item">
							<span class="info-label">检测模型：</span>
							<el-tag type="primary">{{ state.currentRecord.weight }}</el-tag>
						</div>
						<div class="info-item">
							<span class="info-label">置信阈值：</span>
							<span class="info-value">{{ state.currentRecord.conf }}</span>
						</div>
						<div class="info-item">
							<span class="info-label">操作用户：</span>
							<div class="user-detail">
								<span class="username">{{ state.currentRecord.username }}</span>
							</div>
						</div>
						<div class="info-item">
							<span class="info-label">检测时间：</span>
							<span class="info-value">{{ state.currentRecord.startTime }}</span>
						</div>
						<div class="info-item" v-if="state.videoDuration > 0">
							<span class="info-label">视频时长：</span>
							<span class="info-value">{{ formatTime(state.videoDuration) }}</span>
						</div>
					</div>
				</div>

				<div class="video-section">
					<div class="section-title section-title--video">
						<el-icon class="section-title-icon"><VideoPlay /></el-icon>
						检测结果视频
					</div>
					<div class="video-player-container">
						<div class="video-aspect-frame">
							<video
								ref="videoPlayer"
								class="detail-video"
								controls
								playsinline
								preload="metadata"
								:key="(state.playableOutVideo || resolveFileUrl(state.currentRecord?.outVideo)) + 'detail'"
								@loadedmetadata="onVideoLoaded"
								@error="onVideoError">
								<source :src="state.playableOutVideo || resolveFileUrl(state.currentRecord?.outVideo)" type="video/mp4" />
								您的浏览器不支持视频播放
							</video>
						</div>
						<div class="video-loading" v-if="state.videoLoading">
							<el-icon class="loading-icon"><Loading /></el-icon>
							<span>视频加载中...</span>
						</div>
					</div>
				</div>

				<div class="detection-data" v-if="state.detectionStats">
					<div class="section-title">检测统计</div>
					<div class="stats-grid">
						<div class="stat-card">
							<div class="stat-icon detection-count">🎯</div>
							<div class="stat-content">
								<div class="stat-value">{{ state.detectionStats.totalDetections }}</div>
								<div class="stat-label">总检测次数</div>
							</div>
						</div>
						<div class="stat-card">
							<div class="stat-icon confidence-avg">📊</div>
							<div class="stat-content">
								<div class="stat-value">{{ state.detectionStats.avgConfidence }}%</div>
								<div class="stat-label">平均置信度</div>
							</div>
						</div>
						<div class="stat-card">
							<div class="stat-icon duration">⏱️</div>
							<div class="stat-content">
								<div class="stat-value">{{ formatTime(state.videoDuration) }}</div>
								<div class="stat-label">视频时长</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<template #footer>
				<el-button @click="state.detailDialogVisible = false">关闭</el-button>
				<el-button type="primary" @click="downloadVideo" v-if="state.currentRecord">
					<el-icon><Download /></el-icon>
					下载视频
				</el-button>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemRole">
import { reactive, onBeforeUnmount, onMounted, ref, nextTick, watch } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import {
	Delete,
	Clock,
	VideoPlay,
	Search as EleSearch,
	View,
	Loading,
	Download,
} from '@element-plus/icons-vue';
import request from '/@/utils/request';
import { resolveFileUrl } from '/@/utils/resolveFileUrl';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';
const videoPlayer = ref<HTMLVideoElement>();
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

const state = reactive({
	tableData: {
		data: [] as any,
		total: 0,
		loading: false,
		param: {
			search: '',
			search1: '',
			search3: '',
			search2: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
	detailDialogVisible: false,
	currentRecord: null as any,
	videoLoading: false,
	videoDuration: 0,
	detectionStats: null as any,
	playableOutVideo: '',
});

const revokePlayableOutVideo = () => {
	if (state.playableOutVideo) URL.revokeObjectURL(state.playableOutVideo);
	state.playableOutVideo = '';
};

const toPlayableVideoUrl = async (url: string) => {
	const resp = await fetch(resolveFileUrl(url));
	if (!resp.ok) throw new Error(`视频加载失败(${resp.status})`);
	const blob = await resp.blob();
	const videoBlob = blob.type ? blob : new Blob([blob], { type: 'video/mp4' });
	return URL.createObjectURL(videoBlob);
};

const ensurePlayableOutVideo = async () => {
	if (!state.currentRecord?.outVideo) return;
	try {
		revokePlayableOutVideo();
		state.playableOutVideo = await toPlayableVideoUrl(state.currentRecord.outVideo);
	} catch (e: any) {
		ElMessage.error(e?.message || '视频加载失败');
	}
};

const isRecordsResponseOk = (res: any) => {
	const code = res?.code;
	if (code === '200' || code === 200 || code === 0 || code === '0') return true;
	if (res?.success === true) return true;
	if (Array.isArray(res?.data)) return true;
	if (res?.data && typeof res.data === 'object') return true;
	return false;
};

/** 兼容 Spring 分页：records / list / content / rows / 直接数组 */
const extractCameraRecordRows = (res: any): { rows: any[]; total: number } => {
	const d = res?.data;
	if (Array.isArray(d)) return { rows: d, total: Number(res?.total) || d.length };
	if (d && typeof d === 'object') {
		const rows = d.records ?? d.list ?? d.content ?? d.rows ?? [];
		const total = d.total ?? d.totalElements ?? d.totalCount ?? (Array.isArray(rows) ? rows.length : 0);
		return { rows: Array.isArray(rows) ? rows : [], total: Number(total) || 0 };
	}
	return { rows: [], total: 0 };
};

const onViewDetail = (row: any) => {
	state.currentRecord = row;
	state.detailDialogVisible = true;
	state.videoLoading = true;
	
	state.videoDuration = 0;
	
	// 模拟获取检测统计数据
	setTimeout(() => {
		state.detectionStats = {
			totalDetections: Math.floor(Math.random() * 50) + 10,
			avgConfidence: (Math.random() * 30 + 70).toFixed(1),
		};
	}, 500);

	ensurePlayableOutVideo().finally(() => {
		// 让 video 的 loadedmetadata 来结束 loading，这里只兜底
	});
};

const onPreviewVideo = (row: any) => {
	state.currentRecord = row;
	state.detailDialogVisible = true;
	state.videoLoading = true;
	ensurePlayableOutVideo();
	nextTick(() => {
		videoPlayer.value?.load();
	});
};

const onVideoLoaded = () => {
	state.videoLoading = false;
	state.videoDuration = videoPlayer.value?.duration || 0;
};

const onVideoError = () => {
	state.videoLoading = false;
	ElMessage.error('视频加载失败，请检查网络连接或视频文件');
};

const formatTime = (seconds: number) => {
	if (isNaN(seconds) || seconds === 0) return '00:00';
	
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const downloadVideo = () => {
	if (!state.currentRecord?.outVideo) {
		ElMessage.error('无法下载视频：视频链接无效');
		return;
	}
	
	const link = document.createElement('a');
	link.href = resolveFileUrl(state.currentRecord.outVideo);
	link.download = `detection_${state.currentRecord.startTime}.mp4`;
	link.click();
};

const getTableData = () => {
	state.tableData.loading = true;
	const isUser = userInfos.value.role === 'user';
	const currentUserName = userInfos.value.userName || '';
	const params = {
		...state.tableData.param,
		...(isUser && currentUserName ? { username: currentUserName } : {}),
	};
	request
		.get('/api/cameraRecords', {
			params,
		})
		.then((res: any) => {
			const ok = isRecordsResponseOk(res);
			if (!ok) {
				ElMessage.error(res?.msg || res?.message || '加载监控记录失败');
				return;
			}
			const { rows, total } = extractCameraRecordRows(res);
			const visibleRows =
				isUser && currentUserName ? rows.filter((row: any) => row?.username === currentUserName) : rows;
			state.tableData.data = visibleRows.map((record: any, i: number) => ({
				...record,
				num: i + 1 + (state.tableData.param.pageNum - 1) * state.tableData.param.pageSize,
			}));
			state.tableData.total = isUser && currentUserName ? visibleRows.length : total;
		})
		.catch(() => {})
		.finally(() => {
			state.tableData.loading = false;
		});
};

const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该检测记录，是否继续？`, '确认删除', {
		confirmButtonText: '确认删除',
		cancelButtonText: '取消',
		type: 'warning',
		confirmButtonClass: 'confirm-delete-btn',
	})
		.then(() => {
			request.delete('/api/cameraRecords/' + row.id).then((res) => {
				if (res.code === '200') {
					ElMessage({
						type: 'success',
						message: '删除成功！',
					});
				} else {
					ElMessage({
						type: 'error',
						message: res.msg,
					});
				}
			});
			setTimeout(() => {
				getTableData();
			}, 500);
		})
		.catch(() => { });
};

const onHandleSizeChange = (val: number) => {
	state.tableData.param.pageSize = val;
	getTableData();
};

const onHandleCurrentChange = (val: number) => {
	state.tableData.param.pageNum = val;
	getTableData();
};

onMounted(() => {
	getTableData();
});

watch(
	() => state.detailDialogVisible,
	(v) => {
		if (!v) revokePlayableOutVideo();
	}
);

onBeforeUnmount(() => {
	revokePlayableOutVideo();
});
</script>

<style scoped lang="scss">
.detection-history-container {
	width: 100%;
	height: 100%;
	background: transparent;
	padding: 20px;
	box-sizing: border-box;
}

.history-content {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.search-panel {
	background: rgba(255, 255, 255, 0.95);
	border-radius: 16px;
	padding: 24px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	backdrop-filter: blur(10px);
}

.search-title {
	font-size: 18px;
	font-weight: 600;
	color: #1e293b;
	margin-bottom: 20px;
	display: flex;
	align-items: center;
	
	&::before {
		content: '';
		width: 4px;
		height: 16px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: 2px;
		margin-right: 8px;
	}
}

.search-controls {
	display: flex;
	align-items: end;
	gap: 16px;
	flex-wrap: wrap;
}

.search-group {
	display: flex;
	flex-direction: column;
	gap: 8px;
}

.search-label {
	font-size: 14px;
	font-weight: 500;
	color: #475569;
}

.search-input {
	width: 200px;
	
	:deep(.el-input__wrapper) {
		border-radius: 10px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
	}
}

.search-btn {
	background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	border: none;
	border-radius: 10px;
	padding: 0 24px;
	height: 40px;
	
	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
	}
}

.search-icon {
	margin-right: 6px;
}

.table-container {
	flex: 1;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 16px;
	padding: 24px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
}

.history-table {
	flex: 1;
	width: 100%;
	border-radius: 12px;
	overflow: hidden;
	
	:deep(.el-table__header) {
		th {
			font-weight: 600;
		}
	}
	
	:deep(.el-table__row) {
		transition: all 0.3s ease;
		
		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		}
	}
}

.serial-number {
	font-weight: 600;
	color: #475569;
}

.video-preview {
	position: relative;
	border-radius: 8px;
	overflow: hidden;
	background: #000;
	cursor: pointer;
	
	&:hover .video-overlay {
		opacity: 1;
	}
}

.preview-video {
	width: 100%;
	height: 120px;
	object-fit: cover;
	border-radius: 8px;
}

.video-overlay {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: rgba(0, 0, 0, 0.5);
	display: flex;
	align-items: center;
	justify-content: center;
	opacity: 0;
	transition: opacity 0.3s ease;
}

.play-icon {
	font-size: 32px;
	color: white;
}

.model-tag {
	border: none;
	background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%);
	color: #4f46e5;
	font-weight: 500;
}

.confidence-value {
	font-weight: 600;
	color: #059669;
}

.user-info {
	display: flex;
	align-items: center;
	justify-content: center;
}

.username {
	font-weight: 500;
	color: #475569;
}

.time-display {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 6px;
	color: #64748b;
	font-size: 14px;
}

.time-icon {
	color: #94a3b8;
}

.action-buttons {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 8px;
}

.detail-btn {
	background: linear-gradient(135deg, #10b981 0%, #059669 100%);
	border: none;
	color: white;
	
	&:hover {
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
	}
}

.delete-btn {
	color: #ef4444;
	font-weight: 500;
	
	&:hover {
		background: rgba(239, 68, 68, 0.1);
	}
}

.pagination-container {
	margin-top: 20px;
	display: flex;
	justify-content: center;
}

.custom-pagination {
	:deep(.btn-prev),
	:deep(.btn-next),
	:deep(.number) {
		border-radius: 8px;
		margin: 0 4px;
	}
	
	:deep(.active) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
}

/* 详情弹窗样式 */
.detail-dialog {
	:deep(.el-dialog) {
		border-radius: 16px;
		overflow: hidden;
	}
	
	:deep(.el-dialog__header) {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		margin: 0;
		padding: 20px 24px;
		
		.el-dialog__title {
			color: white;
			font-weight: 600;
		}
		
		.el-dialog__headerbtn {
			.el-dialog__close {
				color: white;
			}
		}
	}
}

.detail-content {
	padding: 0;
}

.detail-header {
	background: #f8fafc;
	padding: 20px;
	border-radius: 12px;
	margin-bottom: 24px;
}

.record-info {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 16px;
}

.info-item {
	display: flex;
	align-items: center;
	gap: 8px;
}

.info-label {
	font-weight: 500;
	color: #64748b;
}

.info-value {
	font-weight: 600;
	color: #1e293b;
}

.user-detail {
	display: flex;
	align-items: center;
	gap: 8px;
}

.section-title {
	font-size: 16px;
	font-weight: 600;
	color: #1e293b;
	margin-bottom: 16px;
	padding-bottom: 8px;
	border-bottom: 2px solid #e2e8f0;
}

.section-title--video {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-bottom: 12px;
}

.section-title-icon {
	font-size: 20px;
	color: #6366f1;
}

.video-section {
	margin-bottom: 24px;
}

.video-player-container {
	position: relative;
	border-radius: 14px;
	overflow: hidden;
	background: #020617;
	border: 1px solid rgba(148, 163, 184, 0.18);
	box-shadow:
		0 4px 6px rgba(0, 0, 0, 0.06),
		0 16px 48px rgba(15, 23, 42, 0.35);
}

.video-aspect-frame {
	aspect-ratio: 16 / 9;
	width: 100%;
	max-height: min(68vh, 640px);
	margin: 0 auto;
	background: radial-gradient(120% 90% at 50% 20%, #1e293b 0%, #020617 60%);
	display: flex;
	align-items: center;
	justify-content: center;
}

.detail-video {
	width: 100%;
	height: 100%;
	max-height: min(68vh, 640px);
	object-fit: contain;
	object-position: center;
	outline: none;
	background: #000;

	&::-webkit-media-controls-panel {
		background: linear-gradient(transparent, rgba(2, 6, 23, 0.92));
	}
}

.video-loading {
	position: absolute;
	inset: 0;
	background: rgba(2, 6, 23, 0.88);
	backdrop-filter: blur(4px);
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #e2e8f0;
	gap: 12px;
	z-index: 2;
}

.loading-icon {
	font-size: 32px;
	animation: spin 1s linear infinite;
}

@keyframes spin {
	from { transform: rotate(0deg); }
	to { transform: rotate(360deg); }
}

.detection-data {
	margin-top: 24px;
}

.stats-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	gap: 16px;
}

.stat-card {
	background: white;
	padding: 20px;
	border-radius: 12px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	display: flex;
	align-items: center;
	gap: 16px;
	transition: transform 0.3s ease;
	
	&:hover {
		transform: translateY(-2px);
	}
}

.stat-icon {
	font-size: 32px;
	width: 60px;
	height: 60px;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12px;
}

.detection-count {
	background: linear-gradient(135deg, #fef3c7 0%, #f59e0b 100%);
}

.confidence-avg {
	background: linear-gradient(135deg, #dbeafe 0%, #3b82f6 100%);
}

.duration {
	background: linear-gradient(135deg, #dcfce7 0%, #16a34a 100%);
}

.stat-content {
	flex: 1;
}

.stat-value {
	font-size: 24px;
	font-weight: 700;
	color: #1e293b;
	margin-bottom: 4px;
}

.stat-label {
	font-size: 14px;
	color: #64748b;
}

:deep(.confirm-delete-btn) {
	background: #ef4444;
	border: none;
	
	&:hover {
		background: #dc2626;
	}
}
</style>