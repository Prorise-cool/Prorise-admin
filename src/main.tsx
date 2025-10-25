import React from "react";
import ReactDOM from "react-dom/client";
import MyApp from "@/MyApp";
import "@/theme/theme.css"; // Vanilla Extract: 源文件是 .css.ts，导入时去掉 .ts
// 1. 导入我们创建的 AntdAdapter
import { AntdAdapter } from "@/theme/adapter/antd.adapter";
import { ThemeProvider } from "@/theme/theme-provider";

import "@/index.css";
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <ThemeProvider adapters={[AntdAdapter]}>
        <MyApp />
      </ThemeProvider>
    </React.StrictMode>,
  );
}
