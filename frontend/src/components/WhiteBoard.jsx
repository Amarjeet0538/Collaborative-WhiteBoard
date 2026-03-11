import Canvas from "./Canvas";
import DarkModeToggle from "./DarkModeToggle";
import Editing_Buttons from "./Editing_Buttons";
import { useState, useRef, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "@/utils/api";

export default function Whiteboard() {
  const { id } = useParams();
  const [tool, setTool] = useState("pen");
  const [color, setColor] = useState("black");
  const [penSize, setPenSize] = useState(5);
  const [eraserSize, setEraserSize] = useState(20);
  const [zoom, setZoom] = useState(1);
  const [loadStrokes, setLoadStrokes] = useState([]);
  const [boardName, setBoardName] = useState("Untitled");
  const [saving, setSaving] = useState(false);
  const clearCanvasRef = useRef(null);
  const saveTimeout = useRef(null);

  // Add these new states inside Whiteboard component
  const [isRenamingBoard, setIsRenamingBoard] = useState(false);
  const [tempName, setTempName] = useState("");
  const nameInputRef = useRef(null);

  // Focus input when renaming starts
  useEffect(() => {
    if (isRenamingBoard) nameInputRef.current?.focus();
  }, [isRenamingBoard]);

  const handleRenameBoard = async () => {
    if (tempName.trim() && tempName !== boardName) {
      setBoardName(tempName.trim());
      try {
        await apiFetch(`/whiteboards/${id}`, {
          method: "PUT",
          body: JSON.stringify({ name: tempName.trim() }),
        });
      } catch (err) {
        console.error("Failed to rename", err);
      }
    }
    setIsRenamingBoard(false);
  };

  // Load whiteboard on mount
  useEffect(() => {
    const fetchBoard = async () => {
      try {
        const data = await apiFetch(`/whiteboards/${id}`);
        setBoardName(data.name);
        setLoadStrokes(data.strokes || []);
      } catch (err) {
        console.error("Failed to load whiteboard", err);
      }
    };
    if (id) fetchBoard();
  }, [id]);

  // Auto-save strokes with debounce (saves 1 second after last stroke)
  const handleStrokesChange = useCallback(
    (strokes) => {
      if (saveTimeout.current) clearTimeout(saveTimeout.current);
      setSaving(true);
      saveTimeout.current = setTimeout(async () => {
        try {
          await apiFetch(`/whiteboards/${id}`, {
            method: "PUT",
            body: JSON.stringify({ strokes, name: boardName }),
          });
        } catch (err) {
          console.error("Failed to save", err);
        } finally {
          setSaving(false);
        }
      }, 1000);
    },
    [id, boardName],
  );

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      {/* Top left: board name */}
      <div
        className="text-foreground bg-background p-1 z-10 rounded-md border 
  border-border-muted absolute top-3 left-3 flex items-center gap-2"
      >
        {isRenamingBoard ? (
          <input
            ref={nameInputRef}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRenameBoard();
              if (e.key === "Escape") setIsRenamingBoard(false);
            }}
            onBlur={handleRenameBoard}
            className="text-sm bg-transparent border-none focus:outline-none w-40"
          />
        ) : (
          <span
            className="text-sm cursor-text px-1"
            onDoubleClick={() => {
              setTempName(boardName);
              setIsRenamingBoard(true);
            }}
            title="Double click to rename"
          >
            {boardName}
          </span>
        )}

        {saving && (
          <span className="text-xs text-foreground-muted">Saving...</span>
        )}
      </div>

      {/* Top right: dark mode */}
      <div className="absolute top-3 right-4 z-10">
        <DarkModeToggle />
      </div>

      <Canvas
        tool={tool}
        color={color}
        penSize={penSize}
        eraserSize={eraserSize}
        zoom={zoom}
        setZoom={setZoom}
        onClearCanvas={(fn) => (clearCanvasRef.current = fn)}
        onStrokesChange={handleStrokesChange}
        loadStrokes={loadStrokes}
      />

      <Editing_Buttons
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
