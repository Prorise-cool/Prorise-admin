import {
  assignVars,
  createGlobalTheme,
  createThemeContract,
  globalStyle,
} from "@vanilla-extract/css";
// 导入【核心转换器】
import { addColorChannels } from "@/theme/utils/themeUtils";
// 导入【扁平的、具体的值】
import { baseThemeTokens } from "./tokens/base";
import {
  darkColorTokens,
  lightColorTokens,
  presetsColors,
} from "./tokens/color";
import { darkShadowTokens, lightShadowTokens } from "./tokens/shadow";
import { typographyTokens } from "./tokens/typography";
// 导入【主题契约】
import { themeTokens } from "./type";

// 导入【枚举】
import { HtmlDataAttribute, ThemeColorPresets, ThemeMode } from "./types/enum";

// 使用 createThemeContract 创建【主题契约】
export const themeVars = createThemeContract(themeTokens);

/**
 * @description 根据亮/暗模式，获取一个包含了所有具体设计令牌值的完整对象
 * @param mode - 主题模式 ('light' 或 'dark')
 * @returns 一个与 themeVars 契约结构完全匹配，但填充了具体值的对象
 */
const getThemeTokens = (mode: ThemeMode) => {
  // 步骤 1: 根据传入的 mode，选择对应的【扁平】颜色和阴影令牌集
  const colorModeTokens =
    mode === ThemeMode.Light ? lightColorTokens : darkColorTokens;
  const shadowModeTokens =
    mode === ThemeMode.Light ? lightShadowTokens : darkShadowTokens;

  return {
    // 步骤 2a:
    // [关键点]：对【扁平】的颜色令牌集调用 addColorChannels！
    // 这个函数会将其递归转换为 { value: "...", channel: "..." } 的
    // 【契约形状】，这正是 createGlobalTheme 所需要的。
    colors: addColorChannels(colorModeTokens),
    // 步骤 2b: 组合所有非颜色令牌
    // 这些令牌的结构 (e.g., typography.fontSize.xs)
    // 已经与契约 (themeVars) 匹配
    typography: typographyTokens,
    shadows: shadowModeTokens,
    ...baseThemeTokens, // 使用展开运算符合并 spacing, borderRadius, screens 等
  };
};

// 循环遍历 ThemeMode 枚举 (light 和 dark)
for (const themeMode of Object.values(ThemeMode)) {
  // 为每种模式创建一个全局主题
  createGlobalTheme(
    // CSS 选择器, e.g., : root [data-theme-mode = "light"]
    `:root[${HtmlDataAttribute.ThemeMode}=${themeMode}]`,

    // 我们在 5.3.1 中创建的契约
    themeVars,

    // 我们刚创建的辅助函数，用于获取该模式下的具体值
    getThemeTokens(themeMode),
  );
}

// 循环遍历我们在 5.2.3 中定义的所有预设主题色 (default, cyan, purple...)
for (const preset of Object.values(ThemeColorPresets)) {
  // 为每个预设色创建一个全局样式规则
  globalStyle(
    // CSS 选择器, e.g., : root [data-color-palette = "cyan"]
    `:root[${HtmlDataAttribute.ColorPalette}=${preset}]`,
    {
      // 关键：使用 'vars' 属性来覆盖变量
      vars: assignVars(
        // 参数 1: [契约子集]
        // 我们告诉 assignVars，我们【只】想覆盖
        // 'themeVars.colors.palette.primary' 范围内的变量
        themeVars.colors.palette.primary,

        // 参数 2: [新的值]
        // 我们从 presetsColors 中获取该预设的【扁平】颜色对象，
        // 并再次使用 addColorChannels 转换器，
        // 将其转换为 { value, channel } 的【契约形状】
        { ...addColorChannels(presetsColors[preset]) },
      ),
    },
  );
}
