import Canvas from "./Canvas";
import Editing_Buttons from "./Editing_Buttons";
import { useState } from "react";
import { useRef } from "react";

export default function Whiteboard() {
	const [tool, setTool] = useState("pen");
	const [color, setColor] = useState("black");
	const [penSize, setPenSize] = useState(5);
	const [eraserSize, setEraserSize] = useState(20);
	const clearCanvasRef = useRef(null);

	return (
		<>
			<Canvas
				tool={tool}
				color={color}
				penSize={penSize}
				eraserSize={eraserSize}
				onClearCanvas={(fn) => clearCanvasRef.current = fn
				}
			/>
			<Editing_Buttons
				setTool={setTool}
				color={color}
				setColor={setColor}
				penSize={penSize}
				setPenSize={setPenSize}
				eraserSize={eraserSize}
				setEraserSize={setEraserSize}
				clearCanvas={() => clearCanvasRef.current?.()}
			/>
		</>
	);
}
