import { createRouter, createWebHashHistory } from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import pinia from '/@/stores/index';
import { storeToRefs } from 'pinia';
import { useKeepALiveNames } from '/@/stores/keepAliveNames';
import { useRoutesList } from '/@/stores/routesList';
import { useThemeConfig } from '/@/stores/themeConfig';
import { Session } from '/@/utils/storage';
import { staticRoutes, notFoundAndNoPower } from '/@/router/route';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { NextLoading } from '/@/utils/loading';


const storesThemeConfig = useThemeConfig(pinia);
const { themeConfig } = storeToRefs(storesThemeConfig);
const { isRequestRoutes } = themeConfig.value;


export const router = createRouter({
	history: createWebHashHistory(),

	routes: [...notFoundAndNoPower, ...staticRoutes],
});


export function formatFlatteningRoutes(arr: any) {
	if (arr.length <= 0) return false;
	for (let i = 0; i < arr.length; i++) {
		if (arr[i].children) {
			arr = arr.slice(0, i + 1).concat(arr[i].children, arr.slice(i + 1));
		}
	}
	return arr;
}


export function formatTwoStageRoutes(arr: any) {
	if (arr.length <= 0) return false;
	const newArr: any = [];
	const cacheList: Array<string> = [];
	arr.forEach((v: any) => {
		if (v.path === '/') {
			newArr.push({ component: v.component, name: v.name, path: v.path, redirect: v.redirect, meta: v.meta, children: [] });
		} else {
			if (v.path.indexOf('/:') > -1) {
				v.meta['isDynamic'] = true;
				v.meta['isDynamicPath'] = v.path;
			}
			newArr[0].children.push({ ...v });
			if (newArr[0].meta.isKeepAlive && v.meta.isKeepAlive) {
				cacheList.push(v.name);
				const stores = useKeepALiveNames(pinia);
				stores.setCacheKeepAlive(cacheList);
			}
		}
	});
	return newArr;
}



router.beforeEach(async (to, from, next) => {
	NProgress.configure({ showSpinner: false });
	if (to.meta.title) NProgress.start();
	const token = Session.get('token');
	if (to.path === '/login' && !token) {
		next();
		NProgress.done();
	} else if (to.path === '/register' && !token) {
		next();
		NProgress.done();
	} else if (to.path === '/videoShow' && token) {
		next();
		NProgress.done();
	}else {
		if (!token) {
			next(`/login?redirect=${to.path}&params=${JSON.stringify(to.query ? to.query : to.params)}`);
			Session.clear();
			NProgress.done();
		} else if (token && to.path === '/login') {
			next('/home');
			NProgress.done();
		} else {
			const storesRoutesList = useRoutesList(pinia);
			const { routesList } = storeToRefs(storesRoutesList);
			if (routesList.value.length === 0) {
				try {
					// 避免动态路由初始化异常/卡死导致一直停留在 Loading
					const withTimeout = <T,>(p: Promise<T>, ms: number) =>
						Promise.race([
							p,
							new Promise<T>((_, reject) => setTimeout(() => reject(new Error('route init timeout')), ms)),
						]);
					if (isRequestRoutes) {
						const isNoPower = await withTimeout(initBackEndControlRoutes(), 8000);
						if (isNoPower) {
							next('/401');
							return;
						}
					} else {
						const isNoPower = await withTimeout(initFrontEndControlRoutes(), 8000);
						if (isNoPower) {
							next('/401');
							return;
						}
					}
					next({ path: to.path, query: to.query });
				} catch (e) {
					// 初始化动态路由失败时，清理会话并回到登录，避免一直停在 Loading
					Session.clear();
					NextLoading.done(0);
					next('/login');
				}
			} else {
				next();
			}
		}
	}
});

// 路由加载后
router.afterEach(() => {
	NProgress.done();
	// 兜底：确保页面切换后移除全局 Loading，避免卡住
	NextLoading.done(600);
});

// 导出路由
export default router;
