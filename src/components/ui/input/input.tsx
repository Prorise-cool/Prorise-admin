import type { VariantProps } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/utils/cn";
import { inputVariants } from "./input.variants";

// [1] 使用 VariantProps 推断 variants 类型（预留）
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

// [2] 使用 forwardRef 支持 ref 传递
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input" // [3] 便于 E2E 测试和 CSS 调试
        className={cn(inputVariants({ className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
