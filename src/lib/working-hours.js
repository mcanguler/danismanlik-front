import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const workingHoursQueryKey = ["working-hours"];

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
  return DAYS.find((d) => d.value === Number(day))?.label ?? String(day ?? "—");
}

function useToken() {
  return useAuthStore((state) => state.token);
}

function normalizeTime(value) {
  return (value ?? "").slice(0, 5);
}

export function normalizeWorkingHour(item) {
  return {
    ...item,
    consultantName:
      item.consultant?.name ??
      item.consultant_name ??
      `Danışman #${item.consultant_id}`,
    day_of_week: Number(item.day_of_week),
    start_time: normalizeTime(item.start_time),
    end_time: normalizeTime(item.end_time),
    is_active: Boolean(item.is_active),
  };
}

function normalizeList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeWorkingHour);
}

export function useWorkingHoursQuery(filters = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...workingHoursQueryKey, filters],
    queryFn: async () => normalizeList(await api.workingHours(token, filters)),
    enabled: Boolean(token),
  });
}

export function useCreateWorkingHour() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createWorkingHour(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workingHoursQueryKey });
    },
  });
}

export function useUpdateWorkingHour() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateWorkingHour(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workingHoursQueryKey });
    },
  });
}

export function useDeleteWorkingHour() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteWorkingHour(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workingHoursQueryKey });
    },
  });
}