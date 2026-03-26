import { useState, useRef, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { whiteboardApi } from '../api/whiteboard.api.js';
import { useAuth } from '../hooks/useAuth.js';
import Canvas from '../components/whiteboard/Canvas';
import Toolbar from '../components/whiteboard/Toolbar';
import BoardHeader from '../components/whiteboard/BoardHeader';
import SharePanel from '../components/whiteboard/SharePanel';
import DarkModeToggle from '../components/DarkModeToggle';
import { useSocket } from '../hooks/useSocket.js';

export default function WhiteboardPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { connect, disconnect, emit, on, off } = useSocket();

  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState('black');
  const [penSize, setPenSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [zoom, setZoom] = useState(1);
  const [strokes, setStrokes] = useState([]);
  const [boardName, setBoardName] = useState('Untitled');
  const [saving, setSaving] = useState(false);
  const [shareCode, setShareCode] = useState('');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [cursors, setCursors] = useState({});
  const [presentUsers, setPresentUsers] = useState([]);

  const clearCanvasRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  // Load whiteboard
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await whiteboardApi.getOne(id);
        setBoardName(data.name);
        setStrokes(data.strokes || []);
        setShareCode(data.shareCode || '');
        setPendingRequests(data.pendingRequests || []);
      } catch (err) {
        console.error('Failed to load whiteboard:', err);
      }
    };
    if (id) fetchBoard();
  }, [id]);

  // Socket connection
  useEffect(() => {
    if (!id || !user) return;

    const socket = connect();

    socket.emit('join-board', {
      boardId: id,
      userId: user.id,
      username: user.name,
    });

    socket.on('stroke-update', ({ stroke }) => {
      setStrokes((prev) => [...prev, stroke]);
    });

    socket.on('cursor-move', ({ socketId, username, color, x, y }) => {
      setCursors((prev) => ({
        ...prev,
        [socketId]: { username, color, x, y },
      }));
    });

    socket.on('cursor-leave', ({ socketId }) => {
      setCursors((prev) => {
        const updated = { ...prev };
        delete updated[socketId];
        return updated;
      });
    });

    socket.on('presence-update', (users) => {
      setPresentUsers(users);
    });

    return () => {
      socket.emit('leave-board', { boardId: id });
      socket.off('stroke-update');
      socket.off('cursor-move');
      socket.off('cursor-leave');
      socket.off('presence-update');
      disconnect();
    };
  }, [id, user, connect, disconnect]);

  // Auto-save strokes
  const handleStrokesChange = useCallback(
    (newStrokes) => {
      const latestStroke = newStrokes[newStrokes.length - 1];
      if (latestStroke) {
        emit('stroke-update', { boardId: id, stroke: latestStroke });
      }

      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      setSaving(true);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          await whiteboardApi.update(id, { strokes: newStrokes, name: boardName });
        } catch (err) {
          console.error('Failed to save:', err);
        } finally {
          setSaving(false);
        }
      }, 1000);
    },
    [id, boardName, emit]
  );

  const handleRenameBoard = async (newName) => {
    setBoardName(newName);
    try {
      await whiteboardApi.update(id, { name: newName });
    } catch (err) {
      console.error('Failed to rename:', err);
    }
  };

  const handleRespond = async (requestId, approve) => {
    try {
      await whiteboardApi.respondToRequest(id, requestId, approve);
      setPendingRequests((prev) =>
        prev.filter((r) => r._id?.toString() !== requestId?.toString())
      );
    } catch (err) {
      console.error('Failed to respond:', err);
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
      <SharePanel boardId={id} pendingRequests={pendingRequests} onRespond={handleRespond} />
      <Canvas
        tool={tool}
        color={color}
        penSize={penSize}
        eraserSize={eraserSize}
        zoom={zoom}
        setZoom={setZoom}
        loadStrokes={strokes}
        onStrokesChange={handleStrokesChange}
        onCursorMove={(x, y) => emit('cursor-move', { boardId: id, x, y })}
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