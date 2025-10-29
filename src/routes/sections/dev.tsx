import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// 1. 导入布局和测试页面
const MockPage = lazy(() => import("@/components/dev/MockPage"));

// 2. 创建一个空的路由数组
const devRoutes: RouteObject[] = [];

// 3. (关键) 仅在开发环境下填充路由
// Vite/Webpack 会在生产构建时自动移除这个 if 块 (Tree-shaking)
if (process.env.NODE_ENV === "development") {
  devRoutes.push({
    path: "dev",
    element: <MockPage />,
  });
}

// 5. 导出（在生产环境中这将是一个空数组）
export { devRoutes };
