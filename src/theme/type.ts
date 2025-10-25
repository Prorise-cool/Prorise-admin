import type { ThemeMode } from "./types/enum";
/**
 * UI 库适配器的 Props 类型定义
 */
export type UILibraryAdapterProps = {
  mode: ThemeMode; // 定义为枚举
  children: React.ReactNode;
};
export type UILibraryAdapter = React.FC<UILibraryAdapterProps>;
/**
 * ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== =
 * 颜色契约 (Color Contract)
 * ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== =
 * 我们为所有颜色令牌定义一个可复用的“契约形状”。
 * - 'value': 将存储最终的颜色值 (e.g., "#FFFFFF" or "rgba(...)")
 * - 'channel': 将存储该颜色的 RGB 通道值 (e.g., "255 255 255")
 * * 这种结构是实现动态透明度（如 rgba(var(--color-channel) / 0.5)）的关键。
 */
const colorTokenContract = {
  value: null,
  channel: null,
};

/**
 * 调色板 (Palette) 的契约结构
 * 复用 colorTokenContract 来定义每种语义颜色的梯度
 */
export const palette = {
  primary: {
    lighter: colorTokenContract,
    light: colorTokenContract,
    default: colorTokenContract,
    dark: colorTokenContract,
    darker: colorTokenContract,
  },
  success: {
    lighter: colorTokenContract,
    light: colorTokenContract,
    default: colorTokenContract,
    dark: colorTokenContract,
    darker: colorTokenContract,
  },
  warning: {
    lighter: colorTokenContract,
    light: colorTokenContract,
    default: colorTokenContract,
    dark: colorTokenContract,
    darker: colorTokenContract,
  },
  error: {
    lighter: colorTokenContract,
    light: colorTokenContract,
    default: colorTokenContract,
    dark: colorTokenContract,
    darker: colorTokenContract,
  },
  info: {
    lighter: colorTokenContract,
    light: colorTokenContract,
    default: colorTokenContract,
    dark: colorTokenContract,
    darker: colorTokenContract,
  },
  gray: {
    "100": colorTokenContract,
    "200": colorTokenContract,
    "300": colorTokenContract,
    "400": colorTokenContract,
    "500": colorTokenContract,
    "600": colorTokenContract,
    "700": colorTokenContract,
    "800": colorTokenContract,
    "900": colorTokenContract,
  },
};

/**
 * ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== =
 * 完整的主题令牌契约 (Theme Tokens Contract)
 * ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== ==== =
 * 这是我们整个设计系统的“形状”定义。
 */
export const themeTokens = {
  colors: {
    palette,
    common: { white: colorTokenContract, black: colorTokenContract },
    action: {
      hover: colorTokenContract,
      selected: colorTokenContract,
      focus: colorTokenContract,
      disabled: colorTokenContract,
      active: colorTokenContract,
    },
    text: {
      primary: colorTokenContract,
      secondary: colorTokenContract,
      disabled: colorTokenContract,
    },
    background: {
      default: colorTokenContract,
      paper: colorTokenContract,
      neutral: colorTokenContract,
    },
  },

  // --- 非颜色令牌 (Non-Color Tokens) ---
  // 这些令牌不需要 'channel' 结构，因此我们使用简单的 'null' 占位符。
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

type ColorChannel = { value: string; channel: string };

export type AddChannelToLeaf<T> = T extends string
  ? ColorChannel // 字符串 → { value, channel }
  : T extends object
    ? { [K in keyof T]: AddChannelToLeaf<T[K]> } // 递归处理对象
    : T;
