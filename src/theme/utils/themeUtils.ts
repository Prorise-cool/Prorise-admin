import color from "color";
import type { AddChannelToLeaf } from "../type";
import { themeTokens } from "../type";

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

/**
 * 从字符串值中移除 'px' 单位并转换为数字。
 * @param value 示例: "16px", "16.5px", "-16px", "16", 16
 * @returns 示例: 16, 16.5, -16, 16, 16
 * @throws 如果值无效，则抛出错误
 */
export const removePx = (value: string | number): number => {
  if (typeof value === "number") return value;
  if (!value) throw new Error("Invalid value: empty string");
  const trimmed = value.trim();
  // 使用正则表达式测试 'px' 是否在末尾（不区分大小写）
  const hasPx = /px$/i.test(trimmed);
  // 如果有 'px'，则截取掉最后两个字符；否则直接使用
  const num = hasPx ? trimmed.slice(0, -2) : trimmed;
  // 转换为浮点数
  const result = Number.parseFloat(num);
  // 校验转换结果是否是一个有效数字
  if (Number.isNaN(result)) {
    throw new Error(`Invalid value: ${value}`);
  }

  return result;
};

/**
 * 获取指定路径下 Tokens 的所有变体名 (叶子节点的 key)
 * @param propertyPath e.g., "spacing" or "colors.palette.primary"
 */

export const getThemeTokenVariants = (propertyPath: string): string[] => {
  const keys = propertyPath.split(".");
  let current: Record<string, unknown> = themeTokens;
  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = current[key] as Record<string, unknown>;
    } else {
      console.warn(`[getThemeTokenVariants] Path not found: ${propertyPath}`);
      return []; // 路径无效，返回空数组
    }
  }

  // 确认最终找到的是一个叶子节点对象
  if (current && typeof current === "object") {
    const values = Object.values(current);

    // 检查 1: 是否为标准叶子 (e.g., spacing) - 所有值都是 null
    const isStandardLeaf = values.every((v) => v === null);

    // 检查 2: 是否为颜色叶子 (e.g., colors.palette.primary)
    // - 所有值都是 { value: null, channel: null }
    const isColorLeaf = values.every(
      (v) => v && typeof v === "object" && "value" in v && v.value === null,
    );

    // 只要满足任一条件，就返回 keys
    if (isStandardLeaf || isColorLeaf) {
      return Object.keys(current);
    }
  }

  console.warn(
    `[getThemeTokenVariants] Path does not point to a leaf object: ${propertyPath}`,
  );
  return [];
};

/**
 * 将 Tokens 路径转换为 CSS 变量名
 */
export const toCssVar = (propertyPath: string) => {
  return `--${propertyPath.split(".").join("-")}`;
};

/**
 * 为 Tailwind theme 配置生成 CSS 变量引用
 * @example createTailwinConfg('spacing')
 * // returns { '0': 'var(--spacing-0)', '1': 'var(--spacing-1)' }
 */
export const createTailwinConfg = (propertyPath: string) => {
  const variants = getThemeTokenVariants(propertyPath);
  return variants.reduce(
    (acc, variant) => {
      // Vanilla Extract 会直接使用 key 作为变量名 (e.g., --spacing-0)
      acc[variant] = `var(${toCssVar(`${propertyPath}.${variant}`)})`;
      return acc;
    },
    {} as Record<string, string>,
  );
};

/**
 * 为颜色生成 rgb(var(...-channel)) 引用，以支持透明度
 * @example createColorChannel('colors.palette.primary')
 * // returns { DEFAULT: 'rgb(var(--colors-palette-primary-default-channel))', ... }
 */
export const createColorChannel = (propertyPath: string) => {
  // 1. 感谢健壮的 getThemeTokenVariants，这里能正确获取到 ['lighter', 'light', ...]
  const variants = getThemeTokenVariants(propertyPath);

  return variants.reduce(
    (acc, variant) => {
      const variantKey = variant === "default" ? "DEFAULT" : variant; // Tailwind 的特殊约定

      // 2. 生成基础变量名, e.g., --colors-palette-primary-default
      const cssVar = toCssVar(`${propertyPath}.${variant}`);

      // 3. [关键] 拼接 '-channel' 后缀，
      //    这对应了 { value: null, channel: null } 契约的 'channel' 键
      acc[variantKey] = `rgb(var(${cssVar}-channel))`;
      return acc;
    },
    {} as Record<string, string>,
  );
};
