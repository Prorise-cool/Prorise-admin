import color from "color";
import type { themeTokens } from "@/theme/type"; // 引入类型蓝图

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
 * 为契约骨架添加 channel 结构（用于 createThemeContract）
 * 将 null 转换为 { value: null, channel: null }
 */
export const addChannelStructure = <T>(obj: T): T => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof value === "object" && value !== null) {
      result[key] = addChannelStructure(value);
    } else if (value === null) {
      // 为 null 创建 { value: null, channel: null } 结构
      result[key] = { value: null, channel: null };
    } else {
      result[key] = value;
    }
  }
  return result as T;
};

/**
 * 为颜色值添加 RGB 通道（用于实际值）
 * 将 "#FF0000" 转换为 { value: "#FF0000", channel: "255 0 0" }
 * 将 "rgba(255, 0, 0, 0.5)" 转换为 { value: "rgba(255, 0, 0, 0.5)", channel: "255 0 0" }
 */
export const addColorChannels = <T>(obj: T): T => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    if (typeof value === "object" && value !== null) {
      result[key] = addColorChannels(value);
    } else if (typeof value === "string") {
      // 尝试解析任何颜色格式（#hex, rgb, rgba, hsl 等）
      try {
        const rgb = color(value).rgb().array().join(" ");
        result[key] = { value, channel: rgb };
      } catch {
        // 如果无法解析为颜色，直接使用原值
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }
  return result as T;
};

// 导出类型，用于外部引用
type ThemeTokens = typeof themeTokens;
type ColorTokens = ThemeTokens["colors"];
export type ColorTokensWithChannel = {
  [Category in keyof ColorTokens]: {
    [Token in keyof ColorTokens[Category]]: ColorTokens[Category][Token] & {
      channel: string;
    };
  };
};
