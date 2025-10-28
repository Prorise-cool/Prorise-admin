import { useMemo } from "react";
import { useLocation } from "react-router-dom";

/**
 * 获取当前 URL 的路径名 (pathname)。
 * 返回值通过 useMemo 保证引用稳定。
 */
export function usePathname() {
  const { pathname } = useLocation();

  // 使用 useMemo 确保返回的字符串引用稳定
  return useMemo(() => pathname, [pathname]);
}
