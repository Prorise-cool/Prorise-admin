// src/_mock/assets.ts

import type { MenuEntity } from "@/types/entity";
import { PermissionType } from "@/types/enum";

const { GROUP, MENU, CATALOGUE } = PermissionType;

export const RAW_MENU_DATA: MenuEntity[] = [
  // --- 仪表盘分组 ---
  {
    id: "group_dashboard",
    parentId: "",
    name: "sys.nav.dashboard",
    type: GROUP,
    order: 1,
  },
  {
    id: "workbench",
    parentId: "group_dashboard",
    name: "sys.nav.workbench",
    icon: "solar:widget-bold-duotone",
    type: MENU,
    path: "/workbench",
    component: "/dashboard/workbench/index.tsx",
    order: 1,
  },
  {
    id: "analysis",
    parentId: "group_dashboard",
    name: "sys.nav.analysis",
    icon: "solar:chart-bold-duotone",
    type: MENU,
    path: "/analysis",
    component: "/dashboard/analysis/index.tsx",
    order: 2,
  },

  // --- 系统管理分组 ---
  {
    id: "group_management",
    parentId: "",
    name: "sys.nav.management",
    type: GROUP,
    order: 2,
  },
  {
    id: "management_system",
    parentId: "group_management",
    name: "sys.nav.system.index",
    icon: "solar:settings-bold-duotone",
    type: CATALOGUE,
    path: "/system",
    order: 1,
  },
  {
    id: "management_system_user",
    parentId: "management_system",
    name: "sys.nav.system.user",
    type: MENU,
    path: "/system/user",
    component: "/management/system/user/index.tsx",
    order: 1,
  },
  {
    id: "management_system_role",
    parentId: "management_system",
    name: "sys.nav.system.role",
    type: MENU,
    path: "/system/role",
    component: "/management/system/role/index.tsx",
    order: 2,
  },
];
