# 第七章. CDD 环境：搭建 Storybook 与主题集成

组件是现代前端应用的基石。在本章中，我们将搭建 **组件驱动开发 (Component-Driven Development, CDD)** 的核心环境——**Storybook 8**。我们将从零开始，在 Vite (React + TS) 项目中集成它。

我们将直面并解决三大集成“痛点”：

1.  **构建痛点**：如何让 Storybook 的 Vite 实例识别我们的 `tsconfig.json` 路径别名（如 `@/*`）？
2.  **样式痛点**：如何让 Storybook 正确加载 Tailwind CSS v4 的配置（`@config`）和变体（`@variant`）？
3.  **主题痛点**：**(本章核心)** 如何将我们在第六章构建的、由 `ThemeProvider` 驱动的动态主题系统（CSS 变量、亮/暗模式、多色板）完美地注入 Storybook，确保所有组件在隔离环境中获得与主应用 **完全一致** 的视觉表现？

## 7.1. 引入 Storybook 8

### 7.1.1. 理念：组件驱动开发 (CDD) 的价值

在开始安装之前，我们必须先统一思想：**为什么需要 Storybook？**

传统的“自上而下”开发模式（先做页面，再拼组件）在大型项目中会变得难以维护。而 **组件驱动开发 (CDD)** 是一种“自下而上”的构建策略，它将 **组件** 视为开发的一等公民。

**CDD 的核心思想**：我们应该在 **隔离的环境** 中独立开发和测试每一个组件，然后再将它们组装成页面。

**Storybook** 正是实现 CDD 的业界标准工具。它为我们提供了一个独立于主应用的“工作台”和“组件目录”。

{% chat 架构师的思考, theme = blue %}
developer: 为什么我们不直接在 `MyApp.tsx` 里开发和测试组件呢？

architect: 在主应用里开发，意味着你必须启动整个应用。你可能需要处理路由、等待 API 返回、甚至需要先登录才能看到你的组件。

developer: 这确实很麻烦。

architect: Storybook 解决了这个问题。它提供了一个 **隔离沙箱**。在这个沙箱里，你的组件就是主角。你可以模拟它的所有状态（`loading`, `disabled`, `error`），而无需关心应用的其它任何部分。

developer: 这听起来像是... 单元测试？

architect: 它是 **可视化测试** 和 **交互式文档** 的结合体。你为组件定义的每一种状态（称为一个 "Story"），都会成为一个 **可交互的、活生生的文档**。

developer: 我明白了。设计师、产品经理和新来的同事，都可以通过这个“组件目录”快速了解我们的 UI 资产库。

architect: 完全正确。它强制我们构建 **高内聚、低耦合** 的组件，是提升团队协作效率和项目长期健壮性的关键。
{% endchat %}

### 7.1.2. 安装与初始化 Storybook for Vite (React + TS)

Storybook 8 提供了强大的 `init` 命令，可以自动检测我们的项目技术栈（Vite, React, TypeScript）并完成基础配置。

**第一步：执行初始化命令**

在您的项目根目录 (`Prorise-Admin` 目录下) 运行：

```bash
pnpm dlx storybook@latest init
```

**第二步：CLI 交互**

Storybook 会自动开始分析您的项目。它非常智能，会检测到您正在使用 `react-vite`。

`npx` 会自动安装所有必需的依赖项（`@storybook/react-vite`, `@storybook/addon-essentials`, `@storybook/addon-themes` 等），并在您的项目根目录创建两个新内容：

  * `.storybook/` 目录：存放 Storybook 的核心配置文件。
  * `src/stories/` 目录：存放示例组件和 "stories"。

### 7.1.3. 核心配置文件解析：.storybook/main.ts 与 preview.ts

`init` 命令为我们生成了两个核心配置文件。理解它们的职责至关重要。

#### 1\. `.storybook/main.ts` (主板)

`main.ts` 负责管理 Storybook 的 **核心配置、插件（Addons）和构建设置**。你可以把它想象成 Storybook 的“主板”或“Vite 配置文件”。

**文件路径**: `.storybook/main.ts` (生成的内容)

```typescript
import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  // 1. [关键] 告诉 Storybook 在哪里寻找 "stories" 文件
  // 这是一个 glob 模式，匹配 src/ 目录下所有 .stories.tsx 或 .mdx 文件
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  // 2. [关键] 注册所有插件 (Addons)
  // Addons 提供了 Storybook 的所有额外功能，如工具栏、A11y 检查等
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest"
  ],

  // 3. [关键] 声明框架和构建器
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  }
};
export default config;
```

#### 2\. `.storybook/preview.ts` (画布)

`preview.ts` 负责管理所有 Stories **如何被渲染**。你可以把它想象成一个包裹所有组件的全局“画布”或“`index.html`”。

**文件路径**: `.storybook/preview.ts` (生成的内容)

```typescript
import type { Preview } from '@storybook/react-vite'

/**
 * Storybook 预览配置
 * 
 * 此文件配置 Storybook 中所有故事的全局设置。
 * 它定义了故事的渲染方式以及 UI 中可用的工具。
 */
const preview: Preview = {
  /**
   * 应用于所有故事的全局参数
   */
  parameters: {
    /**
     * 控件配置
     * 定义 Storybook 如何自动为组件属性生成控件
     */
    controls: {
      /**
       * 匹配器定义哪些属性应该被视为特定的控件类型
       * 基于使用正则表达式模式的属性名称
       */
      matchers: {
        // 匹配此模式的属性将使用颜色选择器控件
        color: /(background|color)$/i,
        // 匹配此模式的属性将使用日期选择器控件
        date: /Date$/i,
      },
    },

    /**
     * 无障碍 (a11y) 插件配置
     * 使用 axe-core 对故事运行自动化无障碍测试
     */
    a11y: {
      /**
       * 测试模式决定如何处理 a11y 违规:
       * - 'todo': 在 UI 中显示违规但不使测试失败(开发模式)
       * - 'error': 发现违规时使 CI/CD 管道失败(严格模式)
       * - 'off': 完全禁用 a11y 检查
       */
      test: 'todo'
    }
  },
};

export default preview;
```





**第三步：启动并验证**

万事俱备，让我们启动 Storybook：

```bash
pnpm storybook
```

浏览器将自动打开 `http://localhost:6006/`。你现在应该能看到 Storybook 的欢迎界面和 `src/stories` 中的示例组件（如 Button, Header, Page）。

**请注意：**
你很可能会发现示例组件的样式是 **混乱** 的（比如按钮没有 Tailwind 样式），并且浏览器的开发者 **控制台充满了错误**，提示 `@/*` 路径无法解析。

**这是完全正常和预期的！**

因为 Storybook 启动了它自己的 Vite 实例，这个实例目前还不知道：

1.  我们项目的 `tsconfig.json` 中定义的 `@/*` 路径别名。
2.  我们项目的 `src/index.css` 中配置的 Tailwind v4。

在接下来的 `7.2` 节中，我们将逐一解决这些“集成痛点”。


-----
## 7.2. 解决核心集成痛点

在 `7.1` 节的末尾，我们成功启动了 Storybook。但我们也立刻发现了两个严重的问题：

1.  **控制台报错**：Vite 构建失败，提示它无法解析 `@/*` 这样的路径。
2.  **样式丢失**：`src/stories` 中的示例 `Button` 组件没有任何 Tailwind 样式，显示为浏览器默认按钮。

这是因为 Storybook 运行在 **它自己的、隔离的 Vite 实例** 中，这个实例默认 **并不知道** 我们主项目 `vite.config.ts` 和 `tsconfig.json` 中的配置。

本节，我们将逐一修复这些集成痛点。

### 7.2.1. 痛点一：适配 Vite 路径别名 (`@/*`)

#### 1\. 问题的根源

当 Storybook 的 Vite 实例遇到 `import { Foo } from '@/components/Foo'` 这样的语句时，它并不知道 `@` 指向 `src`。这个映射关系定义在 `tsconfig.json` 的 `paths` 字段中，Storybook 的 Vite 实例默认不会读取它。

#### 2\. 解决方案：`vite-tsconfig-paths`

我们需要一个 Vite 插件，它能自动读取 `tsconfig.json` 中的 `paths` 并将其转换为 Vite 的 `resolve.alias` 配置。`vite-tsconfig-paths` 正是为此而生。

**第一步：安装插件**
我们将这个插件添加为 **开发依赖**：

```bash
pnpm add -D vite-tsconfig-paths
```

#### 3\. 配置 Storybook 的 Vite 实例 (`main.ts`)

Storybook 在 `.storybook/main.ts` 中提供了一个名为 `viteFinal` 的钩子。这个函数允许我们“侵入” Storybook 内部的 Vite 配置，并对其进行修改。

**文件路径**: `.storybook/main.ts` (修改)

```typescript
import type { StorybookConfig } from "@storybook/react-vite";
// 1. 导入 Vite 的 mergeConfig 和我们要用的插件
import { mergeConfig } from "vite";
import viteTsconfigPaths from "vite-tsconfig-paths";

const config: StorybookConfig = {
	stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
	addons: [
		"@chromatic-com/storybook",
		"@storybook/addon-docs", // 用于文档生成
		"@storybook/addon-onboarding", // 用于引导用户
		"@storybook/addon-a11y", // 用于无障碍测试
		"@storybook/addon-vitest",
	],
	framework: {
		name: "@storybook/react-vite",
		options: {},
	},
	// 3. [新增] 添加 viteFinal 钩子
	async viteFinal(config) {
		// 4. 使用 mergeConfig 合并我们的自定义配置
		return mergeConfig(config, {
			// 5. 添加 tsconfig-paths 插件
			//    它会自动读取 tsconfig.json 中的 paths
			plugins: [viteTsconfigPaths()],
		});
	},
};
export default config;
```

**代码深度解析**：

  * `viteFinal` 是一个 `async` 函数，它接收 Storybook 默认的 Vite 配置 (`config`)。
  * 我们使用 Vite 官方的 `mergeConfig` 工具来安全地合并配置。
  * `plugins: [viteTsconfigPaths()]` 指示 Storybook 的 Vite 实例在启动时运行 `vite-tsconfig-paths` 插件，从而动态地将 `@/*` 解析为 `./src/*`。

-----

### 7.2.2. 痛点二：让 Tailwind CSS v4 生效

此时，如果你重新启动 Storybook (`pnpm storybook`)，你会发现 **控制台的 `@/*` 错误消失了**。

**但是，按钮的样式依然没有加载。**

#### 1\. 问题的根源

路径别名问题解决了，但 Storybook 的“画布”（`preview.ts`）它 **没有加载** 我们包含所有 Tailwind 指令（`@import`, `@config`, `@variant`）的 **全局 CSS 文件** `src/index.css`。

#### 2\. 解决方案：在 `preview.ts` 中全局导入 CSS

`preview.ts` 的作用就是配置“画布”。我们只需在 `preview.ts` 的最顶层 `import` 我们的主 CSS 文件，Storybook 就会在加载所有 "stories" 之前，确保这些样式被注入。

**文件路径**: `.storybook/preview.ts` (修改)

```typescript
// 1. [新增] 全局导入主 CSS 文件
// 这会触发 Vite 的 CSS 处理, 加载 Tailwind、PostCSS
// 并应用我们在 index.css 中定义的 @config 和 @variant
import "../src/theme/theme.css";
import "../src/index.css";
```

**代码深度解析**：

  * `import '../src/index.css';` 这一行代码是激活 Tailwind 的关键。
  * 当 Storybook 的 Vite 实例（已由 `@storybook/react-vite` 预配置好 PostCSS）处理这个导入时，它会：
    1.  读取 `src/index.css`。
    2.  执行 `@import "tailwindcss";`。
    3.  执行 `@config "../tailwind.config.ts";`，加载我们的 Tailwind 配置（得益于 `7.2.1`，配置中的 `@/` 路径也能被正确解析）。
    4.  执行 `@variant dark (...)`，定义暗黑模式。
    5.  最终将所有处理过的 CSS 注入到 Storybook 的 `iframe` 画布中。

**文件路径**: `src/stories/Button.tsx` (修改)

我们可以简单的写上一点 Tailwind 样式，然后再把顶部引入的 Button.css 给删除掉

```tsx
    <button
      type="button"
      className={['storybook-button', `storybook-button--${size}`, mode, 'bg-primary text-white p-2 rounded-md hover:bg-primary/90 active:bg-primary/78'].join(' ')}
      style={{ backgroundColor }}
      {...props}
    >
      {label}
    </button>
```

-----

### 7.2.3. 重新启动并验证

现在，**彻底停止** (Ctrl+C) 此前正在运行的 Storybook 进程，然后重新启动：

```bash
pnpm storybook
```

再次访问 `http://localhost:6006/` 并查看 `src/stories` 中的 `Button` 示例。

**你将会看到：**

1.  控制台 **没有任何 `@/*` 路径解析错误**。
2.  示例的 `Button` 组件 **已经拥有了 Tailwind 的基础样式**（不再是浏览器默认按钮）。
    **即将到来的“新问题”：**

你可能注意到了，按钮的 **颜色是错的**（他完全没有显示颜色，而不是我们在第五章定义的绿色 `primary`），并且 **亮/暗模式切换也不起作用**。

这是 **完全预期** 的！

我们 `7.2` 节的任务只是 **打通了构建管线**（路径别名和 Tailwind 加载）。

我们尚未解决 **主题痛点**：Storybook 环境中 **没有** 我们的 `ThemeProvider`，因此所有 `var(--colors-...)` CSS 变量都是 **未定义** 的，Tailwind 只能回退到它的默认调色板。

在 `7.3` 节中，我们将彻底解决这个问题。

-----

## 7.3. 核心：集成动态主题系统

在 `7.2` 节，我们成功解决了 Storybook 的构建痛点，路径别名得以解析，Tailwind CSS 也被正确加载。然而，我们立刻遇到了一个新的、更深层次的问题：所有依赖我们 Design Tokens 的样式（颜色、阴影、圆角等）**依然是错误的**，并且亮/暗模式切换 **完全不起作用**。

### 7.3.1. 探究根源：主题系统在隔离环境中的“失联”

要理解这个现象，我们需要回顾第六章建立的动态主题系统的工作机制：

1.  **状态源 (`settingStore`)**：存储当前的主题偏好（例如 `themeMode: 'dark'`）。
2.  **驱动器 (`ThemeProvider`)**：订阅状态，并将状态实时地写入 `<html>` 元素的 `data-*` 属性（例如 `data-theme-mode="dark"`）和 `style` 属性。
3.  **样式定义 (CSS 变量)**：由 `data-*` 属性激活，为 `--colors-...` 等变量赋予正确的值。
4.  **样式消费 (Tailwind & Antd)**：Tailwind 类（`text-primary`）和 Ant Design 组件（通过 `AntdAdapter`）引用这些激活后的 CSS 变量。

问题的症结在于 **第二步**。Storybook 将每个 "Story" 渲染在一个隔离的 `iframe` 中。默认情况下，这个 `iframe` 的环境中 **并不包含** 我们应用程序根部的 `ThemeProvider` 组件。

**直接后果就是**：

  * 没有 `ThemeProvider` 来写入 `data-*` 属性，导致我们在第五章定义的 CSS 变量 **从未被激活**。
  * 当 Tailwind 或 Ant Design 尝试引用 `var(--colors-...)` 时，这些变量都是未定义的。
  * 浏览器无法解析无效的 CSS 变量引用，导致所有依赖主题的样式回退到浏览器默认值或 Tailwind 的基础调色板。
  * 亮/暗模式和主题色切换自然也无法工作，因为驱动它们的 `data-*` 属性从未被设置。

因此，我们的核心任务是：找到一种机制，将我们的 `ThemeProvider` **注入** 到 Storybook 的渲染流程中，使其能够包裹并驱动每一个 Story 组件。

### 7.3.2. 解决方案：运用 Storybook Decorators

幸运的是，Storybook 提供了一个专门为此设计的、非常强大的特性：**Decorators (装饰器)**。

Decorators 的核心概念非常直观：它们是在 `.storybook/preview.ts` 中定义的 **全局包装器组件**。

当 Storybook 准备渲染任何一个 "Story" 时（比如 `Button` 组件的某个变体），它会按照 `preview.ts` 中 `decorators` 数组定义的顺序，用这些装饰器组件 **从内到外** 地包裹住这个 Story，形成一个嵌套结构，然后才将最终结果渲染到 `iframe` 中。

例如，如果我们定义一个装饰器 `(Story) => <MyWrapper><Story /></MyWrapper>`，那么 Storybook 实际渲染的就是 `<MyWrapper><YourStoryComponent /></MyWrapper>`。

这正是我们所需要的机制。我们可以创建一个 Decorator，它的唯一职责就是渲染我们的 `ThemeProvider`，并将 Story 组件作为其 `children` 传递进去。

### 7.3.3. 编码实现：构建 `withTheme` 装饰器

我们将创建一个名为 `withTheme` 的 React 函数组件，它将充当我们的全局主题装饰器。

**第一步：创建装饰器文件**

作为主题系统的一部分，我们将这个装饰器放在 `src/theme/` 目录下，与 `ThemeProvider` 等其他主题相关文件保持在一起，这样更符合项目的模块化组织原则。

**文件路径**: `src/theme/withTheme.tsx`

```tsx
// 3. 导入 Storybook 官方提供的 Decorator 类型定义
import type { Decorator } from "@storybook/react-vite";
// 2. 导入 AntdAdapter (ThemeProvider 依赖它来适配 Ant Design)
import { AntdAdapter } from "./adapter/antd.adapter";
// 1. 导入我们在第六章创建的 ThemeProvider
import { ThemeProvider } from "./theme-provider";

/**
 * Storybook Decorator: 用于全局包裹所有 Stories
 *
 * 核心职责:
 * 1. 渲染应用级的 ThemeProvider。
 * 2. 传入 AntdAdapter，确保 Ant Design 组件也能接收主题。
 * 3. 渲染由 Storybook 传入的实际 Story 组件 (<Story />)。
 */
export const withTheme: Decorator = (Story) => {
	return (
		// 使用我们在第六章构建的 ThemeProvider 进行包裹
		// 并传入 AntdAdapter 以确保 Ant Design 组件的主题同步
		<ThemeProvider adapters={[AntdAdapter]}>
			{/* 渲染实际的 Story 组件 */}
			<Story />
		</ThemeProvider>
	);
};
```

**代码深度解析**：

  * `Decorator` 类型来自于 `@storybook/react-vite`，它帮助我们确保 `withTheme` 函数的签名符合 Storybook 的要求。
  * `Story` 参数是 Storybook 运行时注入的，它是一个代表了当前要渲染 Story（例如 `Button` 组件的 `Primary` 状态）的函数组件。
  * 我们直接调用 `<Story />`，并将它置于 `<ThemeProvider adapters={[AntdAdapter]}>` 的内部。这确保了无论渲染哪个 Story，它都会被我们的主题系统所包裹。
  * 由于文件位于 `src/` 目录内，得益于我们的 `tsconfig.json` 配置（`"jsx": "react-jsx"`），这里不需要显式导入 React 即可使用 JSX 语法。

### 7.3.4. 全局应用：注册 `withTheme` 装饰器

最后一步，我们需要在 Storybook 的全局"画布"配置文件 `.storybook/preview.ts` 中，告诉 Storybook 使用我们刚刚创建的 `withTheme` 装饰器。

**文件路径**: `.storybook/preview.ts` (修改 `decorators` 数组)

```typescript
import '../src/index.css'; // 保持 CSS 导入
import type { Preview } from "@storybook/react";
// 1. 导入我们创建的 withTheme 装饰器
import { withTheme } from '../src/theme/withTheme';

const preview: Preview = {
  // 2. [关键] 将 withTheme 添加到 decorators 数组中
  // Storybook 会按照数组顺序应用装饰器（如果有多个）
  decorators: [
    withTheme,
    // 如果未来有其他全局装饰器（例如路由模拟器），可以继续添加
  ],
};

export default preview;
```

-----

### 7.3.5. 最终验证

现在，**彻底停止** (Ctrl+C) Storybook 进程，然后 **重新启动**：

```bash
pnpm storybook
```

再次访问 `http://localhost:6006/` 并查看 `src/stories` 中的 `Button` 示例。

**这一次，效果应该完全不同了：**

1.  **颜色正确！** 示例 `Button` (如果是 primary 类型) 现在应该显示我们在第五章定义的 **绿色**（对应 `colors.palette.primary.default`）。
2.  **Tailwind 主题色生效！** 如果你在 Story 中使用了 `text-primary` 或 `bg-primary`，它们现在也会显示正确的绿色。
3.  **Ant Design 主题色也生效！** 如果 Story 中有 Antd 的 `Button type="primary"`，它的颜色也应该是绿色，并且与 Tailwind 的 `primary` **完全一致**。
4.  **检查 `iframe` 的 `<html>` 元素**：在浏览器的开发者工具中，切换到 Storybook 的 `iframe`，检查其 `<html>` 元素。你会发现它已经被添加了 `data-theme-mode="light"` 和 `data-color-palette="default"` 属性，并且 `style` 属性中包含了正确的 `font-size`！

{% note success simple %}
**阶段性成果**：我们成功地将 `Prorise-Admin` 的 **核心动态主题系统** 注入到了 Storybook 的隔离环境中。通过创建一个简单的 `withTheme` **装饰器 (Decorator)**，并将其注册到 `.storybook/preview.ts`，我们确保了每一个 Story 都被 `ThemeProvider` 和 `AntdAdapter` 正确包裹。现在，所有组件在 Storybook 中的视觉表现将与它们在主应用中 **完全一致**。CDD 环境的核心基石已经奠定。
{% endnote %}


-----

## 7.4. 增强：添加主题切换插件

`7.3` 节成功地将我们的 `ThemeProvider` 注入了 Storybook，使得组件能够以 **默认主题**（通常是亮色、默认颜色预设）正确渲染。

然而，我们构建的是一个 **动态** 主题系统。开发者需要在 Storybook 环境中方便地 **切换** 亮/暗模式和不同的颜色预设，以确保组件在所有主题下的表现都符合预期。目前，Storybook 还没有提供这样的交互能力。
我们的目标是：在 Storybook 的工具栏（Toolbar）中添加控件（如下拉菜单或按钮），允许用户 **实时切换** 亮/暗模式和主题颜色预设，并立即看到组件视觉效果的变化。

### 7.4.1. 识别机制：利用 `@storybook/addon-themes`

Storybook 通过 Addon 机制来扩展其功能。

```bash
pnpm add -D @storybook/addon-themes
```

我们可以在 `.storybook/main.ts` 文件中确认 `addon-themes` 是否已被注册：

**文件路径**: `.storybook/main.ts` (检查 `addons` 数组)

```typescript
// ... imports ...

const config: StorybookConfig = {
  // ... stories, framework, docs, viteFinal ...
  addons: [
    // ... other addons like essentials, interactions, a11y ...
    '@storybook/addon-themes', // <--- 确认此行存在
  ],
};
export default config;
```

`@storybook/addon-themes` 的核心作用是提供 UI 控件，并根据用户的选择，**修改渲染环境**（通常是 `iframe` 的 `<html>` 元素）的 `class` 或 `data-*` 属性。

这与我们在第六章设计的 `ThemeProvider` 机制 **完美契合**！我们的 CSS 变量正是由 `<html>` 元素上的 `data-theme-mode` 和 `data-color-palette` 属性激活的。

因此，我们只需要 **配置** `@storybook/addon-themes`，告诉它：

1.  有哪些主题可供选择（例如 "Light", "Dark"）。
2.  当用户选择某个主题时，应该在哪（`<html>`）设置哪个属性（`data-theme-mode`）为什么值（`'light'` 或 `'dark'`）。

### 7.4.2. 配置 Addon 驱动 `data-*` 属性 (`preview.tsx`)

`@storybook/addon-themes` 的最新版本提供了 `withThemeByDataAttribute` 装饰器，专门用于通过 `data-*` 属性控制主题。这比旧版本的配置方式更简单、更直接。

我们将分别为 "亮/暗模式切换" 和 "颜色预设切换" 添加配置。

**文件路径**: `.storybook/preview.tsx` (修改)

```typescript
import type { Preview } from "@storybook/react-vite";
import "../src/index.css";
import "../src/theme/theme.css";
import { withThemeByDataAttribute } from "@storybook/addon-themes";
import {
	HtmlDataAttribute,
	ThemeColorPresets,
	ThemeMode,
} from "../src/theme/types/enum";

const preview: Preview = {
  // ...前面内容保持不变
	decorators: [
		// // 亮/暗模式切换 - 通过 data-theme-mode 属性控制
    // 由于插件顶栏不适配两种模式的切换，一般我们要测试亮暗色就取消这个注释即可
		// withThemeByDataAttribute({
		// 	themes: {
		// 		light: ThemeMode.Light,
		// 		dark: ThemeMode.Dark,
		// 	},
		// 	defaultTheme: ThemeMode.Light,
		// 	attributeName: HtmlDataAttribute.ThemeMode,
		// }),
		// 颜色预设切换 - 通过 data-color-palette 属性控制
		withThemeByDataAttribute({
			themes: {
				default: ThemeColorPresets.Default,
				cyan: ThemeColorPresets.Cyan,
				purple: ThemeColorPresets.Purple,
				blue: ThemeColorPresets.Blue,
				orange: ThemeColorPresets.Orange,
				red: ThemeColorPresets.Red,
			},
			defaultTheme: ThemeColorPresets.Default,
			attributeName: HtmlDataAttribute.ColorPalette,
		}),
		// 保留原有的 ThemeProvider 装饰器
		withTheme,
	],
};

export default preview;

```

### 7.4.3. 验证主题切换功能

现在，**重新启动** Storybook：

```bash
pnpm storybook
```

**观察 Storybook 界面**：

![image-20251025172457300](https://prorise-blog.oss-cn-guangzhou.aliyuncs.com/cover/image-20251025172457300.png)

**✨ 成功！我们使用最新的 `@storybook/addon-themes` API，实现了完整的主题切换功能！**



## 7.5. 本章小结 & 代码入库

在本章中，我们为 `Prorise-Admin` 成功搭建了 **组件驱动开发 (CDD)** 的核心基础设施——**Storybook 9**。这不仅仅是一次简单的安装，我们深入解决了将其无缝集成到我们现有技术栈中的关键挑战。

**回顾本章，我们取得了以下核心进展：**

1.  **奠定 CDD 基石 (`7.1`)**：

      * 我们理解了 CDD 的核心价值，并选择了 Storybook 作为实现这一理念的工具。
      * 我们使用 `pnpm dlx storybook@latest init` 命令成功初始化了 Storybook 环境，适配了 Vite + React + TS 技术栈，并了解了核心配置文件 (`main.ts`, `preview.ts`) 的作用。

2.  **打通构建管线 (`7.2`)**：

      * 我们直面了 Storybook 独立 Vite 实例带来的集成痛点。
      * 通过引入 `vite-tsconfig-paths` 插件并在 `main.ts` 中配置 `viteFinal` 钩子，我们成功解决了 **Vite 路径别名 (`@/*`)** 的解析问题。
      * 通过在 `preview.ts` 中全局导入 `src/index.css`，我们确保了 **Tailwind CSS v4** 的配置（`@config`）和变体（`@variant dark`）能够被正确加载和应用。

3.  **注入动态主题 (`7.3`)**：

      * 这是本章的 **核心突破**。我们识别到 Storybook 隔离环境缺少 `ThemeProvider` 导致样式失效的问题。
      * 我们运用 Storybook 的 **Decorators** 机制，创建了 `withTheme` 装饰器，巧妙地将我们的 `ThemeProvider` (及其依赖的 `AntdAdapter`) 注入到每一个 Story 的渲染流程中。
      * 这确保了所有组件在 Storybook 中都能获得与主应用 **完全一致** 的默认主题视觉表现。

4.  **激活主题切换 (`7.4`)**：

      * 我们利用 `@storybook/addon-themes` 插件，在 `preview.ts` 中进行了配置。
      * 通过将插件的目标指向 `<html>` 元素的 `data-theme-mode` 属性，我们成功地在 Storybook 工具栏中添加了 **亮/暗模式** 的切换控件，实现了主题的动态响应。

至此，`Prorise-Admin` 的 Storybook 环境已经 **基本就绪**。它不仅能够正确构建和渲染我们的组件，更重要的是，它 **完全集成了我们复杂的动态主题系统**，为后续高质量、可独立开发的 UI 组件（`src/ui`, `src/components`）打下了坚实的基础。

-----

**代码入库：CDD 环境就绪**

我们已经完成了一个重要的基础设施搭建。现在，是时候将我们的 Storybook 环境配置安全地提交到 Git 仓库了。

**第一步：检查代码状态**

使用 `git status` 查看变更。

```bash
git status
```

你会看到大量的新增文件和修改：

  * **依赖**：`package.json` / `pnpm-lock.yaml` (新增了大量 `@storybook/*` 相关的开发依赖，以及 `vite-tsconfig-paths`)。
  * **配置**：新增了 `.storybook/` 目录及其下的 `main.ts`, `preview.ts`, `withTheme.tsx` 文件。
  * **示例**：新增了 `src/stories/` 目录及其下的示例文件。
  * **脚本**：`package.json` 中新增了 `storybook` 和 `build-storybook` 脚本。

**第二步：暂存所有变更**

将所有新文件和修改添加到暂存区。

```bash
git add .
```

**第三步：执行提交**

我们编写一条符合“约定式提交”规范的 Commit Message。`feat` 是合适的类型，`storybook` 或 `dev:storybook` 是合适的 `scope`。

```bash
git commit -m "feat(dev:storybook): setup storybook 9 with vite, tailwind, and theme provider integration"
```

*这条消息清晰地表明我们完成了 Storybook 的搭建，并解决了与 Vite、Tailwind 和我们自定义主题的集成问题。*

{% note info simple %}
**一个可工作的起点**: 这次提交的价值在于，它提供了一个 **立即可用的 Storybook 环境**。团队中的任何成员现在都可以 `git pull` 并运行 `pnpm storybook`，开始在隔离环境中进行组件开发和可视化测试了。
{% endnote %}

