import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useShallow } from "zustand/react/shallow";
import { api, ApiError } from "./api";
import { extractToken, normalizeUser, useAuthStore } from "./auth";
import { appointmentsQueryKey } from "./appointments";

export const userQueryKey = ["auth", "user"];

export function useAuth() {
  return useAuthStore(
    useShallow((state) => ({
      token: state.token,
      user: state.user,
      status: state.status,
    }))
  );
}

export function useUserQuery() {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: userQueryKey,
    queryFn: async () => {
      const user = normalizeUser(await api.user(token));
      if (!user) throw new ApiError("Kullanıcı bilgisi alınamadı");
      return user;
    },
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  const startSession = useAuthStore((state) => state.startSession);

  return useMutation({
    mutationFn: async (credentials) => {
      const data = await api.login(credentials);
      const token = extractToken(data);
      if (!token) {
        throw new ApiError("Sunucudan geçerli bir oturum yanıtı alınamadı");
      }
      let user = normalizeUser(data);
      if (!user) user = normalizeUser(await api.user(token));
      return { token, user };
    },
    onSuccess: ({ token, user }) => {
      startSession(token, user);
      queryClient.setQueryData(userQueryKey, user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  const startSession = useAuthStore((state) => state.startSession);

  return useMutation({
    mutationFn: async (payload) => {
      const data = await api.register(payload);
      const token = extractToken(data);
      let user = normalizeUser(data);
      if (token && !user) user = normalizeUser(await api.user(token));
      return { token, user };
    },
    onSuccess: ({ token, user }) => {
      if (token && user) {
        startSession(token, user);
        queryClient.setQueryData(userQueryKey, user);
      }
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  const endSession = useAuthStore((state) => state.endSession);

  return useMutation({
    mutationFn: async () => {
      const token = useAuthStore.getState().token;
      if (!token) return;
      try {
        await api.logout(token);
      } catch {
        void 0;
      }
    },
    onSuccess: () => {
      endSession();
      queryClient.removeQueries({ queryKey: userQueryKey });
      queryClient.removeQueries({ queryKey: appointmentsQueryKey });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (payload) => {
      const data = await api.updateProfile(
        useAuthStore.getState().token,
        payload
      );
      const user = normalizeUser(data);
      if (!user) throw new ApiError("Profil güncellenemedi");
      return user;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(userQueryKey, user);
    },
  });
}
