import request from '/@/utils/request';

let cache: any[] | null = null;
let inFlight: Promise<any[]> | null = null;
let blockedUntil = 0;

const COOL_DOWN_MS = 30 * 1000;

const parseWeightItems = (res: any): any[] => {
	let data = res;
	if ((res?.code === '200' || res?.code === 200) && res.data != null) {
		data = typeof res.data === 'string' ? JSON.parse(res.data) : res.data;
	}
	const items = data?.weight_items;
	return Array.isArray(items) ? items : [];
};

export const loadModelWeights = async (): Promise<{ items: any[]; blocked: boolean }> => {
	const now = Date.now();
	if (cache && cache.length > 0) return { items: cache, blocked: false };
	if (now < blockedUntil) return { items: [], blocked: true };
	if (inFlight) return { items: await inFlight, blocked: false };

	inFlight = request
		.get('/flask/file_names')
		.then((res: any) => {
			const items = parseWeightItems(res);
			if (!items.length) throw new Error(res?.msg || '模型列表为空');
			cache = items;
			return items;
		})
		.catch(() => {
			blockedUntil = Date.now() + COOL_DOWN_MS;
			return [];
		})
		.finally(() => {
			inFlight = null;
		});

	return { items: await inFlight, blocked: false };
};

