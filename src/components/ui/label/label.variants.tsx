import { cva } from "class-variance-authority";

export const labelVariants = cva([
  // [1] 基础样式
  "flex items-center gap-2 text-sm leading-none font-medium select-none",

  // [2] 禁用状态 (当 Label 包裹在一个 data-[disabled=true] 的父元素中时)
  "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",

  // [3] 禁用状态 (当 Label 关联的 <input> 元素被禁用时)
  "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
]);
