<template>
  <div class="sidebar-container">
    <!-- 顶部 Logo 和系统名称 -->
    <div class="sidebar-header">
      <div class="logo-icon">
        <img class="logo-img" :src="brandLogo" alt="无声桥" />
      </div>
      <div class="logo-text">
        <h2 class="title">无声桥-灵析手语</h2>
        <p class="subtitle">智能手势识别系统</p>
      </div>
    </div>

    <!-- 菜单 -->
    <el-menu
      class="sidebar-menu"
      :default-active="activeMenu"
      background-color="transparent"
      text-color="#eaeaea"
      active-text-color="#00D4FF"
      @select="handleMenuSelect"
      :collapse="isCollapse"
    >
      <el-menu-item v-if="userInfo.role !== 'user'" index="/home">
        <el-icon><HomeFilled /></el-icon>
        <span>控制中心</span>
      </el-menu-item>

      <el-menu-item index="/imgPredict">
        <el-icon><Picture /></el-icon>
        <span>图像分析</span>
      </el-menu-item>

      <el-menu-item index="/videoPredict">
        <el-icon><VideoPlay /></el-icon>
        <span>视频检测</span>
      </el-menu-item>

      <el-menu-item index="/cameraPredict">
        <el-icon><Camera /></el-icon>
        <span>实时监控</span>
      </el-menu-item>

      <el-sub-menu index="records">
        <template #title>
          <el-icon><Document /></el-icon>
          <span>数据档案</span>
        </template>
        <el-menu-item index="/imgRecord">
          <el-icon><Picture /></el-icon>
          <span>图像记录</span>
        </el-menu-item>
        <el-menu-item index="/videoRecord">
          <el-icon><VideoPlay /></el-icon>
          <span>视频记录</span>
        </el-menu-item>
        <el-menu-item index="/cameraRecord">
          <el-icon><Camera /></el-icon>
          <span>监控记录</span>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item v-if="userInfo.role === 'admin'" index="/usermanage">
        <el-icon><User /></el-icon>
        <span>权限管理</span>
      </el-menu-item>
    </el-menu>

    <!-- 底部用户区：个人中心 / 退出 -->
    <div class="sidebar-footer" v-if="!isCollapse">
      <div class="user-brief" @click="goPersonal">
        <div class="avatar" v-if="userAvatar">
          <img :src="userAvatar" alt="avatar" />
        </div>
        <div class="avatar placeholder" v-else>
          <el-icon><User /></el-icon>
        </div>
        <div class="meta">
          <div class="name">{{ userInfos.name || userInfos.userName || '用户' }}</div>
          <div class="role">{{ roleLabel }}</div>
        </div>
      </div>
      <div class="footer-actions">
        <el-button class="glass-btn" @click="router.push('/personal')">个人中心</el-button>
        <el-button class="glass-btn danger" @click="handleLogout">退出系统</el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  User,
  HomeFilled,
  Picture,
  VideoPlay,
  Camera,
  Document,
} from '@element-plus/icons-vue';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useUserInfo } from '/@/stores/userInfo';
import { Session } from '/@/utils/storage';
import { resolveFileUrl } from '/@/utils/resolveFileUrl';
import brandLogo from '/@/assets/brand-logo-wushengqiao.png';

const router = useRouter();
const route = useRoute();

const themeStore = useThemeConfig();
const { themeConfig } = storeToRefs(themeStore);

const userStore = useUserInfo();
const { userInfos } = storeToRefs(userStore);

const userInfo = reactive({
  role: userInfos.value.role || '',
});

const activeMenu = computed(() => route.path);

const isCollapse = computed(() => themeConfig.value.isCollapse === true);

const userAvatar = computed(() => resolveFileUrl((userInfos.value as any).photo));

const handleMenuSelect = (index: string) => {
  if (index && index !== route.path) {
    router.push(index);
  }
};

const goPersonal = () => {
  if (route.path !== '/personal') {
    router.push('/personal');
  }
};

const handleLogout = () => {
  ElMessageBox.confirm('确定要退出手势检测系统吗？', '安全提示', {
    confirmButtonText: '确认退出',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(() => {
      Session.clear();
      localStorage.removeItem('token');
      router.push('/login');
      ElMessage.success('已安全退出手势检测系统');
    })
    .catch(() => {});
};

const roleLabel = computed(() => {
  const role = userInfos.value.role || '';
  if (role === 'admin') return '管理员';
  if (role === 'user') return '普通用户';
  if (role === 'others') return '其他用户';
  return role || '用户';
});
</script>

<style scoped lang="scss">
.sidebar-container {
  width: 240px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px 12px;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border-right: 1px solid var(--app-glass-border, rgba(129, 230, 217, 0.22));
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.35);
}

.sidebar-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 8px 10px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.logo-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  margin-right: 10px;
  box-shadow:
    0 0 0 1px rgba(0, 212, 255, 0.28),
    0 0 18px rgba(0, 212, 255, 0.45),
    0 4px 12px rgba(0, 0, 0, 0.35);

  .logo-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.logo-text {
  .title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    background: linear-gradient(135deg, #00d4ff, #8b78ff);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    margin: 2px 0 0;
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    letter-spacing: 1px;
  }
}

.sidebar-menu {
  flex: 1;
  border-right: none;
  background: transparent;

  :deep(.el-menu-item),
  :deep(.el-sub-menu__title) {
    height: 46px;
    line-height: 46px;
    border-radius: 10px;
    margin: 4px 0;
    padding: 0 14px !important;
    color: #ffffff !important;

    /* 玻璃效果（默认态） */
    background: rgba(255, 255, 255, 0.06) !important;
    border: 1px solid rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    box-shadow:
      0 6px 18px rgba(0, 0, 0, 0.25),
      inset 0 1px 0 rgba(255, 255, 255, 0.12);
    transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  }

  :deep(.el-menu-item) {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  // 菜单文字强制为白色
  :deep(.el-menu-item span),
  :deep(.el-sub-menu__title span) {
    color: #ffffff !important;
  }

  /* 一级菜单字体加粗（不包含子菜单项） */
  :deep(> .el-menu-item span),
  :deep(> .el-sub-menu > .el-sub-menu__title span) {
    font-weight: 700;
    letter-spacing: 0.4px;
  }

  :deep(.el-menu-item:hover),
  :deep(.el-sub-menu__title:hover) {
    /* 玻璃效果（悬浮态） */
    background: rgba(255, 255, 255, 0.10) !important;
    border-color: rgba(0, 212, 255, 0.35) !important;
    transform: translateY(-1px);
    box-shadow:
      0 10px 24px rgba(0, 0, 0, 0.35),
      0 0 22px rgba(0, 212, 255, 0.18),
      inset 0 1px 0 rgba(255, 255, 255, 0.14);
  }

  :deep(.is-active) {
    /* 玻璃效果（选中态） */
    background: rgba(0, 212, 255, 0.18) !important;
    border-color: rgba(0, 212, 255, 0.55) !important;
    box-shadow:
      0 12px 28px rgba(0, 0, 0, 0.4),
      0 0 26px rgba(0, 212, 255, 0.32),
      inset 0 1px 0 rgba(255, 255, 255, 0.16);
  }

  :deep(.el-icon) {
    font-size: 18px;
    color: #ffffff;
  }
}

.sidebar-footer {
  margin-top: 12px;
  padding: 12px 10px 0;
  border-top: none;
}

.user-brief {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 4px 0;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.25);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
}

.meta {
  flex: 1;
  min-width: 0;

  .name {
    color: #fff;
    font-weight: 700;
    font-size: 13px;
    line-height: 1.2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .role {
    margin-top: 2px;
    color: rgba(255, 255, 255, 0.55);
    font-size: 11px;
    letter-spacing: 0.3px;
  }
}

.footer-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}

.glass-btn {
  border-radius: 12px !important;
  padding: 10px 12px !important;
  border: 1px solid rgba(255, 255, 255, 0.14) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  color: #fff !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  transition: transform 0.18s ease, background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.glass-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.10) !important;
  border-color: rgba(0, 212, 255, 0.35) !important;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.45), 0 0 22px rgba(0, 212, 255, 0.18),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

.glass-btn.danger {
  border-color: rgba(255, 95, 126, 0.22) !important;
}

.glass-btn.danger:hover {
  border-color: rgba(255, 95, 126, 0.40) !important;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.45), 0 0 22px rgba(255, 95, 126, 0.16),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

@media (max-width: 768px) {
  .sidebar-container {
    width: 200px;
  }
}
</style>

