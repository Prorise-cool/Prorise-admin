// 遵循您提示的规范，正确导入 Meta 类型
import type { Meta, StoryObj } from "@storybook/react-vite";
// 导入一个尚不存在的组件。这是 TDD/CDD 流程的正常现象。
import { ScrollArea } from "./scroll-area";

// 1. 定义 Meta 元数据
// 这是我们 CDD 的第一步：定义 API 契约
const meta: Meta<typeof ScrollArea> = {
  title: "UI/ScrollArea",
  component: ScrollArea,
  parameters: {
    layout: "centered", // 在画布中央展示
  },
  // [核心] 遵循 8.4 节规范：不使用 autodocs，因为我们将提供 .mdx 文件
  // tags: ['autodocs'], // <-- 移除

  // 2. 定义组件的 API 契约 (argTypes)
  argTypes: {
    orientation: {
      control: "radio",
      options: ["vertical", "horizontal", "both"],
      description: "控制滚动条的显示方向 (我们封装后提供的高级 API)",
      table: {
        defaultValue: { summary: "vertical" },
      },
    },
    children: {
      control: false, // children 由 render 函数提供，不在 Controls 中配置
    },
    className: {
      control: "text",
      description: "应用于根元素的外部类名，用于约束大小",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// 5. 编写“主故事” (Primary)，用于 MDX 嵌入和交互
export const Primary: Story = {
  // args 会从 meta.args 继承，我们这里无需重复定义
  render: (args) => (
    <ScrollArea {...args}>
      {/* 准备一个垂直演示内容 */}
      <div className="p-4">
        <h4 className="mb-4 text-sm font-medium leading-none">示例标签</h4>
        {Array.from({ length: 50 })
          .fill(null)
          .map((_, i) => (
            <div
              key={String(i)}
              className="text-sm border-b border-dashed py-2"
            >
              {`列表项 ${i + 1}`}
            </div>
          ))}
      </div>
    </ScrollArea>
  ),
};

// 6. 编写“水平滚动”故事
export const Horizontal: Story = {
  args: {
    orientation: "horizontal",
    // 关键：限制宽度并防止换行
    className: "h-auto w-[400px] rounded-md border whitespace-nowrap",
  },
  render: (args) => (
    <ScrollArea {...args}>
      {/* 准备一个水平演示内容 */}
      <div className="p-4">
        <div className="flex space-x-4" style={{ width: 1200 }}>
          {Array.from({ length: 20 })
            .fill(null)
            .map((_, i) => (
              <div
                key={String(i)}
                className="w-[200px] h-[150px] bg-card border rounded-md flex items-center justify-center text-card-foreground"
              >
                {`卡片 ${i + 1}`}
              </div>
            ))}
        </div>
      </div>
    </ScrollArea>
  ),
};
