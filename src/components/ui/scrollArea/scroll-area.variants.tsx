import { cva } from "class-variance-authority";

// 1. 根 (Root) 元素的样式
export const scrollAreaRootVariants = cva("relative overflow-hidden");

// 2. 视口 (Viewport) 元素的样式
export const scrollAreaViewportVariants = cva(
  "h-full w-full rounded-[inherit] block!", // 'block!' 强制覆盖 Radix 内联样式
);

// 3. 滚动条 (Scrollbar) 元素的样式
export const scrollAreaScrollbarVariants = cva(
  "flex touch-none select-none transition-colors",
  {
    variants: {
      orientation: {
        vertical: "h-full w-2.5 p-[1px]",
        horizontal: "h-2.5 flex-col p-[1px]",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);

// 4. 滑块 (Thumb) 元素的样式
// 我们消费在第九章定义的主题变量 bg-border
export const scrollAreaThumbVariants = cva(
  "relative flex-1 rounded-full bg-gray-500/border cursor-pointer bg-primary",
);
