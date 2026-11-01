import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { api, getToken, setToken } from '../api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken())); // true while restoring a session

  // Restore the session from a saved token when the app opens.
  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const handleAuth = useCallback((data) => {
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }, []);

  const login = useCallback(
    async (email, password) =>
      handleAuth(await api('/auth/login', { method: 'POST', body: { email, password } })),
    [handleAuth],
  );
  const register = useCallback(
    async (name, email, password) =>
      handleAuth(
        await api('/auth/register', { method: 'POST', body: { name, email, password } }),
      ),
    [handleAuth],
  );
  const updateProfile = useCallback(
    async (changes) =>
      handleAuth(await api('/auth/me', { method: 'PUT', body: changes })),
    [handleAuth],
  );
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile }),
    [user, loading, login, register, logout, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
