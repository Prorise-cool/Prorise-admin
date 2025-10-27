import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Prorise Admin",
  description: "企业级后台管理系统模板，基于 React 19、Vite 与 Ant Design。",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    // [导航栏]
    nav: [
      { text: "首页", link: "/" },
      { text: "快速开始", link: "/guide/getting-started" }, // 示例链接
      { text: "Storybook", link: "http://localhost:6006" }, // 示例：外链到 Storybook
    ],

    // [侧边栏]
    sidebar: {
      "/guide/": [
        {
          text: "指南",
          items: [
            { text: "快速开始", link: "/guide/getting-started" },
            { text: "项目结构", link: "/guide/directory-structure" },
            // 更多指南...
          ],
        },
      ],
    },

    // [社交链接]
    socialLinks: [
      { icon: "github", link: "https://github.com/Prorise-cool/Prorise-admin" }, // 替换为你的仓库链接
    ],
  },
});
