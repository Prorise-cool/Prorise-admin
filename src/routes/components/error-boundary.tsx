import { Button, Result } from "antd";
import type { ResultStatusType } from "antd/es/result";
import {
  isRouteErrorResponse,
  useNavigate,
  useRouteError,
} from "react-router-dom";

export default function ErrorBoundary() {
  // 1. useRouteError() 获取路由层捕获到的错误对象
  const error = useRouteError();
  const navigate = useNavigate();
  console.error("路由错误:", error); // 在控制台打印详细错误，便于调试
  let status = 500;
  let statusText = "Internal Server Error";
  let message = "发生未知错误";
  // 2. isRouteErrorResponse() 判断是否是 Router 抛出的 Response 错误
  //    (例如 loader 中 throw new Response("Not Found", { status: 404 }))
  if (isRouteErrorResponse(error)) {
    status = error.status;
    statusText = error.statusText;
    // error.data 通常包含 loader/action 返回的错误信息
    message = error.data?.message || error.statusText;
  }
  // 3. 判断是否是标准的 JavaScript Error 对象
  else if (error instanceof Error) {
    statusText = error.name;
    message = error.message;
  }

  return (
    <Result
      status={status as ResultStatusType}
      title={statusText as ResultStatusType}
      subTitle={message}
      extra={
        <Button type="primary" onClick={() => navigate("/")}>
          Back Home
        </Button>
      }
    />
  );
}
