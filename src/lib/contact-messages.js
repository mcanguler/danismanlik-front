import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const contactMessagesQueryKey = ["admin-contact-messages"];

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizeContactMessage(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    name: item.name ?? "",
    email: item.email ?? "",
    phone: item.phone ?? null,
    subject: item.subject ?? null,
    message: item.message ?? "",
    is_read: Boolean(item.is_read),
    ip_address: item.ip_address ?? null,
    user_agent: item.user_agent ?? null,
  };
}

function normalizeContactMessageDetail(payload) {
  const message = normalizeContactMessage(payload?.data ?? payload);
  if (!message) throw new ApiError("Beklenmeyen yanıt formatı");
  return message;
}

function normalizeContactMessageList(payload) {
  const data = payload?.data;
  const meta = payload?.meta ?? null;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return {
    items: data.map(normalizeContactMessage).filter(Boolean),
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

export function useContactMessagesQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...contactMessagesQueryKey, params],
    queryFn: async () =>
      normalizeContactMessageList(await api.adminContactMessages(token, params)),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
  });
}

export function useContactMessageQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...contactMessagesQueryKey, "detail", String(id)],
    queryFn: async () =>
      normalizeContactMessageDetail(await api.adminContactMessage(token, id)),
    enabled: (options.enabled ?? true) !== false && Boolean(token && id),
    retry: false,
  });
}

export function useMarkContactMessageRead() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, isRead }) =>
      api.markContactMessageRead(token, id, { is_read: isRead }),
    onSuccess: (message, { id }) => {
      queryClient.invalidateQueries({ queryKey: contactMessagesQueryKey });
      queryClient.invalidateQueries({
        queryKey: [...contactMessagesQueryKey, "detail", String(id)],
      });
    },
  });
}

export function useDeleteContactMessage() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteContactMessage(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contactMessagesQueryKey });
    },
  });
}
