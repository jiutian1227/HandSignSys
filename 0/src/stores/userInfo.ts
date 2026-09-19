import { defineStore } from 'pinia';
import Cookies from 'js-cookie';
import { Session } from '/@/utils/storage';
import request from '/@/utils/request';

export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosState => ({
		userInfos: {
			userName: '',
			role: '',
			photo: '',
			time: 0,
			roles: [],
			authBtnList: [],
		},
	}),
	actions: {
		async setUserInfos() {
			// 优先以后端用户信息为准，避免左侧“个人中心”与“跟人中心”头像显示不一致
			try {
				const userInfos: any = await this.getApiUserInfo();
				if (userInfos?.userName) {
					this.userInfos = userInfos;
					return;
				}
			} catch {
				// ignore, fallback below
			}

			// 兜底：如果后端失败则使用 session 缓存
			if (Session.get('userInfo')) this.userInfos = Session.get('userInfo');
		},
		
		async getApiUserInfo() {
			const userName = Cookies.get('userName') || '';
			if (!userName) {
				return {
					userName: '',
					role: 'user',
					photo: '',
					time: new Date().getTime(),
					roles: [],
					authBtnList: [],
				};
			}

			// 按权限按钮映射（与登录页保持一致）
			const normalizeRole = (r: string) => {
				if (r === 'admin' || r === '管理员') return 'admin';
				if (r === 'user' || r === '用户') return 'user';
				if (r === 'others' || r === '其他用户') return 'others';
				return r || 'user';
			};

			const roleFromCookie = normalizeRole(Cookies.get('role') || '');
			let resolvedRole = roleFromCookie;
			let resolvedPhoto = '';
			let resolvedName = '';

			try {
				const res: any = await request.get(`/api/user/${userName}`);
				if (res?.code === '200' && res?.data) {
					// 个人中心使用字段名：avatar / name / role
					resolvedPhoto = res.data.avatar || res.data.photo || '';
					resolvedName = res.data.name || '';
					resolvedRole = normalizeRole(res.data.role || roleFromCookie);
				}
			} catch {
				// 后端失败时用 role 做兜底头像（避免空白）
				resolvedRole = roleFromCookie;
				resolvedPhoto =
					resolvedRole === 'admin'
						? 'https://img2.baidu.com/it/u=1978192862,2048448374&fm=253&fmt=auto&app=138&f=JPEG?w=504&h=500'
						: 'https://img2.baidu.com/it/u=2370931438,70387529&fm=253&fmt=auto&app=138&f=JPEG?w=500&h=500';
			}

			const roles = resolvedRole ? [resolvedRole] : [];
			const authBtnList =
				resolvedRole === 'admin'
					? ['btn.add', 'btn.del', 'btn.edit', 'btn.link']
					: ['btn.add', 'btn.link'];

			return {
				userName,
				name: resolvedName,
				role: resolvedRole,
				photo: resolvedPhoto,
				time: new Date().getTime(),
				roles,
				authBtnList,
			};
		},
	},
});
