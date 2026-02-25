import { Button } from "@/components/ui/button";
import { PenLine, Hand, Eraser } from "lucide-react";
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
	clearCanvas
}) {
  const [activePanel, setActivePanel] = useState(null);

  const togglePanel = (panel, toolName) => {
    setTool(toolName);
    setActivePanel((prev) => (prev === panel ? null : panel));
  };

  return (
    <div className="flex gap-2 absolute bottom-4 left-1/2 transform -translate-x-1/2">
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
            <EraserTool eraserSize={eraserSize} setEraserSize={setEraserSize} clearCanvas={clearCanvas}  />
          </div>
        )}
      </div>
    </div>
  );
}