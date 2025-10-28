// 1. 导入 Suspense (来自 React) 和 Outlet (来自 React Router)
import { Suspense } from "react";
import { Outlet } from "react-router-dom";

// 2. 导入刚刚创建的加载占位符组件
import RouteLoading from "@/components/loading/route-loading";

// 3.导入项目已有的上下文提供者
import { AntdAdapter } from "@/theme/adapter/antd.adapter";
import { ThemeProvider } from "@/theme/theme-provider";

/**
 * 应用的根组件，同时也作为根路由 '/' 的布局组件。
 * 它负责提供全局上下文 (主题, Antd 配置)
 * 并定义子路由的渲染位置 (<Outlet />) 及其加载状态 (<Suspense />)。
 */
function MyApp() {
  // 思考：为什么 Suspense 放在这里？
  // 将 Suspense 放在尽可能靠近路由变化的地方（即 Outlet 周围）
  // 可以确保所有懒加载的子路由都能共享同一个 fallback UI，
  // 简化了配置，并提供了统一的加载体验。
  return (
    // 全局上下文提供者 (来自之前章节)
    <ThemeProvider adapters={[AntdAdapter]}>
      <Suspense fallback={<RouteLoading />}>
        <Outlet />
      </Suspense>
    </ThemeProvider>
  );
}
export default MyApp;
