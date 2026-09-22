import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const servicesQueryKey = ["services"];

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizeService(item) {
  return {
    ...item,
    is_active: Boolean(item.is_active),
    sort_order: item.sort_order ?? 0,
    image: item.image ?? "",
    description: item.description ?? "",
    short_description: item.short_description ?? "",
    content: item.content ?? "",
    service_category: item.service_category ?? null,
  };
}

function normalizeList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeService);
}

export function useServicesQuery(filters = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...servicesQueryKey, filters],
    queryFn: async () => normalizeList(await api.services(token, filters)),
    enabled: options.enabled !== false && Boolean(token),
  });
}

export function usePublicServicesQuery(filters = {}, options = {}) {
  return useQuery({
    queryKey: [...servicesQueryKey, "public", filters],
    queryFn: async () => normalizeList(await api.services(null, filters)),
    enabled: options.enabled !== false,
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createService(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
    },
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateService(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
    },
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteService(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicesQueryKey });
    },
  });
}