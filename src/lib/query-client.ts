// src/lib/query-client.ts

import { QueryClient } from "@tanstack/react-query";

// 创建 QueryClient 实例并导出
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据在 5 分钟内被认为是 "新鲜" 的，不会重新请求
      staleTime: 1000 * 60 * 5,
      // 缓存数据在 10 分钟内若无交互则被清除
      gcTime: 1000 * 60 * 10,
      // API 请求失败时，将自动重试 1 次
      retry: 1,
      // 禁用窗口重新获得焦点时的自动数据刷新
      refetchOnWindowFocus: false,
    },
  },
});
