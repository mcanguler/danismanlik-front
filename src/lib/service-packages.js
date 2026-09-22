import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const servicePackagesQueryKey = ["service-packages"];
export const servicePackageCategoriesQueryKey = ["service-package-categories"];
export const myServicePackagesQueryKey = ["my-service-packages"];
export const customerServicePackagesQueryKey = ["customer-service-packages"];

export const PURCHASE_STATUSES = {
  ACTIVE: "ACTIVE",
  EXPIRED: "EXPIRED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

export const PURCHASE_STATUS_LABELS = {
  [PURCHASE_STATUSES.ACTIVE]: "Aktif",
  [PURCHASE_STATUSES.EXPIRED]: "Süresi Doldu",
  [PURCHASE_STATUSES.COMPLETED]: "Tamamlandı",
  [PURCHASE_STATUSES.CANCELLED]: "İptal Edildi",
};

export const PURCHASE_STATUS_BADGE_CLASSES = {
  [PURCHASE_STATUSES.ACTIVE]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [PURCHASE_STATUSES.EXPIRED]: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  [PURCHASE_STATUSES.COMPLETED]: "bg-muted text-muted-foreground",
  [PURCHASE_STATUSES.CANCELLED]: "bg-destructive/10 text-destructive",
};

export const USAGE_STATUSES = {
  USED: "USED",
  REVERSED: "REVERSED",
};

export const USAGE_STATUS_LABELS = {
  [USAGE_STATUSES.USED]: "Kullanıldı",
  [USAGE_STATUSES.REVERSED]: "İade edildi",
};

export const USAGE_STATUS_BADGE_CLASSES = {
  [USAGE_STATUSES.USED]: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  [USAGE_STATUSES.REVERSED]: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

function useToken() {
  return useAuthStore((state) => state.token);
}

export function normalizeServicePackage(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    description: item.description ?? "",
    image: item.image ?? "",
    seo_title: item.seo_title ?? "",
    seo_description: item.seo_description ?? "",
    price: item.price ?? null,
    is_active: Boolean(item.is_active),
    sort_order: item.sort_order ?? 0,
    category: item.category ?? null,
    services: (item.services ?? []).map((service) => ({
      ...service,
      quantity: service.quantity ?? null,
    })),
  };
}

function normalizePackageList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeServicePackage).filter(Boolean);
}

function normalizePackageDetail(payload) {
  const item = payload?.data ?? payload;
  const normalized = normalizeServicePackage(item);
  if (!normalized) throw new ApiError("Beklenmeyen yanıt formatı");
  return normalized;
}

export function normalizePurchase(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    price: item.price ?? null,
    purchasedAt: item.purchased_at ?? null,
    expiresAt: item.expires_at ?? null,
    status: item.status ?? PURCHASE_STATUSES.ACTIVE,
    customer: item.customer ?? null,
    package: item.package ?? null,
    totalQuantity: item.total_quantity ?? 0,
    usedQuantity: item.used_quantity ?? 0,
    remainingQuantity: item.remaining_quantity ?? 0,
    items: (item.items ?? []).map((entry) => ({
      ...entry,
      quantity: entry.quantity ?? 0,
      used_quantity: entry.used_quantity ?? 0,
      remaining_quantity: entry.remaining_quantity ?? 0,
      service: entry.service ?? null,
    })),
    usages: (item.usages ?? []).map((usage) => ({
      ...usage,
      quantity: usage.quantity ?? 1,
      status: usage.status ?? USAGE_STATUSES.USED,
      usedAt: usage.used_at ?? null,
    })),
  };
}

function normalizePurchaseList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizePurchase).filter(Boolean);
}

function normalizePurchaseDetail(payload) {
  const item = payload?.data ?? payload;
  const normalized = normalizePurchase(item);
  if (!normalized) throw new ApiError("Beklenmeyen yanıt formatı");
  return normalized;
}

export function normalizeServicePackageCategory(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    description: item.description ?? "",
    image: item.image ?? "",
    is_active: Boolean(item.is_active),
    sort_order: item.sort_order ?? 0,
  };
}

function normalizeCategoryList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeServicePackageCategory).filter(Boolean);
}

export function packageTotalQuantity(servicePackage) {
  const services = servicePackage?.services ?? [];
  return services.reduce((sum, service) => sum + (service.quantity ?? 1), 0);
}

export function packageIsUsable(purchase) {
  if (!purchase || purchase.status !== PURCHASE_STATUSES.ACTIVE) return false;
  if (!purchase.expiresAt) return true;
  return new Date(purchase.expiresAt).getTime() > Date.now();
}

export function findUsablePackageForService(purchases, serviceId) {
  return (purchases ?? []).find(
    (purchase) =>
      packageIsUsable(purchase) &&
      (purchase.items ?? []).some(
        (item) =>
          String(item.service_id) === String(serviceId) &&
          item.remaining_quantity > 0
      )
  );
}

export function remainingQuantityForService(purchase, serviceId) {
  const item = (purchase?.items ?? []).find(
    (entry) => String(entry.service_id) === String(serviceId)
  );
  return item ? item.remaining_quantity : 0;
}

export function usePublicServicePackagesQuery(filters = {}, options = {}) {
  return useQuery({
    queryKey: [...servicePackagesQueryKey, "public", filters],
    queryFn: async () =>
      normalizePackageList(await api.publicServicePackages(filters)),
    enabled: options.enabled !== false,
  });
}

export function usePublicServicePackageQuery(slug, options = {}) {
  return useQuery({
    queryKey: [...servicePackagesQueryKey, "public", "detail", String(slug)],
    queryFn: async () =>
      normalizePackageDetail(await api.publicServicePackage(slug)),
    enabled: options.enabled !== false && Boolean(slug),
    retry: false,
  });
}

export function useServicePackagesQuery(filters = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...servicePackagesQueryKey, filters],
    queryFn: async () =>
      normalizePackageList(await api.servicePackages(token, filters)),
    enabled: options.enabled !== false && Boolean(token),
    retry: false,
  });
}

export function useCreateServicePackage() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createServicePackage(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicePackagesQueryKey });
    },
  });
}

export function useUpdateServicePackage() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) => api.updateServicePackage(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicePackagesQueryKey });
    },
  });
}

export function useDeleteServicePackage() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteServicePackage(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicePackagesQueryKey });
    },
  });
}

export function useServicePackageCategoriesQuery(options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: servicePackageCategoriesQueryKey,
    queryFn: async () =>
      normalizeCategoryList(await api.servicePackageCategories(token)),
    enabled: options.enabled !== false && Boolean(token),
    retry: false,
  });
}

export function useCreateServicePackageCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (payload) => api.createServicePackageCategory(token, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicePackageCategoriesQueryKey });
    },
  });
}

export function useUpdateServicePackageCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: ({ id, payload }) =>
      api.updateServicePackageCategory(token, id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicePackageCategoriesQueryKey });
    },
  });
}

export function useDeleteServicePackageCategory() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteServicePackageCategory(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: servicePackageCategoriesQueryKey });
    },
  });
}

export function useCustomerServicePackagesQuery(options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: customerServicePackagesQueryKey,
    queryFn: async () =>
      normalizePurchaseList(await api.customerServicePackages(token)),
    enabled: options.enabled !== false && Boolean(token),
    retry: false,
  });
}

export function useMyServicePackagesQuery(options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: myServicePackagesQueryKey,
    queryFn: async () => normalizePurchaseList(await api.myServicePackages(token)),
    enabled: options.enabled !== false && Boolean(token),
    staleTime: 30 * 1000,
    retry: false,
  });
}

export function useMyServicePackageQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [...myServicePackagesQueryKey, "detail", String(id)],
    queryFn: async () =>
      normalizePurchaseDetail(await api.myServicePackage(token, id)),
    enabled: options.enabled !== false && Boolean(token && id),
    retry: false,
  });
}
