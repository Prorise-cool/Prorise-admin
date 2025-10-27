import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

// 同样，这里会因为 Button 不存在而报错
import { Button } from "./button";

// 'describe' 用于将一组相关的测试用例组织在一起
describe("Button Component", () => {
  // 'it' 或 'test' 定义了一个具体的测试用例
  it("应该需要有一个子元素且能够被渲染", () => {
    // 1. Arrange (安排): 准备测试环境和输入
    render(<Button>Click Me</Button>);

    // 2. Act (行动): 执行查询操作
    // screen.getByRole 是一个强大的查询工具，它鼓励我们编写无障碍的代码。
    // 它会寻找一个 role 为 'button' 且可访问名称 (accessible name) 包含 "Click Me" (不区分大小写) 的元素。
    const buttonElement = screen.getByRole("button", { name: /click me/i });

    // 3. Assert (断言): 验证结果是否符合预期
    // toBeInTheDocument 是 @testing-library/jest-dom 提供的匹配器
    expect(buttonElement).toBeInTheDocument();
  });

  // 新增测试用例
  it("应该需要有一个destructive变体且能够被渲染", () => {
    render(<Button variant="destructive">Delete</Button>);
    const buttonElement = screen.getByRole("button", { name: /delete/i });

    // 我们期望按钮上应用了 destructive 变体对应的背景色和前景色类
    // toHaveClass 同样来自 @testing-library/jest-dom
    expect(buttonElement).toHaveClass(
      "bg-destructive",
      "text-destructive-foreground",
    );
  });
});
