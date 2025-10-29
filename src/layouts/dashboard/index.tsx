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
  return (
    // 1. 根容器：CSS Grid 布局
    //    - h-screen: 确保布局占满整个视口高度。
    //    - grid: 启用 Grid 布局。
    //    - grid-cols-[...]:
    //      使用 'var(--layout-nav-width)' (即 260px) 作为第 1 列宽度，
    //      '1fr' (剩余所有空间) 作为第 2 列宽度。
    <div className="grid h-screen grid-cols-[var(--layout-nav-width)_1fr]">
      {/* 2. Grid 第 1 列: 垂直导航栏 */}
      <NavVertical />

      {/* 后续步骤将在此处添加 Grid 第 2 列 */}
      <div className="flex flex-col overflow-y-auto">
        {/* 工作区子元素 1: 顶部导航栏 */}
        <Header />
        {/* 工作区子元素 2: 主内容区域 */}
        <MainArea />
      </div>
    </div>
  );
}
