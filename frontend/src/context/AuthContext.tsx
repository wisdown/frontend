// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { login as apiLogin } from "../api/authApi";
import type { LoginResponse } from "../api/authApi";

interface AuthUser {
  // por ahora vacío, luego lo llenaremos cuando implementemos /me
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Cargar sesión desde localStorage al iniciar
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const data: LoginResponse = await apiLogin(username, password);
    

    // OJO: ajusta 'access' si tu backend devuelve 'token' u otro nombre
    const newToken = data.access;
    const newUser = null;



    setToken(newToken);
    setUser(newUser);

    localStorage.setItem("auth_token", newToken);
    localStorage.removeItem("auth_user"); // no existe aún
    
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!token,
    login: handleLogin,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
