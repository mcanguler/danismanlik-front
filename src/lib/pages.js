import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const adminPagesQueryKey = ["admin-pages"];
export const publicPagesQueryKey = ["public-pages"];

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizePage(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    title: item.title ?? "",
    slug: item.slug ?? "",
    content: item.content ?? "",
    seo_title: item.seo_title ?? "",
    seo_description: item.seo_description ?? "",
    is_active: Boolean(item.is_active),
  };
}

export function normalizePageDetail(payload) {
  const page = normalizePage(payload?.data ?? payload);
  if (!page) throw new ApiError("Beklenmeyen yanıt formatı");
  return page;
}

function normalizePageList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizePage).filter(Boolean);
}

function normalizePageAdminList(payload) {
  const data = payload?.data;
  const meta = payload?.meta ?? null;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return {
    items: data.map(normalizePage).filter(Boolean),
    meta: meta
      ? {
          currentPage: meta.current_page ?? 1,
          lastPage: meta.last_page ?? 1,
          perPage: meta.per_page ?? data.length,
          total: meta.total ?? data.length,
        }
      : null,
  };
}

export function useAdminPagesQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...adminPagesQueryKey, params],
    queryFn: async () =>
      normalizePageAdminList(await api.adminPages(token, params)),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
  });
}

export function useAdminPageQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...adminPagesQueryKey, "detail", String(id)],
    queryFn: async () => normalizePageDetail(await api.adminPage(token, id)),
    enabled: (options.enabled ?? true) !== false && Boolean(token && id),
    retry: false,
  });
}

export function usePublicPagesQuery(options = {}) {
  return useQuery({
    queryKey: [...publicPagesQueryKey],
    queryFn: async () => normalizePageList(await api.publicPages()),
    enabled: options.enabled !== false,
  });
}

export function usePublicPageQuery(slug, options = {}) {
  return useQuery({
    queryKey: [...publicPagesQueryKey, "detail", String(slug)],
    queryFn: async () => normalizePageDetail(await api.publicPage(slug)),
    enabled: (options.enabled ?? true) !== false && Boolean(slug),
    retry: false,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async (payload) =>
      normalizePageDetail(await api.createPage(token, payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPagesQueryKey });
      queryClient.invalidateQueries({ queryKey: publicPagesQueryKey });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updatePage(token, id, payload),
    onSuccess: (updated, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminPagesQueryKey });
      queryClient.invalidateQueries({ queryKey: publicPagesQueryKey });
      queryClient.invalidateQueries({
        queryKey: [...adminPagesQueryKey, "detail", String(id)],
      });
      queryClient.invalidateQueries({
        queryKey: [...publicPagesQueryKey, "detail", String(updated.slug)],
      });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deletePage(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminPagesQueryKey });
      queryClient.invalidateQueries({ queryKey: publicPagesQueryKey });
    },
  });
}
