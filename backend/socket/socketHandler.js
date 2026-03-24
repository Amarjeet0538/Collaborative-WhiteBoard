const boardUsers = {}; // { boardId: { socketId: { userId, username, color } } }

const COLORS = [
  "#E63946",
  "#2A9D8F",
  "#E9C46A",
  "#F4A261",
  "#A8DADC",
  "#457B9D",
  "#9B5DE5",
  "#F15BB5",
];

function getColor(index) {
  return COLORS[index % COLORS.length];
}

export function initSocket(io) {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    // User joins a board room
    socket.on("join-board", ({ boardId, userId, username }) => {
      socket.join(boardId);

      if (!boardUsers[boardId]) boardUsers[boardId] = {};

      const userCount = Object.keys(boardUsers[boardId]).length;
      boardUsers[boardId][socket.id] = {
        userId,
        username,
        color: getColor(userCount),
      };

      // Tell everyone in room who's online
      io.to(boardId).emit(
        "presence-update",
        Object.values(boardUsers[boardId]),
      );
      console.log(`${username} joined board ${boardId}`);
    });

    // Relay stroke to everyone else in the room
    socket.on("stroke-update", ({ boardId, stroke }) => {
      socket.to(boardId).emit("stroke-update", { stroke, socketId: socket.id });
    });

    // Relay cursor position to everyone else
    socket.on("cursor-move", ({ boardId, x, y }) => {
      const user = boardUsers[boardId]?.[socket.id];
      if (!user) return;
      socket.to(boardId).emit("cursor-move", {
        socketId: socket.id,
        username: user.username,
        color: user.color,
        x,
        y,
      });
    });

    // User leaves
    socket.on("leave-board", ({ boardId }) => {
      handleLeave(socket, boardId, io);
    });

    // Handle disconnect
    socket.on("disconnect", () => {
      // Find which board this socket was in and clean up
      for (const boardId in boardUsers) {
        if (boardUsers[boardId][socket.id]) {
          handleLeave(socket, boardId, io);
          break;
        }
      }
      console.log("Socket disconnected:", socket.id);
    });
  });
}

function handleLeave(socket, boardId, io) {
  if (!boardUsers[boardId]) return;
  delete boardUsers[boardId][socket.id];

  if (Object.keys(boardUsers[boardId]).length === 0) {
    delete boardUsers[boardId];
  } else {
    io.to(boardId).emit("presence-update", Object.values(boardUsers[boardId]));
  }

  // Tell others to remove this cursor
  socket.to(boardId).emit("cursor-leave", { socketId: socket.id });
  socket.leave(boardId);
}
