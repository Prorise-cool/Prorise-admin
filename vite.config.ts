import tailwindcss from "@tailwindcss/vite";
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
