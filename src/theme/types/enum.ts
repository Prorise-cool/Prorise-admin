/**
 * 定义主题模式的枚举
 * 'light' 和 'dark' 将作为 data-theme-mode 属性的值
 */
export enum ThemeMode {
  Light = "light",
  Dark = "dark",
}

/**
 * 定义预设主题色的枚举
 * 'default', 'cyan' 等将作为 data-color-palette 属性的值
 */
export enum ThemeColorPresets {
  Default = "default",
  Cyan = "cyan",
  Purple = "purple",
  Blue = "blue",
  Orange = "orange",
  Red = "red",
}

/**
 * 定义将要附加到 HTML 根元素上的 data 属性名称的常量
 * 这样做可以避免在代码中硬编码字符串，减少拼写错误
 */
export enum HtmlDataAttribute {
  ColorPalette = "data-color-palette",
  ThemeMode = "data-theme-mode",
}

export enum StorageEnum {
  Settings = "settings",
}
