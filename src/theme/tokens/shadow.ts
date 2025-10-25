import Color from "color";
import { commonColors, paletteColors } from "./color";

// --- 亮色主题阴影 ---
export const lightShadowTokens = {
  none: "none",
  // 基础阴影梯度 (从小到大)
  sm: `0 1px 2px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`,
  default: `0 4px 8px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`,
  md: `0 8px 16px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`,
  lg: `0 12px 24px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`,
  xl: `0 16px 32px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`,
  "2xl": `0 20px 40px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`,
  "3xl": `0 24px 48px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`,
  inner: `inset 0 2px 4px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`,

  // 特定组件阴影
  dialog: `-40px 40px 80px -8px ${Color(commonColors.black).alpha(0.24)}`,
  card: `0 0 2px 0 ${Color(paletteColors.gray[500]).alpha(0.2)}, 0 12px 24px -4px ${Color(paletteColors.gray[500]).alpha(0.12)}`,
  dropdown: `0 0 2px 0 ${Color(paletteColors.gray[500]).alpha(0.24)}, -20px 20px 40px -4px ${Color(paletteColors.gray[500]).alpha(0.24)}`,

  // 语义化阴影 (带品牌色调)
  primary: `0 8px 16px 0 ${Color(paletteColors.primary.default).alpha(0.24)}`,
  info: `0 8px 16px 0 ${Color(paletteColors.info.default).alpha(0.24)}`,
  success: `0 8px 16px 0 ${Color(paletteColors.success.default).alpha(0.24)}`,
  warning: `0 8px 16px 0 ${Color(paletteColors.warning.default).alpha(0.24)}`,
  error: `0 8px 16px 0 ${Color(paletteColors.error.default).alpha(0.24)}`,
};

// --- 暗色主题阴影 ---
// 暗色模式下，阴影通常使用更深的黑色基础，以在深色背景上“凸显”
export const darkShadowTokens = {
  none: "none",
  sm: `0 1px 2px 0 ${Color(commonColors.black).alpha(0.16)}`,
  default: `0 4px 8px 0 ${Color(commonColors.black).alpha(0.16)}`,
  md: `0 8px 16px 0 ${Color(commonColors.black).alpha(0.16)}`,
  lg: `0 12px 24px 0 ${Color(commonColors.black).alpha(0.16)}`,
  xl: `0 16px 32px 0 ${Color(commonColors.black).alpha(0.16)}`,
  "2xl": `0 20px 40px 0 ${Color(commonColors.black).alpha(0.16)}`,
  "3xl": `0 24px 48px 0 ${Color(commonColors.black).alpha(0.16)}`,
  inner: `inset 0 2px 4px 0 ${Color(commonColors.black).alpha(0.16)}`,

  dialog: `-40px 40px 80px -8px ${Color(commonColors.black).alpha(0.24)}`,
  card: `0 0 2px 0 ${Color(commonColors.black).alpha(0.2)}, 0 12px 24px -4px ${Color(commonColors.black).alpha(0.12)}`,
  dropdown: `0 0 2px 0 ${Color(commonColors.black).alpha(0.24)}, -20px 20px 40px -4px ${Color(commonColors.black).alpha(0.24)}`,

  // 语义化阴影在暗色模式下通常保持不变，因为它们是品牌色的体现
  primary: `0 8px 16px 0 ${Color(paletteColors.primary.default).alpha(0.24)}`,
  info: `0 8px 16px 0 ${Color(paletteColors.info.default).alpha(0.24)}`,
  success: `0 8px 16px 0 ${Color(paletteColors.success.default).alpha(0.24)}`,
  warning: `0 8px 16px 0 ${Color(paletteColors.warning.default).alpha(0.24)}`,
  error: `0 8px 16px 0 ${Color(paletteColors.error.default).alpha(0.24)}`,
};
