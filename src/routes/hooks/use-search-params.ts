import { useMemo } from "react";
import { useSearchParams as _useSearchParams } from "react-router-dom"; // 导入原始钩子

/**
 * 定义返回类型，确保与原始钩子签名一致
 *
 * ReturnType<T> 是 TypeScript 内置的工具类型，用于提取函数类型 T 的返回值类型
 *
 * useSearchParams 返回一个元组: [URLSearchParams, SetURLSearchParams函数]
 * [1] 是 TypeScript 的索引访问类型语法，用于获取元组中索引为 1 的元素类型
 * 即获取 SetURLSearchParams 函数的类型
 */
type UseSearchParamsReturnType = [
  URLSearchParams,
  ReturnType<typeof _useSearchParams>[1],
];

/**
 * 获取并操作 URL 查询参数。
 * 返回一个包含 memoized URLSearchParams 实例和设置函数的元组。
 * 返回的元组本身也通过 useMemo 保证引用稳定。
 */
export function useSearchParams(): UseSearchParamsReturnType {
  const [searchParams, setSearchParams] = _useSearchParams();

  // Memoize searchParams 对象
  const memoizedSearchParams = useMemo(() => searchParams, [searchParams]);

  // setSearchParams 函数通常是稳定的，但为了确保返回的元组引用稳定，
  // 将整个元组包裹在 useMemo 中。
  return useMemo(
    () => [memoizedSearchParams, setSearchParams],
    [memoizedSearchParams, setSearchParams],
  );
}
