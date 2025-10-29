/**
 * DashboardLayout 的顶部导航栏。
 *
 * 架构职责：
 * 1. 作为 Grid 布局第 2 列中的 *第一个* 元素。
 * 2. 使用 'h-layout-header' (64px) 确保与 NavVertical 的 Logo 区高度一致。
 * 3. 使用 'position: sticky' 和 'top-0' 将其固定在内容区的顶部。
 * 4. 实现 'backdrop-blur' 毛玻璃效果。
 * 5. 内部使用 Flexbox 划分为左/右插槽，为未来组件做准备。
 */
export default function Header() {
  return (
    // [修改]
    // - h-layout-header: 消费 64px 高度变量。
    // - sticky top-0: 核心！使其"粘"在滚动容器（即 Grid 第 2 列）的顶部。
    // - z-app-bar: 消费我们在 base.ts中定义的 z-index 变量，
    //   确保它浮在内容之上，但在导航栏之下（如果我们使用 'fixed' 布局）。
    // - [重要] shrink-0: 防止此元素在 flex 布局中被压缩（当 Grid 第 2 列为 flex 时）。
    <header className="h-layout-header sticky top-0 z-app-bar shrink-0 bg-background/80 backdrop-blur-sm">
      <div className="h-full flex items-center justify-between px-6">
        {/* 左侧插槽 (未来用于面包屑) */}
        <div className="text-sm text-muted-foreground">
          (Left Slot: Breadcrumbs)
        </div>

        {/* 右侧插槽 (未来用于操作按钮) */}
        <div className="text-sm text-muted-foreground">
          (Right Slot: Actions)
        </div>
      </div>
    </header>
  );
}
