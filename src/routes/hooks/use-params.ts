import { useMemo } from "react";
import { useParams as _useParams } from "react-router-dom"; // 导入原始钩子并重命名

/**
 * 获取当前路由的动态参数对象。
 * 返回值通过 useMemo 保证引用稳定。
 */
export function useParams() {
  const params = _useParams(); // 调用原始钩子

  // 使用 useMemo 确保返回的 params 对象引用稳定
  return useMemo(() => params, [params]);
}
