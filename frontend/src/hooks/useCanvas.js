import { useEffect, useRef, useState, useCallback } from "react";

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

  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const strokesRef = useRef([]);
  const currentStroke = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

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
      ctx.globalCompositeOperation = stroke.composite;
      stroke.points.forEach(([x, y], i) => {
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke();
    };

    strokesRef.current.forEach(renderStroke);

    if (currentStroke.current) {
      renderStroke(currentStroke.current);
    }

    ctx.restore();
  }, [camera]);

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
      strokesRef.current = loadStrokes;
      redraw();
    }
  }, [loadStrokes, redraw]);

  const startDrawing = (e) => {
    const { x, y } = getMouseCoordinates(e);
    setIsDrawing(true);

    currentStroke.current = {
      points: [[x, y]],
      color: tool === "eraser" ? "rgba(0,0,0,1)" : color,
      size: tool === "eraser" ? eraserSize : penSize,
      composite: tool === "eraser" ? "destination-out" : "source-over",
    };

    redraw();
  };

  const draw = (e) => {
    if (!isDrawing || tool === "hand" || !currentStroke.current) return;

    const { x, y } = getMouseCoordinates(e);
    const { offsetX, offsetY } = e.nativeEvent;

    if (onCursorMove) onCursorMove(offsetX, offsetY);

    currentStroke.current.points.push([x, y]);
    redraw();
  };

  const finishDrawing = () => {
    if (!isDrawing || !currentStroke.current) return;
    setIsDrawing(false);

    strokesRef.current.push(currentStroke.current);
    if (onStrokesChange) onStrokesChange([...strokesRef.current]);

    currentStroke.current = null;
    redraw();
  };

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!ctx || !canvas) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    strokesRef.current = [];

    if (onStrokesChange) onStrokesChange([]);
  }, [onStrokesChange]);

  return { canvasRef, startDrawing, draw, finishDrawing, clearCanvas };
};
