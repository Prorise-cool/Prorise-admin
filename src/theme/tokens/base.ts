// 基础主题 Token - 定义间距、圆角、透明度、层级等
import { breakpointsTokens } from "./breakpoints";

// 间距系统 - 用于 margin、padding 等
// 我们采用 4px 网格系统作为间距基础 (spacing: { 1: "4px" })，
// 这是业界标准的做法，能确保 UI 元素之间的节奏一致性。
const spacing = {
  0: "0px",
  1: "4px",
  2: "8px",
  3: "12px",
  4: "16px",
  5: "20px",
  6: "24px",
  7: "28px",
  8: "32px",
  10: "40px",
  12: "48px",
  16: "64px",
  20: "80px",
  24: "96px",
  32: "128px",
};

// 圆角系统 - 用于 border-radius
// 使用语义化名称 (sm, md, lg) 而非纯数字，增加可读性
const borderRadius = {
  none: "0px",
  sm: "2px",
  default: "4px",
  md: "6px",
  lg: "8px",
  xl: "12px",
  full: "9999px",
};

// 透明度系统 - 用于 opacity 和颜色透明度
// 定义了从 0% 到 100% 的梯度，以及常用的语义化透明度
const opacity = {
  0: "0%",
  5: "5%",
  10: "10%",
  20: "20%",
  25: "25%",
  30: "30%",
  35: "35%",
  40: "40%",
  45: "45%",
  50: "50%",
  55: "55%",
  60: "60%",
  65: "65%",
  70: "70%",
  75: "75%",
  80: "80%",
  85: "85%",
  90: "90%",
  95: "95%",
  100: "100%",
  border: "20%",
  hover: "8%",
  selected: "16%",
  focus: "24%",
  disabled: "80%",
  disabledBackground: "24%",
};

// 层级系统 - 定义各组件的 z-index
// 集中管理 z-index 是避免“层级战争”的最佳实践
const zIndex = {
  appBar: "10",
  nav: "20",
  drawer: "50",
  modal: "50",
  snackbar: "50",
  tooltip: "50",
  scrollbar: "100",
};

export const baseThemeTokens = {
  spacing,
  screens: breakpointsTokens, // <--- 添加断点
  borderRadius,
  opacity,
  zIndex,
};
