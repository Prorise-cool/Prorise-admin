import type { StorybookConfig } from "@storybook/react-vite";
// 1. 导入 Vite 的 mergeConfig 和我们要用的插件
import { mergeConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs", // 用于文档生成
    "@storybook/addon-onboarding", // 用于引导用户
    "@storybook/addon-a11y", // 用于无障碍测试
    "@storybook/addon-vitest",
    "@storybook/addon-themes", // <--- 确认此行存在
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  // 3. [新增] 添加 viteFinal 钩子
  async viteFinal(config) {
    // 4. 使用 mergeConfig 合并我们的自定义配置
    return mergeConfig(config, {
      // 5. 添加 tsconfig-paths 插件
      //    它会自动读取 tsconfig.json 中的 paths
      plugins: [viteTsconfigPaths()],
    });
  },
};
export default config;
