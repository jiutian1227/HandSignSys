<template>
	<div class="detection-history-container">
		<div class="history-content">
			<div class="search-panel">
				<div class="search-title">视频记录筛选</div>
				<div class="search-controls">
					<div class="search-group">
						<label class="search-label">识别时间</label>
						<el-input
							v-model="state.tableData.param.search1"
							size="large"
							placeholder="请输入识别时间"
							class="search-input"
							clearable
						>
							<template #prefix>
								<el-icon><ele-Calendar /></el-icon>
							</template>
						</el-input>
					</div>
					<div class="search-group">
						<label class="search-label">最低阈值</label>
						<el-input
							v-model="state.tableData.param.search3"
							size="large"
							placeholder="请输入最低阈值"
							class="search-input"
							clearable
						>
							<template #prefix>
								<el-icon><ele-Setting /></el-icon>
							</template>
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

			<div class="table-container">
				<el-table
					:data="state.tableData.data"
					v-loading="state.tableData.loading"
					class="history-table"
					style="width: 100%"
					:fit="true"
					:header-cell-style="{ background: '#f8fafc', color: '#475569' }"
				>
					<el-table-column prop="num" label="序号" width="80" align="center">
						<template #header>
							<span class="table-header">序号</span>
						</template>
						<template #default="scope">
							<div class="serial-number">{{ scope.row.num }}</div>
						</template>
					</el-table-column>
					<el-table-column prop="inputVideo" label="原视频" min-width="200" align="center">
						<template #header>
							<span class="table-header">原视频</span>
						</template>
						<template #default="scope">
							<div class="video-wrapper">
								<video class="video-preview" controls :key="scope.row.inputVideo + uniqueKey">
									<source :src="scope.row.inputVideo" type="video/mp4" />
								</video>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="outVideo" label="处理结果" min-width="200" align="center">
						<template #header>
							<span class="table-header">处理结果</span>
						</template>
						<template #default="scope">
							<div class="video-wrapper">
								<video class="video-preview" preload="metadata" controls :key="scope.row.outVideo + uniqueKey">
									<source :src="scope.row.outVideo" type="video/mp4" />
								</video>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="weight" label="识别权重" align="center" min-width="140">
						<template #header>
							<span class="table-header">识别权重</span>
						</template>
						<template #default="scope">
							<el-tag type="info" class="model-tag">{{ scope.row.weight }}</el-tag>
						</template>
					</el-table-column>
					<el-table-column prop="conf" label="最小阈值" show-overflow-tooltip min-width="120" align="center">
						<template #header>
							<span class="table-header">最小阈值</span>
						</template>
						<template #default="scope">
							<div class="confidence-value">{{ scope.row.conf }}</div>
						</template>
					</el-table-column>
					<el-table-column prop="username" label="识别用户" show-overflow-tooltip align="center" min-width="120">
						<template #header>
							<span class="table-header">识别用户</span>
						</template>
						<template #default="scope">
							<div class="user-info">
								<span class="username">{{ scope.row.username }}</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="startTime" label="识别时间" show-overflow-tooltip align="center" min-width="180">
						<template #header>
							<span class="table-header">识别时间</span>
						</template>
						<template #default="scope">
							<div class="time-display">
								<el-icon class="time-icon"><Clock /></el-icon>
								{{ scope.row.startTime }}
							</div>
						</template>
					</el-table-column>
					<el-table-column label="操作" min-width="200" align="center" fixed="right">
						<template #header>
							<span class="table-header">操作</span>
						</template>
						<template #default="scope">
							<div class="action-buttons">
								<el-button size="small" type="primary" class="detail-btn" @click="show(scope.row)">
									<el-icon><ele-View /></el-icon>
									详情
								</el-button>
								<el-button size="small" text type="danger" class="delete-btn" @click="onRowDel(scope.row)">
									<el-icon><ele-Delete /></el-icon>
									删除
								</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>

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
						class="custom-pagination"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="videoRecords">
import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import { Clock } from '@element-plus/icons-vue';
import request from '/@/utils/request';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';

const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

const state = reactive<SysRoleState>({
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
});

const uniqueKey = ref(0);

const getTableData = () => {
	state.tableData.loading = true;
	if (userInfos.value.userName != 'admin') {
		state.tableData.param.search = userInfos.value.userName;
	}
	request
		.get('/api/videoRecords', {
			params: state.tableData.param,
		})
		.then((res) => {
			if (res.code === '200') {
				state.tableData.data = [];
				setTimeout(() => {
					state.tableData.loading = false;
				}, 500);
				for (let i = 0; i < res.data.records.length; i++) {
					state.tableData.data[i] = res.data.records[i];
					state.tableData.data[i]['num'] = i + 1;
				}
				state.tableData.total = res.data.total;

				uniqueKey.value++;
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
};

const show = (row: any) => {
	window.open('http://localhost:8888/#/videoShow?id=' + row.id);
};

const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该视频记录，是否继续?`, '删除确认', {
		confirmButtonText: '确认删除',
		cancelButtonText: '取消',
		type: 'warning',
		confirmButtonClass: 'confirm-delete-btn',
	})
		.then(() => {
			request.delete('/api/videoRecords/' + row.id).then((res) => {
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
		.catch(() => {});
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
	border: 1px solid rgba(148, 163, 184, 0.2);
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
	width: 220px;

	:deep(.el-input__wrapper) {
		border-radius: 10px;
		box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
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
	min-height: 0;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 16px;
	padding: 24px;
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
	display: flex;
	flex-direction: column;
	border: 1px solid rgba(148, 163, 184, 0.2);
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
		transition: all 0.2s ease;

		&:hover {
			box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
		}
	}
}

.table-header {
	font-weight: 600;
	color: #475569;
}

.serial-number {
	font-weight: 600;
	color: #475569;
}

.video-wrapper {
	padding: 8px;
	background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
	border-radius: 10px;
	border: 1px solid rgba(148, 163, 184, 0.25);

	.video-preview {
		width: 100%;
		height: 100px;
		border-radius: 8px;
		object-fit: cover;
		background: #0f172a;
	}
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
	flex-wrap: wrap;
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
	font-weight: 500;

	&:hover {
		background: rgba(239, 68, 68, 0.08);
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

:deep(.confirm-delete-btn) {
	background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
	border: none !important;
}
</style>
