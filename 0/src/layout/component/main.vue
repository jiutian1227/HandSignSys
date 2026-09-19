<!-- /@/layout/component/main.vue -->
<template>
  <div class="layout-container">
    <!-- 左侧侧边栏 -->
    <LayoutSidebar v-if="showNavbar" />

    <el-main class="layout-main" :style="mainStyle">
      <el-scrollbar
        ref="layoutMainScrollbarRef"
        class="layout-main-scroll layout-backtop-header-fixed"
        wrap-class="layout-main-scroll"
        view-class="layout-main-scroll"
      >
        <LayoutParentView />
        <LayoutFooter v-if="isFooter" />
      </el-scrollbar>
      <el-backtop :target="setBacktopClass" />
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, onMounted, computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useThemeConfig } from '/@/stores/themeConfig';
import { NextLoading } from '/@/utils/loading';

// 引入组件：左侧侧边栏 + 主体
const LayoutSidebar = defineAsyncComponent(() => import('/@/layout/component/sidebar.vue'));
const LayoutParentView = defineAsyncComponent(() => import('/@/layout/routerView/parent.vue'));
const LayoutFooter = defineAsyncComponent(() => import('/@/layout/footer/index.vue'));

// 定义变量内容
const layoutMainScrollbarRef = ref();
const route = useRoute();
const storesTagsViewRoutes = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { isTagsViewCurrenFull } = storeToRefs(storesTagsViewRoutes);

// 设置是否显示侧边栏（沿用 showNavbar 配置）
const showNavbar = computed(() => {
	return !route.meta.isIframe && themeConfig.value.showNavbar !== false;
});

// 设置 footer 显示/隐藏
const isFooter = computed(() => {
	return themeConfig.value.isFooter && !route.meta.isIframe;
});

// 设置 header 固定
const isFixedHeader = computed(() => {
	return themeConfig.value.isFixedHeader;
});

// 设置 Backtop 回到顶部
const setBacktopClass = computed(() => {
	if (themeConfig.value.isFixedHeader) return `.layout-backtop-header-fixed .el-scrollbar__wrap`;
	else return `.layout-backtop .el-scrollbar__wrap`;
});

// 设置主内容区的高度
const setMainHeight = computed(() => {
	if (isTagsViewCurrenFull.value) return '0px';
	
	const { isTagsview, layout } = themeConfig.value;
	const navbarHeight = showNavbar.value ? '60px' : '0px';
	
	if (isTagsview && layout !== 'classic') {
		return `calc(85px + ${navbarHeight})`;
	} else {
		return `calc(51px + ${navbarHeight})`;
	}
});

// 设置主内容区样式
const mainStyle = computed(() => {
	if (isFixedHeader.value) {
		return `height: calc(100% - ${setMainHeight.value})`;
	} else {
		return `minHeight: calc(100% - ${setMainHeight.value})`;
	}
});

// 页面加载前
onMounted(() => {
	NextLoading.done(600);
});

// 暴露变量
defineExpose({
	layoutMainScrollbarRef,
});
</script>

<style scoped>
.layout-container {
	height: 100%;
	display: flex;
	flex-direction: row;
}

.layout-main {
	flex: 1;
	overflow: hidden;
	background: transparent;
}
</style>