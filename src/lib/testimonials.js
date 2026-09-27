import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const testimonialsQueryKey = ["admin-testimonials"];

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizeTestimonial(item) {
  if (!item || typeof item !== "object") return null;
  const firstName = item.first_name ?? item.firstName ?? null;
  const lastName = item.last_name ?? item.lastName ?? null;
  const fullName =
    item.name ??
    item.full_name ??
    [firstName, lastName].filter(Boolean).join(" ");
  return {
    ...item,
    first_name: firstName,
    last_name: lastName,
    name: fullName ?? "",
    message:
      item.message ??
      item.content ??
      item.comment ??
      item.opinion ??
      item.review ??
      item.text ??
      "",
    is_approved: Boolean(item.is_approved),
  };
}

function normalizeTestimonialDetail(payload) {
  const testimonial = normalizeTestimonial(payload?.data ?? payload);
  if (!testimonial) throw new ApiError("Beklenmeyen yanıt formatı");
  return testimonial;
}

function normalizeTestimonialList(payload) {
  const data = payload?.data;
  const meta = payload?.meta ?? null;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return {
    items: data.map(normalizeTestimonial).filter(Boolean),
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

export function useTestimonialsQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...testimonialsQueryKey, params],
    queryFn: async () =>
      normalizeTestimonialList(await api.adminTestimonials(token, params)),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
  });
}

export function usePublicTestimonialsQuery(params = {}, options = {}) {
  return useQuery({
    queryKey: [...testimonialsQueryKey, "public", params],
    queryFn: async () => normalizeTestimonialList(await api.testimonials(params)),
    enabled: options.enabled !== false,
    placeholderData: keepPreviousData,
  });
}

export function useSubmitTestimonial() {
  return useMutation({
    mutationFn: (payload) => api.submitTestimonial(payload),
  });
}

export function useTestimonialQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...testimonialsQueryKey, "detail", String(id)],
    queryFn: async () =>
      normalizeTestimonialDetail(await api.adminTestimonial(token, id)),
    enabled: (options.enabled ?? true) !== false && Boolean(token && id),
    retry: false,
  });
}

export function useCreateTestimonial() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createTestimonial(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialsQueryKey });
    },
  });
}

export function useTestimonialApproval() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, isApproved }) =>
      api.updateTestimonialApproval(token, id, { is_approved: isApproved }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialsQueryKey });
    },
  });
}

export function useDeleteTestimonial() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteTestimonial(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: testimonialsQueryKey });
    },
  });
}
