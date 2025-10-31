// src/store/menuStore.ts

import { create } from "zustand";
import type { MenuEntity } from "@/types/entity";

type MenuStore = {
  // State: 存储的数据
  menuTree: MenuEntity[]; // 存储从后端获取的、未经转换的树状菜单数据

  // Actions: 修改 State 的方法
  actions: {
    setMenuTree: (menuTree: MenuEntity[]) => void;
  };
};

const useMenuStore = create<MenuStore>((set) => ({
  // 初始状态
  menuTree: [],

  // 实现 actions
  actions: {
    setMenuTree: (menuTree) => set({ menuTree }),
  },
}));

// Hook for accessing the menu data
export const useMenuTree = () => useMenuStore((state) => state.menuTree);

// Hook for accessing the actions
export const useMenuActions = () => useMenuStore((state) => state.actions);

export default useMenuStore;
