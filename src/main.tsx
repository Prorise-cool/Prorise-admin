import { App as AntdApp, ConfigProvider } from "antd";
import zhCN from "antd/locale/zh_CN";
import React from "react";
import ReactDOM from "react-dom/client";
import MyApp from "@/MyApp";
import "@/index.css";

const rootElement = document.getElementById("root");
if (rootElement) {
	ReactDOM.createRoot(rootElement).render(
		<React.StrictMode>
			<ConfigProvider
				locale={zhCN}
				theme={{
					token: {
						colorPrimary: "#00b96b",
					},
				}}
			>
				<AntdApp>
					<MyApp />
				</AntdApp>
			</ConfigProvider>
		</React.StrictMode>,
	);
}
