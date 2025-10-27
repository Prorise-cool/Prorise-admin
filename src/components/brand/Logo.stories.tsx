import type { Meta, StoryObj } from "@storybook/react-vite";
import Logo from "./Logo";

const meta: Meta<typeof Logo> = {
  title: "Components/Brand/Logo",
  component: Logo,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    width: { control: "number" },
    height: { control: "number" },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    width: 100,
    height: 100,
  },
};
