import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const customersQueryKey = ["customers"];

export const ADDRESS_TYPES = {
  SHIPPING: "SHIPPING",
  BILLING: "BILLING",
  BOTH: "BOTH",
};

export const ADDRESS_TYPE_LABELS = {
  [ADDRESS_TYPES.SHIPPING]: "Teslimat",
  [ADDRESS_TYPES.BILLING]: "Fatura",
  [ADDRESS_TYPES.BOTH]: "Teslimat + Fatura",
};

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizeCustomer(item) {
  const name = customerName(item);
  const addresses = Array.isArray(item.addresses) ? item.addresses : [];
  return {
    ...item,
    name,
    phone: item.user?.phone ?? item.phone ?? "",
    email: item.user?.email ?? item.email ?? "",
    addresses,
    addressesCount: addresses.length || item.addresses_count || 0,
  };
}

function customerName(item) {
  if (item.user?.name) return item.user.name;
  const fullName = [item.user?.first_name, item.user?.last_name]
    .filter(Boolean)
    .join(" ");
  return fullName || item.name || `Müşteri #${item.id}`;
}

export function normalizeList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeCustomer);
}

export function useCustomersQuery(filters = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...customersQueryKey, filters],
    queryFn: async () => normalizeList(await api.customers(token, filters)),
    enabled: options.enabled !== false && Boolean(token),
  });
}

export const customerDetailQueryKey = (id) => [
  ...customersQueryKey,
  "detail",
  String(id),
];

export function normalizeCustomerDetail(payload) {
  const data = payload?.data ?? payload ?? {};
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  const profile = normalizeCustomer({
    ...data,
    addresses: Array.isArray(data.addresses) ? data.addresses : [],
  });
  return {
    ...data,
    profile,
    name: profile.name,
    phone: profile.phone,
    email: profile.email,
    addresses: profile.addresses,
    stats:
      data.stats && typeof data.stats === "object"
        ? {
            appointments: Number(data.stats.appointments ?? 0),
            orders: Number(data.stats.orders ?? 0),
            payments: Number(data.stats.payments ?? 0),
            service_packages: Number(data.stats.service_packages ?? 0),
          }
        : null,
    appointments: Array.isArray(data.appointments) ? data.appointments : [],
    orders: Array.isArray(data.orders) ? data.orders : [],
    payments: Array.isArray(data.payments) ? data.payments : [],
    service_packages: Array.isArray(data.service_packages)
      ? data.service_packages
      : [],
    courses: Array.isArray(data.courses) ? data.courses : [],
  };
}

export function useCustomerDetailQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: customerDetailQueryKey(id),
    queryFn: async () =>
      normalizeCustomerDetail(await api.customerDetail(token, id)),
    enabled: options.enabled !== false && Boolean(token && id),
    retry: false,
  });
}

export function useCustomerQuery(id) {  const token = useToken();

  return useQuery({
    queryKey: [...customersQueryKey, id],
    queryFn: async () => {
      const payload = await api.customer(token, id);
      return normalizeCustomer(payload?.data ?? payload);
    },
    enabled: Boolean(token && id),
  });
}

export function useCreateCustomer() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createCustomer(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryKey });
    },
  });
}

export function useUpdateCustomer() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateCustomer(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryKey });
    },
  });
}

export function useDeleteCustomer() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteCustomer(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customersQueryKey });
    },
  });
}