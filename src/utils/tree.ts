// 定义一个通用的树节点接口，要求每个节点必须有 id 和 parentId
export interface TreeNode {
  id: string;
  parentId: string;
  children?: TreeNode[];
}

/**
 * 将扁平的数组结构转换为树状结构
 * @param flatList 具有 id 和 parentId 的扁平数组
 * @returns 树状结构的根节点数组
 */
export function convertFlatToTree<T extends TreeNode>(flatList: T[]): T[] {
  const tree: T[] = [];
  const map = new Map<string, T & { children: T[] }>();
  // 第一步：遍历所有项，创建 id 到节点自身的映射，并为每个节点初始化一个空的 children 数组。
  flatList.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  // 第二步：再次遍历，通过 parentId 查找每个节点的父节点，并将其添加到父节点的 children 中。
  map.forEach((node) => {
    const parent = map.get(node.parentId);
    if (parent) {
      // 如果找到了父节点，就将当前节点推入父节点的 children 数组
      parent.children.push(node);
    } else {
      // 如果没有父节点 (parentId 为空或不存在)，说明它是一个根节点，直接推入最终的 tree 数组
      tree.push(node);
    }
  });

  return tree;
}
