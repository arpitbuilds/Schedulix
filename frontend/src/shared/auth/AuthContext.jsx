import React, { createContext, useContext, useMemo, useState } from "react";
import { clearAuth, getToken, getUser, setAuth } from "./storage.js";
import { http } from "../api/http.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(getUser());

  const isAuthed = !!token && !!user;

  async function login({ username, password }) {
    const resp = await http.post("/api/auth/login", { username, password });
    const payload = resp.data?.data;
    setAuth({ token: payload.token, user: payload.user });
    setToken(payload.token);
    setUser(payload.user);
    return payload.user;
  }

  function logout() {
    clearAuth();
    setToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, isAuthed, login, logout }),
    [token, user, isAuthed]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
