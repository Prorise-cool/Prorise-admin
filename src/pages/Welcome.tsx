export default function WelcomePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">
        欢迎来到 Prorise-Admin (懒加载实现)
      </h1>
      <p>这个页面是通过 React.lazy 和 Suspense 实现代码分割的。</p>
    </div>
  );
}
