import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// 动态导入 404 NotFoundPage 组件
const LazyNotFoundPage = lazy(() => import("@/pages/sys/error/Page404"));

// 定义 mainRoutes 数组，仅包含 404 路由
export const mainRoutes: RouteObject[] = [
  {
    // 404 Not Found 路由。
    // path: '*' 会匹配所有在其他路由规则中未匹配到的路径。
    // 它必须放在路由配置数组的末尾，以确保优先匹配其他具体路径。
    path: "*",
    element: <LazyNotFoundPage />,
  },
];
