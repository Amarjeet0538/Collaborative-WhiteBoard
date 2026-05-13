import { useState, useRef, useEffect } from "react";
import DarkModeToggle from "../DarkModeToggle";
import useToast from "@/hooks/useToast";
import { useNavigate } from "react-router-dom";
import { StepBackIcon, Link2, Check, Users } from "lucide-react";

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    if (isRenaming) inputRef.current?.focus();
  }, [isRenaming]);

  // Close menu on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isMenuOpen]);

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
    setCopied(true);
    toast.success("Link copied to clipboard");
    onCopyShareCode?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Back Button */}
      <div
        className="p-2 z-10 absolute top-3 left-3 flex items-center gap-2 w-10 h-10 rounded-2xl bg-background hover:bg-background-highlight  hover:opacity-90 active:scale-95 text-foreground transition-all cursor-pointer shadow-sm"
        onClick={() => navigate("/home")}
      >
        <StepBackIcon size={18} />
      </div>

      {/* Board Name */}
      <div className="z-10 absolute top-3 left-17 flex items-center gap-2 rounded-2xl bg-background-highlight hover:bg-background text-foreground transition-all cursor-pointer p-2 shadow-sm">
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

      {/* Top-Right Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
        {/* Share Button + Dropdown */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 px-4 py-2 h-10 rounded-2xl bg-background hover:bg-background-highlight  text-primary-foreground hover:opacity-90 active:scale-95 transition-all shadow-sm font-medium text-sm"
          >
            <span className="w-3 h-3 rounded-full bg-green-400 animate-pulse shrink-0" />
            Share
            {presentUsers.length > 0 && (
              <span className="ml-0.5 flex items-center gap-1 bg-primary-foreground/15 rounded-full px-1.5 py-0.5 text-xs font-semibold">
                <Users size={14} />
                {presentUsers.length}
              </span>
            )}
          </button>

          {isMenuOpen && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-64 bg-background-highlight border border-border rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 origin-top-right">
              {/* Invite Link Section */}
              <div className="p-3 flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Invite Link
                </p>
                <div className="flex items-center gap-2 bg-background rounded-xl border border-border px-3 py-2">
                  <code className="text-sm font-mono text-foreground flex-1 truncate">
                    {shareCode}
                  </code>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-all flex-shrink-0 ${
                      copied
                        ? "bg-green-500/15 text-green-600"
                        : "bg-secondary hover:bg-secondary/80 text-foreground"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check size={12} />
                        Copied
                      </>
                    ) : (
                      <>
                        <Link2 size={12} />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="h-px bg-border mx-3" />

              {/* Online Members Section */}
              <div className="p-3 flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Online · {presentUsers.length}
                </p>

                <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto">
                  {presentUsers.length > 0 ? (
                    presentUsers.map((u, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-background transition-colors"
                      >
                        {/* Avatar circle with initial */}
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0"
                          style={{ backgroundColor: u.color }}
                        >
                          {u.username?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <span className="text-sm text-foreground truncate">
                          {u.username}
                        </span>
                        {/* Online dot */}
                        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground italic px-2 py-1">
                      No one else is here yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DarkModeToggle />
      </div>
    </>
  );
}
