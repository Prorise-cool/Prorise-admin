import { breakpointsTokens } from "./breakpoints";

// 基础主题 Token - 定义间距、圆角、断点、透明度、层级等通用设计变量
export const baseThemeTokens = {
  // 间距系统 - 用于 margin、padding 等
  spacing: {
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
  },
  // 圆角系统 - 用于 border-radius
  borderRadius: {
    none: "0px",
    sm: "2px",
    default: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    full: "9999px",
  },
  // 响应式断点 - 用于媒体查询
  screens: breakpointsTokens,
  // 透明度系统 - 用于 opacity 和颜色透明度
  opacity: {
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
  },
  // 层级系统 - 定义各组件的 z-index
  zIndex: {
    appBar: "10",
    nav: "20",
    drawer: "50",
    modal: "50",
    snackbar: "50",
    tooltip: "50",
    scrollbar: "100",
  },
};
