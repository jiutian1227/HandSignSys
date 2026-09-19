<template>
	<div class="user-dialog-container">
		<el-dialog 
			:title="state.dialog.title" 
			v-model="state.dialog.isShowDialog" 
			width="900px" 
			class="custom-dialog"
			:close-on-click-modal="false"
		>
			<div class="dialog-content">
				<!-- 左侧头像区域 -->
				<div class="avatar-section">
					<div class="avatar-upload-wrapper">
						<el-upload
							ref="uploadFile"
							class="avatar-uploader"
							:action="SPRING_FILES_UPLOAD"
							:show-file-list="false"
							:on-success="handleAvatarSuccessone"
						>
							<div class="avatar-preview">
								<img v-if="imageUrl" :src="resolveFileUrl(imageUrl)" class="avatar-image" />
								<div v-else class="avatar-placeholder">
									<el-icon class="avatar-icon"><Plus /></el-icon>
									<span class="avatar-text">上传头像</span>
								</div>
							</div>
						</el-upload>
						<div class="avatar-tips">支持JPG、PNG格式，大小不超过2MB</div>
					</div>
				</div>

				<!-- 右侧表单区域 -->
				<div class="form-section">
					<el-form 
						ref="roleDialogFormRef" 
						:model="state.form" 
						size="default" 
						label-width="90px"
						class="custom-form"
					>
						<div class="form-row">
							<el-form-item label="账号" class="form-item">
								<el-input 
									v-model="state.form.username" 
									placeholder="请输入账号" 
									clearable
									class="custom-input"
								></el-input>
							</el-form-item>
							<el-form-item label="密码" class="form-item">
								<el-input 
									v-model="state.form.password" 
									placeholder="请输入密码" 
									clearable
									class="custom-input"
									show-password
								></el-input>
							</el-form-item>
						</div>
						
						<div class="form-row">
							<el-form-item label="姓名" class="form-item">
								<el-input 
									v-model="state.form.name" 
									placeholder="请输入姓名" 
									clearable
									class="custom-input"
								></el-input>
							</el-form-item>
							<el-form-item label="性别" class="form-item">
								<el-select 
									v-model="state.form.sex" 
									placeholder="请选择性别" 
									class="custom-select"
								>
									<el-option label="男" value="男" />
									<el-option label="女" value="女" />
								</el-select>
							</el-form-item>
						</div>
						
						<div class="form-row">
							<el-form-item label="Email" class="form-item">
								<el-input 
									v-model="state.form.email" 
									placeholder="请输入Email" 
									clearable
									class="custom-input"
								></el-input>
							</el-form-item>
							<el-form-item label="手机号码" class="form-item">
								<el-input 
									v-model="state.form.tel" 
									placeholder="请输入手机号码" 
									clearable
									class="custom-input"
								></el-input>
							</el-form-item>
						</div>
						
						<div class="form-row">
							<el-form-item label="角色" class="form-item full-width">
								<el-select 
									v-model="state.form.role" 
									value-key="id" 
									placeholder="请选择注册角色" 
									class="custom-select full-width"
								>
									<el-option 
										v-for="item in option" 
										:key="item.id" 
										:label="item.label" 
										:value="item.role" 
									/>
								</el-select>
							</el-form-item>
						</div>
					</el-form>
				</div>
			</div>
			
			<template #footer>
				<div class="dialog-footer">
					<el-button @click="onCancel" size="default" class="cancel-btn">取 消</el-button>
					<el-button 
						type="primary" 
						@click="onSubmit" 
						size="default" 
						class="submit-btn"
					>{{ state.dialog.submitTxt }}</el-button>
				</div>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="systemRoleDialog">
import { nextTick, computed, reactive, ref } from 'vue';
import type { UploadInstance, UploadProps } from 'element-plus';
import { ElMessage } from 'element-plus';
import { Plus } from '@element-plus/icons-vue';
import request from '/@/utils/request';
import { resolveFileUrl, SPRING_FILES_UPLOAD } from '/@/utils/resolveFileUrl';

// 定义子组件向父组件传值/事件
const emit = defineEmits(['refresh']);

const imageUrl = ref('');
const uploadFile = ref<UploadInstance>();

const handleAvatarSuccessone: UploadProps['onSuccess'] = (response, uploadFile) => {
	console.log(response);
	imageUrl.value = URL.createObjectURL(uploadFile.raw!);
	state.form.avatar = response.data;
};

const option = [
	{ id: 1, label: '管理员', role: 'admin' },
	{ id: 2, label: '普通用户', role: 'user' },
];

// 定义变量内容
const roleDialogFormRef = ref();
const state = reactive({
	form: {} as any,
	menuData: [] as TreeType[],
	menuProps: {
		children: 'children',
		label: 'label',
	},
	dialog: {
		isShowDialog: false,
		type: '',
		title: '',
		submitTxt: '',
	},
});

const createEmptyForm = () => ({
	username: '',
	password: '',
	name: '',
	sex: '',
	email: '',
	tel: '',
	role: 'user',
	avatar: '',
});

// 打开弹窗
const openDialog = (type: string, row?: RowRoleType) => {
	if (type === 'edit') {
		// 不能直接引用表格行对象，否则弹窗里改动会“同步”到表格造成误回显
		state.form = { ...(row as any), password: '' };
		state.dialog.title = '修改用户信息';
		state.dialog.submitTxt = '保 存';
		imageUrl.value = state.form.avatar;
	} else {
		state.dialog.title = '新增用户';
		state.dialog.submitTxt = '添 加';
		// 新增时必须立刻重置表单/头像，避免打开弹窗时闪现上一次的数据
		state.form = createEmptyForm();
		imageUrl.value = '';
		uploadFile.value?.clearFiles?.(); // 清理上传列表（如果已挂载）
	}
	state.dialog.isShowDialog = true;
	// 表单项需要挂载后才能 resetFields，这里放到弹窗显示后的 nextTick
	nextTick(() => {
		roleDialogFormRef.value?.resetFields?.();
	});
};
// 关闭弹窗
const closeDialog = () => {
	state.dialog.isShowDialog = false;
};
// 取消
const onCancel = () => {
	closeDialog();
};
// 提交
const onSubmit = () => {
	if (state.form['role'] == '管理员') {
		state.form['role'] = 'admin';
	} else if (state.form['role'] == '普通用户') {
		state.form['role'] = 'user';
	} else if (state.form['role'] == '其他用户') {
		state.form['role'] = 'others';
	}
	if (state.dialog.title == '修改用户信息') {
		request.post('/api/user/update', state.form).then((res) => {
			if (res.code === '200') {
				ElMessage.success('修改成功！');
				setTimeout(() => {
					closeDialog();
					emit('refresh');
				}, 500);
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
		});
	} else {
		request.post('/api/user/', state.form).then((res) => {
			if (res.code === '200') {
				ElMessage.success('添加成功！');
			} else {
				ElMessage({
					type: 'error',
					message: res.msg,
				});
			}
			setTimeout(() => {
				closeDialog();
				emit('refresh');
			}, 500);
		});
	}
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style scoped lang="scss">
.user-dialog-container {
	:deep(.custom-dialog) {
		.el-dialog {
			border-radius: 12px;
			overflow: hidden;
			box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
			
			&__header {
				padding: 20px 24px 16px;
				border-bottom: 1px solid #f0f0f0;
				margin-right: 0;
				
				.el-dialog__title {
					font-size: 18px;
					font-weight: 600;
					color: #1f2d3d;
				}
			}
			
			&__body {
				padding: 24px;
			}
			
			&__footer {
				padding: 16px 24px 20px;
				border-top: 1px solid #f0f0f0;
			}
		}
	}
}

.dialog-content {
	display: flex;
	gap: 24px;
}

.avatar-section {
	flex: 0 0 180px;
	display: flex;
	flex-direction: column;
	align-items: center;
}

.avatar-upload-wrapper {
	display: flex;
	flex-direction: column;
	align-items: center;
}

.avatar-uploader {
	width: 120px;
	height: 120px;
	border-radius: 50%;
	overflow: hidden;
	cursor: pointer;
	transition: all 0.3s ease;
	border: 2px dashed #dcdfe6;
	
	&:hover {
		border-color: #9E87FF;
		transform: scale(1.03);
	}
}

.avatar-uploader :deep(.el-upload) {
	width: 100%;
	height: 100%;
	display: block;
	line-height: 0;
}

.avatar-uploader :deep(.el-upload-dragger) {
	width: 100%;
	height: 100%;
	padding: 0;
	border: none;
	background: transparent;
}

.avatar-preview {
	width: 100%;
	height: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	background-color: #f8f9fa;
}

.avatar-image {
	width: 100%;
	height: 100%;
	object-fit: cover;
}

.avatar-placeholder {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	color: #c0c4cc;
}

.avatar-icon {
	font-size: 28px;
	margin-bottom: 8px;
}

.avatar-text {
	font-size: 12px;
}

.avatar-tips {
	font-size: 12px;
	color: #909399;
	margin-top: 12px;
	text-align: center;
	max-width: 140px;
	line-height: 1.4;
}

.form-section {
	flex: 1;
}

.custom-form {
	.form-row {
		display: flex;
		gap: 16px;
		margin-bottom: 20px;
		
		&:last-child {
			margin-bottom: 0;
		}
	}
	
	.form-item {
		flex: 1;
		margin-bottom: 0;
		
		&.full-width {
			flex: 0 0 100%;
		}
	}
	
	:deep(.el-form-item__label) {
		font-weight: 500;
		color: #606266;
	}
}

:deep(.custom-input) {
	.el-input__wrapper {
		border-radius: 6px;
		transition: all 0.3s;
		
		&:hover {
			box-shadow: 0 0 0 1px #9E87FF inset;
		}
		
		&.is-focus {
			box-shadow: 0 0 0 1px #9E87FF inset;
		}
	}
}

:deep(.custom-select) {
	.el-select__wrapper {
		border-radius: 6px;
		transition: all 0.3s;
		
		&:hover {
			box-shadow: 0 0 0 1px #9E87FF inset;
		}
		
		&.is-focus {
			box-shadow: 0 0 0 1px #9E87FF inset;
		}
	}
	
	&.full-width {
		width: 100%;
	}
}

.dialog-footer {
	display: flex;
	justify-content: flex-end;
	gap: 12px;
}

.cancel-btn {
	border-radius: 6px;
	padding: 10px 20px;
	font-weight: 500;
}

.submit-btn {
	background: #9E87FF;
	border: none;
	border-radius: 6px;
	padding: 10px 20px;
	font-weight: 500;
	transition: all 0.3s;
	
	&:hover {
		background: #8a70ff;
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(158, 135, 255, 0.3);
	}
	
	&:active {
		transform: translateY(0);
	}
}

@media (max-width: 768px) {
	.dialog-content {
		flex-direction: column;
	}
	
	.avatar-section {
		flex: 0 0 auto;
		margin-bottom: 20px;
	}
	
	.form-row {
		flex-direction: column;
	}
}
</style>