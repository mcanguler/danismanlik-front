import { create } from "zustand";

export const TOKEN_KEY = "danismanlik.auth.token";

export const ROLES = {
  ADMIN: "ADMIN",
  CONSULTANT: "CONSULTANT",
  CUSTOMER: "CUSTOMER",
};

export const ROLE_HOME = {
  [ROLES.ADMIN]: "/dashboard/admin",
  [ROLES.CONSULTANT]: "/dashboard/consultant",
  [ROLES.CUSTOMER]: "/dashboard/customer",
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: "Yönetici",
  [ROLES.CONSULTANT]: "Danışman",
  [ROLES.CUSTOMER]: "Müşteri",
};

export function roleHomePath(role) {
  if(role && ROLE_HOME[role]) return ROLE_HOME[role];
  return "/";
}

export function readToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

function writeToken(token) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export function extractToken(data) {
  if (!data || typeof data !== "object") return null;
  const token =
    data.token ??
    data.access_token ??
    data.data?.token ??
    data.data?.access_token;
  return typeof token === "string" && token.length > 0 ? token : null;
}

export function normalizeUser(data) {
  if (!data || typeof data !== "object") return null;
  const user = data.user ?? data.data?.user ?? data.data ?? data;
  if (typeof user !== "object" || user === null) return null;
  return {
    ...user,
    role: user.role ?? user.role_name ?? user.type ?? ROLES.CUSTOMER,
  };
}

export const useAuthStore = create((set) => ({
  token: null,
  user: null,
  status: "loading",

  setToken(token) {
    set({ token });
  },
  setStatus(status) {
    set({ status });
  },
  startSession(token, user) {
    writeToken(token);
    set({ token, user, status: "authenticated" });
  },
  setUser(user) {
    set({ user });
  },
  endSession() {
    clearToken();
    set({ token: null, user: null, status: "unauthenticated" });
  },
}));
