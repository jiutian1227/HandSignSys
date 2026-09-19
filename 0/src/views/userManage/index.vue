<template>
	<div class="user-management-container">
		<!-- 统计卡片 -->
		<div class="statistics-cards">
			<el-row :gutter="20">
				<el-col :xs="12" :sm="6">
					<div class="stat-card total-users">
						<div class="stat-icon">
							<el-icon><User /></el-icon>
						</div>
						<div class="stat-content">
							<div class="stat-value">{{ statistics.totalUsers }}</div>
							<div class="stat-label">总用户数</div>
						</div>
					</div>
				</el-col>
				<el-col :xs="12" :sm="6">
					<div class="stat-card admin-users">
						<div class="stat-icon">
							<el-icon><Avatar /></el-icon>
						</div>
						<div class="stat-content">
							<div class="stat-value">{{ statistics.adminUsers }}</div>
							<div class="stat-label">管理员</div>
						</div>
					</div>
				</el-col>
				<el-col :xs="12" :sm="6">
					<div class="stat-card common-users">
						<div class="stat-icon">
							<el-icon><User /></el-icon>
						</div>
						<div class="stat-content">
							<div class="stat-value">{{ statistics.commonUsers }}</div>
							<div class="stat-label">普通用户</div>
						</div>
					</div>
				</el-col>
				<el-col :xs="12" :sm="6">
					<div class="stat-card other-users">
						<div class="stat-icon">
							<el-icon><UserFilled /></el-icon>
						</div>
						<div class="stat-content">
							<div class="stat-value">{{ statistics.otherUsers }}</div>
							<div class="stat-label">其他用户</div>
						</div>
					</div>
				</el-col>
			</el-row>
		</div>

		<!-- 操作区域 -->
		<div class="operation-panel">
			<div class="search-section">
				<el-input
					v-model="state.tableData.param.search"
					size="default"
					placeholder="请输入用户名、姓名或邮箱"
					class="search-input"
					clearable
					@clear="getTableData"
					@keyup.enter="getTableData"
				>
					<template #prefix>
						<el-icon><Search /></el-icon>
					</template>
				</el-input>
				
				<el-button 
					size="default" 
					type="primary" 
					class="search-btn"
					@click="getTableData"
				>
					<el-icon><Search /></el-icon>
					查询
				</el-button>
				
				<el-button 
					size="default" 
					@click="resetSearch"
				>
					<el-icon><Refresh /></el-icon>
					重置
				</el-button>
			</div>
			
			<div class="action-section">
				<el-button 
					size="default" 
					type="success" 
					class="add-btn"
					@click="onOpenAddRole('add')"
				>
					<el-icon><Plus /></el-icon>
					添加用户
				</el-button>
			</div>
		</div>

		<!-- 用户表格 -->
		<div class="table-container">
			<el-table 
				:data="state.tableData.data" 
				v-loading="state.tableData.loading"
				style="width: 100%"
			>
				<el-table-column prop="num" label="序号" width="80" align="center" />
				<el-table-column prop="username" label="账号" show-overflow-tooltip width="120" align="center">
					<template #default="scope">
						<div class="username-cell">
							<el-avatar :size="30" :src="resolveFileUrl(scope.row.avatar)" class="user-avatar" />
							<span class="username-text">{{ scope.row.username }}</span>
						</div>
					</template>
				</el-table-column>
				<el-table-column prop="name" label="姓名" show-overflow-tooltip width="100" align="center"></el-table-column>
				<el-table-column prop="sex" label="性别" show-overflow-tooltip width="80" align="center">
					<template #default="scope">
						<el-tag 
							:type="scope.row.sex === '男' ? 'primary' : 'danger'" 
							size="small"
						>
							{{ scope.row.sex }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="email" label="邮箱" show-overflow-tooltip align="center" />
				<el-table-column prop="tel" label="手机号码" show-overflow-tooltip align="center"></el-table-column>
				<el-table-column prop="role" label="角色" show-overflow-tooltip align="center">
					<template #default="scope">
						<el-tag 
							:type="getRoleTagType(scope.row.role)" 
							effect="light"
						>
							{{ scope.row.role }}
						</el-tag>
					</template>
				</el-table-column>
				<el-table-column prop="createTime" label="创建时间" width="140" align="center">
					<template #default="scope">
						{{ formatDate(scope.row.createTime) }}
					</template>
				</el-table-column>
				<el-table-column label="操作" width="150" fixed="right" align="center">
					<template #default="scope">
						<div class="action-btn-group">
							<el-button 
								size="small" 
								text 
								type="primary" 
								@click="onOpenEditRole('edit', scope.row)"
								class="action-btn"
							>
								<el-icon><Edit /></el-icon>
								编辑
							</el-button>
							<el-button 
								size="small" 
								text 
								type="danger" 
								@click="onRowDel(scope.row)"
								class="action-btn"
							>
								<el-icon><Delete /></el-icon>
								删除
							</el-button>
						</div>
					</template>
				</el-table-column>
			</el-table>
			
			<!-- 分页 -->
			<div class="pagination-container">
				<el-pagination
					@size-change="onHandleSizeChange"
					@current-change="onHandleCurrentChange"
					:pager-count="5"
					:page-sizes="[10, 20, 30, 50]"
					v-model:current-page="state.tableData.param.pageNum"
					background
					v-model:page-size="state.tableData.param.pageSize"
					layout="total, sizes, prev, pager, next, jumper"
					:total="state.tableData.total"
				>
				</el-pagination>
			</div>
		</div>

		<!-- 用户对话框 -->
		<RoleDialog ref="roleDialogRef" @refresh="getTableData()" />
	</div>
</template>

<script setup lang="ts" name="systemRole">
import { defineAsyncComponent, reactive, onMounted, ref } from 'vue';
import { ElMessageBox, ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { resolveFileUrl } from '/@/utils/resolveFileUrl';
import { 
	User, 
	UserFilled, 
	Avatar, 
	Search, 
	Plus, 
	Edit,
	Delete,
	Refresh
} from '@element-plus/icons-vue';

// 引入组件
const RoleDialog = defineAsyncComponent(() => import('./dialog.vue'));

// 定义变量内容
const roleDialogRef = ref();

// 统计信息
const statistics = reactive({
	totalUsers: 0,
	adminUsers: 0,
	commonUsers: 0,
	otherUsers: 0
});

const state = reactive({
	tableData: {
		data: [] as any,
		total: 0,
		loading: false,
		param: {
			search: '',
			pageNum: 1,
			pageSize: 10,
		},
	},
});

// 获取表格数据
const getTableData = () => {
	state.tableData.loading = true;
	
	// 构建请求参数
	const params: any = {
		pageNum: state.tableData.param.pageNum,
		pageSize: state.tableData.param.pageSize,
	};
	
	// 添加搜索参数
	if (state.tableData.param.search) {
		params.search = state.tableData.param.search;
	}
	
	request
		.get('/api/user', { params })
		.then((res) => {
			if (res.code === '200') {
				state.tableData.data = [];
				setTimeout(() => {
					state.tableData.loading = false;
				}, 500);
				
				// 处理数据
				processTableData(res.data.records);
				state.tableData.total = res.data.total;
				
				// 更新统计信息
				updateStatistics();
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
				state.tableData.loading = false;
			}
		})
		.catch((error) => {
			console.error('获取用户数据失败:', error);
			state.tableData.loading = false;
			ElMessage({
				type: 'error',
				message: '获取用户数据失败',
			});
		});
};

// 处理表格数据
const processTableData = (records: any[]) => {
	state.tableData.data = records.map((item, index) => {
		const num = (state.tableData.param.pageNum - 1) * state.tableData.param.pageSize + index + 1;
		
		// 角色转换
		let roleDisplay = item.role;
		if (item.role === 'admin') {
			roleDisplay = '管理员';
		} else if (item.role === 'user') {
			roleDisplay = '普通用户';
		} else if (item.role === 'others') {
			roleDisplay = '其他用户';
		}
		
		// 添加创建时间（模拟数据）
		let createTime = item.createTime;
		if (!createTime) {
			const randomDays = Math.floor(Math.random() * 365);
			const date = new Date();
			date.setDate(date.getDate() - randomDays);
			createTime = date.toISOString();
		}
		
		return {
			...item,
			num,
			role: roleDisplay,
			roleValue: item.role, // 保存原始角色值用于统计
			createTime
		};
	});
};

// 重置搜索
const resetSearch = () => {
	state.tableData.param.search = '';
	state.tableData.param.pageNum = 1;
	getTableData();
};

// 更新统计信息
const updateStatistics = () => {
	// 重新请求统计数据或基于当前数据计算
	request
		.get('/api/user/statistics')
		.then((res) => {
			if (res.code === '200') {
				statistics.totalUsers = res.data.totalUsers || state.tableData.total;
				statistics.adminUsers = res.data.adminUsers || state.tableData.data.filter(user => user.roleValue === 'admin').length;
				statistics.commonUsers = res.data.commonUsers || state.tableData.data.filter(user => user.roleValue === 'user').length;
				statistics.otherUsers = res.data.otherUsers || state.tableData.data.filter(user => user.roleValue === 'others').length;
			} else {
				// 如果统计接口不可用，使用表格数据计算
				calculateStatisticsFromTable();
			}
		})
		.catch(() => {
			// 如果统计接口不可用，使用表格数据计算
			calculateStatisticsFromTable();
		});
};

// 从表格数据计算统计信息
const calculateStatisticsFromTable = () => {
	// 需要获取所有数据来计算准确的统计信息
	// 这里先使用当前页数据估算
	const allUsersRequest = request.get('/api/user', { 
		params: { pageSize: 1000 } // 获取足够多的数据来计算统计
	});
	
	allUsersRequest.then((res) => {
		if (res.code === '200') {
			const allUsers = res.data.records;
			statistics.totalUsers = res.data.total;
			statistics.adminUsers = allUsers.filter(user => user.role === 'admin').length;
			statistics.commonUsers = allUsers.filter(user => user.role === 'user').length;
			statistics.otherUsers = allUsers.filter(user => user.role === 'others').length;
		} else {
			// 最后备选方案：使用当前页数据
			statistics.totalUsers = state.tableData.total;
			statistics.adminUsers = state.tableData.data.filter(user => user.roleValue === 'admin').length;
			statistics.commonUsers = state.tableData.data.filter(user => user.roleValue === 'user').length;
			statistics.otherUsers = state.tableData.data.filter(user => user.roleValue === 'others').length;
		}
	}).catch(() => {
		// 最后备选方案：使用当前页数据
		statistics.totalUsers = state.tableData.total;
		statistics.adminUsers = state.tableData.data.filter(user => user.roleValue === 'admin').length;
		statistics.commonUsers = state.tableData.data.filter(user => user.roleValue === 'user').length;
		statistics.otherUsers = state.tableData.data.filter(user => user.roleValue === 'others').length;
	});
};

// 获取角色标签类型
const getRoleTagType = (role: string) => {
	switch (role) {
		case '管理员':
			return 'danger';
		case '普通用户':
			return 'primary';
		case '其他用户':
			return 'info';
		default:
			return 'info';
	}
};

// 格式化日期
const formatDate = (dateString: string) => {
	if (!dateString) return '-';
	const date = new Date(dateString);
	return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
};

// 打开新增角色弹窗
const onOpenAddRole = (type: string) => {
	roleDialogRef.value.openDialog(type);
};

// 打开修改角色弹窗
const onOpenEditRole = (type: string, row: Object) => {
	roleDialogRef.value.openDialog(type, row);
};

// 删除角色
const onRowDel = (row: any) => {
	ElMessageBox.confirm(`此操作将永久删除用户 "${row.username}"，是否继续？`, '警告', {
		confirmButtonText: '确认',
		cancelButtonText: '取消',
		type: 'warning',
	})
	.then(() => {
		request.delete('/api/user/' + row.id).then((res) => {
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
	state.tableData.param.pageNum = 1; // 重置到第一页
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
.user-management-container {
	padding: 20px;
	background: transparent;
	min-height: calc(100vh - 40px);
}

.statistics-cards {
	margin-bottom: 24px;
	
	.stat-card {
		display: flex;
		align-items: center;
		padding: 20px;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		background: var(--app-card-glass);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid var(--app-glass-border);
		transition: transform 0.3s ease, box-shadow 0.3s ease;
		
		&:hover {
			transform: translateY(-5px);
			box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
		}
		
		.stat-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 60px;
			height: 60px;
			border-radius: 12px;
			margin-right: 16px;
			font-size: 28px;
			color: white;
		}
		
		.stat-content {
			.stat-value {
				font-size: 24px;
				font-weight: 700;
				margin-bottom: 4px;
			}
			
			.stat-label {
				font-size: 14px;
				color: #666;
			}
		}
	}
	
	.total-users .stat-icon {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	.admin-users .stat-icon {
		background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
	}
	
	.common-users .stat-icon {
		background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
	}
	
	.other-users .stat-icon {
		background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
	}
}

.operation-panel {
	background: white;
	border-radius: 12px;
	padding: 20px;
	margin-bottom: 20px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	
	.search-section {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px;
		
		.search-input {
			width: 280px;
		}
		
		.search-btn {
			background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
			border: none;
		}
	}
	
	.action-section {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 12px;
		margin-top: 16px;
		
		.add-btn {
			background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
			border: none;
		}
	}
}

.table-container {
	background: white;
	border-radius: 12px;
	padding: 20px;
	box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	
	.username-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		
		.user-avatar {
			margin-right: 8px;
		}
		
		.username-text {
			font-weight: 500;
		}
	}
	
	.action-btn-group {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	
	.action-btn {
		padding: 4px 8px;
		min-width: 60px;
		justify-content: center;
	}
}

.pagination-container {
	display: flex;
	justify-content: flex-end;
	margin-top: 20px;
}

:deep(.el-table .el-table__row:hover) {
	background-color: #f0f7ff;
}

:deep(.el-table .el-table__cell) {
	padding: 12px 0;
}

:deep(.el-button) {
	border-radius: 6px;
	font-weight: 500;
}

:deep(.el-tag) {
	border-radius: 12px;
	font-weight: 500;
}

@media (max-width: 768px) {
	.user-management-container {
		padding: 10px;
	}
	
	.operation-panel {
		padding: 15px;
		
		.search-section, .action-section {
			flex-direction: column;
			align-items: stretch;
			
			.search-input, .el-button {
				width: 100%;
			}
		}
	}
	
	.statistics-cards .el-col {
		margin-bottom: 15px;
	}
}
</style>