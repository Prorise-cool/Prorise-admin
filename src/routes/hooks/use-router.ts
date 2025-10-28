import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface NavigationOptions {
  /** 是否替换当前历史记录而非新增 */
  replace?: boolean;
  /** 传递给目标页面的状态数据，可在目标页面通过 useLocation().state 获取 */
  state?: unknown;
}

interface ReplaceOptions {
  /** 传递给目标页面的状态数据，可在目标页面通过 useLocation().state 获取 */
  state?: unknown;
}

/**
 * 提供便捷的编程式导航方法。
 * 返回的对象及其方法通过 useMemo 保证引用稳定。
 */
export function useRouter() {
  const navigate = useNavigate();

  const router = useMemo(
    () => ({
      /** 导航到新页面 (入栈) */
      push: (href: string, options?: NavigationOptions) =>
        navigate(href, options),
      /** 导航到新页面并替换当前历史记录 */
      replace: (href: string, options?: ReplaceOptions) =>
        navigate(href, { ...options, replace: true }),
      /** 返回上一页 */
      back: () => navigate(-1),
    }),
    [navigate],
  );

  return router;
}
