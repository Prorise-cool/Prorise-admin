// ===== React 内置模块 =====

// ===== 第三方库 =====
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
// ===== 项目内部模块 =====
import { router } from "./routes";
import { queryClient } from "@/lib/query-client"; // 导入 queryClient 实例
import { worker } from "./_mock";
// ===== 样式文件 =====
import "@/theme/theme.css";
import "@/index.css";

const rootElement = document.getElementById("root");

async function main() {
  // 仅在开发环境中启动 MSW
  if (process.env.NODE_ENV === "development") {
    // 启动 MSW,这是一个异步过程。
    // onUnhandledRequest: 'bypass' 意味着如果一个请求没有匹配到任何处理器,
    // 它将被直接放行,而不是在控制台报错。这对于 Vite 的热更新请求至关重要。
    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }

  // 确保在 MSW 启动(或跳过)之后,再渲染 React 应用
  if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        {/* 渲染 RouterProvider,并将 router 实例作为 prop 传入 */}
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </React.StrictMode>,
    );
  }
}

main();
