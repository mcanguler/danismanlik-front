import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const blockedTimesQueryKey = ["blocked-times"];

function useToken() {
  return useAuthStore((state) => state.token);
}

function formatDateTime(iso) {
  if (!iso) return "";
  return iso.slice(0, 16).replace("T", " ");
}

export function normalizeBlockedTime(item) {
  return {
    ...item,
    consultantName:
      item.consultant?.name ??
      item.consultant_name ??
      `Danışman #${item.consultant_id}`,
    start_at: item.start_at ?? "",
    end_at: item.end_at ?? "",
    reason: item.reason ?? "",
    startAtLabel: formatDateTime(item.start_at),
    endAtLabel: formatDateTime(item.end_at),
  };
}

function normalizeList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeBlockedTime);
}

export function useBlockedTimesQuery(filters = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...blockedTimesQueryKey, filters],
    queryFn: async () => normalizeList(await api.blockedTimes(token, filters)),
    enabled: Boolean(token),
  });
}

export function useCreateBlockedTime() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createBlockedTime(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockedTimesQueryKey });
    },
  });
}

export function useUpdateBlockedTime() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      api.updateBlockedTime(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockedTimesQueryKey });
    },
  });
}

export function useDeleteBlockedTime() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteBlockedTime(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blockedTimesQueryKey });
    },
  });
}