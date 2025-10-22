import Color from "color";
import { commonColors, paletteColors } from "./color";

// 亮色主题阴影 Token
export const lightShadowTokens = {
  none: "none",
  // 基础阴影梯度 (从小到大)
  sm: `0 1px 2px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 轻微阴影
  default: `0 4px 8px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 默认阴影
  md: `0 8px 16px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 中等阴影
  lg: `0 12px 24px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 较大阴影
  xl: `0 16px 32px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 超大阴影
  "2xl": `0 20px 40px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 超超大阴影
  "3xl": `0 24px 48px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 最大阴影
  inner: `inset 0 2px 4px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 内阴影

  // 特定组件阴影
  dialog: `-40px 40px 80px -8px ${Color(commonColors.black).alpha(0.24)}`, // 对话框阴影
  card: `0 0 2px 0 ${Color(paletteColors.gray[500]).alpha(0.2)}, 0 12px 24px -4px ${Color(paletteColors.gray[500]).alpha(0.12)}`, // 卡片阴影
  dropdown: `0 0 2px 0 ${Color(paletteColors.gray[500]).alpha(0.24)}, -20px 20px 40px -4px ${Color(paletteColors.gray[500]).alpha(0.24)}`, // 下拉菜单阴影

  // 语义化阴影 (带品牌色调)
  primary: `0 8px 16px 0 ${Color(paletteColors.primary.default).alpha(0.24)}`, // 主色调阴影
  info: `0 8px 16px 0 ${Color(paletteColors.info.default).alpha(0.24)}`, // 信息色阴影
  success: `0 8px 16px 0 ${Color(paletteColors.success.default).alpha(0.24)}`, // 成功色阴影
  warning: `0 8px 16px 0 ${Color(paletteColors.warning.default).alpha(0.24)}`, // 警告色阴影
  error: `0 8px 16px 0 ${Color(paletteColors.error.default).alpha(0.24)}`, // 错误色阴影
};

// 暗色主题阴影 Token
export const darkShadowTokens = {
  none: "none",
  // 基础阴影梯度 (从小到大)
  sm: `0 1px 2px 0 ${Color(commonColors.black).alpha(0.16)}`, // 轻微阴影
  default: `0 4px 8px 0 ${Color(commonColors.black).alpha(0.16)}`, // 默认阴影
  md: `0 8px 16px 0 ${Color(commonColors.black).alpha(0.16)}`, // 中等阴影
  lg: `0 12px 24px 0 ${Color(commonColors.black).alpha(0.16)}`, // 较大阴影
  xl: `0 16px 32px 0 ${Color(commonColors.black).alpha(0.16)}`, // 超大阴影
  "2xl": `0 20px 40px 0 ${Color(commonColors.black).alpha(0.16)}`, // 超超大阴影
  "3xl": `0 24px 48px 0 ${Color(commonColors.black).alpha(0.16)}`, // 最大阴影
  inner: `inset 0 2px 4px 0 ${Color(commonColors.black).alpha(0.16)}`, // 内阴影

  // 特定组件阴影
  dialog: `-40px 40px 80px -8px ${Color(commonColors.black).alpha(0.24)}`, // 对话框阴影
  card: `0 0 2px 0 ${Color(commonColors.black).alpha(0.2)}, 0 12px 24px -4px ${Color(commonColors.black).alpha(0.12)}`, // 卡片阴影
  dropdown: `0 0 2px 0 ${Color(commonColors.black).alpha(0.24)}, -20px 20px 40px -4px ${Color(commonColors.black).alpha(0.24)}`, // 下拉菜单阴影

  // 语义化阴影 (带品牌色调)
  primary: `0 8px 16px 0 ${Color(paletteColors.primary.default).alpha(0.24)}`, // 主色调阴影
  info: `0 8px 16px 0 ${Color(paletteColors.info.default).alpha(0.24)}`, // 信息色阴影
  success: `0 8px 16px 0 ${Color(paletteColors.success.default).alpha(0.24)}`, // 成功色阴影
  warning: `0 8px 16px 0 ${Color(paletteColors.warning.default).alpha(0.24)}`, // 警告色阴影
  error: `0 8px 16px 0 ${Color(paletteColors.error.default).alpha(0.24)}`, // 错误色阴影
};
