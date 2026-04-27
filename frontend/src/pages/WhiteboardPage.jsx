import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { whiteboardApi } from "../api/whiteboard.api.js";
import { useAuth } from "../hooks/useAuth.js";
import { useWhiteboard } from "../hooks/useWhiteboard.js";
import Canvas from "../components/whiteboard/Canvas";
import Toolbar from "../components/whiteboard/Toolbar";
import BoardHeader from "../components/whiteboard/BoardHeader";
import SharePanel from "../components/whiteboard/SharePanel";
import DarkModeToggle from "../components/DarkModeToggle";
import { useSocket } from "../hooks/useSocket.js";
import useToast from "../hooks/useToast.js";

export default function WhiteboardPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { connect, disconnect, emit } = useSocket();
  const toast = useToast();

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
    zoom,
    setZoom,
    debouncedSave,
    saveThumbnail,
  } = useWhiteboard(id);

  const [boardName, setBoardName] = useState("Untitled");
  const [saving, setSaving] = useState(false);
  const [shareCode, setShareCode] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [cursors, setCursors] = useState({});
  const [presentUsers, setPresentUsers] = useState([]);

  const canvasRef = useRef(null);
  const clearCanvasRef = useRef(null);

  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await whiteboardApi.getOne(id);
        setBoardName(data.name);
        setStrokes(data.strokes || []);
        setShareCode(data.shareCode || "");
        setPendingRequests(data.pendingRequests || []);
      } catch (err) {
        toast.error("Failed to load whiteboard");
        console.error("Failed to load whiteboard:", err);
      }
    };
    if (id) fetchBoard();
  }, [id]);

  useEffect(() => {
    if (!id || !user) return;
    const socket = connect();

    socket.emit("join-board", {
      boardId: id,
      userId: user.id,
      username: user.name,
    });
    socket.on("stroke-update", ({ stroke }) =>
      setStrokes((prev) => [...prev, stroke]),
    );
    socket.on("cursor-move", ({ socketId, username, color, x, y }) => {
      setCursors((prev) => ({
        ...prev,
        [socketId]: { username, color, x, y },
      }));
    });
    socket.on("cursor-leave", ({ socketId }) => {
      setCursors((prev) => {
        const u = { ...prev };
        delete u[socketId];
        return u;
      });
    });
    socket.on("presence-update", (users) => setPresentUsers(users));

    return () => {
      socket.emit("leave-board", { boardId: id });
      socket.off("stroke-update");
      socket.off("cursor-move");
      socket.off("cursor-leave");
      socket.off("presence-update");
      disconnect();
    };
  }, [id, user, connect, disconnect]);

  // Auto-save strokes + thumbnail
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
          await saveThumbnail(canvasRef.current);
        } catch (err) {
          console.error("Failed to save:", err);
          toast.error("Failed to save changes");
        } finally {
          setSaving(false);
        }
      });
    },
    [id, boardName, emit, debouncedSave, saveThumbnail],
  );

  const handleRenameBoard = async (newName) => {
    setBoardName(newName);
    try {
      await whiteboardApi.update(id, { name: newName });
    } catch (err) {
      console.error("Failed to rename:", err);
      toast.error("Failed to rename board");
    }
  };

  const handleRespond = async (requestId, approve) => {
    try {
      await whiteboardApi.respondToRequest(id, requestId, approve);
      setPendingRequests((prev) =>
        prev.filter((r) => r._id?.toString() !== requestId?.toString()),
      );
      toast.success(approve ? "Request approved" : "Request denied");
    } catch (err) {
      console.error("Failed to respond:", err);
      toast.error("Failed to respond to request");
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <BoardHeader
        boardName={boardName}
        onRename={handleRenameBoard}
        saving={saving}
        shareCode={shareCode}
        presentUsers={presentUsers}
      />
      <DarkModeToggle className="absolute top-3 right-0" />
      <SharePanel
        boardId={id}
        pendingRequests={pendingRequests}
        onRespond={handleRespond}
      />
      <Canvas
        ref={canvasRef}
        tool={tool}
        color={color}
        penSize={penSize}
        eraserSize={eraserSize}
        zoom={zoom}
        setZoom={setZoom}
        loadStrokes={strokes}
        onStrokesChange={handleStrokesChange}
        onCursorMove={(x, y) => emit("cursor-move", { boardId: id, x, y })}
        cursors={cursors}
        onClearCanvas={(fn) => (clearCanvasRef.current = fn)}
      />
      <Toolbar
        tool={tool}
        setTool={setTool}
        color={color}
        setColor={setColor}
        penSize={penSize}
        setPenSize={setPenSize}
        eraserSize={eraserSize}
        setEraserSize={setEraserSize}
        zoom={zoom}
        setZoom={setZoom}
        clearCanvas={() => clearCanvasRef.current?.()}
      />
    </div>
  );
}
