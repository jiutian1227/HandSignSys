/**
 * 将后端返回的文件路径转为浏览器可请求的地址。
 * - 相对路径（如 /files/xxx）：统一拼接到文件服务域名（开发/生产一致，不依赖 Vite 代理）
 * - 已是 http(s)、blob:、data:：不重复处理
 * - 优先读取 VITE_PUBLIC_FILE_BASE，其次回退到 VITE_STATIC_FILE_ORIGIN
 */
export function resolveFileUrl(path: string | null | undefined): string {
	if (path == null || path === '') return '';
	const s = String(path).trim();
	if (/^https?:\/\//i.test(s) || s.startsWith('blob:') || s.startsWith('data:')) return s;
	if (s.startsWith('//')) return `https:${s}`;

	const normalized = s.startsWith('/') ? s : `/${s}`;
	const useDevProxy = import.meta.env.DEV && String(import.meta.env.VITE_USE_DEV_PROXY || '').toLowerCase() === 'true';
	if (useDevProxy) {
		// 开发代理模式下，文件统一走 /api 前缀由 Vite 转发
		return normalized.startsWith('/api/') ? normalized : `/api${normalized}`;
	}
	const base =
		((import.meta.env.VITE_PUBLIC_FILE_BASE as string) ||
			(import.meta.env.VITE_STATIC_FILE_ORIGIN as string) ||
			'')
			.replace(/\/$/, '');
	return base ? `${base}${normalized}` : normalized;
}

/**
 * Spring 文件上传地址
 * - 统一直连 Spring 文件服务（开发/生产一致）
 */
export const SPRING_FILES_UPLOAD =
	(import.meta.env.DEV && String(import.meta.env.VITE_USE_DEV_PROXY || '').toLowerCase() === 'true')
		? '/api/files/upload'
		: `${((import.meta.env.VITE_STATIC_FILE_ORIGIN as string)?.replace(/\/$/, '') || 'https://springboot.fanzengxie.icu')}/files/upload`;
