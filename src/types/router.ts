// src/types/router.ts (续)
import type { ReactNode } from "react";
import type { Params, RouteObject } from "react-router-dom";
/**
 * 路由元数据 (Route Metadata)
 * 此接口用于存放与 UI 渲染和业务逻辑相关的附加信息，与 React Router 的
 * 核心路由属性 (path, element) 完全解耦。导航菜单组件将直接消费此 meta 对象。
 */
export interface RouteMeta {
  /**
   * 唯一键 (Unique Key)
   *
   * 作用：
   * 1. React 渲染：作为列表渲染 (map) 时的 `key` prop，是 React 高效更新所必需的。
   * 2. 状态管理：当用户点击或展开菜单项时，需要一个唯一的、稳定的标识符来记录
   *    当前激活或展开的菜单项。
   *
   * `path` 属性（如 `/users/:id`）因包含动态参数而不够稳定，不适合用作 key。
   */
  key: string;

  /**
   * 菜单标签 (Label)
   *
   * 定义为 `string` 类型是为了支持国际化 (i18n)。
   * 国际化库通常使用字符串键 (如 'menu.dashboard.analysis') 来查找译文。
   */
  label: string;

  /**
   * 菜单图标 (Icon)
   *
   * 定义为 `ReactNode` 是一个关键的解耦决策。它允许数据层传递一个完整的
   * React 元素（如 `<Icon icon="ic-dashboard" />`），而无需与图标组件的具体实现
   * (如组件名、props) 发生耦合。这实现了清晰的关注点分离。
   */
  icon?: ReactNode;

  /**
   * 在菜单中隐藏 (Hide in Menu)
   * 这是一个关键的业务属性。许多页面（如用户详情页 `/users/123`）
   * 必须在路由系统中注册才能被访问，但绝不应出现在导航菜单中。
   * `hideMenu: true` 是导航菜单组件跳过渲染此项的依据。
   */
  hideMenu?: boolean;

  /**
   * 菜单项是否禁用 (Disabled)
   * 用于基于特定条件（如用户权限）显示但禁用点击的菜单项。
   */
  disabled?: boolean;

  /**
   * 动态路由参数 (Params)
   * 用于存储动态路由的示例参数（如 `/user/:id`），
   * 以便菜单项能导航到一个具体的示例页面（如 `/user/123`）。
   */
  params?: Params<string>;
}

/**
 * 应用程序路由对象 (AppRouteObject)
 *
 * 这是 Prorise-Admin 中唯一的路由数据结构，是系统的“唯一事实来源”。
 * 它通过 TypeScript 交叉类型，整合了 React Router 的路由功能和自定义的元数据功能。
 */
export type AppRouteObject = {
  /**
   * 菜单排序 (Order)
   * 用于菜单项的显示排序，数值越小越靠前。
   */
  order?: number;

  /**
   * 路由元数据
   * 将上面定义的 `RouteMeta` 附加到路由对象上。
   * React Router 会忽略此属性，而我们的 UI 系统会专门消费它。
   */
  meta?: RouteMeta;

  /**
   * 子路由 (Children)
   * 我们在此处覆盖了 React Router 原生的 `children` 属性。原生的 `children`
   * 类型是 `RouteObject[]`，我们将其强制指定为 `AppRouteObject[]`，
   * 从而确保子路由也必须遵循我们的自定义结构，使类型检查可以深入到无限层级。
   */
  children?: AppRouteObject[];
} & Omit<RouteObject, "children">;
