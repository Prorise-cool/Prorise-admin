import color from "color";
import type { AddChannelToLeaf } from "../type";

/**
 * 为颜色值添加 alpha 透明度
 * @param colorVal 颜色值 (支持 #hex)
 * @param alpha 透明度 (0-1)
 * @returns rgba 格式的颜色字符串
 */
export function rgbAlpha(colorVal: string, alpha: number): string {
  try {
    return color(colorVal).alpha(alpha).rgb().string();
  } catch (error) {
    console.error(`Invalid color value: ${colorVal}`, error);
    return colorVal; // 出错时返回原值
  }
}

/**
 * [核心转换器]
 * 递归地将一个扁平的、包含颜色字符串的对象
 * (e.g., { primary: '#FFF', nested: { secondary: '#000' } })
 * 转换为符合我们 { value, channel } 契约的形状
 * (e.g., { primary: { value: '#FFF', channel: '255 255 255' }, ... })
 *
 * @param obj 扁平的颜色令牌对象 (e.g., lightColorTokens)
 * @returns 符合契约的嵌套对象
 */
export function addColorChannels<T extends object>(
  obj: T,
): AddChannelToLeaf<T> {
  // 创建一个新的结果对象,以避免修改原始的 tokens
  const result: Record<string, unknown> = {};

  // 遍历传入对象的所有键
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      // 叶子节点:这应该是一个颜色字符串
      // 使用 color 库解析
      const colorValue = color(value);
      // 转换为契约形状
      result[key] = {
        value: value,
        channel: colorValue.rgb().array().join(" "),
      };
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      // 嵌套对象:递归调用自身
      result[key] = addColorChannels(value as object);
    } else {
      // 其他类型 (null, array, number...),按原样保留
      // 在我们的颜色 token 中不应出现,但这使函数更安全
      result[key] = value;
    }
  }

  return result as AddChannelToLeaf<T>;
}
