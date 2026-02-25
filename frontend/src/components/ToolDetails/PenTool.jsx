
export default function PenTool({ color, setColor, penSize, setPenSize }) {
	const colors = ["black", "red", "blue", "green", "yellow"];

	return (
		<div className=" p-4 bg-white rounded-lg shadow-lg flex flex-col gap-4">
			<div className="flex gap-2">
				{colors.map((c) => (
					<button
						key={c}
						className={`w-8 h-8 rounded-sm cursor-pointer  ${color === c ? "ring-3  ring-gray-500" : ""}`}
						style={{ backgroundColor: c }}
						onClick={() => setColor(c)}
					></button>
				))}

				{/* color picker */}
				<input
					type="color"
					value={color}
					onChange={(e) => setColor(e.target.value)}
					className="w-8 h-8 cursor-pointer rounded-sm"
				></input>
			</div>

			<div className="flex items-center gap-2 w-full">
				<input
					type="range"
					value={penSize}
					min="1"
					max="10"
					onChange={(e) => setPenSize(Number(e.target.value))}
				/>
			</div>
		</div>
	);
}
