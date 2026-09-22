import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";
import { normalizeConsultant } from "./consultants";

export const consultantServicesQueryKey = ["consultant-services"];

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizeConsultantService(item) {
  const consultantName =
    item.consultant?.name ??
    item.consultant_name ??
    `Danışman #${item.consultant_id}`;
  const serviceName =
    item.service?.name ?? item.service_name ?? `Hizmet #${item.service_id}`;
  return {
    ...item,
    consultantName,
    serviceName,
    price: item.price ?? 0,
    duration: item.duration ?? 0,
    break_duration: item.break_duration ?? 0,
    is_active: Boolean(item.is_active),
  };
}

function normalizeList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeConsultantService);
}

export function useConsultantServicesQuery(filters = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...consultantServicesQueryKey, filters],
    queryFn: async () =>
      normalizeList(await api.consultantServices(token, filters)),
    enabled: options.enabled !== false && Boolean(token),
  });
}

export function useConsultantServiceOptionsQuery(consultantId) {
  const token = useToken();

  return useQuery({
    queryKey: [...consultantServicesQueryKey, "by-consultant", consultantId],
    queryFn: async () => {
      const payload = await api.consultantServicesForConsultant(
        token,
        consultantId
      );
      const data = payload?.data ?? payload;
      if (!Array.isArray(data)) {
        throw new ApiError("Beklenmeyen yanıt formatı");
      }
      return data.map((item) => ({
        id: item.id,
        consultant_id: item.consultant_id,
        service_id: item.service_id,
        name:
          item.service?.name ??
          item.service_name ??
          `Hizmet #${item.service_id}`,
        duration: item.duration ?? 0,
        price: item.price ?? 0,
      }));
    },
    enabled: Boolean(consultantId),
    retry: false,
  });
}

export function useConsultantServiceOfferingsQuery(serviceId) {
  return useQuery({
    queryKey: [...consultantServicesQueryKey, "offerings", String(serviceId ?? "")],
    queryFn: async () => {
      const consultantsPayload = await api.consultants(null);
      const consultantsData = consultantsPayload?.data ?? consultantsPayload;
      if (!Array.isArray(consultantsData)) {
        throw new ApiError("Beklenmeyen yanıt formatı");
      }
      const consultants = consultantsData
        .filter((item) => item.is_active !== false)
        .map(normalizeConsultant);
      const offerings = await Promise.all(
        consultants.map(async (consultant) => {
          try {
            const payload = await api.consultantServicesForConsultant(
              null,
              consultant.id
            );
            const data = payload?.data ?? payload;
            if (!Array.isArray(data)) return null;
            const match = data.find(
              (item) =>
                String(item.service_id) === String(serviceId) &&
                item.is_active !== false
            );
            if (!match) return null;
            return {
              consultant: {
                id: consultant.id,
                name: consultant.name,
                title: consultant.title ?? "",
                profileImage: consultant.profile_image ?? null,
              },
              offering: {
                id: match.id,
                service_id: match.service_id,
                price: match.price ?? null,
                duration: match.duration ?? null,
              },
            };
          } catch {
            return null;
          }
        })
      );
      return offerings.filter(Boolean);
    },
    enabled: serviceId !== undefined && serviceId !== null,
    retry: false,
  });
}

export function useCreateConsultantService() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createConsultantService(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultantServicesQueryKey });
    },
  });
}

export function useUpdateConsultantService() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      api.updateConsultantService(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultantServicesQueryKey });
    },
  });
}

export function useDeleteConsultantService() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteConsultantService(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultantServicesQueryKey });
    },
  });
}