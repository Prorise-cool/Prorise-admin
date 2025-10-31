import { Icon } from "@/components/icons/Icon";
import type { MenuEntity } from "@/types/entity";

/**
 * 导航菜单项类型
 */
interface NavItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  hidden?: boolean;
  children?: NavItem[];
}

/**
 * 递归转换子菜单项
 * 将 MenuEntity[] 转换为导航组件需要的格式
 */
const convertChildren = (children?: MenuEntity[]): NavItem[] => {
  if (!children?.length) return [];

  return children.map((child) => ({
    title: child.name,
    path: child.path || "",
    icon: child.icon ? (
      <Icon icon={child.icon} width={18} height={18} />
    ) : undefined,
    disabled: child.disabled,
    hidden: child.hidden,
    children: convertChildren(child.children),
  }));
};

/**
 * 将菜单树转换为导航数据
 * @param menuTree - 从后端获取的树形菜单数据
 */
export const convertMenuToNavData = (menuTree: MenuEntity[]) => {
  return menuTree.map((item) => ({
    name: item.name,
    items: convertChildren(item.children),
  }));
};
