// frontend/src/hooks/useCanvas.js
import { useEffect, useRef, useState, useCallback } from "react";
import { recognizeAndSnap } from "../utils/shapeRecognizer.js";

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
    camera = { x: 0, y: 0, scale: 1 },
  } = props;

  const erasedDuringDrag = useRef(false);
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const strokesRef = useRef([]);
  const currentStroke = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Hold to Snap Timing References
  const holdTimerRef = useRef(null);
  const lastTrackedMousePos = useRef({ x: 0, y: 0 });
  const hasSnappedRef = useRef(false);

  // Maximum allowed movement radius (in workspace units) before resetting the 2s timer
  const STABILITY_THRESHOLD = 10;
  const HOLD_DELAY = 1000; // 2 seconds

  const getMouseCoordinates = (e) => {
    const { offsetX, offsetY } = e.nativeEvent;
    return {
      x: (offsetX - camera.x) / camera.scale,
      y: (offsetY - camera.y) / camera.scale,
    };
  };

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

  // Execution algorithm when hold window clears successfully
  const triggerShapeSnap = useCallback(() => {
    if (
      currentStroke.current &&
      currentStroke.current.points.length > 0 &&
      !hasSnappedRef.current
    ) {
      const snappedPoints = recognizeAndSnap(currentStroke.current.points);
      currentStroke.current.points = snappedPoints;
      hasSnappedRef.current = true;
      redraw();
    }
  }, [redraw]);

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

  const startDrawing = (e) => {
    if (e.button !== 0) return;
    const { x, y } = getMouseCoordinates(e);
    setIsDrawing(true);

    if (tool === "eraser") {
      handleEraser(x, y);
      return;
    }

    hasSnappedRef.current = false;
    currentStroke.current = {
      id: crypto.randomUUID(),
      points: [[x, y]],
      color: color,
      size: penSize,
      tool: "pen",
      createdAt: Date.now(),
    };

    // Set positions and kick off the timer setup
    lastTrackedMousePos.current = { x, y };
    clearTimeout(holdTimerRef.current);
    holdTimerRef.current = setTimeout(triggerShapeSnap, HOLD_DELAY);

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

    if (currentStroke.current) {
      currentStroke.current.points.push([x, y]);

      // Dynamic holding tracking loop
      if (!hasSnappedRef.current) {
        const driftDistance = Math.hypot(
          x - lastTrackedMousePos.current.x,
          y - lastTrackedMousePos.current.y,
        );

        // Reset timer window if user moves the cursor beyond the minor tremor threshold
        if (driftDistance > STABILITY_THRESHOLD) {
          lastTrackedMousePos.current = { x, y };
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = setTimeout(triggerShapeSnap, HOLD_DELAY);
        }
      }

      redraw();
    }
  };

  const finishDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    // Clean up active loop flags to protect future interactions
    clearTimeout(holdTimerRef.current);

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
      hasSnappedRef.current = false;
      redraw();
    }
  };

  const clearCanvas = useCallback(() => {
    const ctx = contextRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];
    if (onStrokesChange) onStrokesChange([]);
  }, [onStrokesChange]);

  return { canvasRef, startDrawing, draw, finishDrawing, clearCanvas };
};
