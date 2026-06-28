import { useState, useCallback, useRef } from "react";
import { whiteboardApi } from "../api/whiteboard.api.js";
export const useWhiteboard = (boardId, initialStrokes = []) => {
  const [strokes, setStrokes] = useState(initialStrokes);
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("black");
  const [penSize, setPenSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [zoom, setZoom] = useState(1);
  const saveTimeoutRef = useRef(null);

  const addStroke = useCallback((stroke) => {
    setStrokes((prev) => [...prev, stroke]);
  }, []);

  const clearStrokes = useCallback(() => setStrokes([]), []);

  const updateStrokes = useCallback((newStrokes) => setStrokes(newStrokes), []);

  const debouncedSave = useCallback((newStrokes, saveCallback) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(() => {
      saveCallback(newStrokes);
    }, 1000);
  }, []);

  const captureThumbnail = useCallback((canvas) => {
    if (!canvas) return null;

    const TARGET_W = 320;
    const TARGET_H = 180;

    const offscreen = document.createElement("canvas");
    offscreen.width = TARGET_W;
    offscreen.height = TARGET_H;

    const ctx = offscreen.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, TARGET_W, TARGET_H);
    ctx.drawImage(canvas, 0, 0, TARGET_W, TARGET_H);

    // 0.3 quality — thumbnails are tiny previews, no need for higher fidelity
    return offscreen.toDataURL("image/jpeg", 0.3);
  }, []);

  const saveThumbnail = useCallback(
    async (canvas) => {
      const thumbnail = captureThumbnail(canvas);
      if (!thumbnail) return;
      try {
        await whiteboardApi.patchThumbnail(boardId, thumbnail);
      } catch (err) {
        console.error("Thumbnail save failed:", err);
      }
    },
    [boardId, captureThumbnail],
  );

  return {
    strokes,
    setStrokes,
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
    addStroke,
    clearStrokes,
    updateStrokes,
    debouncedSave,
    captureThumbnail,
    saveThumbnail,
  };
};
