import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';

const pathResolve = (dir: string) => {
	return resolve(__dirname, '.', dir);
}

const alias: Record<string, string> = {
	'/@': pathResolve('./src/'),
	'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
};

const viteConfig = defineConfig(({ mode, command }: ConfigEnv) => {
	// 第三个参数 ''：加载全部前缀
	const env = loadEnv(mode, process.cwd(), '');
	const useDevProxy = String(env.VITE_USE_DEV_PROXY || '').toLowerCase() === 'true';
	const proxyApiTarget = `${(env.VITE_PROXY_API_TARGET || env.VITE_SPRING_ORIGIN || 'https://springboot.fanzengxie.icu').replace(/\/$/, '')}/`;
	const proxyFlaskTarget = `${(env.VITE_PROXY_FLASK_TARGET || env.VITE_FLASK_ORIGIN || 'https://flask.fanzengxie.icu').replace(/\/$/, '')}/`;

	if (command === 'serve' && useDevProxy) {
		// eslint-disable-next-line no-console
		console.log(`[vite] 已启用开发代理 /api   -> ${proxyApiTarget}（rewrite 去掉 /api 前缀）`);
		// eslint-disable-next-line no-console
		console.log(`[vite] 已启用开发代理 /flask -> ${proxyFlaskTarget}（rewrite 去掉 /flask 前缀）`);
	} else if (command === 'serve') {
		// eslint-disable-next-line no-console
		console.log('[vite] 当前为后端直连模式（未启用开发代理）');
	}

	return {
		plugins: [vue(), vueSetupExtend()],
		root: process.cwd(),
		resolve: { alias },
		base: command === 'serve' ? './' : env.VITE_PUBLIC_PATH,
		optimizeDeps: {
			include: ['element-plus/lib/locale/lang/zh-cn', 'element-plus/lib/locale/lang/en', 'element-plus/lib/locale/lang/zh-tw'],
		},
		server: {
			host: '0.0.0.0',
			port: env.VITE_PORT as unknown as number,
			open: env.VITE_OPEN,
			hmr: true,
			proxy: useDevProxy
				? {
						'/api': {
							target: proxyApiTarget,
							changeOrigin: true,
							ws: false,
							rewrite: (path) => path.replace(/^\/api/, ''),
						},
						'/flask': {
							target: proxyFlaskTarget,
							changeOrigin: true,
							ws: false,
							rewrite: (path) => path.replace(/^\/flask/, ''),
						},
					}
				: undefined,
		},
		build: {
			outDir: 'dist',
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				output: {
					entryFileNames: `assets/[name].[hash].js`,
					chunkFileNames: `assets/[name].[hash].js`,
					assetFileNames: `assets/[name].[hash].[ext]`,
					compact: true,
					manualChunks: {
						vue: ['vue', 'vue-router', 'pinia'],
						echarts: ['echarts'],
					},
				},
			},
		},
		css: { preprocessorOptions: { css: { charset: false } } },
		define: {
			__VUE_I18N_LEGACY_API__: JSON.stringify(false),
			__VUE_I18N_FULL_INSTALL__: JSON.stringify(false),
			__INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
			__VERSION__: JSON.stringify(process.env.npm_package_version),
		},
	};
});

export default viteConfig;
