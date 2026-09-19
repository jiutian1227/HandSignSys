import brandLogo from '/@/assets/brand-logo-wushengqiao.png';

/** 与侧栏 / 顶栏 GestureAI 旁 Logo 使用同一资源，避免标签页图标不一致 */
export function setBrandFavicon() {
	let el = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
	if (!el) {
		el = document.createElement('link');
		el.rel = 'icon';
		el.type = 'image/png';
		document.head.appendChild(el);
	}
	el.href = brandLogo;
}
