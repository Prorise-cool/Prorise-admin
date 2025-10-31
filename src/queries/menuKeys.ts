// src/queries/menuKeys.ts

/**
 * 菜单模块的 Query Keys
 *
 * 这种结构化设计的好处：
 * 1. 集中管理，避免在代码中散落魔术字符串。
 * 2. 类型安全，`as const` 确保 TypeScript 推断出最精确的类型。
 * 3. 结构清晰，便于对整个模块或特定查询进行缓存失效等操作。
 */
export const menuKeys = {
  // 代表整个菜单模块
  all: ["menu"] as const,
  // 菜单列表的 key
  lists: () => [...menuKeys.all, "list"] as const,
  // 某个特定菜单的详情 (示例)
  // detail: (id: string) => [...menuKeys.all, "detail", id] as const,
};
