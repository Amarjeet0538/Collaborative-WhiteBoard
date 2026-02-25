import { Button } from "@/components/ui/button";
import { PenLine, Hand, Eraser, ZoomIn, ZoomOut } from "lucide-react";
import PenTool from "./ToolDetails/PenTool";
import EraserTool from "./ToolDetails/EraserTool";
import { useState } from "react";

export default function Editing_Buttons({
	color,
	setColor,
	penSize,
	setPenSize,
	setTool,
	eraserSize,
	setEraserSize,
	clearCanvas,
	zoom,
	setZoom,
}) {
	const [activePanel, setActivePanel] = useState(null);

	const togglePanel = (panel, toolName) => {
		setTool(toolName);
		setActivePanel((prev) => (prev === panel ? null : panel));
	};

	return (
		<div className="flex gap-2 absolute bottom-6 left-1/2 transform -translate-x-1/2">
			{/* Zoom Button */}
			<div className=" absolute -left-45 flex items-center gap-0 bg-white rounded-md">
				<Button
					variant="outline"
					size="lg"
					className="text-lg cursor-pointer border-none"
					onClick={() => setZoom((z) => Math.min(z + 0.1, 5))}
					title="Zoom in"
				>
					<ZoomIn size={20} />
				</Button>

				<div className="relative px-4 py-2 rounded-lg text-md z-10">
					{(zoom * 100).toFixed(0)}%
				</div>

				<Button
					variant="outline"
					size="lg"
					className="text-lg cursor-pointer border-none"
					onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
					title="Zoom out"
				>
					<ZoomOut size={20} />
				</Button>
			</div>

			{/* Pen Button */}
			<div className="relative">
				<Button
					variant="outline"
					size="lg"
					className="text-lg cursor-pointer"
					onClick={() => togglePanel("pen", "pen")}
				>
					<PenLine />
				</Button>
				{activePanel === "pen" && (
					<div
						className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50"
						onClick={(e) => e.stopPropagation()}
					>
						<PenTool
							color={color}
							setColor={setColor}
							penSize={penSize}
							setPenSize={setPenSize}
						/>
					</div>
				)}
			</div>

			{/* Hand Button */}
			<Button
				variant="outline"
				size="lg"
				className="text-lg cursor-pointer"
				onClick={() => {
					setTool("hand");
					setActivePanel(null);
				}}
			>
				<Hand />
			</Button>

			{/* Eraser Button */}
			<div className="relative">
				<Button
					variant="outline"
					size="lg"
					className="text-lg cursor-pointer"
					onClick={() => togglePanel("eraser", "eraser")}
				>
					<Eraser />
				</Button>
				{activePanel === "eraser" && (
					<div
						className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50"
						onClick={(e) => e.stopPropagation()}
					>
						<EraserTool
							eraserSize={eraserSize}
							setEraserSize={setEraserSize}
							clearCanvas={clearCanvas}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
