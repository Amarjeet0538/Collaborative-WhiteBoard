import { useState } from 'react';
import { PenLine, Hand, Eraser, ZoomIn, ZoomOut } from 'lucide-react';
import PenTool from '../ToolDetails/PenTool';
import EraserTool from '../ToolDetails/EraserTool';
import { ZOOM } from '../../utils/constants.js';

export default function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  penSize,
  setPenSize,
  eraserSize,
  setEraserSize,
  zoom,
  setZoom,
  clearCanvas,
}) {
  const [activePanel, setActivePanel] = useState(null);

  const handleToolClick = (panelName, toolName) => {
    setTool(toolName);
    setActivePanel((prev) => (prev === panelName ? null : panelName));
  };

  const zoomIn = () => setZoom((z) => Math.min(z + ZOOM.STEP, ZOOM.MAX));
  const zoomOut = () => setZoom((z) => Math.max(z - ZOOM.STEP, ZOOM.MIN));

  return (
    <div className="flex gap-2 absolute bottom-5 left-1/2 transform -translate-x-1/2 text-foreground">
      {/* Zoom Controls */}
      <div className="px-2 flex items-center justify-center cursor-pointer bg-background rounded-md border border-border-muted/50 hover:border-border-muted hover:bg-background-highlight">
        <button
          className="text-lg cursor-pointer border-none hover:bg-background p-0"
          onClick={zoomIn}
          title="Zoom in"
        >
          <ZoomIn size={20} />
        </button>
        <div className="relative px-4 py-2 rounded-lg text-md z-10">
          {(zoom * 100).toFixed(0)}%
        </div>
        <button
          className="text-lg cursor-pointer border-none hover:bg-background p-0"
          onClick={zoomOut}
          title="Zoom out"
        >
          <ZoomOut size={20} />
        </button>
      </div>

      {/* Pen Tool */}
      <div className="relative">
        <button
          className="p-2 flex items-center justify-center cursor-pointer bg-background w-10 h-10 rounded-md border border-border-muted/50 hover:border-border-muted hover:bg-background-highlight"
          onClick={() => handleToolClick('pen', 'pen')}
        >
          <PenLine />
        </button>
        {activePanel === 'pen' && (
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

      {/* Hand Tool */}
      <button
        className="p-2 flex items-center justify-center cursor-pointer bg-background w-10 h-10 rounded-md border border-border-muted/50 hover:border-border-muted hover:bg-background-highlight"
        onClick={() => {
          setTool('hand');
          setActivePanel(null);
        }}
      >
        <Hand />
      </button>

      {/* Eraser Tool */}
      <div className="relative">
        <button
          className="p-2 flex items-center justify-center cursor-pointer bg-background w-10 h-10 rounded-md border border-border-muted/50 hover:border-border-muted hover:bg-background-highlight"
          onClick={() => handleToolClick('eraser', 'eraser')}
        >
          <Eraser />
        </button>
        {activePanel === 'eraser' && (
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