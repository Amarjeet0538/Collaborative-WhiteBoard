import { COLORS } from '../utils/constants.js';

const boardUsers = {};

const getColor = (index) => {
  return COLORS[index % COLORS.length];
};

const handleLeave = (socket, boardId, io) => {
  if (!boardUsers[boardId]) return;
  delete boardUsers[boardId][socket.id];

  if (Object.keys(boardUsers[boardId]).length === 0) {
    delete boardUsers[boardId];
  } else {
    io.to(boardId).emit('presence-update', Object.values(boardUsers[boardId]));
  }

  socket.to(boardId).emit('cursor-leave', { socketId: socket.id });
  socket.leave(boardId);
};

export const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-board', ({ boardId, userId, username }) => {
      socket.join(boardId);

      if (!boardUsers[boardId]) boardUsers[boardId] = {};

      const userCount = Object.keys(boardUsers[boardId]).length;
      boardUsers[boardId][socket.id] = {
        userId,
        username,
        color: getColor(userCount),
      };

      io.to(boardId).emit('presence-update', Object.values(boardUsers[boardId]));
      console.log(`${username} joined board ${boardId}`);
    });

    socket.on('stroke-update', ({ boardId, stroke }) => {
      socket.to(boardId).emit('stroke-update', { stroke, socketId: socket.id });
    });

    socket.on('cursor-move', ({ boardId, x, y }) => {
      const user = boardUsers[boardId]?.[socket.id];
      if (!user) return;
      socket.to(boardId).emit('cursor-move', {
        socketId: socket.id,
        username: user.username,
        color: user.color,
        x,
        y,
      });
    });

    socket.on('leave-board', ({ boardId }) => {
      handleLeave(socket, boardId, io);
    });

    socket.on('disconnect', () => {
      for (const boardId in boardUsers) {
        if (boardUsers[boardId][socket.id]) {
          handleLeave(socket, boardId, io);
          break;
        }
      }
      console.log('Socket disconnected:', socket.id);
    });
  });
};
