import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const settingsQueryKey = ["settings"];
export const adminSettingsQueryKey = ["admin-settings"];

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizeSettingsMap(payload) {
  const data = payload?.data ?? payload ?? {};
  const map = {};
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === "object" && item.key != null) {
        map[item.key] = item.value ?? "";
      }
    }
    return map;
  }
  if (data && typeof data === "object") {
    for (const [key, value] of Object.entries(data)) {
      if (value != null && typeof value !== "object") {
        map[key] = value;
      }
    }
  }
  return map;
}

function normalizeSetting(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    key: item.key ?? "",
    value: item.value ?? "",
  };
}

function normalizeSettingList(payload) {
  const data = payload?.data;
  if (Array.isArray(data)) {
    const meta = payload?.meta ?? null;
    return {
      items: data.map(normalizeSetting).filter(Boolean),
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
  if (data && typeof data === "object") {
    const items = Object.entries(data).map(([key, value]) =>
      normalizeSetting({ id: key, key, value })
    );
    return { items, meta: null };
  }
  throw new ApiError("Beklenmeyen yanıt formatı");
}

export function useSettingsQuery(options = {}) {
  return useQuery({
    queryKey: settingsQueryKey,
    queryFn: async () => normalizeSettingsMap(await api.settings()),
    enabled: options.enabled !== false,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminSettingsQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...adminSettingsQueryKey, params],
    queryFn: async () =>
      normalizeSettingList(await api.adminSettings(token, params)),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
  });
}

export function useAdminSettingQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...adminSettingsQueryKey, "detail", String(id)],
    queryFn: async () => {
      const payload = await api.adminSettings(token, {});
      const data = payload?.data ?? payload;
      const items = Array.isArray(data)
        ? data
        : data && typeof data === "object"
          ? Object.entries(data).map(([key, value]) => ({ id: key, key, value }))
          : [];
      const setting = items.find(
        (item) => String(item.id) === String(id) || item.key === id
      );
      if (!setting) throw new ApiError("Ayar bulunamadı");
      return normalizeSetting(setting);
    },
    enabled: (options.enabled ?? true) !== false && Boolean(token && id),
  });
}

export function useCreateSetting() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createSetting(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKey });
      queryClient.invalidateQueries({ queryKey: settingsQueryKey });
    },
  });
}

export function useUpdateSetting() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateSetting(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKey });
      queryClient.invalidateQueries({ queryKey: settingsQueryKey });
    },
  });
}

export function useDeleteSetting() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteSetting(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminSettingsQueryKey });
      queryClient.invalidateQueries({ queryKey: settingsQueryKey });
    },
  });
}
