import { useState, useCallback, useEffect } from "react";
import { ZOOM } from "../utils/constants.js";
export const useCamera = (tool) => {
  const [camera, setCamera] = useState({ x: 0, y: 0, scale: 1 });
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === "Space" && !e.repeat) setIsSpacePressed(true);
    };
    const handleKeyUp = (e) => {
      if (e.code === "Space") setIsSpacePressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // 2. The Zoom Math (Zoom towards cursor)
  const handleWheel = useCallback((e) => {
    // Determine zoom direction and speed
    const zoomSensitivity = 0.001;
    const delta = e.deltaY * -zoomSensitivity;

    setCamera((prev) => {
      // Clamp the scale between 10% and 500%
      const newScale = Math.min(Math.max(0.1, prev.scale + delta), 5);

      // The Magic Math: Keep the mouse cursor pointing at the same World Coordinate
      const scaleRatio = newScale / prev.scale;
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const newX = mouseX - (mouseX - prev.x) * scaleRatio;
      const newY = mouseY - (mouseY - prev.y) * scaleRatio;

      return { x: newX, y: newY, scale: newScale };
    });
  }, []);

  // 3. The Panning Math
  const startPan = useCallback(
    (e) => {
      // Allow panning if middle mouse button (button 1) is clicked OR spacebar is held
      if (
        e.button === 1 ||
        isSpacePressed ||
        (tool === "hand" && e.button === 0)
      ) {
        setIsPanning(true);
      }
    },
    [isSpacePressed, tool],
  );

  const pan = useCallback(
    (e) => {
      if (!isPanning) return;
      setCamera((prev) => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY,
        scale: prev.scale,
      }));
    },
    [isPanning],
  );

  const stopPan = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleButtonZoom = useCallback((delta) => {
    setCamera((prev) => {
      const newScale = Math.min(
        Math.max(ZOOM.MIN || 0.1, prev.scale + delta),
        ZOOM.MAX || 5,
      );
      const scaleRatio = newScale / prev.scale;

      // Zoom towards the center of the screen
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const newX = centerX - (centerX - prev.x) * scaleRatio;
      const newY = centerY - (centerY - prev.y) * scaleRatio;

      return { x: newX, y: newY, scale: newScale };
    });
  }, []);

  const zoomIn = () => handleButtonZoom(ZOOM.STEP || 0.1);
  const zoomOut = () => handleButtonZoom(-(ZOOM.STEP || 0.1));

  return {
    camera,
    isSpacePressed,
    isPanning,
    startPan,
    pan,
    stopPan,
    handleWheel,
    zoomIn,
    zoomOut,
  };
};
