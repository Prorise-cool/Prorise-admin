
# 第三章. 规约：代码质量与提交规范


在上一章，我们完成了项目的初始化与环境配置。现在，我们将为这座“大厦”建立一套不可动摇的“建筑规范”。一个没有规约的项目，最终会因混乱而坍塌。本章，我们将着手建立项目的“**代码质量铁三角**”：

1.  **代码质量 (Biome.js)**：建立统一、高效的代码格式化与 Lint 检查标准。
2.  **提交卡控 (Lefthook)**：在代码提交前，强制自动执行质量检查。
3.  **提交规范 (Commitlint)**：确保每一次代码提交记录都清晰、规范、可追溯。

这个体系将成为项目的“质量守门员”，确保任何进入代码库的代码，都符合团队的最高标准。


## 3.1. 代码质量基石：集成 Biome.js

### 3.1.1. 技术选型：为何选择 Biome

在集成工具之前，我们必须先阐明决策。`ESLint` + `Prettier` 是过去数年的黄金组合，但我们选择 `Biome` 是基于对 2025 年前端工程化趋势的判断，核心驱动力是 **效率** 和 **简化**。

*   **性能差异**：`ESLint` 与 `Prettier` 基于 JavaScript/TypeScript 构建，在大型项目中，全量检查与格式化可能耗时数十秒。Biome 使用 Rust 编写，其执行速度是前两者组合的 **数十倍**。这种速度差异在本地提交和 CI/CD 流水线中，能带来显著的体验提升。
*   **配置与维护成本**：ESLint + Prettier 方案需要维护至少两个独立的配置文件 (`.eslintrc`, `.prettierrc`)、一系列插件 (`@typescript-eslint/parser` 等) 以及解决它们之间规则冲突的工具 (`eslint-config-prettier`)。配置过程繁琐且容易出错。
*   **一体化优势**：Biome 是一个 **一体化** 工具，它集成了 Formatter（格式化器）、Linter（检查器）和 Importer（导入排序器）。由于功能源自同一内核，它们的设计从根源上避免了规则冲突。我们用一个工具、一份配置，就替代了过去需要多个工具协作才能完成的工作。

选择 Biome，是一次明确的工程升级：用一个更现代、更高效的集成工具，替换掉一个需要繁琐配置才能协同工作的传统组合。

### 3.1.2. 安装并初始化 Biome

首先，我们将 Biome 作为开发依赖项添加到项目中。

```bash
pnpm add -D @biomejs/biome
```

安装完成后，我们不手动创建配置文件，而是使用 Biome 的官方命令来初始化，这能确保我们获得一个标准的、包含最新 schema 信息的配置文件。

```bash
pnpm biome init
```
执行后，项目根目录会生成一个 `biome.json` 文件。这是我们后续所有代码质量规则的配置中心。

### 3.1.3. 任务 3.1.2：渐进式配置 `biome.json`

我们不会一次性展示最终配置，而是逐步添加和解释每一个配置块，理解其背后的架构决策。

**第一步：定义基础格式化风格 (Formatter)**

我们首先定义团队统一的代码格式化风格。现代开发实践和团队协作的舒适度是主要考量。

**文件路径**: `biome.json`
```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "formatter": {
    "enabled": true,
    "lineWidth": 120,
    "indentStyle": "space",
    "indentWidth": 2
  }
}
```

*   `lineWidth: 120`：在现代宽屏显示器下，Prettier 默认的 80 字符过于狭窄，常导致 TS 类型和 JSX 属性不自然地换行。120 字符是更舒适、可读性更高的标准。
*   `indentStyle: "space"` 与 `indentWidth: 2`：我们选择使用 2 个空格进行缩进。这是社区中最广泛接受的规范，能确保在任何环境下代码的缩进表现都完全一致。

**第二步：配置 Linter 基础规则**

接下来，我们开启 Linter，并设定规则的取舍。这里的关键在于找到 **严格性** 与 **实用性** 的平衡点。

**文件路径**: `biome.json` (追加 `linter` 配置)
```json
{
  "$schema": "./node_modules/@biomejs/biome/configuration_schema.json",
  "formatter": {
    "enabled": true,
    "lineWidth": 120,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true,
      "suspicious": {
        "noExplicitAny": "off"
      },
      "a11y": {
        "useKeyWithClickEvents": "off"
      }
    }
  }
}
```
*   `rules: { recommended: true }`：开启 Biome 推荐的所有规则集。这是我们的“基础安全网”，能捕获大量潜在的编码错误。
*   `suspicious: { noExplicitAny: "off" }`：**这是一个重要的架构妥协**。在企业项目中，尤其是在与类型定义不完善的第三方库集成时，`any` 是一个必要的“逃生舱口”。我们的目标是 **逐步减少** `any` 的使用，而不是在项目初期就“一刀切”导致开发流程卡顿。
*   `a11y: { useKeyWithClickEvents: "off" }`：**这是另一个基于场景的权衡**。此规则要求 `onClick` 事件必须伴随键盘事件以保证无障碍访问。对于 `Prorise-Admin` 这样的企业内部系统，我们经常使用 `div` 或 `span` 附加 `onClick` 来构建自定义交互。为追求内部组件的开发灵活性，我们选择关闭此规则。

**第三步：整合 JavaScript/TypeScript 特定配置**

我们针对 JS/TS 文件，特别是 JSX 的书写习惯，进行微调。

**文件路径**: `biome.json`

```json
{
// ... (formatter 和 linter 配置)
  "linter": {
    "enabled": true,
    "rules": {
// ...
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "jsxQuoteStyle": "double"
    }
  }
}
```
*   `quoteStyle: "single"`：在 JavaScript/TypeScript 代码中，我们统一使用单引号 `''`。
*   `jsxQuoteStyle: "double"`：在 JSX (类 HTML) 的属性中，我们统一使用双引号 `""`。这是 W3C 规范推荐的做法，也符合社区习惯，实现了代码与标记的风格区分。

**第四步：配置自动导入排序 (Organizer)**

这是 Biome 替代 `eslint-plugin-simple-import-sort` 的核心功能，用于保持代码整洁。

**文件路径**: `biome.json` (追加 `organizer` 配置)
```json
{
// ... (formatter, linter, javascript 配置)
    "jsxQuoteStyle": "double"
  },
  "organizer": {
    "enabled": true
  }
}
```
*   `organizer: { enabled: true }`：开启此功能后，Biome 将能够自动对 `import` 语句进行排序和分组，极大地提升了代码的规范性和可读性。

### 3.1.4. 任务 3.1.3：解决 Biome 与“自动导入”的冲突（可选）

配置完成后，我们面临一个预期中的问题：Biome 的 Linter 无法识别由 `unplugin-auto-import` 插件“魔法般”注入的全局 API，这在我们上一章就已经解决过了，但是我们重复一次

在终端中对 `src/App.tsx` 文件执行一次检查：

```bash
pnpm biome check src/App.tsx
```

你会立刻看到 Biome 抛出错误：
```sh
src/App.tsx:4:19 lint(correctness/noUndeclaredVariables)
  ✖ `useState` is not defined.
```
**问题根源**：Biome 只认通过 `import` 语句显式导入的变量。它不知道 `unplugin-auto-import` 在构建时会自动注入 `useState`。

**解决方案**：我们需要让 Biome（以及 TypeScript 编译器 `tsc`）能够识别这些全局注入的 API。`unplugin-auto-import` 已经为我们生成了 `auto-imports.d.ts` 类型声明文件，我们只需在 `tsconfig.json` 中明确地包含它即可。

**文件路径**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ESNext",
// ... (其他配置)
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "auto-imports.d.ts"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```
通过在 `include` 数组中加入 `auto-imports.d.ts`，我们告诉 TypeScript 和 Biome：“请加载这个文件，里面声明了一些全局可用的类型和变量”。

保存 `tsconfig.json` 后，再次运行检查命令：

```bash
pnpm biome check src/App.tsx
```

**错误消失了！** 这标志着我们的代码质量工具链与自动导入插件已成功协同工作。

### 3.1.5. Biome 常用命令速查

在日常开发中，我们会频繁使用以下 Biome 命令。理解它们的用途和区别，能让我们更高效地维护代码质量。

#### 基础命令

**1. 检查文件（仅报告问题，不修改）**
```bash
# 检查单个文件
pnpm biome check src/App.tsx

# 检查整个 src 目录
pnpm biome check src

# 检查所有文件
pnpm biome check .
```
> 💡 **用途**：在 CI/CD 流水线中使用，或在提交前确认代码质量。

**2. 自动修复问题**
```bash
# 修复单个文件
pnpm biome check --write src/App.tsx

# 修复整个 src 目录（推荐）
pnpm biome check --write src

# 修复所有文件
pnpm biome check --write .
```
> 💡 **用途**：在提交前批量修复格式问题和安全的 Lint 错误。

**3. 仅格式化（不执行 Lint 检查）**
```bash
# 格式化单个文件
pnpm biome format --write src/App.tsx

# 格式化整个 src 目录
pnpm biome format --write src
```
> 💡 **用途**：快速格式化代码，不关心 Lint 问题时使用。

**4. 仅 Lint 检查（不格式化）**
```bash
# 只检查 Lint 问题
pnpm biome lint src

# 修复可自动修复的 Lint 问题
pnpm biome lint --write src
```
> 💡 **用途**：专注于代码质量问题，不改变格式。

#### 进阶命令

**5. 在受 Git 影响的文件上运行检查**
```bash
# 只检查有改动的文件（需要配置 vcs.enabled）
pnpm biome check --changed

# 修复有改动的文件
pnpm biome check --write --changed
```
> 💡 **用途**：在大型项目中，只检查你修改过的文件，大幅提升速度。

**6. 使用不同的配置文件**
```bash
# 使用自定义配置文件
pnpm biome check --config-path=./biome.production.json src
```

#### 推荐的 package.json 脚本

为了方便使用，我们可以在 `package.json` 中添加快捷脚本：

**文件路径**: `package.json`
```json
{
  "scripts": {
    "lint": "biome check src",
    "lint:fix": "biome check --write src",
    "format": "biome format --write src"
  }
}
```

这样，我们就可以使用更简洁的命令：
```bash
pnpm lint        # 检查
pnpm lint:fix    # 修复
pnpm format      # 格式化
```

### 3.1.6. VSCode 集成：让代码质量检查无感化

每次手动运行命令来修复代码格式，这在实际开发中是非常低效的。我们需要让编辑器在**保存时自动应用** Biome 规范，真正实现"零手动操作"的代码质量保障。

#### 第一步：安装 Biome VSCode 插件

在 VSCode 中安装官方插件：

1. 打开 VSCode 扩展面板（`Ctrl + Shift + X`）
2. 搜索 `Biome`
3. 安装 **Biome** 插件（发布者：`biomejs`）

或者通过命令行安装：
```bash
code --install-extension biomejs.biome
```

#### 第二步：配置项目级 VSCode 设置

为了确保团队所有成员都使用统一的编辑器配置，我们在项目中创建 `.vscode/settings.json` 文件。

**文件路径**: `.vscode/settings.json`
```json
{
  // 1. 设置 Biome 为默认格式化工具
  "editor.defaultFormatter": "biomejs.biome",
  
  // 2. 启用保存时自动格式化
  "editor.formatOnSave": true,
  
  // 3. 启用保存时自动修复 Lint 问题
  "editor.codeActionsOnSave": {
    "quickfix.biome": "explicit",
    "source.organizeImports.biome": "explicit"
  },
  
  // 4. 针对特定文件类型的配置
  "[javascript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescript]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[javascriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[json]": {
    "editor.defaultFormatter": "biomejs.biome"
  },
  "[jsonc]": {
    "editor.defaultFormatter": "biomejs.biome"
  }
}
```

#### 配置说明

- **`editor.defaultFormatter`**：将 Biome 设为默认格式化工具，替代内置的或其他格式化工具（如 Prettier）。
- **`editor.formatOnSave`**：每次保存文件时，自动执行格式化。
- **`editor.codeActionsOnSave`**：
  - `quickfix.biome`：自动修复可修复的 Lint 问题
  - `source.organizeImports.biome`：自动整理和排序 import 语句
- **针对特定文件类型的配置**：确保所有 JS/TS/React 文件都使用 Biome。

#### 第三步：创建推荐扩展列表（可选）

为了让新加入的团队成员知道需要安装哪些插件，我们创建一个推荐扩展列表。

**文件路径**: `.vscode/extensions.json`
```json
{
  "recommendations": [
    "biomejs.biome"
  ]
}
```

这样，当团队成员打开项目时，VSCode 会提示他们安装推荐的插件。

#### 验证配置

1. 打开 `src/App.tsx`
2. 故意破坏格式（例如删除分号、改变缩进）
3. 按 `Ctrl + S` 保存
4. **代码应该自动恢复正确的格式！**

#### 常见问题

**Q: 保存时没有自动格式化？**
- 检查是否安装了 Biome 插件
- 检查 VSCode 右下角状态栏，确认 Biome 已激活
- 重启 VSCode 窗口（`Ctrl + Shift + P` → `Reload Window`）

**Q: 与其他格式化工具冲突？**
- 禁用 Prettier、ESLint 等格式化插件，或在项目设置中明确指定 Biome 优先级

**Q: 某些文件不想使用 Biome？**
- 在 `biome.json` 中添加 `files.ignore` 配置：
```json
{
  "files": {
    "ignore": ["dist", "node_modules", "*.min.js"]
  }
}
```

#### 开发体验升级

配置完成后，你的开发工作流将变为：

1. ✍️ **编写代码**：专注于业务逻辑
2. 💾 **保存文件**（`Ctrl + S`）：
   - ✅ 自动格式化
   - ✅ 自动修复 Lint 问题
   - ✅ 自动整理 import
3. 🚀 **提交代码**：干净、规范、零手动操作

**阶段性成果**：我们成功用 Biome 替换了传统的 ESLint + Prettier 组合，并基于企业级项目的实际需求，渐进式地定义了代码格式化风格与 Linter 规则。最关键的是，我们解决了 Biome Linter 与 `unplugin-auto-import` 之间的核心冲突，并通过 VSCode 集成实现了"保存即规范"的无感化开发体验。从现在开始，代码质量将不再是负担，而是自动化的基础设施。
