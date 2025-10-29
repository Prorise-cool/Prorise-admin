import { Outlet } from "react-router-dom";

// 导入项目已有的上下文提供者
import { AntdAdapter } from "@/theme/adapter/antd.adapter";
import { ThemeProvider } from "@/theme/theme-provider";

/**
 * 应用的根组件，同时也作为根路由 '/' 的布局组件。
 * 它负责提供全局上下文 (主题, Antd 配置)
 * 并定义子路由的渲染位置 (<Outlet />)。
 *
 * 注意: Suspense 的处理已下放到具体的布局组件中 (如 MainArea)，
 * 这样可以确保 loading 状态只在主内容区域显示，而不会覆盖导航栏和 header。
 */
function MyApp() {
  return (
    <ThemeProvider adapters={[AntdAdapter]}>
      <Outlet />
    </ThemeProvider>
  );
}
export default MyApp;
