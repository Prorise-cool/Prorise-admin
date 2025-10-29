import { Spin } from "antd";

/**
 * 路由切换时的加载状态指示器。
 * 设计为作为 React.Suspense 的 fallback 属性值使用。
 * 它本身不包含任何状态或逻辑,仅负责 UI 展示。
 *
 * 注意: 此组件会填充其父容器的全部空间 (h-full w-full)。
 * 在 DashboardLayout 中，它只会占据主内容区域 (MainArea)。
 */
function RouteLoading() {
  return (
    <output
      className="flex h-full w-full items-center justify-center"
      aria-label="正在加载..."
    >
      <Spin size="large" />
    </output>
  );
}

export default RouteLoading;
