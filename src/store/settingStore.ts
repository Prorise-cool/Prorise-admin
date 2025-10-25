import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { FontFamilyPreset, typographyTokens } from "@/theme/tokens/typography";
import { StorageEnum, ThemeColorPresets, ThemeMode } from "@/theme/types/enum";
// 所有主题相关设置
export type SettingsType = {
  themeColorPresets: ThemeColorPresets;
  themeMode: ThemeMode;
  fontFamily: string;
  fontSize: number;
};

// 将所有 actions 组织在一个命名空间下
type SettingStore = {
  settings: SettingsType;
  actions: {
    setSettings: (newSettings: Partial<SettingsType>) => void; // 使用 Partial 允许部分更新
  };
};

// 2. 使用 persist 中间件包裹 create
const useSettingStore = create<SettingStore>()(
  persist(
    (set) => ({
      // 3. 内部的 Store 定义 (settings 和 actions) 保持不变
      settings: {
        themeColorPresets: ThemeColorPresets.Default,
        themeMode: ThemeMode.Light,
        fontFamily: FontFamilyPreset.openSans,
        fontSize: Number(typographyTokens.fontSize.sm),
      },
      actions: {
        setSettings: (newSettings) =>
          set((state) => ({ settings: { ...state.settings, ...newSettings } })),
      },
    }),
    // 4. persist 中间件的配置对象
    {
      // 使用 StorageEnum.Settings 作为 key
      name: StorageEnum.Settings,

      // 指定存储介质
      storage: createJSONStorage(() => localStorage),

      // 关键优化：只持久化 'settings' 部分，忽略 'actions'
      partialize: (state) => ({ settings: state.settings }),
    },
  ),
);
// 5. 导出更精细化的 Hooks (这是 Zustand 的推荐实践)
export const useSettings = () => useSettingStore((state) => state.settings);
export const useSettingActions = () =>
  useSettingStore((state) => state.actions);
