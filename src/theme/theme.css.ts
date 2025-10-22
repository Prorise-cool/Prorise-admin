import {
  assignVars,
  createGlobalTheme,
  createThemeContract,
  globalStyle,
} from "@vanilla-extract/css";
import { addChannelStructure, addColorChannels } from "@/utils/theme";
import { baseThemeTokens } from "./tokens/base";
import {
  darkColorTokens,
  lightColorTokens,
  presetsColors,
} from "./tokens/color";
import { darkShadowTokens, lightShadowTokens } from "./tokens/shadow";
import { typographyTokens } from "./tokens/typography";
import { themeTokens } from "./type";
import { HtmlDataAttribute, ThemeColorPresets, ThemeMode } from "./types/enum";

/**
 * @description 根据亮/暗模式，获取一个包含了所有具体设计令牌值的完整对象
 * @param mode - 主题模式 ('light' 或 'dark')
 * @returns 一个与 themeVars 契约结构完全匹配，但填充了具体值的对象
 */
const getThemeTokens = (mode: ThemeMode) => {
  // 步骤 1: 根据传入的 mode，选择对应的颜色和阴影令牌集
  const colorModeTokens =
    mode === ThemeMode.Light ? lightColorTokens : darkColorTokens;
  const shadowModeTokens =
    mode === ThemeMode.Light ? lightShadowTokens : darkShadowTokens;

  // 步骤 2: 组合所有令牌到一个对象中
  // 这个对象的结构必须与我们之前定义的 themeVars 契约完全一致
  return {
    // 尤其重要的是，对颜色令牌集调用 addColorChannels
    // 这样返回的对象中才包含了我们需要的 'channel' 属性
    colors: addColorChannels(colorModeTokens),
    typography: typographyTokens,
    shadows: shadowModeTokens,
    ...baseThemeTokens, // 使用展开运算符合并 spacing, borderRadius, screens 等
  };
};

// 使用 createThemeContract 创建主题契约
// 传入 themeTokens 骨架，并确保颜色部分包含 Channel 变量
export const themeVars = createThemeContract({
  ...themeTokens, // 包含 typography, spacing, shadows 等所有骨架

  // 特别处理 colors，为每个颜色值添加 { value, channel } 结构
  colors: addChannelStructure(themeTokens.colors),
});

for (const themeMode of Object.values(ThemeMode)) {
  createGlobalTheme(
    `:root[${HtmlDataAttribute.ThemeMode}=${themeMode}]`,
    themeVars,
    getThemeTokens(themeMode),
  );
}

// --- 实现动态主题色切换 ---

// 循环处理我们定义的所有预设颜色 (Default, Cyan, Purple...)
for (const preset of Object.values(ThemeColorPresets)) {
  // 1. 定义目标选择器。例如，当 preset 为 'Cyan' 时，
  //    选择器变为 ': root [data-color-palette = "cyan"]'
  const selector = `:root[${HtmlDataAttribute.ColorPalette}='${preset}']`;

  // 2. 获取当前循环到的预设颜色所对应的具体色值对象
  //    例如 { lighter: "#CCF4FE", light: "#68CDF9", ... }
  const presetColorValues = presetsColors[preset];

  // 3. 使用 globalStyle 为该选择器创建一个 CSS 规则块
  globalStyle(selector, {
    // 4. 在规则块内部，使用 assignVars 来生成变量覆盖语句
    vars: assignVars(
      // 参数 1: 要覆盖的契约范围。我们精准地只覆盖主色相关的变量。
      themeVars.colors.palette.primary,

      // 参数 2: 提供的新值。
      // 我们传入新的色值对象，并确保它的颜色通道也被计算。
      addColorChannels(presetColorValues),
    ),
  });
}
