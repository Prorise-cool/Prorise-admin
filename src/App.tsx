function App() {
	const [count, setCount] = useState(0);
	let unusedVar = "Prorise";

	return (
		<>
			<h1>Prorise-Admin</h1>
			<p>Count: {count}</p>
			<button type="button" onClick={() => setCount(count + 1)}>
				Increment
			</button>
		</>
	);
}

export default App;
