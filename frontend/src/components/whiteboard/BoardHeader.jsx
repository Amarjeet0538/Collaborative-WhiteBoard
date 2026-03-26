import { useState, useRef, useEffect } from 'react';
import DarkModeToggle from '../DarkModeToggle';

export default function BoardHeader({
  boardName,
  onRename,
  saving,
  shareCode,
  presentUsers,
  onCopyShareCode,
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [tempName, setTempName] = useState('');
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);

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
    navigator.clipboard.writeText(`${window.location.origin}/join/${shareCode}`);
    setCopied(true);
    onCopyShareCode?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Board Name (Top Left) */}
      <div
        className="z-10 absolute top-3 left-3 flex items-center gap-2 px-2 py-1 rounded-md bg-background-highlight hover:bg-background text-foreground transition-all cursor-pointer"
      >
        {isRenaming ? (
          <input
            ref={inputRef}
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') setIsRenaming(false);
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
          <div className="absolute top-13 right-0 -translate-x-1/2 z-10 flex items-center gap-2 bg-background border border-border-muted rounded-full px-3 py-1 shadow-sm">
            {presentUsers.map((u, i) => (
              <div key={i} className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: u.color }}
                />
                <span className="text-xs text-foreground">{u.username}</span>
              </div>
            ))}
          </div>
        )}
        {shareCode && (
          <button
            onClick={handleCopy}
            className="text-md px-2 py-1 rounded-md bg-background-highlight hover:bg-background text-foreground transition-all cursor-pointer"
          >
            {copied ? '✓ Copied!' : `Share: ${shareCode}`}
          </button>
        )}
        <DarkModeToggle/>
      </div>
    </>
  );
}