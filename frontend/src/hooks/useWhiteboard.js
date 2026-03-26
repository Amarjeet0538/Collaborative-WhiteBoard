import { useState, useCallback, useRef } from 'react';

export const useWhiteboard = (boardId, initialStrokes = []) => {
  const [strokes, setStrokes] = useState(initialStrokes);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('black');
  const [penSize, setPenSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [zoom, setZoom] = useState(1);
  const saveTimeoutRef = useRef(null);

  const addStroke = useCallback((stroke) => {
    setStrokes((prev) => [...prev, stroke]);
  }, []);

  const clearStrokes = useCallback(() => {
    setStrokes([]);
  }, []);

  const updateStrokes = useCallback((newStrokes) => {
    setStrokes(newStrokes);
  }, []);

  const debouncedSave = useCallback((saveCallback) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      saveCallback(strokes);
    }, 1000);
  }, [strokes]);

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
  };
};