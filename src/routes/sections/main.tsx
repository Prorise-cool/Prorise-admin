import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// 1. 动态导入 WelcomePage (路径保持不变)
const LazyWelcomePage = lazy(() => import("@/pages/Welcome"));

// 2. (新增) 动态导入一个 404 NotFoundPage 组件
//    需要先创建这个页面文件，我们可以在这个路径下创建他
// mkdir -p src/pages/sys/error && touch src/pages/sys/error/Page404.tsx
const LazyNotFoundPage = lazy(() => import("@/pages/sys/error/Page404"));

// 3. 定义 mainRoutes 数组，类型为 RouteObject[]
export const mainRoutes: RouteObject[] = [
  {
    // 根路径下的默认页面
    index: true,
    element: <LazyWelcomePage />,
  },
  {
    // 404 Not Found 路由。
    // path: '*' 会匹配所有在其他路由规则中未匹配到的路径。
    // 它必须放在路由配置数组的末尾，以确保优先匹配其他具体路径。
    path: "*",
    element: <LazyNotFoundPage />,
  },
];
