import { Spin } from "antd";

/**
 * 全局路由切换时的加载状态指示器。
 * 设计为作为 React.Suspense 的 fallback 属性值使用。
 * 它本身不包含任何状态或逻辑,仅负责 UI 展示。
 */
function RouteLoading() {
  // 思考:为什么选择全屏居中?
  // 因为路由切换通常意味着整个页面内容的替换,
  // 一个覆盖全屏的居中加载指示器能提供最明确的"正在加载"反馈。
  return (
    <output
      className="flex h-screen w-screen items-center justify-center"
      aria-label="正在加载..."
    >
      <Spin size="large" />
    </output>
  );
}

export default RouteLoading;
