// 1. 导入我们在第 10 章创建的 Logo 组件
import Logo from "@/components/brand/Logo";
// 2. 导入我们在 12.3 节构建的 ScrollArea 组件
import { ScrollArea } from "@/components/ui/scrollArea/scroll-area";

/**
 * DashboardLayout 的垂直侧边导航栏。
 *
 * 架构职责：
 * 1. 作为 CSS Grid 布局的第 1 列。
 * 2. 消费 'w-layout-nav' (var(--layout-nav-width)) 来设置自身宽度。
 * 3. 内部划分为 "Logo 区" 和 "菜单区"。
 * 4. "Logo 区" 消费 'h-layout-header' (var(--layout-header-height))，与主 Header 保持视觉对齐。
 * 5. "菜单区" 使用 ScrollArea 组件，实现内容的安全滚动。
 */
export default function NavVertical() {
  return (
    <nav className="h-screen w-layout-nav flex flex-col border-r border-dashed bg-background">
      {/* Logo 区 */}
      {/*
       * - h-layout-header: 消费头部高度变量 (64px)，实现视觉对齐。
       * - px-6: 提供水平内边距。
       * - flex items-center: 确保 Logo 垂直居中。
       * - [重要] shrink-0: 防止此元素在 flex 布局中被压缩。
       */}
      <div className="h-layout-header shrink-0 flex items-center px-6">
        <Logo />
      </div>

      {/* 菜单区 (可滚动) */}
      {/*
       * - [关键] flex-1: 让这个 div 占据所有剩余的垂直空间。
       * - [关键] overflow-hidden:
       * 这是 ScrollArea (基于 Radix) 正常工作的 *必须* 条件。
       * ScrollArea 的父元素必须有一个确定的高度
       * (由 flex-1 提供) 并且必须裁剪掉溢出的内容。
       */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea orientation="vertical" className="h-full">
          {/* 避免滚动条紧贴菜单项 */}
          <div className="px-4 py-4">
            {/* * (占位符)
             * 在后续章节中，我们将在这里渲染一个
             * 真正的 <NavMenu /> 组件。
             * 我们使用 'h-96' 来模拟长内容，以测试滚动条。
             */}
            <div className="h-96 rounded-md bg-muted p-4 text-muted-foreground">
              (菜单项将在这里渲染)
            </div>
            <div className="mt-4 h-96 rounded-md bg-muted p-4 text-muted-foreground">
              (菜单项将在这里渲染)
            </div>
            <div className="mt-4 h-96 rounded-md bg-muted p-4 text-muted-foreground">
              (菜单T)
            </div>
          </div>
        </ScrollArea>
      </div>
    </nav>
  );
}
