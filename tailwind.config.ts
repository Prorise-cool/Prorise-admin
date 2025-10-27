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
        // 语义化颜色
        primary: {
          ...createColorChannel("colors.palette.primary"),
          foreground: "rgb(var(--colors-common-white-channel))",
        },
        destructive: {
          ...createColorChannel("colors.palette.error"),
          foreground: "rgb(var(--colors-common-white-channel))",
        },
        secondary: {
          DEFAULT: "rgb(var(--colors-palette-primary-default-channel) / 0.1)",
          foreground: "rgb(var(--colors-palette-primary-default-channel))",
        },
        accent: {
          DEFAULT: "rgb(var(--colors-background-neutral-channel))",
          foreground: "rgb(var(--colors-text-primary-channel))",
        },

        // 辅助颜色
        success: createColorChannel("colors.palette.success"),
        warning: createColorChannel("colors.palette.warning"),
        error: createColorChannel("colors.palette.error"),
        info: createColorChannel("colors.palette.info"),
        gray: createColorChannel("colors.palette.gray"),

        // 基础颜色
        background: {
          DEFAULT: "rgb(var(--colors-background-default-channel))",
          paper: "rgb(var(--colors-background-paper-channel))",
        },
        foreground: "rgb(var(--colors-text-primary-channel))",

        // 边框和其他
        border: "rgb(var(--colors-palette-gray-300-channel))",
        input: "rgb(var(--colors-palette-gray-300-channel))",
        ring: "rgb(var(--colors-palette-primary-default-channel))",
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
