import { createContext, useCallback, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL;
export const UserContext = createContext(null);

async function api(path, options = {}) {
  return fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loginError, setLoginError] = useState("");

  const refreshSession = useCallback(async () => {
    try {
      const response = await api("/api/me");
      if (!response.ok) return setUser(null);
      const { user: sessionUser } = await response.json();
      setUser(sessionUser);
    } catch {
      setUser(null);
    } finally {
      setIsInitializing(false);
    }
  }, []);

  useEffect(() => { refreshSession(); }, [refreshSession]);

  const login = useCallback(async (email, password) => {
    setLoginError("");
    try {
      const response = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setLoginError(data.message ?? "Login failed");
        return false;
      }
      setUser(data.user);
      return true;
    } catch {
      setLoginError("Unable to reach the authentication server");
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    await api("/api/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, isLoggedIn: Boolean(user), isInitializing, loginError, login, logout }), [user, isInitializing, loginError, login, logout]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
