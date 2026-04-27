import { useState, useEffect } from "react";
import { whiteboardApi } from "../../api/whiteboard.api.js";
import useToast from "../../hooks/useToast.js";

export default function SharePanel({ boardId, pendingRequests, onRespond }) {
  const toast = useToast();
  const [requests, setRequests] = useState(pendingRequests);

  useEffect(() => {
    if (!boardId) return;

    const interval = setInterval(async () => {
      try {
        const data = await whiteboardApi.getOne(boardId);
        setRequests(data.pendingRequests || []);
      } catch (err) {
        console.error("Failed to fetch pending requests:", err);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [boardId]);

  useEffect(() => {
    setRequests(pendingRequests);
  }, [pendingRequests]);

  const handleRespond = async (requestId, approve) => {
    try {
      await onRespond(requestId, approve);
      setRequests((prev) =>
        prev.filter((r) => r._id?.toString() !== requestId?.toString()),
      );
    } catch (err) {
      console.error("Failed to respond:", err);
      toast.error("Failed to respond to request");
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="absolute bottom-5 left-3 z-10 flex flex-col gap-2">
      {requests.map((req) => (
        <div
          key={req._id}
          className="flex items-center gap-3 bg-background border border-border-muted rounded-md px-3 py-2 text-sm text-foreground shadow-lg animate-toast-slide-in"
        >
          {/* User Avatar */}
          <div className="w-6 h-6 rounded-full bg-background-muted overflow-hidden shrink-0 border border-border-muted">
            <img
              src={
                req.userId?.profilePicture ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${req.userId?.name}`
              }
              alt=""
              className="w-full h-full object-cover"
            />
          </div>

          {/* Name and Text */}
          <span className="font-medium whitespace-nowrap">
            <span className="text-primary-hover">{req.userId?.name}</span> wants
            to edit
          </span>

          {/* Actions */}
          <div className="flex gap-1.5 ml-2">
            <button
              onClick={() => handleRespond(req._id, true)}
              className="px-2.5 py-1 bg-success text-white rounded-md hover:opacity-90 text-xs font-semibold cursor-pointer transition-all"
            >
              Approve
            </button>
            <button
              onClick={() => handleRespond(req._id, false)}
              className="px-2.5 py-1 bg-background-highlight text-foreground-muted rounded-md hover:bg-danger hover:text-white text-xs font-semibold cursor-pointer transition-all"
            >
              Deny
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
