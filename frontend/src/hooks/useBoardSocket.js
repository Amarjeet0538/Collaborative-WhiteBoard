import { useState, useEffect } from "react";
import { whiteboardApi } from "../api/whiteboard.api.js";
import { useSocket } from "./useSocket.js";
import useToast from "./useToast.js";

export const useBoardSocket = (id, user, setStrokes) => {
  const { connect, disconnect, emit } = useSocket();
  const toast = useToast();

  const [boardName, setBoardName] = useState("Untitled");
  const [shareCode, setShareCode] = useState("");
  const [pendingRequests, setPendingRequests] = useState([]);
  const [cursors, setCursors] = useState({});
  const [presentUsers, setPresentUsers] = useState([]);

  useEffect(() => {
    if (!id) return;
    whiteboardApi
      .getOne(id)
      .then((data) => {
        setBoardName(data.name);
        setStrokes(data.strokes || []);
        setShareCode(data.shareCode || "");
        setPendingRequests(data.pendingRequests || []);
      })
      .catch((err) => {
        console.error("Save error details:", err); // Look at your browser console for this!
        toast.error("Failed to load whiteboard");
      });
  }, [id, setStrokes, toast]);

  useEffect(() => {
    if (!id || !user) return;
    const socket = connect();

    // Identity comes from the socket's JWT on the server
    socket.emit("join-board", { boardId: id });

    socket.on("stroke-update", ({ stroke }) =>
      setStrokes((prev) => [...prev, stroke]),
    );

    // Full-array replace from a collaborator's erase/undo/redo
    socket.on("board-sync", ({ strokes }) => setStrokes(strokes));

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    socket.on("cursor-move", ({ socketId, username, color, x, y }) => {
      setCursors((prev) => ({
        ...prev,
        [socketId]: { username, color, x, y },
      }));
    });

    socket.on("cursor-leave", ({ socketId }) => {
      setCursors((prev) => {
        const next = { ...prev };
        delete next[socketId];
        return next;
      });
    });

    socket.on("presence-update", (users) => setPresentUsers(users));

    return () => {
      socket.emit("leave-board", { boardId: id });
      disconnect();
    };
  }, [id, user, connect, disconnect, setStrokes]);

  return {
    boardName,
    setBoardName,
    shareCode,
    pendingRequests,
    setPendingRequests,
    cursors,
    presentUsers,
    emit,
  };
};
