import { RouteRecordRaw } from 'vue-router';


declare module 'vue-router' {
	interface RouteMeta {
		title?: string;
		isLink?: string;
		isHide?: boolean;
		isKeepAlive?: boolean;
		isAffix?: boolean;
		isIframe?: boolean;
		roles?: string[];
		icon?: string;
	}
}


export const dynamicRoutes: Array<RouteRecordRaw> = [
	{
		path: '/',
		name: '/',
		component: () => import('/@/layout/index.vue'),
		redirect: '/imgPredict',
		meta: {
			isKeepAlive: true,
		},
		children: [
			{
				path: '/home',
				name: 'home',
				component: () => import('/@/views/home/index.vue'),
				meta: {
					title: '首页',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					// 普通用户（user）不可访问控制中心
					roles: ['admin', 'specialist'],
					icon: 'iconfont icon-shouye',
				},
			},
			{
				path: '/imgPredict',
				name: 'imgPredict',
				component: () => import('/@/views/imgPredict/index.vue'),
				meta: {
					title: '图像检测',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'user', 'others'],
					icon: 'iconfont icon-tupian',
				},
			},
			{
				path: '/videoPredict',
				name: 'videoPredict',
				component: () => import('/@/views/videoPredict/index.vue'),
				meta: {
					title: '视频检测',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'user', 'others'],
					icon: 'iconfont icon-shipin1',
				},
			},
			{
				path: '/cameraPredict',
				name: 'cameraPredict',
				component: () => import('/@/views/cameraPredict/index.vue'),
				meta: {
					title: '摄像检测',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'user', 'others'],
					icon: 'iconfont icon-shexiangtou1',
				},
			},
			{
				path: '/imgRecord',
				name: 'imgRecord',
				component: () => import('/@/views/imgRecord/index.vue'),
				meta: {
					title: '图片识别记录',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'user', 'others'],
					icon: 'iconfont icon-tupianjilu',
				},
			},
			{
				path: '/videoRecord',
				name: 'videoRecord',
				component: () => import('/@/views/videoRecord/index.vue'),
				meta: {
					title: '视频识别记录',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'user', 'others'],
					icon: 'iconfont icon-shipinjilu',
				},
			},
			{
				path: '/cameraRecord',
				name: 'cameraRecord',
				component: () => import('/@/views/cameraRecord/index.vue'),
				meta: {
					title: '摄像识别记录',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'user', 'others'],
					icon: 'iconfont icon-NVR',
				},
			},
			{
				path: '/usermanage',
				name: 'usermanage',
				component: () => import('/@/views/userManage/index.vue'),
				meta: {
					title: '用户管理',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin'],
					icon: 'iconfont icon-yonghuguanli',
				},
			},
			{
				path: '/personal',
				name: 'personal',
				component: () => import('/@/views/personal/index.vue'),
				meta: {
					title: '个人中心',
					isLink: '',
					isHide: false,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'user', 'others'],
					icon: 'iconfont icon-gerenzhongxin',
				},
			},
			{
				path: '/personal/edit',
				name: 'personalEdit',
				component: () => import('/@/views/personal/edit.vue'),
				meta: {
					title: '修改个人信息',
					isLink: '',
					isHide: true,
					isKeepAlive: true,
					isAffix: false,
					isIframe: false,
					roles: ['admin', 'user', 'others'],
					icon: 'iconfont icon-gerenzhongxin',
				},
			}
			
		],
	},
];


export const notFoundAndNoPower = [
	{
		path: '/:path(.*)*',
		name: 'notFound',
		component: () => import('/@/views/error/404.vue'),
		meta: {
			title: 'message.staticRoutes.notFound',
			isHide: true,
		},
	},
	{
		path: '/401',
		name: 'noPower',
		component: () => import('/@/views/error/401.vue'),
		meta: {
			title: 'message.staticRoutes.noPower',
			isHide: true,
		},
	},
];


export const staticRoutes: Array<RouteRecordRaw> = [
	{
		path: '/login',
		name: 'login',
		component: () => import('/@/views/login/index.vue'),
		meta: {
			title: '登录',
		},
	},
	{
		path: '/register',
		name: 'register',
		// 统一使用新拟态登录页的注册面板
		redirect: { path: '/login', query: { tab: 'register' } },
		meta: {
			title: '注册',
		},
	},
	{
		path: '/videoShow',
		name: 'videoShow',
		component: () => import('/@/views/videoRecord/show.vue'),
		meta: {
			title: '记录查看',
		},
	},

];
