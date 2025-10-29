import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/utils/cn";
// 1. 导入我们分离的样式变体
import {
  scrollAreaRootVariants,
  scrollAreaScrollbarVariants,
  scrollAreaThumbVariants,
  scrollAreaViewportVariants,
} from "./scroll-area.variants";

// 2. 定义 Props 接口
export interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  orientation?: "vertical" | "horizontal" | "both";
}

// [核心] 封装一个内部的 ScrollBar 组件
export interface ScrollBarProps
  extends React.ComponentPropsWithoutRef<
    typeof ScrollAreaPrimitive.ScrollAreaScrollbar
  > {}

const ScrollBar = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  ScrollBarProps & VariantProps<typeof scrollAreaScrollbarVariants> // 继承 CVA 变体类型
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    className={cn(scrollAreaScrollbarVariants({ orientation }), className)}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb
      className={cn(scrollAreaThumbVariants())}
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// 封装并导出主组件 ScrollArea
const ScrollArea = React.forwardRef<
  React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, orientation = "vertical", ...props }, ref) => (
  // 4. 根容器 (Root)
  <ScrollAreaPrimitive.Root
    ref={ref}
    // 5. 消费 Root 的 CVA 变体
    className={cn(scrollAreaRootVariants(), className)}
    {...props}
  >
    {/* 6. 视口 (Viewport) */}
    <ScrollAreaPrimitive.Viewport
      // 7. 消费 Viewport 的 CVA 变体
      className={cn(scrollAreaViewportVariants())}
    >
      {children}
    </ScrollAreaPrimitive.Viewport>

    {/* [核心] (API 封装) 
          根据 orientation prop 消费内部 ScrollBar 
      */}
    {(orientation === "vertical" || orientation === "both") && (
      <ScrollBar orientation="vertical" className="z-scrollbar" />
    )}
    {(orientation === "horizontal" || orientation === "both") && (
      <ScrollBar orientation="horizontal" className="z-scrollbar" />
    )}

    {/* [新增] 渲染角落组件 */}
    {/* 这是 Radix UI ScrollArea 完整结构所需的组件，用于处理水平和垂直滚动条交叉的角落区域。 */}
    <ScrollAreaPrimitive.ScrollAreaCorner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// 导出两个组件，使其可组合
export { ScrollArea, ScrollBar };
