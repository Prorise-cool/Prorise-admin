import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "@storybook/test"; // [2] 导入测试工具
import { useId } from "react";
import { Input } from "../input/input"; // [1] 导入 Input 组件
import { Label } from "./label";

const meta: Meta<typeof Label> = {
  title: "UI/Label",
  component: Label,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// [3] 基础故事
export const Default: Story = {
  args: {
    children: "这是一个 Label",
  },
};

// [4] 关键的联合故事：测试 A11y 交互
export const WithInput: StoryObj<typeof meta> = {
  name: "A11y: Click to Focus Input",
  // [5] 渲染一个 Label 和一个 Input，并通过 ID 关联
  render: (args) => (
    <div className="flex flex-col items-center gap-2">
      <Label htmlFor="email-input" {...args}>
        邮箱地址
      </Label>
      <Input type="email" id={useId()} placeholder="test@example.com" />
    </div>
  ),
  args: {},
  // [6] 编写 play 函数来自动化测试交互
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // [A] 查找元素
    const label = canvas.getByText("邮箱地址");
    const input = canvas.getByPlaceholderText("test@example.com");

    // [B] 初始状态断言：Input 不应该有焦点
    await expect(input).not.toHaveFocus();

    // [C] 模拟交互：用户点击 Label
    await userEvent.click(label);

    // [D] 最终状态断言：Input 应该获得焦点
    await expect(input).toHaveFocus();
  },
};
