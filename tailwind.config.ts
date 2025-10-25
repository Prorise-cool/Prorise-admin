import type { Config } from "tailwindcss";
import { breakpointsTokens } from "./src/theme/tokens/breakpoints";
// 导入工具函数和 tokens
import {
  createColorChannel,
  createTailwinConfg,
} from "./src/theme/utils/themeUtils";

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    // 映射非颜色的、可覆盖的 theme 属性
    fontFamily: createTailwinConfg("typography.fontFamily"),

    // 映射需要扩展的 theme 属性
    extend: {
      colors: {
        primary: createColorChannel("colors.palette.primary"),
        success: createColorChannel("colors.palette.success"),
        warning: createColorChannel("colors.palette.warning"),
        error: createColorChannel("colors.palette.error"),
        info: createColorChannel("colors.palette.info"),
        gray: createColorChannel("colors.palette.gray"),
        text: createColorChannel("colors.text"),
        bg: createColorChannel("colors.background"),
        action: createColorChannel("colors.action"),
      },
      opacity: createTailwinConfg("opacity"),
      borderRadius: createTailwinConfg("borderRadius"),
      boxShadow: createTailwinConfg("shadows"),
      spacing: createTailwinConfg("spacing"),
      zIndex: createTailwinConfg("zIndex"),

      // 意图：对于断点，我们不需要 var() 引用，而是直接使用其值。
      // 因此直接导入并赋值即可。
      screens: breakpointsTokens,
    },
  },
  plugins: [],
} satisfies Config;
