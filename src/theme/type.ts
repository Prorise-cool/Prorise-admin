/**
 * UI 库适配器的 Props 类型定义
 */
export type UILibraryAdapterProps = {
	mode: "light" | "dark"; // 暂时使用字面量类型，后续会定义为枚举
	children: React.ReactNode;
};
export type UILibraryAdapter = React.FC<UILibraryAdapterProps>;

/**
 * 定义 Design Tokens 的基本结构骨架。
 * 我们使用 `null` 作为占位符，这对于下一章将要使用的
 * Vanilla Extract 的 `createThemeContract` API 是非常完美的输入。
 */
const palette = {
	primary: {
		lighter: null,
		light: null,
		default: null,
		dark: null,
		darker: null,
	},
	success: {
		lighter: null,
		light: null,
		default: null,
		dark: null,
		darker: null,
	},
	warning: {
		lighter: null,
		light: null,
		default: null,
		dark: null,
		darker: null,
	},
	error: {
		lighter: null,
		light: null,
		default: null,
		dark: null,
		darker: null,
	},
	info: { lighter: null, light: null, default: null, dark: null, darker: null },
	gray: {
		"100": null,
		"200": null,
		"300": null,
		"400": null,
		"500": null,
		"600": null,
		"700": null,
		"800": null,
		"900": null,
	},
};

export const themeTokens = {
	// 全局颜色集
	colors: {
		palette,
		common: { white: null, black: null },
		action: {
			hover: null,
			selected: null,
			focus: null,
			disabled: null,
			active: null,
		},
		text: { primary: null, secondary: null, disabled: null },
		background: { default: null, paper: null, neutral: null },
	},
	// 全局字体集
	typography: {
		fontFamily: { openSans: null, inter: null },
		fontSize: { xs: null, sm: null, default: null, lg: null, xl: null },
		fontWeight: {
			light: null,
			normal: null,
			medium: null,
			semibold: null,
			bold: null,
		},
		lineHeight: { none: null, tight: null, normal: null, relaxed: null },
	},
	// 全局间距集
	spacing: {
		0: null,
		1: null,
		2: null,
		3: null,
		4: null,
		5: null,
		6: null,
		7: null,
		8: null,
		10: null,
		12: null,
		16: null,
		20: null,
		24: null,
		32: null,
	},
	// 全局圆角集
	borderRadius: {
		none: null,
		sm: null,
		default: null,
		md: null,
		lg: null,
		xl: null,
		full: null,
	},
	// 全局阴影集
	shadows: {
		none: null,
		sm: null,
		default: null,
		md: null,
		lg: null,
		xl: null,
		"2xl": null,
		"3xl": null,
		inner: null,
		dialog: null,
		card: null,
		dropdown: null,
		primary: null,
		info: null,
		success: null,
		warning: null,
		error: null,
	},
	// 全局屏幕集
	screens: { xs: null, sm: null, md: null, lg: null, xl: null, "2xl": null },
	// 全局透明度集
	opacity: {
		0: null,
		5: null,
		10: null,
		20: null,
		25: null,
		30: null,
		35: null,
		40: null,
		45: null,
		50: null,
		55: null,
		60: null,
		65: null,
		70: null,
		75: null,
		80: null,
		85: null,
		90: null,
		95: null,
		100: null,
		border: null,
		hover: null,
		selected: null,
		focus: null,
		disabled: null,
		disabledBackground: null,
	},
	// 全局层级集
	zIndex: {
		appBar: null,
		drawer: null,
		nav: null,
		modal: null,
		snackbar: null,
		tooltip: null,
		scrollbar: null,
	},
};
