import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const serviceCategoriesQueryKey = ["service-categories"];

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizeServiceCategory(item) {
  return {
    ...item,
    is_active: Boolean(item.is_active),
    sort_order: item.sort_order ?? 0,
    image: item.image ?? "",
    short_description: item.short_description ?? "",
    content: item.content ?? "",
  };
}

function normalizeList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeServiceCategory);
}

export function useServiceCategoriesQuery(filters = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...serviceCategoriesQueryKey, filters],
    queryFn: async () => normalizeList(await api.serviceCategories(token, filters)),
    enabled: options.enabled !== false && Boolean(token),
  });
}

export function usePublicServiceCategoriesQuery(filters = {}, options = {}) {
  return useQuery({
    queryKey: [...serviceCategoriesQueryKey, "public", filters],
    queryFn: async () =>
      normalizeList(await api.serviceCategories(null, filters)),
    enabled: options.enabled !== false,
  });
}

export function useCreateServiceCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createServiceCategory(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceCategoriesQueryKey });
    },
  });
}

export function useUpdateServiceCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      api.updateServiceCategory(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceCategoriesQueryKey });
    },
  });
}

export function useDeleteServiceCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteServiceCategory(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceCategoriesQueryKey });
    },
  });
}