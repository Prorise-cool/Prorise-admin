### 4.3.3. 实施：在 v4 中禁用 Preflight

**重要变更**：Tailwind CSS v4 移除了 `corePlugins` 配置项，我们需要采用新的方式来禁用 Preflight。

**第一步：保持简化的 `tailwind.config.ts`**

在项目根目录创建 `tailwind.config.ts` 文件（主要用于 content 配置）。

**文件路径**: `tailwind.config.ts`
```typescript
import type { Config } from "tailwindcss";

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} as Config;
```

**注意**：v4 中 `corePlugins` 选项已被移除，不再支持通过 JS 配置禁用核心功能。

**第二步：通过选择性导入禁用 Preflight**

这是 v4 中**禁用 Preflight 的正确方法**：不使用完整的 `@import "tailwindcss"`（它包含 Preflight），而是分别导入需要的层。

**文件路径**: `src/index.css`
```css
/* 
  v4 中禁用 Preflight 的方法：
  分别导入 Tailwind 的各个层，跳过包含 Preflight 的完整导入
*/
@import "tailwindcss/theme";
@import "tailwindcss/utilities";

/* 使用 @theme 指令直接在 CSS 中定制和扩展主题 */
@theme {
  --color-brand: #00b96b;
  --font-sans: "Inter", sans-serif;
  --breakpoint-3xl: 1920px;
}
```

**关键理解**：
- `@import "tailwindcss"` 会导入所有内容，包括 Preflight 重置样式
- `@import "tailwindcss/theme"` + `@import "tailwindcss/utilities"` 只导入主题和工具类，跳过 Preflight
- 这样 Antd 的全局样式重置能够保持完整控制权

### 4.3.4. 最终验证

现在，重启你的开发服务器（可能需要 `Ctrl+C` 后重新 `pnpm dev` 以确保配置完全生效）。

再次观察页面，你会看到一个全新的、和谐统一的景象：
1.  **Antd `Typography` 组件**：样式保持正常。
2.  **原生 `<h1>`, `<h2>`, `<p>`**: **它们的样式现在看起来和 Antd 的对应组件几乎一样了！** 这是因为 Antd 的全局 Reset 生效了，为它们提供了符合 Antd 设计规范的基础样式。

至此，我们才真正实现了两个框架的和谐共存，并建立了一个统一、可预测的样式环境。

{% note success simple %}
**阶段性成果**：我们深入分析了现代 Antd 与 Tailwind v4 共存的现状，并将问题从“样式破坏”重新定义为“基准不一致”。通过 **选择性禁用 `preflight`** 的最佳实践，我们确立了 Ant Design 作为项目中唯一的样式基准，优雅地解决了冲突，实现了一个既能确保 Antd 设计一致性，又能充分享受 Tailwind 原子类便利性的健壮配置。
{% endnote %}