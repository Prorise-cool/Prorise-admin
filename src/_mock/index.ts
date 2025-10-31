import { setupWorker } from "msw/browser";
import { menuHandlers } from "./handlers/_menu";

// 将所有模块的处理器合并到一个数组中
// 未来如果有用户、订单等模块的处理器，也在这里合并
const allHandlers = [...menuHandlers];

// 调用 setupWorker 并传入所有处理器，创建一个 worker 实例
export const worker = setupWorker(...allHandlers);
