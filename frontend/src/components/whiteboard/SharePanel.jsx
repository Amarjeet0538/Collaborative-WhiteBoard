import { useState, useEffect } from 'react';
import { whiteboardApi } from '../../api/whiteboard.api.js';

export default function SharePanel({ boardId, pendingRequests, onRespond }) {
  const [requests, setRequests] = useState(pendingRequests);

  useEffect(() => {
    if (!boardId) return;

    const interval = setInterval(async () => {
      try {
        const data = await whiteboardApi.getOne(boardId);
        setRequests(data.pendingRequests || []);
      } catch (err) {
        console.error('Failed to fetch pending requests:', err);
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
        prev.filter((r) => r._id?.toString() !== requestId?.toString())
      );
    } catch (err) {
      console.error('Failed to respond:', err);
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="absolute bottom-5 left-3 z-10 flex flex-col gap-2">
      {requests.map((req) => (
        <div
          key={req._id}
          className="flex items-center gap-3 bg-background border border-border-muted rounded-md px-3 py-2 text-sm text-foreground shadow-sm"
        >
          <span>User wants to edit</span>
          <button
            onClick={() => handleRespond(req._id, true)}
            className="px-2 py-1 bg-primary text-background rounded-md hover:bg-primary-hover text-xs cursor-pointer"
          >
            Approve
          </button>
          <button
            onClick={() => handleRespond(req._id, false)}
            className="px-2 py-1 bg-background-highlight text-foreground rounded-md hover:bg-red-500 hover:text-white text-xs cursor-pointer"
          >
            Deny
          </button>
        </div>
      ))}
    </div>
  );
}