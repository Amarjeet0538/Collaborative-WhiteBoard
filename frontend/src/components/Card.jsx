import { EllipsisVertical, Trash2, Pencil } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function Card({
  text,
  time,
  thumbnail,
  onClick,
  onDelete,
  onRename,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState(text);
  const menuRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isRenaming) inputRef.current?.focus();
  }, [isRenaming]);

  useEffect(() => {
    setNewName(text);
  }, [text]);

  const handleRename = (e) => {
    e.stopPropagation();
    if (newName.trim() && newName !== text) {
      onRename?.(newName.trim());
    }
    setIsRenaming(false);
  };

  const handleCancelRename = (e) => {
    e.stopPropagation();
    setNewName(text);
    setIsRenaming(false);
  };

  return (
    <div
      onClick={!isRenaming ? onClick : undefined}
      className="cursor-pointer p-4 flex flex-col gap-3 justify-between
      rounded-md bg-background hover:bg-background-highlight border border-border-muted/60
      hover:border-border/40 text-foreground transition-all"
    >
      {/* Preview */}
      <div className="w-full h-40 bg-foreground/10 rounded-md">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={`${text} preview`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-40 bg-foreground/10 rounded-md" />
        )}
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <div className="flex flex-col flex-1 mr-2">
          {/* Inline rename input */}
          {isRenaming ? (
            <div
              className="flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                ref={inputRef}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(e);
                  if (e.key === "Escape") handleCancelRename(e);
                }}
                className="text-sm font-semibold bg-background border border-border-muted 
                rounded px-2 py-1 w-full focus:outline-none focus:ring-1 focus:ring-border"
              />
            </div>
          ) : (
            <span className="font-semibold text-md">{text}</span>
          )}
          <span className="text-xs text-foreground/50">{time}</span>
        </div>

        {/* Menu */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            className="p-1 rounded-md hover:bg-foreground/10 transition-colors"
          >
            <EllipsisVertical size={18} />
          </button>

          {isOpen && (
            <div
              className="absolute right-0 bottom-full mb-1 w-36 bg-background border
              border-border-muted rounded-md shadow-lg z-20 overflow-hidden"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  setIsRenaming(true);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm
                hover:bg-background-highlight transition-colors"
              >
                <Pencil size={14} /> Rename
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                  onDelete?.(e);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500
                hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
