// src/api/apiClient.ts
import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { toast } from "sonner";

import { GLOBAL_CONFIG } from "@/global-config";
import type { Result } from "@/types/api";
import { ResultStatus } from "@/types/enum";

const axiosInstance = axios.create({
  baseURL: GLOBAL_CONFIG.apiBaseUrl,
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // 在这里可以统一添加认证信息，例如从全局状态获取 token
    // config.headers.Authorization = `Bearer ${userStore.getState().userToken.accessToken}`;
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  // @ts-expect-error - 拦截器故意返回 data 而非完整的 AxiosResponse，以简化业务代码
  (res: AxiosResponse<Result>) => {
    const { status, data, message } = res.data;

    // 根据后端返回的业务状态码进行判断
    if (status === ResultStatus.SUCCESS) {
      // 如果成功，直接返回 `data` 部分，这样业务代码就无需关心外层的 status 和 message
      return data;
    }

    // 如果业务失败，则抛出错误，错误信息使用后端返回的 message
    throw new Error(message || "Request Failed");
  },
  (error: AxiosError<Result>) => {
    // 当发生网络错误或后端返回非 2xx HTTP 状态码时，会进入这里
    const { response, message } = error || {};
    const errMsg = response?.data?.message || message || "Unknown Error";

    // 使用 toast 组件弹出全局错误提示
    toast.error(errMsg, { position: "top-center" });

    // 例如，如果收到 401 未授权状态码，可以触发全局的登出操作
    if (response?.status === 401) {
      // userStore.getState().actions.clearUserInfoAndToken();
    }

    return Promise.reject(error);
  },
);

class APIClient {
  get<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return axiosInstance.request<Result, T>({ ...config, method: "GET" });
  }

  post<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return axiosInstance.request<Result, T>({ ...config, method: "POST" });
  }

  put<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return axiosInstance.request<Result, T>({ ...config, method: "PUT" });
  }

  delete<T = unknown>(config: AxiosRequestConfig): Promise<T> {
    return axiosInstance.request<Result, T>({ ...config, method: "DELETE" });
  }
}

export default new APIClient();
