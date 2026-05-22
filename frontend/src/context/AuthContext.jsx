import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartstore_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('smartstore_token', newToken);
    localStorage.setItem('smartstore_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const signup = async (name, email, password, storeName) => {
    const res = await api.post('/auth/signup', { name, email, password, storeName });
    const { token: newToken, user: userData } = res.data;
    localStorage.setItem('smartstore_token', newToken);
    localStorage.setItem('smartstore_user', JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('smartstore_token');
    localStorage.removeItem('smartstore_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

export default AuthContext;
