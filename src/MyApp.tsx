function MyApp() {
	return (
		<div className="flex items-center justify-center min-h-screen bg-gray-100">
			<div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
				<div className="text-center">
					{/* Ant Design 的 Typography 组件 */}
					<Typography.Title>Antd Title (h1)</Typography.Title>
					<Typography.Title level={2}>Antd Title (h2)</Typography.Title>
					<Typography.Text>This is an Antd Text component.</Typography.Text>
					<Button type="primary" className="ml-4">
						Primary Button
					</Button>
				</div>

				<div className="text-center">
					{/* 原生 HTML 标签 */}
					<h1>Native h1</h1>
					<h2>Native h2</h2>
					<p>This is a native p tag.</p>
				</div>
			</div>
		</div>
	);
}

export default MyApp;
