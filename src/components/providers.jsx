"use client";

import { useEffect } from "react";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { readToken, useAuthStore } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { useAuth, useUserQuery } from "@/lib/auth-hooks";
import { hasGuestCartItems, mergeGuestCartToServer } from "@/lib/guest-cart";
import { cartQueryKey } from "@/lib/products";
import { toast, Toaster } from "@/components/ui/toast";

let browserQueryClient;

function getQueryClient() {
  if (typeof window === "undefined") return new QueryClient();
  browserQueryClient ??= new QueryClient();
  return browserQueryClient;
}

function AuthBootstrap() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);
  const setToken = useAuthStore((state) => state.setToken);
  const setStatus = useAuthStore((state) => state.setStatus);
  const startSession = useAuthStore((state) => state.startSession);
  const endSession = useAuthStore((state) => state.endSession);
  const { status } = useAuth();

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

  useEffect(() => {
    if (status !== "authenticated" || !token) return;
    if (!hasGuestCartItems()) return;
    let cancelled = false;
    mergeGuestCartToServer(token)
      .then(({ merged, failed, dropped }) => {
        if (cancelled) return;
        queryClient.invalidateQueries({ queryKey: cartQueryKey });
        if (dropped > 0) {
          toast.add({
            title: "Bazı ürünler aktarılamadı",
            description:
              "Sepetinizdeki bazı ürünler artık satın alınamıyor olabilir.",
            type: "info",
          });
        } else if (merged > 0) {
          toast.add({
            title: "Sepetiniz birleştirildi",
            description:
              failed > 0
                ? "Bazı öğeler hesabınıza aktarılamadı."
                : "Misafir sepetiniz hesabınıza aktarıldı.",
            type: failed > 0 ? "info" : "success",
          });
        }
      })
      .catch(() => void 0);
    return () => {
      cancelled = true;
    };
  }, [status, token, queryClient]);

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
