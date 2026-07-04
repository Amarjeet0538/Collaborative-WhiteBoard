// frontend/src/hooks/useCanvas.js
import { useEffect, useRef, useState, useCallback } from "react";
//import { recognizeAndSnap } from "../utils/shapeRecognizer.js";
//import { generateShapePoints } from "../utils/shapeGeometry.js";

import { recognizeShape } from "../utils/shapeRecognizer.js";
import {
  generatePerfectShape,
  generateShapePoints,
} from "../utils/shapeGeometry.js";

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
    shapeType = "rectangle",
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
  const shapeStartRef = useRef(null);
  const shapeEndRef = useRef(null);

  const [selectedId, setSelectedId] = useState(null);
  const dragStateRef = useRef(null); // { mode: 'move'|'resize', handle, originalPoints, startX, startY, bbox }

  const STABILITY_THRESHOLD = 10;
  const HOLD_DELAY = 1000; // 1 seconds

  // useCanvas.js
  const getMouseCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
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
    if (tool === "select" && selectedId) {
      const sel = strokesRef.current.find((s) => s.id === selectedId);
      if (sel) {
        const { minX, minY, maxX, maxY } = getStrokeBBox(sel);
        ctx.save();
        ctx.strokeStyle = "#3B82F6";
        ctx.lineWidth = 1 / camera.scale;
        ctx.setLineDash([6 / camera.scale, 4 / camera.scale]);
        ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
        ctx.setLineDash([]);
        ctx.fillStyle = "#3B82F6";
        const hs = HANDLE_SIZE / camera.scale;
        [
          [minX, minY],
          [maxX, minY],
          [minX, maxY],
          [maxX, maxY],
        ].forEach(([hx, hy]) => {
          ctx.fillRect(hx - hs / 2, hy - hs / 2, hs, hs);
        });
        ctx.restore();
      }
    }
    ctx.restore();
  }, [camera, tool, selectedId]);
  const hitTestStroke = (x, y) => {
    // iterate from topmost (last drawn) down
    for (let i = strokesRef.current.length - 1; i >= 0; i--) {
      const s = strokesRef.current[i];
      const pad = (s.size || 4) / 2 + 6 / camera.scale;
      for (let j = 0; j < s.points.length - 1; j++) {
        if (getDistanceToSegment([x, y], s.points[j], s.points[j + 1]) <= pad) {
          return s.id;
        }
      }
      if (s.points.length === 1) {
        if (Math.hypot(s.points[0][0] - x, s.points[0][1] - y) <= pad)
          return s.id;
      }
    }
    return null;
  };

  const getStrokeBBox = (stroke) => {
    let minX = Infinity,
      minY = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
    stroke.points.forEach(([x, y]) => {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    });
    return { minX, minY, maxX, maxY };
  };

  const HANDLE_SIZE = 8; // in workspace units, adjusted by scale when hit-testing

  const getHandleAt = (x, y, bbox) => {
    const s = HANDLE_SIZE / camera.scale;
    const corners = {
      tl: [bbox.minX, bbox.minY],
      tr: [bbox.maxX, bbox.minY],
      bl: [bbox.minX, bbox.maxY],
      br: [bbox.maxX, bbox.maxY],
    };
    for (const [key, [hx, hy]] of Object.entries(corners)) {
      if (Math.hypot(x - hx, y - hy) <= s) return key;
    }
    return null;
  };

  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    strokesRef.current = strokesRef.current.filter((s) => s.id !== selectedId);
    setSelectedId(null);
    redraw();
    if (onStrokesChange) onStrokesChange([...strokesRef.current]);
  }, [selectedId, redraw, onStrokesChange]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.key === "Delete" || e.key === "Backspace") && tool === "select") {
        // avoid firing while typing in an input elsewhere on the page
        if (document.activeElement?.tagName === "INPUT") return;
        deleteSelected();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [deleteSelected, tool]); // Maximum allowed movement radius (in workspace units) before resetting the 2s timer

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
  /*
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
*/

  const triggerShapeSnap = useCallback(async () => {
    const strokeAtStart = currentStroke.current;

    if (
      !strokeAtStart ||
      strokeAtStart.points.length <= 5 ||
      hasSnappedRef.current
    ) {
      return;
    }

    try {
      const predictedShape = await recognizeShape(strokeAtStart.points);
      if (predictedShape === "unknown") return;

      const snappedPoints = generatePerfectShape(
        strokeAtStart.points,
        predictedShape,
      );

      // Case 1: the stroke is still the one being actively drawn
      if (currentStroke.current === strokeAtStart) {
        currentStroke.current.points = snappedPoints;
        currentStroke.current.shapeType = predictedShape;
        hasSnappedRef.current = true;
        redraw();
        return;
      }

      // Case 2: the pointer was already lifted while we were awaiting —
      // the stroke has already been pushed into strokesRef by finishDrawing.
      const committed = strokesRef.current.find(
        (s) => s.id === strokeAtStart.id,
      );
      if (committed) {
        committed.points = snappedPoints;
        committed.shapeType = predictedShape;
        redraw();
        if (onStrokesChange) onStrokesChange([...strokesRef.current]);
      }
    } catch (error) {
      console.error("Shape snapping failed:", error);
    }
  }, [redraw, onStrokesChange]);
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
    // Only the primary mouse button starts a stroke; touch/pen pointerdown
    // is always button 0, so this naturally allows them through.
    if (e.pointerType === "mouse" && e.button !== 0) return;

    // Keep receiving move/up events even if the finger/cursor leaves the canvas
    e.target.setPointerCapture?.(e.pointerId);

    const { x, y } = getMouseCoordinates(e);
    setIsDrawing(true);
    if (tool === "select") {
      const sel = selectedId
        ? strokesRef.current.find((s) => s.id === selectedId)
        : null;
      if (sel) {
        const bbox = getStrokeBBox(sel);
        const handle = getHandleAt(x, y, bbox);
        if (handle) {
          dragStateRef.current = {
            mode: "resize",
            handle,
            bbox,
            originalPoints: sel.points.map((p) => [...p]),
            strokeId: sel.id,
          };
          return;
        }
      }
      const hitId = hitTestStroke(x, y);
      setSelectedId(hitId);
      if (hitId) {
        const s = strokesRef.current.find((st) => st.id === hitId);
        dragStateRef.current = {
          mode: "move",
          startX: x,
          startY: y,
          originalPoints: s.points.map((p) => [...p]),
          strokeId: hitId,
        };
      }
      redraw();
      return;
    }
    if (tool === "eraser") {
      handleEraser(x, y);
      return;
    }

    if (tool === "shape") {
      shapeStartRef.current = [x, y];
      shapeEndRef.current = [x, y];
      currentStroke.current = {
        id: crypto.randomUUID(),
        points: [[x, y]],
        color,
        size: penSize,
        tool: "shape",
        shapeType,
        createdAt: Date.now(),
      };
      redraw();
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
    if (tool === "select" && dragStateRef.current) {
      const s = strokesRef.current.find(
        (st) => st.id === dragStateRef.current.strokeId,
      );
      if (!s) return;
      const drag = dragStateRef.current;

      if (drag.mode === "move") {
        const dx = x - drag.startX;
        const dy = y - drag.startY;
        s.points = drag.originalPoints.map(([px, py]) => [px + dx, py + dy]);
      } else if (drag.mode === "resize") {
        const { bbox, handle, originalPoints } = drag;
        const anchor = {
          tl: [bbox.maxX, bbox.maxY],
          tr: [bbox.minX, bbox.maxY],
          bl: [bbox.maxX, bbox.minY],
          br: [bbox.minX, bbox.minY],
        }[handle];
        const origW = bbox.maxX - bbox.minX || 1;
        const origH = bbox.maxY - bbox.minY || 1;
        const scaleX =
          (x - anchor[0]) /
          ({ tl: bbox.minX, bl: bbox.minX, tr: bbox.maxX, br: bbox.maxX }[
            handle
          ] -
            anchor[0]);
        const scaleY =
          (y - anchor[1]) /
          ({ tl: bbox.minY, tr: bbox.minY, bl: bbox.maxY, br: bbox.maxY }[
            handle
          ] -
            anchor[1]);
        s.points = originalPoints.map(([px, py]) => [
          anchor[0] + (px - anchor[0]) * scaleX,
          anchor[1] + (py - anchor[1]) * scaleY,
        ]);
      }
      redraw();
      return;
    }
    if (tool === "eraser") {
      handleEraser(x, y);
      return;
    }
    if (tool === "shape") {
      if (currentStroke.current && shapeStartRef.current) {
        shapeEndRef.current = [x, y];
        currentStroke.current.points = generateShapePoints(
          shapeType,
          shapeStartRef.current,
          shapeEndRef.current,
        );
        redraw();
      }
      return;
    }

    if (currentStroke.current) {
      currentStroke.current.points.push([x, y]);

      if (!hasSnappedRef.current) {
        const driftDistance = Math.hypot(
          x - lastTrackedMousePos.current.x,
          y - lastTrackedMousePos.current.y,
        );
        if (driftDistance > STABILITY_THRESHOLD) {
          lastTrackedMousePos.current = { x, y };
          clearTimeout(holdTimerRef.current);
          holdTimerRef.current = setTimeout(triggerShapeSnap, HOLD_DELAY);
        }
      }

      redraw();
    }
  };

  const finishDrawing = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);
    clearTimeout(holdTimerRef.current);

    if (e?.target?.releasePointerCapture && e?.pointerId != null) {
      e.target.releasePointerCapture(e.pointerId);
    }
    if (tool === "select") {
      if (dragStateRef.current) {
        dragStateRef.current = null;
        if (onStrokesChange) onStrokesChange([...strokesRef.current]);
      }
      return;
    }
    if (tool === "eraser") {
      if (erasedDuringDrag.current) {
        if (onStrokesChange) onStrokesChange([...strokesRef.current]);
        erasedDuringDrag.current = false;
      }
      return;
    }
    if (tool === "shape") {
      const start = shapeStartRef.current;
      const end = shapeEndRef.current;
      const dragged =
        start && end && Math.hypot(end[0] - start[0], end[1] - start[1]) > 4;

      if (dragged && currentStroke.current) {
        strokesRef.current.push(currentStroke.current);
        if (onStrokesChange) onStrokesChange([...strokesRef.current]);
      }
      currentStroke.current = null;
      shapeStartRef.current = null;
      shapeEndRef.current = null;
      redraw();
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
