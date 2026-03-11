import { useEffect } from "react";
import { useRef } from "react";
import { useState } from "react";
import { useCallback } from "react";

export default function Canvas({
  tool,
  color,
  penSize,
  eraserSize,
  onClearCanvas,
  zoom,
  setZoom,
}) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const viewportTransform = { x: 0, y: 0, scale: 1 };
  let previousX = 0,
    previousY = 0;

  useEffect(() => {
    const canvas = canvasRef.current;

    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 2;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    const ctx = canvas.getContext("2d");

    //pen;
    ctx.scale(dpr, dpr);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth = penSize;

    contextRef.current = ctx;
  }, []);

  useEffect(() => {
    if (!contextRef.current) return;
    contextRef.current.strokeStyle = color;
    contextRef.current.lineWidth = penSize;
  }, [color, penSize]);

  // When mouse is pressed down
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    setIsDrawing(true);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
  };

  // When mouse is releasedz
  const finishDrawing = () => {
    setIsDrawing(false);
    contextRef.current.closePath();
  };

  // When mouse moves
  const draw = ({ nativeEvent }) => {
    if (!isDrawing || tool === "hand") return;

    if (tool === "eraser") {
      contextRef.current.globalCompositeOperation = "destination-out";
      contextRef.current.lineWidth = eraserSize;
    } else {
      contextRef.current.globalCompositeOperation = "source-over";
      contextRef.current.lineWidth = penSize;
      contextRef.current.strokeStyle = color;
    }

    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
  }, []);

  const handleWheel = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    if (onClearCanvas) onClearCanvas(clearCanvas);
  }, [clearCanvas, onClearCanvas]);

  const cursorStyle =
    tool === "hand" ? "grab" : tool === "eraser" ? "cell" : "crosshair";

  return (
    <div className="w-full h-full relative">
      <canvas
        id="canvas"
        onMouseDown={startDrawing}
        onMouseUp={finishDrawing}
        onMouseMove={draw}
        onWheel={handleWheel}
        ref={canvasRef}
        className="border-2 border-gray-300 rounded-lg w-full h-full "
        style={{
          cursor: cursorStyle,
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
    </div>
  );
}
