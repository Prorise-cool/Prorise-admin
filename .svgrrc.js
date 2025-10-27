export default {
  // 1. 禁用 Prettier v2 插件，避免 Node.js 兼容性问题
  prettier: false,

  // 2. 确保输出为 TypeScript (.tsx)
  typescript: true,

  // 3. 将 width/height 属性替换为 1em，使其大小可由 font-size 控制
  icon: true,

  // 4. 为组件添加 ref 转发
  ref: true,

  // 5. 将 SVG 根元素的 width/height 属性移除，改用 viewBox
  dimensions: false,

  // 6. 替换特定属性值，强制颜色可被 CSS (currentColor) 控制
  replaceAttrValues: {
    "#000": "currentColor",
    "#000000": "currentColor",
    black: "currentColor",
  },

  // 7. 为 <svg> 标签添加固定的属性
  svgProps: {
    role: "img",
    "aria-hidden": "true",
  },
};
