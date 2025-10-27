import { Slot } from "@radix-ui/react-slot"; // 导入 Slot
import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/utils/cn";
import { buttonVariants } from "./button.variants";
// 使用 VariantProps 工具类型从 CVA 定义中推断出 variant 和 size 的 props 类型
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean; // 添加 asChild prop
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant, size, asChild = false, ...props }, ref) => {
    // 根据 asChild 的值，决定渲染的根组件是 Slot 还是 'button'
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  },
);
// 为组件设置一个 displayName，这在 React DevTools 中调试时非常有用
Button.displayName = "Button";
export { Button };
