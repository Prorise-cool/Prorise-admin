// 1. 导入依赖项
import Logo from "@/components/brand/Logo"; // 导入在第 10 章创建的 Logo 组件

// 2. 导入 SettingButton (假设存在，将在后续章节实现)
//    注意：即使 SettingButton 尚未实现，这里先进行导入和使用，
//    是为了结构完整性。稍后创建 SettingButton 时，这里会自动生效。
//    在实际开发中，可以暂时注释掉或用占位符替代。
// import SettingButton from "./setting-button"; // 假设 SettingButton 在同级目录下

/**
 * SimpleLayout 使用的简化版页眉。
 * 包含 Logo 和设置按钮。
 */
export default function HeaderSimple() {
  // 思考：为什么使用 <header> 语义化标签？
  // <header> 明确告知浏览器和辅助技术，这部分内容是页面的介绍性内容或导航辅助工具，
  // 有助于 SEO 和可访问性。
  return (
    // 3. 使用 <header> 标签，并应用 Tailwind 进行样式化
    <header className="flex h-16 w-full items-center justify-between px-6">
      <Logo width={30} height={30} />
      {/* <SettingButton /> */}
    </header>
  );
}
