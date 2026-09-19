<template>
	<div class="personal-container">
		<div class="background-decoration">
			<div class="decoration-circle circle-1"></div>
			<div class="decoration-circle circle-2"></div>
			<div class="decoration-circle circle-3"></div>
		</div>

		<div class="personal-card-wrapper">
			<el-card shadow="hover" class="personal-card">
				<template #header>
					<div class="card-header">
						<div class="header-content">
							<div class="header-icon">
								<el-icon><UserFilled /></el-icon>
							</div>
							<div class="header-text">
								<h2 class="header-title">个人中心</h2>
								<p class="header-subtitle">查看您的账户与资料概览</p>
							</div>
						</div>
						<div class="header-actions">
							<el-button type="primary" class="edit-btn" @click="goEdit">
								<el-icon><Edit /></el-icon>
								修改信息
							</el-button>
							<el-tag type="success" effect="dark" class="status-tag">
								<el-icon><SuccessFilled /></el-icon>
								已验证
							</el-tag>
						</div>
					</div>
				</template>

				<div class="content-wrapper">
					<div class="avatar-section">
						<div class="avatar-container">
							<div class="avatar-wrapper">
								<div class="avatar-frame">
									<div class="avatar-preview">
										<img v-if="imageUrl" :src="resolveFileUrl(imageUrl)" class="avatar-img" alt="头像" />
										<div v-else class="avatar-placeholder">
											<el-icon><CameraFilled /></el-icon>
										</div>
									</div>
								</div>
							</div>
							<div class="avatar-info">
								<h3 class="user-name">{{ state.form.name || '用户昵称' }}</h3>
								<p class="user-role">{{ state.form.role || '用户角色' }}</p>
								<p class="user-account">账号：{{ state.form.username || '—' }}</p>
							</div>
						</div>
					</div>

					<div class="info-sections">
						<div class="form-section">
							<div class="section-header">
								<div class="section-icon">
									<el-icon><Lock /></el-icon>
								</div>
								<h3 class="section-title">账户信息</h3>
							</div>
							<div class="section-content read-only-grid">
								<div class="info-row">
									<span class="info-label">账号名称</span>
									<span class="info-value">{{ state.form.username || '—' }}</span>
								</div>
								<div class="info-row">
									<span class="info-label">用户角色</span>
									<span class="info-value">{{ state.form.role || '—' }}</span>
								</div>
							</div>
						</div>

						<div class="form-section">
							<div class="section-header">
								<div class="section-icon">
									<el-icon><User /></el-icon>
								</div>
								<h3 class="section-title">个人信息</h3>
							</div>
							<div class="section-content read-only-grid">
								<div class="info-row">
									<span class="info-label">真实姓名</span>
									<span class="info-value">{{ state.form.name || '—' }}</span>
								</div>
								<div class="info-row">
									<span class="info-label">性别</span>
									<span class="info-value">{{ state.form.sex || '—' }}</span>
								</div>
								<div class="info-row">
									<span class="info-label">手机号码</span>
									<span class="info-value">{{ state.form.tel || '—' }}</span>
								</div>
							</div>
						</div>

						<div class="form-section">
							<div class="section-header">
								<div class="section-icon">
									<el-icon><Message /></el-icon>
								</div>
								<h3 class="section-title">联系信息</h3>
							</div>
							<div class="section-content read-only-grid">
								<div class="info-row">
									<span class="info-label">电子邮箱</span>
									<span class="info-value">{{ state.form.email || '—' }}</span>
								</div>
							</div>
						</div>
					</div>

					<p class="hint-text">
						<el-icon><InfoFilled /></el-icon>
						修改头像、密码及其他资料请点击「修改信息」。
					</p>
				</div>
			</el-card>
		</div>
	</div>
</template>

<script setup lang="ts" name="personal">
import { reactive, ref, onMounted, onActivated } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { useUserInfo } from '/@/stores/userInfo';
import { storeToRefs } from 'pinia';
import { resolveFileUrl } from '/@/utils/resolveFileUrl';
import {
	UserFilled,
	CameraFilled,
	Lock,
	User,
	Message,
	InfoFilled,
	SuccessFilled,
	Edit,
} from '@element-plus/icons-vue';

const router = useRouter();
const imageUrl = ref('');

const state = reactive({
	form: {} as any,
});

const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

const goEdit = () => {
	router.push('/personal/edit');
};

const getTableData = () => {
	request.get('/api/user/' + userInfos.value.userName).then((res) => {
		if (res.code === '200') {
			state.form = { ...res.data };
			if (state.form['role'] == 'admin') {
				state.form['role'] = '管理员';
			} else if (state.form['role'] == 'user') {
				state.form['role'] = '普通用户';
			} else if (state.form['role'] == 'others') {
				state.form['role'] = '其他用户';
			}
			imageUrl.value = state.form.avatar;
			// 概览页不展示密码；接口若返回密码也不保留在内存用于展示
			delete state.form.password;
		} else {
			ElMessage({
				type: 'error',
				message: res.msg,
			});
		}
	});
};

onMounted(() => {
	getTableData();
});

onActivated(() => {
	getTableData();
});
</script>

<style scoped lang="scss">
.personal-container {
	min-height: 100vh;
	background: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 40px 20px;
	position: relative;
	overflow: hidden;
}

.background-decoration {
	display: none;
}

.decoration-circle {
	position: absolute;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.1);
	backdrop-filter: blur(10px);
}

.circle-1 {
	width: 200px;
	height: 200px;
	top: 10%;
	left: 5%;
	animation: float 6s ease-in-out infinite;
}

.circle-2 {
	width: 150px;
	height: 150px;
	top: 60%;
	right: 8%;
	animation: float 8s ease-in-out infinite reverse;
}

.circle-3 {
	width: 100px;
	height: 100px;
	bottom: 20%;
	left: 15%;
	animation: float 10s ease-in-out infinite;
}

@keyframes float {
	0%,
	100% {
		transform: translateY(0px) rotate(0deg);
	}
	50% {
		transform: translateY(-20px) rotate(180deg);
	}
}

.personal-card-wrapper {
	width: 100%;
	max-width: 1000px;
	z-index: 1;
}

.personal-card {
	border-radius: 24px;
	border: 1px solid var(--app-glass-border);
	backdrop-filter: blur(20px);
	background: var(--app-card-glass);
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);

	:deep(.el-card__header) {
		padding: 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.05);
		background: transparent;
		border-radius: 24px 24px 0 0;
	}
}

.card-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 30px 40px;
	background: linear-gradient(135deg, rgba(13, 148, 136, 0.12) 0%, rgba(56, 189, 248, 0.1) 100%);
	border-radius: 24px 24px 0 0;
	flex-wrap: wrap;
	gap: 16px;
}

.header-content {
	display: flex;
	align-items: center;
	gap: 16px;
}

.header-actions {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}

.edit-btn {
	border-radius: 12px;
	padding: 12px 22px;
	font-weight: 600;
	background: linear-gradient(135deg, #0d9488 0%, #0891b2 50%, #0ea5e9 100%);
	border: none;
	box-shadow: 0 4px 18px rgba(14, 165, 233, 0.35);

	.el-icon {
		margin-right: 6px;
	}
}

.header-icon {
	width: 60px;
	height: 60px;
	background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
	border-radius: 16px;
	display: flex;
	align-items: center;
	justify-content: center;
	box-shadow: 0 8px 20px rgba(14, 165, 233, 0.3);

	.el-icon {
		color: white;
		font-size: 28px;
	}
}

.header-text {
	.header-title {
		color: #2d3748;
		font-size: 28px;
		font-weight: 700;
		margin: 0 0 4px 0;
	}

	.header-subtitle {
		color: #718096;
		font-size: 14px;
		margin: 0;
		font-weight: 500;
	}
}

.status-tag {
	border: none;
	border-radius: 20px;
	padding: 8px 16px;
	font-weight: 500;

	.el-icon {
		margin-right: 4px;
	}
}

.content-wrapper {
	padding: 40px;
}

.avatar-section {
	margin-bottom: 32px;
}

.avatar-container {
	display: flex;
	align-items: center;
	gap: 30px;
	padding: 30px;
	background: linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(56, 189, 248, 0.06) 100%);
	border-radius: 20px;
	border: 1px solid rgba(129, 230, 217, 0.25);
}

.avatar-wrapper {
	.avatar-frame {
		position: relative;
		width: 120px;
		height: 120px;
		border-radius: 50%;
		background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
		padding: 4px;
		box-shadow: 0 8px 25px rgba(14, 165, 233, 0.3);
	}

	.avatar-preview {
		width: 100%;
		height: 100%;
		border-radius: 50%;
		overflow: hidden;
		background: #f8f9fa;
		display: flex;
		align-items: center;
		justify-content: center;

		.avatar-img {
			width: 100%;
			height: 100%;
			object-fit: cover;
		}

		.avatar-placeholder {
			color: #cbd5e0;
			font-size: 40px;
		}
	}
}

.avatar-info {
	flex: 1;

	.user-name {
		color: #2d3748;
		font-size: 24px;
		font-weight: 700;
		margin: 0 0 8px 0;
	}

	.user-role {
		color: #0d9488;
		font-size: 16px;
		font-weight: 600;
		margin: 0 0 8px 0;
	}

	.user-account {
		color: #718096;
		font-size: 14px;
		margin: 0;
	}
}

.info-sections {
	display: grid;
	gap: 24px;
}

.form-section {
	background: white;
	border-radius: 16px;
	border: 1px solid #e2e8f0;
	overflow: hidden;
	box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.section-header {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 20px 24px;
	background: linear-gradient(135deg, rgba(13, 148, 136, 0.06) 0%, rgba(56, 189, 248, 0.05) 100%);
	border-bottom: 1px solid #e2e8f0;
}

.section-icon {
	width: 40px;
	height: 40px;
	background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
	border-radius: 10px;
	display: flex;
	align-items: center;
	justify-content: center;

	.el-icon {
		color: white;
		font-size: 20px;
	}
}

.section-title {
	color: #2d3748;
	font-size: 18px;
	font-weight: 600;
	margin: 0;
}

.section-content {
	padding: 24px;
}

.read-only-grid {
	display: flex;
	flex-direction: column;
	gap: 16px;
}

.info-row {
	display: flex;
	flex-wrap: wrap;
	align-items: baseline;
	gap: 12px 24px;
	padding-bottom: 12px;
	border-bottom: 1px solid #edf2f7;

	&:last-child {
		padding-bottom: 0;
		border-bottom: none;
	}
}

.info-label {
	min-width: 88px;
	font-weight: 600;
	color: #4a5568;
	font-size: 14px;
}

.info-value {
	color: #2d3748;
	font-size: 15px;
	word-break: break-all;
}

.hint-text {
	display: flex;
	align-items: flex-start;
	gap: 8px;
	margin: 28px 0 0;
	padding: 14px 18px;
	background: rgba(13, 148, 136, 0.1);
	border-radius: 12px;
	color: #4a5568;
	font-size: 13px;
	line-height: 1.5;

	.el-icon {
		color: #0d9488;
		margin-top: 2px;
		flex-shrink: 0;
	}
}

@media (max-width: 768px) {
	.personal-card-wrapper {
		width: 95%;
	}

	.content-wrapper {
		padding: 20px;
	}

	.card-header {
		padding: 20px;
		flex-direction: column;
		text-align: center;
	}

	.header-actions {
		justify-content: center;
		width: 100%;
	}

	.avatar-container {
		flex-direction: column;
		text-align: center;
		gap: 20px;
	}

	.edit-btn {
		width: 100%;
	}
}
</style>
