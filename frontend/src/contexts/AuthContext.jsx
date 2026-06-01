import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });

  const login = useCallback(async (login, senha) => {
    const { data } = await api.post('/auth/login', { login, senha });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.funcionario));
    setUser(data.funcionario);
    return data.funcionario;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const isGerente = user?.perfil === 'Gerente';

  return (
    <AuthContext.Provider value={{ user, login, logout, isGerente }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
