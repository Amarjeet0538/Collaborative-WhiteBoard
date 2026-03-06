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
    <div className="flex items-center flex-col bg-background-muted p-2">
      <div className="flex gap-5 justify-between bg-background items-center">
        <div className="text-foreground text-xl ">Project Name</div>
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
