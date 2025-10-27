import { cva } from "class-variance-authority";

export const inputVariants = cva(
  [
    // [1] 基础布局和尺寸
    "flex h-9 w-full min-w-0 rounded-md border px-3 py-1",

    // [2] 颜色系统 - 消费我们的 CSS 桥接变量
    "border-input bg-transparent",
    "text-base text-foreground",
    "placeholder:text-muted-foreground",

    // [3] 暗色模式定制
    "dark:bg-input/30",

    // [4] 选中文本样式
    "selection:bg-primary selection:text-primary-foreground",

    // [5] 阴影和过渡
    "shadow-sm transition-colors",

    // [6] 聚焦状态 - 消费我们的 ring 变量
    "outline-none",
    "focus-visible:ring-1 focus-visible:ring-ring",

    // [7] 禁用状态
    "disabled:cursor-not-allowed disabled:opacity-50",

    // [8] 失效状态 - 消费我们的 destructive 变量
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
    "dark:aria-invalid:ring-destructive/40",

    // [9] 文件上传样式
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "file:text-foreground",

    // [10] 响应式调整
    "md:text-sm",
  ],
  {
    variants: {
      // 预留：未来可以在这里添加 size、variant 等变体
    },
    defaultVariants: {
      // 预留：默认变体配置
    },
  },
);
