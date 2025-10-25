/// <reference types="vitest/config" />
import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import AutoImport from "unplugin-auto-import/vite";
import antdResolver from "unplugin-auto-import-antd";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
import path from "node:path";
import { fileURLToPath } from "node:url";
import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    vanillaExtractPlugin(),
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
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({
            configDir: path.join(dirname, ".storybook"),
          }),
        ],
        test: {
          name: "storybook",
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [
              {
                browser: "chromium",
              },
            ],
          },
          setupFiles: [".storybook/vitest.setup.ts"],
        },
      },
    ],
  },
});
