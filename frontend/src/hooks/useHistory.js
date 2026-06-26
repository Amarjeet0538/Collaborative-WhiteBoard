import { useState, useCallback } from "react";

export const useHistory = (strokes, setStrokes, emit) => {
  const [history, setHistory] = useState({ past: [], future: [] });

  const pushToHistory = useCallback(
    (prevStrokes, newStrokes) => {
      setHistory((h) => ({
        past: [...h.past, prevStrokes],
        future: [],
      }));
      setStrokes(newStrokes);
    },
    [setStrokes],
  );

  const undo = useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const previousState = h.past[h.past.length - 1];
      setStrokes(previousState);
      if (emit) emit("board-sync", previousState);
      return {
        past: h.past.slice(0, -1),
        future: [strokes, ...h.future],
      };
    });
  }, [strokes, setStrokes, emit]);

  const redo = useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const nextState = h.future[0];
      setStrokes(nextState);
      if (emit) emit("board-sync", nextState);
      return {
        past: [...h.past, strokes],
        future: h.future.slice(1),
      };
    });
  }, [strokes, setStrokes, emit]);

  return {
    pushToHistory,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
};
