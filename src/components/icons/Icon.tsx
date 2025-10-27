import {
  Icon as IconifyIcon,
  type IconProps as IconifyProps,
} from "@iconify/react";
import { forwardRef, type Ref, Suspense } from "react";
import { cn } from "@/utils/cn";
import { getLocalIcon } from "./register-icons";

// 1. 定义 props 接口。
//    - 它继承了 Iconify 的所有 props (如 size, color, width, height)。
//    - Omit<..., 'icon'> 移除了 Iconify 原始的 'icon' prop。
//    - `icon: string` 添加了我们自己的 'icon' prop，
//      它将同时支持 'lucide:home' 和 'local:ic-logo-badge' 两种格式。
interface IconProps extends Omit<IconifyProps, "icon"> {
  /**
   * 图标标识符。
   * - 远程 (Iconify): 'icon-set:icon-name' (e.g., 'lucide:home')
   * - 本地 (SVGR): 'local:icon-name' (e.g., 'local:ic-logo-badge')
   */
  icon: string;
}

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon, className, ...props }: IconProps, ref: Ref<SVGSVGElement>) => {
    // 2. 检查 'local:' 前缀
    if (icon.startsWith("local:")) {
      // 轨道一：渲染本地 SVGR 图标

      // 移除前缀，获取图标的真实名称
      const iconName = icon.replace("local:", "");
      const LocalIconComponent = getLocalIcon(iconName);

      if (!LocalIconComponent) {
        // 在注册表中未找到该本地图标
        return null;
      }

      // 3. (关键) 使用 <Suspense> 包裹
      //    因为 LocalIconComponent 是通过 React.lazy 导入的，
      //    它在首次渲染时会触发一个异步加载。
      //    fallback={null} 避免了加载时出现闪烁。
      return (
        <Suspense fallback={null}>
          <LocalIconComponent
            className={cn("antialiased", className)} // 统一添加抗锯齿
            ref={ref}
            {...props}
          />
        </Suspense>
      );
    }

    // 4. 检查是否包含 ':' (Iconify 格式)
    if (icon.includes(":")) {
      // 轨道二：渲染远程 Iconify 图标
      return (
        <IconifyIcon
          icon={icon}
          className={cn("antialiased", className)} // 统一添加抗锯齿
          ref={ref} // Iconify 的 ref 类型略有不同
          {...props}
        />
      );
    }

    // 5. 如果格式不匹配，返回 null
    return null;
  },
);

Icon.displayName = "Icon";
