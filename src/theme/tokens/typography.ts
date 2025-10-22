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
  // 注意：fontSize 值不带单位，方便后续计算和 antd 配置
  fontSize: { xs: "12", sm: "14", default: "16", lg: "18", xl: "20" },
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: { none: "1", tight: "1.25", normal: "1.375", relaxed: "1.5" },
};
