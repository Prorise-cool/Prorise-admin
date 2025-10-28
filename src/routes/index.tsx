import { createBrowserRouter, type RouteObject } from "react-router-dom";
import { lazy } from "react";

// 1. 导入各个 sections 文件导出的路由数组
import { mainRoutes } from "./sections/main";
import { authRoutes } from "./sections/auth";
import { dashboardRoutes } from "./sections/dashboard";

// 2. 导入根布局组件 (保持懒加载)
const LazyMyApp = lazy(() => import("@/MyApp"));
// 3. 导入基础错误边界组件
import ErrorBoundary from "./components/error-boundary";

// 4. 定义根路由对象，包含布局、错误处理和空的 children
const rootRoute: RouteObject = {
  path: "/",
  Component: LazyMyApp,
  errorElement: <ErrorBoundary />, // 使用 11.3 创建的基础错误边界
  children: [
    // 5. (核心) 使用 JavaScript 展开运算符 (...) 组装所有子路由
    //    这个 children 数组现在完全由导入的 sections 动态构成
    //    注意顺序：auth 和 dashboard 路由优先匹配，
    //    mainRoutes (包含 index 和 404) 放在最后作为默认和回退
    ...authRoutes,
    ...dashboardRoutes,
    // ... 未来可以添加更多 sections, e.g., ...userProfileRoutes
    ...mainRoutes,
  ],
};

// 6. 创建并导出 router 实例
export const router = createBrowserRouter([
  rootRoute,
  // 如果有完全独立的顶级路由 (例如不使用 MyApp 布局的 /landing 页面)，
  // 可以在这里添加更多顶级 RouteObject
]);
