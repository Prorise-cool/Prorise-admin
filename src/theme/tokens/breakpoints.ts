// 定义响应式断点，键名遵循 Tailwind 规范
// 我们采用移动端优先 (Mobile-First) 的策略，
// 'xs' (375px) 是我们的基础视口。
export const breakpointsTokens = {
  xs: "375px", // 移动端
  sm: "576px", // 小型设备
  md: "768px", // 平板
  lg: "1024px", // 笔记本
  xl: "1280px", // 常规桌面
  "2xl": "1536px", // 大型桌面
};
