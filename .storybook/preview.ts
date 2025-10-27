import type { Preview } from "@storybook/react-vite";
import "../src/index.css";
import "../src/theme/theme.css"; // Vanilla Extract: 源文件是 theme.css.ts，导入时去掉 .ts
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import {
  HtmlDataAttribute,
  ThemeColorPresets,
  ThemeMode,
} from "../src/theme/types/enum";
// 1. 导入我们创建的 withTheme 装饰器
import { withTheme } from "../src/theme/withTheme";

/**
 * Storybook 预览配置
 *
 * 此文件配置 Storybook 中所有故事的全局设置。
 * 它定义了故事的渲染方式以及 UI 中可用的工具。
 */
const preview: Preview = {
  /**
   * 应用于所有故事的全局参数
   */
  parameters: {
    /**
     * 控件配置
     * 定义 Storybook 如何自动为组件属性生成控件
     */
    controls: {
      /**
       * 匹配器定义哪些属性应该被视为特定的控件类型
       * 基于使用正则表达式模式的属性名称
       */
      matchers: {
        // 匹配此模式的属性将使用颜色选择器控件
        color: /(background|color)$/i,
        // 匹配此模式的属性将使用日期选择器控件
        date: /Date$/i,
      },
    },

    /**
     * 无障碍 (a11y) 插件配置
     * 使用 axe-core 对故事运行自动化无障碍测试
     */
    a11y: {
      /**
       * 测试模式决定如何处理 a11y 违规:
       * - 'todo': 在 UI 中显示违规但不使测试失败(开发模式)
       * - 'error': 发现违规时使 CI/CD 管道失败(严格模式)
       * - 'off': 完全禁用 a11y 检查
       */
      test: "todo",
    },
  },

  decorators: [
    // // 亮/暗模式切换 - 通过 data-theme-mode 属性控制
    // 由于插件顶栏不适配两种模式的切换，一般我们要测试亮暗色就取消这个注释即可
    withThemeByDataAttribute({
      themes: {
        light: ThemeMode.Light,
        dark: ThemeMode.Dark,
      },
      defaultTheme: ThemeMode.Light,
      attributeName: HtmlDataAttribute.ThemeMode,
    }),
    // // 颜色预设切换 - 通过 data-color-palette 属性控制
    // withThemeByDataAttribute({
    //   themes: {
    //     default: ThemeColorPresets.Default,
    //     cyan: ThemeColorPresets.Cyan,
    //     purple: ThemeColorPresets.Purple,
    //     blue: ThemeColorPresets.Blue,
    //     orange: ThemeColorPresets.Orange,
    //     red: ThemeColorPresets.Red,
    //   },
    //   defaultTheme: ThemeColorPresets.Default,
    //   attributeName: HtmlDataAttribute.ColorPalette,
    // }),
    // 保留原有的 ThemeProvider 装饰器
    withTheme,
  ],
};

export default preview;
