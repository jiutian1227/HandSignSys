import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Session } from '/@/utils/storage';

const normalizeOrigin = (v: string) => v.replace(/\/+$/, '');
const SPRING_ORIGIN = normalizeOrigin((import.meta.env.VITE_SPRING_ORIGIN as string) || 'http://47.108.20.251:9999');

const getCookie = (name: string) => {
	try {
		const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
		return match ? decodeURIComponent(match[1]) : '';
	} catch {
		return '';
	}
};

const getYoloParam = () => {
	try {
		const v = localStorage.getItem('yolo');
		if (v && v.trim()) return v.trim();
	} catch {
		// ignore
	}
	return '';
};

const getRoleParam = () => {
	// 后端很多接口用 query 参数 `role` 校验；前端登录时把 role 存在 Cookie 里
	const role = getCookie('role');
	if (role && role.trim()) return role.trim();
	return '';
};

// 配置新建一个 axios 实例
const service: AxiosInstance = axios.create({
	// 兼容不同 .env 命名：有的项目用 VITE_API_DOMAIN，有的用 VITE_API_URL
	baseURL: (import.meta.env.VITE_API_DOMAIN as string) || (import.meta.env.VITE_API_URL as string) || '',
	timeout: 500000,
	headers: { 'Content-Type': 'application/json;charset=UTF-8' },
	// withCredentials: true,
});

// 添加请求拦截器
service.interceptors.request.use(
	(config: AxiosRequestConfig) => {
		// 在发送请求之前做些什么 token
		if (Session.get('token')) {
			config.headers!['Authorization'] = `${Session.get('token')}`;
		}

		// 方案B：/api 直连 Spring；/flask 保持相对路径走 Vite 代理（规避 Flask CORS）
		if (typeof config.url === 'string' && !/^https?:\/\//i.test(config.url)) {
			if (config.url === '/api' || config.url.startsWith('/api/')) {
				config.url = `${SPRING_ORIGIN}${config.url.replace(/^\/api/, '')}`;
				// 避免 axios 仍然把 baseURL 拼接到绝对地址上
				config.baseURL = '';
			}
		}

		// 兜底：Spring 部分记录接口必须带 query `yolo`/`role`（与 imgRecords 相同约定的含 videoRecords）
		try {
			const url = config.url || '';
			const needs =
				typeof url === 'string' &&
				/imgrecords|videorecords|camerarecords/i.test(url);
			if (needs) {
				let nextUrl = url;

				const appendParam = (k: string, v: string) => {
					if (!v) return;
					if (nextUrl.includes(`${k}=`)) return;
					const join = nextUrl.includes('?') ? '&' : '?';
					nextUrl = `${nextUrl}${join}${k}=${encodeURIComponent(v)}`;
				};

				appendParam('yolo', getYoloParam());
				appendParam('role', getRoleParam());

				config.url = nextUrl;

				if (import.meta.env.DEV) {
					// eslint-disable-next-line no-console
					console.debug('[records] query =>', config.url);
				}
			}
		} catch {
			// ignore
		}

		return config;
	},
	(error) => {
		// 对请求错误做些什么
		return Promise.reject(error);
	}
);

// 添加响应拦截器
service.interceptors.response.use(
	(response) => {
		const res = response.data;
		if (res.code === 401 || res.code === 4001) {
			Session.clear(); // 清除浏览器全部临时缓存
			window.location.href = '/'; // 去登录页
			ElMessageBox.alert('你已被登出，请重新登录', '提示', {})
				.then(() => {})
				.catch(() => {});
		} else {
			return response.data;
		}
	},
	(error) => {
		if (error.message.indexOf('timeout') != -1) {
			ElMessage.error('网络超时');
		} else if (error.message == 'Network Error') {
			ElMessage.error('网络连接错误');
		} else {
			// 优先从后端返回体中提取可读错误，避免只显示 "Bad Request"
			const resp = error.response as any;
			let errData = resp?.data;
			let serverMsg: string | undefined;

			if (typeof errData === 'string') {
				try {
					errData = JSON.parse(errData);
				} catch {
					// ignore
				}
			}

			if (errData && typeof errData === 'object') {
				serverMsg = errData.msg || errData.message || errData.error || errData.data?.msg || errData.data?.message;
			}

			if (serverMsg) ElMessage.error(serverMsg);
			else if (resp?.statusText) ElMessage.error(resp.statusText);
			else ElMessage.error('接口请求失败');
		}
		return Promise.reject(error);
	}
);

export default service;
