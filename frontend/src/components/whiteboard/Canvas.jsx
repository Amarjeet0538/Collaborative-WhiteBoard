import { forwardRef, useImperativeHandle } from "react";
import { useCanvas } from "../../hooks/useCanvas";
import { CANVAS_COLORS } from "../../utils/constants.js";

const Canvas = forwardRef((props, ref) => {
  const {
    tool,
    readOnly,
    cursors = {},
    camera = { x: 0, y: 0, scale: 1 },
    overrideCursor,
  } = props;
  const { canvasRef, startDrawing, draw, finishDrawing, clearCanvas } =
    useCanvas(props);

  useImperativeHandle(ref, () => ({
    clear: clearCanvas,
    getCanvas: () => canvasRef.current,
  }));
  const cursorStyle = overrideCursor
    ? overrideCursor
    : tool === "hand"
      ? "grab"
      : tool === "eraser"
        ? "cell"
        : "crosshair";

  const gridSize = 24 * camera.scale;
  return (
    <div className="fixed inset-0 w-screen h-screen">
      <canvas
        ref={canvasRef}
        onMouseDown={readOnly ? undefined : startDrawing}
        onMouseMove={readOnly ? undefined : draw}
        onMouseUp={readOnly ? undefined : finishDrawing}
        onMouseOut={finishDrawing}
        className="w-full h-full"
        style={{
          cursor: readOnly ? "default" : cursorStyle,
          background: CANVAS_COLORS[1],
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${camera.x}px ${camera.y}px`,
          backgroundImage: `linear-gradient(to right, ${CANVAS_COLORS[4]} 1px, transparent 1px), 
                            linear-gradient(to bottom, ${CANVAS_COLORS[4]} 1px, transparent 1px)`,
        }}
      />
      {/* Remote Cursors Overlay */}
      {Object.entries(cursors).map(([id, c]) => (
        <CursorOverlay key={id} cursor={c} />
      ))}
    </div>
  );
});

// Helper component to clean up the map function
const CursorOverlay = ({ cursor }) => (
  <div
    className="absolute pointer-events-none flex items-center gap-1"
    style={{ left: cursor.x, top: cursor.y, transform: "translate(0, -100%)" }}
  >
    <div
      className="w-2 h-2 rounded-full"
      style={{ backgroundColor: cursor.color }}
    />
    <span
      className="text-xs px-1 rounded text-white"
      style={{ backgroundColor: cursor.color }}
    >
      {cursor.username}
    </span>
  </div>
);

export default Canvas;
