import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from "react";
import { User, AuthState } from "../types.ts";
import { apiFetch } from "../services/api.ts";

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem("ems_token"),
    loading: true,
    error: null,
  });

  // Verify token on application mount
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("ems_token");
      if (!token) {
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      try {
        const data = await apiFetch("/auth/me");
        setState({
          user: data.user,
          token,
          loading: false,
          error: null,
        });
      } catch (err: any) {
        console.warn("Session expired or invalid token:", err.message);
        localStorage.removeItem("ems_token");
        setState({
          user: null,
          token: null,
          loading: false,
          error: null,
        });
      }
    };

    verifyUser();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("ems_token", data.token);
      setState({
        user: data.user,
        token: data.token,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to log in",
      }));
      throw err;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });

      localStorage.setItem("ems_token", data.token);
      setState({
        user: data.user,
        token: data.token,
        loading: false,
        error: null,
      });
    } catch (err: any) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err.message || "Failed to register",
      }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ems_token");
    setState({
      user: null,
      token: null,
      loading: false,
      error: null,
    });
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const value = useMemo(() => ({
    ...state,
    login,
    register,
    logout,
    clearError,
  }), [state, login, register, logout, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
