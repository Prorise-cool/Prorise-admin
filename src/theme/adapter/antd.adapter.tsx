// Antd的必要依赖
import type { ThemeConfig } from "antd";
import { App as AntdApp, ConfigProvider, theme } from "antd";
// Zustand仓库
import { useSettings } from "@/store/settingStore";
// 枚举
import { ThemeMode } from "@/theme/types/enum";
// 工具函数
import { removePx } from "@/theme/utils/themeUtils";
// 基础主题令牌
import { baseThemeTokens } from "../tokens/base";
import {
  darkColorTokens,
  lightColorTokens,
  presetsColors,
} from "../tokens/color";
import type { UILibraryAdapter } from "../type";

export const AntdAdapter: UILibraryAdapter = ({
  mode,
  children,
}): React.ReactNode => {
  // 1. 订阅全局 store，获取动态设置
  const { themeColorPresets, fontFamily, fontSize } = useSettings();
  // 2. 翻译规则 1：将我们的 mode 映射为 antd 的 algorithm
  const algorithm =
    mode === ThemeMode.Light ? theme.defaultAlgorithm : theme.darkAlgorithm;

  // 3.准备翻译原材料
  const colorTokens =
    mode === ThemeMode.Light ? lightColorTokens : darkColorTokens;
  const primaryColorToken = presetsColors[themeColorPresets];

  // 3. 核心翻译：构建 antd 的 theme.token 对象
  const token: ThemeConfig["token"] = {
    // a. 颜色映射
    colorPrimary: primaryColorToken.default,
    colorSuccess: colorTokens.palette.success.default,
    colorWarning: colorTokens.palette.warning.default,
    colorError: colorTokens.palette.error.default,
    colorInfo: colorTokens.palette.info.default,
    colorBgLayout: colorTokens.background.default,
    colorBgContainer: colorTokens.background.paper,
    colorBgElevated: colorTokens.background.default,

    // b. 字体映射
    fontFamily: fontFamily,
    fontSize: fontSize,

    // c. 圆角映射 (使用 removePx 工具函数进行转换)
    borderRadius: removePx(baseThemeTokens.borderRadius.default),
    borderRadiusLG: removePx(baseThemeTokens.borderRadius.lg),
    borderRadiusSM: removePx(baseThemeTokens.borderRadius.sm),

    // d. 其他 antd 配置 : wireframe是Antd5的新特性，用于禁用组件的阴影效果以便覆盖我们的阴影效果
    wireframe: false,
  };

  // 4. (可选) 对特定组件的精细化翻译
  const components: ThemeConfig["components"] = {
    Breadcrumb: {
      separatorMargin: removePx(baseThemeTokens.spacing[1]),
    },
    Menu: {
      colorFillAlter: "transparent",
      itemColor: colorTokens.text.secondary,
    },
  };

  // 5. 组装并返回最终的 Provider
  return (
    <ConfigProvider theme={{ algorithm, token, components }}>
      {/* 必须再次包裹 <App>，这是 AntD v5+ 的要求。
        它能确保 message.success()、Modal.confirm() 
        等静态方法能正确继承 ConfigProvider 的主题。
      */}
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
};
