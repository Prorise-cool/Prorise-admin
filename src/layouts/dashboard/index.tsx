import { useMenuQuery } from "@/hooks/menu/useMenuQuery";
import Header from "./header";
import MainArea from "./main-area";
import NavVertical from "./nav/nav-vertical";

/**
 * DashboardLayout 主布局 "组装器"。
 *
 * 架构职责：
 * 1. 实现 12.4.1 规划的 CSS Grid 布局。
 * 2. 'grid-cols-[var(--layout-nav-width)_1fr]' 定义两列布局。
 * 3. 将 <NavVertical /> 放入第 1 列。
 * 4. 创建一个 "主工作区" 容器 (div) 放入第 2 列。
 * 5. 这个 "主工作区" 容器将是 *滚动容器* (overflow-y-auto)，
 * 并使用 'flex flex-col' 来垂直堆叠 Header 和 MainArea。
 */
export default function DashboardLayout() {
  // 一行代码，处理数据获取、加载中、错误三种状态
  const { isLoading, isError, error } = useMenuQuery();

  // Loading 状态处理
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  // Error 状态处理
  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">
          加载失败：{error instanceof Error ? error.message : "未知错误"}
        </div>
      </div>
    );
  }
  // 数据加载成功，渲染完整布局
  return (
    <div className="grid h-screen grid-cols-[var(--layout-nav-width)_1fr]">
      <NavVertical />
      <div className="flex flex-col overflow-y-auto">
        <Header />
        <MainArea />
      </div>
    </div>
  );
}
