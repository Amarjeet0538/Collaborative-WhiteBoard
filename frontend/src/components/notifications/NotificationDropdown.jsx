import { useRef, useEffect } from "react";
import { Bell, CheckCheck, Inbox } from "lucide-react";
import NotificationItem from "./NotificationItem.jsx";

export default function NotificationDropdown({
  isOpen,
  onClose,
  notifications,
  unreadCount,
  loading,
  onMarkAsRead,
  onMarkAllAsRead,
  onDelete,
  onAction,
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full right-0 z-50 w-96 max-h-[500px] flex flex-col bg-background border border-border-muted rounded-md shadow-lg overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border-muted bg-background">
        <div className="flex items-center gap-2">
          <Bell size={18} className="text-foreground" />
          <span className="font-semibold text-foreground">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-primary text-background text-xs rounded-full font-medium">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1 px-2 py-1 text-xs text-foreground-muted hover:text-primary transition-colors cursor-pointer"
          >
            <CheckCheck size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-foreground-muted">
            Loading...
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center text-foreground-muted">
            <Inbox size={40} className="mb-2 opacity-50" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationItem
              key={notification._id}
              notification={notification}
              onAction={onAction}
              onDelete={onDelete}
              onMarkRead={onMarkAsRead}
            />
          ))
        )}
      </div>
    </div>
  );
}
