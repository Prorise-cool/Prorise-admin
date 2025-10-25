import type React from "react";
import { useEffect } from "react";
import { useSettings } from "@/store/settingStore";
import { HtmlDataAttribute } from "@/theme/types/enum";
import type { UILibraryAdapter } from "./type"; // ✨ 1. 导入 UILibraryAdapter 类型

// ✨ 2. 升级 Props 类型，增加一个可选的 adapters 数组
interface ThemeProviderProps {
  children: React.ReactNode;
  adapters?: UILibraryAdapter[]; // adapters 是一个符合特定接口的组件数组
}

export function ThemeProvider({ children, adapters = [] }: ThemeProviderProps) {
  //    这一步就完成了对 Zustand store 状态的“订阅”
  const settings = useSettings();

  // 第一个 Effect：同步 themeMode
  useEffect(() => {
    const root = window.document.documentElement; // 获取 <html> 元素
    // 将 store 中的 themeMode ('light' or 'dark') 设置为 data-theme-mode 属性
    root.setAttribute(HtmlDataAttribute.ThemeMode, settings.themeMode);
  }, [settings.themeMode]);

  // 第二个 Effect：同步 themeColorPresets
  useEffect(() => {
    const root = window.document.documentElement;

    // 将 store 中的 themeColorPresets ('default', 'cyan'...) 设置为 data-color-palette 属性
    root.setAttribute(
      HtmlDataAttribute.ColorPalette,
      settings.themeColorPresets,
    );
  }, [settings.themeColorPresets]); // 依赖项：只在 themeColorPresets 变化时执行

  // 第三个 Effect：同步字体和基础字号
  useEffect(() => {
    const root = window.document.documentElement;
    const body = window.document.body;

    // 将基础字号应用到 <html> 的 style.fontSize 上
    // 这将作为整个应用 rem 单位的计算基准
    root.style.fontSize = `${settings.fontSize}px`;

    // 将字体族应用到 <body> 的 style.fontFamily 上
    // 它将作为整个页面的默认字体被继承
    body.style.fontFamily = settings.fontFamily;
  }, [settings.fontFamily, settings.fontSize]); // 依赖项：字体或字号任一变化时执行

  // ✨ 3. 新增核心逻辑：使用 reduceRight 动态包裹子组件
  const wrappedWithAdapters = adapters.reduceRight(
    (children, Adapter) => (
      <Adapter key={Adapter.name} mode={settings.themeMode}>
        {children}
      </Adapter>
    ),
    children,
  );
  // ✨ 4. 返回被适配器包裹后的子组件树
  return <>{wrappedWithAdapters}</>;
}
