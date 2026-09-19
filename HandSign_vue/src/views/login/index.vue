<template>
  <div class="auth-page">
    <!-- React Bits 风格背景层：Aurora + 画框式网格 + 对角线 + Noise -->
    <div class="rb-bg-layer" aria-hidden="true">
      <div class="rb-aurora">
        <div class="rb-blob rb-blob--1"></div>
        <div class="rb-blob rb-blob--2"></div>
        <div class="rb-blob rb-blob--3"></div>
        <div class="rb-blob rb-blob--4"></div>
      </div>
      <div class="rb-edge-vignette"></div>
      <div class="rb-grid-overlay"></div>
      <div class="rb-grid-diagonal"></div>
      <div class="rb-noise"></div>
    </div>

    <div class="auth-page-column">
      <div class="title-container">
        <div class="metallic-text">无声桥-灵析手语</div>
      </div>

    <div class="container rb-spotlight-card" @mousemove="onSpotlightMove" @mouseleave="onSpotlightLeave">
      <!-- 滑动面板 -->
      <div class="slider" :style="{ transform: isRegister ? 'translateX(0)' : 'translateX(100%)' }">
        <div class="slider-content slider-login">
          <h2 class="slider-title">欢迎回来</h2>
          <p class="slider-desc">登录你的账号，继续体验手势识别的全部功能</p>
          <button class="slider-btn" @click="switchToLogin" :disabled="!isRegister">
            登录
          </button>
        </div>
        <div class="slider-content slider-register">
          <h2 class="slider-title">新用户？</h2>
          <p class="slider-desc">注册一个新账号，开启你的专属体验</p>
          <button class="slider-btn" @click="switchToRegister" :disabled="isRegister">
            注册
          </button>
        </div>

        <!-- 右下角：默认仅副对角线右下三角半幅；悬停展开完整二维码 -->
        <div
          class="slider-wx-qr-perspective"
          role="complementary"
          aria-label="微信小程序，悬停显示完整二维码"
          tabindex="0"
        >
          <div class="slider-wx-qr-card">
            <p class="slider-wx-qr-title">微信小程序</p>
            <div class="slider-wx-qr-frame">
              <div class="slider-wx-qr-stack">
                <!-- 默认三角区：黑白装饰假码；悬停后显示真实小程序码 -->
                <svg
                  class="slider-wx-qr-fake"
                  viewBox="0 0 25 25"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                  focusable="false"
                >
                  <rect width="25" height="25" fill="#ffffff" />
                  <g fill="#0a0a0a">
                    <rect x="1" y="1" width="7" height="7" />
                    <rect x="3" y="3" width="3" height="3" fill="#ffffff" />
                    <rect x="4" y="4" width="1" height="1" />
                    <rect x="17" y="1" width="7" height="7" />
                    <rect x="19" y="3" width="3" height="3" fill="#ffffff" />
                    <rect x="20" y="4" width="1" height="1" />
                    <rect x="1" y="17" width="7" height="7" />
                    <rect x="3" y="19" width="3" height="3" fill="#ffffff" />
                    <rect x="4" y="20" width="1" height="1" />
                    <rect x="10" y="1" width="1" height="1" />
                    <rect x="12" y="1" width="1" height="1" />
                    <rect x="14" y="1" width="1" height="1" />
                    <rect x="10" y="3" width="1" height="1" />
                    <rect x="13" y="3" width="1" height="1" />
                    <rect x="1" y="10" width="1" height="1" />
                    <rect x="1" y="12" width="1" height="1" />
                    <rect x="1" y="14" width="1" height="1" />
                    <rect x="3" y="10" width="1" height="1" />
                    <rect x="3" y="13" width="1" height="1" />
                    <rect x="9" y="9" width="1" height="1" />
                    <rect x="11" y="9" width="1" height="1" />
                    <rect x="13" y="9" width="1" height="1" />
                    <rect x="15" y="9" width="1" height="1" />
                    <rect x="9" y="11" width="1" height="1" />
                    <rect x="12" y="11" width="1" height="1" />
                    <rect x="15" y="11" width="1" height="1" />
                    <rect x="10" y="13" width="1" height="1" />
                    <rect x="14" y="13" width="1" height="1" />
                    <rect x="9" y="15" width="1" height="1" />
                    <rect x="11" y="15" width="1" height="1" />
                    <rect x="13" y="15" width="1" height="1" />
                    <rect x="15" y="15" width="1" height="1" />
                    <rect x="17" y="10" width="1" height="1" />
                    <rect x="19" y="10" width="1" height="1" />
                    <rect x="21" y="10" width="1" height="1" />
                    <rect x="17" y="12" width="1" height="1" />
                    <rect x="20" y="12" width="1" height="1" />
                    <rect x="22" y="12" width="1" height="1" />
                    <rect x="18" y="14" width="1" height="1" />
                    <rect x="21" y="14" width="1" height="1" />
                    <rect x="10" y="17" width="1" height="1" />
                    <rect x="12" y="17" width="1" height="1" />
                    <rect x="14" y="17" width="1" height="1" />
                    <rect x="16" y="17" width="1" height="1" />
                    <rect x="18" y="17" width="1" height="1" />
                    <rect x="20" y="17" width="1" height="1" />
                    <rect x="22" y="17" width="1" height="1" />
                    <rect x="9" y="19" width="1" height="1" />
                    <rect x="11" y="19" width="1" height="1" />
                    <rect x="15" y="19" width="1" height="1" />
                    <rect x="17" y="19" width="1" height="1" />
                    <rect x="21" y="19" width="1" height="1" />
                    <rect x="23" y="19" width="1" height="1" />
                    <rect x="10" y="21" width="1" height="1" />
                    <rect x="13" y="21" width="1" height="1" />
                    <rect x="16" y="21" width="1" height="1" />
                    <rect x="19" y="21" width="1" height="1" />
                    <rect x="22" y="21" width="1" height="1" />
                    <rect x="17" y="23" width="1" height="1" />
                    <rect x="20" y="23" width="1" height="1" />
                    <rect x="23" y="23" width="1" height="1" />
                  </g>
                </svg>
                <img
                  :src="WECHAT_MINI_QR_URL"
                  alt="微信小程序二维码，扫码打开无声桥小程序"
                  class="slider-wx-qr-img"
                  loading="lazy"
                  decoding="async"
                />
              </div>
            </div>
            <p class="slider-wx-qr-hint">微信扫一扫</p>
          </div>
        </div>
      </div>

      <!-- 表单容器（登录/注册切换） -->
      <div class="form-container">
        <!-- 登录表单 -->
        <div class="form-card" :class="{ active: !isRegister }">
          <h3 class="form-title rb-gradient-text">账号登录</h3>
          <div class="input-wrapper">
            <label class="input-label">用户名</label>
            <input
              v-model="loginForm.username"
              type="text"
              class="neumorphic-input"
              placeholder="请输入用户名"
            />
          </div>
          <div class="input-wrapper">
            <label class="input-label">密码</label>
            <input
              v-model="loginForm.password"
              type="password"
              class="neumorphic-input"
              placeholder="请输入密码"
            />
          </div>
          <div class="input-wrapper">
            <label class="input-label">验证码</label>
            <div class="captcha-row">
              <input
                v-model="loginCaptcha.userAnswer"
                type="text"
                class="neumorphic-input captcha-input"
                placeholder="请输入计算结果"
                @keyup.enter="onLogin"
              />
              <button
                class="captcha-image-btn"
                type="button"
                :disabled="captchaLoading"
                @click="refreshCaptcha('login')"
                title="点击刷新验证码"
              >
                <img v-if="loginCaptcha.image" class="captcha-image" :src="loginCaptcha.image" alt="验证码" />
                <span v-else class="captcha-image-skeleton">{{ captchaLoading ? '加载中...' : '点击获取' }}</span>
              </button>
            </div>
          </div>
          <button
            class="neumorphic-btn primary-btn rb-border-beam"
            @click="onLogin"
            :disabled="
              loading ||
              captchaLoading ||
              !loginForm.username ||
              !loginForm.password ||
              !loginCaptcha.userAnswer
            "
          >
            <span class="primary-btn-label">{{ loading ? '登录中...' : '立即登录' }}</span>
          </button>
          <p class="form-tip">
            还没有账号？<span @click="switchToRegister" class="form-link">立即注册</span>
          </p>
        </div>

        <!-- 注册表单 -->
        <div class="form-card" :class="{ active: isRegister }">
          <h3 class="form-title rb-gradient-text">账号注册</h3>
          <div class="input-wrapper">
            <label class="input-label">用户名</label>
            <input
              v-model="registerForm.username"
              type="text"
              class="neumorphic-input"
              placeholder="请输入用户名"
            />
          </div>
          <div class="input-wrapper">
            <label class="input-label">邮箱（可选）</label>
            <input
              v-model="registerForm.email"
              type="email"
              class="neumorphic-input"
              placeholder="用于找回密码"
            />
          </div>
          <div class="input-wrapper">
            <label class="input-label">密码</label>
            <input
              v-model="registerForm.password"
              type="password"
              class="neumorphic-input"
              placeholder="请输入密码"
            />
          </div>
          <div class="input-wrapper">
            <label class="input-label">验证码</label>
            <div class="captcha-row">
              <input
                v-model="registerCaptcha.userAnswer"
                type="text"
                class="neumorphic-input captcha-input"
                placeholder="请输入计算结果"
                @keyup.enter="onRegister"
              />
              <button
                class="captcha-image-btn"
                type="button"
                :disabled="captchaLoading"
                @click="refreshCaptcha('register')"
                title="点击刷新验证码"
              >
                <img v-if="registerCaptcha.image" class="captcha-image" :src="registerCaptcha.image" alt="验证码" />
                <span v-else class="captcha-image-skeleton">{{ captchaLoading ? '加载中...' : '点击获取' }}</span>
              </button>
            </div>
          </div>
          <button
            class="neumorphic-btn primary-btn rb-border-beam"
            @click="onRegister"
            :disabled="
              registerLoading ||
              captchaLoading ||
              !registerForm.username ||
              !registerForm.password ||
              !registerCaptcha.userAnswer
            "
          >
            <span class="primary-btn-label">{{ registerLoading ? '注册中...' : '立即注册' }}</span>
          </button>
          <p class="form-tip">
            已有账号？<span @click="switchToLogin" class="form-link">立即登录</span>
          </p>
        </div>
      </div>
    </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import Cookies from 'js-cookie';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { Session } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';
import request from '/@/utils/request';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

const WECHAT_MINI_QR_URL = 'https://handsign.fanzengxie.icu/wechat/wx.png';

// 控制登录/注册面板显示：true=注册，false=登录
const isRegister = ref(false);
const loading = ref(false);
const registerLoading = ref(false);
const captchaLoading = ref(false);
/** Spotlight Card（React Bits 风格）：鼠标跟随柔光 */
const onSpotlightMove = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  const r = el.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width) * 100;
  const y = ((e.clientY - r.top) / r.height) * 100;
  el.style.setProperty('--rb-spot-x', `${x}%`);
  el.style.setProperty('--rb-spot-y', `${y}%`);
};

const onSpotlightLeave = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  el.style.setProperty('--rb-spot-x', '50%');
  el.style.setProperty('--rb-spot-y', '45%');
};

// 表单数据
const loginForm = reactive({
  username: '',
  password: '',
});

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
});

type CaptchaGetRes = { captchaToken: string; captchaImage: string };
type CaptchaScope = 'login' | 'register';

const loginCaptcha = reactive({
  token: '',
  image: '',
  userAnswer: '',
});

const registerCaptcha = reactive({
  token: '',
  image: '',
  userAnswer: '',
});

const applyCaptcha = (scope: CaptchaScope, data: CaptchaGetRes) => {
  const target = scope === 'login' ? loginCaptcha : registerCaptcha;
  target.token = data.captchaToken;
  target.image = data.captchaImage;
  target.userAnswer = '';
};

const refreshCaptcha = async (scope: CaptchaScope) => {
  captchaLoading.value = true;
  try {
    // 本项目其它接口都走 /api 前缀，这里保持一致（dev 代理/后端网关一般也是按 /api 配的）
    const res: any = await request.get('/api/captcha/get');
    if (res.code === '200' && res.data) {
      applyCaptcha(scope, res.data as CaptchaGetRes);
    } else {
      ElMessage.error(res.msg || '验证码获取失败');
    }
  } catch (e) {
    ElMessage.error('验证码获取失败');
  } finally {
    captchaLoading.value = false;
  }
};

const checkCaptcha = async (scope: CaptchaScope) => {
  const target = scope === 'login' ? loginCaptcha : registerCaptcha;
  if (!target.token) {
    await refreshCaptcha(scope);
    ElMessage.warning('请先获取验证码');
    return false;
  }
  if (!target.userAnswer) {
    ElMessage.warning('请输入验证码答案');
    return false;
  }
  try {
    const res: any = await request.post('/api/captcha/check', {
      captchaToken: target.token,
      userAnswer: target.userAnswer,
    });
    if (res.code === '200' && res.data === true) return true;
    ElMessage.error(res.msg || '验证码校验失败');
    await refreshCaptcha(scope);
    return false;
  } catch (e) {
    ElMessage.error('验证码校验失败');
    await refreshCaptcha(scope);
    return false;
  }
};

// 切换登录/注册
const switchToLogin = () => {
  isRegister.value = false;
  refreshCaptcha('login');
};

const switchToRegister = () => {
  isRegister.value = true;
  refreshCaptcha('register');
};

// 登录后时间提示
const currentTime = computed(() => {
  return formatAxis(new Date());
});

// 登录成功后的路由和权限处理（沿用原逻辑）
const onSignIn = async () => {
  Session.set('token', Math.random().toString(36).substr(0));
  Cookies.set('userName', loginForm.username);

  if (!themeConfig.value.isRequestRoutes) {
    const isNoPower = await initFrontEndControlRoutes();
    signInSuccess(isNoPower);
  } else {
    const isNoPower = await initBackEndControlRoutes();
    signInSuccess(isNoPower);
  }
};

const signInSuccess = (isNoPower: boolean | undefined) => {
  if (isNoPower) {
    ElMessage.warning('抱歉，您没有登录权限');
    Session.clear();
  } else {
    const currentTimeInfo = currentTime.value;
    if (route.query?.redirect) {
      router.push({
        path: route.query.redirect as string,
        query:
          route.query.params && Object.keys(route.query.params as string).length > 0
            ? JSON.parse(route.query.params as string)
            : '',
      });
    } else {
      router.push('/imgPredict');
    }
    const signInText = t('message.signInText');
    ElMessage.success(`${currentTimeInfo}，${signInText}`);
    NextLoading.start();
  }
};

// 登录逻辑（对接 /api/user/login）
const onLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    ElMessage.warning('请输入用户名和密码');
    return;
  }
  if (captchaLoading.value) return;
  const captchaOk = await checkCaptcha('login');
  if (!captchaOk) return;
  loading.value = true;
  try {
    const res: any = await request.post('/api/user/login', loginForm);
    if (res.code === '200') {
      // 兼容：后端 /login 可能只返回 password（或不返回 role），权限信息以 /user/{username} 为准
      let rawRole = res?.data?.role || '';
      let photo = '';
      try {
        const userRes: any = await request.get(`/api/user/${loginForm.username}`);
        if (userRes.code === '200' && userRes.data) {
          rawRole = rawRole || userRes.data.role || '';
          photo = userRes.data.avatar || '';
        }
      } catch {
        // 用户详情失败不阻塞登录
      }
      // 无论后端返回什么，这里统一归一化，确保与前端路由 meta.roles 对齐
      const normalizedRole =
        rawRole === 'admin' || rawRole === '管理员'
          ? 'admin'
          : rawRole === 'user' || rawRole === '用户'
            ? 'user'
            : rawRole || 'user';
      Cookies.set('role', normalizedRole);
      try {
        // 保留一个兜底字段，避免其它地方读取 raw role
        Cookies.set('rawRole', rawRole);
      } catch {
        // ignore
      }
      Session.set('userInfo', {
        userName: loginForm.username,
        role: normalizedRole,
        photo,
        time: new Date().getTime(),
        roles: normalizedRole ? [normalizedRole] : [],
        authBtnList: normalizedRole === 'admin' ? ['btn.add', 'btn.del', 'btn.edit', 'btn.link'] : ['btn.add', 'btn.link'],
      });
      await onSignIn();
    } else {
      ElMessage.error(res.msg || '登录失败');
      await refreshCaptcha('login');
    }
  } catch (e) {
    ElMessage.error('登录失败，请检查账号密码');
    await refreshCaptcha('login');
  } finally {
    loading.value = false;
  }
};

// 注册逻辑（对接 /api/user/register）
const onRegister = async () => {
  if (!registerForm.username || !registerForm.password) {
    ElMessage.warning('请输入用户名和密码');
    return;
  }
  if (captchaLoading.value) return;
  const captchaOk = await checkCaptcha('register');
  if (!captchaOk) return;
  registerLoading.value = true;
  try {
    const payload: any = {
      username: registerForm.username,
      password: registerForm.password,
    };
    if (registerForm.email) {
      payload.email = registerForm.email;
    }
    const res: any = await request.post('/api/user/register', payload);
    if (res.code === '200') {
      ElMessage.success('注册成功，请登录');
      isRegister.value = false;
      await refreshCaptcha('login');
    } else {
      ElMessage.error(res.msg || '注册失败');
      await refreshCaptcha('register');
    }
  } catch (e) {
    ElMessage.error('注册失败');
    await refreshCaptcha('register');
  } finally {
    registerLoading.value = false;
  }
};

onMounted(() => {
  if (route.query.tab === 'login') {
    isRegister.value = false;
  } else if (route.query.tab === 'register') {
    isRegister.value = true;
  }
  refreshCaptcha(isRegister.value ? 'register' : 'login');
});
</script>

<style scoped>
.auth-page {
  position: relative;
  isolation: isolate;
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: transparent;
  overflow-x: hidden;
  overflow-y: auto;
  padding: 16px;
  box-sizing: border-box;
  font-family: 'Poppins', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* 标题 + 登录卡片纵向布局（与 .container 表单卡片区分，避免与用户示例全局 .container 冲突） */
.auth-page-column {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  gap: 20px;
  box-sizing: border-box;
  /* 标题 + 卡片整体上移，避免视觉偏下 */
  transform: translateY(-36px);
}

/* 标题容器（仿照示例） */
.title-container {
  text-align: center;
  padding: 30px 20px 20px;
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  animation: metallic-fade-in-up 0.65s ease;
}

@keyframes metallic-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 可选：与示例一致，若需外包一层可加此类 */
.metallic-text-wrapper {
  position: relative;
  display: inline-block;
  padding: 15px 20px;
  margin: 0 auto;
}

/* 金属质感 + 光影流动（渐变位移 + 轻微光晕脉冲，需 background-clip） */
.metallic-text {
  font-size: 64px;
  font-weight: 900;
  color: transparent;
  position: relative;
  z-index: 1;
  letter-spacing: 4px;
  text-transform: uppercase;
  font-family: 'Segoe UI', 'Arial Black', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.2;
  padding: 10px 0;
  display: inline-block;
  /* 加一条高亮带便于扫光；拉大 background-size 才能看到 position 动画 */
  background: linear-gradient(
    125deg,
    #475569 0%,
    #94a3b8 18%,
    #e2e8f0 32%,
    #ffffff 42%,
    #f1f5f9 48%,
    #38bdf8 52%,
    #5eead4 56%,
    #cbd5e1 65%,
    #64748b 82%,
    #f8fafc 100%
  );
  background-size: 280% 280%;
  background-position: 0% 50%;
  -webkit-background-clip: text;
  background-clip: text;
  filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.45));
  animation:
    metallic-text-shine 9s ease-in-out infinite,
    metallic-text-glow 4.5s ease-in-out infinite;
}

@keyframes metallic-text-shine {
  0%,
  100% {
    background-position: 0% 40%;
  }
  50% {
    background-position: 100% 60%;
  }
}

@keyframes metallic-text-glow {
  0%,
  100% {
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.45)) drop-shadow(0 0 12px rgba(56, 189, 248, 0.12));
  }
  50% {
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 22px rgba(94, 234, 212, 0.28));
  }
}

@media (prefers-reduced-motion: reduce) {
  .metallic-text {
    animation: none;
    background-size: 120% 120%;
    filter: drop-shadow(0 3px 6px rgba(0, 0, 0, 0.45));
  }
}

/* 若后续在标题上叠 Canvas 动效，覆盖在字上方 */
.metallic-text-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
  will-change: transform, filter, opacity;
}

@media (max-width: 768px) {
  .title-container {
    padding: 20px 15px 15px;
  }

  .metallic-text {
    font-size: 40px;
    letter-spacing: 2px;
    padding: 8px 0;
  }

  .metallic-text-wrapper {
    padding: 10px 15px;
  }

  .auth-page-column {
    padding: 12px;
    gap: 16px;
    transform: translateY(-28px);
  }
}

@media (max-width: 480px) {
  .title-container {
    padding: 15px 10px 10px;
  }

  .metallic-text {
    font-size: 32px;
    letter-spacing: 1px;
    padding: 5px 0;
  }

  .metallic-text-wrapper {
    padding: 8px 10px;
  }

  .auth-page-column {
    transform: translateY(-22px);
  }
}

/* React Bits 风格：Aurora + 画框式网格 + 对角线 + Noise */
.rb-bg-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.rb-aurora {
  position: absolute;
  inset: -15%;
  z-index: 0;
  filter: blur(72px) saturate(1.15);
  opacity: 0.5;
}

/* 仅压在极光层上，不盖住手势与网格（由 z-index 控制叠放） */
.rb-edge-vignette {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: radial-gradient(
    ellipse 72% 78% at 50% 46%,
    transparent 0%,
    transparent 36%,
    rgba(15, 23, 42, 0.12) 62%,
    rgba(15, 23, 42, 0.42) 100%
  );
}

.rb-blob {
  position: absolute;
  border-radius: 50%;
  mix-blend-mode: screen;
  animation: rb-aurora-float 18s ease-in-out infinite;
}

/* 四角分布，避免与视口中央登录卡片重叠 */
.rb-blob--1 {
  width: min(42vw, 400px);
  height: min(42vw, 400px);
  left: -6%;
  top: -4%;
  background: radial-gradient(circle at 35% 35%, rgba(59, 130, 246, 0.55), rgba(99, 102, 241, 0.22) 48%, transparent 72%);
}

.rb-blob--2 {
  width: min(40vw, 380px);
  height: min(40vw, 380px);
  right: -5%;
  top: -3%;
  background: radial-gradient(circle at 65% 38%, rgba(236, 72, 153, 0.38), rgba(168, 85, 247, 0.26) 50%, transparent 74%);
  animation-delay: -4.5s;
}

.rb-blob--3 {
  width: min(38vw, 360px);
  height: min(38vw, 360px);
  left: -4%;
  bottom: -6%;
  background: radial-gradient(circle at 40% 55%, rgba(45, 212, 191, 0.42), rgba(56, 189, 248, 0.22) 55%, transparent 72%);
  animation-delay: -9s;
}

.rb-blob--4 {
  width: min(40vw, 380px);
  height: min(40vw, 380px);
  right: -5%;
  bottom: -5%;
  background: radial-gradient(circle at 62% 58%, rgba(129, 140, 248, 0.4), rgba(59, 130, 246, 0.24) 52%, transparent 74%);
  animation-delay: -13.5s;
}

@keyframes rb-aurora-float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(3%, -2%) scale(1.04);
  }
  66% {
    transform: translate(-2%, 3%) scale(0.97);
  }
}

/* 主网格：中心淡出、四周保留，与登录卡片区域错开 */
.rb-grid-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  background-image:
    linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(
    ellipse 74% 80% at 50% 48%,
    transparent 0%,
    transparent 40%,
    rgba(255, 255, 255, 0.35) 52%,
    rgba(255, 255, 255, 0.92) 100%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 74% 80% at 50% 48%,
    transparent 0%,
    transparent 40%,
    rgba(255, 255, 255, 0.35) 52%,
    rgba(255, 255, 255, 0.92) 100%
  );
  mask-mode: alpha;
  -webkit-mask-mode: alpha;
  animation: rb-grid-pan 28s linear infinite;
  opacity: 0.52;
}

/* 细对角线纹理，与主网格错频，增强「科技面板」感 */
.rb-grid-diagonal {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background-image: repeating-linear-gradient(
    -32deg,
    transparent,
    transparent 46px,
    rgba(94, 234, 212, 0.045) 46px,
    rgba(94, 234, 212, 0.045) 47px
  );
  mask-image: radial-gradient(
    ellipse 78% 84% at 50% 48%,
    transparent 0%,
    transparent 38%,
    rgba(255, 255, 255, 0.25) 55%,
    rgba(255, 255, 255, 0.85) 100%
  );
  -webkit-mask-image: radial-gradient(
    ellipse 78% 84% at 50% 48%,
    transparent 0%,
    transparent 38%,
    rgba(255, 255, 255, 0.25) 55%,
    rgba(255, 255, 255, 0.85) 100%
  );
  opacity: 0.55;
  animation: rb-diag-drift 38s linear infinite;
}

@keyframes rb-grid-pan {
  0% {
    background-position: 0 0, 0 0;
  }
  100% {
    background-position: 56px 56px, 56px 56px;
  }
}

@keyframes rb-diag-drift {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 80px 40px;
  }
}

.rb-noise {
  position: absolute;
  inset: 0;
  z-index: 4;
  opacity: 0.035;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .rb-blob,
  .rb-grid-overlay,
  .rb-grid-diagonal {
    animation: none !important;
  }
}

@media (max-width: 768px) {
  .rb-blob--1,
  .rb-blob--2,
  .rb-blob--3,
  .rb-blob--4 {
    width: min(58vw, 260px);
    height: min(58vw, 260px);
  }
}

.container {
  position: relative;
  z-index: 1;
  width: 900px;
  height: 500px;
  background: var(--app-glass-surface);
  border: 1px solid var(--app-glass-border);
  border-radius: 24px;
  box-shadow:
    0 25px 50px rgba(0, 0, 0, 0.35),
    0 0 0 1px rgba(94, 234, 212, 0.08) inset;
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  overflow: hidden;
  display: flex;
  --rb-spot-x: 50%;
  --rb-spot-y: 45%;
}

/* Spotlight Card（参考 https://reactbits.dev/components/spotlight-card ） */
.rb-spotlight-card::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(
    520px circle at var(--rb-spot-x) var(--rb-spot-y),
    rgba(94, 234, 212, 0.16),
    transparent 58%
  );
}

.slider {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  z-index: 10;
  background: linear-gradient(
    145deg,
    rgba(30, 58, 95, 0.65) 0%,
    rgba(15, 23, 42, 0.85) 50%,
    rgba(13, 148, 136, 0.25) 100%
  );
  border-radius: 24px;
  color: var(--app-text-on-glass);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.slider-content {
  width: 100%;
  padding: 40px;
  text-align: center;
}
.slider-login,
.slider-register {
  display: block;
}

.slider-title {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 16px;
}
.slider-desc {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 32px;
  line-height: 1.5;
}
.slider-btn {
  padding: 12px 36px;
  border: 1px solid var(--app-glass-border);
  background: rgba(94, 234, 212, 0.12);
  color: var(--app-accent-cyan);
  border-radius: 50px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(56, 189, 248, 0.15);
}
.slider-btn:hover:not(:disabled) {
  background: rgba(94, 234, 212, 0.22);
  border-color: rgba(129, 230, 217, 0.45);
  transform: translateY(-2px);
}
.slider-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 右侧滑块内小程序码：右下角副对角线分割的右下三角半幅；悬停展开全图 + 3D 突起 */
.slider-wx-qr-perspective {
  position: absolute;
  right: 10px;
  bottom: 10px;
  z-index: 12;
  width: min-content;
  max-width: 100%;
  outline: none;
  cursor: pointer;
  perspective: 560px;
  perspective-origin: 100% 100%;
}

.slider-wx-qr-perspective:focus-visible {
  outline: 2px solid rgba(56, 189, 248, 0.75);
  outline-offset: 3px;
  border-radius: 12px;
}

.slider-wx-qr-card {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0;
  margin: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 14px;
  box-shadow: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  transform-style: preserve-3d;
  transform: translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg) scale(1);
  transform-origin: bottom right;
  transition:
    transform 0.38s cubic-bezier(0.34, 1.15, 0.52, 1),
    box-shadow 0.38s ease,
    border-color 0.38s ease,
    background 0.35s ease,
    padding 0.38s ease,
    backdrop-filter 0.38s ease;
}

.slider-wx-qr-title {
  width: 100%;
  text-align: center;
  margin: 0;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  font-size: 11px;
  font-weight: 600;
  color: var(--app-text-on-glass);
  letter-spacing: 0.08em;
  transition: max-height 0.35s ease, opacity 0.3s ease, margin 0.35s ease;
}

.slider-wx-qr-frame {
  padding: 5px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.22);
  /* 副对角线（右上→左下）下侧：右下三角形，面积约为码面一半 */
  clip-path: polygon(100% 0, 100% 100%, 0 100%);
  -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%);
  transition:
    clip-path 0.42s cubic-bezier(0.34, 1.1, 0.52, 1),
    -webkit-clip-path 0.42s cubic-bezier(0.34, 1.1, 0.52, 1),
    box-shadow 0.38s ease;
}

.slider-wx-qr-stack {
  position: relative;
  width: 92px;
  aspect-ratio: 1;
  border-radius: 6px;
  overflow: hidden;
  background: #ffffff;
}

.slider-wx-qr-fake {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 1;
  transition: opacity 0.32s ease;
  pointer-events: none;
}

.slider-wx-qr-img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 0;
  opacity: 0;
  transition: opacity 0.32s ease;
}

.slider-wx-qr-perspective:hover .slider-wx-qr-fake,
.slider-wx-qr-perspective:focus-within .slider-wx-qr-fake {
  opacity: 0;
}

.slider-wx-qr-perspective:hover .slider-wx-qr-img,
.slider-wx-qr-perspective:focus-within .slider-wx-qr-img {
  opacity: 1;
}

.slider-wx-qr-hint {
  width: 100%;
  text-align: center;
  margin: 0;
  max-height: 0;
  opacity: 0;
  overflow: hidden;
  font-size: 10px;
  color: var(--app-text-on-glass);
  transition: max-height 0.35s ease, opacity 0.3s ease, margin 0.35s ease;
}

.slider-wx-qr-perspective:hover .slider-wx-qr-card,
.slider-wx-qr-perspective:focus-within .slider-wx-qr-card {
  align-items: center;
  padding: 10px 12px 12px;
  background: rgba(15, 23, 42, 0.55);
  border-color: rgba(129, 230, 217, 0.45);
  box-shadow:
    0 22px 44px rgba(0, 0, 0, 0.5),
    0 0 28px rgba(56, 189, 248, 0.22),
    0 0 0 1px rgba(94, 234, 212, 0.2) inset;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transform: translate3d(0, -6px, 42px) rotateX(-8deg) rotateY(6deg) scale(1.08);
}

.slider-wx-qr-perspective:hover .slider-wx-qr-frame,
.slider-wx-qr-perspective:focus-within .slider-wx-qr-frame {
  clip-path: inset(0 round 8px);
  -webkit-clip-path: inset(0 round 8px);
  box-shadow: 0 8px 22px rgba(0, 0, 0, 0.28);
}

.slider-wx-qr-perspective:hover .slider-wx-qr-title,
.slider-wx-qr-perspective:focus-within .slider-wx-qr-title {
  max-height: 2.5em;
  opacity: 1;
  margin-bottom: 6px;
}

.slider-wx-qr-perspective:hover .slider-wx-qr-hint,
.slider-wx-qr-perspective:focus-within .slider-wx-qr-hint {
  max-height: 2.5em;
  opacity: 0.88;
  margin-top: 6px;
}

@media (prefers-reduced-motion: reduce) {
  .slider-wx-qr-card,
  .slider-wx-qr-title,
  .slider-wx-qr-hint,
  .slider-wx-qr-frame,
  .slider-wx-qr-fake,
  .slider-wx-qr-img {
    transition: none;
  }

  .slider-wx-qr-perspective:hover .slider-wx-qr-card,
  .slider-wx-qr-perspective:focus-within .slider-wx-qr-card {
    transform: none;
  }
}

.form-container {
  position: relative;
  z-index: 2;
  width: 100%;
  height: 100%;
  display: flex;
}

.form-card {
  width: 50%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding: 60px 60px 42px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.5s ease;
  transform: translateX(20px);
  overflow-y: auto;
}
.form-card.active {
  opacity: 1;
  visibility: visible;
  transform: translateX(0);
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--app-text-on-glass);
  margin-bottom: 30px;
  text-align: center;
}

/* 渐变标题文字（React Bits 常见 hero / text 动效简化版） */
.form-title.rb-gradient-text {
  background: linear-gradient(110deg, #f1f5f9 0%, #5eead4 38%, #38bdf8 62%, #e2e8f0 100%);
  background-size: 220% auto;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation: rb-title-shimmer 7s ease-in-out infinite;
}

@keyframes rb-title-shimmer {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.input-wrapper {
  margin-bottom: 20px;
}
.input-label {
  display: block;
  font-size: 14px;
  color: var(--app-text-muted);
  margin-bottom: 8px;
  padding-left: 4px;
}

.neumorphic-input {
  width: 100%;
  padding: 14px 20px;
  border: 1px solid rgba(129, 230, 217, 0.2);
  outline: none;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.45);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  font-size: 14px;
  color: var(--app-text-on-glass);
  box-sizing: border-box;
  transition: all 0.2s ease;
}
.neumorphic-input:focus {
  border-color: rgba(94, 234, 212, 0.45);
  box-shadow: 0 0 0 3px rgba(56, 189, 248, 0.15);
}
.neumorphic-input::placeholder {
  color: rgba(148, 163, 184, 0.65);
}

.neumorphic-btn {
  width: 100%;
  padding: 14px;
  border: none;
  outline: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;
}
.primary-btn {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50px;
  padding: 16px 22px;
  box-sizing: border-box;
  background: linear-gradient(135deg, #0d9488 0%, #0891b2 45%, #0ea5e9 100%);
  color: #f0fdfa;
  box-shadow: 0 10px 30px rgba(14, 165, 233, 0.35);
}

/* 文字必须在光带层之上，避免 ::after + mix-blend 盖住半个字 */
.primary-btn-label {
  position: relative;
  z-index: 1;
  line-height: 1.35;
}

/* Border beam：光带仅在背景之上、文字之下 */
.primary-btn.rb-border-beam::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background: linear-gradient(
    105deg,
    transparent 0%,
    transparent 38%,
    rgba(255, 255, 255, 0.28) 50%,
    transparent 62%,
    transparent 100%
  );
  background-size: 200% 100%;
  animation: rb-border-beam 2.6s ease-in-out infinite;
  pointer-events: none;
}

@keyframes rb-border-beam {
  0% {
    background-position: 120% 0;
  }
  100% {
    background-position: -120% 0;
  }
}
.primary-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 14px 36px rgba(45, 212, 191, 0.35);
}
.primary-btn:active:not(:disabled) {
  transform: translateY(1px);
  box-shadow: 0 6px 20px rgba(14, 165, 233, 0.3);
}
.primary-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.form-tip {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: var(--app-text-muted);
}
.form-link {
  color: var(--app-accent-cyan);
  cursor: pointer;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 3px;
}
.form-link:hover {
  color: var(--app-accent-lake);
}

.captcha-row {
  display: flex;
  gap: 12px;
  align-items: center;
}

.captcha-input {
  flex: 1;
}

.captcha-image-btn {
  width: 150px;
  height: 50px;
  border: 1px solid rgba(129, 230, 217, 0.2);
  outline: none;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.45);
  padding: 0;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.captcha-image-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.4);
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.12);
}

.captcha-image-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.captcha-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.captcha-image-skeleton {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--app-text-muted);
  font-size: 12px;
  letter-spacing: 1px;
}

@media (max-width: 768px) {
  .container {
    width: 90%;
    height: auto;
    flex-direction: column;
  }
  .slider {
    width: 100%;
    height: 200px;
    position: relative;
    transform: translateY(0) !important;
  }

  .slider-wx-qr-perspective {
    right: 6px;
    bottom: 4px;
    perspective: 480px;
  }

  .slider-wx-qr-stack {
    width: 72px;
  }

  .slider-wx-qr-title {
    font-size: 10px;
  }

  .slider-wx-qr-hint {
    font-size: 9px;
  }
  .form-container {
    flex-direction: column;
  }
  .form-card {
    width: 100%;
    padding: 30px 20px;
    height: auto;
    overflow-y: visible;
  }
  .form-card.active {
    padding-bottom: 40px;
  }

  .captcha-image-btn {
    width: 130px;
  }
}
</style>
