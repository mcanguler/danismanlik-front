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
    certificates: normalizeMediaList(item.certificates),
    images: normalizeMediaList(item.images).sort(
      (a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)
    ),
  };
}

export function consultantKey(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === "object" && value !== null) {
    return value.slug ? String(value.slug) : value.id ? String(value.id) : null;
  }
  return String(value);
}

function isNumericId(value) {
  return /^\d+$/.test(String(value ?? ""));
}

function normalizeMediaList(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map(normalizeMediaEntry)
    .filter(Boolean);
}

function normalizeMediaEntry(entry) {
  if (typeof entry === "string") {
    return entry.trim()
      ? { id: null, src: entry.trim(), title: null, sort_order: 0 }
      : null;
  }
  if (!entry || typeof entry !== "object") return null;
  const src =
    entry.image ?? entry.url ?? entry.file ?? entry.path ?? entry.image_path ?? null;
  if (!src) return null;
  return {
    id: entry.id ?? null,
    src: String(src),
    title: entry.title ?? entry.name ?? entry.caption ?? null,
    sort_order: entry.sort_order ?? 0,
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

export function usePublicConsultantsQuery(filters = {}, options = {}) {
  return useQuery({
    queryKey: [...consultantsQueryKey, "public", filters],
    queryFn: async () => normalizeList(await api.consultants(null, filters)),
    enabled: options.enabled !== false,
  });
}

export function usePublicConsultantQuery(id, options = {}) {
  return useQuery({
    queryKey: [...consultantsQueryKey, "public", String(id)],
    queryFn: async () => {
      const payload = await api.consultant(null, id);
      return normalizeConsultant(payload?.data ?? payload);
    },
    enabled: (options.enabled ?? true) !== false && Boolean(id),
  });
}

export function useConsultantQuery(id) {
  const token = useToken();

  return useQuery({
    queryKey: [...consultantsQueryKey, consultantKey(id)],
    queryFn: async () => {
      // Single consultant detail is slug-based (`GET /v1/consultants/{slug}`);
      // numeric ids resolve to slug via the list endpoint first.
      let key = consultantKey(id);
      if (key && isNumericId(key)) {
        const list = await normalizeList(await api.consultants(token, {}));
        const match =
          list.find((item) => String(item.id) === key) ?? null;
        if (match?.slug) {
          key = match.slug;
        } else if (!match) {
          throw new ApiError("Danışman bulunamadı", 404);
        }
      }
      const payload = await api.consultant(token, key);
      return normalizeConsultant(payload?.data ?? payload);
    },
    enabled: Boolean(token && consultantKey(id)),
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