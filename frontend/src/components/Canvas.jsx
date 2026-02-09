import { useEffect } from "react";
import { useRef } from "react";
import Editing_Buttons from "./Editing_Buttons";
import { useState } from "react";

export default function Canvas() {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [isDrawing, setIsDrawing] = useState(false);

	useEffect(() => {
		const canvas = canvasRef.current;

		canvas.width = window.innerWidth * 2;
		canvas.height = window.innerHeight * 2;
		canvas.style.width = `${window.innerWidth}px`;
		canvas.style.height = `${window.innerHeight}px`;

		const ctx = canvas.getContext("2d");
		ctx.scale(2, 2);
		ctx.lineCap = "round";
		ctx.strokeStyle = "black";
		ctx.lineWidth = 5;

		contextRef.current = ctx;
	});

	// When mouse is pressed down
	const startDrawing = ({ e }) => {
		setIsDrawing(true);
	};

	// When mouse is released
	const finishDrawing = () => {
		setIsDrawing(false);
	};

	// When mouse moves
	const draw = ({ e }) => {
		if (!isDrawing) {
			return;
		}
	};

	return (
		<div className="p-2 w-full h-full relative">
			<canvas
				id="canvas"
				onMouseDown={startDrawing}
				onMouseUp={finishDrawing}
				onMouseMove={draw}
				ref={canvasRef}
				className="border-2 border-gray-300 rounded-lg w-full h-full "
				style={{
					background: "#fafafa",
					backgroundImage: `
          linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px),
          radial-gradient(circle, rgba(0,0,0,0.08) 1px, transparent 1px)
        `,
					backgroundSize: "24px 24px, 24px 24px, 24px 24px",
				}}
			>
				Your browser does not support the HTML5 canvas element.
			</canvas>

			<Editing_Buttons />
		</div>
	);
}
