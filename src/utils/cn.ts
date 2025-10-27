import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合并 CSS 类名，并使用 tailwind-merge 解决冲突。
 *
 * @param inputs - 接受任意数量的参数，可以是字符串、对象、数组等 (同 clsx)。
 * @returns 优化后的 className 字符串。
 *
 * @example
 * cn('p-4', 'bg-red-500', { 'font-bold': true, 'text-lg': false }, ['hover: opacity-75'])
 * // => "p-4 bg-red-500 font-bold hover: opacity-75"
 *
 * // 结合 cva 使用:
 * // cn(buttonVariants({ variant, size }), className)
 */
export function cn(...inputs: ClassValue[]) {
  // 1. clsx 先处理条件和格式，生成一个可能包含冲突或冗余的类名字符串
  const preliminaryClassName = clsx(inputs);
  // 2. twMerge 再对结果进行智能优化
  return twMerge(preliminaryClassName);
}
