import { cn } from "@/utils/cn";
// 1. (关键) 只导入 Icon 组件。不导入 'react-router-dom'。
import { Icon } from "../icons/Icon";

interface Props {
  width?: number | string;
  height?: number | string;
  className?: string;
}

/**
 * 全站 Logo 品牌标识组件。
 * 纯展示组件，不包含路由逻辑。
 */
function Logo({ width = 50, height = 50, className }: Props) {
  return (
    // 根元素是一个 span (或 div)，并应用传入的 className。
    <span className={cn(className)}>
      {/*
          消费 <Icon /> 组件
             - icon="local:ic-logo-badge"：调用已注册的本地图标
             - width/height：使用 Iconify 原生的尺寸属性
             - color="var(...)": 强行指定 Logo 颜色为我们的主色
        */}
      <Icon
        icon="local:ic-logo-badge"
        width={width}
        height={height}
        color="var(--colors-palette-primary-default)"
      />
    </span>
  );
}

export default Logo;
