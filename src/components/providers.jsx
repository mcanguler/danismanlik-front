"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { readToken, useAuthStore } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { useUserQuery } from "@/lib/auth-hooks";
import { Toaster } from "@/components/ui/toast";

let browserQueryClient;

function getQueryClient() {
  if (typeof window === "undefined") return new QueryClient();
  browserQueryClient ??= new QueryClient();
  return browserQueryClient;
}

function AuthBootstrap() {
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const setStatus = useAuthStore((state) => state.setStatus);
  const startSession = useAuthStore((state) => state.startSession);
  const endSession = useAuthStore((state) => state.endSession);

  const userQuery = useUserQuery();

  useEffect(() => {
    const stored = readToken();
    if (!stored) {
      setStatus("unauthenticated");
      return;
    }
    if (stored !== token) setToken(stored);
  }, [token, setToken, setStatus]);

  useEffect(() => {
    if (!userQuery.isError) return;
    const error = userQuery.error;
    if (error instanceof ApiError && error.status === 401) {
      endSession();
    } else {
      setStatus("unauthenticated");
    }
  }, [userQuery.isError, userQuery.error, endSession, setStatus]);

  useEffect(() => {
    if (userQuery.isSuccess && userQuery.data) {
      startSession(token, userQuery.data);
    }
  }, [userQuery.isSuccess, userQuery.data, token, startSession]);

  return null;
}

export function Providers({ children }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      <AuthBootstrap />
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
