import { useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { whiteboardApi } from "../api/whiteboard.api.js";
import { useAuth } from "../hooks/useAuth.js";
import { useWhiteboard } from "../hooks/useWhiteboard.js";
import { useBoardSocket } from "../hooks/useBoardSocket.js";
import useToast from "../hooks/useToast.js";
import { useCamera } from "../hooks/useCamera.js";
// Components
import Canvas from "../components/whiteboard/Canvas";
import Toolbar from "../components/whiteboard/Toolbar";
import BoardHeader from "../components/whiteboard/BoardHeader";
import Minimap from "../components/whiteboard/Minimap";

export default function WhiteboardPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const toast = useToast();
  const canvasRef = useRef(null);
  const [saving, setSaving] = useState(false);

  // 1. Board state (drawing)
  const {
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
    debouncedSave,
    saveThumbnail,
  } = useWhiteboard(id);

  const {
    camera,
    handleWheel,
    isSpacePressed,
    isPanning,
    startPan,
    pan,
    stopPan,
    zoomIn,
    zoomOut,
  } = useCamera(tool);

  // 2. Networking (socket + fetching)
  const {
    boardName,
    setBoardName,
    shareCode,
    pendingRequests,
    setPendingRequests,
    cursors,
    presentUsers,
    emit,
  } = useBoardSocket(id, user, setStrokes);

  const isDrawMode = !isSpacePressed && tool !== "hand";

  // 3. Handlers
  const handleStrokesChange = useCallback(
    (newStrokes) => {
      const latestStroke = newStrokes[newStrokes.length - 1];
      if (latestStroke)
        emit("stroke-update", { boardId: id, stroke: latestStroke });

      setSaving(true);
      debouncedSave(newStrokes, async (strokesToSave) => {
        try {
          await whiteboardApi.update(id, {
            strokes: strokesToSave,
            name: boardName,
          });
          const canvasElement = canvasRef.current?.getCanvas();
          if (canvasElement) await saveThumbnail(canvasElement);
        } catch (err) {
          console.error("Save error:", err);
          toast.error("Failed to save changes");
        } finally {
          setSaving(false);
        }
      });
    },
    [id, boardName, emit, debouncedSave, saveThumbnail, toast],
  );

  const handleRespond = async (requestId, approve) => {
    try {
      await whiteboardApi.respondToRequest(id, requestId, approve);
      setPendingRequests((prev) => prev.filter((r) => r._id !== requestId));
      toast.success(approve ? "Approved" : "Denied");
    } catch (err) {
      console.error("Respond error:", err);
      toast.error("Action failed");
    }
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      onWheel={handleWheel}
      onMouseDownCapture={startPan}
      onMouseMoveCapture={pan}
      onMouseUpCapture={stopPan}
      onMouseLeave={stopPan}
    >
      <BoardHeader
        boardName={boardName}
        onRename={setBoardName}
        saving={saving}
        shareCode={shareCode}
        presentUsers={presentUsers}
        boardId={id}
        pendingRequests={pendingRequests}
        onRespond={handleRespond}
      />

      {/* Drawing canvas */}
      <Canvas
        ref={canvasRef}
        tool={tool}
        overrideCursor={isSpacePressed || isPanning ? "grab" : null}
        readOnly={!isDrawMode}
        color={color}
        penSize={penSize}
        eraserSize={eraserSize}
        loadStrokes={strokes}
        onStrokesChange={handleStrokesChange}
        onCursorMove={(x, y) => emit("cursor-move", { boardId: id, x, y })}
        cursors={cursors}
        camera={camera}
      />

      {/* Minimap — bottom right      <Minimap strokes={strokes} camera={camera} />  */}

      {/* Unified toolbar — bottom centre */}
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        penSize={penSize}
        setPenSize={setPenSize}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        scale={camera.scale}
        zoomIn={zoomIn}
        zoomOut={zoomOut}
        clearCanvas={() => canvasRef.current?.clear()}
      />
    </div>
  );
}
