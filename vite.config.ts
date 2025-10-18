import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths"; // 1. 导入插件
import AutoImport from "unplugin-auto-import/vite"; // 1. 导入

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(), // 2. 加载插件
    AutoImport({
      // 目标文件类型
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
      ],
      // 自动导入的预设包
      // 我们这里只开启 react，未来需要时再添加 'antd', 'react-router-dom' 等
      imports: ["react"],
      // 自动生成 'auto-imports.d.ts' 类型声明文件
      dts: true,
      // 解决 ESLint/BiomeJS 报错问题
      eslintrc: {
        enabled: true,
      },
    }),
  ],
});
