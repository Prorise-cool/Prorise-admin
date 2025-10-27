import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "./Icon";

const meta: Meta<typeof Icon> = {
  title: "Components/Icon",
  component: Icon,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    icon: {
      control: "text",
      description:
        'Iconify (e.g., "lucide:home") or Local (e.g., "local:ic-logo-badge")',
    },
    width: { control: "number" },
    height: { control: "number" },
    color: { control: "color" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 1. 验证“轨道一”：本地 SVGR 图标
export const Local: Story = {
  args: {
    icon: "local:ic-logo-badge",
    width: 100,
    height: 100,
    color: "var(--colors-palette-primary-default)",
  },
};

// 2. 验证“轨道二”：远程 Iconify 图标
export const Remote: Story = {
  args: {
    icon: "lucide:settings",
    width: 100,
    height: 100,
    color: "var(--colors-palette-error-default)",
  },
};
