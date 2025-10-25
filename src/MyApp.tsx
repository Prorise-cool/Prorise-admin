import { Button as AntButton, Card as AntCard, Space } from "antd";
import { useSettingActions, useSettings } from "@/store/settingStore";
import { ThemeColorPresets, ThemeMode } from "@/theme/types/enum";

function MyApp() {
  const settings = useSettings();
  const { setSettings } = useSettingActions();

  // 切换亮暗模式
  const toggleThemeMode = () => {
    setSettings({
      themeMode:
        settings.themeMode === ThemeMode.Light
          ? ThemeMode.Dark
          : ThemeMode.Light,
    });
  };

  // 切换主题预设
  const changeColorPreset = (preset: ThemeColorPresets) => {
    setSettings({ themeColorPresets: preset });
  };

  return (
    <div className="min-h-screen bg-bg-default p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 标题 */}
        <h1 className="text-4xl font-bold text-text-primary text-center mb-12">
          主题系统测试页面
        </h1>

        {/* 控制面板 */}
        <div className="flex flex-col items-center gap-6 p-6 bg-bg-paper rounded-lg shadow-card">
          <h2 className="text-2xl font-semibold text-text-primary">主题控制</h2>

          {/* 亮暗模式切换 */}
          <div className="flex items-center gap-4">
            <span className="text-text-secondary">当前模式:</span>
            <button
              type="button"
              onClick={toggleThemeMode}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity shadow-primary"
            >
              {settings.themeMode === ThemeMode.Light
                ? "🌞 切换到暗色"
                : "🌙 切换到亮色"}
            </button>
          </div>

          {/* 主题预设切换 */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-text-secondary">选择主题色:</span>
            <div className="flex flex-wrap gap-3 justify-center">
              {Object.values(ThemeColorPresets).map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => changeColorPreset(preset)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    settings.themeColorPresets === preset
                      ? "bg-primary text-white shadow-lg scale-105"
                      : "bg-bg-neutral text-text-primary hover:bg-action-hover"
                  }`}
                >
                  {preset.charAt(0).toUpperCase() + preset.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 卡片对比 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Tailwind CSS 卡片 */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-primary text-center">
              Tailwind CSS 卡片
            </h3>
            <div className="bg-bg-paper rounded-lg shadow-card p-6 space-y-4">
              <h4 className="text-lg font-semibold text-primary">
                使用 Tailwind 构建
              </h4>
              <p className="text-text-secondary">
                这个卡片使用了我们自定义的 Tailwind CSS
                类名，包括颜色、间距、圆角和阴影。
              </p>

              {/* 颜色展示 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-primary rounded"></div>
                  <span className="text-text-primary text-sm">Primary</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-success rounded"></div>
                  <span className="text-text-primary text-sm">Success</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-warning rounded"></div>
                  <span className="text-text-primary text-sm">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-error rounded"></div>
                  <span className="text-text-primary text-sm">Error</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-info rounded"></div>
                  <span className="text-text-primary text-sm">Info</span>
                </div>
              </div>

              {/* 按钮示例 */}
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  className="px-4 py-2 bg-primary text-white rounded hover:opacity-90"
                >
                  Primary
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-success text-white rounded hover:opacity-90"
                >
                  Success
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-warning text-white rounded hover:opacity-90"
                >
                  Warning
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-error text-white rounded hover:opacity-90"
                >
                  Error
                </button>
              </div>
            </div>
          </div>

          {/* Ant Design 卡片 */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-text-primary text-center">
              Ant Design 卡片
            </h3>
            <AntCard
              title="使用 Ant Design 构建"
              bordered={false}
              style={{ boxShadow: "var(--shadows-card)" }}
            >
              <p style={{ marginBottom: 16 }}>
                这个卡片使用了 Ant Design 组件，通过 AntdAdapter
                自动应用了我们的主题令牌。
              </p>

              <Space direction="vertical" style={{ width: "100%" }}>
                <AntButton type="primary" block>
                  Primary Button
                </AntButton>
                <AntButton type="default" block>
                  Default Button
                </AntButton>
                <AntButton type="dashed" block>
                  Dashed Button
                </AntButton>
                <AntButton type="text" block>
                  Text Button
                </AntButton>
                <AntButton type="link" block>
                  Link Button
                </AntButton>
              </Space>

              <Space style={{ marginTop: 16 }} wrap>
                <AntButton type="primary">Primary</AntButton>
                <AntButton type="primary" danger>
                  Danger
                </AntButton>
                <AntButton disabled>Disabled</AntButton>
              </Space>
            </AntCard>
          </div>
        </div>

        {/* 状态显示 */}
        <div className="bg-bg-paper p-6 rounded-lg shadow-card">
          <h3 className="text-xl font-semibold text-text-primary mb-4">
            当前主题配置
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-text-secondary">
            <div>
              <span className="font-medium">主题模式:</span>{" "}
              {settings.themeMode}
            </div>
            <div>
              <span className="font-medium">主题预设:</span>{" "}
              {settings.themeColorPresets}
            </div>
            <div>
              <span className="font-medium">字体:</span> {settings.fontFamily}
            </div>
            <div>
              <span className="font-medium">基础字号:</span> {settings.fontSize}
              px
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyApp;
