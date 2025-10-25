import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import AutoImport from "unplugin-auto-import/vite";
import antdResolver from "unplugin-auto-import-antd";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    // 这一行参数很重要，他会让Vanilla Extract 不要添加哈希后缀（如 __pl7sh5）
    vanillaExtractPlugin({
      identifiers: ({ debugId }) => `${debugId}`,
    }),
    AutoImport({
      // 目标文件类型
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
      ],
      // 自动导入的预设包
      imports: ["react"],
      // 使用 antdResolver（注意是小写）
      resolvers: [antdResolver()],
      // 自动生成 'auto-imports.d.ts' 类型声明文件
      dts: "./auto-imports.d.ts",
      // 解决 ESLint/BiomeJS 报错问题
      eslintrc: {
        enabled: true,
      },
    }),
  ],
});
