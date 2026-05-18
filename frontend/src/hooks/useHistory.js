import { useState, useCallback } from "react";

export const useHistory = (initialState) => {
  const [index, setIndex] = useState(0);
  const [history, setHistory] = useState([initialState]);

  const setState = useCallback(
    (newState, overwrite = false) => {
      const currentState = history[index];

      // Don't save if nothing changed
      if (JSON.stringify(newState) === JSON.stringify(currentState)) return;

      if (overwrite) {
        const historyCopy = [...history];
        historyCopy[index] = newState;
        setHistory(historyCopy);
      } else {
        const updatedState = [...history.slice(0, index + 1), newState];
        setHistory(updatedState);
        setIndex(updatedState.length - 1);
      }
    },
    [history, index],
  );

  const undo = useCallback(() => {
    if (index > 0) setIndex((prev) => prev - 1);
  }, [index]);

  const redo = useCallback(() => {
    if (index < history.length - 1) setIndex((prev) => prev + 1);
  }, [index]);

  return {
    state: history[index],
    setState,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1,
  };
};
