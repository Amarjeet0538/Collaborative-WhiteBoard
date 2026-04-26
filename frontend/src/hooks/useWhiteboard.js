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
    const offscreen = document.createElement("canvas");
    offscreen.width = 400;
    offscreen.height = 225;
    const ctx = offscreen.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, offscreen.width, offscreen.height);
    ctx.drawImage(canvas, 0, 0, offscreen.width, offscreen.height);
    return offscreen.toDataURL("image/jpeg", 0.5);
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
