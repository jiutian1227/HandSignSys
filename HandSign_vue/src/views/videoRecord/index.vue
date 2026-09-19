<template>
	<div class="video-record-container">
		<div class="record-main">
			<div class="search-panel">
				<div class="search-fields">
					<el-date-picker
						v-model="state.tableData.param.search1"
						type="date"
						size="default"
						placeholder="选择识别日期"
						value-format="YYYY-MM-DD"
						class="search-input search-date"
						clearable
					/>
					<el-input 
						v-model="state.tableData.param.search3" 
						size="default" 
						placeholder="请输入最低阈值"
						class="search-input"
						clearable
					>
						<template #prefix>
							<el-icon><ele-Setting /></el-icon>
						</template>
					</el-input>
					<el-button 
						size="default" 
						type="primary" 
						class="search-btn"
						@click="getTableData()"
					>
						<el-icon>
							<ele-Search />
						</el-icon>
						搜索记录
					</el-button>
				</div>
			</div>

			<div class="record-table">
				<el-table 
					:data="state.tableData.data" 
					v-loading="state.tableData.loading" 
					style="width: 100%"
					:border="true"
					:stripe="true"
					empty-text="暂无视频检测记录（需后端在视频分析完成后写入 videoRecords；非管理员仅显示本人数据）"
				>
					<el-table-column prop="num" label="序号" width="80" align="center">
						<template #header>
							<span class="table-header">序号</span>
						</template>
					</el-table-column>
					<el-table-column prop="inputVideo" label="原视频" width="200" align="center">
						<template #header>
							<span class="table-header">原视频</span>
						</template>
						<template #default="scope">
							<div class="video-wrapper">
								<video class="video-preview" controls :key="resolveFileUrl(scope.row.inputVideo) + uniqueKey">
									<source :src="resolveFileUrl(scope.row.inputVideo)" type="video/mp4" />
								</video>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="outVideo" label="处理结果" width="200" align="center">
						<template #header>
							<span class="table-header">处理结果</span>
						</template>
						<template #default="scope">
							<div class="video-wrapper">
								<video class="video-preview" preload="auto" controls :key="resolveFileUrl(scope.row.outVideo) + uniqueKey">
									<source :src="resolveFileUrl(scope.row.outVideo)" type="video/mp4" />
								</video>
							</div>
						</template>
					</el-table-column>
					<el-table-column prop="weight" label="识别权重" align="center">
						<template #header>
							<span class="table-header">识别权重</span>
						</template>
					</el-table-column>
					<el-table-column prop="conf" label="最小阈值" show-overflow-tooltip width="120" align="center">
						<template #header>
							<span class="table-header">最小阈值</span>
						</template>
					</el-table-column>
					<el-table-column prop="username" label="识别用户" show-overflow-tooltip align="center">
						<template #header>
							<span class="table-header">识别用户</span>
						</template>
					</el-table-column>
					<el-table-column prop="startTime" label="识别时间" width="190" align="center" class-name="time-column">
						<template #header>
							<span class="table-header">识别时间</span>
						</template>
						<template #default="scope">
							<span class="time-text">{{ scope.row.startTime || '-' }}</span>
						</template>
					</el-table-column>
					<el-table-column label="操作" width="200" align="center" fixed="right">
						<template #header>
							<span class="table-header">操作</span>
						</template>
						<template #default="scope">
							<div class="action-buttons">
								<el-button 
									size="small" 
									class="action-btn detail-btn"
									@click="show(scope.row)"
								>
									<el-icon><ele-View /></el-icon>
									详情
								</el-button>
								<el-button 
									size="small" 
									class="action-btn delete-btn"
									@click="onRowDel(scope.row)"
								>
									<el-icon><ele-Delete /></el-icon>
									删除
								</el-button>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>

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
				>
				</el-pagination>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="videoRecords">
import { reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { resolveFileUrl } from '/@/utils/resolveFileUrl';
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

// 唯一标识符，动态刷新
const uniqueKey = ref(0);

/** 兼容 Spring 分页：records / records / content / list / rows 等 */
const extractVideoRecordRows = (res: any): { rows: any[]; total: number } => {
	const d = res?.data;
	if (Array.isArray(d)) return { rows: d, total: Number(res?.total) || d.length };
	if (d && typeof d === 'object') {
		const rows = d.records ?? d.list ?? d.content ?? d.rows ?? [];
		const total = d.total ?? d.totalElements ?? d.totalCount ?? (Array.isArray(rows) ? rows.length : 0);
		return { rows: Array.isArray(rows) ? rows : [], total: Number(total) || 0 };
	}
	return { rows: [], total: 0 };
};

const isRecordsResponseOk = (res: any) => {
	const code = res?.code;
	if (code === '200' || code === 200 || code === 0 || code === '0') return true;
	if (res?.success === true) return true;
	if (Array.isArray(res?.data)) return true;
	if (res?.data && typeof res.data === 'object') return true;
	return false;
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
		.get('/api/videoRecords', {
			params,
		})
		.then((res: any) => {
			const ok = isRecordsResponseOk(res);
			if (!ok) {
				ElMessage.error(res?.msg || res?.message || '加载视频记录失败');
				return;
			}
			const { rows, total } = extractVideoRecordRows(res);
			const visibleRows =
				isUser && currentUserName ? rows.filter((row: any) => row?.username === currentUserName) : rows;
			state.tableData.data = visibleRows.map((row: any, i: number) => ({
				...row,
				num: i + 1 + (state.tableData.param.pageNum - 1) * state.tableData.param.pageSize,
			}));
			state.tableData.total = isUser && currentUserName ? visibleRows.length : total;
			uniqueKey.value++;
		})
		.catch(() => {})
		.finally(() => {
			state.tableData.loading = false;
		});
};

const show = (row: any) => {
	const base = `${window.location.origin}${window.location.pathname}`;
	window.open(`${base}#/videoShow?id=${row.id}`);
};

const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除该视频记录，是否继续?`, '删除确认', {
		confirmButtonText: '确认删除',
		cancelButtonText: '取消',
		type: 'warning',
		confirmButtonClass: 'confirm-delete-btn',
	})
		.then(() => {
			request.delete('/api/videoRecords/' + row.id).then((res: any) => {
				if (res.code === '200' || res.code === 200) {
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
</script>

<style scoped lang="scss">
.video-record-container {
	height: 100%;
	background: transparent;
	padding: 20px;

	.record-main {
		background: var(--app-card-glass);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border: 1px solid var(--app-glass-border);
		border-radius: 12px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
		overflow: hidden;
		height: 100%;
		display: flex;
		flex-direction: column;

		.search-panel {
			padding: 24px;
			border-bottom: 1px solid #f0f2f5;
			background: linear-gradient(90deg, #fafbfc 0%, #ffffff 100%);

			.search-fields {
				display: flex;
				align-items: center;
				gap: 16px;

				.search-input {
					flex: 0 0 240px;
					
					:deep(.el-input__inner) {
						border-radius: 8px;
						border: 1px solid #e1e4e8;
						transition: all 0.3s ease;

						&:focus {
							border-color: #409eff;
							box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
						}
					}

					&.search-date {
						:deep(.el-date-editor) {
							width: 100%;
							--el-date-editor-width: 100%;
						}
					}
				}

				.search-btn {
					border-radius: 8px;
					background: linear-gradient(135deg, #409eff 0%, #3375b9 100%);
					border: none;
					padding: 0 24px;
					height: 40px;
					transition: all 0.3s ease;

					&:hover {
						transform: translateY(-1px);
						box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
					}
				}
			}
		}

		.record-table {
			flex: 1;
			padding: 0 24px;
			overflow: hidden;

			.table-header {
				font-weight: 600;
				color: #1f2d3d;
			}

			.video-wrapper {
				padding: 8px;
				background: #f8f9fa;
				border-radius: 8px;
				border: 1px solid #e9ecef;

				.video-preview {
					width: 100%;
					height: 100px;
					border-radius: 4px;
					object-fit: cover;
					background: #000;
				}
			}

			.action-buttons {
				display: flex;
				justify-content: center;
				gap: 8px;

				.action-btn {
					border-radius: 6px;
					border: none;
					padding: 6px 12px;
					transition: all 0.3s ease;

					&.detail-btn {
						background: linear-gradient(135deg, #67c23a 0%, #529b2e 100%);
						color: white;

						&:hover {
							background: linear-gradient(135deg, #5daf34 0%, #478829 100%);
							transform: translateY(-1px);
						}
					}

					&.delete-btn {
						background: linear-gradient(135deg, #f56c6c 0%, #d64545 100%);
						color: white;

						&:hover {
							background: linear-gradient(135deg, #e64545 0%, #c13c3c 100%);
							transform: translateY(-1px);
						}
					}
				}
			}

			:deep(.el-table) {
				border-radius: 8px;
				overflow: hidden;

				th {
					background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
					color: #1f2d3d;
					font-weight: 600;
				}

				tr:hover td {
					background: #f8f9fa;
				}
			}

			:deep(.time-column .cell) {
				white-space: nowrap;
			}

			.time-text {
				display: inline-block;
				white-space: nowrap;
			}
		}

		.pagination-container {
			padding: 20px 24px;
			border-top: 1px solid #f0f2f5;
			background: #fafbfc;
			display: flex;
			justify-content: center;
		}
	}
}

:deep(.confirm-delete-btn) {
	background: linear-gradient(135deg, #f56c6c 0%, #d64545 100%) !important;
	border: none !important;
}
</style>