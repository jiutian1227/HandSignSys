<template>
	<div class="register-container">
		<!-- 手势检测背景（与登录页面一致） -->
		<div class="gesture-background">
			<!-- 手势粒子 -->
			<div class="gesture-particles">
				<div class="particle" v-for="n in 30" :key="`particle-${n}`" :style="getParticleStyle(n)">
					<div class="particle-glow"></div>
				</div>
			</div>
			
			<!-- 手势波纹 -->
			<div class="gesture-ripples">
				<div class="ripple" v-for="n in 8" :key="`ripple-${n}`" :style="getRippleStyle(n)"></div>
			</div>
			
			<!-- 传感器网格 -->
			<div class="sensor-grid">
				<div class="grid-node" v-for="n in 25" :key="`node-${n}`" :style="getNodeStyle(n)">
					<div class="node-pulse"></div>
				</div>
			</div>
			
			<!-- 手势符号云 -->
			<div class="gesture-cloud">
				<div class="gesture-icon" v-for="n in 12" :key="`gesture-${n}`" :style="getGestureStyle(n)">
					{{ getRandomGesture() }}
				</div>
			</div>
			
			<!-- 信号扫描线 -->
			<div class="signal-scan">
				<div class="wave-line" v-for="n in 6" :key="`wave-${n}`" :style="getWaveStyle(n)">
					<div class="wave-path"></div>
				</div>
			</div>
		</div>

		<!-- 注册主容器 -->
		<div class="register-main">
			<!-- 智能界面容器 -->
			<div class="intelligent-container">
				<div class="intelligent-effect">
					<div class="signal-pulse"></div>
					<div class="sensor-connections"></div>
				</div>
				
				<!-- 系统标志 -->
				<div class="system-brand">
					<div class="brand-icon">
						<div class="gesture-icon-main">
							<div class="hand-structure">
								<div class="hand-outline"></div>
								<div class="finger thumb"></div>
								<div class="finger index"></div>
								<div class="finger middle"></div>
								<div class="finger ring"></div>
								<div class="finger pinky"></div>
								<div class="ai-core"></div>
							</div>
							<div class="signal-aura"></div>
						</div>
						<div class="icon-glow"></div>
					</div>
					<div class="brand-text">
						<h1 class="system-title">
							<span class="gesture-text">无声桥-灵析手语</span>
							<span class="detection-text">无声桥-灵析手语</span>
						</h1>
						<p class="system-subtitle">无声桥-灵析手语</p>
						<p class="company-tag">深度视觉计算</p>
					</div>
				</div>

				<!-- 注册面板 -->
				<div class="register-panel">
					<div class="panel-header">
						<div class="header-line"></div>
						<h2>账户注册</h2>
						<div class="header-line"></div>
					</div>
					
					<div class="panel-content">
						<el-form :model="ruleForm" :rules="registerRules" ref="ruleFormRef">
							<!-- 用户名输入 -->
							<el-form-item prop="username">
								<div class="input-field">
									<div class="field-icon">
										<div class="sensor-icon"></div>
									</div>
									<el-input 
										v-model="ruleForm.username" 
										placeholder="请输入访问ID" 
										class="sensor-input"
										size="large"
										@focus="onInputFocus"
										@blur="onInputBlur"
									/>
									<div class="field-glow"></div>
								</div>
								<div class="input-hint">创建您的身份标识</div>
							</el-form-item>

							<!-- 密码输入 -->
							<el-form-item prop="password">
								<div class="input-field">
									<div class="field-icon">
										<div class="secure-icon"></div>
									</div>
									<el-input 
										v-model="ruleForm.password" 
										type="password" 
										placeholder="请输入密钥" 
										show-password
										class="sensor-input"
										size="large"
										@focus="onInputFocus"
										@blur="onInputBlur"
									/>
									<div class="field-glow"></div>
								</div>
								<div class="input-hint">设置安全访问密钥</div>
							</el-form-item>

							<!-- 确认密码输入 -->
							<el-form-item prop="confirm">
								<div class="input-field">
									<div class="field-icon">
										<div class="shield-icon"></div>
									</div>
									<el-input 
										v-model="ruleForm.confirm" 
										type="password" 
										placeholder="请确认密钥" 
										show-password
										class="sensor-input"
										size="large"
										@focus="onInputFocus"
										@blur="onInputBlur"
									/>
									<div class="field-glow"></div>
								</div>
								<div class="input-hint">验证密钥一致性</div>
							</el-form-item>

							<!-- 注册按钮 -->
							<el-form-item>
								<div class="register-action">
									<el-button 
										type="primary" 
										class="gesture-btn"
										@click="submitForm(ruleFormRef)"
										@mouseenter="onBtnHover"
										@mouseleave="onBtnLeave"
									>
										<div class="btn-content">
											<div class="btn-text">
												<span class="text-main">创建身份</span>
												<span class="text-sub">NEURAL REGISTER</span>
											</div>
											<div class="btn-signal">
												<div class="signal-dot"></div>
												<div class="signal-dot"></div>
												<div class="signal-dot"></div>
											</div>
										</div>
										<div class="btn-energy"></div>
										<div class="btn-particles">
											<div class="particle" v-for="n in 3" :key="`btn-particle-${n}`"></div>
										</div>
									</el-button>
									
									<div class="system-status">
										<div class="status-indicator">
											<div class="status-dot active"></div>
											<span>注册就绪</span>
										</div>
										<div class="status-info">
											<span>v3.1.0 • 深度神经网络模式</span>
										</div>
									</div>
								</div>
							</el-form-item>
						</el-form>

						<!-- 辅助选项 -->
						<div class="panel-options">
							<router-link to="/login" class="option-link">
								<div class="link-icon">
									<div class="sensor-return"></div>
								</div>
								<span>返回登录</span>
								<div class="link-trail"></div>
							</router-link>
						</div>
					</div>
				</div>

				<!-- 系统信息 -->
				<div class="system-info">
					<div class="info-grid">
						<div class="info-item">
							<div class="info-icon gesture-icon-info"></div>
						</div>
						<div class="info-item">
							<div class="info-icon speed-icon"></div>
							<div class="info-content">
								<span class="info-label">识别速度</span>
								<span class="info-value">45ms</span>
							</div>
						</div>
						<div class="info-item">
							<div class="info-icon model-icon"></div>
							<div class="info-content">
								<span class="info-label">手势类型</span>
								<span class="info-value">99类</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- 背景装饰元素 -->
		<div class="background-elements">
			<!-- 手势数据流 -->
			<div class="gesture-stream">
				<div class="data-flow" v-for="n in 8" :key="`flow-${n}`" :style="getStreamStyle(n)">
					<span v-for="i in 15" :key="`data-${n}-${i}`">
						{{ ['👆','👇','👈','👉','✊','✋','👌','🤏','🤙','🤞'][Math.floor(Math.random() * 10)] }}
					</span>
				</div>
			</div>
			
			<!-- 浮动手势标签 -->
			<div class="floating-labels">
				<div class="floating-label" v-for="n in 10" :key="`label-${n}`" :style="getLabelStyle(n)">
					{{ ['点击','滑动','捏合','旋转','握拳','张开','确认','取消','放大','缩小'][Math.floor(Math.random() * 10)] }}
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import request from '/@/utils/request';

const router = useRouter();
const ruleFormRef = ref<FormInstance>();

const ruleForm = reactive({
	username: '',
	password: '',
	confirm: '',
});

const registerRules = reactive<FormRules>({
	username: [
		{ required: true, message: '请输入访问ID', trigger: 'blur' },
		{ min: 3, max: 20, message: '长度在3-20个字符', trigger: 'blur' },
	],
	password: [
		{ required: true, message: '请输入密钥', trigger: 'blur' },
		{ min: 5, max: 30, message: '长度在5-30个字符', trigger: 'blur' },
	],
	confirm: [
		{ required: true, message: '请确认密钥', trigger: 'blur' },
		{
			validator: (rule, value, callback) => {
				if (value !== ruleForm.password) {
					callback(new Error('两次输入的密钥不一致!'));
				} else {
					callback();
				}
			},
			trigger: 'blur',
		},
	],
});

// 样式函数（从登录页面复制）
// 粒子样式
const getParticleStyle = (index: number) => {
	const left = Math.random() * 100;
	const top = Math.random() * 100;
	const size = 4 + Math.random() * 8;
	const duration = 3 + Math.random() * 4;
	const delay = Math.random() * 2;
	const colorIndex = Math.floor(Math.random() * 3);
	const colors = ['#00D4FF', '#8B78FF', '#6BFFB8'];
	
	return {
		left: `${left}%`,
		top: `${top}%`,
		width: `${size}px`,
		height: `${size}px`,
		backgroundColor: colors[colorIndex],
		animationDuration: `${duration}s`,
		animationDelay: `${delay}s`
	};
};

// 波纹样式
const getRippleStyle = (index: number) => {
	const left = Math.random() * 100;
	const top = Math.random() * 100;
	const size = 100 + Math.random() * 300;
	const duration = 4 + Math.random() * 6;
	const delay = Math.random() * 3;
	
	return {
		left: `${left}%`,
		top: `${top}%`,
		width: `${size}px`,
		height: `${size}px`,
		animationDuration: `${duration}s`,
		animationDelay: `${delay}s`
	};
};

// 节点样式
const getNodeStyle = (index: number) => {
	const left = Math.random() * 100;
	const top = Math.random() * 100;
	const size = 6 + Math.random() * 12;
	const duration = 2 + Math.random() * 3;
	const delay = Math.random() * 2;
	
	return {
		left: `${left}%`,
		top: `${top}%`,
		width: `${size}px`,
		height: `${size}px`,
		animationDuration: `${duration}s`,
		animationDelay: `${delay}s`
	};
};

// 手势符号样式
const getGestureStyle = (index: number) => {
	const left = Math.random() * 100;
	const top = Math.random() * 100;
	const size = 24 + Math.random() * 36;
	const duration = 15 + Math.random() * 20;
	const delay = Math.random() * 5;
	const rotation = Math.random() * 360;
	
	return {
		left: `${left}%`,
		top: `${top}%`,
		fontSize: `${size}px`,
		animationDuration: `${duration}s`,
		animationDelay: `${delay}s`,
		transform: `rotate(${rotation}deg)`
	};
};

// 获取随机手势符号
const getRandomGesture = () => {
	const gestures = ['👆', '👇', '👈', '👉', '✊', '✋', '👌', '🤏', '🤙', '🤞'];
	return gestures[Math.floor(Math.random() * gestures.length)];
};

// 脑波样式
const getWaveStyle = (index: number) => {
	const left = Math.random() * 100;
	const height = 200 + Math.random() * 400;
	const duration = 3 + Math.random() * 5;
	const delay = Math.random() * 2;
	
	return {
		left: `${left}%`,
		height: `${height}px`,
		animationDuration: `${duration}s`,
		animationDelay: `${delay}s`
	};
};

// 数据流样式
const getStreamStyle = (index: number) => {
	const left = Math.random() * 100;
	const duration = 8 + Math.random() * 12;
	const delay = Math.random() * 5;
	
	return {
		left: `${left}%`,
		animationDuration: `${duration}s`,
		animationDelay: `${delay}s`
	};
};

// 标签样式
const getLabelStyle = (index: number) => {
	const left = Math.random() * 100;
	const top = Math.random() * 100;
	const duration = 10 + Math.random() * 15;
	const delay = Math.random() * 4;
	const opacity = 0.1 + Math.random() * 0.3;
	
	return {
		left: `${left}%`,
		top: `${top}%`,
		animationDuration: `${duration}s`,
		animationDelay: `${delay}s`,
		opacity: opacity
	};
};

// 事件处理
const onInputFocus = (event: Event) => {
	const target = event.target as HTMLElement;
	target.parentElement?.classList.add('focused');
};

const onInputBlur = (event: Event) => {
	const target = event.target as HTMLElement;
	target.parentElement?.classList.remove('focused');
};

const onBtnHover = (event: Event) => {
	const btn = event.currentTarget as HTMLElement;
	btn.classList.add('hover');
};

const onBtnLeave = (event: Event) => {
	const btn = event.currentTarget as HTMLElement;
	btn.classList.remove('hover');
};

const submitForm = (formEl: FormInstance | undefined) => {
	if (!formEl) return;
	formEl.validate((valid) => {
		if (valid) {
			request.post('/api/user/register', ruleForm).then((res) => {
				if (res.code === '200') {
					ElMessage.success({
						message: '身份创建成功！正在跳转到登录页面...',
						duration: 2000
					});
					setTimeout(() => {
						router.push('/login');
					}, 2000);
				} else {
					ElMessage.error('访问ID已存在！请使用其他标识');
				}
			});
		} else {
			console.log('error submit!');
			return false;
		}
	});
};
</script>

<style scoped>
.register-container {
	min-height: 100vh;
	display: flex;
	align-items: center;
	justify-content: center;
	/* 暗黑风格背景：与登录页保持一致 */
	background:
		radial-gradient(circle at 20% 0%, rgba(0, 212, 255, 0.12) 0, transparent 55%),
		radial-gradient(circle at 80% 100%, rgba(139, 120, 255, 0.14) 0, transparent 55%),
		linear-gradient(145deg, #020308 0%, #060814 28%, #070c1b 55%, #050711 100%);
	padding: 20px;
	position: relative;
	overflow: hidden;
	font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
}

/* 手势检测背景 */
.gesture-background {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	z-index: 1;
	overflow: hidden;
}

/* 手势粒子 */
.gesture-particles {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.particle {
	position: absolute;
	border-radius: 50%;
	animation: particleFloat ease-in-out infinite alternate;
	opacity: 0.6;
}

.particle-glow {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 200%;
	height: 200%;
	border-radius: 50%;
	background: inherit;
	filter: blur(8px);
	opacity: 0.3;
}

@keyframes particleFloat {
	0% {
		transform: translateY(0) rotate(0deg);
	}
	100% {
		transform: translateY(-20px) rotate(180deg);
	}
}

/* 手势波纹 */
.gesture-ripples {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.ripple {
	position: absolute;
	border-radius: 50%;
	border: 1px solid rgba(0, 212, 255, 0.3);
	animation: rippleExpand linear infinite;
	transform: translate(-50%, -50%);
}

@keyframes rippleExpand {
	0% {
		transform: translate(-50%, -50%) scale(0.1);
		opacity: 0.8;
	}
	100% {
		transform: translate(-50%, -50%) scale(2);
		opacity: 0;
	}
}

/* 传感器网格 */
.sensor-grid {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.grid-node {
	position: absolute;
	border-radius: 50%;
	background: rgba(0, 212, 255, 0.4);
	animation: nodePulse ease-in-out infinite alternate;
}

.node-pulse {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 100%;
	height: 100%;
	border-radius: 50%;
	background: inherit;
	animation: pulseWave 2s ease-in-out infinite;
}

@keyframes nodePulse {
	0% { opacity: 0.3; transform: scale(1); }
	100% { opacity: 0.8; transform: scale(1.2); }
}

@keyframes pulseWave {
	0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
	50% { opacity: 0.2; transform: translate(-50%, -50%) scale(2); }
}

/* 手势符号云 */
.gesture-cloud {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.gesture-icon {
	position: absolute;
	animation: gestureFloat ease-in-out infinite alternate;
	opacity: 0.2;
}

@keyframes gestureFloat {
	0% {
		transform: translateY(0) rotate(0deg);
	}
	100% {
		transform: translateY(-40px) rotate(10deg);
	}
}

/* 信号扫描线 */
.signal-scan {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.wave-line {
	position: absolute;
	width: 100%;
	height: 200px;
	animation: waveScan linear infinite;
	opacity: 0.1;
}

.wave-path {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(180deg, 
		transparent,
		rgba(0, 212, 255, 0.6),
		transparent
	);
	clip-path: path('M0,100 C25,50 75,150 100,100 C125,50 175,150 200,100 C225,50 275,150 300,100');
}

@keyframes waveScan {
	0% {
		top: -200px;
		opacity: 0;
	}
	10% {
		opacity: 0.1;
	}
	90% {
		opacity: 0.1;
	}
	100% {
		top: 100%;
		opacity: 0;
	}
}

/* 主注册容器 */
.register-main {
	position: relative;
	z-index: 2;
	width: 100%;
	max-width: 480px;
	margin: 0 auto;
}

/* 智能界面容器 */
.intelligent-container {
	position: relative;
	background: rgba(10, 14, 23, 0.85);
	border-radius: 24px;
	padding: 40px;
	backdrop-filter: blur(20px);
	border: 1px solid rgba(0, 212, 255, 0.3);
	box-shadow: 
		0 25px 50px rgba(0, 0, 0, 0.5),
		0 0 100px rgba(0, 212, 255, 0.2),
		inset 0 0 20px rgba(0, 212, 255, 0.1);
	animation: intelligentAppear 1s ease-out;
	overflow: hidden;
}

@keyframes intelligentAppear {
	from {
		opacity: 0;
		transform: translateY(40px) scale(0.95);
	}
	to {
		opacity: 1;
		transform: translateY(0) scale(1);
	}
}

.intelligent-effect {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.signal-pulse {
	position: absolute;
	top: 0;
	left: -100%;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg,
		transparent,
		rgba(0, 212, 255, 0.1),
		transparent
	);
	animation: signalSweep 6s linear infinite;
}

@keyframes signalSweep {
	0% { left: -100%; }
	100% { left: 100%; }
}

.sensor-connections {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 2px;
	background: linear-gradient(90deg,
		transparent,
		rgba(0, 212, 255, 0.5),
		transparent
	);
	box-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
	animation: sensorScan 3s linear infinite;
}

@keyframes sensorScan {
	0% { top: 0; opacity: 0; }
	10% { opacity: 1; }
	90% { opacity: 1; }
	100% { top: 100%; opacity: 0; }
}

/* 系统品牌 */
.system-brand {
	text-align: center;
	margin-bottom: 40px;
}

.brand-icon {
	display: flex;
	justify-content: center;
	margin-bottom: 24px;
	position: relative;
}

.gesture-icon-main {
	width: 120px;
	height: 120px;
	position: relative;
	z-index: 2;
}

.hand-structure {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 80px;
	height: 80px;
	background: rgba(255, 255, 255, 0.05);
	border-radius: 50% 50% 20% 20%;
	border: 2px solid rgba(0, 212, 255, 0.3);
	animation: handFloat 4s ease-in-out infinite alternate;
}

.hand-outline {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 100%;
	height: 100%;
	border-radius: 50% 50% 20% 20%;
	border: 1px solid rgba(0, 212, 255, 0.3);
}

.finger {
	position: absolute;
	background: linear-gradient(135deg, #00D4FF, #8B78FF);
	border-radius: 6px;
	animation: fingerMove 3s ease-in-out infinite;
}

.finger.thumb {
	width: 8px;
	height: 24px;
	top: 40%;
	left: 25%;
	transform: rotate(-45deg);
}

.finger.index {
	width: 8px;
	height: 32px;
	top: 30%;
	left: 40%;
	transform: rotate(-15deg);
}

.finger.middle {
	width: 8px;
	height: 36px;
	top: 25%;
	left: 50%;
	transform: translateX(-50%);
}

.finger.ring {
	width: 8px;
	height: 28px;
	top: 32%;
	right: 40%;
	transform: rotate(15deg);
}

.finger.pinky {
	width: 8px;
	height: 22px;
	top: 42%;
	right: 25%;
	transform: rotate(45deg);
}

@keyframes fingerMove {
	0%, 100% { transform: translateX(-50%) scaleY(1); }
	50% { transform: translateX(-50%) scaleY(0.8); }
}

.ai-core {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 20px;
	height: 20px;
	background: linear-gradient(45deg, #00D4FF, #8B78FF);
	border-radius: 50%;
	animation: corePulse 2s ease-in-out infinite;
}

@keyframes corePulse {
	0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
	50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
}

@keyframes handFloat {
	0% { transform: translate(-50%, -50%); }
	100% { transform: translate(-50%, -55%); }
}

.signal-aura {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 150%;
	height: 150%;
	border-radius: 50%;
	border: 2px solid rgba(0, 212, 255, 0.1);
	animation: auraExpand 3s ease-in-out infinite;
}

@keyframes auraExpand {
	0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.5; }
	50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.8; }
}

.icon-glow {
	position: absolute;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 180px;
	height: 180px;
	background: radial-gradient(circle, rgba(0, 212, 255, 0.15) 0%, transparent 70%);
	z-index: 1;
	animation: glowPulse 4s ease-in-out infinite alternate;
}

@keyframes glowPulse {
	0% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
	100% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.2); }
}

.brand-text {
	position: relative;
	z-index: 2;
}

.system-title {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 12px;
	margin-bottom: 12px;
	flex-wrap: wrap;
}

.gesture-text {
	font-size: 36px;
	font-weight: 900;
	background: linear-gradient(135deg, #00D4FF, #8B78FF);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	text-shadow: 0 0 30px rgba(0, 212, 255, 0.3);
	letter-spacing: 1px;
}

.detection-text {
	font-size: 36px;
	font-weight: 900;
	background: linear-gradient(135deg, #8B78FF, #6BFFB8);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	text-shadow: 0 0 30px rgba(139, 120, 255, 0.3);
	letter-spacing: 1px;
}

.system-subtitle {
	font-size: 18px;
	color: #ffffff;
	margin-bottom: 8px;
	font-weight: 500;
	letter-spacing: 2px;
}

.company-tag {
	font-size: 14px;
	color: rgba(255, 255, 255, 0.6);
	letter-spacing: 3px;
	font-weight: 300;
	text-transform: uppercase;
}

/* 注册面板 */
.register-panel {
	margin-top: 20px;
}

.panel-header {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 20px;
	margin-bottom: 40px;
}

.header-line {
	flex: 1;
	height: 1px;
	background: linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.5), transparent);
}

.panel-header h2 {
	color: #ffffff;
	font-size: 20px;
	font-weight: 600;
	letter-spacing: 2px;
	text-transform: uppercase;
	background: linear-gradient(135deg, #00D4FF, #8B78FF);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

/* 输入字段 */
.input-field {
	position: relative;
	margin-bottom: 8px;
}

.field-icon {
	position: absolute;
	left: 16px;
	top: 50%;
	transform: translateY(-50%);
	z-index: 2;
	width: 24px;
	height: 24px;
}

.sensor-icon, .secure-icon, .shield-icon {
	width: 100%;
	height: 100%;
	background: linear-gradient(135deg, #00D4FF, #8B78FF);
	border-radius: 6px;
	position: relative;
}

.sensor-icon::before, .sensor-icon::after,
.secure-icon::before, .secure-icon::after,
.shield-icon::before, .shield-icon::after {
	content: '';
	position: absolute;
	background: white;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
}

.sensor-icon::before {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	background: white;
}

.sensor-icon::after {
	width: 16px;
	height: 16px;
	border-radius: 50%;
	border: 2px solid white;
	transform: translate(-50%, -50%) scale(0.6);
	opacity: 0.5;
}

.secure-icon::before {
	width: 12px;
	height: 12px;
	border-radius: 50%;
	border: 2px solid white;
	box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.2);
}

.secure-icon::after {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: white;
	transform: translate(-50%, -50%) scale(0.5);
	opacity: 0.7;
}

.shield-icon {
	background: linear-gradient(135deg, #6BFFB8, #00D4FF);
}

.shield-icon::before {
	width: 16px;
	height: 16px;
	background: white;
	clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
	transform: translate(-50%, -50%);
}

.field-glow {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	border-radius: 12px;
	background: linear-gradient(135deg, rgba(0, 212, 255, 0.1), rgba(139, 120, 255, 0.1));
	opacity: 0;
	transition: opacity 0.3s ease;
	pointer-events: none;
}

:deep(.sensor-input .el-input__wrapper) {
	box-shadow: 0 0 0 1px rgba(0, 212, 255, 0.3) !important;
	border-radius: 12px !important;
	padding: 0 20px 0 56px !important;
	background: rgba(255, 255, 255, 0.05) !important;
	backdrop-filter: blur(10px);
	border: none;
	height: 56px;
	transition: all 0.3s ease;
}

:deep(.sensor-input .el-input__inner) {
	color: #ffffff !important;
	font-size: 16px !important;
	font-weight: 400;
	letter-spacing: 0.5px;
	background: transparent !important;
}

:deep(.sensor-input .el-input__inner::placeholder) {
	color: rgba(255, 255, 255, 0.4) !important;
}

:deep(.sensor-input .el-input__wrapper:hover) {
	box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.5) !important;
	background: rgba(255, 255, 255, 0.08) !important;
}

:deep(.sensor-input .el-input__wrapper.is-focus) {
	box-shadow: 0 0 0 2px #00D4FF, 0 0 20px rgba(0, 212, 255, 0.4) !important;
	background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.sensor-input.focused .el-input__wrapper) {
	box-shadow: 0 0 0 2px #00D4FF, 0 0 20px rgba(0, 212, 255, 0.4) !important;
	background: rgba(255, 255, 255, 0.1) !important;
}

:deep(.sensor-input.focused .field-glow) {
	opacity: 1;
}

.input-hint {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.4);
	margin-top: 6px;
	margin-left: 56px;
	font-weight: 300;
	letter-spacing: 0.5px;
}

/* 按钮 */
.register-action {
	margin-top: 40px;
}

.gesture-btn {
	width: 100%;
	height: 64px;
	padding: 0;
	border: none;
	border-radius: 16px;
	background: linear-gradient(135deg, 
		rgba(0, 212, 255, 0.9) 0%,
		rgba(139, 120, 255, 0.9) 50%,
		rgba(107, 255, 184, 0.9) 100%);
	position: relative;
	overflow: hidden;
	transition: all 0.3s ease;
	transform-style: preserve-3d;
	perspective: 1000px;
}

.btn-content {
	position: relative;
	z-index: 2;
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 0 32px;
	height: 100%;
	transform: translateZ(20px);
}

.btn-text {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.text-main {
	color: white;
	font-size: 18px;
	font-weight: 700;
	letter-spacing: 1.5px;
	text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.text-sub {
	color: rgba(255, 255, 255, 0.8);
	font-size: 11px;
	font-weight: 500;
	letter-spacing: 2px;
	text-transform: uppercase;
}

.btn-signal {
	display: flex;
	align-items: center;
	gap: 4px;
}

.signal-dot {
	width: 6px;
	height: 6px;
	border-radius: 50%;
	background: white;
	animation: signalPulse 1.5s ease-in-out infinite;
}

.signal-dot:nth-child(2) {
	animation-delay: 0.2s;
}

.signal-dot:nth-child(3) {
	animation-delay: 0.4s;
}

@keyframes signalPulse {
	0%, 100% { opacity: 0.3; transform: scale(1); }
	50% { opacity: 1; transform: scale(1.5); }
}

.btn-energy {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	background: linear-gradient(90deg, 
		transparent,
		rgba(255, 255, 255, 0.3),
		transparent);
	transform: translateX(-100%);
	transition: transform 0.6s ease;
}

.btn-particles {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
}

.particle {
	position: absolute;
	width: 4px;
	height: 4px;
	background: white;
	border-radius: 50%;
	opacity: 0;
}

.gesture-btn:hover {
	transform: translateY(-4px);
	box-shadow: 
		0 15px 35px rgba(0, 212, 255, 0.4),
		0 0 60px rgba(0, 212, 255, 0.3),
		inset 0 0 20px rgba(255, 255, 255, 0.1);
}

.gesture-btn.hover .btn-energy {
	transform: translateX(100%);
}

.gesture-btn.hover .particle:nth-child(1) {
	top: 20%; left: 10%;
	animation: particleFloatUp 1s ease-out 0.1s;
}
.gesture-btn.hover .particle:nth-child(2) {
	top: 50%; left: 30%;
	animation: particleFloatUp 1s ease-out 0.2s;
}
.gesture-btn.hover .particle:nth-child(3) {
	top: 80%; left: 70%;
	animation: particleFloatUp 1s ease-out 0.3s;
}

@keyframes particleFloatUp {
	0% {
		transform: translateY(0) scale(1);
		opacity: 0;
	}
	20% {
		opacity: 1;
	}
	100% {
		transform: translateY(-50px) scale(0);
		opacity: 0;
	}
}

.gesture-btn:active {
	transform: translateY(-2px);
	transition: transform 0.1s ease;
}

/* 系统状态 */
.system-status {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-top: 16px;
	padding: 0 8px;
}

.status-indicator {
	display: flex;
	align-items: center;
	gap: 8px;
}

.status-dot {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.3);
	position: relative;
}

.status-dot.active {
	background: #6BFFB8;
	box-shadow: 0 0 10px #6BFFB8;
	animation: statusPulse 2s ease-in-out infinite;
}

@keyframes statusPulse {
	0%, 100% { opacity: 1; transform: scale(1); }
	50% { opacity: 0.7; transform: scale(1.2); }
}

.status-indicator span {
	color: rgba(255, 255, 255, 0.6);
	font-size: 12px;
	font-weight: 500;
	letter-spacing: 1px;
}

.status-info span {
	color: rgba(255, 255, 255, 0.4);
	font-size: 11px;
	font-weight: 400;
	letter-spacing: 1px;
}

/* 面板选项 */
.panel-options {
	display: flex;
	flex-direction: column;
	gap: 20px;
	margin-top: 40px;
}

.option-link {
	display: flex;
	align-items: center;
	gap: 12px;
	color: rgba(255, 255, 255, 0.6);
	text-decoration: none;
	font-size: 14px;
	font-weight: 500;
	letter-spacing: 1px;
	padding: 12px 20px;
	border-radius: 12px;
	transition: all 0.3s ease;
	position: relative;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.03);
}

.link-icon {
	width: 24px;
	height: 24px;
	position: relative;
}

.sensor-return {
	width: 100%;
	height: 100%;
	position: relative;
}

.sensor-return::before, .sensor-return::after {
	content: '';
	position: absolute;
	background: rgba(0, 212, 255, 0.6);
	transition: all 0.3s ease;
}

.sensor-return::before {
	top: 30%;
	left: 30%;
	width: 40%;
	height: 40%;
	border: 2px solid rgba(0, 212, 255, 0.6);
	border-radius: 50%;
	border-top-color: transparent;
	border-left-color: transparent;
	transform: rotate(-45deg);
}

.sensor-return::after {
	top: 45%;
	left: 45%;
	width: 20%;
	height: 2px;
	background: rgba(0, 212, 255, 0.6);
	transform: rotate(45deg);
}

.link-trail {
	position: absolute;
	bottom: 0;
	left: 0;
	width: 0;
	height: 1px;
	background: linear-gradient(90deg, #00D4FF, #8B78FF);
	transition: width 0.3s ease;
}

.option-link:hover {
	color: #ffffff;
	background: rgba(0, 212, 255, 0.1);
	transform: translateX(4px);
}

.option-link:hover .link-trail {
	width: 100%;
}

.option-link:hover .sensor-return::before,
.option-link:hover .sensor-return::after {
	background: #00D4FF;
}

/* 系统信息 */
.system-info {
	margin-top: 40px;
	padding-top: 30px;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.info-grid {
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
}

.info-item {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 16px;
	background: rgba(255, 255, 255, 0.03);
	border-radius: 12px;
	border: 1px solid rgba(0, 212, 255, 0.1);
	transition: all 0.3s ease;
}

.info-item:hover {
	background: rgba(0, 212, 255, 0.1);
	border-color: rgba(0, 212, 255, 0.3);
	transform: translateY(-2px);
}

.info-icon {
	width: 36px;
	height: 36px;
	border-radius: 8px;
	background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(139, 120, 255, 0.2));
	display: flex;
	align-items: center;
	justify-content: center;
	position: relative;
}

.gesture-icon-info::before {
	content: '👌';
	color: #00D4FF;
	font-size: 18px;
}

.speed-icon::before {
	content: '⚡';
	color: #8B78FF;
	font-size: 18px;
}

.model-icon::before {
	content: '👁️';
	color: #6BFFB8;
	font-size: 16px;
}

.info-content {
	display: flex;
	flex-direction: column;
	gap: 4px;
}

.info-label {
	font-size: 12px;
	color: rgba(255, 255, 255, 0.5);
	font-weight: 500;
	letter-spacing: 1px;
}

.info-value {
	font-size: 18px;
	color: #ffffff;
	font-weight: 700;
	background: linear-gradient(135deg, #00D4FF, #8B78FF);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
}

/* 背景装饰元素 */
.background-elements {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	pointer-events: none;
	z-index: 1;
}

/* 手势数据流 */
.gesture-stream {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.data-flow {
	position: absolute;
	top: -100px;
	color: rgba(0, 212, 255, 0.3);
	font-size: 18px;
	font-weight: bold;
	letter-spacing: 10px;
	line-height: 24px;
	animation: streamFall linear infinite;
	white-space: nowrap;
}

@keyframes streamFall {
	0% {
		top: -100px;
		opacity: 0;
	}
	10% {
		opacity: 1;
	}
	90% {
		opacity: 1;
	}
	100% {
		top: 100vh;
		opacity: 0;
	}
}

/* 浮动手势标签 */
.floating-labels {
	position: absolute;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
}

.floating-label {
	position: absolute;
	color: rgba(0, 212, 255, 0.2);
	font-size: 14px;
	font-weight: 600;
	font-family: monospace;
	animation: floatLabel linear infinite;
	text-transform: uppercase;
	letter-spacing: 2px;
}

@keyframes floatLabel {
	0% {
		transform: translateY(0) rotate(0deg);
		opacity: 0;
	}
	10% {
		opacity: 0.3;
	}
	90% {
		opacity: 0.3;
	}
	100% {
		transform: translateY(-100vh) rotate(360deg);
		opacity: 0;
	}
}

/* 响应式设计 */
@media (max-width: 768px) {
	.register-main {
		max-width: 90%;
		padding: 0;
	}
	
	.intelligent-container {
		padding: 30px 25px;
	}
	
	.system-title {
		flex-direction: column;
		gap: 8px;
	}
	
	.gesture-text, .detection-text {
		font-size: 32px;
	}
	
	.gesture-icon-main {
		width: 100px;
		height: 100px;
	}
	
	.hand-structure {
		width: 70px;
		height: 70px;
	}
	
	.info-grid {
		grid-template-columns: repeat(3, 1fr);
		gap: 15px;
	}
	
	:deep(.sensor-input .el-input__wrapper) {
		height: 52px;
	}
	
	.gesture-btn {
		height: 56px;
	}
	
	.text-main {
		font-size: 16px;
	}
	
	.text-sub {
		font-size: 10px;
	}
	
	.info-item {
		padding: 12px;
	}
	
	.info-value {
		font-size: 16px;
	}
}

@media (max-width: 480px) {
	.intelligent-container {
		padding: 24px 20px;
		border-radius: 20px;
	}
	
	.system-subtitle {
		font-size: 16px;
		letter-spacing: 1px;
	}
	
	.company-tag {
		font-size: 12px;
		letter-spacing: 2px;
	}
	
	.panel-header h2 {
		font-size: 18px;
	}
	
	.info-grid {
		grid-template-columns: 1fr;
		gap: 12px;
	}
	
	.gesture-cloud {
		display: none;
	}
}
</style>