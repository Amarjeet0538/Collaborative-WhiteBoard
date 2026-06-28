import { useEffect, useRef, useState, useCallback } from "react";
import { recognizeShape, buildShapeStroke } from "../lib/shapeSnapper.js";

// ── Constants ──────────────────────────────────────────────────────────────
const HOLD_DURATION_MS = 1000; // how long to hold before snapping
const HOLD_MOVE_THRESHOLD = 8; // px of world-space movement that cancels hold

const getDistanceToSegment = (p, v, w) => {
  const l2 = (v[0] - w[0]) ** 2 + (v[1] - w[1]) ** 2;
  if (l2 === 0) return Math.hypot(p[0] - v[0], p[1] - v[1]);
  let t = ((p[0] - v[0]) * (w[0] - v[0]) + (p[1] - v[1]) * (w[1] - v[1])) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(
    p[0] - (v[0] + t * (w[0] - v[0])),
    p[1] - (v[1] + t * (w[1] - v[1])),
  );
};

export const useCanvas = (props) => {
  const {
    tool,
    color,
    penSize,
    eraserSize,
    onStrokesChange,
    loadStrokes,
    onCursorMove,
    onShapeSnapped, // optional: callback({ shape, score }) for UI toast
    camera = { x: 0, y: 0, scale: 1 },
  } = props;

  const erasedDuringDrag = useRef(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const strokesRef = useRef([]);
  const currentStroke = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // ── Hold-to-snap refs ────────────────────────────────────────────────────
  const holdTimerRef = useRef(null); // setTimeout handle
  const holdStartPos = useRef(null); // {x, y} world coords at pen-down
  const snapFiredRef = useRef(false); // true after snap fires (blocks finishDrawing)

  // ── Coordinate helpers ───────────────────────────────────────────────────
  const getMouseCoordinates = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    return {
      x: (offsetX - camera.x) / camera.scale,
      y: (offsetY - camera.y) / camera.scale,
    };
  };

  // Same logic but from a Touch object (for pointer/touch events)
  const getTouchCoordinates = (touch, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const offsetX = touch.clientX - rect.left;
    const offsetY = touch.clientY - rect.top;
    return {
      x: (offsetX - camera.x) / camera.scale,
      y: (offsetY - camera.y) / camera.scale,
    };
  };

  // ── Cancel the hold timer (call whenever movement detected or pen lifts) ─
  const cancelHold = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  // ── Redraw ───────────────────────────────────────────────────────────────
  const redraw = useCallback(() => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const dpr = window.devicePixelRatio || 2;
    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.scale, camera.scale);

    const renderStroke = (stroke) => {
      if (!stroke || !stroke.points.length) return;
      ctx.beginPath();
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.size;
      ctx.globalCompositeOperation = "source-over";
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      stroke.points.forEach(([x, y], i) => {
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    strokesRef.current.forEach(renderStroke);
    if (currentStroke.current) renderStroke(currentStroke.current);

    ctx.restore();
  }, [camera]);

  // ── Eraser ────────────────────────────────────────────────────────────────
  const handleEraser = useCallback(
    (x, y) => {
      const hitRadius = eraserSize / 2 / camera.scale;
      let erasedSomething = false;

      const remaining = strokesRef.current.filter((stroke) => {
        if (stroke.points.length === 1) {
          const dist = Math.hypot(
            stroke.points[0][0] - x,
            stroke.points[0][1] - y,
          );
          if (dist <= hitRadius + stroke.size / 2) {
            erasedSomething = true;
            return false;
          }
        }
        for (let i = 0; i < stroke.points.length - 1; i++) {
          const dist = getDistanceToSegment(
            [x, y],
            stroke.points[i],
            stroke.points[i + 1],
          );
          if (dist <= hitRadius + stroke.size / 2) {
            erasedSomething = true;
            return false;
          }
        }
        return true;
      });

      if (erasedSomething) {
        strokesRef.current = remaining;
        erasedDuringDrag.current = true;
        redraw();
      }
    },
    [eraserSize, camera.scale, redraw],
  );

  // ── Canvas init ───────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 2;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    contextRef.current = ctx;
  }, []);

  useEffect(() => {
    if (loadStrokes) {
      strokesRef.current = [...loadStrokes];
      redraw();
    }
  }, [loadStrokes, redraw]);

  // ── Shape snap ────────────────────────────────────────────────────────────
  /**
   * Called after HOLD_DURATION_MS with no movement.
   * Runs $1 on the current stroke and replaces it with a perfect shape.
   */
  const triggerShapeSnap = useCallback(() => {
    if (!currentStroke.current) return;

    console.log(" SNAP FIRED", currentStroke.current?.points?.length, "points");
    snapFiredRef.current = true;
    holdTimerRef.current = null;

    const stroke = currentStroke.current;
    const { shape, score } = recognizeShape(stroke.points);
    // Stop accepting new points into this stroke
    console.log(
      "🎯 Recognized:",
      shape,
      "| Score:",
      (score * 100).toFixed(1) + "%",
    );
    console.log(
      "📍 Points count:",
      stroke.points.length,
      "| First:",
      stroke.points[0],
      "| Last:",
      stroke.points[stroke.points.length - 1],
    );
    currentStroke.current = null;

    const CONFIDENCE_THRESHOLD = 0.55;

    if (shape !== "unknown" && score >= CONFIDENCE_THRESHOLD) {
      const snapped = buildShapeStroke(shape, stroke);
      strokesRef.current.push(snapped);
      if (onStrokesChange) onStrokesChange([...strokesRef.current]);
      if (onShapeSnapped) onShapeSnapped({ shape, score });
    } else {
      // Low confidence → commit the raw stroke as-is
      strokesRef.current.push(stroke);
      if (onStrokesChange) onStrokesChange([...strokesRef.current]);
    }

    redraw();
  }, [onStrokesChange, onShapeSnapped, redraw]);

  // ── Drawing handlers ──────────────────────────────────────────────────────
  const startDrawing = (e) => {
    if (e.button !== undefined && e.button !== 0) return;
    const { x, y } = getMouseCoordinates(e);

    snapFiredRef.current = false;
    setIsDrawing(true);

    if (tool === "eraser") {
      handleEraser(x, y);
      return;
    }

    currentStroke.current = {
      id: crypto.randomUUID(),
      points: [[x, y]],
      color: color,
      size: penSize,
      tool: "pen",
      createdAt: Date.now(),
    };

    // Start the hold timer
    holdStartPos.current = { x, y };
    console.log("⏱ Hold timer started");
    holdTimerRef.current = setTimeout(triggerShapeSnap, HOLD_DURATION_MS);

    redraw();
  };

  const draw = (e) => {
    if (!isDrawing || tool === "hand") return;
    const { x, y } = getMouseCoordinates(e);
    const { offsetX, offsetY } = e.nativeEvent;
    if (onCursorMove) onCursorMove(offsetX, offsetY);

    if (tool === "eraser") {
      handleEraser(x, y);
      return;
    }

    // If snap already fired mid-stroke, ignore further movement
    if (snapFiredRef.current) return;

    if (currentStroke.current) {
      // Check if the pen moved too far from hold start → cancel hold
      if (holdStartPos.current) {
        const dx = x - holdStartPos.current.x;
        const dy = y - holdStartPos.current.y;
        if (Math.hypot(dx, dy) > HOLD_MOVE_THRESHOLD) {
          cancelHold();
          holdStartPos.current = null; // don't check again this stroke
        }
      }

      currentStroke.current.points.push([x, y]);
      redraw();
    }
  };

  const finishDrawing = () => {
    if (!isDrawing) return;

    cancelHold(); // always clean up the timer
    setIsDrawing(false);

    // If snap already fired, nothing left to do
    if (snapFiredRef.current) {
      snapFiredRef.current = false;
      return;
    }

    if (tool === "eraser") {
      if (erasedDuringDrag.current) {
        if (onStrokesChange) onStrokesChange([...strokesRef.current]);
        erasedDuringDrag.current = false;
      }
      return;
    }

    if (currentStroke.current) {
      strokesRef.current.push(currentStroke.current);
      if (onStrokesChange) onStrokesChange([...strokesRef.current]);
      currentStroke.current = null;
      redraw();
    }
  };

  // ── Clear ─────────────────────────────────────────────────────────────────
  const clearCanvas = useCallback(() => {
    cancelHold();
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];
    if (onStrokesChange) onStrokesChange([]);
  }, [onStrokesChange, cancelHold]);

  return { canvasRef, startDrawing, draw, finishDrawing, clearCanvas };
};
