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
								<h2 class="header-title">修改个人信息</h2>
								<p class="header-subtitle">更新头像、联系方式与密码（留空不修改密码）</p>
							</div>
						</div>
						<div class="header-actions">
							<el-button class="back-btn" @click="goBack">
								<el-icon><ArrowLeft /></el-icon>
								返回个人中心
							</el-button>
							<el-tag type="success" effect="dark" class="status-tag">
								<el-icon><SuccessFilled /></el-icon>
								已验证
							</el-tag>
						</div>
					</div>
				</template>
				
				<div class="content-wrapper">
					<!-- 头像区域：仅从预设链接选择，不支持本地上传 -->
					<div class="avatar-section">
						<div class="avatar-container">
							<div class="avatar-top-row">
								<div class="avatar-preview-wrap">
									<div class="avatar-wrapper">
										<div class="avatar-frame">
											<div class="avatar-preview">
												<img
													v-if="state.form.avatar"
													:src="resolveFileUrl(state.form.avatar)"
													class="avatar-img"
													alt="当前头像"
												/>
												<div v-else class="avatar-placeholder">
													<el-icon><CameraFilled /></el-icon>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="avatar-info">
									<h3 class="user-name">{{ state.form.name || '用户昵称' }}</h3>
									<p class="user-role">{{ state.form.role || '用户角色' }}</p>
									<div class="avatar-tips">
										<el-icon><InfoFilled /></el-icon>
										点击下方缩略图选择头像，不支持本地上传
									</div>
								</div>
							</div>
							<p class="avatar-preset-label">预设头像</p>
							<div class="avatar-preset-grid">
								<button
									v-for="(url, idx) in PRESET_AVATAR_URLS"
									:key="idx"
									type="button"
									class="avatar-preset-item"
									:class="{ 'is-active': state.form.avatar === url }"
									:title="'选择头像 ' + (idx + 1)"
									@click="selectAvatar(url)"
								>
									<img :src="url" alt="" loading="lazy" referrerpolicy="no-referrer" />
								</button>
							</div>
						</div>
					</div>

					<!-- 表单区域 -->
					<el-form ref="roleDialogFormRef" :model="state.form" size="large" label-width="auto" class="personal-form">
						<div class="form-sections">
							<!-- 账户信息 -->
							<div class="form-section">
								<div class="section-header">
									<div class="section-icon">
										<el-icon><Lock /></el-icon>
									</div>
									<h3 class="section-title">账户信息</h3>
								</div>
								<div class="section-content">
									<el-form-item label="账号名称" class="form-item-custom">
										<el-input 
											v-model="state.form.username" 
											placeholder="请输入账号名称" 
											clearable
											class="custom-input"
										>
											<template #prefix>
												<el-icon><User /></el-icon>
											</template>
										</el-input>
									</el-form-item>
									
									<el-form-item label="登录密码" class="form-item-custom">
										<el-input 
											v-model="state.form.password" 
											placeholder="留空则不修改密码；填写新密码后保存生效" 
											clearable
											type="password"
											show-password
											autocomplete="new-password"
											class="custom-input"
										>
											<template #prefix>
												<el-icon><Key /></el-icon>
											</template>
										</el-input>
									</el-form-item>
									
									<el-form-item label="用户角色" class="form-item-custom">
										<el-input 
											v-model="state.form.role" 
											disabled 
											class="custom-input role-input"
										>
											<template #prefix>
												<el-icon><Star /></el-icon>
											</template>
										</el-input>
									</el-form-item>
								</div>
							</div>

							<!-- 个人信息 -->
							<div class="form-section">
								<div class="section-header">
									<div class="section-icon">
										<el-icon><User /></el-icon>
									</div>
									<h3 class="section-title">个人信息</h3>
								</div>
								<div class="section-content">
									<el-form-item label="真实姓名" class="form-item-custom">
										<el-input 
											v-model="state.form.name" 
											placeholder="请输入真实姓名" 
											clearable
											class="custom-input"
										>
											<template #prefix>
												<el-icon><Edit /></el-icon>
											</template>
										</el-input>
									</el-form-item>
									
									<el-form-item label="性别" class="form-item-custom">
										<el-input 
											v-model="state.form.sex" 
											placeholder="请输入性别" 
											clearable
											class="custom-input"
										>
											<template #prefix>
												<el-icon><Male /></el-icon>
											</template>
										</el-input>
									</el-form-item>
									
									<el-form-item label="手机号码" class="form-item-custom">
										<el-input 
											v-model="state.form.tel" 
											placeholder="请输入手机号码" 
											clearable
											class="custom-input"
										>
											<template #prefix>
												<el-icon><Iphone /></el-icon>
											</template>
										</el-input>
									</el-form-item>
								</div>
							</div>

							<!-- 联系信息 -->
							<div class="form-section">
								<div class="section-header">
									<div class="section-icon">
										<el-icon><Message /></el-icon>
									</div>
									<h3 class="section-title">联系信息</h3>
								</div>
								<div class="section-content">
									<el-form-item label="电子邮箱" class="form-item-custom">
										<el-input 
											v-model="state.form.email" 
											placeholder="请输入电子邮箱" 
											clearable
											class="custom-input"
										>
											<template #prefix>
												<el-icon><Message /></el-icon>
											</template>
										</el-input>
									</el-form-item>
								</div>
							</div>
						</div>
					</el-form>

					<!-- 操作按钮 -->
					<div class="action-buttons">
						<el-button size="large" class="cancel-btn" @click="resetForm">
							<el-icon><Refresh /></el-icon>
							重置更改
						</el-button>
						<el-button type="primary" @click="upData" size="large" class="submit-btn">
							<el-icon><Check /></el-icon>
							保存更改
						</el-button>
					</div>
				</div>
			</el-card>
		</div>
	</div>
</template>

<script setup lang="ts" name="personalEdit">
import { reactive, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import request from '/@/utils/request';
import { useUserInfo } from '/@/stores/userInfo';
import { Session } from '/@/utils/storage';
import { storeToRefs } from 'pinia';
import { resolveFileUrl } from '/@/utils/resolveFileUrl';
import { 
	UserFilled, CameraFilled, Check, Lock, Star, Edit, Male, 
	Iphone, Message, Key, InfoFilled, SuccessFilled, Refresh, User, ArrowLeft 
} from '@element-plus/icons-vue';

const router = useRouter();
const goBack = () => {
	router.push('/personal');
};

/** 可选预设头像（外链），保存时原样写入 avatar 字段 */
const PRESET_AVATAR_URLS = [
	'https://img.tuxiangyan.com/uploads/allimg/230622/1_0622163TEQ4.jpg',
	'https://tse1-mm.cn.bing.net/th/id/OIP-C.jtxvfcOpgNXyOTcmPwkGYAAAAA?w=194&h=194&c=7&r=0&o=7&cb=iwp1&dpr=1.3&pid=1.7&rm=3',
	'https://img.tuxiangyan.com/uploads/allimg/220101/1_01011952032O4.jpg',
	'https://img.tuxiangyan.com/uploads/allimg/220101/1_010119515532F.jpg',
	'https://img.52tiemo.com/uploads/allimg/210526/3-210526154Z0.jpg',
	'https://img.52tiemo.com/uploads/allimg/210526/3-210526154Z0-50.jpg',
	'https://img.52tiemo.com/uploads/allimg/210526/3-210526154U9.jpg',
	'https://img.52tiemo.com/uploads/allimg/210526/3-210526154U8.jpg',
	'https://img.52tiemo.com/uploads/allimg/210526/3-210526154U7.jpg',
	'https://img.52tiemo.com/uploads/allimg/210526/3-210526154U1-50.jpg',
	'https://img.tuxiangyan.com/zb_users/upload/2023/02/202302091675904133424061.jpg',
	'https://img.tuxiangyan.com/zb_users/upload/2023/02/202302091675904133140322.jpg',
	'https://img.tuxiangyan.com/zb_users/upload/2023/02/202302091675904134274530.jpg',
	'https://img.tuxiangyan.com/zb_users/upload/2023/02/202302091675904134814455.jpg',
	'https://img.tuxiangyan.com/zb_users/upload/2023/02/202302091675904134287530.jpg',
	'https://img.tuxiangyan.com/zb_users/upload/2023/02/202302091675904134748531.jpg',
	'https://img.tuxiangyan.com/zb_users/upload/2023/02/202302091675904134407256.jpg',
	'https://img.tuxiangyan.com/zb_users/upload/2023/02/202302091675904134149776.jpg',
	'https://img.tuxiangyan.com/zb_users/upload/2023/02/202302091675904134262080.jpg',
	'https://img.tuxiangyan.com/zb_users/upload/2023/02/202302091675904136317214.jpg',
	'https://img.tuxiangyan.com/zb_users/upload/2023/02/202302091675904136409043.jpg',
];

const roleDialogFormRef = ref();

// 存储原始数据用于重置
const originalData = ref({} as any);

const selectAvatar = (url: string) => {
	state.form.avatar = url;
};

// 定义变量内容
const state = reactive({
	form: {} as any,
});
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

// 初始化表格数据
const getTableData = () => {
	request.get('/api/user/' + userInfos.value.userName).then((res) => {
		if (res.code === '200') {
			state.form = { ...res.data };
			// 保存原始数据用于重置
			originalData.value = { ...res.data };
			
			if (state.form['role'] == 'admin') {
				state.form['role'] = '管理员';
				originalData.value['role'] = '管理员';
			} else if (state.form['role'] == 'user') {
				state.form['role'] = '普通用户';
				originalData.value['role'] = '普通用户';
			} else if (state.form['role'] == 'others') {
				state.form['role'] = '其他用户';
				originalData.value['role'] = '其他用户';
			}
			originalData.value.avatar = state.form.avatar;
			// 不回显服务端返回的密码，仅支持用户主动填写后修改
			state.form.password = '';
			originalData.value.password = '';
		} else {
			ElMessage({
				type: 'error',
				message: res.msg,
			});
		}
	});
};

// 重置表单数据
const resetForm = () => {
	state.form = { ...originalData.value };
	ElMessage.success('已重置所有更改');
};

const upData = () => {
	// 创建副本用于提交，避免修改原始数据
	const submitData = { ...state.form };
	if (!String(submitData.password ?? '').trim()) {
		delete submitData.password;
	}

	if (submitData['role'] == '管理员') {
		submitData['role'] = 'admin';
	} else if (submitData['role'] == '普通用户') {
		submitData['role'] = 'user';
	} else if (submitData['role'] == '其他用户') {
		submitData['role'] = 'others';
	}
	
	request.post('/api/user/update', submitData).then((res) => {
		if (res.code === '200') {
			ElMessage.success('修改成功！');
			// 更新原始数据
			getTableData();

			// 同步更新全局用户信息与会话中的头像，保证导航栏头像即时刷新
			stores.userInfos.photo = state.form.avatar;
			const sessionUserInfo = Session.get('userInfo') || {};
			Session.set('userInfo', {
				...sessionUserInfo,
				photo: state.form.avatar,
			});
		} else {
			ElMessage({
				type: 'error',
				message: res.msg,
			});
		}
	});
};

// 页面加载时
onMounted(() => {
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
	0%, 100% { transform: translateY(0px) rotate(0deg); }
	50% { transform: translateY(-20px) rotate(180deg); }
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
}

.header-content {
	display: flex;
	align-items: center;
	gap: 16px;
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

.header-actions {
	display: flex;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
}

.back-btn {
	border-radius: 12px;
	font-weight: 600;
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
	margin-bottom: 40px;
}

.avatar-container {
	display: flex;
	flex-direction: column;
	gap: 0;
	padding: 30px;
	background: linear-gradient(135deg, rgba(13, 148, 136, 0.08) 0%, rgba(56, 189, 248, 0.06) 100%);
	border-radius: 20px;
	border: 1px solid rgba(129, 230, 217, 0.25);
}

.avatar-top-row {
	display: flex;
	align-items: center;
	gap: 30px;
	flex-wrap: wrap;
}

.avatar-preview-wrap {
	.avatar-wrapper {
		position: relative;

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
}

.avatar-preset-label {
	margin: 20px 0 12px;
	font-weight: 600;
	color: #4a5568;
	font-size: 14px;
}

.avatar-preset-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(56px, 1fr));
	gap: 10px;
	max-height: 240px;
	overflow-y: auto;
	padding: 4px 2px 8px;
}

.avatar-preset-item {
	display: block;
	aspect-ratio: 1;
	width: 100%;
	border-radius: 50%;
	padding: 0;
	border: 3px solid transparent;
	overflow: hidden;
	cursor: pointer;
	background: #edf2f7;
	transition:
		border-color 0.2s ease,
		transform 0.2s ease,
		box-shadow 0.2s ease;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		vertical-align: middle;
	}

	&:hover {
		transform: scale(1.06);
		border-color: rgba(13, 148, 136, 0.45);
	}

	&.is-active {
		border-color: #0d9488;
		box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.25);
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
		margin: 0 0 12px 0;
	}
	
	.avatar-tips {
		display: flex;
		align-items: center;
		gap: 8px;
		color: #718096;
		font-size: 13px;
		
		.el-icon {
			color: #0d9488;
		}
	}
}

.form-sections {
	display: grid;
	gap: 30px;
	margin-bottom: 40px;
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
	background: linear-gradient(135deg, rgba(13, 148, 136, 0.05) 0%, rgba(56, 189, 248, 0.05) 100%);
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

:deep(.form-item-custom) {
	margin-bottom: 24px;
	
	.el-form-item__label {
		font-weight: 600;
		color: #4a5568;
		margin-bottom: 8px;
		font-size: 14px;
	}
	
	&:last-child {
		margin-bottom: 0;
	}
}

.custom-input {
	:deep(.el-input__wrapper) {
		border-radius: 12px;
		border: 1px solid #e2e8f0;
		background: #f8f9fa;
		transition: all 0.3s ease;
		box-shadow: none;
		padding: 12px 16px;
		
		&:hover {
			border-color: #cbd5e0;
			background: white;
		}
		
		&.is-focus {
			border-color: #0d9488;
			box-shadow: 0 0 0 3px rgba(13, 148, 136, 0.1);
			background: white;
		}
	}
	
	:deep(.el-input__prefix) {
		color: #0d9488;
		margin-right: 8px;
	}
}

.role-input {
	:deep(.el-input__wrapper) {
		background: rgba(13, 148, 136, 0.05);
		border-color: rgba(13, 148, 136, 0.2);
	}
}

.action-buttons {
	display: flex;
	justify-content: center;
	gap: 16px;
	margin-top: 40px;
	padding-top: 30px;
	border-top: 1px solid #e2e8f0;
}

.cancel-btn {
	border-radius: 12px;
	padding: 14px 32px;
	font-weight: 600;
	border: 1px solid #e2e8f0;
	color: #718096;
	transition: all 0.3s ease;
	
	&:hover {
		border-color: #0d9488;
		color: #0d9488;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
	}
	
	.el-icon {
		margin-right: 6px;
	}
}

.submit-btn {
	background: linear-gradient(135deg, #0d9488 0%, #0891b2 100%);
	border: none;
	border-radius: 12px;
	padding: 14px 32px;
	font-weight: 600;
	transition: all 0.3s ease;
	box-shadow: 0 4px 15px rgba(13, 148, 136, 0.3);
	
	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px rgba(13, 148, 136, 0.4);
	}
	
	.el-icon {
		margin-right: 6px;
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
		gap: 16px;
		text-align: center;
	}
	
	.avatar-container {
		flex-direction: column;
		text-align: center;
		gap: 20px;
	}
	
	.action-buttons {
		flex-direction: column;
	}
	
	.cancel-btn,
	.submit-btn {
		width: 100%;
	}
}
</style>