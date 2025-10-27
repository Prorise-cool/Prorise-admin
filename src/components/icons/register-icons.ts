import { type ComponentType, lazy, type SVGProps } from "react";

// 1. 使用 React.lazy 动态导入所有由 SVGR 生成的本地组件。
//    这确保了本地图标也能按需加载，不会增加初始包体积。
const localIcons = {
  "ic-logo-badge": lazy(() => import("@/components/icons/logos/PLogo")),
  // 运行 pnpm build:icons 后，在此添加更多图标:
  // 'another-icon': lazy(() => import('@/components/icons/AnotherIcon')),
};

// 2. 导出本地图标名称的类型，以便 Icon.tsx 可以获得类型提示
export type LocalIconName = keyof typeof localIcons;

// 3. 导出一个查找函数
export const getLocalIcon = (
  name: string,
): ComponentType<SVGProps<SVGSVGElement>> | undefined => {
  if (name in localIcons) {
    return localIcons[name as LocalIconName];
  }
  return undefined;
};
