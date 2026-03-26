import { useEffect, useRef, useState, useCallback } from "react";

// Defining colors locally to prevent import errors
const CANVAS_COLORS = {
	ERASER: "rgba(0,0,0,1)",
	BACKGROUND: "#fafafa",
	GRID_LINE: "rgba(0,0,0,0.04)",
	GRID_DOT: "rgba(0,0,0,0.08)",
};

export default function Canvas({
	tool,
	color,
	penSize,
	eraserSize,
	zoom,
	setZoom,
	onStrokesChange,
	loadStrokes,
	readOnly = false,
	onCursorMove,
	cursors = {},
	onClearCanvas,
}) {
	const canvasRef = useRef(null);
	const contextRef = useRef(null);
	const [isDrawing, setIsDrawing] = useState(false);
	const strokesRef = useRef([]);
	const currentStroke = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		const rect = canvas.getBoundingClientRect();
		const dpr = window.devicePixelRatio || 2;
		canvas.width = rect.width * dpr;
		canvas.height = rect.height * dpr;
		const ctx = canvas.getContext("2d");
		ctx.scale(dpr, dpr);
		ctx.lineJoin = "round";
		ctx.lineCap = "round";
		contextRef.current = ctx;
	}, []);

	const redraw = useCallback(() => {
		const canvas = canvasRef.current;
		const ctx = contextRef.current;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		strokesRef.current.forEach((stroke) => {
			ctx.beginPath();
			ctx.strokeStyle = stroke.color;
			ctx.lineWidth = stroke.size;
			ctx.globalCompositeOperation = stroke.composite;
			stroke.points.forEach(([x, y], i) => {
				i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
			});
			ctx.stroke();
			ctx.closePath();
		});
		ctx.globalCompositeOperation = "source-over";
	}, []);

	useEffect(() => {
		if (loadStrokes && loadStrokes.length > 0) {
			strokesRef.current = loadStrokes;
			redraw();
		}
	}, [loadStrokes, redraw]);

	const startDrawing = ({ nativeEvent }) => {
		const { offsetX, offsetY } = nativeEvent;
		setIsDrawing(true);

		// Fixed the interrupted section here
		currentStroke.current = {
			points: [[offsetX, offsetY]],
			color: tool === "eraser" ? CANVAS_COLORS.ERASER : color,
			size: tool === "eraser" ? eraserSize : penSize,
			composite: tool === "eraser" ? "destination-out" : "source-over",
		};

		contextRef.current.beginPath();
		contextRef.current.moveTo(offsetX, offsetY);
	};

	const finishDrawing = () => {
		if (!isDrawing || !currentStroke.current) return;
		setIsDrawing(false);
		contextRef.current.closePath();
		strokesRef.current.push(currentStroke.current);
		currentStroke.current = null;
		if (onStrokesChange) onStrokesChange([...strokesRef.current]);
	};

	const draw = ({ nativeEvent }) => {
		if (!isDrawing || tool === "hand" || !currentStroke.current) return;
		const { offsetX, offsetY } = nativeEvent;

		if (onCursorMove) onCursorMove(offsetX, offsetY);
		currentStroke.current.points.push([offsetX, offsetY]);

		if (tool === "eraser") {
			contextRef.current.globalCompositeOperation = "destination-out";
			contextRef.current.lineWidth = eraserSize;
		} else {
			contextRef.current.globalCompositeOperation = "source-over";
			contextRef.current.lineWidth = penSize;
			contextRef.current.strokeStyle = color;
		}

		contextRef.current.lineTo(offsetX, offsetY);
		contextRef.current.stroke();
	};

	const clearCanvas = useCallback(() => {
		const canvas = canvasRef.current;
		contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
		strokesRef.current = [];
		if (onStrokesChange) onStrokesChange([]);
	}, [onStrokesChange]);

	// Expose the clearCanvas method to the parent component
	useEffect(() => {
		if (onClearCanvas) onClearCanvas(clearCanvas);
	}, [clearCanvas, onClearCanvas]);

	const cursorStyle =
		tool === "hand" ? "grab" : tool === "eraser" ? "cell" : "crosshair";

	return (
		<div className="w-full h-full relative">
			<canvas
				id="canvas"
				onMouseDown={readOnly ? undefined : startDrawing}
				onMouseUp={readOnly ? undefined : finishDrawing}
				onMouseMove={readOnly ? undefined : draw}
				onMouseOut={readOnly ? undefined : finishDrawing} // Catch mouse leaving canvas
				onWheel={(e) => e.preventDefault()}
				ref={canvasRef}
				className="w-full h-full"
				style={{
					cursor: readOnly ? "default" : cursorStyle,
					background: CANVAS_COLORS.BACKGROUND,
					backgroundImage: `
            linear-gradient(to right, ${CANVAS_COLORS.GRID_LINE} 1px, transparent 1px),
            linear-gradient(to bottom, ${CANVAS_COLORS.GRID_LINE} 1px, transparent 1px),
            radial-gradient(circle, ${CANVAS_COLORS.GRID_DOT} 1px, transparent 1px)
          `,
					backgroundSize: "24px 24px, 24px 24px, 24px 24px",
				}}
			/>
			{Object.entries(cursors).map(([socketId, cursor]) => (
				<div
					key={socketId}
					className="absolute pointer-events-none z-20 flex items-center gap-1 transition-all duration-75"
					style={{
						left: cursor.x,
						top: cursor.y,
						transform: "translate(0, -100%)",
					}}
				>
					<div
						className="w-2 h-2 rounded-full shadow-sm"
						style={{ backgroundColor: cursor.color }}
					/>
					<span
						className="text-xs px-1 py-0.5 rounded text-white font-medium shadow-sm"
						style={{ backgroundColor: cursor.color }}
					>
						{cursor.username}
					</span>
				</div>
			))}
		</div>
	);
}
