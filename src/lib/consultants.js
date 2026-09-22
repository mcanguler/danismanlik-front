import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const consultantsQueryKey = ["consultants"];

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizeConsultant(item) {
  const name =
    item.user?.name ??
    ([item.user?.first_name, item.user?.last_name].filter(Boolean).join(" ") ||
      `Danışman #${item.id}`);
  return {
    ...item,
    name,
    is_active: Boolean(item.is_active),
  };
}

function normalizeList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeConsultant);
}

export function useConsultantsQuery(filters = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...consultantsQueryKey, filters],
    queryFn: async () => normalizeList(await api.consultants(token, filters)),
    enabled: options.enabled !== false && Boolean(token),
  });
}

export function useConsultantQuery(id) {
  const token = useToken();

  return useQuery({
    queryKey: [...consultantsQueryKey, id],
    queryFn: async () => {
      const payload = await api.consultant(token, id);
      return normalizeConsultant(payload?.data ?? payload);
    },
    enabled: Boolean(token && id),
  });
}

export function useCreateConsultant() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createConsultant(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultantsQueryKey });
    },
  });
}

export function useUpdateConsultant() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateConsultant(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultantsQueryKey });
    },
  });
}

export function useDeleteConsultant() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteConsultant(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultantsQueryKey });
    },
  });
}