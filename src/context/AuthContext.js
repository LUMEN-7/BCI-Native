import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { clearSession, getAccessToken, getCurrentUser, setSession } from '../services/storage';
import { setUnauthorizedHandler } from '../services/api';
import { logoutBackend } from '../services/userService';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const refresh = useCallback(async () => {
    const [token, storedUser] = await Promise.all([getAccessToken(), getCurrentUser()]);
    setUser(token ? storedUser : null);
    setBooting(false);
  }, []);
  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => { setUnauthorizedHandler(() => { setUser(null); setSessionExpired(true); }); return () => setUnauthorizedHandler(null); }, []);
  const establish = useCallback(async ({ accessToken, user: nextUser }) => { await setSession(accessToken, nextUser); setUser(nextUser); setSessionExpired(false); }, []);
  const signOut = useCallback(async () => { try { await logoutBackend(); } catch {} await clearSession(); setUser(null); }, []);
  const value = useMemo(() => ({ user, setUser, booting, sessionExpired, establish, signOut, refresh }), [user, booting, sessionExpired, establish, signOut, refresh]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { return useContext(AuthContext); }
