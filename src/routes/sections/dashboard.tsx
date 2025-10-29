import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// 动态导入 DashboardLayout
const LazyDashboardLayout = lazy(() => import("@/layouts/dashboard"));

// 动态导入 Welcome 页面
const LazyWelcomePage = lazy(() => import("@/pages/Welcome"));

export const dashboardRoutes: RouteObject[] = [
  {
    path: "/",
    element: <LazyDashboardLayout />,
    children: [
      {
        index: true,
        element: <LazyWelcomePage />,
      },
    ],
  },
];
