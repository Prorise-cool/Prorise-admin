
---

# 第十三章. 导航菜单：数据驱动与动态渲染

在第十二章中，我们成功构建了 `DashboardLayout` 的基本结构。我们特别在 `src/layouts/dashboard/nav/nav-vertical.tsx` 中，利用 `flex-1` 和 `ScrollArea` 创造了一个结构化、可滚动的菜单容器。

然而，目前这个容器中仅为占位符 `div` 元素。

本章的核心任务，是使用一个功能完备、数据驱动、且支持递归嵌套的菜单系统来填充该容器。

这是企业级 Admin 应用的一项核心功能。它的实现不仅仅是 UI 渲染，更是一个集成了 **类型定义、数据模拟、状态管理、组件封装** 和 **路由集成** 的综合性工程。我们将深入探讨如何将路由数据、状态管理和 UI 组件进行有效的解耦与组合。

## 13.1. 任务 13.1：定义菜单 Types

在编写任何 UI 代码 (`<NavMenu />`) 或数据 (`menuData`) 之前，必须先解决一个基础的架构问题：

**“数据”层和“UI”层之间，如何建立可靠的通信机制？**

如果 `NavMenu` 组件需要一个 `title` 属性，而数据源提供的是 `label`，系统将无法正确渲染。如果数据源增加了一个新属性（例如“徽章”），UI 组件如何感知并处理这个新属性？

答案是，我们必须在开发之初，定义一份 **“契约” (Contract)**。

### 13.1.1. 架构理念：“契约优先”

“契约优先”是源于软件工程（尤其是在微服务架构中）的一项核心理念，它要求在编写任何实现代码之前，首先定义系统各部分之间的 **通信接口**。

*   在后端，这通常体现为 `OpenAPI (Swagger)` 规范，它定义了 API 的端点、请求及响应的数据结构。
*   在前端，这份“契约”即是我们的 **TypeScript 类型与接口**。

在 `Prorise-Admin` 项目中，遵循此理念至关重要。这份“契约”将成为连接 **数据层（`_mock` 或 API）、状态层（`useNavigation` 钩子）和视图层（`NavMenu` 组件）** 的唯一蓝图。

**此方法的重要性体现在以下两点：**

1.  **解耦与并行开发 (Decoupling)**

    一旦这份“契约” (`src/types/router.ts`) 被定义，项目的不同部分就可以并行开发而互不阻塞。例如，负责数据实现的开发者可以开始编写 `src/_mock/menu.ts`，其唯一目标是确保导出的数据符合契约类型；负责 UI 的开发者可以在 `Storybook` 中构建 `NavItem` 组件，其唯一的依赖是契约中定义的 `Props` 接口；负责业务逻辑的开发者可以编写 `useNavigation` 钩子，因为他们明确知道状态管理所依赖的 `key` 是契约中定义的 `string` 类型。最后，当我们将三者集成时，它们将无缝协作，因为它们都基于同一份蓝图构建。

2.  **可维护性与重构安全**

    设想未来的需求变更：“在所有一级菜单项旁显示一个彩色的徽章(Badge)”。通过“契约优先”的模式，处理流程将变得清晰且安全。

| 对比项 | 无契约的开发模式 | 采用“契约优先”的开发模式 |
| :--- | :--- | :--- |
| **第一步** | 猜测所有可能渲染菜单的组件（`NavMenu.tsx`, `MobileNav.tsx`, ...），并进入每个文件手动修改。 | **修改契约**：在 `src/types/router.ts` 的 `RouteMeta` 接口中，添加 `badge?: { text: string; color: string; }`。 |
| **后续步骤** | 手动检查和修改，极易因遗漏而产生 Bug。 | **静态检查驱动**：TypeScript 的静态分析将自动在所有使用了该契约但未实现新属性的地方报告编译错误。 |
| **结果** | 重构过程风险高，维护成本大。 | 获得一个清晰的修改清单，确保重构的安全性和完整性。 |

### 13.1.2. 现状分析：React Router v7 的 `RouteObject`

在定义新类型之前，必须先审视项目中的现有资产。我们在第十一章集成了 `react-router-dom`，它提供了一个核心类型：`RouteObject`。

一个基础的 `RouteObject` 结构如下所示：

```typescript
// React Router 官方类型 (简化版)
interface RouteObject {
    path?: string;
    element?: React.ReactNode;
    children?: RouteObject[];
    loader?: LoaderFunction;
    action?: ActionFunction;
    // ... 其他路由相关属性
}
```

**我们能否直接使用 `RouteObject[]` 来渲染菜单？**

**答案是否定的。**

`RouteObject` 类型专为 **路由匹配、数据加载和页面渲染** 设计。它关注的是 `path` 与 `element` 的映射关系，以及加载时应调用的 `loader` 函数。

它并未包含任何 UI 表现层所需的信息，这引发了一系列关键问题：

1.  `RouteObject` 如何告知 UI 组件菜单项应显示的 **文本标签**？（缺少 `label` 属性）
2.  `RouteObject` 如何告知 UI 组件菜单项应显示的 **图标**？（缺少 `icon` 属性）
3.  如果一个路由（例如 `/users/:id/details`）必须在系统中注册以供页面跳转，但 **不应在导航菜单中显示**，`RouteObject` 如何表达此意图？（缺少 `hideMenu` 属性）
4.  如果我们需要对菜单项进行 **排序**（例如“Dashboard”总是在顶部），`RouteObject` 并未提供 `order` 属性。

### 13.1.3. 架构决策：分离 VS 增强

我们面临一个关键的架构决策：

**方案一：创建全新的、分离的 `MenuObject` 类型 (解耦模式)**

我们可以创建一个与 `RouteObject` 完全无关的新类型：

```typescript
// 方案一：完全分离的类型
interface MenuObject {
    key: string;
    label: string;
    icon?: ReactNode;
    path: string;
    children?: MenuObject[];
}
```

*   **优点**：类型定义清晰。菜单系统只包含其关心的数据，与路由系统的复杂性（如 `loader`, `action`）完全解耦。
*   **缺点**：**导致严重的数据冗余**。我们将被迫在项目中维护两套相似的树状结构：一套 `RouteObject[]` 用于 `createBrowserRouter`，另一套 `MenuObject[]` 用于 `<NavMenu />`。每次新增页面，都需要在两个文件中同步修改，这是低效且易于出错的。

**方案二：“增强” (Enhance) 原生的 `RouteObject` (集成模式)**

这是在企业级项目中更有效且被广泛采用的最佳实践。

*   **核心思想**：项目中的路由配置本身就应该是“唯一事实来源” (SSOT)。这份配置数据必须 **同时驱动** 路由系统和导航菜单系统。
*   **实现策略**：
    1.  我们不创建全新的对象，而是 **“增强”** `RouteObject`。
    2.  创建一个独立的 `RouteMeta` 接口，专门存放所有 `RouteObject` 不关心的 UI 和业务元数据（如 `label`, `icon`, `hideMenu`）。
    3.  创建一个我们自己的路由类型 `AppRouteObject`。
    4.  `AppRouteObject` 将 **继承** `RouteObject` 的所有属性（`path`, `element` 等），并额外 **附加** 一个 `meta?: RouteMeta` 属性。

这种模式的优势在于：我们仅需维护一份 `AppRouteObject[]` 数据。`createBrowserRouter` 会消费它的 `path` 和 `element` 属性，而 `<NavMenu />` 组件则消费它的 `meta` 和 `children` 属性。**这统一了数据源。**


### 13.1.4. 渐进式构建 `src/types/router.ts` (重写版)

我们选择 **方案二：增强模式**。现在，开始编写这份服务于导航菜单的、精准的“契约”。

**第一步：创建文件结构**

在 `src/` 目录下创建 `types` 目录，用于存放所有全局领域模型的类型定义。

```bash
# 在 src 目录下创建 types 文件夹
mkdir -p src/types

# 在 types 文件夹内创建 router.ts 文件
touch src/types/router.ts
```

**第二步：定义 `RouteMeta` (UI 契约)**

打开 `src/types/router.ts`，导入所需类型。

```typescript
// src/types/router.ts

import type { ReactNode } from 'react';
import type { Params, RouteObject } from 'react-router-dom';
```

接下来，我们定义 `RouteMeta` 接口。此接口 **只包含** 当前构建导航菜单所必需的属性。

```typescript
// src/types/router.ts (续)

/**
 * 路由元数据 (Route Metadata)
 * 此接口用于存放与 UI 渲染和业务逻辑相关的附加信息，与 React Router 的
 * 核心路由属性 (path, element) 完全解耦。导航菜单组件将直接消费此 meta 对象。
 */
export interface RouteMeta {
	/**
	 * 唯一键 (Unique Key)
	 *
	 * 作用：
	 * 1. React 渲染：作为列表渲染 (map) 时的 `key` prop，是 React 高效更新所必需的。
	 * 2. 状态管理：当用户点击或展开菜单项时，需要一个唯一的、稳定的标识符来记录
	 *    当前激活或展开的菜单项。
	 *
	 * `path` 属性（如 `/users/:id`）因包含动态参数而不够稳定，不适合用作 key。
	 */
	key: string;

	/**
	 * 菜单标签 (Label)
	 *
	 * 定义为 `string` 类型是为了支持国际化 (i18n)。
	 * 国际化库通常使用字符串键 (如 'menu.dashboard.analysis') 来查找译文。
	 */
	label: string;

	/**
	 * 菜单图标 (Icon)
	 *
	 * 定义为 `ReactNode` 是一个关键的解耦决策。它允许数据层传递一个完整的
	 * React 元素（如 `<Icon icon="ic-dashboard" />`），而无需与图标组件的具体实现
	 * (如组件名、props) 发生耦合。这实现了清晰的关注点分离。
	 */
	icon?: ReactNode;

	/**
	 * 在菜单中隐藏 (Hide in Menu)
	 * 这是一个关键的业务属性。许多页面（如用户详情页 `/users/123`）
	 * 必须在路由系统中注册才能被访问，但绝不应出现在导航菜单中。
	 * `hideMenu: true` 是导航菜单组件跳过渲染此项的依据。
	 */
	hideMenu?: boolean;

	/**
	 * 菜单项是否禁用 (Disabled)
	 * 用于基于特定条件（如用户权限）显示但禁用点击的菜单项。
	 */
	disabled?: boolean;

	/**
	 * 动态路由参数 (Params)
	 * 用于存储动态路由的示例参数（如 `/user/:id`），
	 * 以便菜单项能导航到一个具体的示例页面（如 `/user/123`）。
	 */
	params?: Params<string>	;
}
```

**第三步：定义 `AppRouteObject` (路由连接器)**

现在，我们将 `RouteMeta` 附加到 `RouteObject` 上，创建出项目专属的路由对象 `AppRouteObject`。

```typescript
// src/types/router.ts (续)

/**
 * 应用程序路由对象 (AppRouteObject)
 *
 * 这是 Prorise-Admin 中唯一的路由数据结构，是系统的“唯一事实来源”。
 * 它通过 TypeScript 交叉类型，整合了 React Router 的路由功能和自定义的元数据功能。
 */
export type AppRouteObject = {
	/**
	 * 菜单排序 (Order)
	 * 用于菜单项的显示排序，数值越小越靠前。
	 */
	order?: number;

	/**
	 * 路由元数据
	 * 将上面定义的 `RouteMeta` 附加到路由对象上。
	 * React Router 会忽略此属性，而我们的 UI 系统会专门消费它。
	 */
	meta?: RouteMeta;

	/**
	 * 子路由 (Children)
	 * 我们在此处覆盖了 React Router 原生的 `children` 属性。原生的 `children`
	 * 类型是 `RouteObject[]`，我们将其强制指定为 `AppRouteObject[]`，
	 * 从而确保子路由也必须遵循我们的自定义结构，使类型检查可以深入到无限层级。
	 */
	children?: AppRouteObject[];

} & Omit<RouteObject, 'children'>;

/*
 * 类型解读：
 *
 * `Omit<RouteObject, 'children'>`
 * - `Omit` 是一个 TypeScript 工具类型，它会基于 `RouteObject` 创建一个新类型，
 *   但会忽略掉 `children` 属性。
 *
 * `... & Omit<...>`
 * - `&` (交叉类型) 用于将多个类型合并为一个。
 * - 最终的 `AppRouteObject` 类型 = 
 *   {我们自定义的属性 (order, meta, children)} 
 *   + {`RouteObject` 中除了 children 之外的所有属性}
 *
 * 最终结果：
 * `AppRouteObject` 既是一个可被 `createBrowserRouter` 消费的合法路由对象，
 * 同时又是一个携带了我们所有 UI 元数据的、可安全递归的自定义对象。
 */
```

---
## **13.2 API 模拟准备 - 安装与配置 MSW**

在 **任务 13.1** 中，我们定义了前端 UI 期待的数据“契约” `AppRouteObject`。在真实世界中，这些数据总是通过异步网络请求从后端获取。

为了模拟这一真实流程，并让我们的前端代码从一开始就具备处理网络请求、加载和错误状态的能力，我们需要一个 API 模拟工具。本章，我们将安装并配置 Mock Service Worker (MSW)。

### **13.2.1. 架构决策：为何模拟 API 而非静态导入？**

*   **生产环境考量**：若在代码中直接 `import` 模拟数据，这些数据将被打包进最终的生产文件，不必要地增大了用户需要下载的文件体积。
*   **真实工作流**：应用程序总是通过异步网络请求（如 `fetch`）获取数据。模拟 API 可以强制我们从一开始就处理 `loading`, `error` 等真实世界中的异步状态。
*   **前后端解耦**：前端组件只需知道它要请求 `GET /api/menu` 这个端点。它不关心也不需要关心响应是由 MSW 提供的，还是由真实的后端服务提供的。这使得前后端可以并行开发。

### **13.2.2. (编码) 安装 MSW 依赖**

首先，我们将 `msw` 作为开发依赖项（`-D`）安装到项目中。

```bash
pnpm add msw -D
```

### **13.2.3. (编码) 添加 MSW 初始化脚本**

MSW 需要一个 Service Worker 文件来在浏览器网络层拦截请求。我们可以通过其命令行工具自动生成此文件。为此，需要在 `package.json` 中添加一个脚本。

打开 `package.json` 文件，在 `scripts` 部分添加 `"msw:init"` 脚本：

```json
// package.json

{
  "name": "slash-admin",
  "private": true,
  "version": "0.0.0",
  // ... 其他内容 ...
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "preinstall": "lefthook install",
    "msw:init": "msw init public/ --save" // <--- 新增此行
  },
  // ... 其他依赖 ...
}
```
**代码解析**：
`"msw:init": "msw init public/ --save"` 这行命令告诉 MSW：
*   `init`: 执行初始化操作。
*   `public/`: 将 Service Worker 脚本 `mockServiceWorker.js` 生成在 `public` 目录下。这是因为 `public` 目录下的所有文件在构建时都会被直接复制到输出目录的根路径，确保浏览器可以访问到它。
*   `--save`: 这是一个安全选项，确保只在 `package.json` 中 `msw` 依赖项存在时才执行。

### **13.2.4. (操作) 生成 Service Worker 文件**

在终端中执行我们刚刚添加的脚本。

```bash
pnpm msw:init
```

执行后，您会看到 `public` 文件夹下出现了一个新的文件 `mockServiceWorker.js`。至此，MSW 的基础环境已经准备就绪。

### **13.2.5. 任务小结**

在本章中，我们明确了使用 API 模拟的必要性，并完成了 MSW 的安装与初始化。我们的项目现在已经具备了在网络层拦截请求的能力，但我们还没有告诉它要拦截哪些请求以及如何响应。

在下一章，我们将定义后端返回数据的“原始”类型契约。

---
你提的这一点非常非常关键！你完全说对了。

一个好的教程不应该是“跟着我做”的命令清单，而应该是“跟我一起思考”的探索过程。**“先有思路，后有实现”**，这才是能真正让人学到东西的方法。我们不应该只是“跟着敲代码”，而应该“理解了再动“。

我非常乐意按照这个\*\*“先讲解铺垫，后编码实现”\*\*的思路，来重新组织这篇笔记。让我们用引导读者思考“为什么”的方式来重写它。

-----

## **13.3 定义后端数据契约与原始数据**

在上一章中，我们准备好了 MSW 的基础环境。现在，我们需要为 MSW 提供“弹药”——即它将要返回的模拟数据。

**在动手编码之前，我们先来聊聊“为什么”**

我们要模拟后端 API，就必须像一个 **后端工程师** 一样思考。对于后端来说，提供数据有两条生命线：

1.  **数据的“状态”是约定好的**：比如，用什么数字代表“成功”？用什么数字代表“登录超时”？这是前后端必须遵守的“通信暗号”。
2.  **数据的“结构”是固定的**：比如，一个“菜单”对象有哪些字段（`id`, `name` 等）？这些字段是什么类型？这是数据库表结构决定的。

因此，我们的整个过程将分为两步，完全模拟这个思路：

1.  **定义“契约” (The Contract)**：我们首先要用 TypeScript 来定义这些“暗号”（`enum.ts`）和“结构”（`entity.ts`）。这份契约将保证前端和模拟后端（MSW）都遵循同一套标准。
2.  **创建“原材料” (The Raw Material)**：有了契约，我们再创建一份符合这个契约的“原始”模拟数据（`assets.ts`）。

好，有了这个蓝图，我们开始第一步：定义“通信暗号”。

### **13.3.1. 设计思路：通用的 “状态约定” (enum.ts)**

在项目中，有很多地方需要用到“状态”。比如 API 响应状态、菜单类型。如果我们不统一管理，A 程序员可能用 `1` 代表成功，B 程序员可能用 `200`，这就乱套了。

所以，我们首先要创建 `src/types/enum.ts` 文件，把这些全局通用的、常量性质的“约定”放在一起。

#### 1\. API 响应状态 (ResultStatus)

第一个约定是 `ResultStatus`。

**思考：** 你可能会想，HTTP 状态码 `200` 不就代表成功吗？为什么还要自己定义 `SUCCESS = 0`？

**答案：** 这是企业级项目中一种非常主流的设计模式，它区分了 **“HTTP 状态”** 和 **“业务状态”**。

  * **HTTP 状态**：由 Web 服务器（Nginx、Node.js）返回，代表网络请求的死活。`200` 只代表“服务器成功收到了你的请求，并成功返回了响应”，它不关心业务是成功还是失败。
  * **业务状态**：由后端代码逻辑返回，存在于 JSON 数据体（`{ code: 0, ... }`）中，代表业务逻辑是否成功。

在这种模式下，即使用户名密码错误，后端也倾向于返回 **HTTP 200**，然后在 JSON 中返回 `{ "code": -1, "message": "密码错误" }`。

  * **为什么 `SUCCESS = 0`？** 这是继承自 C 语言和 Unix 系统的古老约定：`0` 代表“程序正常，无错误”。
  * **为什么 `TIMEOUT = 401`？** 这里的 `401` **不是** HTTP 401。这是后端在“**借用**” HTTP 401 (Unauthorized) 的概念，在业务层面（JSON 的 `code` 字段）告诉前端：“你的登录凭证（Token）已过期”。

#### 2\. 菜单节点类型 (PermissionType)

第二个约定是 `PermissionType`。

**思考：** 菜单不就是一层一层的列表吗？为什么需要三种类型？

**答案：** 这是为了在“数据结构”层面实现一个灵活的、可无限嵌套的菜单系统。这三种类型分别扮演不同的角色：

  * `MENU = 2` (菜单)：**“叶子”**。这是用户 **真正可以点击并导航到页面** 的链接，如“用户管理”。
  * `CATALOGUE = 1` (目录)：**“树枝”**。这是“文件夹”，它本身通常 **不可点击**，它的唯一作用就是“容纳”其他的 `MENU` 或 `CATALOGUE`。
  * `GROUP = 0` (组)：**“根”或“逻辑分组”**。这通常是侧边栏中用于视觉分隔的“标题”，比如“仪表盘”、“系统管理”。它也是不可点击的。

理解了这些“暗号”的设计思路后，我们就可以创建文件并写入代码了。

#### (编码) 实现 enum.ts

```bash
# 如果 src/types 目录不存在
mkdir -p src/types

# 创建 enum.ts 文件
touch src/types/enum.ts
```

现在，打开 `src/types/enum.ts` 文件并写入我们刚刚讨论过的约定：

```typescript
// src/types/enum.ts

export enum ResultStatus {
	SUCCESS = 0,
	ERROR = -1,
	TIMEOUT = 401,
}

export enum PermissionType {
	GROUP = 0,
	CATALOGUE = 1,
	MENU = 2,
}
```

-----

### **13.3.2. 设计思路：描述 “数据实体” (entity.ts)**

“暗号”约定好了，我们来定义“数据结构”。我们需要一个 TypeScript 接口（`interface`）来精确描述：**一个菜单项从后端返回时，到底“长什么样”？**

这个“长什么样”的定义，我们称为“实体”（`Entity`），它通常 **完全对应** 后端数据库表中的字段。

**思考：** 在定义这个 `MenuEntity` 接口时，我们必须考虑以下几个关键点：

1.  **如何体现层级关系？** 后端数据库查出的数据是“扁平”的列表，没有 `children` 字段。我们必须依赖一个 `parentId` 字段，来标识“谁是谁的子节点”。这是前端将其“组装”成树状结构的核心线索。
2.  **所有字段都是必需的吗？** 显然不是。根据我们 13.3.1 的讨论，`GROUP` 和 `CATALOGUE` 只是“目录”，它们没有自己的页面，所以它们不需要 `path` (路由路径) 和 `component` (组件路径)。只有 `MENU` 才需要。

基于这些思考，我们的 `MenuEntity` 接口就清晰了：它必须包含 `id` 和 `parentId`，并且 `path` 和 `component` 必须是可选的 (`?`)。

#### (编码) 实现 entity.ts

首先，创建 `src/types/entity.ts` 文件。

```bash
touch src/types/entity.ts
```

打开该文件，引入 `PermissionType`（因为菜单实体会用到它），然后定义 `MenuEntity` 接口。

```typescript
// src/types/entity.ts

import type { PermissionType } from "./enum";

/**
 * 后端返回的菜单项实体类型
 * 这代表了从 API 接收到的“原始”数据结构。
 */
export interface MenuEntity {
	/**
	 * 唯一 ID
	 */
	id: string;

	/**
	 * 父级 ID，用于构建树状结构。
	 * (如果 parentId 为空字符串或 null，代表它是根节点)
	 */
	parentId: string;

	/**
	 * 菜单名称/标签 (通常是 i18n 键)
	 */
	name: string;
	
	/**
	 * 菜单类型: GROUP, CATALOGUE, 或 MENU
	 * (这里用到了我们定义的枚举)
	 */
	type: PermissionType;

	/**
	 * 路由路径 (可选, GROUP/CATALOGUE 类型没有)
	 */
	path?: string;

	/**
	 * 前端组件的路径 (可选, GROUP/CATALOGUE 类型没有)
	 */
	component?: string;

	/**
	 * 图标名称
	 */
	icon?: string;

	/**
	 * 显示顺序
	 */
	order?: number;
}
```

-----

### **13.3.3. 设计思路：模拟 “扁平的” 原始数据 (assets.ts)**

现在，“契约”（`enum` 和 `entity`）都准备好了。最后一步是创建一份遵循该契约的“原材料”（模拟数据）。

**思考：** 这份模拟数据应该是什么形态？是“树状结构”（带 `children`）还是“扁平列表”？

**答案：** 必须是\*\*“扁平列表”\*\*！

**为什么？** 因为这才是 **最真实** 的后端形态。后端从数据库（一张二维表）中 `SELECT * FROM menus` 查出来的，就是一个 **一级数组**。

前端的核心职责之一，就是拿到这个“扁平的” `RAW_MENU_DATA`，然后通过 `parentId` 字段，在内存中动态地将它“组装”成带 `children` 的树形结构，最后再交给 UI 组件（如 Ant Design Menu）去渲染。

所以，我们的模拟数据必须是扁平的，并且要能覆盖所有场景（`GROUP`, `CATALOGUE`, `MENU` 以及三级嵌套）。

#### (编码) 实现 assets.ts

首先，创建 `src/_mock/assets.ts` 文件。

```bash
touch src/_mock/assets.ts
```

打开 `src/_mock/assets.ts`，引入我们需要的类型，并定义 `RAW_MENU_DATA` 数组。

```typescript
// src/_mock/assets.ts

import { MenuEntity } from '@/types/entity';
import { PermissionType } from '@/types/enum';

// 解构枚举，让下面的数据定义更清晰
const { GROUP, MENU, CATALOGUE } = PermissionType;

/**
 * 模拟从数据库中直接查询出的原始数据 (扁平结构)
 */
export const RAW_MENU_DATA: MenuEntity[] = [
	// --- 仪表盘分组 ---
	// 这是一个 GROUP (parentId 为空)，它是根节点
	{ id: 'group_dashboard', parentId: '', name: 'sys.nav.dashboard', type: GROUP, order: 1 },
	
	// 这是一个 MENU，它的 parentId 指向了上面的 GROUP
	{ id: 'workbench', parentId: 'group_dashboard', name: 'sys.nav.workbench', icon: 'solar:widget-bold-duotone', type: MENU, path: '/workbench', component: '/dashboard/workbench/index.tsx', order: 1 },
	{ id: 'analysis', parentId: 'group_dashboard', name: 'sys.nav.analysis', icon: 'solar:chart-bold-duotone', type: MENU, path: '/analysis', component: '/dashboard/analysis/index.tsx', order: 2 },

	// --- 系统管理分组 ---
	// 这是另一个 GROUP
	{ id: 'group_management', parentId: '', name: 'sys.nav.management', type: GROUP, order: 2 },
	
	// 这是一个 CATALOGUE (目录)，它指向 "group_management"
	{ id: 'management_system', parentId: 'group_management', name: 'sys.nav.system.index', icon: 'solar:settings-bold-duotone', type: CATALOGUE, path: '/system', order: 1 },
	
	// 这两个是 MENU，它们指向 "management_system"，实现了三级嵌套
	{ id: 'management_system_user', parentId: 'management_system', name: 'sys.nav.system.user', type: MENU, path: '/system/user', component: '/management/system/user/index.tsx', order: 1 },
	{ id: 'management_system_role', parentId: 'management_system', name: 'sys.nav.system.role', type: MENU, path: '/system/role', component: '/management/system/role/index.tsx', order: 2 },
];
```

**代码解析**：

  * **扁平化结构**: 再次强调，所有数据项都在同一个数组中。层级关系 **仅通过 `parentId` 字段维系**。
  * **数据代表性**: 这份数据完美覆盖了我们的所有设计：
      * `GROUP`: (group\_dashboard)
      * `CATALOGUE`: (management\_system)
      * `MENU`: (workbench, management\_system\_user)
      * * *三级嵌套**: `group_management` -\> `management_system` -\> `management_system_user`
  * 这份数据为我们后续测试“扁平转树”的算法和组件的递归渲染提供了充足的场景。

### **13.3.4. 任务小结**

我们已经完成了数据准备工作。

通过“先思考设计，后编码实现”的方式，我们创建了后端数据的“契约” (`enum.ts`, `entity.ts`)，并创建了一份遵循该契约的、高度仿真的扁平化原始数据集 (`assets.ts`)。

有了这份“原始材料”，我们就可以在下一章中创建一个 API 端点，它将负责处理这份数据并将其返回给前端。

## **13.4 创建 MSW 接口处理器**

在上一章，我们准备好了“原始”的扁平化菜单数据。现在，我们需要创建一个 MSW 处理器 (Handler) 来模拟一个真实的 API 端点。

这个处理器的职责是：
1.  定义一个 API 路由，例如 `GET /api/menu`。
2.  当这个路由被请求时，读取我们创建的扁平数据。
3.  将扁平数据转换为前端更易于使用的树状结构。
4.  将转换后的树状数据包装成一个标准的 API 响应格式并返回。

扁平数据与树状数据的区别在于数据的组织结构。扁平数据通常是指那些没有嵌套结构的数据，它们以列表或数组的形式出现，每个元素都是独立的，没有层级关系。而树状数据则具有嵌套结构，类似于树形结构，其中每个元素都可以有子元素，形成层级关系。

例如我们期望将如下的扁平数据：

```json
[
  {
    "id": "group_management",
    "parentId": "",
    "name": "sys.nav.management",
    "type": "GROUP",
    "order": 2
  },
  {
    "id": "management_system",
    "parentId": "group_management",
    "name": "sys.nav.system.index",
    "icon": "solar:settings-bold-duotone",
    "type": "CATALOGUE",
    "path": "/system",
    "order": 1
  },
  {
    "id": "management_system_user",
    "parentId": "management_system",
    "name": "sys.nav.system.user",
    "type": "MENU",
    "path": "/system/user",
    "component": "/management/system/user/index.tsx",
    "order": 1
  },
  {
    "id": "management_system_role",
    "parentId": "management_system",
    "name": "sys.nav.system.role",
    "type": "MENU",
    "path": "/system/role",
    "component": "/management/system/role/index.tsx",
    "order": 2
  }
]
```

转化为如下的树形数据：

```json
[
  {
    "id": "group_management",
    "parentId": "",
    "name": "sys.nav.management",
    "type": "GROUP",
    "order": 2,
    "children": [
      {
        "id": "management_system",
        "parentId": "group_management",
        "name": "sys.nav.system.index",
        "icon": "solar:settings-bold-duotone",
        "type": "CATALOGUE",
        "path": "/system",
        "order": 1,
        "children": [
          {
            "id": "management_system_user",
            "parentId": "management_system",
            "name": "sys.nav.system.user",
            "type": "MENU",
            "path": "/system/user",
            "component": "/management/system/user/index.tsx",
            "order": 1,
            "children": []
          },
          {
            "id": "management_system_role",
            "parentId": "management_system",
            "name": "sys.nav.system.role",
            "type": "MENU",
            "path": "/system/role",
            "component": "/management/system/role/index.tsx",
            "order": 2,
            "children": []
          }
        ]
      }
    ]
  }
]
```

### **13.4.1. (编码) 创建数据转换工具 (tree.ts)**

为了将扁平数据转换为树状结构，我们需要一个工具函数。我们将在 `src/utils` 目录下创建这个函数。

首先，创建目录和文件。

```bash
# 创建 utils 目录
mkdir -p src/utils

# 创建 tree.ts 文件
touch src/utils/tree.ts
```

现在，打开 `src/utils/tree.ts` 文件并写入以下 `convertFlatToTree` 函数。

```typescript
// src/utils/tree.ts

// 定义一个通用的树节点接口，要求每个节点必须有 id 和 parentId
export interface TreeNode {
	id: string;
	parentId: string;
	children?: TreeNode[];
}
```

接下来，我们编写核心的转换函数。它使用 Map 数据结构来高效地查找父节点，分两步完成转换。

```typescript
// src/utils/tree.ts (续)

/**
 * 将扁平的数组结构转换为树状结构
 * @param flatList 具有 id 和 parentId 的扁平数组
 * @returns 树状结构的根节点数组
 */
export function convertFlatToTree<T extends TreeNode>(
	flatList: T[],
): T[] {
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
```

### **13.4.2. (编码) 创建菜单 API 处理器 (_menu.ts)**

有了数据转换工具，我们现在可以创建 API 处理器了。按照约定，所有 MSW 处理器都放在 `src/_mock/handlers` 目录下。

首先，创建目录和文件。
```bash
# 创建 handlers 目录
mkdir -p src/_mock/handlers

# 创建 _menu.ts 文件
touch src/_mock/handlers/_menu.ts
```

打开 `src/_mock/handlers/_menu.ts` 文件，引入我们需要的模块。
```typescript
// src/_mock/handlers/_menu.ts

import { http, HttpResponse } from 'msw';

import { RAW_MENU_DATA } from '../assets';
import { ResultStatus } from '@/types/enum';
import { convertFlatToTree } from '@/utils/tree';
```

现在，我们定义 `menuList` 处理器。
```typescript
// src/_mock/handlers/_menu.ts (续)

/**
 * 模拟菜单 API 端点
 * 拦截 GET /api/menu 请求
 */
const menuList = http.get('/api/menu', async () => {
	// 步骤 1: 从 "数据库" (assets.ts) 获取扁平数据
	const flatList = RAW_MENU_DATA;

	// 步骤 2: 调用工具函数，将扁平数据转换为树状结构
	const menuTree = convertFlatToTree(flatList);

	// 步骤 3: 按照标准格式返回一个 JSON 响应
	return HttpResponse.json(
		{
			status: ResultStatus.SUCCESS, // 业务状态码
			message: 'Success',
			data: menuTree,
		},
		{
			status: 200, // HTTP 状态码
		},
	);
});

export const menuHandlers = [menuList];
```

**代码解析**:
*   `http.get('/api/menu', ...)`: 这行代码告诉 MSW，当应用发起一个 `GET` 类型的、路径为 `/api/menu` 的网络请求时，执行我们提供的回调函数。
*   `HttpResponse.json(...)`: 这是 MSW 提供的响应构建器。它会创建一个 JSON 格式的 HTTP 响应。
    *   第一个参数 `{ status, message, data }` 是响应体 (body)，这是我们与后端约定的一种常见数据格式。
    *   第二个参数 `{ status: 200 }` 是响应的元数据，这里我们设置 HTTP 状态码为 `200 OK`。
*   `export const menuHandlers = [menuList]`: 我们将所有与菜单相关的处理器放在一个数组中导出，方便后续统一注册。

### **13.4.3. 任务小结**

我们成功地创建了第一个 MSW 接口处理器。

我们首先构建了一个关键的 `convertFlatToTree` 工具函数，用于将后端风格的扁平数据转换为前端友好的树状结构。然后，我们利用这个函数创建了一个 `GET /api/menu` 的模拟端点。

现在，这个 API 端点已经“存在”于我们的开发环境中，但 MSW 还不知道它的存在。在下一章，我们将“注册”这个处理器，并最终在应用中启动 MSW。

---
## **13.5 注册并启动 MSW 服务**

在前面的章节中，我们已经创建了 API 处理器 (`_menu.ts`)，但它本身不会运行。我们需要一个“启动器”来收集所有的处理器，并将它们注册到 MSW 的 Service Worker 中。最后，我们要在应用入口处执行这个启动器。

### **13.5.1. (编码) 创建 MSW 主入口文件 (index.ts)**

我们将创建一个主入口文件 `src/_mock/index.ts`，它负责收集项目中所有模块的处理器（目前只有菜单模块）并进行配置。

首先，创建该文件。
```bash
touch src/_mock/index.ts
```

打开 `src/_mock/index.ts` 并写入以下内容。

```typescript
// src/_mock/index.ts

import { setupWorker } from 'msw/browser';

import { menuHandlers } from './handlers/_menu';
```
**代码解析**:
*   `import { setupWorker } from 'msw/browser';`: 我们从 `msw/browser` 中导入 `setupWorker`。这个函数专门用于在浏览器环境中配置 MSW。
*   `import { menuHandlers } from './handlers/_menu';`: 我们导入上一章中创建的菜单处理器数组。

接下来，我们将所有处理器合并，并调用 `setupWorker` 创建一个 worker 实例。
```typescript
// src/_mock/index.ts (续)

// 将所有模块的处理器合并到一个数组中
// 未来如果有用户、订单等模块的处理器，也在这里合并
const allHandlers = [...menuHandlers];

// 调用 setupWorker 并传入所有处理器，创建一个 worker 实例
export const worker = setupWorker(...allHandlers);
```

---

### **13.5.2. (编码) 在应用入口启动 MSW (main.tsx)**

最后一步是在我们的应用启动时，调用 `worker.start()` 来激活 MSW。这个操作必须在 React 应用渲染之前完成，以确保在组件首次挂载并发起 API 请求时，MSW 已经准备就绪。

打开应用的入口文件 `src/main.tsx`。

首先，我们从 `_mock` 目录中导入 `worker` 实例。

```typescript
// src/main.tsx

// ==== = React 内置模块 ==== =
import React from "react";
import ReactDOM from "react-dom/client";
// ==== = 第三方库 ==== =
import { RouterProvider } from "react-router-dom";
// ==== = 项目内部模块 ==== =
import { router } from "./routes";
import { worker } from './_mock'; // <--- 新增此行

// ==== = 样式文件 ==== =
import "@/theme/theme.css";
import "@/index.css";
```

现在，我们需要修改应用的启动逻辑。原有的代码是直接渲染 React 应用，我们需要将其改为：先异步启动 MSW，在 MSW 启动成功后，再执行渲染操作。

```tsx
// src/main.tsx (续)

const rootElement = document.getElementById("root");

async function main() {
  // 仅在开发环境中启动 MSW
  if (process.env.NODE_ENV === 'development') {
    // 启动 MSW，这是一个异步过程。
    // onUnhandledRequest: 'bypass' 意味着如果一个请求没有匹配到任何处理器，
    // 它将被直接放行，而不是在控制台报错。这对于 Vite 的热更新请求至关重要。
    await worker.start({
      onUnhandledRequest: 'bypass',
    });
  }

  // 确保在 MSW 启动（或跳过）之后，再渲染 React 应用
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        {/* 渲染 RouterProvider，并将 router 实例作为 prop 传入 */}
        <RouterProvider router={router} />
      </React.StrictMode>,
    );
  }
}

main(); // 执行启动函数
```

**代码解析**:

*   `import { worker } from './_mock';`: 导入我们在上一步创建的 `worker` 实例。
*   `async function main()`: 我们创建了一个异步的 `main` 函数来包裹整个应用的启动流程。
*   `if (process.env.NODE_ENV === 'development')`: 这是一个关键的条件判断。我们 **只希望** 在开发环境中启用 API 模拟，而在生产环境中，应用应该去请求真实的 API。`process.env.NODE_ENV` 是 Vite 等构建工具提供的环境变量。
*   `await worker.start(...)`: 这是启动 MSW 的核心命令。我们使用 `await` 来确保在执行后续的渲染代码之前，MSW 已经完全准备就绪。
*   `onUnhandledRequest: 'bypass'`: 这是一个非常重要的配置项。它告诉 MSW，对于那些没有在处理器中定义的请求（比如 Vite 自身的热更新请求），直接放行，不要报错。
*   `main()`: 最后，我们调用这个异步函数来启动整个应用程序。

----
## **13.6 企业级数据流：API 服务层**

我们已经成功创建并启动了一个模拟 API 端点 GET /api/menu。现在，是时候在我们的前端应用中发起对这个端点的网络请求了。

一种直接的做法是创建一个自定义 Hook (例如 useNavigation)，在其中使用 fetch API，并用 useState 和 useEffect 来手动管理加载、错误和数据状态。这种方式对于简单的场景是可行的。

然而，在企业级应用中，数据获取逻辑通常更为复杂，需要考虑缓存、请求重试、多个组件共享同一份数据等问题。手动管理这些状态会变得非常繁琐且容易出错。因此，我们将采用一种更先进、更分层化的做法，这也是现代企业级项目中的标准实践。

我们的数据流将被拆分为三个清晰的层次：

1. **API 服务层 (本章内容)**：专门负责定义和封装所有与后端 API 的通信。
2. **状态管理层 (下一章)**：负责存储从 API 获取的数据，并使其在整个应用中可被全局访问。
3. **UI 渲染层 (后续章节)**：从全局状态中获取数据，并将其渲染为最终的导航菜单。

### **13.6.1. (编码) 创建全局配置 (global-config.ts)**

为了方便管理项目中的一些全局性常量，例如 API 的基础 URL，我们首先创建一个全局配置文件。

创建 `src/global-config.ts` 文件。
```bash
touch src/global-config.ts
```

打开该文件并写入以下内容，定义 API 的基础路径。
```typescript
// src/global-config.ts

export const GLOBAL_CONFIG = {
  // 定义 API 的基础 URL
  // 在开发环境中，Vite 会通过代理帮助我们转发请求，所以这里通常为空字符串或 '/'
  // 在生产环境中，这里会配置为真实的 API 服务器地址
	apiBaseUrl: import.meta.env.VITE_APP_API_BASE_URL || "/api",
};
```
**代码解析**:
*   `import.meta.env.VITE_API_BASE_URL`: 这是一个 Vite 提供的功能，用于从 `.env` 文件中读取环境变量。这使得我们可以在不同环境（开发、测试、生产）中使用不同的 API 地址，而无需修改代码。

此时，如果你使用的是 TypeScript，编辑器可能会对 `import.meta.env.VITE_APP_API_BASE_URL` 报错，提示 "Property 'env' does not exist on type 'ImportMeta'"。这是因为 TypeScript 默认不知道 Vite 注入的 `import.meta.env` 属性及其包含的环境变量。

为了让 TypeScript 识别这些类型，我们需要创建一个类型声明文件。

创建 `src/vite-env.d.ts` 文件。
```bash
touch src/vite-env.d.ts
```

打开该文件并写入以下内容。
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Base URL for API endpoints */
	readonly VITE_APP_API_BASE_URL: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
```

**代码解析**:
*   `/// <reference types="vite/client" />`: 引用 Vite 的客户端类型定义，提供 Vite 相关的类型支持。
*   `ImportMetaEnv`: 声明所有环境变量的类型，每个以 `VITE_` 开头的环境变量都应该在这里定义。
*   `ImportMeta`: 扩展全局的 `import.meta` 类型，告诉 TypeScript 它有一个 `env` 属性。

现在 TypeScript 就能正确识别环境变量了，编辑器也不会再报错。

### **13.6.2. 思考：为什么需要封装 API 客户端？**

在直接动手编码之前，让我们先思考一个问题：为什么不直接在组件中使用 `fetch` 或 `axios` 发起请求？

假设我们在一个组件中直接这样写：

```typescript
const response = await axios.get('/api/menu');
const menuData = response.data.data; // 需要手动提取 data
```

这看起来似乎很简单，但当项目规模增长时，问题就会逐渐暴露：

**问题一：重复的错误处理逻辑**

每个 API 调用都需要写一遍错误处理：

```typescript
try {
  const response = await axios.get('/api/menu');
  // 处理成功
} catch (error) {
  toast.error('请求失败'); // 这段代码会在每个请求中重复
}
```

**问题二：分散的认证令牌注入**

每次请求都要手动添加 Token：

```typescript
await axios.get('/api/menu', {
  headers: { Authorization: `Bearer ${token}` } // 每次都要写
});
```

**问题三：不统一的响应数据结构处理**

后端返回的数据结构是 `{ status, data, message }`，但我们只关心 `data`。每次都需要手动提取：

```typescript
const response = await axios.get('/api/menu');
const realData = response.data.data; // 重复的解包操作
```

**问题四：类型安全缺失**

直接使用 `axios` 时，TypeScript 无法推断返回的数据类型，容易出错。

企业级应用需要一个统一的、可复用的 API 请求方案。这就是我们要构建 API 客户端的原因：把这些重复的、容易出错的逻辑集中到一个地方处理。

### **13.6.3. 设计思路：分层封装**

我们将采用分层设计，逐步构建一个健壮的 API 客户端：

```
┌─────────────────────────────────────┐
│  业务层: menuService.getMenuList()  │  ← 最终使用：一行代码，类型安全
├─────────────────────────────────────┤
│  封装层: APIClient (get/post...)   │  ← 提供语义化的 HTTP 方法
├─────────────────────────────────────┤
│  拦截器层: 请求/响应拦截器          │  ← 统一处理 Token、错误、数据解包
├─────────────────────────────────────┤
│  基础层: axios 实例                 │  ← 配置 baseURL、timeout 等
└─────────────────────────────────────┘
```

每一层都有其明确的职责，层层递进，最终让业务代码变得异常简洁。

### **13.6.4. (编码) 第一步：准备基础设施**

在开始构建之前，我们需要安装必要的依赖并定义类型。

**1. (操作) 安装 `axios` 与 `sonner`**

```bash
pnpm add axios sonner
```

为什么选择这两个库？

*   **axios**: 相比原生 `fetch`，它提供了请求/响应拦截器、请求取消、超时控制等企业级功能。
*   **sonner**: 一个轻量、美观的 Toast 通知库，用于显示全局错误提示。当请求失败时，用户需要立即得到反馈。

**2. (编码) 定义统一的响应类型**

思考：为什么要定义响应类型？

在真实项目中，后端 API 通常会返回统一的数据结构，比如：

```json
{
  "status": 0,
  "message": "success",
  "data": { ... }
}
```

通过定义 TypeScript 类型，我们可以：
- 让编辑器提供智能提示
- 在编译期捕获类型错误
- 明确后端与前端的契约

创建 `src/types/api.ts` 文件：

```bash
touch src/types/api.ts
```

写入以下内容：

```typescript
// src/types/api.ts

import type { ResultStatus } from "./enum";

/**
 * 后端 API 响应的统一结构
 * @template T - data 字段的具体类型
 */
export interface Result<T = unknown> {
	/**
	 * 业务状态码, 0 代表成功
	 */
	status: ResultStatus;
	/**
	 * 响应消息
	 */
	message: string;
	/**
	 * 实际的响应数据
	 */
	data: T;
}
```

**设计要点**:

*   **泛型 `T = unknown`**: 这是一个关键设计。`data` 的类型在不同 API 中是不同的，通过泛型参数，我们让这个接口可以被复用。
    - 获取用户列表时：`Result<User[]>`
    - 获取菜单数据时：`Result<Menu[]>`
*   **默认值 `unknown`**: 比 `any` 更类型安全。当我们不指定泛型时，TypeScript 不会让我们随意访问 `data` 的属性，必须先做类型检查或断言。

### **13.6.5. (编码) 第二步：创建并配置 axios 实例**

现在开始构建 API 客户端的基础层。

创建文件：

```bash
mkdir -p src/api
touch src/api/apiClient.ts
```

引入依赖：

```typescript
// src/api/apiClient.ts

import axios, {
	type AxiosError,
	type AxiosRequestConfig,
	type AxiosResponse,
} from "axios";
import { toast } from "sonner";

import { GLOBAL_CONFIG } from "@/global-config";
import type { Result } from "@/types/api";
import { ResultStatus } from "@/types/enum";
```

创建 axios 实例：

```typescript
// src/api/apiClient.ts (续)

const axiosInstance = axios.create({
	baseURL: GLOBAL_CONFIG.apiBaseUrl,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});
```

**为什么要创建实例而不是直接使用 `axios`？**

*   **隔离配置**: 创建独立实例后，我们的配置不会影响项目中可能使用的其他 axios 实例。
*   **统一管理**: 所有请求都共享同一套配置（baseURL、timeout、headers），修改时只需改一处。
*   **便于测试**: 在单元测试中，我们可以轻松 mock 这个实例。

### **13.6.6. (编码) 第三步：请求拦截器——自动注入认证信息**

拦截器是实现 "横切关注点" 的最佳位置。什么是横切关注点？就是那些与业务逻辑无关、但每个请求都需要的功能，比如添加 Token。

**思考场景**：

假设你的应用有 50 个 API 接口，每个都需要认证。如果没有拦截器，你需要在 50 个地方都写：

```typescript
headers: { Authorization: `Bearer ${token}` }
```

这不仅繁琐，而且容易遗漏。拦截器让我们只需写一次：

```typescript
// src/api/apiClient.ts (续)

axiosInstance.interceptors.request.use(
	(config) => {
		// 在请求发送前，统一注入 Token
		// 当我们实现登录功能后，可以从全局状态中获取 token
		// config.headers.Authorization = `Bearer ${userStore.getState().userToken.accessToken}`;
		return config;
	},
	(error) => Promise.reject(error),
);
```

**工作原理**：

1. 业务代码发起请求：`axios.get('/api/menu')`
2. 请求拦截器介入，自动添加 `Authorization` 头
3. 带着完整 headers 的请求发送到服务器

现在，无论有多少个 API，我们都不需要手动管理 Token 了。

### **13.6.7. (编码) 第四步：响应拦截器——统一处理响应与错误**

响应拦截器是整个 API 客户端的核心，它解决了我们之前提到的多个问题。

**设计目标**：

1. **自动解包数据**：从 `{ status, data, message }` 中提取 `data`，业务代码无需关心外层结构。
2. **统一错误处理**：任何请求失败都自动弹出错误提示，无需在每个业务调用中写 `try-catch`。
3. **处理特殊状态码**：比如 401 未授权时，自动触发登出逻辑。

```typescript
// src/api/apiClient.ts (续)

axiosInstance.interceptors.response.use(
	// @ts-expect-error - 拦截器故意返回 data 而非完整的 AxiosResponse，以简化业务代码
	(res: AxiosResponse<Result>) => {
		const { status, data, message } = res.data;

		// 判断业务状态码
		if (status === ResultStatus.SUCCESS) {
			// 成功时，直接返回 data，业务代码无需再做解包
			return data;
		}

		// 业务失败（例如后端返回 status: 1），抛出错误
		throw new Error(message || "Request Failed");
	},
	(error: AxiosError<Result>) => {
		// 网络错误或 HTTP 状态码非 2xx 时进入这里
		const { response, message } = error || {};
		const errMsg = response?.data?.message || message || "Unknown Error";

		// 全局弹出错误提示
		toast.error(errMsg, { position: "top-center" });

		// 处理特殊状态码
		if (response?.status === 401) {
			// 未授权，清除用户信息并跳转登录页
			// userStore.getState().actions.clearUserInfoAndToken();
		}

		return Promise.reject(error);
	},
);
```

**关键设计解析**：

*   **为什么直接返回 `data` 而不是完整的 `response`？**
  
    这是一个有意的设计决策。对比两种方式：
    
    ```typescript
    // 不使用拦截器解包
    const response = await apiClient.get('/menu');
    const menuData = response.data.data; // 需要两次 .data
    
    // 使用拦截器解包后
    const menuData = await apiClient.get('/menu'); // 直接得到数据
    ```
    
    后者更简洁，更符合业务思维：我们调用 "获取菜单" 接口，就应该直接得到菜单数据。

*   **为什么需要 `@ts-expect-error` 注释？**
  
    TypeScript 期望拦截器返回 `AxiosResponse` 类型，但我们故意返回了 `data`（类型为 `unknown`）。这个注释告诉 TypeScript："我知道我在做什么，这是有意为之的"。这样既能保持类型系统的严格性，又不会产生编译错误。

*   **错误处理的分层逻辑**：
  
    - 第一个回调处理 HTTP 成功（200-299）但业务失败（status ≠ 0）的情况
    - 第二个回调处理网络错误或 HTTP 错误（如 404、500）的情况
    
    两层把所有错误情况都覆盖了。

### **13.6.8. (编码) 第五步：封装 APIClient 类——提供语义化的 API**

现在，我们已经有了一个配置完善的 `axiosInstance`，但直接使用它的 API（如 `request`）不够语义化。我们需要一个更友好的接口。

**思考：为什么要封装一个类？**

对比两种调用方式：

```typescript
// 直接使用 axiosInstance
axiosInstance.request({ url: '/menu', method: 'GET' });

// 使用封装的 APIClient
apiClient.get({ url: '/menu' });
```

后者更清晰、更符合 HTTP 的语义。同时，通过泛型，我们还能获得完整的类型推断。

```typescript
// src/api/apiClient.ts (续)

class APIClient {
	get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<Result, T>({ ...config, method: "GET" });
	}

	post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<Result, T>({ ...config, method: "POST" });
	}

	put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<Result, T>({ ...config, method: "PUT" });
	}

	delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
		return axiosInstance.request<Result, T>({ ...config, method: "DELETE" });
	}
}

export default new APIClient();
```

**类型系统的巧妙设计**：

```typescript
axiosInstance.request<Result, T>({ ... })
```

这里有两个泛型参数，它们各有含义：

*   **第一个泛型 `Result`**：告诉 axios 响应体（`response.data`）的结构是 `Result`。
*   **第二个泛型 `T`**：告诉 axios 经过拦截器处理后，最终返回的类型是 `T`。

这样设计的好处是：

1. 保持了对响应结构的类型约束（必须是 `Result` 类型）
2. 允许业务代码指定期望的返回类型（比如 `Menu[]`）
3. 完全避免了使用 `any`，保持类型安全

**为什么导出单例？**

```typescript
export default new APIClient();
```

我们导出的是一个实例而不是类本身。这是单例模式：

*   整个应用共享同一个 `apiClient` 实例
*   所有请求共享同一套拦截器和配置
*   节省内存，避免重复初始化

### **13.6.9. (编码) 第六步：创建菜单服务——享受封装的成果**

现在，让我们看看这一整套封装给业务代码带来的简化。

创建 `src/api/services/menuService.ts` 文件：

```bash
mkdir -p src/api/services
touch src/api/services/menuService.ts
```

写入以下内容：

```typescript
// src/api/services/menuService.ts

import type { MenuEntity } from "@/types/entity";
import apiClient from "../apiClient";

export enum MenuApi {
	Menu = "/menu",
}

const getMenuList = () => apiClient.get<MenuEntity[]>({ url: MenuApi.Menu });

export default {
	getMenuList,
};

```

**对比封装前后的代码**：

```typescript
// 封装前：需要手动处理一切
async function getMenuList() {
  try {
    const response = await axios.get('/api/menu', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (response.data.status === 0) {
      return response.data.data;
    } else {
      toast.error(response.data.message);
      throw new Error(response.data.message);
    }
  } catch (error) {
    toast.error('请求失败');
    throw error;
  }
}

// 封装后：一行代码搞定
const getMenuList = () => apiClient.get<MenuEntity[]>({ url: MenuApi.Menu });
```

这就是封装的力量：

*   **类型安全**：`<Menu[]>` 确保返回的数据类型正确
*   **自动解包**：直接得到菜单数组，无需 `response.data.data`
*   **自动认证**：Token 已由拦截器注入
*   **自动错误处理**：失败时自动弹出提示
*   **代码简洁**：从 15 行缩减到 1 行

### **13.6.10. 任务小结**

我们成功构建了一个企业级的 API 服务层。这不仅仅是 "写了一些代码"，更重要的是学习了如何思考和设计一个可维护的系统架构：

*   **从问题出发**：识别重复的、容易出错的模式
*   **分层设计**：将复杂问题拆解成多个简单的层次
*   **类型安全**：充分利用 TypeScript 的类型系统
*   **渐进增强**：从简单开始，逐步完善功能

现在，添加任何新的 API 调用都变得异常简单：

```typescript
const getUserList = () => apiClient.get<User[]>({ url: '/users' });
```

一行代码，类型安全，所有底层逻辑自动处理。这就是优秀架构设计带来的开发体验提升。

在下一章，我们将探讨如何使用全局状态管理器来存储和管理从 API 获取的数据，让整个应用能够响应式地共享这些数据。

---

## **13.7 企业级数据流：全局状态管理**

在上一章，我们构建了 `menuService`，它为我们提供了 `getMenuList()` 这个获取菜单数据的能力。现在的问题是：**获取到的数据，应该存放在哪里？**

### **13.7.1. 思考：为什么需要全局状态管理？**

如果我们将菜单数据只存在导航栏组件的本地状态（`useState`）中，那么应用的其它部分（如页面顶部的面包屑）将无法访问这份数据，除非重新请求或通过复杂的 props 传递。这既浪费网络资源，也使组件间产生耦合。

因此，我们需要一个独立于任何组件的“中央仓库”来存储菜单数据，让整个应用都能方便、高效地共享。这就是 **全局状态管理**。

本项目选择 **Zustand**，它以其极简的 API 和出色的性能而著称。

### **13.7.2. (编码) 第一步：安装依赖**

我们将安装 `zustand` 用于全局状态管理，以及 `@tanstack/react-query` 用于处理异步数据请求。`react-query` 能极大地简化数据获取、缓存和状态管理的逻辑。

```bash
pnpm add zustand @tanstack/react-query
```

### **13.7.3. (编码) 第二步：创建 Menu Store**

与用户认证不同，菜单数据通常是相对独立的。因此，我们将为它创建一个专门的 store，而不是将其混入 `userStore`。

首先，创建 `store` 目录和 `menuStore.ts` 文件。
```bash
# 创建 store 目录
mkdir -p src/store

# 创建 menuStore.ts 文件
touch src/store/menuStore.ts
```

打开 `src/store/menuStore.ts`，引入所需的模块。
```typescript
// src/store/menuStore.ts

import { create } from "zustand";
import type { MenuEntity } from "@/types/entity";
```

### **13.7.4. (编码) 第三步：定义 Store 的类型与实例**

我们来定义 `menuStore` 的“形状”，并创建它的实例。

```typescript
// src/store/menuStore.ts (续)

type MenuStore = {
  // State: 存储的数据
  menuTree: MenuEntity[]; // 存储从后端获取的、未经转换的树状菜单数据

  // Actions: 修改 State 的方法
  actions: {
    setMenuTree: (menuTree: MenuEntity[]) => void;
  };
};

const useMenuStore = create<MenuStore>((set) => ({
  // 初始状态
  menuTree: [],
  
  // 实现 actions
  actions: {
    setMenuTree: (menuTree) => set({ menuTree }),
  },
}))
```
### **13.7.5. (编码) 第四步：创建 Selector Hooks**

为了实现性能更优的“按需订阅”，我们为 store 的不同部分创建专门的 selector hooks。

```typescript
// src/store/menuStore.ts (续)

// Hook for accessing the menu data
export const useMenuTree = () => useMenuStore((state) => state.menuTree);

// Hook for accessing the actions
export const useMenuActions = () => useMenuStore((state) => state.actions);

export default useMenuStore;
```

**代码解析**:

*   `useMenuTree`: UI 组件将使用这个 Hook 来获取菜单数据。只有当 `menuTree` state 发生变化时，使用此 Hook 的组件才会重渲染。
*   `useMenuActions`: 当组件只需要调用 action 而不关心数据变化时，可以使用这个 Hook，以避免不必要的重渲染。

---
## **13.8 使用 React Query 管理菜单数据**

在前面的章节中，我们已经完成了数据准备的全部工作：定义了类型契约、搭建了 MSW 模拟 API、创建了 API 服务层、构建了 Zustand 状态管理。现在，是时候将这些独立的 "零件" 串联起来，让数据真正流动。

本节的核心任务是：**使用 React Query 优雅地管理服务端状态，并与 Zustand 配合实现全局数据共享**。

### **13.8.1. 思考：为什么选择 React Query？**

在上一章中，我们创建了 `menuStore` 来存储菜单数据。你可能会问：既然已经有了 Zustand，为什么还要引入 React Query？

让我们对比两种方案：

**方案一：纯 Zustand + useEffect**

```typescript
// 在每个需要数据的组件中
useEffect(() => {
  const fetchData = async () => {
    const data = await menuService.getMenuList();
    setMenuTree(data);
  };
  fetchData();
}, []);
```

**存在的问题**：

- 需要手动管理 loading、error 状态
- 没有缓存机制，每次重新挂载都会请求
- 缺少数据过期和重新验证策略
- 多个组件同时请求会导致重复调用

**方案二：React Query + Zustand**

```typescript
// 封装在自定义 Hook 中
const query = useQuery({
  queryKey: ['menu'],
  queryFn: menuService.getMenuList,
});
```

**带来的优势**：

- **自动缓存**：同一数据不会重复请求
- **状态管理**：自动处理 isLoading、isError、data
- **后台更新**：数据过期后自动重新验证
- **请求去重**：多个组件同时请求只发一次

React Query 专注于 **服务端状态**，Zustand 专注于 **客户端状态**，两者结合是现代 React 应用的最佳实践。

---
### **13.8.2. (编码) 配置 QueryClientProvider**

React Query 需要在应用顶层提供一个 `QueryClient` 实例，以便在整个组件树中共享数据缓存和请求状态。为了保持良好的代码组织结构，我们将 `QueryClient` 的配置逻辑抽离到一个专门的模块中。

**1. 创建 `query-client.ts`**

首先，在 `src/` 目录下创建一个 `lib` 文件夹（如果它尚不存在），并在其中新建 `query-client.ts` 文件。这个文件将专门用于创建和配置 `QueryClient` 实例。

```
. 📂 prorise-admin
└── 📂 src/
   └── 📂 lib/
      └── 📄 query-client.ts
   ...
```

接着，打开 `src/lib/query-client.ts` 文件，添加以下代码：

```ts
// src/lib/query-client.ts

import { QueryClient } from "@tanstack/react-query";

// 创建 QueryClient 实例并导出
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 数据在 5 分钟内被认为是 "新鲜" 的，不会重新请求
      staleTime: 1000 * 60 * 5,
      // 缓存数据在 10 分钟内若无交互则被清除
      gcTime: 1000 * 60 * 10,
      // API 请求失败时，将自动重试 1 次
      retry: 1,
      // 禁用窗口重新获得焦点时的自动数据刷新
      refetchOnWindowFocus: false,
    },
  },
});
```

**配置解析**：

-   `staleTime: 1000 * 60 * 5`：数据在 5 分钟内被视为新鲜。在此期间，组件的重新挂载不会触发新的网络请求，而是直接使用缓存。
-   `gcTime: 1000 * 60 * 10`：当一个查询不再有任何活跃的订阅时，其缓存数据会在 10 分钟后被垃圾回收，以释放内存。
-   `retry: 1`：当请求失败时，React Query 将自动重试 1 次，以应对临时的网络问题。
-   `refetchOnWindowFocus: false`：默认情况下，当用户切换回浏览器窗口时，React Query 会自动重新获取数据。我们将其禁用，以避免不必要的 API 调用，从而提升用户体验。

**2. 在应用入口提供 `QueryClient`**

`queryClient` 实例创建完毕后，我们需要在应用的根组件使用 `QueryClientProvider` 将它提供给整个应用。

打开 `src/main.tsx`，从我们刚刚创建的模块中导入 `queryClient` 实例，并用 `QueryClientProvider` 包裹根路由组件 `<RouterProvider />`。

```tsx
// ===== React 内置模块 =====

// ===== 第三方库 =====
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
// ===== 项目内部模块 =====
import { router } from "./routes";
import { queryClient } from "@/lib/query-client"; // 导入 queryClient 实例
import { worker } from "./_mock";
// ===== 样式文件 =====
import "@/theme/theme.css";
import "@/index.css";

const rootElement = document.getElementById("root");

async function main() {
  // 仅在开发环境中启动 MSW
  if (process.env.NODE_ENV === "development") {
    // 启动 MSW,这是一个异步过程。
    // onUnhandledRequest: 'bypass' 意味着如果一个请求没有匹配到任何处理器,
    // 它将被直接放行,而不是在控制台报错。这对于 Vite 的热更新请求至关重要。
    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }

  // 确保在 MSW 启动(或跳过)之后,再渲染 React 应用
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        {/* 渲染 RouterProvider,并将 router 实例作为 prop 传入 */}
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </React.StrictMode>,
    );
  }
}

main();
```

至此，我们已经完成了 React Query 的全局配置。通过将 `queryClient` 抽离到单独的文件中，我们使得 `main.tsx` 的职责更加单一，同时也提高了数据层配置的可维护性。

---

### **13.8.3. (编码) 统一管理 Query Keys**

在深入业务逻辑之前，我们首先要建立一个可扩展的 Query Keys 管理体系。将所有与数据请求相关的键（Keys）集中管理，可以有效避免拼写错误，并为后续的缓存失效、乐观更新等高级操作提供坚实的基础。

我们将在 `src` 目录下创建一个 `queries` 文件夹，专门用于存放所有 React Query 相关的 key 管理文件。

**1. 创建 Query Keys 文件**

```bash
mkdir -p src/queries
touch src/queries/menuKeys.ts
```

**2. 编写 `menuKeys.ts`**

打开 `src/queries/menuKeys.ts`，我们为“菜单”这个功能模块定义一套结构化的 key：

```typescript
// src/queries/menuKeys.ts

/**
 * 菜单模块的 Query Keys
 *
 * 这种结构化设计的好处：
 * 1. 集中管理，避免在代码中散落魔术字符串。
 * 2. 类型安全，`as const` 确保 TypeScript 推断出最精确的类型。
 * 3. 结构清晰，便于对整个模块或特定查询进行缓存失效等操作。
 */
export const menuKeys = {
	// 代表整个菜单模块
	all: ["menu"] as const,
	// 菜单列表的 key
	lists: () => [...menuKeys.all, "list"] as const,
	// 某个特定菜单的详情 (示例)
	// detail: (id: string) => [...menuKeys.all, "detail", id] as const,
};
```

### **13.8.4. (编码) 创建菜单业务 Hook**

遵循功能模块化的原则，我们将为“菜单”功能创建专属的业务 Hook。这种组织方式使得代码职责更清晰，便于按功能查找和维护。

**1. 创建业务 Hook 文件**

我们将业务 Hook 按模块存放在 `src/hooks` 目录下：

```bash
mkdir -p src/hooks/menu
touch src/hooks/menu/useMenuQuery.ts
```

**2. 编写 `useMenuQuery.ts`**

打开 `src/hooks/menu/useMenuQuery.ts`，编写封装数据获取与状态同步的逻辑：

```typescript
// src/hooks/menu/useMenuQuery.ts

import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import menuService from "@/api/services/menuService";
import { menuKeys } from "@/queries/menuKeys"; // 从集中管理的文件中导入 keys
import { useMenuActions } from "@/store/menuStore";

/**
 * 获取菜单列表的业务 Hook
 *
 * 功能：
 * 1. 使用 React Query 从 API 获取菜单数据，并由其自动管理缓存、loading、error 状态。
 * 2. 数据获取成功后，自动同步到 Zustand store，供全局消费。
 */
export function useMenuQuery() {
  const { setMenuTree } = useMenuActions();

  const query = useQuery({
    queryKey: menuKeys.lists(), // 使用 menuKeys 工厂函数生成 key
    queryFn: menuService.getMenuList,
  });

  // 监听 query.data 的变化，将其同步到 Zustand store
  useEffect(() => {
    if (query.data) {
      setMenuTree(query.data);
    }
  }, [query.data, setMenuTree]);

  return query;
}
```

**代码解析：职责分离的最佳实践**

这个 Hook 精妙地连接了两个强大的状态管理库：

-   **React Query (服务端状态)**：作为数据的“请求与缓存层”。它全权负责数据获取、缓存、重新验证以及 `loading`/`error` 等异步状态的管理。
-   **Zustand (客户端状态)**：作为数据的“全局共享层”。它不关心数据从何而来，只负责提供一个简洁、高效的接口，让应用内的任何组件都能轻松访问和订阅菜单数据。

这种分工让每个工具只做自己最擅长的事，是现代 React 应用中处理复杂状态的黄金法则。

### **13.8.5. (编码) 在布局中使用 Hook**

现在，我们可以在 `DashboardLayout` 中消费这个刚刚创建的业务 Hook，以极简的代码驱动整个布局的渲染逻辑。

打开 `src/layouts/dashboard/index.tsx`：

```tsx
// src/layouts/dashboard/index.tsx

import { useMenuQuery } from "@/hooks/menu/useMenuQuery"; // 注意新的导入路径

import Header from "./header";
import MainArea from "./main-area";
import NavVertical from "./nav/nav-vertical";

export default function DashboardLayout() {
  // 一行代码，处理数据获取、加载中、错误三种状态
  const { isLoading, isError, error } = useMenuQuery();

  // Loading 状态处理
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    );
  }

  // Error 状态处理
  if (isError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-lg text-red-500">
          加载失败：{error instanceof Error ? error.message : "未知错误"}
        </div>
      </div>
    );
  }

  // 数据加载成功，渲染完整布局
  return (
    <div className="grid h-screen grid-cols-[var(--layout-nav-width)_1fr]">
      <NavVertical />
      <div className="flex flex-col overflow-y-auto">
        <Header />
        <MainArea />
      </div>
    </div>
  );
}
```

**代码之美：声明式数据获取**

对比需要手动管理多个 `useState` 和 `useEffect` 的传统方案，React Query 将数据获取的复杂过程简化为一行 Hook 调用。我们不再需要编写命令式的流程代码，只需声明“我需要菜单数据”，剩下的交给 `useMenuQuery` 即可。

-   **传统方案**：需要 15+ 行代码来手动处理 `loading`、`error`、`data` 状态和副作用。
-   **React Query 方案**：1 行 Hook 调用，返回所有需要的状态，代码量减少 80% 以上。

### **13.8.6. 数据流与架构回顾**

至此，我们建立了一条清晰、健壮且可扩展的数据流管道。

**数据流完整回顾**：

```
[用户访问 Dashboard]
        ↓
[DashboardLayout 挂载]
        ↓
[useMenuQuery() 被调用]
        ↓
[React Query 使用 menuKeys.lists() 检查缓存]
   ↙          ↘
[有缓存]    [无缓存]
返回缓存    发起请求
              ↓
      [menuService.getMenuList()]
              ↓
      [MSW 拦截并返回模拟数据]
              ↓
      [apiClient 拦截器处理响应]
              ↓
      [React Query 缓存数据]
              ↓
      [useEffect 检测到 data 变化]
              ↓
      [setMenuTree() 同步到 Zustand]
              ↓
      [全局状态更新，UI 响应]
```

**任务小结：现代化的分层架构**

本节我们不仅完成了数据获取，更重要的是建立了一套现代化的前端数据管理架构。

**核心优势**：

1.  **职责清晰**：`queries` 层管 Key，`hooks` 层管业务，`api` 层管请求，`store` 层管状态。
2.  **代码简洁**：将复杂的异步逻辑封装在 Hook 中，UI 层只需关心渲染。
3.  **可扩展性强**：新增功能模块时，只需按照 `queries` -> `hooks` 的模式进行扩展即可，对现有代码无侵入。
4.  **自动化状态管理**：`loading`、`error`、缓存等状态由 React Query 自动处理，极大提升了开发效率和应用稳定性。

**架构分层**：

```
UI 层（DashboardLayout）
      ↓ 调用
业务 Hook（hooks/menu/useMenuQuery）
      ↓ 协调
React Query  ←→  Zustand
(服务端状态)    (客户端状态)
      ↓ 使用
Query Keys（queries/menuKeys）
      ↓
API 服务（api/services/menuService）
```

现在，菜单数据已经优雅地流入了我们的全局状态中。在下一节，我们将利用这份数据，构建动态的导航菜单。

---
## **13.9 数据转换层：从后端到前端的桥梁**

在上一章中，我们成功地将菜单数据从 API 获取并存入了 Zustand store。现在，`useMenuTree()` 可以随时访问到类似这样的数据：

```typescript
[
  {
    id: "group_dashboard",
    parentId: "",
    name: "sys.nav.dashboard",
    type: 0,
    order: 1,
    children: [
      {
        id: "workbench",
        parentId: "group_dashboard",
        name: "sys.nav.workbench",
        icon: "solar:widget-bold-duotone",
        type: 2,
        path: "/workbench",
        order: 1
      }
    ]
  }
]
```

然而，这份数据是为**后端数据库设计**的，并不适合直接用于 UI 渲染。本章我们将创建一个转换层，将后端数据转换为 Nav 组件期待的格式。

### **13.9.1. 思考：为什么需要数据转换？**

在开始编码前，让我们先理解一个核心问题：**为什么不能直接使用后端数据？**

对比两种数据结构：

**后端数据（MenuEntity）**

```typescript
{
  id: "workbench",
  parentId: "group_dashboard",
  name: "sys.nav.workbench",
  icon: "solar:widget-bold-duotone",  // 字符串
  type: 2,
  path: "/workbench",
  component: "/dashboard/workbench/index.tsx",
  order: 1
}
```

**Nav 组件需要的数据格式**

```tsx
{
  name: "仪表盘",  // 分组名
  items: [         // 分组内的菜单项
    {
      title: "sys.nav.workbench",
      path: "/workbench",
      icon: <Icon icon="solar:widget-bold-duotone" />,  // React 元素
      children: []
    }
  ]
}
```

**关键差异**：

1. **结构不同**：后端是扁平树状，前端需要分组结构
2. **字段命名不同**：`name` → `title`
3. **图标类型不同**：`string` → `React.ReactNode`
4. **冗余字段**：后端有 `id`、`parentId`、`type`、`component` 等 UI 不需要的字段

**为什么保持两种格式？**

- **后端数据（Zustand store）**：保持原始、完整的数据，便于后续权限计算、路由生成等
- **前端数据（UI 组件）**：只包含渲染所需的字段，简洁高效

这种分离遵循了**单一职责原则**，每一层只关注自己的任务。

### **13.9.2. 架构设计：转换层的位置**

在创建转换工具前，我们需要明确它在架构中的位置：

```
┌─────────────────────────────────────┐
│   UI 层（NavVertical 组件）          │
│   消费：{ name, items }[]            │
└──────────────┬──────────────────────┘
               │
       useNavData() Hook
               │
┌──────────────▼──────────────────────┐
│   转换层（convertMenuToNavData）    │  ← 本章重点
│   输入：MenuEntity[]                 │
│   输出：{ name, items }[]            │
└──────────────┬──────────────────────┘
               │
       useMenuTree()
               │
┌──────────────▼──────────────────────┐
│   Store 层（menuStore）              │
│   存储：MenuEntity[]                 │
└─────────────────────────────────────┘
```

转换层是连接"数据存储"和"UI 渲染"的桥梁，它的职责非常明确：**格式转换，不做其他任何事情**。

### **13.9.3. (编码) 创建数据转换工具**

现在创建核心的转换函数。在 `src/utils` 目录下创建转换工具：

```bash
touch src/utils/nav-converter.tsx
```

注意使用 `.tsx` 扩展名，因为我们要在其中使用 JSX（创建 `<Icon />` 元素）。

打开文件并编写转换逻辑：

```typescript
// src/utils/nav-converter.tsx

import { Icon } from "@/components/icons/Icon";
import type { MenuEntity } from "@/types/entity";

/**
 * 导航菜单项类型
 */
interface NavItem {
  title: string;
  path: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  hidden?: boolean;
  children?: NavItem[];
}

/**
 * 递归转换子菜单项
 * 将 MenuEntity[] 转换为导航组件需要的格式
 */
const convertChildren = (children?: MenuEntity[]): NavItem[] => {
  if (!children?.length) return [];

  return children.map((child) => ({
    title: child.name,
    path: child.path || "",
    icon: child.icon ? <Icon icon={child.icon} width={18} height={18} /> : undefined,
    disabled: child.disabled,
    hidden: child.hidden,
    children: convertChildren(child.children),
  }));
};

/**
 * 将菜单树转换为导航数据
 * @param menuTree - 从后端获取的树形菜单数据
 */
export const convertMenuToNavData = (menuTree: MenuEntity[]) => {
  return menuTree.map((item) => ({
    name: item.name,
    items: convertChildren(item.children),
  }));
};
```

**代码深度解析**：

**1. 简洁的类型定义**

这里定义了一个内部类型 `NavItem`：
- 不导出，仅在转换工具内部使用
- 递归类型：`children?: NavItem[]` 支持无限层级
- 类型安全：避免使用 `any`

**2. 为什么分两个函数？**

```typescript
convertMenuToNavData()  // 处理顶层：遍历菜单树
      ↓
convertChildren()       // 递归处理：转换每个子菜单项
```

这种分层设计使代码更清晰：
- **顶层函数**：处理根节点，提取 `name` 和 `children`
- **递归函数**：转换子菜单项，支持无限嵌套

**3. 图标转换的关键**

```typescript
icon: child.icon ? <Icon icon={child.icon} width={18} height={18} /> : undefined
```

这一行代码实现了从字符串到 React 元素的转换：

```
输入："solar:widget-bold-duotone"
  ↓
输出：<Icon icon="solar:widget-bold-duotone" width={18} height={18} />
```

为什么这样设计？
- UI 组件可以直接渲染 `icon` 属性，无需再次转换
- 保持了数据的"即用性"

**4. 递归处理的精妙之处**

```typescript
children: convertChildren(child.children)
```

这行代码实现了**无限层级**的菜单支持：

```
第1层 根节点
  ↓
第2层 子节点（调用 convertChildren）
  ↓
第3层 孙节点（再次调用 convertChildren）
  ↓
第N层（继续递归...）
```

只要后端数据有 `children`，这个函数就能处理，无论多少层。

### **13.9.4. (编码) 创建自定义 Hook**

现在我们有了转换工具，需要在合适的地方使用它。我们将创建一个自定义 Hook，提供转换后的数据。

创建文件：

```bash
mkdir -p src/hooks/menu
touch src/hooks/menu/useNavData.ts
```

编写 Hook：

```typescript
// src/hooks/menu/useNavData.ts

import { useMemo } from "react";

import { useMenuTree } from "@/store/menuStore";
import { convertMenuToNavData } from "@/utils/nav-converter";

/**
 * 获取导航菜单数据
 * 
 * 从 store 获取原始菜单数据，转换为 Nav 组件需要的格式
 */
export function useNavData() {
  const menuTree = useMenuTree();

  const navData = useMemo(() => {
    return convertMenuToNavData(menuTree);
  }, [menuTree]);

  return navData;
}
```

**Hook 设计要点**：

**1. 为什么要用 useMemo？**

```typescript
const navData = useMemo(() => {
  return convertMenuToNavData(menuTree);
}, [menuTree]);
```

`useMemo` 的作用是**缓存计算结果**。只有当 `menuTree` 变化时，才会重新执行转换函数。这带来两个好处：

- **性能优化**：避免每次组件重渲染都执行转换（转换是递归操作，有性能开销）
- **引用稳定**：返回的 `navData` 对象引用保持稳定，避免子组件不必要的重渲染

**2. 单一职责**

```
useNavData 的唯一职责：提供转换后的数据
  ↓
不关心数据如何获取（由 useMenuTree 负责）
  ↓
不关心数据如何转换（由 convertMenuToNavData 负责）
  ↓
只负责"组装"
```

这种设计让每个部分都专注于自己的任务，易于测试和维护。

**3. 简洁的实现**

这个 Hook 非常简单：
- 从 store 获取数据
- 转换数据
- 缓存结果
- 返回

没有复杂的逻辑，没有副作用，职责明确。

### **13.9.5. 数据流完整回顾**

至此，我们建立了一条完整的数据转换管道：

```
[MSW Handler]
    ↓ 返回
MenuEntity[] (树形)
    ↓ 存入
Zustand Store
    ↓ useMenuTree
menuTree (MenuEntity[])
    ↓ convertMenuToNavData
导航数据
    ↓ useNavData
UI 组件直接使用
```

**转换示例**：

```typescript
// 输入（MenuEntity[]）
[
  {
    id: "group_dashboard",
    parentId: "",
    name: "仪表盘",
    type: PermissionType.GROUP,
    children: [
      {
        id: "workbench",
        parentId: "group_dashboard",
        name: "工作台",
        icon: "solar:widget-bold-duotone",
        path: "/workbench",
        type: PermissionType.MENU
      }
    ]
  }
]

// 输出（转换后的导航数据）
[
  {
    name: "仪表盘",
    items: [
      {
        title: "工作台",
        path: "/workbench",
        icon: <Icon icon="solar:widget-bold-duotone" width={18} height={18} />,
        children: []
      }
    ]
  }
]
```

**关键转换**：

1. **name 保留** - 顶层的 `name` 直接传递给导航分组
2. **name → title** - 子菜单项的 `name` 转换为 `title`
3. **icon 字符串 → Icon 组件** - 字符串转换为可渲染的 React 元素
4. **children 递归处理** - 无限层级支持

---
