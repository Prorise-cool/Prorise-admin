import { Suspense } from "react";
import { Outlet } from "react-router-dom";
// 导入我们在第 11 章创建的路由加载占位符
import RouteLoading from "@/components/loading/route-loading";

/**
 * DashboardLayout 的主内容区域。
 *
 * 架构职责：
 * 1. 作为 Grid 布局第 2 列中的 *第二个* 元素，位于 Header 之下。
 * 2. 使用 'flex-1' 占据所有剩余的垂直空间。
 * 3. 渲染子路由 (<Outlet />) 并为其提供 Suspense fallback。
 */
export default function MainArea() {
  return (
    <main className="flex-1">
      <Suspense fallback={<RouteLoading />}>
        <Outlet />
      </Suspense>
    </main>
  );
}
