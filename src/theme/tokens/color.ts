import { rgbAlpha } from "@/utils/theme";
import { ThemeColorPresets } from "../types/enum";

// 基础的黑白色
export const commonColors = {
  white: "#FFFFFF",
  black: "#09090B", // 使用略微柔和的黑色，而非纯 #000000
};

// 一套中性的灰色梯度，用于背景、边框、文本等
export const grayColors = {
  "100": "#F9FAFB",
  "200": "#F4F6F8",
  "300": "#DFE3E8",
  "400": "#C4CDD5",
  "500": "#919EAB",
  "600": "#637381",
  "700": "#454F5B",
  "800": "#1C252E",
  "900": "#141A21",
};

// 1. 首先，定义所有预设主题色的梯度色板
export const presetsColors = {
  [ThemeColorPresets.Default]: {
    lighter: "#C8FAD6",
    light: "#5BE49B",
    default: "#00A76F",
    dark: "#007867",
    darker: "#004B50",
  },
  [ThemeColorPresets.Cyan]: {
    lighter: "#CCF4FE",
    light: "#68CDF9",
    default: "#078DEE",
    dark: "#0351AB",
    darker: "#012972",
  },
  [ThemeColorPresets.Purple]: {
    lighter: "#E8DAFF",
    light: "#B18AFF",
    default: "#7635dc",
    dark: "#49199c",
    darker: "#290966",
  },
  [ThemeColorPresets.Blue]: {
    lighter: "#D1E9FC",
    light: "#76B0F1",
    default: "#2065D1",
    dark: "#103996",
    darker: "#061B64",
  },
  [ThemeColorPresets.Orange]: {
    lighter: "#FEF4D4",
    light: "#FED680",
    default: "#fda92d",
    dark: "#b66800",
    darker: "#793900",
  },
  [ThemeColorPresets.Red]: {
    lighter: "#FFE4DE",
    light: "#FF8676",
    default: "#FF5630",
    dark: "#B71D18",
    darker: "#7A0916",
  },
};

/**
 * 我们推荐使用[Eva Color Design](https://colors.eva.design/)来快速选取这些值，遵守如下的数值即可：
 *  + lighter : 100
 *  + light : 300
 *  + main : 500
 *  + dark : 700
 *  + darker : 900
 */
export const paletteColors = {
  primary: presetsColors[ThemeColorPresets.Default], // 默认使用 Default (绿色) 预设
  success: {
    lighter: "#D8FBDE",
    light: "#86E8AB",
    default: "#36B37E",
    dark: "#1B806A",
    darker: "#0A5554",
  },
  warning: {
    lighter: "#FFF5CC",
    light: "#FFD666",
    default: "#FFAB00",
    dark: "#B76E00",
    darker: "#7A4100",
  },
  error: {
    lighter: "#FFE9D5",
    light: "#FFAC82",
    default: "#FF5630",
    dark: "#B71D18",
    darker: "#7A0916",
  },
  info: {
    lighter: "#CAFDF5",
    light: "#61F3F3",
    default: "#00B8D9",
    dark: "#006C9C",
    darker: "#003768",
  },
  gray: grayColors,
};

// 定义组件在不同交互状态下的颜色 (灰色的不同透明度)
export const actionColors = {
  hover: rgbAlpha(grayColors[500], 0.08), // 悬停状态背景
  selected: rgbAlpha(grayColors[500], 0.16), // 选中状态背景
  focus: rgbAlpha(grayColors[500], 0.24), // 聚焦状态光晕
  disabled: rgbAlpha(grayColors[500], 0.24), // 禁用状态文本/图标颜色
  active: rgbAlpha(grayColors[500], 0.24), // 激活状态
};

// 定义亮色模式下的最终颜色 Token 集合
export const lightColorTokens = {
  palette: paletteColors,
  common: commonColors,
  action: actionColors,
  text: {
    primary: grayColors[800],
    secondary: grayColors[600],
    disabled: grayColors[400],
  },
  background: {
    default: grayColors[100],
    paper: commonColors.white,
    neutral: grayColors[200],
  },
};

// 定义暗色模式下的最终颜色 Token 集合
export const darkColorTokens = {
  palette: paletteColors,
  common: commonColors,
  action: actionColors,
  text: {
    primary: commonColors.white,
    secondary: grayColors[500],
    disabled: grayColors[600],
  },
  background: {
    default: grayColors[900],
    paper: grayColors[800],
    neutral: rgbAlpha(grayColors[500], 0.12),
  },
};
