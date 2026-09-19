/**
 * 将后端返回的文件路径转为浏览器可请求的地址。
 * - 相对路径（如 /files/xxx）：经 Vite/网关的 /api 代理到 Spring（与 home getImageUrl 一致）
 * - 已是 http(s)、blob:、data:、或已带 /api/ 前缀：不重复处理
 * - 可选 VITE_PUBLIC_FILE_BASE：生产环境直链文件服务根地址（无则仍用 /api 前缀）
 */
export function resolveFileUrl(path: string | null | undefined): string {
	if (path == null || path === '') return '';
	const s = String(path).trim();
	if (/^https?:\/\//i.test(s) || s.startsWith('blob:') || s.startsWith('data:')) return s;
	if (s.startsWith('//')) return `https:${s}`;

	const normalized = s.startsWith('/') ? s : `/${s}`;
	if (normalized.startsWith('/api/')) return normalized;

	const base = ((import.meta.env.VITE_PUBLIC_FILE_BASE as string) || '').replace(/\/$/, '');
	if (base) return `${base}${normalized}`;

	return `/api${normalized}`;
}

/**
 * Spring 文件上传地址
 * - 默认走 /api 代理，避免浏览器直连跨域/鉴权差异导致用户端上传失败
 * - 如需直连可在 .env 中配置 VITE_STATIC_FILE_ORIGIN
 */
export const SPRING_FILES_UPLOAD =
	`${((import.meta.env.VITE_STATIC_FILE_ORIGIN as string)?.replace(/\/$/, '') || '/api')}/files/upload`;
