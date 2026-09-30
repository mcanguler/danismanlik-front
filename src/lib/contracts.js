import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { isApiError } from "./query-errors";
import { useAuthStore } from "./auth";

export const contractTemplatesQueryKey = ["contract-templates"];

export const CONTRACT_TYPE_LABELS = {
  DISTANCE_SALES: "Mesafeli Satış Sözleşmesi",
};

export const CONTRACT_TYPES = Object.keys(CONTRACT_TYPE_LABELS);

export const CONTRACT_PLACEHOLDERS = [
  "seller.name",
  "seller.address",
  "seller.email",
  "seller.phone",
  "buyer.name",
  "buyer.address",
  "buyer.email",
  "buyer.phone",
  "order.order_no",
  "order.date",
  "order.total",
  "order.items",
];

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizeContractTemplate(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    type: item.type ?? "DISTANCE_SALES",
    title: item.title ?? "",
    content: item.content ?? "",
    version: item.version ?? "",
    is_active: Boolean(item.is_active),
    created_at: item.created_at ?? null,
    updated_at: item.updated_at ?? null,
  };
}

export function normalizeContractTemplateDetail(payload) {
  const template = normalizeContractTemplate(payload?.data ?? payload);
  if (!template) throw new ApiError("Beklenmeyen yanıt formatı");
  return template;
}

function normalizeList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeContractTemplate).filter(Boolean);
}

export function normalizeOrderContract(payload) {
  const item = payload?.data ?? payload;
  if (!item || typeof item !== "object") {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return {
    ...item,
    type: item.type ?? "DISTANCE_SALES",
    title: item.title ?? "",
    version: item.version ?? "",
    content: item.content ?? "",
    accepted_at: item.accepted_at ?? null,
    accepted_ip: item.accepted_ip ?? null,
  };
}

/**
 * Checkout'un aktif mesafeli satış sözleşmesi nedeniyle 422 döndüğünü
 * tespit eder (backend yalnızca bu sinyali gönderir).
 */
export function isContractRequiredError(error) {
  if (!isApiError(error) || error.status !== 422) return false;
  if (error.errors?.contract_accepted != null) return true;
  return /contract_accepted|satış sözleşmesi|satis sozlesmesi/i.test(
    error.message ?? ""
  );
}

export function getContractRequiredMessage(error) {
  const fieldErrors = error?.errors?.contract_accepted;
  if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
    return fieldErrors[0];
  }
  if (typeof fieldErrors === "string" && fieldErrors) return fieldErrors;
  return error?.message ?? "Satış sözleşmesi kabul edilmelidir.";
}

/** Sunucu tarafında da kullanılabilir; admin listesi için veri çekici. */
export async function fetchContractTemplates(token) {
  return normalizeList(await api.contractTemplates(token));
}

export function useAdminContractTemplatesQuery(options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...contractTemplatesQueryKey],
    queryFn: async () => normalizeList(await api.contractTemplates(token)),
    enabled: (options.enabled ?? true) !== false && Boolean(token),
  });
}

export function useAdminContractTemplateQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...contractTemplatesQueryKey, "detail", String(id)],
    queryFn: async () =>
      normalizeContractTemplateDetail(await api.contractTemplate(token, id)),
    enabled: (options.enabled ?? true) !== false && Boolean(token && id),
    retry: false,
  });
}

export function useCreateContractTemplate() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createContractTemplate(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractTemplatesQueryKey });
    },
  });
}

export function useUpdateContractTemplate() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      api.updateContractTemplate(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractTemplatesQueryKey });
    },
  });
}

export function useDeleteContractTemplate() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteContractTemplate(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractTemplatesQueryKey });
    },
  });
}

export function useContractTemplatePreviewQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...contractTemplatesQueryKey, "preview", String(id)],
    queryFn: async () => {
      const payload = await api.contractTemplatePreview(token, id);
      const data = payload?.data ?? {};
      return {
        title: data.title ?? "",
        version: data.version ?? "",
        content: data.content ?? "",
      };
    },
    enabled: options.enabled === true && Boolean(token && id),
    retry: false,
    staleTime: 0,
  });
}

export function useOrderContractQuery(orderId, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: ["order-contract", String(orderId)],
    queryFn: async () =>
      normalizeOrderContract(await api.orderContract(token, orderId)),
    enabled:
      (options.enabled ?? true) !== false && Boolean(token && orderId),
    retry: false,
    staleTime: Number.POSITIVE_INFINITY,
  });
}
