import { createContext } from 'react';
import { io } from 'socket.io-client';
import { storage } from '../utils/storage.js';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const getSocket = () => {
    const token = storage.getToken();
    return io(SOCKET_URL, {
      autoConnect: false,
      auth: { token },
    });
  };

  return (
    <SocketContext.Provider value={{ getSocket }}>
      {children}
    </SocketContext.Provider>
  );
};