## 9.3. `Input` 组件的集成与定制 (CDD 驱动)

我们的“CSS 桥接层”已经就位。现在是收获成果的时候了。我们将添加 `Input` 组件，并立即对其进行定制，使其完美融合我们的设计系统。

### 9.3.1. 添加 `Input` 组件

在终端中，我们执行 `shadcn add` 命令：

```bash
pnpm dlx shadcn@latest add input
```

`shadcn` CLI 会读取 `components.json`，找到我们的配置：

  * **目标路径**：`aliases.ui` -\> `@/components/ui`
  * **工具路径**：`aliases.utils` -\> `@/utils`

它会为我们创建 `src/components/ui/input.tsx`。这个“原始”文件会包含 `cva` 变体和大量 `shadcn` 默认的 Tailwind 类。

然而，在 `Prorise-Admin` 中，我们有自己更精细的设计规范。我们将 **用我们自己的定制版本覆盖** 这个文件。

### 9.3.2. 架构决策：样式分离与 `cva` 管理

**重要说明**：由于 `shadcn/ui` 生成的组件质量很高，通常不会有问题，因此我们 **可以省略之前 TDD 流程中的 `test` 文件编写步骤**。我们只需要在生成的基础上进行增删和定制即可。

在 `Prorise-Admin` 中，我们采用与 `Button` 组件一致的架构：**将样式抽离到单独的 `variants` 文件中，使用 `cva` 进行管理**。

回顾我们的 `Button` 组件结构：

```
src/components/ui/button/
  ├── button.tsx          # 组件主体
  ├── button.variants.tsx # cva 样式定义
  ├── button.stories.tsx  # Storybook 故事
  └── button.test.tsx     # 单元测试
```

这种结构的优势在于：

1.  **关注点分离**：组件逻辑与样式定义分离，代码更清晰。
2.  **可维护性**：样式集中管理，修改时不需要在组件文件中搜索。
3.  **可扩展性**：使用 `cva` 可以轻松添加新的变体和尺寸。
4.  **一致性**：所有 UI 组件遵循相同的架构模式。

我们将为 `Input` 组件采用相同的架构，即使它当前只有一种基础形态。这为未来可能的扩展（如添加 `size` 变体或 `variant` 变体）预留了空间。

### 9.3.3. 编码实现：创建 `input.variants.tsx`

首先，我们创建样式定义文件，将所有 Tailwind 类抽离到 `cva` 中。`shadcn` 生成的默认样式已经很好，但我们需要引入我们自己的设计系统样式，并与 Vanilla Extract 主题系统完美融合。

**文件路径**：`src/components/ui/input/input.variants.tsx`

```tsx
import { cva } from "class-variance-authority";

export const inputVariants = cva(
  [
    // [1] 基础布局和尺寸
    "flex h-9 w-full min-w-0 rounded-md border px-3 py-1",
    
    // [2] 颜色系统 - 消费我们的 CSS 桥接变量
    "border-input bg-transparent",
    "text-base text-foreground",
    "placeholder:text-muted-foreground",
    
    // [3] 暗色模式定制
    "dark:bg-input/30",
    
    // [4] 选中文本样式
    "selection:bg-primary selection:text-primary-foreground",
    
    // [5] 阴影和过渡
    "shadow-sm transition-colors",
    
    // [6] 聚焦状态 - 消费我们的 ring 变量
    "outline-none",
    "focus-visible:ring-1 focus-visible:ring-ring",
    
    // [7] 禁用状态
    "disabled:cursor-not-allowed disabled:opacity-50",
    
    // [8] 失效状态 - 消费我们的 destructive 变量
    "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
    "dark:aria-invalid:ring-destructive/40",
    
    // [9] 文件上传样式
    "file:border-0 file:bg-transparent file:text-sm file:font-medium",
    "file:text-foreground",
    
    // [10] 响应式调整
    "md:text-sm",
  ],
  {
    variants: {
      // 预留：未来可以在这里添加 size、variant 等变体
    },
    defaultVariants: {
      // 预留：默认变体配置
    },
  }
);
```

**架构深度解析**：

1.  **使用数组格式**：更易读，每个样式分类一目了然。
2.  **CSS 桥接变量**：`border-input`、`text-foreground`、`ring-ring`、`aria-invalid:border-destructive` 等类完美消费了我们在 9.2 节中定义的桥接变量。
3.  **暗色模式**：`dark:bg-input/30` 利用了我们在 `src/index.css` 中定义的 `@variant dark` 规则。它会在暗色模式下，使用我们的 `var(--input)` 变量（在暗色模式下被桥接到 `rgba(var(--colors-common-white-channel) / 0.15)`）并应用 30% 的透明度。
4.  **预留扩展空间**：虽然当前只有一种形态，但 `cva` 的 `variants` 和 `defaultVariants` 配置已经就位，未来可以轻松添加 `size: ['sm', 'default', 'lg']` 或 `variant: ['default', 'filled', 'outlined']` 等变体。
5.  **完整的状态覆盖**：聚焦、失效、禁用、文件上传等所有状态都有对应的样式定义。

### 9.3.4. 编码实现：重构 `input.tsx`

现在，我们重构组件主体文件，使其与 `Button` 组件保持一致的结构：

**文件路径**：`src/components/ui/input/input.tsx`

```tsx
import * as React from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/utils/cn";
import { inputVariants } from "./input.variants";

// [1] 使用 VariantProps 推断 variants 类型（预留）
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

// [2] 使用 forwardRef 支持 ref 传递
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input" // [3] 便于 E2E 测试和 CSS 调试
        className={cn(inputVariants({ className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
```

**架构深度解析**：

1.  **`VariantProps<typeof inputVariants>`**：虽然当前没有变体，但这个类型定义为未来扩展预留了空间。一旦我们在 `inputVariants` 中添加 `size` 或 `variant`，TypeScript 会自动推断出对应的 props 类型。
2.  **`React.forwardRef`**：与 `Button` 组件一致，支持 ref 传递，这对于表单库（如 `react-hook-form`）的集成至关重要。
3.  **`data-slot="input"`**：为组件的根元素添加稳定的 `data-` 属性，便于测试和调试。
4.  **`cn(inputVariants({ className }))`**：使用 `cva` 生成的 `inputVariants` 函数，并通过 `cn` 合并外部传入的 `className`。
5.  **`displayName`**：在 React DevTools 中显示清晰的组件名称。

**结论**：经过重构，`Input` 组件现在完全遵循了我们项目的架构规范，与 `Button` 组件保持一致。所有样式都由我们自己的 Vanilla Extract 主题系统驱动，并且为未来的扩展预留了灵活的空间。

### 9.3.5. CDD 实践：在 Storybook 中验证融合

现在，我们在 Storybook 中创建 `input.stories.tsx`，**亲眼见证** 我们的主题融合。

**注意**：关于 `.mdx` 文档文件和 `.test.tsx` 测试文件，我们暂时不创建。`.mdx` 文档我们会在后续专门的章节中统一处理；而测试方面，由于 `shadcn/ui` 生成的组件质量已经很高，我们可以省略基础测试，只在需要时针对特定功能编写测试。

**文件路径**：`src/components/ui/input.stories.tsx`

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';

// [1] 配置 Meta
const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  // [2] 自动生成文档
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number'],
    },
    placeholder: { control: 'text' },
    disabled: { control: 'boolean' },
    "aria-invalid": { control: 'boolean' }, // [3] 模拟失效状态
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// [4] 基础故事
export const Default: Story = {
  args: {
    type: 'text',
    placeholder: '请输入...',
  },
};

// [5] 禁用状态
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

// [6] 失效状态 (aria-invalid)
export const Invalid: Story = {
  args: {
    ...Default.args,
    "aria-invalid": true, // [7] 关键！
  },
};

// [8] 密码类型
export const Password: Story = {
  args: {
    type: 'password',
    placeholder: '请输入密码...',
  },
};
```

**启动 Storybook**：

```bash
pnpm storybook
```

**验证我们的架构**：

1.  **基础样式**：打开 `Default` 故事。`Input` 的边框颜色 `border-input` 现在是由我们的 `var(--colors-palette-gray-500-channel)` 决定的。
2.  **焦点样式**：点击 `Input`。`focus-visible:ring-ring` 的颜色现在是我们 `Prorise-Admin` 的 **主色**（`var(--colors-palette-primary-default)`），而不是 `shadcn` 的 `slate` 色。
3.  **失效样式**：打开 `Invalid` 故事。`aria-invalid:ring-destructive` 的颜色现在是我们 `Prorise-Admin` 的 **错误色**（`var(--colors-palette-error-default)`）。
4.  **【终极验证】主题切换**：
      * 点击 Storybook 工具栏的“月亮”图标，切换到暗色模式。
      * 你会看到 `Input` 的背景变成了 `dark:bg-input/30`（即我们定义的 `rgba(var(--colors-common-white-channel) / 0.15)`），边框颜色也相应改变。
      * 所有焦点色、失效色均 **正确地切换到了暗色模式下的对应值**。

**最终架构**：

现在，我们的 `Input` 组件结构与 `Button` 组件完全一致：

```
src/components/ui/input/
  ├── input.tsx          # 组件主体
  ├── input.variants.tsx # cva 样式定义
  └── input.stories.tsx  # Storybook 故事
```

这个结构展示了我们项目的核心架构原则：

1.  **样式分离**：使用 `cva` 将样式抽离到独立文件，代码更清晰。
2.  **主题集成**：所有颜色和状态样式都消费我们的 CSS 桥接变量，完美融合 Vanilla Extract 主题系统。
3.  **一致性**：所有 UI 组件遵循相同的架构模式。
4.  **可扩展性**：预留了 `variants` 配置空间，未来可以轻松添加新的变体。
5.  **类型安全**：使用 `VariantProps` 和 TypeScript 接口，提供完整的类型推断。

**任务 9.3 已完成！**

我们成功地添加并 **深度定制** 了 `Input` 组件，使其与 `Button` 组件保持一致的架构规范，并通过 Storybook (CDD) **完全验证** 了我们的"CSS 桥接层"架构。

-----