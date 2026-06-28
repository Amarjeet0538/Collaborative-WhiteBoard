import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
} from "react";
import { useCanvas } from "../../hooks/useCanvas";
import { CANVAS_COLORS } from "../../utils/constants.js";
import { useTheme } from "@/context/ThemeContext";

// ── Snap flash toast ───────────────────────────────────────────────────────
const SHAPE_LABELS = {
  circle: "○ Circle",
  square: "□ Square",
  rectangle: "▭ Rectangle",
  triangle: "△ Triangle",
  rhombus: "◇ Rhombus",
  line: "— Line",
  arrow: "→ Arrow",
  plus: "+ Plus",
  star: "✦ Star",
};

const SnapToast = ({ snap }) => {
  if (!snap) return null;
  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50
                 flex items-center gap-2 px-4 py-2 rounded-full
                 bg-black/80 text-white text-sm font-medium
                 pointer-events-none select-none
                 animate-fade-in-up"
      style={{ backdropFilter: "blur(8px)" }}
    >
      <span>{SHAPE_LABELS[snap.shape] ?? snap.shape}</span>
      <span className="opacity-50 text-xs">
        {Math.round(snap.score * 100)}% match
      </span>
    </div>
  );
};

// ── Canvas ─────────────────────────────────────────────────────────────────
const Canvas = forwardRef((props, ref) => {
  const {
    tool,
    color = "#000000",
    readOnly,
    cursors = {},
    camera = { x: 0, y: 0, scale: 1 },
    overrideCursor,
    penSize = 5,
    eraserSize = 20,
  } = props;

  const { isDark } = useTheme();
  const backgroundColor = isDark ? CANVAS_COLORS[0] : CANVAS_COLORS[1];
  const cursorBorderColor = isDark ? "#ffffff" : "#000000";

  // ── Snap toast state ─────────────────────────────────────────────────────
  const [snapInfo, setSnapInfo] = useState(null);
  const snapToastTimer = useRef(null);

  const handleShapeSnapped = useCallback(({ shape, score }) => {
    if (snapToastTimer.current) clearTimeout(snapToastTimer.current);
    setSnapInfo({ shape, score });
    snapToastTimer.current = setTimeout(() => setSnapInfo(null), 1800);
  }, []);

  // ── useCanvas ────────────────────────────────────────────────────────────
  const { canvasRef, startDrawing, draw, finishDrawing, clearCanvas } =
    useCanvas({ ...props, onShapeSnapped: handleShapeSnapped });

  const customCursorRef = useRef(null);

  useImperativeHandle(ref, () => ({
    clear: clearCanvas,
    getCanvas: () => canvasRef.current,
  }));

  // ── Mouse handlers ────────────────────────────────────────────────────────
  const handleMouseMove = (e) => {
    if (customCursorRef.current) {
      customCursorRef.current.style.left = `${e.nativeEvent.offsetX}px`;
      customCursorRef.current.style.top = `${e.nativeEvent.offsetY}px`;
    }
    if (!readOnly && draw) draw(e);
  };

  const handleMouseOut = (e) => {
    if (customCursorRef.current) customCursorRef.current.style.opacity = "0";
    finishDrawing(e);
  };

  const handleMouseEnter = () => {
    if (customCursorRef.current) customCursorRef.current.style.opacity = "1";
  };

  // ── Touch / Pointer handlers (iPad support) ───────────────────────────────
  // We synthesise a fake nativeEvent so the existing coordinate math works
  // unchanged — useCanvas reads e.nativeEvent.offsetX / offsetY.

  const makeFakeEvent = (touch, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return {
      button: 0,
      nativeEvent: {
        offsetX: touch.clientX - rect.left,
        offsetY: touch.clientY - rect.top,
      },
    };
  };

  const handleTouchStart = (e) => {
    if (readOnly) return;
    e.preventDefault(); // stop scroll / zoom hijack
    const touch = e.touches[0];
    const fake = makeFakeEvent(touch, canvasRef.current);
    startDrawing(fake);
  };

  const handleTouchMove = (e) => {
    if (readOnly) return;
    e.preventDefault();
    const touch = e.touches[0];
    const fake = makeFakeEvent(touch, canvasRef.current);

    // Keep custom cursor in sync on touch
    if (customCursorRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      customCursorRef.current.style.left = `${touch.clientX - rect.left}px`;
      customCursorRef.current.style.top = `${touch.clientY - rect.top}px`;
    }

    draw(fake);
  };

  const handleTouchEnd = () => {
    finishDrawing();
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const showCustomCursor = (tool === "pen" || tool === "eraser") && !readOnly;
  const isPen = tool === "pen";
  const activeSize = (isPen ? penSize : eraserSize) * camera.scale;
  const cursorStyle = overrideCursor
    ? overrideCursor
    : showCustomCursor
      ? "none"
      : tool === "hand"
        ? "grab"
        : "default";
  const gridSize = 24 * camera.scale;

  return (
    <div className="fixed inset-0 w-screen h-screen">
      <canvas
        ref={canvasRef}
        // Mouse
        onMouseDown={readOnly ? undefined : startDrawing}
        onMouseMove={handleMouseMove}
        onMouseUp={readOnly ? undefined : finishDrawing}
        onMouseOut={handleMouseOut}
        onMouseEnter={handleMouseEnter}
        // Touch (iPad / stylus)
        onTouchStart={readOnly ? undefined : handleTouchStart}
        onTouchMove={readOnly ? undefined : handleTouchMove}
        onTouchEnd={readOnly ? undefined : handleTouchEnd}
        onTouchCancel={readOnly ? undefined : handleTouchEnd}
        className="w-full h-full touch-none" // touch-none stops browser scroll interference
        style={{
          cursor: cursorStyle,
          background: backgroundColor,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: `${camera.x}px ${camera.y}px`,
        }}
      />

      {/* Dynamic cursor overlay */}
      {showCustomCursor && (
        <div
          ref={customCursorRef}
          className="absolute pointer-events-none rounded-full z-50 transition-opacity duration-150"
          style={{
            width: `${activeSize}px`,
            height: `${activeSize}px`,
            transform: "translate(-50%, -50%)",
            top: "-9999px",
            left: "-9999px",
            backgroundColor: isPen ? color : "rgba(255, 255, 255, 0.4)",
            border: `1.5px solid ${cursorBorderColor}`,
            boxShadow: isPen ? "0 0 2px rgba(0,0,0,0.4)" : "none",
          }}
        />
      )}

      {/* Shape snap toast */}
      <SnapToast snap={snapInfo} />

      {/* Remote cursors */}
      {Object.entries(cursors).map(([id, c]) => (
        <CursorOverlay key={id} cursor={c} />
      ))}
    </div>
  );
});

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

/* ── Add this to your index.css or tailwind config ────────────────────────
   The snap toast uses animate-fade-in-up.
   Add this to your CSS if it's not already there:

@keyframes fade-in-up {
  from { opacity: 0; transform: translate(-50%, 12px); }
  to   { opacity: 1; transform: translate(-50%, 0); }
}
.animate-fade-in-up {
  animation: fade-in-up 0.2s ease-out forwards;
}
*/
