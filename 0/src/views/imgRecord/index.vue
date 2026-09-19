<template>
	<div class="recognition-container">
		<div class="recognition-content">
			<!-- 搜索区域 -->
			<div class="search-section">
				<el-card shadow="hover" class="search-card">
					<div class="search-header">
						<h3>识别记录筛选</h3>
						<el-button type="primary" @click="getTableData()" class="refresh-btn">
							<el-icon><ele-Refresh /></el-icon>
							刷新数据
						</el-button>
					</div>
					<div class="search-controls">
						<div class="search-inputs">
							<el-input 
								v-model="state.tableData.param.search1" 
								size="default" 
								placeholder="请输入识别时间"
								class="search-field"
								clearable>
								<template #prefix>
									<el-icon><ele-Calendar /></el-icon>
								</template>
							</el-input>
							<el-input 
								v-model="state.tableData.param.search2" 
								size="default" 
								placeholder="请输入识别结果"
								class="search-field"
								clearable>
								<template #prefix>
									<el-icon><ele-Search /></el-icon>
								</template>
							</el-input>
						</div>
						<el-button 
							size="default" 
							type="primary" 
							class="search-btn" 
							@click="getTableData()">
							<el-icon><ele-Filter /></el-icon>
							筛选结果
						</el-button>
					</div>
				</el-card>
			</div>
			
			<!-- 数据表格区域 -->
			<div class="data-section">
				<el-card shadow="hover" class="table-card">
					<template #header>
						<div class="table-header">
							<span>识别记录列表</span>
							<div class="table-stats">
								<el-tag type="info">共 {{ state.tableData.total }} 条记录</el-tag>
							</div>
						</div>
					</template>
					
					<el-table 
						:data="state.tableData.data" 
						style="width: 100%" 
						class="recognition-table"
						v-loading="state.tableData.loading">
						<el-table-column type="expand">
							<template #default="props">
								<div class="detail-panel">
									<h4 class="detail-title">详细识别结果</h4>
									<el-table 
										:data="props.row.family" 
										class="nested-table"
										empty-text="暂无详细数据">
										<el-table-column prop="label" label="识别结果" align="center" />
										<el-table-column prop="confidence" label="置信度" show-overflow-tooltip align="center">
											<template #default="scope">
												<el-progress 
													:text-inside="true" 
													:stroke-width="20" 
													:percentage="Math.round(scope.row.confidence * 100)" 
													:status="getConfidenceStatus(scope.row.confidence)"
													style="width: 120px; margin: 0 auto;" />
											</template>
										</el-table-column>
										<el-table-column prop="startTime" label="识别时间" align="center" />
									</el-table>
								</div>
							</template>
						</el-table-column>
						<el-table-column prop="num" label="序号" width="80" align="center" />
						<el-table-column prop="inputImg" label="原始图片" width="120" align="center">
							<template #default="scope">
								<div class="img-wrapper" @click="previewImage(scope.row.inputImg, '原始图片')">
									<img :src="resolveFileUrl(scope.row.inputImg)" alt="原始图片" />
									<div class="img-overlay">
										<el-icon><ele-ZoomIn /></el-icon>
									</div>
								</div>
							</template>
						</el-table-column>
						<el-table-column prop="outImg" label="预测图片" width="120" align="center">
							<template #default="scope">
								<div class="img-wrapper" @click="previewImage(scope.row.outImg, '预测图片')">
									<img :src="resolveFileUrl(scope.row.outImg)" alt="预测图片" />
									<div class="img-overlay">
										<el-icon><ele-ZoomIn /></el-icon>
									</div>
								</div>
							</template>
						</el-table-column>
						<el-table-column prop="weight" label="识别权重" show-overflow-tooltip align="center">
							<template #default="scope">
								<el-tag v-if="scope.row.weight" type="success">{{ scope.row.weight }}</el-tag>
								<span v-else class="empty-text">-</span>
							</template>
						</el-table-column>
						<el-table-column prop="conf" label="最小阈值" show-overflow-tooltip align="center">
							<template #default="scope">
								<el-tag v-if="scope.row.conf" type="warning">{{ scope.row.conf }}</el-tag>
								<span v-else class="empty-text">-</span>
							</template>
						</el-table-column>
						<!-- 原 AI 助手与 AI 建议列移除，保留纯模型识别信息 -->
						<el-table-column prop="startTime" label="识别时间" width="180" align="center" />
						<el-table-column prop="username" label="识别用户" show-overflow-tooltip align="center">
							<template #default="scope">
								<el-tag v-if="scope.row.username" type="primary">{{ scope.row.username }}</el-tag>
								<span v-else class="empty-text">-</span>
							</template>
						</el-table-column>
						<el-table-column label="操作" width="180" fixed="right" align="center">
							<template #default="scope">
								<div class="action-buttons">
									<el-button 
										size="small" 
										type="primary" 
										@click="onViewDetail(scope.row)"
										class="view-btn">
										<el-icon><ele-View /></el-icon>
										详情
									</el-button>
									<el-button 
										size="small" 
										type="danger" 
										@click="onRowDel(scope.row)" 
										class="delete-btn">
										<el-icon><ele-Delete /></el-icon>
										删除
									</el-button>
								</div>
							</template>
						</el-table-column>
					</el-table>
					
					<!-- 分页 -->
					<el-pagination 
						@size-change="onHandleSizeChange" 
						@current-change="onHandleCurrentChange" 
						class="pagination-bar"
						:pager-count="5" 
						:page-sizes="[10, 20, 30]" 
						v-model:current-page="state.tableData.param.pageNum"
						background 
						v-model:page-size="state.tableData.param.pageSize"
						layout="total, sizes, prev, pager, next, jumper" 
						:total="state.tableData.total">
					</el-pagination>
				</el-card>
			</div>
		</div>
		
		<!-- 详情弹窗 -->
		<el-dialog 
			v-model="state.detailDialog.visible" 
			:title="state.detailDialog.title" 
			width="800px"
			align-center
			class="detail-dialog">
			<div class="detail-content" v-if="state.detailDialog.data">
				<div class="detail-section">
					<h3 class="section-title">图片信息</h3>
					<div class="image-comparison">
						<div class="image-item">
							<p class="image-label">原始图片</p>
							<img :src="resolveFileUrl(state.detailDialog.data.inputImg)" alt="原始图片" class="detail-image" />
						</div>
						<div class="image-item">
							<p class="image-label">预测图片</p>
							<img :src="resolveFileUrl(state.detailDialog.data.outImg)" alt="预测图片" class="detail-image" />
						</div>
					</div>
				</div>
				
				<div class="detail-section">
					<h3 class="section-title">识别参数</h3>
					<el-descriptions :column="2" border>
						<el-descriptions-item label="识别权重">
							<el-tag v-if="state.detailDialog.data.weight" type="success">
								{{ state.detailDialog.data.weight }}
							</el-tag>
							<span v-else class="empty-text">-</span>
						</el-descriptions-item>
						<el-descriptions-item label="最小阈值">
							<el-tag v-if="state.detailDialog.data.conf" type="warning">
								{{ state.detailDialog.data.conf }}
							</el-tag>
							<span v-else class="empty-text">-</span>
						</el-descriptions-item>
						<el-descriptions-item label="识别用户">
							<el-tag v-if="state.detailDialog.data.username" type="primary">
								{{ state.detailDialog.data.username }}
							</el-tag>
							<span v-else class="empty-text">-</span>
						</el-descriptions-item>
						<el-descriptions-item label="识别时间" :span="2">
							{{ state.detailDialog.data.startTime || '-' }}
						</el-descriptions-item>
					</el-descriptions>
				</div>
				
				<div class="detail-section">
					<h3 class="section-title">详细识别结果</h3>
					<el-table 
						:data="state.detailDialog.data.family" 
						class="detail-table"
						empty-text="暂无详细数据">
						<el-table-column prop="label" label="识别结果" align="center" />
						<el-table-column prop="confidence" label="置信度" align="center" width="150">
							<template #default="scope">
								<div class="confidence-cell">
									<el-progress 
										:text-inside="true" 
										:stroke-width="20" 
										:percentage="Math.round(scope.row.confidence * 100)" 
										:status="getConfidenceStatus(scope.row.confidence)"
										style="width: 120px;" />
									<span class="confidence-value">{{ (scope.row.confidence * 100).toFixed(1) }}%</span>
								</div>
							</template>
						</el-table-column>
						<el-table-column prop="startTime" label="识别时间" align="center" width="180" />
					</el-table>
				</div>
			</div>
			
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="state.detailDialog.visible = false">关闭</el-button>
					<el-button type="primary" @click="state.detailDialog.visible = false">
						确定
					</el-button>
				</span>
			</template>
		</el-dialog>
		
		<!-- 图片预览弹窗 -->
		<el-dialog 
			v-model="state.previewDialog.visible" 
			:title="state.previewDialog.title" 
			width="60%"
			align-center
			class="image-preview-dialog">
			<div class="preview-content">
				<img :src="state.previewDialog.imageUrl" :alt="state.previewDialog.title" class="preview-image" />
			</div>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import { reactive, onMounted } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { resolveFileUrl } from '/@/utils/resolveFileUrl';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';

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
			search2: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
	detailDialog: {
		visible: false,
		title: '识别记录详情',
		data: null as any,
	},
	previewDialog: {
		visible: false,
		title: '',
		imageUrl: '',
	},
});

const safeParseJsonArray = (value: any): any[] => {
	if (Array.isArray(value)) return value;
	if (typeof value !== 'string' || !value.trim()) return [];
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
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
const extractImgRecordRows = (res: any): { rows: any[]; total: number } => {
	const d = res?.data;
	if (Array.isArray(d)) return { rows: d, total: Number(res?.total) || d.length };
	if (d && typeof d === 'object') {
		const rows = d.records ?? d.list ?? d.content ?? d.rows ?? [];
		const total = d.total ?? d.totalElements ?? d.totalCount ?? (Array.isArray(rows) ? rows.length : 0);
		return { rows: Array.isArray(rows) ? rows : [], total: Number(total) || 0 };
	}
	return { rows: [], total: 0 };
};

// 获取表格数据
const getTableData = () => {
	state.tableData.loading = true;
	const isUser = userInfos.value.role === 'user';
	const currentUserName = userInfos.value.userName || '';
	const params = {
		...state.tableData.param,
		...(isUser && currentUserName ? { username: currentUserName } : {}),
	};
	request
		.get('/api/imgRecords', {
			params,
		})
		.then((res: any) => {
			if (!isRecordsResponseOk(res)) {
				ElMessage.error(res?.msg || res?.message || '加载图像记录失败');
				return;
			}
			const { rows, total } = extractImgRecordRows(res);
			const visibleRows =
				isUser && currentUserName ? rows.filter((row: any) => row?.username === currentUserName) : rows;
			state.tableData.data = visibleRows.map((row: any, i: number) => {
				const confidences = safeParseJsonArray(row?.confidence);
				const labels = safeParseJsonArray(row?.label);
				const transformedData = transformData(row, confidences, labels);
				transformedData.num = i + 1 + (state.tableData.param.pageNum - 1) * state.tableData.param.pageSize;
				return transformedData;
			});
			state.tableData.total = isUser && currentUserName ? visibleRows.length : total;
		})
		.catch(() => {})
		.finally(() => {
			state.tableData.loading = false;
		});
};

// 数据转换
const transformData = (originalData: any, confidences: any, labels: any) => {
    const family = labels.map((label: string, index: number) => ({
        label: label,
        confidence: confidences[index],
        startTime: originalData.startTime
    }));

    const result = {
		id: originalData.id,
        inputImg: originalData.inputImg,
        outImg: originalData.outImg,
        weight: originalData.weight,
        allTime: originalData.allTime,
        conf: originalData.conf,
        startTime: originalData.startTime,
        username: originalData.username,
		ai: originalData.ai,
		suggestion: originalData.suggestion,
        family: family
    };

    return result;
}

// 查看详情
const onViewDetail = (row: any) => {
	state.detailDialog.data = row;
	state.detailDialog.visible = true;
};

// 图片预览
const previewImage = (imageUrl: string, title: string) => {
	state.previewDialog.imageUrl = resolveFileUrl(imageUrl);
	state.previewDialog.title = title;
	state.previewDialog.visible = true;
};

// 获取置信度状态
const getConfidenceStatus = (confidence: number) => {
	if (confidence >= 0.8) return 'success';
	if (confidence >= 0.6) return 'warning';
	return 'exception';
};

// 删除记录
const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该识别记录，是否继续?`, '提示', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
	.then(() => {
		request.delete('/api/imgRecords/' + row.id).then((res) => {
			if (res.code === '200') {
				ElMessage({
					type: 'success',
					message: '删除成功！',
				});
				getTableData();
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
	})
	.catch(() => {});
};

// 分页改变
const onHandleSizeChange = (val: number) => {
	state.tableData.param.pageSize = val;
	getTableData();
};

// 分页改变
const onHandleCurrentChange = (val: number) => {
	state.tableData.param.pageNum = val;
	getTableData();
};

// 页面加载时
onMounted(() => {
	getTableData();
});
</script>

<style scoped lang="scss">
.recognition-container {
	padding: 20px;
	background: transparent;
	min-height: calc(100vh - 84px);
	
	.recognition-content {
		max-width: 100%;
		margin: 0 auto;
	}
	
	.search-section {
		margin-bottom: 20px;
		
		.search-card {
			border-radius: 12px;
			border: none;
			
			:deep(.el-card__body) {
				padding: 20px;
			}
			
			.search-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 16px;
				
				h3 {
					margin: 0;
					color: #303133;
					font-size: 16px;
					font-weight: 600;
				}
				
				.refresh-btn {
					background: #409EFF;
					border: none;
					border-radius: 6px;
				}
			}
			
			.search-controls {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 16px;
				
				.search-inputs {
					display: flex;
					gap: 12px;
					flex: 1;
					
					.search-field {
						flex: 1;
						max-width: 300px;
						
						:deep(.el-input__wrapper) {
							border-radius: 8px;
						}
					}
				}
				
				.search-btn {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					border: none;
					border-radius: 8px;
					padding: 0 20px;
					height: 36px;
					
					&:hover {
						background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
						transform: translateY(-1px);
						box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
					}
				}
			}
		}
	}
	
	.data-section {
		.table-card {
			border-radius: 12px;
			border: none;
			
			:deep(.el-card__header) {
				border-bottom: 1px solid #f0f0f0;
				padding: 16px 20px;
				background: #fafafa;
			}
			
			.table-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				
				span {
					font-size: 16px;
					font-weight: 600;
					color: #303133;
				}
			}
		}
		
		.recognition-table {
			:deep(th) {
				background: #f8fafc;
				color: #374151;
				font-weight: 600;
				border-bottom: 1px solid #e5e7eb;
			}
			
			:deep(td) {
				border-bottom: 1px solid #f1f5f9;
			}
			
			:deep(.el-table__row:hover) {
				background: #f8fafc;
			}
			
			.img-wrapper {
				position: relative;
				display: flex;
				justify-content: center;
				align-items: center;
				padding: 4px;
				cursor: pointer;
				border-radius: 6px;
				overflow: hidden;
				
				&:hover {
					.img-overlay {
						opacity: 1;
					}
					
					img {
						transform: scale(1.05);
					}
				}
				
				img {
					width: 100px;
					height: 70px;
					object-fit: cover;
					border-radius: 4px;
					border: 1px solid #e5e7eb;
					transition: transform 0.3s ease;
				}
				
				.img-overlay {
					position: absolute;
					top: 0;
					left: 0;
					right: 0;
					bottom: 0;
					background: rgba(0, 0, 0, 0.5);
					display: flex;
					justify-content: center;
					align-items: center;
					opacity: 0;
					transition: opacity 0.3s ease;
					
					.el-icon {
						color: white;
						font-size: 24px;
					}
				}
			}
			
			.suggestion-cell {
				max-width: 200px;
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}
			
			.empty-text {
				color: #909399;
				font-style: italic;
			}
			
			.action-buttons {
				display: flex;
				gap: 8px;
				justify-content: center;
				
				.view-btn, .delete-btn {
					border-radius: 4px;
				}
			}
		}
		
		.detail-panel {
			padding: 16px;
			background: #f8fafc;
			border-radius: 8px;
			margin: 8px;
			
			.detail-title {
				margin: 0 0 12px 0;
				color: #374151;
				font-size: 15px;
				font-weight: 600;
			}
			
			.nested-table {
				background: white;
				border-radius: 6px;
				overflow: hidden;
				
				:deep(th) {
					background: #f1f5f9;
				}
				
				.confidence-cell {
					display: flex;
					align-items: center;
					justify-content: center;
					gap: 8px;
				}
			}
		}
		
		.pagination-bar {
			margin-top: 20px;
			justify-content: center;
			padding: 16px;
		}
	}
	
	// 详情弹窗样式
	.detail-dialog {
		.detail-content {
			max-height: 60vh;
			overflow-y: auto;
			padding-right: 8px;
			
			.detail-section {
				margin-bottom: 24px;
				
				.section-title {
					font-size: 16px;
					font-weight: 600;
					margin-bottom: 12px;
					color: #303133;
					padding-bottom: 8px;
					border-bottom: 1px solid #f0f0f0;
				}
			}
			
			.image-comparison {
				display: flex;
				gap: 20px;
				justify-content: center;
				
				.image-item {
					text-align: center;
					
					.image-label {
						margin-bottom: 8px;
						font-weight: 500;
						color: #606266;
					}
					
					.detail-image {
						width: 300px;
						height: 200px;
						object-fit: cover;
						border-radius: 8px;
						border: 1px solid #e5e7eb;
					}
				}
			}
			
			.suggestion-card {
				background: #f8f9fa;
				border: 1px solid #e9ecef;
				
				.suggestion-content {
					line-height: 1.6;
					color: #495057;
				}
			}
			
			.detail-table {
				:deep(th) {
					background: #f8f9fa;
				}
				
				.confidence-cell {
					display: flex;
					align-items: center;
					gap: 8px;
					
					.confidence-value {
						font-weight: 500;
						color: #409EFF;
					}
				}
			}
		}
	}
	
	// 图片预览弹窗样式
	.image-preview-dialog {
		.preview-content {
			display: flex;
			justify-content: center;
			align-items: center;
			
			.preview-image {
				max-width: 100%;
				max-height: 70vh;
				object-fit: contain;
				border-radius: 8px;
			}
		}
	}
}

@media (max-width: 768px) {
	.recognition-container {
		padding: 12px;
		
		.search-section {
			.search-card {
				.search-controls {
					flex-direction: column;
					align-items: stretch;
					
					.search-inputs {
						flex-direction: column;
						
						.search-field {
							max-width: 100%;
						}
					}
				}
			}
		}
		
		.data-section {
			.recognition-table {
				:deep(.el-table) {
					overflow-x: auto;
				}
			}
		}
		
		.detail-dialog {
			.image-comparison {
				flex-direction: column;
				align-items: center;
			}
		}
	}
}
</style>