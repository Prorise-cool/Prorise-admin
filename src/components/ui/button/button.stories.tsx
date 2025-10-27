import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "@storybook/test"; // 导入 Storybook 测试工具
// 注意：此时 Button 还不存在，IDE 会报错。
// 这是 TDD/CDD 流程的正常现象，我们正在为未来的组件编写“规约”。
import { Button } from "./button";

// Meta 对象定义了这组故事的"组件级"配置
const meta: Meta<typeof Button> = {
  // title 决定了故事在 Storybook 侧边栏的显示路径
  title: "UI/Button",
  // component 字段将故事与实际的 Button 组件关联起来
  component: Button,
  // 👇 添加 test 标签，使这个组件的所有 stories 都可以被 Vitest 插件测试
  tags: ["test"],
  // parameters 用于配置 Storybook 的功能，layout: 'centered' 使组件在 Canvas 中居中显示
  parameters: {
    layout: "centered",
  },
  // [核心] argTypes 就是我们组件的 API 设计文档
  argTypes: {
    variant: {
      control: "select", // 在 Controls 面板中使用“下拉选择”控件
      options: [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link",
      ], // 定义可选值
      description: "按钮的视觉风格", // 在文档中显示的描述
    },
    size: {
      control: "radio", // 使用“单选按钮”控件
      options: ["default", "sm", "lg", "icon"],
      description: "按钮的尺寸",
    },
    children: {
      control: "text", // 使用“文本输入”控件
      description: "按钮内部显示的内容",
    },
    onClick: { action: "clicked" }, // 告诉 Storybook 追踪 onClick prop
  },
};

export default meta;

// 定义 Story 类型，方便后续编写故事时获得 TypeScript 类型提示
type Story = StoryObj<typeof meta>;

// Primary Story: 一个可交互的、配置齐全的基础按钮
export const Primary: Story = {
  // args 定义了这个故事中组件的默认 props
  args: {
    variant: "default",
    size: "default",
    children: "Primary Button",
  },
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
    children: "Destructive",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Ghost: Story = {
  args: {
    variant: "ghost",
    children: "Ghost",
  },
};

export const Outline: Story = {
  args: {
    variant: "outline",
    children: "Outline",
  },
};

export const Large: Story = {
  args: {
    size: "lg",
    children: "Large Button",
  },
};

export const Small: Story = {
  args: {
    size: "sm",
    children: "Small Button",
  },
};

export const AsLink: Story = {
  args: {
    variant: "link",
    asChild: true,
    children: <a href="https://prorise666.site">I am a link</a>,
  },
};

// [3. 添加一个新的 Story 专门用于交互测试]
export const WithClickInteraction: Story = {
  // 我们为这个 Story 提供一个 mock 的 onClick 回调
  // 我们使用 fn() 来创建一个 Vitest "spy" 函数
  // Storybook 会自动将它连接到 argTypes 中定义的 'clicked' action
  args: {
    variant: "default",
    children: "Click Me!",
    onClick: fn(), // <-- [核心] 创建一个可被追踪的 spy 函数
  },
  // [4. 编写 play 函数]
  // 这是一个异步函数，它会在组件渲染后执行
  play: async ({ canvasElement, args }) => {
    // 'canvasElement' 是这个 Story 渲染所在的根 DOM 元素
    // [A] 获取画布和组件
    // 使用 'within' 将查询范围限定在当前 Story 的画布内
    const canvas = within(canvasElement);

    // [B] 查找元素
    // 使用最佳实践 getByRole 查找按钮
    const button = canvas.getByRole("button", { name: /click me/i });

    // [C] 模拟交互
    // 模拟真实用户点击按钮
    await userEvent.click(button);

    // [D] 断言
    // 验证我们传入的 spy 函数 (args.onClick) 是否被调用了
    await expect(args.onClick).toHaveBeenCalled();
    await expect(args.onClick).toHaveBeenCalledOnce(); // 确保只被调用了一次
  },
};
