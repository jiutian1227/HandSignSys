<template>
  <div class="navbar-container">
    <!-- 手势检测背景 - 与登录页面保持一致 -->
    <div class="gesture-background">
      <!-- 手势粒子 -->
      <div class="gesture-particles">
        <div class="particle" v-for="n in 15" :key="`particle-${n}`" :style="getParticleStyle(n)">
          <div class="particle-glow"></div>
        </div>
      </div>
      
      <!-- 手势波纹 -->
      <div class="gesture-ripples">
        <div class="ripple" v-for="n in 8" :key="`ripple-${n}`" :style="getRippleStyle(n)"></div>
      </div>
      
      <!-- 传感器网格 -->
      <div class="sensor-grid">
        <div class="grid-node" v-for="n in 20" :key="`node-${n}`" :style="getNodeStyle(n)">
          <div class="node-pulse"></div>
        </div>
      </div>
      
      <!-- 手势符号云 -->
      <div class="gesture-cloud">
        <div class="gesture-icon" v-for="n in 8" :key="`gesture-${n}`" :style="getGestureStyle(n)">
          {{ getRandomGesture() }}
        </div>
      </div>
      
      <!-- 信号扫描线 -->
      <div class="signal-scan">
        <div class="wave-line" v-for="n in 4" :key="`wave-${n}`" :style="getWaveStyle(n)">
          <div class="wave-path"></div>
        </div>
      </div>
    </div>
    
    <div class="navbar-content">
      <!-- 左侧Logo和系统名称 -->
      <div class="navbar-left">
        <div class="logo-container">
          <div class="brand-icon">
            <img class="brand-logo-img" :src="brandLogo" alt="无声桥" />
          </div>
          <div class="system-name">
            <h2 class="system-title">
              <span class="gesture-text">无声桥-灵析手语</span>
            </h2>
            <p class="system-subtitle">智能手势识别系统</p>
          </div>
        </div>
        
        <!-- 主要功能菜单 -->
        <div class="main-menu">
          <el-menu
            :default-active="activeMenu"
            mode="horizontal"
            background-color="transparent"
            text-color="rgba(255, 255, 255, 0.8)"
            active-text-color="#00D4FF"
            @select="handleMenuSelect"
            class="gesture-menu"
          >
            <el-menu-item index="/home">
              <el-icon><HomeFilled /></el-icon>
              <span class="menu-text">控制中心</span>
              <div class="menu-glow"></div>
              <div class="menu-pulse"></div>
            </el-menu-item>
            <el-menu-item index="/imgPredict">
              <el-icon><Picture /></el-icon>
              <span class="menu-text">图像分析</span>
              <div class="menu-glow"></div>
              <div class="menu-pulse"></div>
            </el-menu-item>
            <el-menu-item index="/videoPredict">
              <el-icon><VideoPlay /></el-icon>
              <span class="menu-text">视频检测</span>
              <div class="menu-glow"></div>
              <div class="menu-pulse"></div>
            </el-menu-item>
            <el-menu-item index="/cameraPredict">
              <el-icon><Camera /></el-icon>
              <span class="menu-text">实时监控</span>
              <div class="menu-glow"></div>
              <div class="menu-pulse"></div>
            </el-menu-item>
            <el-sub-menu index="records">
              <template #title>
                <el-icon><Document /></el-icon>
                <span class="menu-text">数据档案</span>
                <div class="menu-glow"></div>
                <div class="menu-pulse"></div>
              </template>
              <el-menu-item index="/imgRecord">
                <el-icon><Picture /></el-icon>
                <span class="submenu-text">图像记录</span>
                <div class="submenu-glow"></div>
              </el-menu-item>
              <el-menu-item index="/videoRecord">
                <el-icon><VideoPlay /></el-icon>
                <span class="submenu-text">视频记录</span>
                <div class="submenu-glow"></div>
              </el-menu-item>
              <el-menu-item index="/cameraRecord">
                <el-icon><Camera /></el-icon>
                <span class="submenu-text">监控记录</span>
                <div class="submenu-glow"></div>
              </el-menu-item>
            </el-sub-menu>
            <el-menu-item v-if="userInfo.role === 'admin'" index="/usermanage">
              <el-icon><User /></el-icon>
              <span class="menu-text">权限管理</span>
              <div class="menu-glow"></div>
              <div class="menu-pulse"></div>
            </el-menu-item>
          </el-menu>
        </div>
      </div>
      
      <!-- 右侧用户信息和功能 -->
      <div class="navbar-right">
        <!-- 系统状态指示器 -->
        <div class="system-status">
          <div class="status-indicator">
            <div class="status-dot active"></div>
            <span class="status-text">视觉计算就绪</span>
          </div>
          <div class="status-info">
            <span>v3.1.0 • 深度神经网络模式</span>
          </div>
        </div>
        
        <!-- 用户信息下拉菜单 -->
        <el-dropdown @command="handleCommand" class="gesture-dropdown">
          <div class="user-info">
            <div class="user-avatar" v-if="avatarSrc">
              <img :src="avatarSrc" alt="用户头像" />
              <div class="avatar-scan"></div>
              <div class="avatar-glow"></div>
            </div>
            <div class="avatar-placeholder" v-else>
              <div class="user-icon-small"></div>
              <div class="avatar-scan"></div>
              <div class="avatar-glow"></div>
            </div>
            <div class="user-details">
              <span class="user-name">{{ userInfo.name || userInfo.username }}</span>
              <span class="user-role">{{ getRoleText(userInfo.role) }}</span>
            </div>
            <el-icon class="dropdown-arrow"><ArrowDown /></el-icon>
            <div class="user-glow"></div>
          </div>
          <template #dropdown>
            <el-dropdown-menu class="gesture-dropdown-menu">
              <el-dropdown-item command="personal">
                <div class="dropdown-item-content">
                  <div class="item-icon">
                    <el-icon><User /></el-icon>
                  </div>
                  <span class="item-text">个人中心</span>
                  <div class="item-trail"></div>
                </div>
              </el-dropdown-item>
              <el-dropdown-item divided command="logout">
                <div class="dropdown-item-content">
                  <div class="item-icon">
                    <el-icon><SwitchButton /></el-icon>
                  </div>
                  <span class="item-text">退出系统</span>
                  <div class="item-trail"></div>
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { 
  User, 
  SwitchButton, 
  ArrowDown, 
  HomeFilled,
  Picture,
  VideoPlay,
  Camera,
  Document
} from '@element-plus/icons-vue';
import { storeToRefs } from 'pinia';
import { useUserInfo } from '/@/stores/userInfo';
import { Session } from '/@/utils/storage';
import { resolveFileUrl } from '/@/utils/resolveFileUrl';
import brandLogo from '/@/assets/brand-logo-wushengqiao.png';

// 定义变量
const router = useRouter();
const route = useRoute();
const stores = useUserInfo();
const { userInfos } = storeToRefs(stores);

const avatarSrc = computed(() =>
	resolveFileUrl((userInfos.value as any).avatar || userInfos.value.photo || ''),
);

// 用户信息
const userInfo = reactive({
  username: '',
  name: '',
  role: '',
});

// 当前激活菜单
const activeMenu = ref('/home');

// 动态样式生成函数
const getParticleStyle = (index: number) => {
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const size = 2 + Math.random() * 4;
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

const getRippleStyle = (index: number) => {
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const size = 50 + Math.random() * 150;
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

const getNodeStyle = (index: number) => {
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const size = 3 + Math.random() * 6;
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

const getGestureStyle = (index: number) => {
  const left = Math.random() * 100;
  const top = Math.random() * 100;
  const size = 12 + Math.random() * 18;
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

const getWaveStyle = (index: number) => {
  const left = Math.random() * 100;
  const height = 100 + Math.random() * 200;
  const duration = 3 + Math.random() * 5;
  const delay = Math.random() * 2;
  
  return {
    left: `${left}%`,
    height: `${height}px`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  };
};

// 获取角色文本
const getRoleText = (role: string) => {
  const roleMap: Record<string, string> = {
    'admin': '系统管理员',
    'analyst': '手势分析师',
    'operator': '操作员',
    'viewer': '观察员'
  };
  return roleMap[role] || '检测用户';
};

// 菜单选择处理
const handleMenuSelect = (index: string) => {
  router.push(index);
};

// 下拉菜单命令处理
const handleCommand = (command: string) => {
  switch (command) {
    case 'personal':
      router.push('/personal');
      break;
    case 'logout':
      handleLogout();
      break;
  }
};

// 退出登录处理
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出手势检测系统吗？', '安全提示', {
    confirmButtonText: '确认退出',
    cancelButtonText: '取消',
    type: 'warning',
    customClass: 'gesture-message-box'
  }).then(() => {
    // 清除登录信息
    Session.clear();
    localStorage.removeItem('token');
    
    // 重置用户信息
    Object.assign(userInfo, {
      username: '',
      name: '',
      role: '',
    });
    
    // 跳转到登录页
    router.push('/login');
    
    ElMessage.success('已安全退出手势检测系统');
  }).catch(() => {
    // 用户取消操作
  });
};

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    // 从store获取基础信息
    userInfo.username = userInfos.value.userName;
    
    if (!userInfo.username) {
      console.warn('用户名不存在，无法获取用户信息');
      return;
    }
    
    // 直接从store获取用户信息
    if (userInfos.value.name) {
      userInfo.name = userInfos.value.name;
    } else {
      userInfo.name = userInfo.username;
    }
    
    // 角色处理
    if (userInfos.value.role) {
      userInfo.role = userInfos.value.role;
    } else {
      userInfo.role = 'analyst';
    }
    
  } catch (error) {
    console.error('获取用户信息失败:', error);
    // 使用默认信息
    userInfo.name = userInfo.username;
    userInfo.role = 'analyst';
  }
};

// 监听用户信息变化
watch(() => stores.userInfos, (newUserInfo) => {
  if (newUserInfo.userName && newUserInfo.userName !== userInfo.username) {
    fetchUserInfo();
  }
}, { deep: true });

// 更新激活菜单
const updateActiveMenu = () => {
  activeMenu.value = route.path;
};

// 页面加载时
onMounted(() => {
  // 获取用户信息
  fetchUserInfo();
  
  // 设置当前激活菜单
  updateActiveMenu();
  
  // 监听路由变化
  router.afterEach(updateActiveMenu);
});
</script>

<style scoped lang="scss">
.navbar-container {
  position: relative;
  height: 80px;
  width: 100%;
  overflow: hidden;
  z-index: 100;
  background: rgba(15, 23, 42, 0.42);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--app-glass-border, rgba(129, 230, 217, 0.22));
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);

  /* 全站统一底图由 html/body 承担，隐藏顶栏重复动效层 */
  .gesture-background {
    display: none;
  }

  .navbar-content {
    position: relative;
    z-index: 2;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;
    padding: 0 30px;
    backdrop-filter: blur(10px);
    
    .navbar-left {
      display: flex;
      align-items: center;
      flex: 1;
      
      .logo-container {
        display: flex;
        align-items: center;
        flex-shrink: 0;
        margin-right: clamp(16px, 3vw, 40px);
        position: relative;
        min-width: 0;
        
        .brand-icon {
          position: relative;
          flex-shrink: 0;
          width: clamp(40px, 5.5vw, 56px);
          height: clamp(40px, 5.5vw, 56px);
          margin-right: clamp(12px, 2vw, 20px);
          border-radius: 22%;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(0, 212, 255, 0.25),
            0 0 24px rgba(0, 212, 255, 0.35),
            0 4px 14px rgba(0, 0, 0, 0.35);
          
          .brand-logo-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
            vertical-align: top;
          }
        }
        
        .system-name {
          min-width: 0;
          
          .system-title {
            display: flex;
            align-items: center;
            gap: 6px;
            margin: 0 0 4px;
            font-size: clamp(16px, 2.2vw, 20px);
            font-weight: 700;
            line-height: 1.2;
            
            .gesture-text {
              background: linear-gradient(90deg, #7ee8ff 0%, #00d4ff 35%, #6b7cff 75%, #8b78ff 100%);
              -webkit-background-clip: text;
              background-clip: text;
              -webkit-text-fill-color: transparent;
              letter-spacing: 0.4px;
              white-space: nowrap;
            }
          }
          
          .system-subtitle {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.6);
            margin: 0;
            letter-spacing: 1px;
            font-weight: 400;
          }
        }
      }
      
      .main-menu {
        flex: 1;
        
        .gesture-menu {
          border: none;
          background: transparent;
          
          :deep(.el-menu-item) {
            position: relative;
            height: 80px;
            line-height: 80px;
            border-bottom: 3px solid transparent;
            transition: all 0.3s ease;
            padding: 0 24px !important;
            margin: 0 4px;
            color: rgba(255, 255, 255, 0.8) !important;
            border-radius: 8px 8px 0 0;
            
            .menu-glow {
              position: absolute;
              bottom: -3px;
              left: 50%;
              width: 0;
              height: 3px;
              background: linear-gradient(90deg, #00D4FF, #8B78FF);
              transform: translateX(-50%);
              transition: width 0.3s ease;
              border-radius: 3px;
            }
            
            .menu-pulse {
              position: absolute;
              top: 50%;
              left: 50%;
              width: 0;
              height: 0;
              background: radial-gradient(circle, rgba(139, 120, 255, 0.3), transparent);
              border-radius: 50%;
              transform: translate(-50%, -50%);
              transition: all 0.3s ease;
              opacity: 0;
            }
            
            .menu-text {
              position: relative;
              z-index: 1;
              font-weight: 500;
              letter-spacing: 0.5px;
              font-size: 14px;
              color: rgba(255, 255, 255, 0.8);
            }
            
            .el-icon {
              margin-right: 8px;
              font-size: 18px;
              color: rgba(255, 255, 255, 0.8);
            }
            
            &:hover {
              background: rgba(255, 255, 255, 0.05);
              
              .menu-glow {
                width: 80%;
                box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
              }
              
              .menu-pulse {
                width: 60px;
                height: 60px;
                opacity: 0.3;
              }
              
              .menu-text,
              .el-icon {
                color: #ffffff;
              }
            }
            
            &.is-active {
              background: rgba(0, 212, 255, 0.1);
              color: #ffffff !important;
              
              .menu-glow {
                width: 100%;
                box-shadow: 0 0 15px rgba(0, 212, 255, 0.7);
              }
              
              .menu-pulse {
                width: 40px;
                height: 40px;
                opacity: 0.5;
                animation: pulse 2s ease-in-out infinite;
              }
              
              .menu-text,
              .el-icon {
                color: #00D4FF;
                text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
              }
            }
          }
          
          :deep(.el-sub-menu) {
            .el-sub-menu__title {
              position: relative;
              height: 80px;
              line-height: 80px;
              border-bottom: 3px solid transparent;
              transition: all 0.3s ease;
              padding: 0 24px !important;
              margin: 0 4px;
              color: rgba(255, 255, 255, 0.8) !important;
              border-radius: 8px 8px 0 0;
              
              .menu-glow {
                position: absolute;
                bottom: -3px;
                left: 50%;
                width: 0;
                height: 3px;
                background: linear-gradient(90deg, #00D4FF, #8B78FF);
                transform: translateX(-50%);
                transition: width 0.3s ease;
                border-radius: 3px;
              }
              
              .menu-pulse {
                position: absolute;
                top: 50%;
                left: 50%;
                width: 0;
                height: 0;
                background: radial-gradient(circle, rgba(139, 120, 255, 0.3), transparent);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                transition: all 0.3s ease;
                opacity: 0;
              }
              
              .menu-text {
                position: relative;
                z-index: 1;
                font-weight: 500;
                letter-spacing: 0.5px;
                font-size: 14px;
                color: rgba(255, 255, 255, 0.8);
              }
              
              .el-icon {
                margin-right: 8px;
                font-size: 18px;
                color: rgba(255, 255, 255, 0.8);
              }
              
              &:hover {
                background: rgba(255, 255, 255, 0.05);
                
                .menu-glow {
                  width: 80%;
                  box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
                }
                
                .menu-pulse {
                  width: 60px;
                  height: 60px;
                  opacity: 0.3;
                }
                
                .menu-text,
                .el-icon {
                  color: #ffffff;
                }
              }
            }
            
            &.is-active .el-sub-menu__title {
              background: rgba(0, 212, 255, 0.1);
              color: #ffffff !important;
              
              .menu-glow {
                width: 100%;
                box-shadow: 0 0 15px rgba(0, 212, 255, 0.7);
              }
              
              .menu-pulse {
                width: 40px;
                height: 40px;
                opacity: 0.5;
                animation: pulse 2s ease-in-out infinite;
              }
              
              .menu-text,
              .el-icon {
                color: #00D4FF;
                text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
              }
            }
          }
        }
      }
    }
    
    .navbar-right {
      display: flex;
      align-items: center;
      gap: 24px;
      
      .system-status {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          
          .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            position: relative;
            
            &.active {
              background: #6BFFB8;
              box-shadow: 0 0 10px #6BFFB8;
              animation: statusPulse 2s ease-in-out infinite;
            }
          }
          
          .status-text {
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.5px;
          }
        }
        
        .status-info {
          span {
            color: rgba(255, 255, 255, 0.4);
            font-size: 11px;
            font-weight: 400;
            letter-spacing: 0.5px;
          }
        }
      }
      
      .gesture-dropdown {
        cursor: pointer;
        position: relative;
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 16px;
          border-radius: 16px;
          transition: all 0.3s ease;
          /* 去掉管理员下面的白条框效果 */
          background: transparent;
          border: none;
          position: relative;
          overflow: hidden;
          
          &:hover {
            background: rgba(0, 212, 255, 0.1);
            border: 1px solid rgba(0, 212, 255, 0.4);
            transform: translateY(-2px);
            box-shadow: 
              0 5px 20px rgba(0, 212, 255, 0.3),
              0 0 30px rgba(0, 212, 255, 0.1);
            
            .user-glow {
              opacity: 0.6;
            }
            
            .dropdown-arrow {
              transform: rotate(180deg);
            }
          }
          
          .user-avatar, .avatar-placeholder {
            position: relative;
            width: 40px;
            height: 40px;
            border-radius: 10px;
            overflow: hidden;
            background: linear-gradient(135deg, #00D4FF, #8B78FF);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2;
            
            img {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
            
            .user-icon-small {
              width: 20px;
              height: 20px;
              background: white;
              border-radius: 50%;
              position: relative;
            }
            
            .user-icon-small::after {
              content: '';
              position: absolute;
              top: 30%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 8px;
              height: 8px;
              background: linear-gradient(135deg, #00D4FF, #8B78FF);
              border-radius: 50%;
            }
            
            .user-icon-small::before {
              content: '';
              position: absolute;
              top: 70%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 12px;
              height: 6px;
              background: linear-gradient(135deg, #00D4FF, #8B78FF);
              border-radius: 6px 6px 0 0;
            }
            
            .avatar-scan {
              position: absolute;
              top: 0;
              left: -100%;
              width: 100%;
              height: 100%;
              background: linear-gradient(90deg,
                transparent,
                rgba(255, 255, 255, 0.2),
                transparent
              );
              animation: avatarScan 3s linear infinite;
              z-index: 1;
            }
            
            .avatar-glow {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              background: linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(139, 120, 255, 0.3));
              opacity: 0;
              transition: opacity 0.3s ease;
              z-index: 1;
            }
          }
          
          &:hover .avatar-glow {
            opacity: 1;
          }
          
          .user-details {
            display: flex;
            flex-direction: column;
            gap: 2px;
            z-index: 2;
            
            .user-name {
              color: white;
              font-size: 14px;
              font-weight: 600;
              letter-spacing: 0.5px;
            }
            
            .user-role {
              /* 管理员等角色文字改为纯白色 */
              color: #ffffff;
              font-size: 11px;
              font-weight: 400;
              letter-spacing: 0.5px;
            }
          }
          
          .dropdown-arrow {
            color: rgba(255, 255, 255, 0.5);
            font-size: 14px;
            transition: transform 0.3s ease;
            z-index: 2;
          }
          
          .user-glow {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, 
              rgba(0, 212, 255, 0.1) 0%,
              rgba(139, 120, 255, 0.1) 50%,
              rgba(0, 212, 255, 0.1) 100%);
            opacity: 0;
            transition: opacity 0.3s ease;
            border-radius: 16px;
          }
        }
      }
    }
  }
}

// 下拉菜单样式
:deep(.gesture-dropdown-menu) {
  background: rgba(10, 14, 23, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3) !important;
  border-radius: 16px !important;
  box-shadow: 
    0 15px 35px rgba(0, 0, 0, 0.5),
    0 0 60px rgba(0, 212, 255, 0.2),
    inset 0 0 20px rgba(0, 212, 255, 0.1) !important;
  padding: 8px !important;
  
  .el-dropdown-menu__item {
    color: rgba(255, 255, 255, 0.8) !important;
    padding: 0 !important;
    margin: 4px 0;
    border-radius: 12px !important;
    overflow: hidden;
    transition: all 0.3s ease;
    position: relative;
    
    .dropdown-item-content {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      position: relative;
      z-index: 2;
      
      .item-icon {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        
        .el-icon {
          color: #00D4FF;
          font-size: 16px;
        }
      }
      
      .item-text {
        font-size: 13px;
        font-weight: 500;
        letter-spacing: 0.5px;
        color: rgba(255, 255, 255, 0.8);
      }
      
      .item-trail {
        position: absolute;
        bottom: 0;
        left: 0;
        width: 0;
        height: 1px;
        background: linear-gradient(90deg, #00D4FF, #8B78FF);
        transition: width 0.3s ease;
      }
    }
    
    &:hover {
      background: rgba(0, 212, 255, 0.15) !important;
      transform: translateX(4px);
      
      .dropdown-item-content {
        .item-text {
          color: #ffffff;
        }
        
        .item-trail {
          width: 100%;
        }
      }
    }
  }
  
  .el-dropdown-menu__item--divided {
    margin-top: 8px;
    padding-top: 8px !important;
    border-top: 1px solid rgba(255, 255, 255, 0.1) !important;
  }
}

// 子菜单样式修复
:deep(.el-sub-menu .el-menu) {
  background: rgba(10, 14, 23, 0.95) !important;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(0, 212, 255, 0.3) !important;
  border-radius: 12px !important;
  box-shadow: 
    0 10px 30px rgba(0, 0, 0, 0.4),
    0 0 40px rgba(0, 212, 255, 0.1) !important;
  padding: 8px !important;
  
  .el-menu-item {
    color: rgba(255, 255, 255, 0.8) !important;
    border-radius: 8px !important;
    margin: 2px 0;
    transition: all 0.3s ease;
    position: relative;
    
    .el-icon {
      color: rgba(255, 255, 255, 0.8) !important;
    }
    
    .submenu-text {
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }
    
    .submenu-glow {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: 1px;
      background: linear-gradient(90deg, #00D4FF, #8B78FF);
      transition: width 0.3s ease;
    }
    
    &:hover {
      background: rgba(0, 212, 255, 0.15) !important;
      color: #ffffff !important;
      
      .el-icon {
        color: #ffffff !important;
      }
      
      .submenu-glow {
        width: 100%;
      }
    }
    
    &.is-active {
      background: rgba(0, 212, 255, 0.2) !important;
      color: #00D4FF !important;
      
      .el-icon {
        color: #00D4FF !important;
      }
      
      .submenu-glow {
        width: 100%;
        height: 2px;
        box-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
      }
    }
  }
}

// 动画定义 - 复用登录页面的动画
@keyframes particleFloat {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(-10px) rotate(180deg);
  }
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

@keyframes nodePulse {
  0% { opacity: 0.3; transform: scale(1); }
  100% { opacity: 0.8; transform: scale(1.2); }
}

@keyframes pulseWave {
  0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 0.2; transform: translate(-50%, -50%) scale(2); }
}

@keyframes gestureFloat {
  0% {
    transform: translateY(0) rotate(0deg);
  }
  100% {
    transform: translateY(-20px) rotate(5deg);
  }
}

@keyframes waveScan {
  0% {
    top: -100px;
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

@keyframes statusPulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.2); }
}

@keyframes pulse {
  0%, 100% { 
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.5;
  }
  50% { 
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.3;
  }
}

@keyframes avatarScan {
  0% { left: -100%; }
  100% { left: 100%; }
}

// 响应式设计
@media (max-width: 1200px) {
  .navbar-container {
    .navbar-content {
      .navbar-left {
        .main-menu {
          :deep(.gesture-menu) {
            .el-menu-item,
            .el-sub-menu .el-sub-menu__title {
              padding: 0 18px !important;
              
              .menu-text {
                font-size: 13px;
              }
            }
          }
        }
      }
    }
  }
}

@media (max-width: 992px) {
  .navbar-container {
    .navbar-content {
      .navbar-left {
        .logo-container {
          margin-right: 20px;
          
          .system-name {
            .system-title {
              font-size: 16px;
              flex-wrap: wrap;
              gap: 4px;
            }
            
            .system-subtitle {
              display: none;
            }
          }
        }
        
        .main-menu {
          :deep(.gesture-menu) {
            .el-menu-item,
            .el-sub-menu .el-sub-menu__title {
              padding: 0 12px !important;
              
              span:not(.el-icon) {
                display: none;
              }
              
              .el-icon {
                margin-right: 0;
                font-size: 16px;
              }
            }
          }
        }
      }
      
      .navbar-right {
        .system-status {
          display: none;
        }
        
        .gesture-dropdown {
          .user-info {
            .user-details {
              display: none;
            }
          }
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .navbar-container {
    height: auto;
    min-height: 70px;
    
    .navbar-content {
      flex-direction: column;
      padding: 10px 20px;
      
      .navbar-left {
        width: 100%;
        justify-content: space-between;
        margin-bottom: 10px;
        
        .logo-container {
          .brand-icon {
            width: 40px;
            height: 40px;
            margin-right: 12px;
          }
          
          .system-name {
            .system-title {
              font-size: 15px;
            }
          }
        }
        
        .main-menu {
          flex: none;
          
          :deep(.gesture-menu) {
            .el-menu-item,
            .el-sub-menu .el-sub-menu__title {
              height: 60px;
              line-height: 60px;
              padding: 0 8px !important;
            }
          }
        }
      }
      
      .navbar-right {
        width: 100%;
        justify-content: space-between;
        
        .system-status {
          display: flex;
          
          .status-indicator .status-text {
            display: none;
          }
        }
        
        .gesture-dropdown {
          .user-info {
            padding: 6px 12px;
          }
        }
      }
    }
  }
}
</style>