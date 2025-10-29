import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
// 导入尚不存在的组件
import { ScrollArea } from "./scroll-area";

describe("ScrollArea Component", () => {
  it("应该能正确渲染子元素", () => {
    // 1. Arrange
    render(
      <ScrollArea>
        <div data-testid="child-content">Hello World</div>
      </ScrollArea>,
    );

    // 2. Act
    const childElement = screen.getByTestId("child-content");

    // 3. Assert
    expect(childElement).toBeInTheDocument();
    expect(childElement).toHaveTextContent("Hello World");
  });
});
