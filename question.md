
# 第五章. 主题核心：Design Tokens 与 Vanilla Extract

{% note default %}
在第四章，我们成功搭建了 Ant Design + Tailwind CSS 的混合样式基础。然而，一个真正健 robuste, 可维护的主题系统，还需要一个中心化的、类型安全的“设计语言”来驱动它们。本章，我们将引入 **Vanilla Extract**，一个革命性的 **CSS-in-TS** 解决方案。它将成为我们定义 **Design Tokens**（设计规范）和生成原生 **CSS 变量** 的核心引擎。我们将在这里奠定 `Prorise-Admin` 独特视觉风格和高度可定制性的基石。
{% endnote %}

## 5.1. 引入 Vanilla Extract：类型安全的样式基石

我们已经有了 Ant Design (组件库) 和 Tailwind CSS (原子化工具)。为什么还需要引入第三种样式技术 Vanilla Extract？

### 5.1.1. 决策：为何 Vanilla Extract 是主题系统的“必需品”？

{% chat 架构师的思考, theme = blue %}
me: Antd 提供了主题定制，Tailwind 也能通过 @theme 定义变量。
me: 我们的工具箱是不是已经满了？为什么还需要 Vanilla Extract？

expert: 这是一个非常好的问题。
expert: 答案在于，Antd 和 Tailwind 的主题配置，本质上还是“配置式”的。
expert: 它们缺乏我们构建一个真正工业级主题系统所必需的两个核心特性：**编译时类型安全** 和 **零运行时**。

me: 可以具体解释一下“类型安全”吗？

expert: 当然。在 tailwind.config.ts 里，你可以把 `colors.primary` 设为一个无效的颜色值，或者把 `fontSize.lg` 设成一个颜色字符串。
expert: 这些错误只能在浏览器里看到效果时才被发现。
expert: 而 Vanilla Extract 允许我们完全使用 **TypeScript** 来定义我们的设计规范。
expert: 如果你给一个期望是 `px` 或 `rem` 的变量赋了一个颜色值，TypeScript 会在 **你保存文件的那一刻** 就报错。
expert: 这种编译时的保障，对于大型项目和团队协作来说至关重要。

me: 那么“零运行时”呢？

expert: 这是 Vanilla Extract 的核心优势。
expert: 像 Styled Components 或 Emotion 这类传统的 CSS-in-JS 库，需要在浏览器运行时执行 JavaScript 来解析样式、生成类名。这会带来额外的性能开销。
expert: Vanilla Extract 则是在 **构建时 (build time)**，就将你的 `.css.ts` 文件直接编译成了 **静态的 `.css` 文件**。
expert: 最终交付给浏览器的，只有最优化的原生 CSS，没有任何额外的 JS 运行时负担。

me: 我明白了。所以，VE 不是用来替代 Antd 或 Tailwind 写具体样式的，而是用来构建整个主题系统的“地基”和“规范”？

expert: 完全正确！在 Prrorise-Admin 的架构中，它们三者的分工非常清晰：

expert: **Vanilla Extract**: 作为“设计语言的编译器”。
expert: 它负责读取用 TypeScript 写的 Design Tokens，并将它们编译成全局可用的、类型安全的 CSS 变量。它是我们“唯一事实来源”的实现者。

expert: **Ant Design**: 作为“主题的消费者”。
expert: 它通过一个适配器，读取这些 CSS 变量或 Tokens，实现自身组件的主题化。

expert: **Tailwind CSS**: 同样作为“主题的消费者”。
expert: 它通过配置文件，读取这些 CSS 变量或 Tokens，生成与我们设计系统完全一致的原子类。

expert: 它们三者协同工作，构成了一个强大、类型安全且高性能的主题生态系统。
{% endchat %}

### 5.1.2. 安装 Vanilla Extract 相关依赖

现在，我们来安装 Vanilla Extract 的核心库和 Vite 插件。由于这些包只在开发和构建阶段使用，我们将它们安装为开发依赖 (`-D`)。

打开终端，执行以下命令：
```bash
pnpm add -D @vanilla-extract/css @vanilla-extract/vite-plugin
```
**依赖解析**:
*   `@vanilla-extract/css`: 这是 Vanilla Extract 的核心包，提供了所有用于在 TypeScript 中定义样式、主题和 CSS 变量的 API（例如 `style`, `createTheme`, `createThemeContract`, `globalStyle` 等）。
*   `@vanilla-extract/vite-plugin`: 这是官方提供的 Vite 插件。它的职责是在 Vite 的构建流程中，自动查找、解析并编译所有 `.css.ts` 文件，将其中定义的样式提取为最终的静态 CSS 文件。

### 5.1.3. 配置 Vite 插件

安装插件后，我们必须在 `vite.config.ts` 文件中“注册”它，Vite 才能知道如何处理这些特殊的 `.css.ts` 文件。

**文件路径**: `vite.config.ts` (修改)

```typescript
import tailwindcss from "@tailwindcss/vite";
import { vanillaExtractPlugin } from "@vanilla-extract/vite-plugin";
import react from "@vitejs/plugin-react";
import AutoImport from "unplugin-auto-import/vite";
import antdResolver from "unplugin-auto-import-antd";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    tailwindcss(),
    vanillaExtractPlugin(),
    AutoImport({
      // 目标文件类型
      include: [
        /\.[tj]sx?$/, // .ts, .tsx, .js, .jsx
      ],
      // 自动导入的预设包
      imports: ["react"],
      // 使用 antdResolver（注意是小写）
      resolvers: [antdResolver()],
      // 自动生成 'auto-imports.d.ts' 类型声明文件
      dts: "./auto-imports.d.ts",
      // 解决 ESLint/BiomeJS 报错问题
      eslintrc: {
        enabled: true,
      },
    }),
  ],
});

```
**关键配置点**:
*   **插件顺序**：在大多数情况下，`vanillaExtractPlugin` 应该放在框架插件（如 `react()`）的后面。这是因为 Vanilla Extract 的 `.css.ts` 文件本身是 TypeScript 代码，如果其中包含 JSX (例如使用了 `sprinkles` 等高级 API)，可能需要先由 `react()` 插件处理。
*   **无需额外配置**：对于我们的标准设置，`vanillaExtractPlugin()` 不需要任何额外的参数。它会自动查找并处理项目中的所有 `.css.ts` 文件。

### 5.1.4. “Hello World”：创建并验证第一个 `.css.ts` 文件

完成配置后，我们不能只停留在概念上。让我们创建一个最简单的 `theme.css.ts` 文件来亲眼见证 Vanilla Extract 的工作流程。

**第一步：创建 `theme.css.ts`**

我们在 `src/theme/` 目录下创建这个文件。它将是我们主题系统的核心入口。
**文件路径**: `src/theme/theme.css.ts`

```typescript
import { globalStyle } from '@vanilla-extract/css';

// 使用 globalStyle API 来定义一个全局样式
// 这是一个简单的测试，证明 VE 正在工作
globalStyle('body', {
  backgroundColor: 'lightcoral',
});
```

**第二步：在应用入口导入**

为了让 Vite 能够发现并编译这个文件，我们需要在应用的入口处导入它。
**文件路径**: `src/main.tsx`
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import MyApp from '@/MyApp';
import '@/index.css';
import { ConfigProvider, App as AntdApp } from 'antd';
import '@/theme/theme.css'; // <-- 导入我们的 VE 样式文件

// ... antd 配置 ...
```

**第三步：验证效果**

重启你的开发服务器（`pnpm dev`）。现在，打开浏览器，你会发现整个页面的背景色变成了刺眼的 `lightcoral` (浅珊瑚色)。

**这证明了**:
1.  Vite 成功加载了 `@vanilla-extract/vite-plugin`。
2.  插件成功找到了 `src/theme/theme.css.ts` 文件。
3.  插件成功将 `globalStyle` API 调用编译成了真实的 CSS `body { background-color: lightcoral; }`。
4.  Vite 将编译后的 CSS 注入到了我们的应用中。

验证成功后，你可以 **删除或注释掉** `theme.css.ts` 中的测试代码，为下一节的正式内容做准备。

{% note success simple %}
**阶段性成果**：我们成功将 Vanilla Extract 集成到了 `Prorise-Admin` 的构建流程中。我们深刻理解了它在主题架构中扮演的“类型安全基石”和“零运行时 CSS 变量引擎”的关键角色，并通过一个简单的“Hello World”实例，亲眼见证了其工作流程。我们已为下一节深入定义 Design Tokens 做好了万全准备。
{% endnote %}

---
## 5.2. 定义 Design Tokens

在 `5.1` 节中，我们成功集成了 Vanilla Extract，为使用 TypeScript 定义样式奠定了基础。现在，我们将进入主题系统的核心腹地：在 `src/theme/tokens/` 目录下，**定义我们项目的设计规范**，即 **Design Tokens**。

### 5.2.1. 理念：什么是 Design Tokens？

Design Tokens 是构成我们产品界面视觉风格的所有 **原子化、可命名的设计决策**。它们是设计系统中的“最小单元”，例如：

*   一个特定的蓝色：`#2065D1` (可能命名为 `colorPrimary`)
*   一个标准的内边距：`16px` (可能命名为 `spacing4`)
*   一种常用的字体：`'Inter', sans-serif` (可能命名为 `fontFamilySans`)

**核心价值**：将这些原子化的设计决策 **中心化管理**，并赋予它们 **语义化的名称**，可以带来巨大的好处：

1.  **一致性**：确保整个应用（甚至跨平台）的视觉风格高度统一。修改一个 Token，所有使用它的地方都会自动更新。
2.  **可维护性**：设计师和开发者使用同一套“设计语言”进行沟通和协作，极大降低了维护成本。
3.  **可扩展性**：基于 Tokens，可以轻松构建多主题（如亮/暗模式、多品牌色）或支持白标 (Whitelabeling)。
4.  **自动化**：Tokens 可以被工具（如 Vanilla Extract）读取，自动生成 CSS 变量、样式代码，甚至设计文档。

**`src/theme/tokens/` 目录将是我们 `Prorise-Admin` 所有 Design Tokens 的“唯一事实来源 (Single Source of Truth)”。**

### 5.2.2. 工具先行：创建颜色处理函数

在定义颜色之前，我们先来创建两个非常重要的工具函数，它们将极大地增强我们颜色系统的灵活性。

**第一步：安装 `color` 库**

我们需要一个强大的库来解析和操作颜色。
```bash
pnpm add color @types/color
```

**第二步：创建 `src/utils/theme.ts`**
```typescript
import color from 'color';

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
```
这个 `rgbAlpha` 函数让我们可以在 TypeScript 中就为一个颜色值（如 `#919EAB`）附加透明度，这对于定义交互状态的颜色（如 `hover`, `disabled`）非常有用。

{% note info %}
**注意**: 在后续章节中，我们还会为 `utils/theme.ts` 添加更多工具函数（如 `addChannelStructure` 和 `addColorChannels`）。现在先创建这个基础函数即可。
{% endnote %}

### 5.2.3. 构建调色盘：`color.ts`

颜色是主题系统中最重要的部分。我们将创建一个 `color.ts` 文件来系统化地定义我们的颜色规范。

**第一步：创建 `color.ts` 并定义基础色**
**文件路径**: `src/theme/tokens/color.ts`

```typescript
// 定义最基础的黑白色
export const commonColors = {
  white: "#FFFFFF",
  black: "#09090B", // 使用略微柔和的黑色，而非纯 #000000
};

// 定义一套中性的灰色梯度，用于背景、边框、文本等
export const grayColors = {
  "100": "#F9FAFB", "200": "#F4F6F8", "300": "#DFE3E8", "400": "#C4CDD5",
  "500": "#919EAB", "600": "#637381", "700": "#454F5B", "800": "#1C252E", "900": "#141A21",
};
```

**第二步：定义语义化调色板**
我们不直接在代码中使用 `#00A76F`，而是定义具有“语义”的颜色名称，如 `primary`, `success` 等。

**文件路径**: `src/theme/tokens/color.ts` (追加)
```typescript
/**
 * 我们推荐使用 [Eva Color Design](https://colors.eva.design/) 来快速选取这些值，遵守如下的数值即可：
 *  + lighter : 100
 *  + light : 300
 *  + main : 500
 *  + dark : 700
 *  + darker : 900
 */
export const paletteColors = {
  primary: {
    lighter: "#D6E4FF",
    light: "#84A9FF",
    default: "#3366FF",
    dark: "#1939B7",
    darker: "#091A7A",
  },
  success: {
    lighter: "#D8FBDE",
    light: "#86E8AB",
    default: "#36B37E",
    dark: "#1B806A",
    darker: "#0A5554",
  },
  warning: {
    lighter: "#FFF5CC",
    light: "#FFD666",
    default: "#FFAB00",
    dark: "#B76E00",
    darker: "#7A4100",
  },
  error: {
    lighter: "#FFE9D5",
    light: "#FFAC82",
    default: "#FF5630",
    dark: "#B71D18",
    darker: "#7A0916",
  },
  info: {
    lighter: "#CAFDF5",
    light: "#61F3F3",
    default: "#00B8D9",
    dark: "#006C9C",
    darker: "#003768",
  },
  gray: grayColors,
};
```

**第三步：定义交互状态颜色**
这里，我们开始使用之前创建的 `rgbAlpha` 工具函数。
**文件路径**: `src/theme/tokens/color.ts` (追加)
```typescript
import { rgbAlpha } from '@/utils/theme';
// ... (其他颜色定义)

// 定义组件在不同交互状态下的颜色 (灰色的不同透明度)
export const actionColors = {
  hover: rgbAlpha(grayColors[500], 0.08),    // 悬停状态背景
  selected: rgbAlpha(grayColors[500], 0.16), // 选中状态背景
  focus: rgbAlpha(grayColors[500], 0.24),    // 聚焦状态光晕
  disabled: rgbAlpha(grayColors[500], 0.24), // 禁用状态文本/图标颜色
  active: rgbAlpha(grayColors[500], 0.24),   // 激活状态
};
```

**第四步：组合亮/暗模式的颜色令牌**
这是实现主题切换的关键。我们基于上面定义的各种颜色，组合出亮色和暗色模式下最终使用的语义颜色令牌。

**文件路径**: `src/theme/tokens/color.ts` (追加)
```typescript
// 定义亮色模式下的最终颜色 Token 集合
export const lightColorTokens = {
  palette: paletteColors,
  common: commonColors,
  action: actionColors,
  text: {
    primary: grayColors[800],
    secondary: grayColors[600],
    disabled: grayColors[400],
  },
  background: {
    default: grayColors[100],
    paper: commonColors.white,
    neutral: grayColors[200],
  },
};

// 定义暗色模式下的最终颜色 Token 集合
export const darkColorTokens = {
  palette: paletteColors,
  common: commonColors,
  action: actionColors,
  text: {
    primary: commonColors.white,
    secondary: grayColors[500],
    disabled: grayColors[600],
  },
  background: {
    default: grayColors[900],
    paper: grayColors[800],
    neutral: rgbAlpha(grayColors[500], 0.12),
  },
};
```

### 5.2.4. 揭秘 `Channel`：解锁 CSS 动态透明度

现在，我们来引入一个更高级的工具函数 `addColorChannels`，它将极大地增强我们颜色系统的灵活性。

{% chat 深度解析：`addColorChannels` 的必要性, theme = blue %}
me: 为什么我们需要费力地生成像 `primaryChannel: "0 167 111"` 这样的字符串？

expert: 这完全是为了 **在 CSS 中动态计算带透明度的颜色**。

expert: CSS 的 `rgba()` 函数有一个现代语法：`rgba( <rgb channels> / <alpha> )`。
expert: 例如，`rgba(0 167 111 / 0.5)` 就代表半透明的绿色。

me: 这和我们之前的 `rgbAlpha` 函数有什么不同？

expert: `rgbAlpha` 是在 **TypeScript (构建时)** 计算的，它只能生成一个 **固定** 的透明度颜色。
expert: 而 `Channel` 机制，是让我们可以在 **浏览器运行时**，用 **原生 CSS** 动态应用 **任意** 透明度。

me: 怎么做到呢？

expert: Vanilla Extract 会将我们的 Tokens 编译成 CSS 变量。
expert: 比如 `--color-primary: #00A76F;` 和 `--color-primary-channel: 0 167 111;`。
expert: 这样，当我们需要一个半透明的主色背景时，就可以在 CSS (或 VE 的 style 函数) 中这样写：
expert: `background-color: rgba(var(--color-primary-channel) / 0.5);`

me: 我明白了！`addColorChannels` 就是为了生成那个 CSS 变量中的 `var(--color-primary-channel)` 部分！

expert: 完全正确！它让我们摆脱了在 TS 中预定义各种透明度颜色的束缚。
{% endchat %}

**实现颜色通道工具函数**

实际上，我们需要 **两个** 不同的函数来分别处理"契约骨架"和"实际颜色值"。这是确保类型安全的关键。

**文件路径**: `src/utils/theme.ts` (追加)
```typescript
import color from 'color';
import type { themeTokens } from '@/theme/type'; // 引入类型蓝图

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
```

{% note warning %}
**为什么需要两个函数？**

1. **`addChannelStructure`**: 专门用于处理 `createThemeContract` 的骨架（所有值都是 `null`）。它将每个 `null` 转换为 `{ value: null, channel: null }` 的结构。

2. **`addColorChannels`**: 专门用于处理实际的颜色值（如 `"#FF0000"` 或 `"rgba(...)"`）。它解析颜色字符串并提取 RGB 通道。

这种分离确保了类型安全，避免了运行时错误，并且不需要使用 `as any` 进行类型断言。
{% endnote %}
---
### 5.2.5. 填充其他 Tokens 文件

我们已经完成了最复杂的 `color.ts`。现在，我们按照同样的模式，创建并填充其他 Tokens 文件。这些文件相对简单，主要是定义数值、字符串等，这个没有基准，可以基于我们提供的模板以及 UI 设计稿到规范来填

**文件路径**: `src/theme/tokens/base.ts`

```typescript
import { breakpointsTokens } from "./breakpoints";

// 基础主题 Token - 定义间距、圆角、断点、透明度、层级等通用设计变量
export const baseThemeTokens = {
  // 间距系统 - 用于 margin、padding 等
  spacing: {
    0: "0px",
    1: "4px",
    2: "8px",
    3: "12px",
    4: "16px",
    5: "20px",
    6: "24px",
    7: "28px",
    8: "32px",
    10: "40px",
    12: "48px",
    16: "64px",
    20: "80px",
    24: "96px",
    32: "128px",
  },
  // 圆角系统 - 用于 border-radius
  borderRadius: {
    none: "0px",
    sm: "2px",
    default: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    full: "9999px",
  },
  // 响应式断点 - 用于媒体查询
  screens: breakpointsTokens,
  // 透明度系统 - 用于 opacity 和颜色透明度
  opacity: {
    0: "0%",
    5: "5%",
    10: "10%",
    20: "20%",
    25: "25%",
    30: "30%",
    35: "35%",
    40: "40%",
    45: "45%",
    50: "50%",
    55: "55%",
    60: "60%",
    65: "65%",
    70: "70%",
    75: "75%",
    80: "80%",
    85: "85%",
    90: "90%",
    95: "95%",
    100: "100%",
    border: "20%",
    hover: "8%",
    selected: "16%",
    focus: "24%",
    disabled: "80%",
    disabledBackground: "24%",
  },
  // 层级系统 - 定义各组件的 z-index
  zIndex: {
    appBar: "10",
    nav: "20",
    drawer: "50",
    modal: "50",
    snackbar: "50",
    tooltip: "50",
    scrollbar: "100",
  },
};
```

**文件路径**: `src/theme/tokens/breakpoints.ts`

```typescript
// 定义响应式断点，键名通常遵循 Tailwind 规范
export const breakpointsTokens = {
  xs: "375px",  // 移动端优先，默认断点
  sm: "576px",  // 小型设备
  md: "768px",  // 平板
  lg: "1024px", // 笔记本
  xl: "1280px", // 常规桌面
  "2xl": "1536px", // 大型桌面
};
```

**文件路径**: `src/theme/tokens/typography.ts`

```typescript
// 预设字体族，方便切换
export const FontFamilyPreset = {
  openSans: "'Open Sans Variable', sans-serif", // 引入 Google Fonts 或本地字体
  inter: "'Inter Variable', sans-serif",
};

// 定义排版相关的规范
export const typographyTokens = {
  fontFamily: {
    openSans: FontFamilyPreset.openSans,
    inter: FontFamilyPreset.inter,
  },
  // 注意：fontSize 值不带单位，方便后续计算和 antd 配置
  fontSize: { xs: "12", sm: "14", default: "16", lg: "18", xl: "20" },
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: { none: "1", tight: "1.25", normal: "1.375", relaxed: "1.5" },
};
```

**文件路径**: `src/theme/tokens/shadow.ts`

```typescript
import Color from "color";
import { commonColors, paletteColors } from "./color";

// 亮色主题阴影 Token
export const lightShadowTokens = {
  none: "none",
  // 基础阴影梯度 (从小到大)
  sm: `0 1px 2px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 轻微阴影
  default: `0 4px 8px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 默认阴影
  md: `0 8px 16px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 中等阴影
  lg: `0 12px 24px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 较大阴影
  xl: `0 16px 32px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 超大阴影
  "2xl": `0 20px 40px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 超超大阴影
  "3xl": `0 24px 48px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 最大阴影
  inner: `inset 0 2px 4px 0 ${Color(paletteColors.gray[500]).alpha(0.16)}`, // 内阴影

  // 特定组件阴影
  dialog: `-40px 40px 80px -8px ${Color(commonColors.black).alpha(0.24)}`, // 对话框阴影
  card: `0 0 2px 0 ${Color(paletteColors.gray[500]).alpha(0.2)}, 0 12px 24px -4px ${Color(paletteColors.gray[500]).alpha(0.12)}`, // 卡片阴影
  dropdown: `0 0 2px 0 ${Color(paletteColors.gray[500]).alpha(0.24)}, -20px 20px 40px -4px ${Color(paletteColors.gray[500]).alpha(0.24)}`, // 下拉菜单阴影

  // 语义化阴影 (带品牌色调)
  primary: `0 8px 16px 0 ${Color(paletteColors.primary.default).alpha(0.24)}`, // 主色调阴影
  info: `0 8px 16px 0 ${Color(paletteColors.info.default).alpha(0.24)}`, // 信息色阴影
  success: `0 8px 16px 0 ${Color(paletteColors.success.default).alpha(0.24)}`, // 成功色阴影
  warning: `0 8px 16px 0 ${Color(paletteColors.warning.default).alpha(0.24)}`, // 警告色阴影
  error: `0 8px 16px 0 ${Color(paletteColors.error.default).alpha(0.24)}`, // 错误色阴影
};

// 暗色主题阴影 Token
export const darkShadowTokens = {
  none: "none",
  // 基础阴影梯度 (从小到大)
  sm: `0 1px 2px 0 ${Color(commonColors.black).alpha(0.16)}`, // 轻微阴影
  default: `0 4px 8px 0 ${Color(commonColors.black).alpha(0.16)}`, // 默认阴影
  md: `0 8px 16px 0 ${Color(commonColors.black).alpha(0.16)}`, // 中等阴影
  lg: `0 12px 24px 0 ${Color(commonColors.black).alpha(0.16)}`, // 较大阴影
  xl: `0 16px 32px 0 ${Color(commonColors.black).alpha(0.16)}`, // 超大阴影
  "2xl": `0 20px 40px 0 ${Color(commonColors.black).alpha(0.16)}`, // 超超大阴影
  "3xl": `0 24px 48px 0 ${Color(commonColors.black).alpha(0.16)}`, // 最大阴影
  inner: `inset 0 2px 4px 0 ${Color(commonColors.black).alpha(0.16)}`, // 内阴影

  // 特定组件阴影
  dialog: `-40px 40px 80px -8px ${Color(commonColors.black).alpha(0.24)}`, // 对话框阴影
  card: `0 0 2px 0 ${Color(commonColors.black).alpha(0.2)}, 0 12px 24px -4px ${Color(commonColors.black).alpha(0.12)}`, // 卡片阴影
  dropdown: `0 0 2px 0 ${Color(commonColors.black).alpha(0.24)}, -20px 20px 40px -4px ${Color(commonColors.black).alpha(0.24)}`, // 下拉菜单阴影

  // 语义化阴影 (带品牌色调)
  primary: `0 8px 16px 0 ${Color(paletteColors.primary.default).alpha(0.24)}`, // 主色调阴影
  info: `0 8px 16px 0 ${Color(paletteColors.info.default).alpha(0.24)}`, // 信息色阴影
  success: `0 8px 16px 0 ${Color(paletteColors.success.default).alpha(0.24)}`, // 成功色阴影
  warning: `0 8px 16px 0 ${Color(paletteColors.warning.default).alpha(0.24)}`, // 警告色阴影
  error: `0 8px 16px 0 ${Color(paletteColors.error.default).alpha(0.24)}`, // 错误色阴影
};

```

> **注意**：`shadow.ts` 引入了 `color` 库来动态计算带透明度的阴影颜色。我们需要安装它：`pnpm add color @types/color`。

{% note success simple %}
**阶段性成果**：我们成功地在 `src/theme/tokens/` 目录下，使用 TypeScript 定义了 `Prorise-Admin` 的核心 Design Tokens，涵盖了颜色（支持亮/暗模式和颜色通道）、间距、圆角、断点、排版和阴影。这些 Tokens 不仅是类型安全的，而且结构清晰、语义明确，构成了我们主题系统的“唯一事实来源”。
{% endnote %}

-----
## 5.3. 生成 CSS 变量：Vanilla Extract 的魔法

我们已经在 `5.2` 节精心定义了 `Prorise-Admin` 的 Design Tokens (`color.ts`, `base.ts` 等)，它们是项目视觉风格的“唯一事实来源”。但这些 TypeScript 对象本身并不能被浏览器直接理解。

本节的核心任务，就是利用 Vanilla Extract 的强大 API，将这些 **静态的 TS 定义** 转化为 **动态的、可在浏览器中使用的 CSS 自定义属性（CSS 变量）**。我们将聚焦于 `src/theme/theme.css.ts` 文件，一步步揭示其工作原理。

### 5.3.1. 前置准备：定义主题相关的枚举

在开始生成 CSS 变量之前，我们需要先定义一些全局的、可复用的常量，特别是用于区分不同主题状态的“枚举”。这将极大地提升我们代码的可读性和类型安全。

我们将专门创建一个文件来存放这些枚举。

**第一步：创建 `src/theme/types/enum.ts`**
```bash
# 在 src/theme 目录下创建 types 文件夹
mkdir src/theme/types
touch src/theme/types/enum.ts
```
**第二步：定义核心枚举**
**文件路径**: `src/theme/types/enum.ts`
```typescript
/**
 * 定义主题模式的枚举
 * 'light' 和 'dark' 将作为 data-theme-mode 属性的值
 */
export enum ThemeMode {
  Light = "light",
  Dark = "dark",
}

/**
 * 定义预设主题色的枚举
 * 'default', 'cyan' 等将作为 data-color-palette 属性的值
 */
export enum ThemeColorPresets {
  Default = "default",
  Cyan = "cyan",
  Purple = "purple",
  Blue = "blue",
  Orange = "orange",
  Red = "red",
}

/**
 * 定义将要附加到 HTML 根元素上的 data 属性名称的常量
 * 这样做可以避免在代码中硬编码字符串，减少拼写错误
 */
export enum HtmlDataAttribute {
  ColorPalette = "data-color-palette",
  ThemeMode = "data-theme-mode",
}
```
现在，我们的项目中有了类型安全的、可复用的主题状态常量。

### 5.3.2. 定义“主题契约” (`createThemeContract`)

在直接赋予 CSS 变量具体值之前，Vanilla Extract 推荐我们先定义一个 **“主题契约 (Theme Contract)”**。

“契约”就像一个 TypeScript 的 `interface`，它只定义了变量的 **“形状”或“名称结构”**，而不关心它们的具体值。这带来了 **解耦**、**类型安全** 和 **一致性** 三大好处。

**API 语法深度解析: `createThemeContract`**

```typescript
createThemeContract(contract: Object): ThemeContract;
```
*   **`contract` (参数)**:
    *   **类型**: `Object`
    *   **作用**: 这是一个描述你的主题“形状”的 JavaScript 对象。对象的 `key` 将被用作生成 CSS 变量名称的一部分，而 `value` 通常是 `null` 或一个字符串占位符。**这个对象的结构，就是你未来所有主题必须遵守的结构**。
*   **返回值**:
    *   **类型**: `ThemeContract` (这是一个与输入对象结构完全相同，但所有叶子节点的值都变成了 CSS 变量引用字符串的对象
    *   例如：`var(--colors-palette-primary-default__1k2j3h)`)
    *   **作用**: 这个返回的对象是类型安全的，你可以在代码中直接引用它的属性（如 `themeVars.colors.primary.default`），Vanilla Extract 会确保你引用的是一个有效的、唯一的 CSS 变量。

**文件路径**: `src/theme/theme.css.ts` (开始编写)
```typescript
import { createThemeContract } from "@vanilla-extract/css";
// 导入我们创建的颜色通道工具函数
import { addChannelStructure } from "@/utils/theme";
// 导入我们在 type.ts 中定义的 Tokens 骨架
import { themeTokens } from "./type";

// 使用 createThemeContract 创建主题契约
// 传入 themeTokens 骨架，并确保颜色部分包含 Channel 变量
export const themeVars = createThemeContract({
  ...themeTokens, // 包含 typography, spacing, shadows 等所有骨架

  // 特别处理 colors，为每个颜色值添加 { value, channel } 结构
  // 注意：这里使用 addChannelStructure 而不是 addColorChannels
  // 因为契约中的值都是 null，需要特殊处理
  colors: addChannelStructure(themeTokens.colors),
});
```

{% note success %}
**类型安全提升**: 通过使用泛型函数 `addChannelStructure<T>`，TypeScript 能够自动推断返回类型，我们不再需要使用 `as ColorTokensWithChannel` 或 `as any` 进行类型断言。这让代码更加类型安全且易于维护。
{% endnote %}

### 5.3.3. 实现亮/暗模式 (`createGlobalTheme`)

我们已经有了契约 (`themeVars`)。现在，我们需要为契约中的每个变量赋予具体的值，并且要能根据亮色和暗色模式提供不同的值。

**API 语法深度解析: `createGlobalTheme`**

```typescript
createGlobalTheme(selector: string, contract: ThemeContract, tokens: Object): void;
```
*   **`selector` (参数 1)**:
    *   **类型**: `string`
    *   **作用**: 一个标准的 CSS 选择器。Vanilla Extract 将在这个选择器下生成所有的 CSS 变量。例如，`':root'` 或 `'.light-theme'`。
*   **`contract` (参数 2)**:
    *   **类型**: `ThemeContract`
    *   **作用**: 我们在上一步通过 `createThemeContract` 创建的 **主题契约对象** (`themeVars`)。`createGlobalTheme` 会遍历这个契约，以确定要生成哪些 CSS 变量。
*   **`tokens` (参数 3)**:
    *   **类型**: `Object`
    *   **作用**: 一个包含了 **具体设计令牌值** 的对象。这个对象的结构 **必须** 与 `contract` 参数的结构完全匹配。函数会从这个对象中查找每个变量对应的具体值。

**代码实现**

**第一步：准备数据获取函数**

我们需要一个辅助函数，来动态地提供 `createGlobalTheme` 所需的第三个参数 `tokens`。
**文件路径**: `src/theme/theme.css.ts` (追加)

```typescript
import { createGlobalTheme } from '@vanilla-extract/css';
// 导入颜色通道工具函数（注意：这里使用 addColorChannels 而非 addChannelStructure）
import { addColorChannels } from '@/utils/theme';
// 导入我们 tokens/ 目录下的具体值
import { baseThemeTokens } from './tokens/base';
import { darkColorTokens, lightColorTokens } from './tokens/color';
import { darkShadowTokens, lightShadowTokens } from './tokens/shadow';
import { typographyTokens } from './tokens/typography';
// 导入我们刚刚创建的枚举
import { ThemeMode, HtmlDataAttribute } from './types/enum';

/**
 * @description 根据亮/暗模式，获取一个包含了所有具体设计令牌值的完整对象
 * @param mode - 主题模式 ('light' 或 'dark')
 * @returns 一个与 themeVars 契约结构完全匹配，但填充了具体值的对象
 */
const getThemeTokens = (mode: ThemeMode) => {
  // 步骤 1: 根据传入的 mode，选择对应的颜色和阴影令牌集
  const colorModeTokens = mode === ThemeMode.Light ? lightColorTokens : darkColorTokens;
  const shadowModeTokens = mode === ThemeMode.Light ? lightShadowTokens : darkShadowTokens;

  // 步骤 2: 组合所有令牌到一个对象中
  // 这个对象的结构必须与我们之前定义的 themeVars 契约完全一致
  return {
    // 尤其重要的是，对颜色令牌集调用 addColorChannels
    // 这样返回的对象中才包含了我们需要的 'channel' 属性
    colors: addColorChannels(colorModeTokens),
    typography: typographyTokens,
    shadows: shadowModeTokens,
    ...baseThemeTokens, // 使用展开运算符合并 spacing, borderRadius, screens 等
  };
};
```

{% note info %}
**关键区别**: 
- 在 `createThemeContract` 中使用 `addChannelStructure`（处理 null 值）
- 在 `getThemeTokens` 中使用 `addColorChannels`（处理实际颜色值）
{% endnote %}

**第二步：使用 `createGlobalTheme` 生成亮/暗模式变量**
**文件路径**: `src/theme/theme.css.ts` (追加)
```typescript
for (const themeMode of Object.values(ThemeMode)) {
  createGlobalTheme(
    `:root[${HtmlDataAttribute.ThemeMode}=${themeMode}]`,
    themeVars,
    getThemeTokens(themeMode),
  );
}
```

{% note success %}
**类型安全**: 得益于我们使用泛型函数的设计，这里不再需要 `as any` 类型断言。TypeScript 能够正确推断类型，确保编译时的类型安全。
{% endnote %}

### 5.3.4. 实现动态主题色

我们的主题系统现在可以切换亮/暗模式了。最后一步，是实现允许用户切换应用的主要“品牌色”（例如，从默认的绿色切换到蓝色、紫色等）。

我们希望高效地实现这一点。当用户选择“蓝色”时，我们不希望重新定义全部 200 多个 CSS 变量，而只想精准地 **覆盖** 掉少数几个与 `primary` 颜色相关的变量。

**前置准备：定义预设主题色**

要实现此功能，我们首先需要在代码中定义好每一套预设主题色的具体颜色值。这是上一版中缺失的关键代码。我们需要回到 `color.ts` 文件来补充它。

**文件路径**: `src/theme/tokens/color.ts` (补充 `presetsColors` 并更新 `paletteColors`)

{% note warning %}
**重要**: `presetsColors` 应该定义在 `paletteColors` **之前**，因为 `paletteColors` 需要引用它。
{% endnote %}

```typescript
import { rgbAlpha } from '@/utils/theme';
import { ThemeColorPresets } from '../types/enum'; // 注意路径：../types/enum

// 1. 首先，定义所有预设主题色的梯度色板
export const presetsColors = {
  [ThemeColorPresets.Default]: {
    lighter: "#C8FAD6",
    light: "#5BE49B",
    default: "#00A76F",
    dark: "#007867",
    darker: "#004B50",
  },
  [ThemeColorPresets.Cyan]: {
    lighter: "#CCF4FE",
    light: "#68CDF9",
    default: "#078DEE",
    dark: "#0351AB",
    darker: "#012972",
  },
  [ThemeColorPresets.Purple]: {
    lighter: "#E8DAFF",
    light: "#B18AFF",
    default: "#7635dc",
    dark: "#49199c",
    darker: "#290966",
  },
  [ThemeColorPresets.Blue]: {
    lighter: "#D1E9FC",
    light: "#76B0F1",
    default: "#2065D1",
    dark: "#103996",
    darker: "#061B64",
  },
  [ThemeColorPresets.Orange]: {
    lighter: "#FEF4D4",
    light: "#FED680",
    default: "#fda92d",
    dark: "#b66800",
    darker: "#793900",
  },
  [ThemeColorPresets.Red]: {
    lighter: "#FFE4DE",
    light: "#FF8676",
    default: "#FF5630",
    dark: "#B71D18",
    darker: "#7A0916",
  },
};

// 2. 然后，更新 paletteColors 的定义，使其 primary 字段引用我们刚刚创建的预设
export const paletteColors = {
  primary: presetsColors[ThemeColorPresets.Default], // 默认使用 Default (绿色) 预设
  success: {
    lighter: "#D8FBDE",
    light: "#86E8AB",
    default: "#36B37E",
    dark: "#1B806A",
    darker: "#0A5554",
  },
  // ... 其他语义化颜色保持不变
  gray: grayColors,
};

// ... color.ts 中其余的代码 (commonColors, actionColors 等) 保持不变
```
现在，我们的代码库中有了切换主题所需的所有颜色数据。

***

**API 语法深度解析: `globalStyle` 与 `assignVars`**

为了实现精准的变量 **覆盖**，我们需要组合使用两个新的 API。

**API 语法: `globalStyle`**

```typescript
globalStyle(selector: string, styleRule: StyleRule): void;
```

- **`selector` (参数 1)**:

**类型**: `string`
**作用**: 一个标准的 CSS 选择器。`globalStyle` 会为这个选择器创建一个 CSS 规则块。例如：`':root[data-color-palette="cyan"]'`。

- **`styleRule` (参数 2)**:

**类型**: `StyleRule` (一个样式规则对象)
**作用**: 描述这个规则块内的 CSS。它可以包含标准的 CSS 属性，如 `{ color: 'red' }`。但对我们而言，它有一个 **特殊的、由 Vanilla Extract 提供的属性**：
**`vars`**: 这个 `vars` 属性专门用于 **覆盖** 由 `createGlobalTheme` 创建的 CSS 变量。它的值必须由 `assignVars` 辅助函数来生成。

**API 语法: `assignVars`**

```typescript
assignVars(contract: ThemeContract | ThemeVars, tokens: Tokens): { vars: { [key: string]: string } };
```

- **`contract` (参数 1)**:

**类型**: `ThemeContract` 或 `ThemeVars` (通常是 **契约的一个子集**)
**作用**: 指定你想要覆盖的 **变量范围**。这是此 API 最强大的地方。我们将传入 `themeVars.colors.palette.primary`，精准地告诉它我们 **只** 想修改主品牌色相关的变量。

- **`tokens` (参数 2)**:

**类型**: `Object` (一个包含新值的对象)
**作用**: 提供新的变量值。这个对象的结构 **必须** 与传入的 `contract` 子集的结构完全匹配。

- **返回值**:

**类型**: `{ vars: { [cssVarName: string]: string } }`
**作用**: `assignVars` 不直接应用样式。它是一个类型安全的辅助函数，其唯一的职责就是返回一个格式完美的对象，该对象可以被直接赋值给 `globalStyle` 的 `vars` 属性。

**总结**：`assignVars` 负责 **生成** 类型安全的覆盖指令，而 `globalStyle` 负责将这些指令 **应用** 到指定的 CSS 选择器上。

**代码实现**

现在，我们可以胸有成竹地编写实现动态主题色的代码了。

**文件路径**: `src/theme/theme.css.ts` (追加)

```typescript
import { globalStyle, assignVars } from '@vanilla-extract/css';
// 导入我们刚刚补充的预设颜色值和枚举
import { presetsColors } from './tokens/color';
import { HtmlDataAttribute, ThemeColorPresets } from "./types/enum";

// --- 实现动态主题色切换 ---

// 循环处理我们定义的所有预设颜色 (Default, Cyan, Purple...)
for (const preset of Object.values(ThemeColorPresets)) {
  // 1. 定义目标选择器。例如，当 preset 为 'Cyan' 时，
  //    选择器变为 ':root[data-color-palette="cyan"]'
  const selector = `:root[${HtmlDataAttribute.ColorPalette}='${preset}']`;

  // 2. 获取当前循环到的预设颜色所对应的具体色值对象
  //    例如 { lighter: "#CCF4FE", light: "#68CDF9", ... }
  const presetColorValues = presetsColors[preset];

  // 3. 使用 globalStyle 为该选择器创建一个 CSS 规则块
  globalStyle(selector, {
    // 4. 在规则块内部，使用 assignVars 来生成变量覆盖语句
    vars: assignVars(
      // 参数 1: 要覆盖的契约范围。我们精准地只覆盖主色相关的变量。
      themeVars.colors.palette.primary,

      // 参数 2: 提供的新值。
      // 我们传入新的色值对象，并确保它的颜色通道也被计算。
      addColorChannels(presetColorValues),
    ),
  });
}
```

{% note success %}
**完全类型安全**: 整个实现过程中，我们没有使用任何 `as any` 类型断言。这得益于：
1. 使用泛型函数 `addChannelStructure<T>` 和 `addColorChannels<T>`
2. 正确区分契约定义和值填充的处理方式
3. 支持所有颜色格式（#hex, rgb, rgba, hsl 等）

这种设计让代码更加健壮、可维护，并且能在编译时捕获类型错误。
{% endnote %}

### 5.3.5. 验证最终系统

现在，`src/theme/theme.css.ts` 文件已经完整且正确。是时候验证它的编译结果了。

**第一步：重启开发服务器**
确保你的 Vite 开发服务器正在运行 (`pnpm dev`)。由于我们修改了 `.css.ts` 文件，Vite 的热更新 (HMR) 会自动重新编译它。

**第二步：检查浏览器开发者工具**
打开浏览器，访问你的应用页面，然后打开开发者工具（按 `F12`）。

1.  **切换到“Elements” (或“元素”) 面板。**
2.  **选中 `<html>` 根元素。**
3.  **在右侧的“Styles” (或“样式”) 面板中，向下滚动，找到以 `--` 开头的 CSS 变量定义。**

你应该能看到类似以下的景象：

**检查要点**：

  * **变量名称**：确认看到了大量由 Vanilla Extract 自动生成的、带有唯一 Hash 后缀的 CSS 变量名 (如 `--colors-text-primary__b4c5d6`)。
  * **亮/暗模式作用域**：确认这些变量被正确地包裹在 `:root[data-theme-mode="light"]` (或 `dark`) 的选择器下。你可以手动在 `<html>` 元素上添加 `data-theme-mode="dark"` 属性，观察变量值是否会切换。
  * **主题色作用域（可选）**：如果你手动在 `<html>` 元素上添加 `data-color-palette="cyan"` 属性，你应该能观察到 `--colors-palette-primary-...` 相关变量的值被 cyan 颜色的覆盖规则所改变。
  * **变量值**：确认变量的值与我们在 `tokens/` 目录下定义的具体值一致。

如果以上都符合预期，那么恭喜你！Vanilla Extract 已经成功将我们的 TypeScript Design Tokens 编译成了浏览器可用的、支持亮/暗模式和动态主题色的 CSS 变量系统。

{% note success simple %}
**阶段性成果**：我们完成了 `Prorise-Admin` 主题系统的核心引擎构建。通过深入学习 Vanilla Extract 的 `createThemeContract`, `createGlobalTheme`, `globalStyle`, `assignVars` 等核心 API，我们成功地将 TypeScript 中定义的 Design Tokens 编译为了**类型安全、结构化、支持多主题**的原生 CSS 变量。我们还重点掌握了 `addColorChannels` 工具函数在实现动态透明度颜色中的关键作用。主题系统的“地基”已经牢固。
{% endnote %}

