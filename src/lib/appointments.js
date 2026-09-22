import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";
import {format} from "date-fns";
import {
  customerServicePackagesQueryKey,
  myServicePackagesQueryKey,
} from "./service-packages";

export const appointmentsQueryKey = ["appointments"];

export const APPOINTMENT_STATUSES = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const APPOINTMENT_STATUS_LABELS = {
  [APPOINTMENT_STATUSES.PENDING]: "Beklemede",
  [APPOINTMENT_STATUSES.CONFIRMED]: "Onaylandı",
  [APPOINTMENT_STATUSES.COMPLETED]: "Tamamlandı",
  [APPOINTMENT_STATUSES.CANCELLED]: "İptal Edildi",
};

export const APPOINTMENT_STATUS_BADGE_CLASSES = {
  [APPOINTMENT_STATUSES.PENDING]:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  [APPOINTMENT_STATUSES.CONFIRMED]:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [APPOINTMENT_STATUSES.COMPLETED]:
    "bg-muted text-muted-foreground",
  [APPOINTMENT_STATUSES.CANCELLED]:
    "bg-destructive/10 text-destructive",
};

const CONFLICT_MESSAGE = "Slot artık müsait değil, lütfen yeniden deneyin.";

function useToken() {
  return useAuthStore((state) => state.token);
}

function timeOf(value) {
  const value_ = String(value ?? "");
  if (/^\d{2}:\d{2}/.test(value_)) return value_.slice(0, 5);
  if (value_.length >= 16 && (value_[10] === "T" || value_[10] === " ")) {
    return value_.slice(11, 16);
  }
  return value_;
}

function hasDatePart(value) {
  const value_ = String(value ?? "");
  return value_.includes("T") || value_.includes(" ");
}

function datePartOf(value) {
  const value_ = String(value ?? "").replace("T", " ");
  return value_.includes(" ") ? value_.slice(0, value_.indexOf(" ")) : "";
}

function normalizeSlot(slot, date) {
  if (typeof slot === "string") {
    const time = timeOf(slot);
    if (hasDatePart(slot)) {
      return { start: time, end: null, label: time };
    }
    return { start: time, end: null, label: time };
  }
  if (!slot || typeof slot !== "object") return null;
  const start = slot.start_at ?? slot.start ?? slot.start_time ?? slot.from ?? null;
  const end = slot.end_at ?? slot.end ?? slot.end_time ?? slot.to ?? null;
  if (!start) return null;
  const startTime = timeOf(start);
  const endTime = end ? timeOf(end) : null;
  return {
    start: startTime,
    end: endTime,
    label: endTime ? `${startTime} - ${endTime}` : startTime,
  };
}

function normalizeSlots(payload) {
  const data = payload?.data ?? payload;
  const slots = Array.isArray(data)
    ? data
    : Array.isArray(data?.slots)
      ? data.slots
      : Array.isArray(data?.availability)
        ? data.availability
        : null;
  if (slots === null) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  const seen = new Set();
  const result = [];
  for (const raw of slots) {
    const slot = normalizeSlot(raw);
    if (!slot || seen.has(slot.start)) continue;
    seen.add(slot.start);
    result.push(slot);
  }
  return result.sort((a, b) =>
    a.start < b.start ? -1 : a.start > b.start ? 1 : 0
  );
}

export function useAvailabilityQuery({ consultantId, serviceId, date }) {
  const token = useToken();

  return useQuery({
    queryKey: [
      ...appointmentsQueryKey,
      "availability",
      consultantId,
      serviceId,
      date,
    ],
    queryFn: async () =>
      normalizeSlots(
        await api.availability(token, consultantId, {
          service_id: serviceId,
          date,
        })
      ),
    enabled: Boolean(consultantId && serviceId && date),
    staleTime: 30 * 1000,
    retry: false,
  });
}

function personName(person) {
  if (!person || typeof person !== "object") return null;
  if (person.name) return person.name;
  const full = [person.first_name, person.last_name]
    .filter(Boolean)
    .join(" ");
  return full || null;
}

function normalizeAppointment(item) {
  if (!item || typeof item !== "object") return null;
  const customer = item.customer ?? null;
  const consultant = item.consultant ?? null;
  const service =
    item.service ?? item.consultant_service?.service ?? null;
  return {
    ...item,
    status: item.status ?? APPOINTMENT_STATUSES.PENDING,
    customerName:
      personName(customer) ?? item.customer_name ?? `Müşteri #${item.customer_id ?? "?"}`,
    consultantName:
      personName(consultant) ??
      item.consultant_name ??
      `Danışman #${item.consultant_id ?? "?"}`,
    serviceName: service?.name ?? item.service_name ?? null,
    startAt: item.start_at ?? null,
    endAt: item.end_at ?? null,
    notes: item.notes ?? "",
    customerId: customer?.id ?? item.customer_id ?? null,
    consultantId: consultant?.id ?? item.consultant_id ?? null,
  };
}

function normalizeAppointmentList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeAppointment).filter(Boolean);
}

export function useAppointmentsQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...appointmentsQueryKey, "list", params],
    queryFn: async () =>
      normalizeAppointmentList(await api.appointments(token, params)),
    enabled: options.enabled !== false && Boolean(token),
    retry: false,
  });
}

export function useAppointmentQuery(id) {
  const token = useToken();

  return useQuery({
    queryKey: [...appointmentsQueryKey, "detail", String(id)],
    queryFn: async () => {
      const payload = await api.appointment(token, id);
      const appointment = normalizeAppointment(payload?.data ?? payload);
      if (!appointment) throw new ApiError("Randevu bulunamadı", 404);
      return appointment;
    },
    enabled: Boolean(token && id),
    retry: false,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async (payload) => {
      const response = await api.createAppointment(token, payload);
      const appointment = normalizeAppointment(response?.data ?? response);
      if (!appointment) throw new ApiError("Beklenmeyen yanıt formatı");
      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKey });
      queryClient.invalidateQueries({ queryKey: myServicePackagesQueryKey });
      queryClient.invalidateQueries({
        queryKey: customerServicePackagesQueryKey,
      });
    },
  });
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateAppointment(token, id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKey });
      if (variables?.id !== undefined) {
        queryClient.invalidateQueries({
          queryKey: [...appointmentsQueryKey, "detail", String(variables.id)],
        });
      }
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.cancelAppointment(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentsQueryKey });
      queryClient.invalidateQueries({ queryKey: myServicePackagesQueryKey });
      queryClient.invalidateQueries({
        queryKey: customerServicePackagesQueryKey,
      });
    },
  });
}

export function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function formatDateLabel(value) {
  const date = datePartOf(value);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return String(value ?? "");
  return date.split("-").reverse().join(".");
}

export function formatTimeLabel(value) {
  return format(new Date(value), "HH:mm");
}

export function getErrorMessage(error) {
  if (!(error instanceof ApiError)) return "Beklenmeyen bir hata oluştu";
  if (error.status === 401) return "Oturumunuz sona erdi, lütfen tekrar giriş yapın.";
  if (error.status === 403) return "Bu işlem için yetkiniz yok.";
  if (error.status === 404) return "Kayıt bulunamadı.";
  if (error.status === 0) return error.message;
  return error.message || `İstek başarısız (${error.status})`;
}

export function isConflictError(error) {
  if (!(error instanceof ApiError)) return false;
  if (error.status === 409) return true;
  if (error.status === 422) {
    const errors = error.errors ?? {};
    const startErrors = errors.start_at ?? [];
    const endErrors = errors.end_at ?? [];
    const messages = [
      ...(Array.isArray(startErrors) ? startErrors : [startErrors]),
      ...(Array.isArray(endErrors) ? endErrors : [endErrors]),
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("tr");
    return (
      messages.includes("slot") ||
      messages.includes("müsait") ||
      messages.includes("çakış")
    );
  }
  return false;
}

export { CONFLICT_MESSAGE };
