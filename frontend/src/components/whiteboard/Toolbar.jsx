import { useState } from "react";
import {
  PenLine,
  Hand,
  Eraser,
  ZoomIn,
  ZoomOut,
  Undo2,
  Redo2,
} from "lucide-react";
import PenTool from "../ToolDetails/PenTool";
import EraserTool from "../ToolDetails/EraserTool";

// Reusable toolbar button
function ToolBtn({ active, onClick, title, children, className = "" }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer
        hover:bg-background-highlight active:scale-90
        ${
          active
            ? "bg-background-highlight text-primary-foreground shadow-sm"
            : "text-foreground/70 hover:text-foreground"
        } ${className}`}
    >
      {children}
    </button>
  );
}

// Thin vertical divider
function Divider() {
  return <div className="w-px h-5 bg-border/60 mx-0.5 flex-shrink-0" />;
}

export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  penSize,
  setPenSize,
  eraserSize,
  setEraserSize,
  scale,
  zoomIn,
  zoomOut,
  clearCanvas,
}) {
  const [activePanel, setActivePanel] = useState(null);

  const handleToolClick = (panelName, toolName) => {
    setTool(toolName);
    setActivePanel((prev) => (prev === panelName ? null : panelName));
  };

  const undo = () => {};
  const redo = () => {};

  return (
    /* Single unified pill, centred at the bottom */
    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20">
      {/* Floating sub-panels (pen options, eraser options) */}
      <div className="relative flex justify-center">
        {activePanel === "pen" && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <PenTool
              i
              color={color}
              setColor={setColor}
              penSize={penSize}
              setPenSize={setPenSize}
            />
          </div>
        )}
        {activePanel === "eraser" && (
          <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in-95 duration-150">
            <EraserTool
              eraserSize={eraserSize}
              setEraserSize={setEraserSize}
              clearCanvas={clearCanvas}
            />
          </div>
        )}
      </div>

      {/* Main pill */}
      <div
        className="flex items-center gap-0.5 px-2 py-1.5
        bg-background border border-border/40
        rounded-2xl shadow-lg backdrop-blur-md  text-foreground "
      >
        {/* Undo / Redo */}
        <ToolBtn onClick={undo} title="Undo (Ctrl+Z)">
          <Undo2 size={17} />
        </ToolBtn>
        <ToolBtn onClick={redo} title="Redo (Ctrl+Shift+Z)">
          <Redo2 size={17} />
        </ToolBtn>

        <Divider />

        {/* Zoom */}
        <ToolBtn onClick={zoomOut} title="Zoom out">
          <ZoomOut size={17} />
        </ToolBtn>

        <div className="w-12 text-center text-xs font-semibold text-foreground/60 tabular-nums select-none">
          {(scale * 100).toFixed(0)}%
        </div>

        <ToolBtn onClick={zoomIn} title="Zoom in">
          <ZoomIn size={17} />
        </ToolBtn>

        <Divider />

        {/* Pen */}
        <ToolBtn
          active={tool === "pen"}
          onClick={() => handleToolClick("pen", "pen")}
          title="Pen"
        >
          <PenLine size={17} />
        </ToolBtn>

        {/* Hand */}
        <ToolBtn
          active={tool === "hand"}
          onClick={() => handleToolClick(null, "hand")}
          title="Hand (Space)"
        >
          <Hand size={17} />
        </ToolBtn>

        {/* Eraser */}
        <ToolBtn
          active={tool === "eraser"}
          onClick={() => handleToolClick("eraser", "eraser")}
          title="Eraser"
        >
          <Eraser size={17} />
        </ToolBtn>

        {/* Active colour swatch (pen only) */}
        {tool === "pen" && (
          <>
            <Divider />
            <div
              className="w-5 h-5 rounded-full ring-2 ring-offset-2 ring-offset-foreground 
ring-border/40 cursor-pointer flex-shrink-0 mx-1"
              style={{ backgroundColor: color }}
              onClick={() => handleToolClick("pen", "pen")}
              title="Pen colour"
            />
          </>
        )}
      </div>
    </div>
  );
}
