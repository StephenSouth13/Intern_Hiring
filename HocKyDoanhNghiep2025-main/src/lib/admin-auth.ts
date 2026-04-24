import { useEffect, useState } from "react";

const ADMIN_SESSION_KEY = "hkdn-admin-session";

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export function isAdminAuthenticated() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

export function loginAdmin(username: string, password: string) {
  const ok =
    username === ADMIN_CREDENTIALS.username &&
    password === ADMIN_CREDENTIALS.password;

  if (ok && typeof window !== "undefined") {
    window.localStorage.setItem(ADMIN_SESSION_KEY, "true");
  }

  return ok;
}

export function logoutAdmin() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(ADMIN_SESSION_KEY);
  }
}

export function useAdminAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(isAdminAuthenticated());
  }, []);

  return {
    isAuthenticated,
    login(username: string, password: string) {
      const ok = loginAdmin(username, password);
      setIsAuthenticated(ok);
      return ok;
    },
    logout() {
      logoutAdmin();
      setIsAuthenticated(false);
    },
  };
}
