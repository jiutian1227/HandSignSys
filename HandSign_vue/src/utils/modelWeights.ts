/**
 * 模型列表：GET /file_names
 * - 开发 + VITE_USE_DEV_PROXY=true：请求同源 /flask/file_names，由 Vite 转发到 Flask（避免服务端未配 CORS 时 fetch 被浏览器拦截）
 * - 其它：直连 VITE_FLASK_ORIGIN/file_names（需服务端 Access-Control-Allow-Origin）
 */
let cache: any[] | null = null;
let inFlight: Promise<any[]> | null = null;
let blockedUntil = 0;

const COOL_DOWN_MS = 30 * 1000;

const useDevProxy = () =>
	import.meta.env.DEV && String(import.meta.env.VITE_USE_DEV_PROXY ?? '').toLowerCase() === 'true';

/** 实际发起 GET 的地址 */
const getFileNamesFetchUrl = (): string => {
	if (useDevProxy()) {
		return '/flask/file_names';
	}
	const origin = String(import.meta.env.VITE_FLASK_ORIGIN || 'https://flask.fanzengxie.icu').replace(/\/+$/, '');
	return `${origin}/file_names`;
};

/** 兼容多种后端包装 */
const parseWeightItems = (raw: any): any[] => {
	if (raw == null) return [];
	if (Array.isArray(raw)) return raw;

	let body = raw;
	if (typeof body === 'string') {
		try {
			body = JSON.parse(body.trim());
		} catch {
			return [];
		}
	}
	if (typeof body !== 'object') return [];

	if (Array.isArray(body.weight_items)) return body.weight_items;

	if (
		Array.isArray(body.data) &&
		body.data.length > 0 &&
		typeof body.data[0] === 'object' &&
		('value' in body.data[0] || 'label' in body.data[0])
	) {
		return body.data;
	}

	if (body.data != null) {
		let inner = body.data;
		if (typeof inner === 'string') {
			try {
				inner = JSON.parse(inner);
			} catch {
				inner = null;
			}
		}
		if (inner && typeof inner === 'object' && Array.isArray(inner.weight_items)) {
			return inner.weight_items;
		}
	}

	if ((body.code === '200' || body.code === 200) && body.data != null) {
		const d = typeof body.data === 'string' ? safeJson(body.data) : body.data;
		if (d && Array.isArray(d.weight_items)) return d.weight_items;
	}

	return [];
};

function safeJson(s: string): any {
	try {
		return JSON.parse(s);
	} catch {
		return null;
	}
}

const fetchFileNamesJson = async (): Promise<any> => {
	const url = getFileNamesFetchUrl();
	const res = await fetch(url, {
		method: 'GET',
		mode: 'cors',
		credentials: 'omit',
		headers: {
			Accept: 'application/json, text/plain, */*',
		},
	});
	if (!res.ok) {
		throw new Error(`HTTP ${res.status} ${res.statusText}`);
	}
	const text = await res.text();
	const trimmed = text.replace(/^\uFEFF/, '').trim();
	if (!trimmed) {
		throw new Error('响应体为空');
	}
	try {
		return JSON.parse(trimmed);
	} catch {
		if (import.meta.env.DEV) {
			// eslint-disable-next-line no-console
			console.error('[loadModelWeights] 非 JSON 响应前 200 字', trimmed.slice(0, 200));
		}
		throw new Error('响应不是合法 JSON');
	}
};

export const loadModelWeights = async (): Promise<{ items: any[]; blocked: boolean }> => {
	const now = Date.now();
	if (cache && cache.length > 0) return { items: cache, blocked: false };
	if (now < blockedUntil) return { items: [], blocked: true };
	if (inFlight) {
		const items = await inFlight;
		return { items, blocked: false };
	}

	inFlight = fetchFileNamesJson()
		.then((body: any) => {
			const items = parseWeightItems(body);
			if (!items.length) {
				if (import.meta.env.DEV) {
					// eslint-disable-next-line no-console
					console.warn('[loadModelWeights] 未解析出 weight_items，键:', body && typeof body === 'object' ? Object.keys(body) : typeof body);
				}
				throw new Error((body && body.msg) || '模型列表为空');
			}
			cache = items;
			return items;
		})
		.catch((err: unknown) => {
			if (import.meta.env.DEV) {
				// eslint-disable-next-line no-console
				console.error('[loadModelWeights] GET', getFileNamesFetchUrl(), err);
			}
			blockedUntil = Date.now() + COOL_DOWN_MS;
			return [];
		})
		.finally(() => {
			inFlight = null;
		});

	const items = await inFlight;
	return { items, blocked: false };
};
