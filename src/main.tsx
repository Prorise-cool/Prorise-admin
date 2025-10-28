// ===== React 内置模块 =====
import React from "react";
import ReactDOM from "react-dom/client";
// ===== 第三方库 =====
import { RouterProvider } from "react-router-dom";
// ===== 项目内部模块 =====
import { router } from "./routes";

// ===== 样式文件 =====
import "@/theme/theme.css";
import "@/index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      {/* 渲染 RouterProvider，并将 router 实例作为 prop 传入 */}
      <RouterProvider router={router} />
    </React.StrictMode>,
  );
}
