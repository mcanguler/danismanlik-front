import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";
import {
  customerServicePackagesQueryKey,
  myServicePackagesQueryKey,
} from "./service-packages";
import { appointmentsQueryKey } from "./appointments";

export const ordersQueryKey = ["orders"];
export const adminOrdersQueryKey = ["admin-orders"];
export const adminPaymentsQueryKey = ["admin-payments"];
export const paymentLogsQueryKey = ["payment-logs"];

export const ORDER_STATUSES = {
  PENDING: "PENDING",
  PAID: "PAID",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
};

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: "Ödeme Bekleniyor",
  [ORDER_STATUSES.PAID]: "Ödendi",
  [ORDER_STATUSES.FAILED]: "Başarısız",
  [ORDER_STATUSES.CANCELLED]: "İptal Edildi",
  [ORDER_STATUSES.REFUNDED]: "İade Edildi",
};

export const ORDER_STATUS_BADGE_CLASSES = {
  [ORDER_STATUSES.PENDING]: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  [ORDER_STATUSES.PAID]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [ORDER_STATUSES.FAILED]: "bg-destructive/10 text-destructive",
  [ORDER_STATUSES.CANCELLED]: "bg-muted text-muted-foreground",
  [ORDER_STATUSES.REFUNDED]: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export const PAYMENT_STATUSES = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
  CANCELLED: "CANCELLED",
  REFUNDED: "REFUNDED",
};

export const PAYMENT_STATUS_LABELS = {
  [PAYMENT_STATUSES.PENDING]: "Beklemede",
  [PAYMENT_STATUSES.SUCCESS]: "Başarılı",
  [PAYMENT_STATUSES.FAILED]: "Başarısız",
  [PAYMENT_STATUSES.CANCELLED]: "İptal Edildi",
  [PAYMENT_STATUSES.REFUNDED]: "İade Edildi",
};

export const PAYMENT_STATUS_BADGE_CLASSES = {
  [PAYMENT_STATUSES.PENDING]: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  [PAYMENT_STATUSES.SUCCESS]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [PAYMENT_STATUSES.FAILED]: "bg-destructive/10 text-destructive",
  [PAYMENT_STATUSES.CANCELLED]: "bg-muted text-muted-foreground",
  [PAYMENT_STATUSES.REFUNDED]: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
};

export const ORDER_ITEM_TYPE_LABELS = {
  APPOINTMENT: "Randevu",
  SERVICE_PACKAGE: "Hizmet Paketi",
  PRODUCT: "Ürün",
  EDUCATION: "Eğitim",
};

export const PAYMENT_LOG_EVENT_LABELS = {
  TOKEN_REQUEST_SENT: "PayTR token isteği gönderildi",
  TOKEN_REQUEST_FAILED: "PayTR token isteği başarısız",
  CALLBACK_RECEIVED: "PayTR bildirimi alındı",
  CALLBACK_SUCCESS: "PayTR başarılı ödeme bildirimi",
  CALLBACK_FAILED: "PayTR başarısız ödeme bildirimi",
  CALLBACK_INVALID_HASH: "PayTR bildirimi: geçersiz imza",
  CALLBACK_DUPLICATE: "PayTR bildirimi: tekrar bildirim yok sayıldı",
  CALLBACK_PAYMENT_NOT_FOUND: "PayTR bildirimi: ödeme bulunamadı",
};

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizeOrder(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    orderNo: item.order_no ?? null,
    totalAmount: item.total_amount ?? null,
    currency: item.currency ?? "TRY",
    status: item.status ?? ORDER_STATUSES.PENDING,
    createdAt: item.created_at ?? null,
    items: (item.items ?? []).map((orderItem) => ({
      ...orderItem,
      itemType: orderItem.item_type ?? null,
      metadata: orderItem.metadata ?? null,
    })),
    payments: (item.payments ?? []).map((payment) => ({
      ...payment,
      status: payment.status ?? PAYMENT_STATUSES.PENDING,
    })),
    user: item.user ?? null,
  };
}

function normalizeOrderList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeOrder).filter(Boolean);
}

function normalizeOrderDetail(payload) {
  const item = payload?.data ?? payload;
  const normalized = normalizeOrder(item);
  if (!normalized) throw new ApiError("Beklenmeyen yanıt formatı");
  return normalized;
}

export function normalizePayment(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    merchantOid: item.merchant_oid ?? null,
    amount: item.amount ?? null,
    currency: item.currency ?? "TRY",
    provider: item.provider ?? "PAYTR",
    status: item.status ?? PAYMENT_STATUSES.PENDING,
    paymentType: item.payment_type ?? null,
    paidAt: item.paid_at ?? null,
    failedAt: item.failed_at ?? null,
    failureCode: item.failure_code ?? null,
    failureMessage: item.failure_message ?? null,
    testMode: Boolean(item.test_mode),
    createdAt: item.created_at ?? null,
  };
}

function normalizePaymentList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizePayment).filter(Boolean);
}

export function normalizePaymentDetail(payload) {
  const item = payload?.data ?? payload;
  const normalized = normalizePayment(item);
  if (!normalized) throw new ApiError("Beklenmeyen yanıt formatı");
  return normalized;
}

export function normalizePaymentLog(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    event: item.event ?? null,
    message: item.message ?? null,
    statusCode: item.status_code ?? null,
    createdAt: item.created_at ?? null,
  };
}

function normalizePaymentLogList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizePaymentLog).filter(Boolean);
}

function normalizePaginated(payload, normalizeItem) {
  const data = payload?.data;
  const meta = payload?.meta ?? null;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return {
    items: data.map(normalizeItem).filter(Boolean),
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

export function normalizePaymentInitiation(payload) {
  const payment = normalizePayment(payload?.data ?? payload);
  if (!payment) throw new ApiError("Beklenmeyen yanıt formatı");
  return {
    payment,
    paytr: {
      token: payload?.paytr?.token ?? "",
      iframeUrl: payload?.paytr?.iframe_url ?? "",
    },
  };
}

export function latestPayment(order) {
  const payments = order?.payments ?? [];
  return payments.length > 0 ? payments[payments.length - 1] : null;
}

export function useOrdersQuery(options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: ordersQueryKey,
    queryFn: async () => normalizeOrderList(await api.orders(token)),
    enabled: options.enabled !== false && Boolean(token),
    retry: false,
  });
}

export function useOrderQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...ordersQueryKey, "detail", String(id)],
    queryFn: async () => normalizeOrderDetail(await api.order(token, id)),
    enabled: options.enabled !== false && Boolean(token && id),
    refetchInterval:
      options.refetchInterval !== undefined ? options.refetchInterval : false,
    retry: false,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async (payload) =>
      normalizeOrderDetail(await api.createOrder(token, payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
    },
  });
}

export function useCreateOrderPayment() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async (orderId) =>
      normalizePaymentInitiation(await api.createOrderPayment(token, orderId)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
    },
  });
}

export function useAdminOrdersQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...adminOrdersQueryKey, params],
    queryFn: async () =>
      normalizePaginated(await api.adminOrders(token, params), normalizeOrder),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useAdminOrderQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...adminOrdersQueryKey, "detail", String(id)],
    queryFn: async () => normalizeOrderDetail(await api.adminOrder(token, id)),
    enabled: options.enabled !== false && Boolean(token && id),
    retry: false,
  });
}

export function useAdminCreateOrder() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async (payload) =>
      normalizeOrderDetail(await api.adminCreateOrder(token, payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey });
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
    },
  });
}

export function useAdminUpdateOrderStatus() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async ({ id, status }) =>
      normalizeOrderDetail(
        await api.adminUpdateOrderStatus(token, id, { status })
      ),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey });
      queryClient.invalidateQueries({ queryKey: ordersQueryKey });
      queryClient.invalidateQueries({
        queryKey: [...adminOrdersQueryKey, "detail", String(id)],
      });
    },
  });
}

/**
 * UI mirror of the backend transition map (OrderService::setStatus).
 * The backend remains the source of truth; 422 messages are surfaced as-is.
 */
export const ALLOWED_ORDER_STATUS_TRANSITIONS = {
  [ORDER_STATUSES.PENDING]: [
    ORDER_STATUSES.PAID,
    ORDER_STATUSES.FAILED,
    ORDER_STATUSES.CANCELLED,
  ],
  [ORDER_STATUSES.FAILED]: [ORDER_STATUSES.PAID, ORDER_STATUSES.CANCELLED],
  [ORDER_STATUSES.PAID]: [ORDER_STATUSES.REFUNDED],
  [ORDER_STATUSES.CANCELLED]: [],
  [ORDER_STATUSES.REFUNDED]: [],
};

export function useAdminPaymentsQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...adminPaymentsQueryKey, params],
    queryFn: async () =>
      normalizePaginated(await api.adminPayments(token, params), normalizePayment),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function useAdminPaymentQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...adminPaymentsQueryKey, "detail", String(id)],
    queryFn: async () =>
      normalizePaymentDetail(await api.adminPayment(token, id)),
    enabled: options.enabled !== false && Boolean(token && id),
    retry: false,
  });
}

export function usePaymentLogsQuery(params = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...paymentLogsQueryKey, params],
    queryFn: async () =>
      normalizePaginated(await api.paymentLogs(token, params), normalizePaymentLog),
    enabled: options.enabled !== false && Boolean(token),
    placeholderData: keepPreviousData,
    retry: false,
  });
}

export function invalidatePaymentRelatedQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: ordersQueryKey });
  queryClient.invalidateQueries({ queryKey: adminOrdersQueryKey });
  queryClient.invalidateQueries({ queryKey: adminPaymentsQueryKey });
  queryClient.invalidateQueries({ queryKey: paymentLogsQueryKey });
  queryClient.invalidateQueries({ queryKey: appointmentsQueryKey });
  queryClient.invalidateQueries({ queryKey: myServicePackagesQueryKey });
  queryClient.invalidateQueries({
    queryKey: customerServicePackagesQueryKey,
  });
}
