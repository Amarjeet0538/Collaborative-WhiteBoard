import { createContext, useState } from 'react';
import { storage } from '../utils/storage.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    return storage.getUser();
  });

  const login = (userData, token) => {
    storage.setToken(token);
    storage.setUser(userData);
    setUser(userData);
  };

  const logout = () => {
    storage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}