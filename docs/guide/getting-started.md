# 快速开始

欢迎使用 **Prorise Admin**！本指南将帮助你在几分钟内启动并运行项目。

## 环境准备

在开始之前，请确保你的开发环境满足以下要求：

- **Node.js**: >= 20.0.0
- **pnpm**: >= 9.0.0

::: tip 为什么使用 pnpm？
Prorise Admin 使用 pnpm 作为包管理器，它更快、更节省磁盘空间。如果你还没有安装 pnpm，可以通过以下命令安装：

```bash
npm install -g pnpm
```
:::

## 安装依赖

克隆项目后，在项目根目录运行：

```bash
pnpm install
```

::: warning 注意
项目配置了 `preinstall` 钩子，强制使用 pnpm。如果你尝试使用 npm 或 yarn，安装将会失败。
:::

## 启动开发服务器

安装完成后，运行以下命令启动开发服务器：

```bash
pnpm dev
```

开发服务器默认运行在 `http://localhost:5173`，打开浏览器访问即可看到应用。

::: tip 热重载
项目支持 HMR (Hot Module Replacement)，你的修改会立即反映在浏览器中，无需手动刷新。
:::

## 项目脚本

Prorise Admin 提供了丰富的命令行脚本：

### 开发相关

```bash
# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm preview
```

### 代码质量

```bash
# 代码检查
pnpm lint

# 自动修复代码问题
pnpm lint:fix

# 格式化代码
pnpm format
```

### 组件开发

```bash
# 启动 Storybook 组件文档（运行在 http://localhost:6006）
pnpm storybook

# 构建 Storybook 静态文件
pnpm build-storybook
```

### 测试

```bash
# 运行所有测试
pnpm test

# 使用 UI 界面运行测试
pnpm test:ui

# 运行单元测试
pnpm test:unit

# 运行 Storybook 测试
pnpm test:storybook

# 生成测试覆盖率报告
pnpm test:coverage
```

### 文档

```bash
# 启动文档开发服务器
pnpm docs:dev

# 构建文档
pnpm docs:build

# 预览构建的文档
pnpm docs:preview
```

## 技术栈

Prorise Admin 基于现代化的技术栈构建：

| 技术 | 说明 |
|------|------|
| [React 19](https://react.dev/) | 最新版本的 React，支持 Server Components 和更多新特性 |
| [Vite](https://vite.dev/) | 极速的前端构建工具（使用 Rolldown 版本） |
| [Ant Design 5](https://ant.design/) | 企业级 UI 组件库 |
| [TypeScript](https://www.typescriptlang.org/) | 类型安全的 JavaScript 超集 |
| [Tailwind CSS v4](https://tailwindcss.com/) | 实用优先的 CSS 框架 |
| [Vanilla Extract](https://vanilla-extract.style/) | 类型安全的 CSS-in-JS |
| [Zustand](https://zustand-demo.pmnd.rs/) | 轻量级状态管理 |
| [Vitest](https://vitest.dev/) | 基于 Vite 的单元测试框架 |
| [Storybook](https://storybook.js.org/) | 组件驱动开发和文档 |
| [VitePress](https://vitepress.dev/) | 静态站点生成器 |
| [Biome](https://biomejs.dev/) | 快速的代码格式化和检查工具 |

## 项目特性

- ✅ **React 19** - 支持最新的 React 特性
- ✅ **TypeScript** - 完整的类型支持
- ✅ **主题系统** - 支持亮色/暗色主题切换
- ✅ **组件库** - 基于 Ant Design 和自定义组件
- ✅ **自动导入** - React Hooks 和 Ant Design 组件自动导入
- ✅ **代码规范** - Biome + Lefthook 保证代码质量
- ✅ **测试支持** - Vitest + Testing Library
- ✅ **组件文档** - Storybook 组件预览和文档
- ✅ **Git 钩子** - Lefthook 自动化工作流

## 下一步

现在你已经成功运行了项目，可以：

- 📖 查看 [项目结构](/guide/directory-structure) 了解目录组织
- 🎨 探索 [组件库](http://localhost:6006) 查看可用组件
- 🔧 学习如何 [自定义主题](/guide/theme-customization)
- 📝 阅读 [开发指南](/guide/development) 开始开发

::: tip 遇到问题？
如果在启动过程中遇到任何问题，请查看 [常见问题](/guide/faq) 或在 [GitHub Issues](https://github.com/Prorise-cool/Prorise-admin/issues) 中提问。
:::

