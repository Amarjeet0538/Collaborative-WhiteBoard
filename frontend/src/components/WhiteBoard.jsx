import Canvas from "./Canvas";
import DarkModeToggle from "./DarkModeToggle";
import Editing_Buttons from "./Editing_Buttons";
import { useState } from "react";
import { useRef } from "react";

export default function Whiteboard() {
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("black");
  const [penSize, setPenSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [zoom, setZoom] = useState(1);
  const clearCanvasRef = useRef(null);

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <div className="text-foreground bg-background p-1 rounded-md border border-border-muted text-xl absolute top-3 left-3 ">
        Project Name
      </div>
      <div className="absolute top-3 right-4 ">
        <DarkModeToggle />
      </div>
      <Canvas
        tool={tool}
        color={color}
        penSize={penSize}
        eraserSize={eraserSize}
        zoom={zoom}
        setZoom={setZoom}
        onClearCanvas={(fn) => (clearCanvasRef.current = fn)}
      />

      <Editing_Buttons
        setTool={setTool}
        color={color}
        setColor={setColor}
        penSize={penSize}
        setPenSize={setPenSize}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        zoom={zoom}
        setZoom={setZoom}
        clearCanvas={() => clearCanvasRef.current?.()}
      />
    </div>
  );
}
