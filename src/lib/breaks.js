import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const breaksQueryKey = ["breaks"];

export const DAYS = [
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
  { value: 7, label: "Pazar" },
];

export function dayLabel(day) {
  return DAYS.find((d) => d.value === Number(day))?.label ?? String(day ?? "");
}

function useToken() {
  return useAuthStore((state) => state.token);
}

function normalizeTime(time) {
  return (time ?? "").slice(0, 5);
}

export function normalizeBreak(item) {
  return {
    ...item,
    consultantName:
      item.consultant?.name ??
      item.consultant_name ??
      `Danışman #${item.consultant_id}`,
    day_of_week: Number(item.day_of_week),
    start_time: normalizeTime(item.start_time),
    end_time: normalizeTime(item.end_time),
  };
}

function normalizeList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeBreak);
}

export function useBreaksQuery(filters = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...breaksQueryKey, filters],
    queryFn: async () => normalizeList(await api.breaks(token, filters)),
    enabled: Boolean(token),
  });
}

export function useCreateBreak() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createBreak(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: breaksQueryKey });
    },
  });
}

export function useUpdateBreak() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateBreak(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: breaksQueryKey });
    },
  });
}

export function useDeleteBreak() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteBreak(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: breaksQueryKey });
    },
  });
}