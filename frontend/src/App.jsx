import Header from "./components/Header";
import Canvas from "./components/Canvas";
function App() {
	return (
		<div className="p-2 font-body flex flex-col  h-screen gap-2 bg-gray-100">
			<Header />

			<div className="flex-1 min-h-0">
					<Canvas />
			</div>
		</div>
	);
}

export default App;
