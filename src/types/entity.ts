// src/types/entity.ts

import type { PermissionType } from "./enum";

/**
 * 后端返回的菜单项实体类型
 * 这代表了从 API 接收到的"原始"数据结构。
 */
export interface MenuEntity {
  /**
   * 唯一 ID
   */
  id: string;
  /**
   * 父级 ID，用于构建树状结构。
   */
  parentId: string;

  /**
   * 菜单名称/标签 (通常是 i18n 键)
   */
  name: string;

  /**
   * 菜单类型: GROUP, CATALOGUE, 或 MENU
   */
  type: PermissionType;

  /**
   * 路由路径
   */
  path?: string;

  /**
   * 前端组件的路径
   */
  component?: string;

  /**
   * 图标名称
   */
  icon?: string;

  /**
   * 显示顺序
   */
  order?: number;

  /**
   * 子菜单（树形结构）
   */
  children?: MenuEntity[];

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * 是否隐藏
   */
  hidden?: boolean;
}
