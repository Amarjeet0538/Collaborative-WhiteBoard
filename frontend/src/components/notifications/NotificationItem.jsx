import { Check, X, Trash2 } from "lucide-react";

export default function NotificationItem({
  notification,
  onAction,
  onDelete,
  onMarkRead,
}) {
  const { _id, sender, board, type, message, isRead, createdAt } = notification;

  const isRequestType = type === "request_received";
  const isUnread = !isRead;

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const getTypeStyles = () => {
    switch (type) {
      case "request_received":
        return { bg: "bg-blue-500/10", icon: "bg-blue-500" };
      case "request_approved":
        return { bg: "bg-green-500/10", icon: "bg-green-500" };
      case "request_denied":
        return { bg: "bg-red-500/10", icon: "bg-red-500" };
      case "added_to_board":
        return { bg: "bg-purple-500/10", icon: "bg-purple-500" };
      default:
        return { bg: "bg-gray-500/10", icon: "bg-gray-500" };
    }
  };

  const styles = getTypeStyles();

  return (
    <div
      className={`p-3 border-b border-border-muted last:border-0 transition-colors ${
        isUnread ? "bg-background-highlight" : "bg-background"
      } hover:bg-background-highlight`}
      onClick={() => !isRead && onMarkRead(_id)}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-background font-semibold text-sm flex-shrink-0 ${styles.icon}`}
        >
          {sender?.name?.charAt(0)?.toUpperCase() || "?"}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-foreground leading-relaxed">{message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-foreground-muted">
              {timeAgo(createdAt)}
            </span>
            {board && (
              <>
                <span className="text-xs text-foreground-muted">•</span>
                <span className="text-xs text-foreground-muted truncate">
                  {board.name}
                </span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          {isRequestType && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(_id, "accept", board?._id);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-background text-xs rounded-md hover:bg-primary-hover transition-colors cursor-pointer"
              >
                <Check size={14} /> Accept
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onAction(_id, "reject", board?._id);
                }}
                className="flex items-center gap-1 px-3 py-1.5 bg-background border border-border-muted text-foreground text-xs rounded-md hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors cursor-pointer"
              >
                <X size={14} /> Reject
              </button>
            </div>
          )}
        </div>

        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(_id);
          }}
          className="p-1 text-foreground-muted hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
