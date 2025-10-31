import { useMemo } from "react";

import { useMenuTree } from "@/store/menuStore";
import { convertMenuToNavData } from "@/utils/nav-converter";

/**
 * 获取导航菜单数据
 *
 * 从 store 获取原始菜单数据，转换为 Nav 组件需要的格式
 */
export function useNavData() {
  const menuTree = useMenuTree();

  const navData = useMemo(() => {
    return convertMenuToNavData(menuTree);
  }, [menuTree]);

  return navData;
}
