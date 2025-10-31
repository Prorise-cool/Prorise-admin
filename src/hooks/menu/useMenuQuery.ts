// src/hooks/menu/useMenuQuery.ts

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import menuService from "@/api/services/menuService";
import { menuKeys } from "@/queries/menuKeys"; // 从集中管理的文件中导入 keys
import { useMenuActions } from "@/store/menuStore";

/**
 * 获取菜单列表的业务 Hook
 *
 * 功能：
 * 1. 使用 React Query 从 API 获取菜单数据，并由其自动管理缓存、loading、error 状态。
 * 2. 数据获取成功后，自动同步到 Zustand store，供全局消费。
 */
export function useMenuQuery() {
  const { setMenuTree } = useMenuActions();

  const query = useQuery({
    queryKey: menuKeys.lists(), // 使用 menuKeys 工厂函数生成 key
    queryFn: menuService.getMenuList,
  });

  // 监听 query.data 的变化，将其同步到 Zustand store
  useEffect(() => {
    if (query.data) {
      setMenuTree(query.data);
    }
  }, [query.data, setMenuTree]);

  return query;
}
