// 3. 导入 Storybook 官方提供的 Decorator 类型定义
import type { Decorator } from "@storybook/react-vite";
// 2. 导入 AntdAdapter (ThemeProvider 依赖它来适配 Ant Design)
import { AntdAdapter } from "./adapter/antd.adapter";
// 1. 导入我们在第六章创建的 ThemeProvider
import { ThemeProvider } from "./theme-provider";

/**
 * Storybook Decorator: 用于全局包裹所有 Stories
 *
 * 核心职责:
 * 1. 渲染应用级的 ThemeProvider。
 * 2. 传入 AntdAdapter，确保 Ant Design 组件也能接收主题。
 * 3. 渲染由 Storybook 传入的实际 Story 组件 (<Story />)。
 */
export const withTheme: Decorator = (Story) => {
  return (
    // 使用我们在第六章构建的 ThemeProvider 进行包裹
    // 并传入 AntdAdapter 以确保 Ant Design 组件的主题同步
    <ThemeProvider adapters={[AntdAdapter]}>
      {/* 渲染实际的 Story 组件 */}
      <Story />
    </ThemeProvider>
  );
};
