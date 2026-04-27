import { useState, useRef, useEffect } from "react";
import DarkModeToggle from "../DarkModeToggle";
import useToast from "@/hooks/useToast";
export default function BoardHeader({
  boardName,
  onRename,
  saving,
  shareCode,
  presentUsers,
  onCopyShareCode,
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState("");
  const inputRef = useRef(null);
  const toast = useToast();
  useEffect(() => {
    if (isRenaming) inputRef.current?.focus();
  }, [isRenaming]);

  const handleRename = () => {
    if (tempName.trim() && tempName !== boardName) {
      onRename(tempName.trim());
    }
    setIsRenaming(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/join/${shareCode}`,
    );
    toast.success("Code copied to clipboard");
    onCopyShareCode?.();
  };

  return (
    <>
      {/* Board Name (Top Left) */}
      <div className="z-10 absolute top-3 left-3 flex items-center gap-2 rounded-sm bg-background-highlight hover:bg-background text-foreground transition-all cursor-pointer px-3 py-3 shadow-sm">
        {isRenaming ? (
          <input
            ref={inputRef}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleRename();
              if (e.key === "Escape") setIsRenaming(false);
            }}
            onBlur={handleRename}
            className="text-xl bg-background-highlight border-none focus:outline-none w-40"
          />
        ) : (
          <span
            className="text-xl cursor-text px-1"
            onDoubleClick={() => {
              setTempName(boardName);
              setIsRenaming(true);
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

      {/* Share Code & Presence (Top Right) */}
      <div className="absolute top-3 right-0 z-10 flex gap-1">
        {presentUsers.length > 0 && (
          <div className=" z-10 flex items-center gap-2 bg-background-highlight hover:bg-background rounded-sm px-3 py-1 shadow-sm">
            {presentUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: u.color }}
                />
                <span className="text-sm text-foreground">{u.username}</span>
              </div>
            ))}
          </div>
        )}
        {shareCode && (
          <button
            onClick={handleCopy}
            className="text-md px-2 py-1 rounded-sm bg-background-highlight hover:bg-background text-foreground transition-all cursor-pointer"
          >
            {`Share: ${shareCode}`}
          </button>
        )}
        <DarkModeToggle />
      </div>
    </>
  );
}
