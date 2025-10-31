// src/global-config.ts

export const GLOBAL_CONFIG = {
  // 定义 API 的基础 URL
  // 在开发环境中，Vite 会通过代理帮助我们转发请求，所以这里通常为空字符串或 '/'
  // 在生产环境中，这里会配置为真实的 API 服务器地址
  apiBaseUrl: import.meta.env.VITE_APP_API_BASE_URL || "/api",
};
