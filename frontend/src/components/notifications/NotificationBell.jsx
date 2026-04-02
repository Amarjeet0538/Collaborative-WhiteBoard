import { Bell } from "lucide-react";
import { useState } from "react";
import NotificationDropdown from "./NotificationDropdown.jsx";
import useNotifications from "../../hooks/useNotifications.js";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleAction,
    refresh,
  } = useNotifications();

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      refresh();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="relative rounded-full text-foreground cursor-pointer p-3 transition-all hover:shadow-md "
      >
        <Bell className="hover:text-primary" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
        )}
      </button>

      <NotificationDropdown
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        notifications={notifications}
        unreadCount={unreadCount}
        loading={loading}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onDelete={deleteNotification}
        onAction={handleAction}
      />
    </div>
  );
}
