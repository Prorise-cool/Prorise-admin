import { Outlet } from "react-router-dom"; // 导入 Outlet 用于渲染子路由

// 导入刚刚创建（或规划好）的 HeaderSimple 组件
import HeaderSimple from "../components/header-simple";

/**
 * 简单布局组件。
 * 提供一个包含简单头部 (HeaderSimple) 和内容居中 (main) 的基本页面框架。
 * 适用于登录、注册等独立页面。子路由的内容将渲染在 <Outlet /> 的位置。
 */
export default function SimpleLayout() {
  return (
    // 1. 根容器：Flex 垂直布局，最小高度占满屏幕
    <div className="flex min-h-screen w-full flex-col bg-background text-foreground">
      {/* 2. 渲染页眉 */}
      <HeaderSimple />

      {/* 3. 主内容区域：自动填充剩余空间，内部 Flex 实现内容居中 */}
      <main className="flex flex-grow items-center justify-center p-4">
        <Outlet />
      </main>

      {/* (可选) Footer 区域可以在此添加 */}
      <footer className="shrink-0 p-4 text-center text-sm text-muted-foreground">
        © 2025 Prorise-Admin
      </footer>
    </div>
  );
}
