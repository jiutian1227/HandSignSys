import { nextTick } from 'vue';
import * as svg from '@element-plus/icons-vue';

/** 遍历样式规则（含 @media 内嵌），不依赖外链 href，便于 Vite 打包后仍能解析 */
function walkCssRules(cssRules: CSSRuleList | null, callback: (rule: CSSStyleRule) => void) {
	if (!cssRules) return;
	for (let j = 0; j < cssRules.length; j++) {
		const rule = cssRules[j];
		if (rule.type === CSSRule.STYLE_RULE) {
			callback(rule as CSSStyleRule);
		} else if (rule.type === CSSRule.MEDIA_RULE) {
			walkCssRules((rule as CSSMediaRule).cssRules, callback);
		}
	}
}

function walkStyleSheet(sheet: CSSStyleSheet, callback: (rule: CSSStyleRule) => void) {
	try {
		walkCssRules(sheet.cssRules, callback);
	} catch {
		// 跨域或浏览器限制
	}
}

function stripBeforePseudo(selector: string): string {
	return selector
		.substring(1)
		.replace(/::?before/gi, '')
		.trim();
}

// 本地 iconfont（见 main.ts 引入的 /@/theme/fonts/iconfont.css）
const getAlicdnIconfont = () => {
	return new Promise((resolve, reject) => {
		nextTick(() => {
			const sheetsIconList: string[] = [];
			for (let i = 0; i < document.styleSheets.length; i++) {
				try {
					walkStyleSheet(document.styleSheets[i], (sr) => {
						const st = sr.selectorText;
						if (!st || st.indexOf('.icon-') === -1) return;
						if (st.indexOf(',') > -1) return;
						if (!/:before/i.test(st)) return;
						sheetsIconList.push(stripBeforePseudo(st));
					});
				} catch {
					/* ignore */
				}
			}
			const unique = [...new Set(sheetsIconList)];
			if (unique.length > 0) resolve(unique);
			else reject('未获取到值，请刷新重试');
		});
	});
};

// 初始化获取 css 样式，获取 element plus 自带 svg 图标，增加了 ele- 前缀，使用时：ele-Aim
const getElementPlusIconfont = () => {
	return new Promise((resolve, reject) => {
		nextTick(() => {
			const icons = svg as any;
			const sheetsIconList = [];
			for (const i in icons) {
				sheetsIconList.push(`ele-${icons[i].name}`);
			}
			if (sheetsIconList.length > 0) resolve(sheetsIconList);
			else reject('未获取到值，请刷新重试');
		});
	});
};

// npm 包 font-awesome 本地引入（见 main.ts）
const getAwesomeIconfont = () => {
	return new Promise((resolve, reject) => {
		nextTick(() => {
			const sheetsIconList: string[] = [];
			for (let i = 0; i < document.styleSheets.length; i++) {
				try {
					walkStyleSheet(document.styleSheets[i], (sr) => {
						const st = sr.selectorText;
						if (!st || st.indexOf('.fa-') !== 0) return;
						if (st.indexOf(',') > -1) return;
						if (!/:before/i.test(st)) return;
						sheetsIconList.push(stripBeforePseudo(st));
					});
				} catch {
					/* ignore */
				}
			}
			if (sheetsIconList.length > 0) resolve(sheetsIconList.reverse());
			else reject('未获取到值，请刷新重试');
		});
	});
};

/**
 * 获取字体图标 `document.styleSheets`
 * @method ali 获取阿里字体图标 `<i class="iconfont 图标类名"></i>`（现为本地 iconfont.css）
 * @method ele 获取 element plus 自带图标 `<i class="图标类名"></i>`
 * @method awe 获取 fontawesome 的图标 `<i class="fa 图标类名"></i>`
 */
const initIconfont = {
	ali: () => {
		return getAlicdnIconfont();
	},
	ele: () => {
		return getElementPlusIconfont();
	},
	awe: () => {
		return getAwesomeIconfont();
	},
};

export default initIconfont;
