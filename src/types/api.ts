// src/types/api.ts

import type { ResultStatus } from "./enum";

/**
 * 后端 API 响应的统一结构
 * @template T - data 字段的具体类型
 */
export interface Result<T = unknown> {
  /**
   * 业务状态码, 0 代表成功
   */
  status: ResultStatus;
  /**
   * 响应消息
   */
  message: string;
  /**
   * 实际的响应数据
   */
  data: T;
}
