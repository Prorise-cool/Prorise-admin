
# 第十二章. 页面布局：构建核心 Layout


在第十一章中，项目拥有了导航能力和一套可维护的路由架构。然而，目前所有页面（如 `WelcomePage`, `NotFoundPage`）都是直接渲染，缺乏统一的视觉结构。

本章的任务是构建应用的 **视觉骨架**——**Layout (布局)** 组件。将实现两种核心布局：`SimpleLayout`（用于登录、注册等简单页面）和 `DashboardLayout`（用于后台主界面，包含头部、侧边栏和内容区域）。同时，将利用已有的 UI 组件基础


## 12.1. 布局策略：嵌套路由与 Layout 组件

在构建具体的布局组件之前，首先需要理解 React Router v7 是如何支持和推荐布局模式的。

### 12.1.1. React Router 的布局机制：嵌套路由与 `<Outlet />`

React Router v7（以及 v6）通过 **嵌套路由 (Nested Routes)** 和 `<Outlet />` 组件，为实现布局提供了极其优雅和强大的原生支持。

回顾在 11.4.6 节中重构的 `src/routes/index.tsx`：

```tsx
// src/routes/index.tsx (部分)
const rootRoute: RouteObject = {
  path: '/',
  Component: LazyMyApp, // <-- 根布局组件
  errorElement: <ErrorBoundary />,
  children: [
    // ...authRoutes, dashboardRoutes, mainRoutes...
    // 假设 mainRoutes 包含: { index: true, element: <LazyWelcomePage /> }
  ],
};
```

这里的 `children` 数组定义的就是 **嵌套路由**。其工作流程是：

1.  当 URL 匹配到 `/` 时，`RouterProvider` 首先渲染 `rootRoute` 定义的 `Component`，即 `<LazyMyApp />`。
2.  然后，`RouterProvider` 会继续检查 URL 是否匹配 `children` 中的某一项。
3.  由于 `LazyWelcomePage` 配置了 `index: true`，当 URL 恰好是 `/` 时，它被匹配。
4.  **关键点**：`<LazyWelcomePage />` **不会** 替换掉 `<LazyMyApp />`。相反，`<LazyMyApp />` 内部必须包含一个 `<Outlet />` 组件。React Router 会将匹配到的子路由组件（这里是 `<LazyWelcomePage />`）**渲染到 `<Outlet />` 的位置**。

在 11.2.5 节中，`MyApp.tsx` 的实现正是如此：

```tsx
// src/MyApp.tsx (部分)
function MyApp() {
  return (
    <ThemeProvider>
      <AntdAdapter>
        <Suspense fallback={<RouteLoading />}>
          {/* ↓↓↓ 子路由将在此处渲染 ↓↓↓ */}
          <Outlet /> 
        </Suspense>
      </AntdAdapter>
    </ThemeProvider>
  );
}
```

这种模式的 **强大之处** 在于：

  * **层级化结构**：布局组件（如 `MyApp`）可以定义共享的 UI 元素（页头、页脚、侧边栏、全局上下文），而子路由组件只负责渲染其特定的内容。
  * **任意嵌套**：布局可以任意嵌套。例如，`/dashboard` 路由可以渲染一个 `<DashboardLayout />`，而 `/dashboard/users` 路由的组件则会被渲染到 `<DashboardLayout />` 内部的 `<Outlet />` 中。
  * **代码复用**：共享的布局逻辑只需编写一次。
  * **关注点分离**：布局组件关心“框架”，页面组件关心“内容”。



### 12.1.2. `SimpleLayout` 与 `DashboardLayout` 职责划分

基于嵌套路由机制，可以为 `prorise-admin` 设计不同场景下的布局组件：

1.  **`SimpleLayout` (简单布局)**
    *   **职责**：提供一个极其简洁的页面框架，通常用于独立的功能页面或展示页面。在当前的项目阶段，一个完美的例子就是 **全局 404 页面**。它需要一个统一的背景和居中容器，但不需要复杂的头部或侧边栏。
    *   **典型结构**：一个简单的容器，使内容（例如“页面未找到”的提示信息）能在屏幕中水平和垂直居中。
    *   **实现**：将创建一个 `src/layouts/simple/index.tsx` 组件，它内部包含 `<Outlet />`。

2.  **`DashboardLayout` (仪表盘布局)**
    *   **职责**：提供标准的后台管理界面布局，用于承载所有核心功能页面。在当前阶段，我们可以将 **欢迎页面 (`WelcomePage`)** 作为第一个置于此布局下的页面。
    *   **典型结构**：通常包含：
        *   **顶部导航栏 (Header)**：固定在页面顶部，包含 Logo、用户头像等全局操作。
        *   **侧边导航栏 (Sider/Nav)**：固定在左侧，包含多层级的菜单项。
        *   **主内容区域 (Main/Content)**：页面的核心工作区。**`<Outlet />` 将位于此区域内**。
    *   **实现**：将创建 `src/layouts/dashboard/index.tsx` 组件，并可能包含 `header.tsx`, `nav/*.tsx`, `main.tsx` 等子组件。

**路由配置策略展望**：

在本章，我们将把 `NotFoundPage` 和 `WelcomePage` 分别应用上这两种布局。

*   未来，当我们在 **第十六章** 构建认证模块时，像 **登录页** 这样的页面，也将复用 `SimpleLayout`。
*   未来，所有在 `/dashboard` 路径下的业务页面，都将统一使用 `DashboardLayout` 作为其容器。

----
## 12.2. `SimpleLayout` 实现

在 12.1 节明确了布局策略后，现在开始构建第一个具体的布局组件：`SimpleLayout`。它的设计目标是为那些不需要复杂导航、内容通常居中展示的页面（例如未来的登录、注册页面）提供一个简洁、一致的视觉框架。

### 12.2.1. 组件结构规划

`SimpleLayout` 的核心需求是提供一个包含页眉（Header）和主内容区（Main Content）的垂直结构。主内容区需要能够将其中的子内容（即具体页面）在可用空间内水平和垂直居中。

基于此，可以规划出如下的 JSX 结构骨架：

![image-20251028170224539](https://prorise-blog.oss-cn-guangzhou.aliyuncs.com/cover/image-20251028170224539.png)

```tsx
<div className="flex min-h-screen flex-col ..."> {/* 根容器：垂直布局，最小高度占满屏幕 */}
  <HeaderSimple /> {/* 页眉区域 */}
  <main className="flex flex-grow items-center justify-center ..."> {/* 主内容区：自动填充剩余空间，内部居中 */}
    <Outlet /> {/* 子路由内容渲染点 */}
  </main>
  {/* (可选) Footer */}
</div>
```

这个结构清晰地划分了页眉和主内容区，并利用 Flexbox (`flex-grow`, `items-center`, `justify-center`) 实现了主内容区的自动填充和内部居中。

### 12.2.2. 实现 `HeaderSimple` 子组件

从上面的结构规划可以看出，`SimpleLayout` 依赖一个名为 `HeaderSimple` 的子组件。在构建 `SimpleLayout` 之前，需要先实现这个页眉组件。

`HeaderSimple` 的职责非常简单：在页面顶部提供一个横条，通常包含 Logo（指向首页）和可能的全局操作入口（例如主题设置）。

**1. (编码) 创建文件：**
根据 `slash-admin` 的结构约定，将布局相关的辅助组件放在 `src/layouts/components/` 目录下。

```bash
mkdir -p src/layouts/components
touch src/layouts/components/header-simple.tsx
```

**2. (编码) 实现 `HeaderSimple.tsx`：**
基于您提供的代码，实现如下：

**文件路径**: `src/layouts/components/header-simple.tsx`

```tsx
// 1. 导入依赖项
import Logo from "@/components/brand/Logo"; // 导入在第 10 章创建的 Logo 组件

// 2. 导入 SettingButton (假设存在，将在后续章节实现)
//    注意：即使 SettingButton 尚未实现，这里先进行导入和使用，
//    是为了结构完整性。稍后创建 SettingButton 时，这里会自动生效。
//    在实际开发中，可以暂时注释掉或用占位符替代。
// import SettingButton from "./setting-button"; // 假设 SettingButton 在同级目录下

/**
 * SimpleLayout 使用的简化版页眉。
 * 包含 Logo 和设置按钮。
 */
export default function HeaderSimple() {
	// 思考：为什么使用 <header> 语义化标签？
	// <header> 明确告知浏览器和辅助技术，这部分内容是页面的介绍性内容或导航辅助工具，
	// 有助于 SEO 和可访问性。
	return (
		// 3. 使用 <header> 标签，并应用 Tailwind 进行样式化
		<header className="flex h-16 w-full items-center justify-between px-6">
			<Logo width={30} height={30} />
			{/* <SettingButton /> */}
		</header>
	);
}
```

**实现细节解析**：

  * **组件导入**: 正确导入了已存在的 `Logo` 组件。对于尚未实现的 `SettingButton`，暂时保留导入和使用（或使用占位符 `<div />` 替代），这符合“先骨架后细节”的开发节奏。
  * **语义化 HTML**: 使用 `<header>` 标签增强了页面的语义结构。
  * **Tailwind CSS**: 通过一系列原子类 (`flex`, `h-16`, `items-center`, `justify-between`, `px-6`) 精确、声明式地控制了页眉的布局和外观，无需编写任何额外的 CSS 文件。
  * **组件组合**: `HeaderSimple` 本身不包含复杂逻辑，它通过组合 `Logo` 和 `SettingButton` 来实现其功能。

### 12.2.3. (编码) 实现 `SimpleLayout.tsx` 主体

现在 `HeaderSimple` 已经就绪（至少骨架已定），可以完成 `SimpleLayout.tsx` 的实现。

**1. (编码) 创建文件：**

```bash
mkdir -p src/layouts/simple
touch src/layouts/simple/index.tsx
```

**2. (编码) 实现 `SimpleLayout.tsx`：**

**文件路径**: `src/layouts/simple/index.tsx`

```tsx
import type React from "react";
import { Outlet } from "react-router-dom"; // 导入 Outlet 用于渲染子路由

// 导入刚刚创建（或规划好）的 HeaderSimple 组件
import HeaderSimple from "../components/header-simple";

/**
 * 简单布局组件。
 * 提供一个包含简单头部 (HeaderSimple) 和内容居中 (main) 的基本页面框架。
 * 适用于登录、注册等独立页面。子路由的内容将渲染在 <Outlet /> 的位置。
 */
export default function SimpleLayout() {
	return (
		// 1. 根容器：Flex 垂直布局，最小高度占满屏幕
		<div className="flex min-h-screen w-full flex-col bg-background text-foreground">
			{/* 2. 渲染页眉 */}
			<HeaderSimple />

			{/* 3. 主内容区域：自动填充剩余空间，内部 Flex 实现内容居中 */}
			<main className="flex flex-grow items-center justify-center p-4">
				<Outlet />
			</main>

      {/* (可选) Footer 区域可以在此添加 */}
      {/* <footer className="shrink-0 p-4 text-center text-sm text-muted-foreground">
           © 2025 Prorise-Admin
         </footer> 
      */}
		</div>
	);
}

```

**完整实现解析**：

  * **布局结构**: 完全遵循了 12.2.1 规划的 JSX 结构。
  * **主题集成**: 通过 `bg-background` 和 `text-foreground` 类，布局的颜色与第九章建立的 CSS 桥接层和主题系统正确关联。
  * **`<Outlet />`**: 明确了子路由内容的渲染位置。
  * **Flexbox 运用**: 充分利用了 Flexbox 的能力（`flex-col`, `min-h-screen`, `flex-grow`, `items-center`, `justify-center`）来实现自适应和居中布局。
  * **可扩展性**: 预留了添加 Footer 的位置。


-----

### 12.2.4. (验证) 创建开发专用测试路由

为了在真实的应用路由环境中验证 `SimpleLayout`（及其 `<Outlet />`）的布局效果，我们不使用 Storybook 模拟，而是创建一个仅在开发环境下生效的 `/dev` 测试路由。

**1. (编码) 创建可复用的 `MockPage` 组件**

这个组件将作为所有布局测试的通用“子页面”内容。

```bash
mkdir -p src/components/dev
touch src/components/dev/MockPage.tsx
```

**文件路径**: `src/components/dev/MockPage.tsx`

```tsx
/**
 * (开发专用) 模拟页面内容组件
 * 用于在应用的 /dev 路由中充当测试内容。
 */
export default function MockPage() {
  return (
    <div className="rounded-lg border bg-card p-8 shadow-lg text-card-foreground w-full max-w-md">
      <h1 className="text-2xl font-bold mb-4">开发测试页面</h1>
      <p>
        此页面仅在开发环境中可见，用于测试布局和组件。
        <br />
        它现在正被 <code>SimpleLayout</code> 包裹。
      </p>
    </div>
  );
}
```

**2. (编码) 创建 `dev` 路由模块**

创建一个新的路由 "section" 文件，专门存放开发专用的路由。

```bash
touch src/routes/sections/dev.tsx
```

**文件路径**: `src/routers/sections/dev.tsx`

```tsx
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// 1. 导入布局和测试页面
const SimpleLayout = lazy(() => import("@/layouts/simple"));
const MockPage = lazy(() => import("@/components/dev/MockPage"));

// 2. 创建一个空的路由数组
const devRoutes: RouteObject[] = [];


// 3. (关键) 仅在开发环境下填充路由
// Vite/Webpack 会在生产构建时自动移除这个 if 块 (Tree-shaking)
if (process.env.NODE_ENV === "development") {
  devRoutes.push({
    // 4. 使用 SimpleLayout 作为这个测试页面的布局
    element: <SimpleLayout />,
    children: [
      {
        path: "dev",
        element: <MockPage />,
      },
    ],
  });
}

// 5. 导出（在生产环境中这将是一个空数组）
export { devRoutes };
```

**3. (编码) 接入主路由 `index.ts`**

修改主路由文件，将 `devRoutes` 动态地合并到根路由的 `children` 中。

**文件路径**: `src/router/index.ts`

```typescript

import { devRoutes } from "./sections/dev"; // <--- 新增：导入开发路由

const rootRoute: RouteObject = {
  path: "/",
  Component: LazyMyApp,
  errorElement: <ErrorBoundary />,
  children: [
    ...authRoutes,
    ...dashboardRoutes,
    ...devRoutes, // <--- 新增：在这里合并开发路由
    // ...
    ...mainRoutes, // mainRoutes (包含 404) 仍然保持在最后
  ],
};

```

**4. (验证) 运行并访问**

现在，启动我们的开发服务器 (`pnpm dev`)。

在浏览器中访问 `http://localhost:5173/dev` (或我们的开发端口)。我们将看到 `MockPage` 卡片内容被 `SimpleLayout` 正确包裹（包含页眉）并在页面中央显示。

**实现解析**：
通过 `process.env.NODE_ENV === 'development'` 条件判断，这个 `/dev` 路由只存在于开发模式中。在执行 `pnpm build` 进行生产打包时，该 `if` 块代码将被 `tree-shaking` 移除，`devRoutes` 将是一个空数组，确保了生产包的纯净性。

**任务 12.2 已完成！**
`SimpleLayout` 及其依赖 `HeaderSimple` 已实现，并通过真实的应用内路由进行了验证。

-----
## 12.3. `src/ui` 增强：TDD/CDD 构建 `ScrollArea`

在我们开始构/建 `DashboardLayout`（仪表盘布局）之前，我们必须先准备好它的一个关键依赖项。`DashboardLayout` 的侧边导航栏（`nav`）在内容（菜单项）过多时，必须能够优雅地滚动。

这就引入了一个在企业级项目中必须解决的经典问题：**滚动条样式**。

### 12.3.1. 架构决策：为何封装 `ScrollArea`

在第八章中，我们确立了 `src/ui` 的设计哲学：**组合 `radix-ui`（无头组件库）和 `tailwind-css`（样式）**。

我们不能直接在布局代码中依赖 `radix-ui` 的原始组件（如 `ScrollAreaPrimitive`），也不能依赖浏览器丑陋且不一致的原生滚动条。

我们必须在 `src/ui` 层对 `ScrollArea` 进行封装，这为我们带来三大核心价值：

1.  **视觉一致性**：这是最首要的原因。macOS 默认会隐藏滚动条，而 Windows 始终显示。通过封装，我们将利用 Radix 的能力和 Tailwind 的样式，强制所有平台都显示一个与 `Prorise-Admin` 主题（例如，消费我们已定义的 `bg-border` 变量）完全一致的、纤细的美观滚动条。
2.  **API 封装**：Radix Primitives 提供了极高粒度的原子组件（如 `Root`, `Viewport`, `Scrollbar`, `Thumb`）。在业务中直接使用它们是繁琐且易出错的。`src/ui` 的职责就是将这些原子组件组合成一个简洁、易用的 API。
3.  **可维护性**：这是一个关键的架构考量。通过在 `src/components/ui/scrollArea` 这一个目录中实现所有逻辑，我们的整个项目都只依赖这个封装后的组件。如果未来我们需要更换滚动条的底层实现，我们只需要修改这一个地方。

### 12.3.2. (编码) 谋定而后动：组件文件结构与依赖

遵循第八章 `Button` 组件建立的规范，每一个 `ui` 组件都必须拥有自己的文件夹，并包含实现、变体、故事、测试和文档。

**1. 创建组件目录**

```bash
mkdir -p src/components/ui/scrollArea
```

**2. 创建组件核心文件 (空文件)**

```bash
# 1. 组件实现
touch src/components/ui/scrollArea/scroll-area.tsx

# 2. 样式变体 (遵循第八章的样式分离)
touch src/components/ui/scrollArea/scroll-area.variants.tsx

# 3. 单元测试 (TDD)
touch src/components/ui/scrollArea/scroll-area.test.tsx

# 4. 故事文档 (CDD)
touch src/components/ui/scrollArea/scroll-area.stories.tsx

# 5. MDX 叙事文档
touch src/components/ui/scrollArea/scroll-area.mdx
```

**3. (编码) 安装依赖项**

`ScrollArea` 组件依赖于 `@radix-ui/react-scroll-area`。

```bash
pnpm add @radix-ui/react-scroll-area
```

### 12.3.3. (CDD) Story 先行：定义 API“契约” (桩)

我们开发流程的第一步，不是打开 `scroll-area.tsx`，而是打开 `scroll-area.stories.tsx`。我们将在这里“设计”组件的 API。

**文件路径**: `src/components/ui/scrollArea/scroll-area.stories.tsx`

```tsx
// 遵循您提示的规范，正确导入 Meta 类型
import type { Meta } from '@storybook/react-vite';
// 导入一个尚不存在的组件。这是 TDD/CDD 流程的正常现象。
import { ScrollArea } from './scroll-area';

// 1. 定义 Meta 元数据
// 这是我们 CDD 的第一步：定义 API 契约
const meta: Meta<typeof ScrollArea> = {
    title: 'UI/ScrollArea',
    component: ScrollArea,
    parameters: {
        layout: 'centered', // 在画布中央展示
    },
    // [核心] 遵循 8.4 节规范：不使用 autodocs，因为我们将提供 .mdx 文件
    // tags: ['autodocs'], // <-- 移除

    // 2. 定义组件的 API 契约 (argTypes)
    argTypes: {
        // 我们后续会实现这个参数，现在先移除
        // orientation: {
        //     control: 'radio',
        //     options: ['vertical', 'horizontal', 'both'],
        //     description: '控制滚动条的显示方向 (我们封装后提供的高级 API)',
        //     table: {
        //         defaultValue: { summary: 'vertical' },
        //     },
        // },
        children: {
            control: false, // children 由 render 函数提供，不在 Controls 中配置
        },
        className: {
            control: 'text',
            description: '应用于根元素的外部类名，用于约束大小',
        },
    },
};

export default meta;
// 此时，我们故意不导出任何 StoryObj。
// 我们只定义了 API 契约，下一步是去 TDD 实现它。
```

**CDD 阶段小结**：我们已经定义了 `ScrollArea` 的 API 契约（`orientation` prop）。现在 Storybook 处于“预期中的失败” (RED) 状态，因为它无法导入 `./scroll-area`。

### 12.3.4. (TDD) Test 驱动：第一个失败的测试 (RED)

下一步，打开 `.test.tsx` 文件，编写一个最基础的、失败的测试来驱动我们的编码。

**文件路径**: `src/components/ui/scrollArea/scroll-area.test.tsx`

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
// 导入尚不存在的组件
import { ScrollArea } from "./scroll-area";

describe("ScrollArea Component", () => {
    it('应该能正确渲染子元素', () => {
        // 1. Arrange
        render(
            <ScrollArea>
                <div data-testid="child-content">Hello World</div>
            </ScrollArea>,
        );
        // 2. Act
        const childElement = screen.getByTestId('child-content');
        // 3. Assert
        expect(childElement).toBeInTheDocument();
        expect(childElement).toHaveTextContent('Hello World');
    })
});
```

**TDD 阶段小结**：运行 `pnpm test:unit`，`scroll-area.test.tsx` 中的测试将失败 (RED)，因为 `scroll-area.tsx` 尚未导出任何内容。我们的目标现在非常明确：编写最少的代码让这个测试变绿 (GREEN)。

### 12.3.5. (编码) 最小实现：让第一个测试通过 (GREEN)

**1. 定义样式变体 (桩)**

首先，我们打开 `.variants.tsx` 文件，定义组件所需的最小样式。

**文件路径**: `src/components/ui/scrollArea/scroll-area.variants.tsx`

```ts
import { cva } from 'class-variance-authority';

// 1. 根 (Root) 元素的样式
export const scrollAreaRootVariants = cva("relative overflow-hidden");
// 2. 视口 (Viewport) 元素的样式
export const scrollAreaViewportVariants = cva(
  "h-full w-full rounded-[inherit] block!", // 'block!' 强制覆盖 Radix 内联样式
);
```

**2. 编写最小实现代码**

现在我们打开 `scroll-area.tsx`，编写让测试通过的最小代码。

**文件路径**: `src/components/ui/scrollArea/scroll-area.tsx`

```tsx
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "@/utils/cn";
// 1. 导入我们分离的样式变体
import {
    scrollAreaRootVariants,
    scrollAreaViewportVariants,
} from "./scroll-area.variants";

// 2. 定义 Props 接口
// (此时我们还不需要 orientation，只实现能让测试通过的最小功能)
export interface ScrollAreaProps
    extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> { }


// 3. 封装并导出主组件 ScrollArea
const ScrollArea = React.forwardRef<
    React.ComponentRef<typeof ScrollAreaPrimitive.Root>,
    ScrollAreaProps
>(({ className, children, ...props }, ref) => (
    // 4. 根容器 (Root)
    <ScrollAreaPrimitive.Root
        ref={ref}
        // 5. 消费 Root 的 CVA 变体
        className={cn(scrollAreaRootVariants(), className)}
        {...props}
    >
        {/* 6. 视口 (Viewport) */}
        <ScrollAreaPrimitive.Viewport
            // 7. 消费 Viewport 的 CVA 变体
            className={cn(scrollAreaViewportVariants())}
        >
            {children}
        </ScrollAreaPrimitive.Viewport>
    </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// 8. 导出
export { ScrollArea };
```

**GREEN\!** 此时，再次运行 `pnpm test:unit`，第一个测试（“应该能正确渲染子元素”）将会通过。

### 12.3.6. (编码) 增量实现：添加默认滚动条

**1. 更新样式变体**

回到 `scroll-area.variants.tsx`，添加 `Scrollbar` 和 `Thumb` 的样式。

**文件路径**: `src/components/ui/scrollArea/scroll-area.variants.tsx` (追加)

```ts
// ... (Root 和 Viewport 变体之后)

// 3. 滚动条 (Scrollbar) 元素的样式
export const scrollAreaScrollbarVariants = cva(
  "flex touch-none select-none transition-colors",
  {
    variants: {
      orientation: {
        vertical: "h-full w-2.5 p-[1px]",
        horizontal: "h-2.5 flex-col p-[1px]",
      },
    },
    defaultVariants: {
      orientation: "vertical",
    },
  },
);


// 4. 滑块 (Thumb) 元素的样式
// 我们消费在第九章定义的主题变量 bg-border
export const scrollAreaThumbVariants = cva(
  "relative flex-1 rounded-full bg-gray-500/border cursor-pointer bg-primary",
);
```

**2. 更新组件实现**

回到 `scroll-area.tsx`，创建内部 `ScrollBar` 组件并默认使用它。

**文件路径**: `src/components/ui/scrollArea/scroll-area.tsx` (修改)

```tsx
import * as React from 'react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { type VariantProps } from 'class-variance-authority'; // 导入 CVA 类型
import { cn } from '@/utils/cn';
import {
  scrollAreaRootVariants,
  scrollAreaViewportVariants,
  scrollAreaScrollbarVariants, // <-- 导入
  scrollAreaThumbVariants,   // <-- 导入
} from './scroll-area.variants';

// [核心] 封装一个内部的 ScrollBar 组件
export interface ScrollBarProps
    extends React.ComponentPropsWithoutRef<
        typeof ScrollAreaPrimitive.ScrollAreaScrollbar
    > { }


const ScrollBar = React.forwardRef<
    React.ComponentRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
    ScrollBarProps & VariantProps<typeof scrollAreaScrollbarVariants> // 继承 CVA 变体类型
>(({ className, orientation = "vertical", ...props }, ref) => (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
        ref={ref}
        orientation={orientation}
        className={cn(scrollAreaScrollbarVariants({ orientation }), className)}
        {...props}
    >
        <ScrollAreaPrimitive.ScrollAreaThumb
            className={cn(scrollAreaThumbVariants())}
        />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

// ... (ScrollAreaProps 接口) ...

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn(scrollAreaRootVariants(), className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className={cn(scrollAreaViewportVariants())}>
      {children}
    </ScrollAreaPrimitive.Viewport>

    {/* [新增] 默认渲染垂直滚动条 */}
    <ScrollBar orientation="vertical" />
    
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// 导出两个组件，使其可组合
export { ScrollArea, ScrollBar };
```

### 12.3.7. (编码) 最终实现：实现 `orientation` 逻辑 (GREEN)

虽然我们很希望可以通过 TDD 来驱动，但是在 jsdom 环境下渲染一个滚动条太过于麻烦了，所以我们一次性也是最后一次修改 `scroll-area.tsx`，实现完整的 API 契约。

**文件路径**: `src/components/ui/scrollArea/scroll-area.tsx` (修改)

```tsx
// ... (imports 和 ScrollBar 组件保持不变) ...

// [修改] 更新 Props 接口，使其包含我们在 Storybook 中设计的 API
export interface ScrollAreaProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  orientation?: 'vertical' | 'horizontal' | 'both';
}

const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  ScrollAreaProps
>(
  // [修改] 解构出 orientation prop，默认值为 'vertical'
  ({ className, children, orientation = 'vertical', ...props }, ref) => (
    <ScrollAreaPrimitive.Root
      ref={ref}
      className={cn(scrollAreaRootVariants(), className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport className={cn(scrollAreaViewportVariants())}>
        {children}
      </ScrollAreaPrimitive.Viewport>

      {/* [核心] (API 封装) 
          根据 orientation prop 消费内部 ScrollBar 
      */}
      {(orientation === 'vertical' || orientation === 'both') && (
        <ScrollBar orientation="vertical" />
      )}
      {(orientation === 'horizontal' || orientation === 'both') && (
        <ScrollBar orientation="horizontal" />
      )}

        <ScrollAreaPrimitive.ScrollAreaCorner />
    </ScrollAreaPrimitive.Root>
  ),
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

export { ScrollArea, ScrollBar };
```

### 12.3.8. (CDD) 完善 Storybook 故事

我们的组件现在功能完备且经过测试。回到 `scroll-area.stories.tsx`，补充完整的 `StoryObj` 导出，让 Storybook 可视化地展示我们的成果。

**文件路径**: `src/components/ui/scrollArea/scroll-area.stories.tsx` (追加)

```tsx
// ... (meta 定义和 DemoContent 保持不变) ...

// ...取消掉我们之前的注释

// [新增] 导入 StoryObj 类型
type Story = StoryObj<typeof meta>;

// 5. 编写“主故事” (Primary)，用于 MDX 嵌入和交互
export const Primary: Story = {
  // args 会从 meta.args 继承，我们这里无需重复定义
  render: (args) => (
    <ScrollArea {...args}>
      {/* 准备一个垂直演示内容 */}
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">示例标签</h4>
        {Array.from({ length: 50 })
          .fill(null)
          .map((_, i) => (
            <div key={i} className="text-sm border-b border-dashed py-2">
              {`列表项 ${i + 1}`}
            </div>
          ))}
      </div>
    </ScrollArea>
  ),
};

// 6. 编写“水平滚动”故事
export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
    // 关键：限制宽度并防止换行
    className: 'h-auto w-[400px] rounded-md border whitespace-nowrap',
  },
  render: (args) => (
    <ScrollArea {...args}>
      {/* 准备一个水平演示内容 */}
      <div className="p-4">
        <div className="flex space-x-4" style={{ width: 1200 }}>
          {Array.from({ length: 20 })
            .fill(null)
            .map((_, i) => (
              <div
                key={i}
                className="w-[200px] h-[150px] bg-card border rounded-md flex items-center justify-center text-card-foreground"
              >
                {`卡片 ${i + 1}`}
              </div>
            ))}
        </div>
      </div>
    </ScrollArea>
  ),
};
```

**CDD 验证**：运行 `pnpm storybook`。现在 `UI/ScrollArea` 下的所有故事都已正确渲染，并且 Controls 面板可以正常工作。

### 12.3.9. (文档) MDX 叙事文档

最后一步，我们创建 `.mdx` 文件来为组件提供专业的使用指南，完成 TDD/CDD 闭环的最后一步。

**文件路径**: `src/components/ui/scrollArea/scroll-area.mdx`

```mdx
import { Meta, Story, Controls } from '@storybook/blocks';
import * as ScrollAreaStories from './scroll-area.stories';

{/* [核心] 关联 .stories.tsx 文件，并替换 Docs 标签页 */}
<Meta of={ScrollAreaStories} />

# ScrollArea 滚动区域

`ScrollArea` 是对 Radix UI Scroll Area 原语的封装，用于在内容溢出时提供
与 `Prorise-Admin` 主题系统（`bg-border`）一致的、跨平台的美观滚动条。

## 为什么需要封装？

在企业级项目中，我们不能依赖浏览器丑陋且不一致的原生滚动条（尤其是 Windows）。
`src/ui/scrollArea` 的职责是：
1.  **视觉一致性**：强制所有平台显示与主题统一的纤细滚动条。
2.  **API 封装**：将 Radix 复杂的原语组合成一个易用的 API。
3.  **可维护性**：为项目提供一个单一的滚动条依赖源。

## 基础用法（垂直）

默认情况下，`ScrollArea` 提供垂直滚动条。
**你必须** 为 `ScrollArea` 组件提供一个 `className` 来 **约束其高度**（例如 `h-[300px]`），否则它将无限拉伸，无法触发滚动。

<Story of={ScrollAreaStories.Primary} />

## 水平滚动

通过设置 `orientation="horizontal"`，可以启用水平滚动。
此时，你必须约束其**宽度**（例如 `w-[400px]`），并通常需要为子元素设置 `whitespace-nowrap` 以防止内容换行。

<Story of={ScrollAreaStories.Horizontal} />

## API 参考 (Props)

以下是 `ScrollArea` 组件所有可用的 `props`。
这份表格是根据组件的 TypeScript 接口和 `scroll-area.stories.tsx` 中的 `argTypes` 自动生成的。

<Controls />
```

**TDD/CDD/DDD 闭环**：
`ScrollArea` 组件现已完成。我们严格遵循了第八章的规范：

1.  **CDD**：在 `scroll-area.stories.tsx` 中设计了 API 和视觉状态 (桩)。
2.  **TDD**：在 `scroll-area.test.tsx` 中编写了增量的测试用例。
3.  **Code**：在 `scroll-area.variants.tsx` 中分离了样式，并在 `scroll-area.tsx` 中逐步实现了功能，使 Story 和 Test 全部通过 (红-绿-重构)。
4.  **Docs**：在 `scroll-area.mdx` 中编写了专业的叙事文档。

`DashboardLayout` 的关键依赖项已准备就绪。

----
## 12.4. DashboardLayout 骨架构建

在 `12.3` 节中，我们成功地 TDD/CDD 构建了 `ScrollArea` 组件。这是一个至关重要的 `src/ui` 组件，它确保了我们应用在所有平台上都能拥有一致的、符合主题的滚动条体验。

现在，`ScrollArea` 已经准备就绪，我们将开始构建它在 `Prorise-Admin` 中的第一个“消费者”：`DashboardLayout` (仪表盘布局)。

这是我们应用中 **承载所有核心功能页面的视觉骨架**。几乎所有的业务页面（如工作台、用户管理、系统设置等）都将被渲染在这个布局的 `<Outlet />` 之中。因此，这个布局的稳健性、可维护性和可扩展性，对整个项目的质量起着决定性的作用。

### 12.4.1. 架构决策：CSS Grid 与组件拆分

在开始编写代码之前，我们必须先确定布局的实现策略。我们的目标是构建一个经典的“**左侧固定导航 + 右侧头部/内容区**”的 PC 端布局。

**1. 布局技术选型：为什么选择 CSS Grid？**

在 2025 年，实现这种布局的最佳实践是使用 **CSS Grid**，而非传统的 `position: fixed` 方案。

* **传统方案 (Fixed + Padding)**：
    * *做法*：侧边栏 `position: fixed`，主内容区设置一个动态的 `padding-left` (例如 `240px`)。
    * *缺点*：这是一种“侵入式”布局。侧边栏脱离了文档流，主内容区需要“感知”到侧边栏的宽度，并通过 `padding` 为其“让位”。当侧边栏宽度需要变化（例如折叠成 "mini" 模式）时，主内容区必须通过 JavaScript 或 CSS 变量来 **被动地** 响应这个变化。这种布局耦合度高，且容易在复杂的 `z-index` 堆叠下产生不可预见的 bug。

* **`Prorise-Admin` 方案 (CSS Grid)**：
    * *做法*：我们将 `DashboardLayout` 的根节点 (`<div>`) 定义为一个两列网格
    * （例如 `display: grid; grid-template-columns: 240px 1fr;`）。
    * *优点*：
        1.  **声明式与解耦**：布局结构在 **父级**（根节点）统一定义。侧边栏 (`NavVertical`) 和主区域 (`MainArea`) 只是这个网格的“填充物”，它们 **彼此之间互不感知**，实现了完美的关注点分离。
        2.  **稳健性**：所有组件都在正常的文档流中。我们不再需要处理 `fixed` 定位带来的 `z-index` 堆叠上下文问题。
        3.  **易于维护**：当侧边栏需要从 `240px` 变为 `64px` (mini 模式) 时，我们 **只需要改变父级 Grid 的 `grid-template-columns` 定义** 即可。主内容区会 **自动、原生** 地填充剩余空间，无需任何 `padding` 计算或 JavaScript 干预。

```bash
# 创建核心组件目录
mkdir -p src/layouts/dashboard/

# 在上述目录中创建组件文件
touch src/layouts/dashboard/nav/nav-vertical.tsx
touch src/layouts/dashboard/header.tsx
touch src/layouts/dashboard/main-area.tsx
touch src/layouts/dashboard/index.tsx
```

预创建成功的 `layouts` 目录树

执行上述命令后，您的 `src/layouts/` 目录结构将如下所示：

```markdown
└── 📂 layouts/
   ├── 📂 components/
   │  └── 📄 header-simple.tsx
   ├── 📂 dashboard/
   │  ├── 📄 DashboardLayout.test.tsx
   │  ├── 📄 header.tsx
   │  ├── 📄 index.tsx
   │  ├── 📄 main-area.tsx
   │  ├── 📄 nav-vertical.tsx
   │  └── 📂 nav/
   │     └── 📄 index.tsx
   └── 📂 simple/
      └── 📄 index.tsx
```

---
### 12.4.2. (编码) 任务 1 —— 定义 CSS 布局变量

在 12.4.1 节中，我们确定了使用 **CSS Grid** 作为 `Prorise-Admin` 的布局基石。Grid 布局的核心在于 `grid-template-columns` 属性，它需要一个具体的宽度值来定义侧边栏（例如 `280px`）。

**架构思考：规避“魔法数字”**

在 `Prorise-Admin` 的开发中，我们必须 **严格规避“魔法数字”**。

“魔法数字”是指在代码中未经解释、多处重复的硬编码值（例如 `280px`）。

我们 **绝对不能** 在 Tailwind 类名中硬编码这个宽度，例如 `grid-cols-[280px_1fr]`。为什么？

1.  **职责不一**：布局组装器（`index.tsx`）需要这个宽度来定义 Grid，而侧边栏（`nav-vertical.tsx`）也需要这个宽度来设置自己的 `width`。这是一个 **共享状态**。
2.  **维护灾难**：如果这个“魔法数字”被硬编码在多个文件中，未来任何调整（例如从 `280px` 改为 `260px`）都将是一场灾难。开发者必须去“猜”并“查找”所有使用到这个值的地方，这极易导致 Bug（例如 Grid 变了，但侧边栏的宽度没变）。

**解决方案：“唯一事实来源” (SSOT)**

2025 年的最佳实践是使用 **CSS 自定义属性（CSS 变量）** 来作为这个“唯一事实来源”。我们将全局布局常量统一定义在我们的根样式表中。

**1. (编码) 打开 `src/index.css`**

让我们打开在第四章创建的 `src/index.css` 文件。找到 `@layer base` 规则，在 `:root` 选择器中，我们将添加新的布局变量。

**文件路径**: `src/index.css` (修改)

```css
/* ========================================
   Tailwind CSS 导入
   ======================================== */
@plugin "tailwindcss-animate";
@import "tailwindcss";
@import "tw-animate-css";

/* prorise layout */
:root {
	--layout-nav-width: 260px;
	--layout-nav-width-mini: 88px;
	--layout-nav-height-horizontal: 48px;
	--layout-header-height: 64px;
	--layout-multi-tabs-height: 48px;
}
```

**思考**：通过在 `:root` 中定义，`--layout-nav-vertical-width` 和 `--layout-header-height` 现在成为了全局可用的“常量”。任何组件、任何 CSS 文件都可以访问它们，但它们只在 `index.css` 这 **一个地方** 被定义。

**2. (配置) 让 Tailwind 识别新变量**

虽然我们可以通过 `h-[var(--layout-header-height)]` 这样的方式在 Tailwind 中使用这些变量，但这既不优雅也不易读。

更好的做法是在 `tailwind.config.ts` 中“注册”它们，让它们成为 Tailwind “主题”的一部分，从而拥有更具语义的类名。

**文件路径**: `tailwind.config.ts` (修改)

```ts
// ... (imports) ...
export default {
  // ... (darkMode, content, prefix, theme.container ...)
  theme: {
    // ... (container, extend.colors ...)
    extend: {
      // ... (colors, borderRadius, keyframes, animation ...)

      /*
       * [新增] 扩展布局变量
       * 这使得我们可以使用更简洁、更具语义的 Tailwind 类名
       */
      height: {
        // 键名 'layout-header' 将映射为 Tailwind 类 'h-layout-header'
        'layout-header': 'var(--layout-header-height)',
      },
      width: {
        // 键名 'layout-nav-vertical' 将映射为 Tailwind 类 'w-layout-nav-vertical'
        'layout-nav-vertical': 'var(--layout-nav-vertical-width)',
      },
      
    },
  },
  plugins: [
    // ...
  ],
} satisfies Config;
```

**实现解析**：
我们已经完成了 `DashboardLayout` 的“奠基”工作。我们创建了两个 CSS 变量作为“唯一事实来源”，并在 Tailwind 中注册了它们。

现在，我们可以在任何组件中通过 `w-layout-nav-vertical` (280px) 和 `h-layout-header` (64px) 来消费这些值，确保了布局尺寸的全局一致性和易维护性。如果未来我们需要将侧边栏宽度调整为 260px，我们 **只需要修改 `src/index.css` 中的一行代码**，整个应用的所有相关组件都会自动更新。

这就是企业级项目中所追求的 **健壮性** 与 **可维护性**。

---

### 12.4.3. (编码) 任务 2：创建 `NavVertical` 侧边栏

在 12.4.2 节中，我们在 `src/index.css` 中定义了一系列 CSS 布局变量。然而，`tailwind.config.ts` 文件尚未完全同步，无法消费所有这些新变量。

我们的第一个动作是 **更新 Tailwind 配置**，使其能够识别并转换我们在 `src/index.css` 中定义的所有新变量，为 `NavVertical` 组件及后续组件的开发做好准备。

**1. (配置) 同步 `tailwind.config.ts`**

打开 `tailwind.config.ts` 文件。我们将扩展 `theme.extend.height` 和 `theme.extend.width` 属性，使其与 `src/index.css` 中的 `:root` 变量 **完全一致**。

**文件路径**: `tailwind.config.ts` (修改)

```ts
// ... (imports) ...
export default {
  // ... (darkMode, content, prefix, theme.container ...)
  theme: {
    // ... (container, extend.colors ...)
    extend: {
      // ... (colors, borderRadius, keyframes, animation ...)

      /*
       * [修改] 扩展布局变量
       * 使 Tailwind 的类名与 src/index.css 中的 CSS 变量保持同步
       */
      height: {
        'layout-header': 'var(--layout-header-height)',
        'layout-nav-horizontal': 'var(--layout-nav-height-horizontal)',
        'layout-multi-tabs': 'var(--layout-multi-tabs-height)',
      },
      width: {
        // 'w-layout-nav' 将消费 'var(--layout-nav-width)' (260px)
        'layout-nav': 'var(--layout-nav-width)',
        // 'w-layout-nav-mini' 将消费 'var(--layout-nav-width-mini)' (88px)
        'layout-nav-mini': 'var(--layout-nav-width-mini)',
      },
    },
  },
  plugins: [
    // ...
  ],
} satisfies Config;
```

**实现解析**：
配置现已同步。我们可以在代码中使用 `w-layout-nav` 来代表 `260px`，使用 `h-layout-header` 来代表 `64px`。这种抽象级别对于编写可维护的布局至关重要。

-----

**2. (编码) 创建 `NavVertical` 组件**

现在，我们开始构建 `DashboardLayout` 的第一个子组件：`NavVertical`。这是我们 Grid 布局中的 **第 1 列**。

**职责分析**：
`NavVertical` 的职责是作为一个 **固定的、全屏高的、有固定宽度的** 视觉容器。它内部必须被划分为两个区域：

1.  **Logo 区（头部）**：位于顶部，用于放置 `Logo` 组件。它的高度必须 **严格等于** `--layout-header-height` (64px)，这样它才能与 Grid 第 2 列中的 `Header` 组件在视觉上完美对齐。
2.  **菜单区（内容）**：占据 **所有剩余的垂直空间**。这个区域必须是可滚动的，因此它将成为我们 `ScrollArea` 组件（12.3 节构建）的第一个“真正消费者”。

![image-20251029140729483](https://prorise-blog.oss-cn-guangzhou.aliyuncs.com/cover/image-20251029140729483.png)

**文件路径**: `src/layouts/dashboard/nav/nav-vertical.tsx` (新创建)

首先，我们创建文件并添加必要的导入：

```tsx
// 1. 导入我们在第 10 章创建的 Logo 组件
import Logo from '@/components/brand/Logo';
// 2. 导入我们在 12.3 节构建的 ScrollArea 组件
import { ScrollArea } from '@/components/ui/scrollArea/scroll-area'; 
```

接下来，我们定义组件的骨架。我们将使用 `<nav>` 语义化标签作为根元素，并为其应用实现核心布局的 Tailwind 类。

```tsx
/**
 * DashboardLayout 的垂直侧边导航栏。
 *
 * 架构职责：
 * 1. 作为 CSS Grid 布局的第 1 列。
 * 2. 消费 'w-layout-nav' (var(--layout-nav-width)) 来设置自身宽度。
 * 3. 内部划分为 "Logo 区" 和 "菜单区"。
 * 4. "Logo 区" 消费 'h-layout-header' (var(--layout-header-height))，与主 Header 保持视觉对齐。
 * 5. "菜单区" 使用 ScrollArea 组件，实现内容的安全滚动。
 */
export default function NavVertical() {
    return (
		<nav className="h-screen w-layout-nav flex flex-col border-r border-dashed bg-background">
			{/* 后续步骤将在此处添加内容 */}
		</nav>
    )
}
```

现在，我们在 `<nav>` 内部创建 **Logo 区**。这个区域的高度必须严格等于 `h-layout-header` (64px)。

```tsx
// ... (imports)

export function NavVertical() {
	return (
		<nav className="h-screen w-layout-nav flex flex-col border-r border-dashed bg-background">
			
			{/* Logo 区 */}
			{/*
			 * - h-layout-header: 消费头部高度变量 (64px)，实现视觉对齐。
			 * - px-6: 提供水平内边距。
			 * - flex items-center: 确保 Logo 垂直居中。
			 * - [重要] shrink-0: 防止此元素在 flex 布局中被压缩。
			 */ }
			<div className="h-layout-header shrink-0 flex items-center px-6">
					<Logo />
			</div>

			{/* 后续步骤将在此处添加 "菜单区" */}

		</nav>
	);
}
```

最后，我们构建 **菜单区**。这是 `NavVertical` 组件中 **最具技术性的部分**。

**实现思路**：
我们需要让菜单区“填满 `NavVertical` 减去 `Logo 区` (64px) 后的所有剩余空间”，并且“在该空间内部署滚动条”。

1.  我们将创建一个 `<div>` 容器，并使用 `flex-1` 类。这个类会告诉浏览器：“请计算 `Logo 区` 的高度（64px），然后将 `h-screen`（屏幕高度）减去 64px，把所有剩余的空间都分配给这个 `<div>`。”
2.  此时，这个 `flex-1` 的 `<div>` 就有了一个 **确定的、动态计算的高度**（例如 1080px - 64px = 1016px）。
3.  如果这个 `<div>` 内部的内容（即菜单项）超过了 1016px，内容会“溢出”。我们必须添加 `overflow-hidden`。这个类会告诉 `<div>`：“请严格遵守你的 1016px 高度，不要被你的子内容撑开，并把溢出的部分隐藏掉。”
4.  只有当父元素（`flex-1 div`）满足了“**有确定高度**”和“**隐藏溢出内容**”这两个条件时，`ScrollArea` 组件才能正确地接管滚动条，实现内部滚动。

让我们来实现它：

```tsx
// 1. 导入我们在第 10 章创建的 Logo 组件
import Logo from "@/components/brand/Logo";
// 2. 导入我们在 12.3 节构建的 ScrollArea 组件
import { ScrollArea } from "@/components/ui/scrollArea/scroll-area";

export default function NavVertical() {
  return (
    <nav className="h-screen w-layout-nav flex flex-col border-r border-dashed bg-background">
      <div className="h-layout-header shrink-0 flex items-center px-6">
        <Logo />
      </div>

      {/* 菜单区 (可滚动) */}
      {/*
       * - [关键] flex-1: 让这个 div 占据所有剩余的垂直空间。
       * - [关键] overflow-hidden:
       * 这是 ScrollArea (基于 Radix) 正常工作的 *必须* 条件。
       * ScrollArea 的父元素必须有一个确定的高度
       * (由 flex-1 提供) 并且必须裁剪掉溢出的内容。
       */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea orientation="vertical" className="h-full">
          {/* 避免滚动条紧贴菜单项 */}
          <div className="px-4 py-4">
            {/* * (占位符)
             * 在后续章节中，我们将在这里渲染一个
             * 真正的 <NavMenu /> 组件。
             * 我们使用 'h-96' 来模拟长内容，以测试滚动条。
             */}
            <div className="h-96 rounded-md bg-muted p-4 text-muted-foreground">
              (菜单项将在这里渲染)
            </div>
            <div className="mt-4 h-96 rounded-md bg-muted p-4 text-muted-foreground">
              (菜单项将在这里渲染)
            </div>
            <div className="mt-4 h-96 rounded-md bg-muted p-4 text-muted-foreground">
              (菜单T)
            </div>
          </div>
        </ScrollArea>
      </div>
    </nav>
  );
}
```

`DashboardLayout` 的第一个子组件 `NavVertical` 现已构建完成。它正确地消费了我们的全局 CSS 变量，并为未来的菜单项提供了
一个结构稳健、可安全滚动的容器。

---
### 12.4.4. (编码) 任务 3：创建 `Header` 顶部导航栏

`NavVertical` 组件现已完成，它构成了我们 Grid 布局的第 1 列。接下来，我们开始构建 Grid 布局 **第 2 列** 中的 **第一个元素**：`Header` 顶部导航栏。

**职责分析**：
`Header` 组件的核心职责是提供一个固定在主内容区顶部的水平栏，用于承载全局操作（如用户菜单、通知、设置）和上下文信息（如面包屑导航）。

1.  **布局位置**：它在 Grid 第 2 列中，且必须“粘”在视口的顶部（`position: sticky`）。
2.  **视觉对齐**：其高度必须 **严格等于** `h-layout-header` (64px)，以确保与 `NavVertical` 的 Logo 区域在视觉上完美水平对齐。
3.  **视觉效果**：为提升现代感，我们将实现“毛玻璃”效果（`backdrop-blur`），使 `Header` 在主内容区滚动到其下方时，呈现半透明的模糊背景。
4.  **内部结构**：它将使用 Flexbox 布局，划分为左、右两个插槽，为未来添加面包屑和用户菜单做好准备。

**1. (编码) 创建 `src/layouts/dashboard/header.tsx`**

我们在 12.4.1 节中已经通过 `touch` 命令创建了此文件。现在我们开始编写其内容。

首先，添加必要的 React 导入并定义组件函数。

**文件路径**: `src/layouts/dashboard/header.tsx` (新创建)

```tsx
import * as React from 'react';

/**
 * DashboardLayout 的顶部导航栏。
 *
 * 架构职责：
 * 1. 作为 Grid 布局第 2 列中的 *第一个* 元素。
 * 2. 使用 'h-layout-header' (64px) 确保与 NavVertical 的 Logo 区高度一致。
 * 3. 使用 'position: sticky' 和 'top-0' 将其固定在内容区的顶部。
 * 4. 实现 'backdrop-blur' 毛玻璃效果。
 * 5. 内部使用 Flexbox 划分为左/右插槽，为未来组件做准备。
 */
export default function Header() {
	return (
		// 1. 根元素使用 <header> 语义化标签
		<header>
			{/* 2. 内部容器 */}
			<div>
				{/* 3. 左侧插槽 (未来用于面包屑) */}
				<div>(Left Slot: Breadcrumbs)</div>

				{/* 4. 右侧插槽 (未来用于用户菜单、通知) */}
				<div>(Right Slot: Actions)</div>
			</div>
		</header>
	);
}
```

**2. (编码) 应用核心布局与样式**

接下来，我们将为 `<header>` 元素添加 Tailwind 类名，以实现上述的“布局位置”和“视觉对齐”职责。

**文件路径**: `src/layouts/dashboard/header.tsx` (修改)

```tsx
export default function Header() {
    return (
        // [修改] 
        // - h-layout-header: 消费 64px 高度变量。
        // - sticky top-0: 核心！使其"粘"在滚动容器（即 Grid 第 2 列）的顶部。
        // - z-app-bar: 消费我们在 base.ts中定义的 z-index 变量，
        //   确保它浮在内容之上，但在导航栏之下（如果我们使用 'fixed' 布局）。
        // - [重要] shrink-0: 防止此元素在 flex 布局中被压缩（当 Grid 第 2 列为 flex 时）。
        <header className="h-layout-header sticky top-0 z-app-bar shrink-0">
            <div>
                <div>(Left Slot: Breadcrumbs)</div>
                <div>(Right Slot: Actions)</div>
            </div>
        </header>
    );
}
```

**3. (编码) 实现毛玻璃 (Glassmorphism) 效果**

要实现 `backdrop-blur`（毛玻璃）效果，必须满足两个条件：

1.  元素本身必须是 **半透明** 的（例如 `bg-background/80`）。如果背景是 100% 不透明的，就无法“透”过它去模糊背后的内容。
2.  应用 `backdrop-blur-sm` (或 `md`, `lg`) 工具类。

**文件路径**: `src/layouts/dashboard/header.tsx` (修改)

```tsx
// ... (imports)

export default function Header() {
	return (
		<header className="h-layout-header sticky top-0 z-app-bar shrink-0
			
			/* [新增] 毛玻璃效果 */
			/*
			 * 1. bg-background/80: 设置 80% 不透明度的主题背景色。
			 * '80' 是关键，必须半透明。
			 * 2. backdrop-blur-sm: 应用一个小的背景模糊效果。
			 */
			bg-background/80 backdrop-blur-sm"
		>
			<div>
				<div>(Left Slot: Breadcrumbs)</div>
				<div>(Right Slot: Actions)</div>
			</div>
		</header>
	);
}
```

**4. (编码) 完善内部 Flexbox 布局**

最后，我们完成 `Header` 内部的布局。我们将使用 Flexbox 将“左插槽”和“右插槽”推向容器的两端。

**文件路径**: `src/layouts/dashboard/header.tsx` (修改)

```tsx
// ... (imports)

export default function Header() {
	return (
		<header className="h-layout-header sticky top-0 z-header shrink-0 
			bg-background/80 backdrop-blur-sm"
		>
			{/* * [修改] 内部容器
			 * - h-full: 确保它占满 64px 的父高度。
			 * - flex items-center: (垂直) 居中所有子项。
			 * - justify-between: (水平) 将左右插槽推向两端。
			 * - px-6: 提供与 NavVertical 的 Logo 区一致的水平内边距。
			 */ }
			<div className="h-full flex items-center justify-between px-6">

				{/* 3. 左侧插槽 (未来用于面包屑) */}
				<div className="text-sm text-muted-foreground">
					(Left Slot: Breadcrumbs)
				</div>

				{/* 4. 右侧插槽 (未来用于用户菜单、通知) */}
				<div className="text-sm text-muted-foreground">
					(Right Slot: Actions)
				</div>

			</div>
		</header>
	);
}
```

`Header` 组件现已构建完成。它具备了正确的高度、`sticky` 定位和毛玻璃效果，并为未来的功能扩展预留了清晰的插槽。

### 12.4.5. (编码) 任务 4：创建 `MainArea` 内容区

`NavVertical` (Grid 第 1 列) 和 `Header` (Grid 第 2 列的第 1 个元素) 已经构建完成。现在，我们开始构建 `DashboardLayout` 骨架的最后一块拼图：`MainArea`。

**职责分析**：
`MainArea` 是 Grid 布局 **第 2 列** 中的 **第 2 个元素**。它的核心职责是：

1.  **布局定位**：它必须位于 `Header` 之下。
2.  **空间填充**：它必须自动“填满” `Header` 之外的所有剩余垂直空间。
3.  **滚动处理**：它必须是页面内容的 **主要滚动容器**。当页面内容溢出时，滚动条应出现在此元素上，而 `Header` 保持固定在顶部。
4.  **内容渲染**：它必须使用 `<Outlet />` 来渲染当前匹配的子路由，并为 `React.lazy()` 加载的组件提供 `<Suspense>` 回退。

**1. (编码) 创建 `src/layouts/dashboard/main-area.tsx`**

我们在 12.4.1 节中已经创建了此文件。现在，我们来编写其内容。
首先，导入所有必需的依赖项：`Suspense` (用于代码分割)、`Outlet` (用于路由渲染) 以及 `RouteLoading` (我们的加载占位符)。

**文件路径**: `src/layouts/dashboard/main-area.tsx` (新创建)

```tsx
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
// 导入我们在第 11 章创建的路由加载占位符
import RouteLoading from '@/components/loading/route-loading';
```

**2. (编码) 定义组件骨架与路由出口**

接下来，我们定义 `MainArea` 组件，使用语义化的 `<main>` 标签，并在内部设置好 `Suspense` 和 `Outlet`。

```tsx
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { RouteLoading } from '@/components/loading/route-loading';

/**
 * DashboardLayout 的主内容区域。
 *
 * 架构职责：
 * 1. 作为 Grid 布局第 2 列中的 *第二个* 元素，位于 Header 之下。
 * 2. 使用 'flex-1' 占据所有剩余的垂直空间。
 * 3. 使用 'overflow-y-auto' 使其成为页面内容的 唯一 滚动容器。
 * 4. 渲染子路由 (<Outlet />) 并为其提供 Suspense fallback。
 */
export default function MainArea() {
    return (
        <main>
            <Suspense fallback={<RouteLoading />}>
                <Outlet />
            </Suspense>
        </main>
    )
}
```

**3. (编码) 应用核心布局与滚动类**

这是本节最关键的一步。我们将为 `<main>` 标签添加 Tailwind 类，以实现上述的“空间填充”和“滚动处理”职责。

**实现思路**：
在 `12.4.6` 节中，`Header` 和 `MainArea` 将被包裹在一个父级 `div`（Grid 第 2 列）中，该 `div` 会被设置为 `flex flex-col`。

例如：

```tsx
      <div className="col-span-1 flex flex-col">
        <Header />
        <main />
      </div>
```

1.  `Header` 组件已经拥有 `shrink-0` 类，意味着它不会被压缩，并保持其 `h-layout-header` (64px) 的高度。
2.  为了让 `MainArea` 填满所有剩余空间，我们必须为其添加 `flex-1` (等同于 `flex-grow: 1`) 类。

**文件路径**: `src/layouts/dashboard/main-area.tsx` (修改)

```tsx
// ... (imports)


export default function MainArea() {
    return (
        <main className="flex-1">
            <Suspense fallback={<RouteLoading />}>
                <Outlet />
            </Suspense>
        </main>
    )
}
```

`MainArea` 组件现已构建完成。它正确地实现了内容区的空间填充和滚动逻辑，并为所有子路由提供了渲染出口。

至此，`NavVertical`、`Header` 和 `MainArea` 三个核心子组件都已准备就绪。最后一步是将它们在 `DashboardLayout` 的主 `index.tsx` 文件中组装起来。

### 12.4.6. (编码) 任务 5：组装 `DashboardLayout` 主文件

`NavVertical`、`Header` 和 `MainArea` 三个核心子组件都已准备就绪。现在，我们进入本章的最后一步：在 `src/layouts/dashboard/index.tsx` 文件中，将它们组装成一个完整的、由 CSS Grid 驱动的布局。

**职责分析**：
`index.tsx` 是布局的“组装器”。它的职责是：

1.  实现 12.4.1 节中规划的 **CSS Grid 布局**（`grid-cols-[var(--layout-nav-width)_1fr]`）。
2.  将 `<NavVertical />` 放入 Grid 第 1 列。
3.  创建一个“主工作区”容器 (`div`) 并将其放入 Grid 第 2 列。
4.  这个“主工作区”容器将是 **页面滚动容器**（`overflow-y-auto`），并使用 `flex flex-col` 来垂直堆叠 `Header` 和 `MainArea`。

**1. (编码) 导入子组件**

打开我们在 12.4.1 节创建的主布局文件，并导入我们刚刚构建的三个子组件。

**文件路径**: `src/layouts/dashboard/index.tsx` (新创建)

```tsx
import Header from "./header";
import MainArea from "./main-area";
import NavVertical from "./nav/nav-vertical";
```

**2. (编码) 实现 CSS Grid 布局**

接下来，我们定义 `DashboardLayout` 组件，并应用核心的 Grid 布局类。

```tsx
import Header from './header';
import NavVertical from './nav/nav-vertical';
import MainArea from './main-area';

/**
 * DashboardLayout 主布局 "组装器"。
 *
 * 架构职责：
 * 1. 实现 12.4.1 规划的 CSS Grid 布局。
 * 2. 'grid-cols-[var(--layout-nav-width)_1fr]' 定义两列布局。
 * 3. 将 <NavVertical /> 放入第 1 列。
 * 4. 创建一个 "主工作区" 容器 (div) 放入第 2 列。
 * 5. 这个 "主工作区" 容器将是 *滚动容器* (overflow-y-auto)，
 * 并使用 'flex flex-col' 来垂直堆叠 Header 和 MainArea。
 */
export default function DashboardLayout() {
	return (
		// 1. 根容器：CSS Grid 布局
		//    - h-screen: 确保布局占满整个视口高度。
		//    - grid: 启用 Grid 布局。
		//    - grid-cols-[...]:
		//      使用 'var(--layout-nav-width)' (即 260px) 作为第 1 列宽度，
		//      '1fr' (剩余所有空间) 作为第 2 列宽度。
		<div className="grid h-screen grid-cols-[var(--layout-nav-width)_1fr]">
			
			{/* 2. Grid 第 1 列: 垂直导航栏 */}
			<NavVertical />

			{/* 后续步骤将在此处添加 Grid 第 2 列 */}

		</div>
	);
}
```

**3. (编码) 组装主工作区 (滚动容器)**

这是组装阶段最关键的一步。Grid 的第 2 列必须包含 `Header` 和 `MainArea`。为了让 `Header` 的 `sticky` 定位生效，**Grid 第 2 列本身必须是滚动容器**。

**实现思路**：

1.  我们创建一个 `div` 作为 Grid 第 2 列的直接子元素。
2.  为此 `div` 添加 `flex flex-col`，使其内部的 `Header` 和 `MainArea` 垂直堆叠。
3.  为此 `div` 添加 `overflow-y-auto`，使其成为主滚动容器。
4.  `<Header />` (带有 `sticky top-0`) 将“粘”在此 `div` 的顶部。
5.  `<MainArea />` (带有 `flex-1`) 将自动填充此 `div` 中除 `Header` 外的所有剩余空间。

```tsx
// ... (imports)

export default function DashboardLayout() {
	return (
		<div className="grid h-screen grid-cols-[var(--layout-nav-width)_1fr]">
			
			{/* 2. Grid 第 1 列: 垂直导航栏 */}
			<NavVertical />

			{/* 3. Grid 第 2 列: 主工作区 (滚动容器) */}
			{/* * [核心] 'flex flex-col':
			 * 使其内部的 Header 和 MainArea 垂直堆叠。
			 * [核心] 'overflow-y-auto':
			 * 使 *这个* 容器 (Grid 第 2 列) 成为滚动容器。
			 * 这是 'Header' (sticky) 能够生效的 *必要条件*。
			 */ }
			<div className="flex flex-col overflow-y-auto">
				
				{/* 4. 工作区子元素 1: 顶部导航栏 */}
				{/* 'sticky top-0' 将使其"粘"在 *这个* 滚动容器的顶部。 */}
				<Header />

				{/* 5. 工作区子元素 2: 主内容区 */}
				<MainArea />

			</div>
		</div>
	);
}
```

-----

### 12.4.7. (重构) 任务 6：修复 Loading 组件的作用域问题

在完成 `DashboardLayout` 的组装后，我们需要处理一个关键的架构问题：**Suspense 的作用域与 Loading 组件的显示范围**。

**问题分析**：

在我们的初始实现中，存在两个设计缺陷：

1. **Suspense 重复定义**：在 `MyApp.tsx` (根布局) 和 `MainArea.tsx` (内容区) 中都定义了 `Suspense`，这会导致 loading 状态的管理混乱。
2. **Loading 样式错误**：`RouteLoading` 组件使用了 `h-screen w-screen`，这会使 loading 指示器覆盖整个屏幕，包括侧边栏和 Header，而不是仅在主内容区显示。

**架构决策：Loading 应该在哪里显示？**

在企业级应用中，路由切换时的 loading 状态应该 **只在内容区域显示**，而不应该覆盖全局导航和头部。这样做的好处是：

1. **用户体验**：用户始终能看到导航栏，知道自己在应用的哪个位置。
2. **交互一致性**：即使在 loading 状态下，用户仍可以点击导航菜单切换到其他页面。
3. **视觉稳定性**：避免整个 UI 的闪烁，只有内容区在加载，减少视觉干扰。

因此，我们的 **唯一事实来源 (SSOT)** 原则要求：

* `Suspense` **只应该在 `MainArea` 中定义**（内容区的边界）。
* `RouteLoading` **必须适配其父容器的大小**（即 `MainArea`），而非整个视口。

**1. (重构) 修复 `RouteLoading` 组件**

首先，我们需要将 `RouteLoading` 从 "全屏模式" 改为 "容器适配模式"。

**文件路径**: `src/components/loading/route-loading.tsx` (修改)

```tsx
import { Spin } from "antd";

/**
 * 路由切换时的加载状态指示器。
 * 设计为作为 React.Suspense 的 fallback 属性值使用。
 * 它本身不包含任何状态或逻辑,仅负责 UI 展示。
 * 
 * 注意: 此组件会填充其父容器的全部空间 (h-full w-full)。
 * 在 DashboardLayout 中，它只会占据主内容区域 (MainArea)。
 */
function RouteLoading() {
  return (
    <output
      // [关键修改]
      // - h-full w-full: 取代原来的 h-screen w-screen
      // 这使得 loading 只填充父容器 (MainArea)，而非整个视口
      className="flex h-full w-full items-center justify-center"
      aria-label="正在加载..."
    >
      <Spin size="large" />
    </output>
  );
}

export default RouteLoading;
```

**实现解析**：

* **之前 (`h-screen w-screen`)**：loading 会占据整个视口（100vh × 100vw），覆盖侧边栏和 Header。
* **现在 (`h-full w-full`)**：loading 会填充其父元素（`MainArea`）的 100% 高度和宽度。由于 `MainArea` 使用 `flex-1` 占据除 Header 外的所有剩余空间，loading 指示器将精确地显示在内容区域中。

**2. (重构) 移除 `MyApp.tsx` 中的冗余 Suspense**

接下来，我们需要从根布局中移除 `Suspense`，将其职责完全下放到 `MainArea`。

**文件路径**: `src/MyApp.tsx` (修改)

```tsx
import { Outlet } from "react-router-dom";

// 导入项目已有的上下文提供者
import { AntdAdapter } from "@/theme/adapter/antd.adapter";
import { ThemeProvider } from "@/theme/theme-provider";

/**
 * 应用的根组件，同时也作为根路由 '/' 的布局组件。
 * 它负责提供全局上下文 (主题, Antd 配置)
 * 并定义子路由的渲染位置 (<Outlet />)。
 * 
 * 注意: Suspense 的处理已下放到具体的布局组件中 (如 MainArea)，
 * 这样可以确保 loading 状态只在主内容区域显示，而不会覆盖导航栏和 header。
 */
function MyApp() {
  return (
    // [关键修改] 移除了 Suspense 包裹
    // Suspense 现在只存在于 MainArea 中，确保 loading 只在正确的区域显示
    <ThemeProvider adapters={[AntdAdapter]}>
      <Outlet />
    </ThemeProvider>
  );
}
export default MyApp;
```

**实现解析**：

* **之前**：`MyApp` 包含 `Suspense`，这会导致懒加载组件（如 `DashboardLayout`）在加载时触发全屏 loading。
* **现在**：`MyApp` 只负责提供全局上下文（主题、UI 库配置），不处理 loading 状态。所有 loading 逻辑都在 `MainArea` 中统一管理。

**3. (验证) `MainArea` 的 Suspense 保持不变**

我们已经在 12.4.5 节中正确配置了 `MainArea`。让我们再次确认其实现：

**文件路径**: `src/layouts/dashboard/main-area.tsx` (无需修改，仅作确认)

```tsx
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import RouteLoading from '@/components/loading/route-loading';

export default function MainArea() {
    return (
        // flex-1: 确保 MainArea 占据 Header 之外的所有剩余垂直空间
        <main className="flex-1">
            {/* 
             * [验证] Suspense 的正确位置
             * - 它在 MainArea 内部，确保 loading 只在内容区显示
             * - fallback 使用 RouteLoading，现在它会正确地填充 MainArea
             */}
            <Suspense fallback={<RouteLoading />}>
                <Outlet />
            </Suspense>
        </main>
    )
}
```

**架构验证**：

现在我们的 loading 架构符合以下原则：

```
MyApp (ThemeProvider, 无 Suspense)
  └─ DashboardLayout (Grid)
      ├─ NavVertical (侧边栏，始终可见) 
      └─ Column 2
          ├─ Header (sticky, 始终可见)
          └─ MainArea (flex-1, 包含唯一的 Suspense)
              └─ Outlet
                  ↓ (加载中时)
                  RouteLoading (h-full w-full, 只填充 MainArea)
```

至此，我们的 loading 组件已经符合企业级应用的最佳实践：**作用域清晰、视觉稳定、用户体验优先**。

---

## 12.5. 路由集成：应用布局组件

`DashboardLayout` 的骨架和 loading 机制都已就绪，但目前它还没有被路由系统使用。在这个任务中，我们将把 `DashboardLayout` 正确地整合到路由配置中。

**问题分析**：

在我们的初始实现中，存在一个路由架构问题：

* `dashboardRoutes` 数组为空，导致所有页面都没有使用 `DashboardLayout`。
* `mainRoutes` 中直接定义了根路径的 `index` 路由，与 `dashboardRoutes` 职责重叠。

**架构决策：路由的层级与职责划分**

在企业级应用中，路由应该按照 **布局边界** 进行层级划分：

1. **根路径 (`/`)**：应该使用 `DashboardLayout`，因为这是应用的主要功能区。
2. **业务页面**：所有需要侧边栏和头部的页面都应该作为 `DashboardLayout` 的 `children`。
3. **独立页面**：只有不需要布局的页面（如登录页、404）才应该在顶层路由中定义。

**1. (配置) 更新 `dashboardRoutes` 配置**

首先，我们需要将根路径路由移到 `dashboardRoutes` 中，并使用 `DashboardLayout` 作为其布局。

**文件路径**: `src/routes/sections/dashboard.tsx` (修改)

```tsx
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// 动态导入 DashboardLayout
const LazyDashboardLayout = lazy(() => import("@/layouts/dashboard"));

// 动态导入 Welcome 页面
const LazyWelcomePage = lazy(() => import("@/pages/Welcome"));

/**
 * Dashboard 相关的路由配置
 * 
 * 架构职责：
 * 1. 定义所有使用 DashboardLayout 的路由
 * 2. 使用 React.lazy 实现代码分割
 * 3. 将业务页面作为 DashboardLayout 的 children
 */
export const dashboardRoutes: RouteObject[] = [
  {
    // [关键] 根路径使用 DashboardLayout
    path: "/",
    element: <LazyDashboardLayout />,
    children: [
      {
        // [关键] index 路由渲染 Welcome 页面
        // 这将匹配根路径 "/"，并在 DashboardLayout 的 <Outlet /> 中渲染
        index: true,
        element: <LazyWelcomePage />,
      },
      // 未来可以在这里添加更多子路由，例如：
      // {
      //   path: 'dashboard',
      //   element: <LazyDashboardPage />,
      // },
      // {
      //   path: 'users',
      //   element: <LazyUsersPage />,
      // },
    ],
  },
];
```

**实现解析**：

* **路由结构**：我们创建了一个根路径路由 (`path: "/"`)，它使用 `LazyDashboardLayout` 作为布局组件。
* **index 路由**：`index: true` 表示这个路由会匹配父路径（即 `/`），并渲染 `LazyWelcomePage`。
* **代码分割**：所有组件都使用 `lazy()` 动态导入，确保初始加载时只下载必要的代码。
* **可扩展性**：`children` 数组为未来添加更多页面（如 `/dashboard`、`/users`）预留了清晰的位置。

**2. (配置) 更新 `mainRoutes` 配置**

接下来，我们需要从 `mainRoutes` 中移除根路径的 `index` 路由，因为它现在由 `dashboardRoutes` 负责。

**文件路径**: `src/routes/sections/main.tsx` (修改)

```tsx
import { lazy } from "react";
import type { RouteObject } from "react-router-dom";

// 动态导入 404 NotFoundPage 组件
const LazyNotFoundPage = lazy(() => import("@/pages/sys/error/Page404"));

/**
 * 主路由配置
 * 
 * 架构职责：
 * 1. 定义不使用 DashboardLayout 的独立页面
 * 2. 提供 404 回退路由
 * 
 * 注意：根路径 (/) 的 index 路由已移至 dashboardRoutes
 */
export const mainRoutes: RouteObject[] = [
  {
    // 404 Not Found 路由。
    // path: '*' 会匹配所有在其他路由规则中未匹配到的路径。
    // 它必须放在路由配置数组的末尾，以确保优先匹配其他具体路径。
    path: "*",
    element: <LazyNotFoundPage />,
  },
];
```

**实现解析**：

* **职责聚焦**：`mainRoutes` 现在只负责 404 路由和其他独立页面（如未来的登录页）。
* **路由优先级**：由于在 `src/routes/index.tsx` 中，`dashboardRoutes` 会在 `mainRoutes` 之前被合并，根路径 `/` 会优先匹配到 `dashboardRoutes` 中的 `index` 路由。

**3. (验证) 确认路由合并逻辑**

让我们确认 `src/routes/index.tsx` 中的路由合并顺序是否正确。

**文件路径**: `src/routes/index.tsx` (无需修改，仅作确认)

```tsx
// ... (imports)

const rootRoute: RouteObject = {
  path: "/",
  Component: LazyMyApp,
  errorElement: <ErrorBoundary />,
  children: [
    // [验证] 路由合并顺序
    // 1. authRoutes (认证相关路由，优先级最高)
    ...authRoutes,
    // 2. dashboardRoutes (包含根路径的 index 路由)
    ...dashboardRoutes,
    // 3. devRoutes (开发辅助路由)
    ...devRoutes,
    // 4. mainRoutes (404 回退，优先级最低)
    ...mainRoutes,
  ],
};

export const router = createBrowserRouter([rootRoute]);
```

**架构验证**：

现在我们的路由结构如下：

```
MyApp (/)
  ├─ authRoutes (如 /login, /register)
  ├─ DashboardLayout (/)
  │   └─ Welcome (index)
  ├─ devRoutes (如 /dev/mock)
  └─ 404 (*)
```

**路由匹配流程**：

1. 用户访问 `http://localhost:5173/`
2. React Router 遍历 `children` 数组
3. 找到 `dashboardRoutes` 中的 `path: "/"` 路由
4. 渲染 `DashboardLayout`
5. 由于子路由中有 `index: true`，继续渲染 `WelcomePage`
6. `WelcomePage` 在 `MainArea` 的 `<Outlet />` 中显示

**测试验证**：

现在访问以下路径应该得到预期结果：

* `http://localhost:5173/` → 显示 `DashboardLayout` + `WelcomePage`
* `http://localhost:5173/dashboard` → 显示 404（因为我们还没有定义这个路径）
* `http://localhost:5173/any-invalid-path` → 显示 404

如果你想让 `/dashboard` 也显示相同的内容，可以在 `dashboardRoutes` 的 `children` 中添加：

```tsx
{
  path: 'dashboard',
  element: <Navigate to="/" replace />,
}
```

---

至此，我们的 `DashboardLayout` 已经完全整合到路由系统中。它具备了以下企业级特性：

1. **架构清晰**：使用 CSS Grid 实现解耦的布局系统
2. **性能优化**：通过 `React.lazy` 实现代码分割
3. **用户体验**：loading 状态只在内容区显示，不影响全局导航
4. **可维护性**：所有布局尺寸使用 CSS 变量，修改一处即可全局生效
5. **可扩展性**：为未来添加更多页面和功能预留了清晰的扩展点

在下一章中，我们将开始构建导航菜单系统，让 `NavVertical` 中的"菜单区"真正发挥作用。

---

## 12.6. 本章小结与代码入库

在本章中，项目完成了从"能导航"到"有结构"的关键跨越。通过系统性地构建两套核心布局组件和一个关键 UI 组件，为应用建立了稳固的视觉骨架和交互基础。

**核心进展回顾**：

1. **布局策略确立 (12.1)**：深入理解了 React Router v7 的嵌套路由机制与 `<Outlet />` 工作原理，明确了 `SimpleLayout` 与 `DashboardLayout` 的职责边界和应用场景，为后续所有页面的布局模式奠定了理论基础。

2. **SimpleLayout 实现 (12.2)**：构建了第一个生产级布局组件，实现了 `HeaderSimple` 子组件，并通过开发专用的 `/dev` 测试路由验证了布局效果。这个布局为登录、注册等独立页面提供了简洁一致的视觉框架。

3. **ScrollArea 组件封装 (12.3)**：严格遵循 TDD/CDD 工作流，完成了项目中第一个完整的 `src/ui` 组件构建周期。通过封装 `@radix-ui/react-scroll-area`，实现了跨平台一致的、与主题系统深度集成的滚动条体验，为 `DashboardLayout` 的侧边导航做好了准备。

4. **DashboardLayout 骨架 (12.4)**：这是本章的核心成果。我们：
   - 确立了使用 **CSS Grid** 而非传统 `fixed` 定位的现代化布局方案
   - 在 `index.css` 中定义了全局布局 CSS 变量（SSOT 原则）
   - 构建了 `NavVertical`（侧边栏）、`Header`（顶部导航）、`MainArea`（主内容区）三个子组件
   - 在 `index.tsx` 中完成了 Grid 布局的组装，实现了解耦的、易维护的两列布局
   - 修复了 `RouteLoading` 的作用域问题，确保 loading 状态只在主内容区显示

5. **路由系统集成 (12.5)**：重构了 `dashboardRoutes` 和 `mainRoutes` 配置，将根路径 `/` 正确地应用了 `DashboardLayout`，确保了布局边界与路由层级的一致性。现在访问 `/` 可以看到完整的仪表盘布局效果。

**架构里程碑**：

通过本章的工作，`Prorise-Admin` 现在拥有了：

- ✅ **两套生产级布局**：`SimpleLayout` 和 `DashboardLayout`，职责清晰
- ✅ **一个可复用的 UI 组件**：`ScrollArea`，完整的 TDD/CDD/Docs 闭环
- ✅ **企业级的 CSS 架构**：布局变量集中管理，主题系统深度集成
- ✅ **现代化的布局技术**：CSS Grid + Flexbox，声明式、高性能
- ✅ **优化的用户体验**：Loading 作用域精确控制，Header 毛玻璃效果

这些基础设施将支撑后续所有业务页面的开发，为用户提供一致、流畅的操作体验。

-----

**代码入库**

将本章的所有成果提交到版本控制系统。

**1. 检查代码状态**：

```bash
git status
```

(应包含 `src/index.css`, `tailwind.config.ts`, `src/layouts/simple/index.tsx`, `src/layouts/components/header-simple.tsx`, `src/layouts/dashboard/index.tsx`, `src/layouts/dashboard/nav/nav-vertical.tsx`, `src/layouts/dashboard/header.tsx`, `src/layouts/dashboard/main-area.tsx`, `src/components/ui/scrollArea/*`, `src/components/dev/MockPage.tsx`, `src/components/loading/route-loading.tsx`, `src/MyApp.tsx`, `src/routes/sections/dashboard.tsx`, `src/routes/sections/main.tsx`, `src/routes/sections/dev.tsx` 等文件的变更。)

**2. 暂存所有变更**：

```bash
git add .
```

**3. 执行提交**：

```bash
git commit -m "feat(layouts): implement SimpleLayout & DashboardLayout with CSS Grid architecture" -m "- Add SimpleLayout with HeaderSimple for standalone pages" -m "- Implement ScrollArea component following TDD/CDD workflow" -m "- Build DashboardLayout with NavVertical, Header, and MainArea" -m "- Define global layout CSS variables in index.css" -m "- Fix RouteLoading scope to display only in content area" -m "- Integrate layouts with route system (dashboardRoutes)" -m "- Add dev routes for layout testing in development mode"
```

**第十二章已圆满完成！** 项目的视觉骨架已经建立，为后续的功能开发（导航菜单、用户管理、权限系统等）提供了坚实的基础。

-----
