import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./input";

// Meta 对象定义了这组故事的"组件级"配置
const meta: Meta<typeof Input> = {
  // title 决定了故事在 Storybook 侧边栏的显示路径
  title: "UI/Input",
  // component 字段将故事与实际的 Input 组件关联起来
  component: Input,
  // parameters 用于配置 Storybook 的功能，layout: 'centered' 使组件在 Canvas 中居中显示
  parameters: {
    layout: "centered",
  },
  // 自动生成文档
  tags: ["autodocs"],
  // argTypes 定义组件的 API 和控制器
  argTypes: {
    type: {
      control: "select",
      options: ["text", "password", "email", "number", "tel", "url", "file"],
      description: "输入框的类型",
    },
    placeholder: {
      control: "text",
      description: "输入框的占位文本",
    },
    disabled: {
      control: "boolean",
      description: "是否禁用输入框",
    },
    "aria-invalid": {
      control: "boolean",
      description: "是否显示失效状态",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// [1] 基础故事
export const Default: Story = {
  args: {
    type: "text",
    placeholder: "请输入...",
  },
};

// [2] 禁用状态
export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

// [3] 失效状态 (aria-invalid)
export const Invalid: Story = {
  args: {
    ...Default.args,
    "aria-invalid": true,
    placeholder: "输入内容有误",
  },
};

// [4] 密码类型
export const Password: Story = {
  args: {
    type: "password",
    placeholder: "请输入密码...",
  },
};

// [5] 邮箱类型
export const Email: Story = {
  args: {
    type: "email",
    placeholder: "请输入邮箱...",
  },
};

// [6] 带默认值
export const WithValue: Story = {
  args: {
    type: "text",
    defaultValue: "Hello Prorise-Admin",
  },
};

// [7] 文件上传类型
export const File: Story = {
  args: {
    type: "file",
    placeholder: "请选择文件...",
  },
};
