// 预设字体族，方便切换
export const FontFamilyPreset = {
  openSans: "'Open Sans Variable', sans-serif", // 引入 Google Fonts 或本地字体
  inter: "'Inter Variable', sans-serif",
};

// 定义排版相关的规范
export const typographyTokens = {
  fontFamily: {
    openSans: FontFamilyPreset.openSans,
    inter: FontFamilyPreset.inter,
  },

  // 注意：fontSize 值不带单位 (e.g., "16")
  // 这对于 Ant Design 的 theme token 兼容性至关重要
  // Vanilla Extract 会在编译时为它们添加 'px' (或由我们决定单位)
  fontSize: { xs: "12", sm: "14", default: "16", lg: "18", xl: "20" },

  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },

  // lineHeight 也不带单位，它们是相对于 fontSize 的乘数
  lineHeight: { none: "1", tight: "1.25", normal: "1.375", relaxed: "1.5" },
};
