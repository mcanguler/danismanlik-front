import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, ApiError } from "./api";
import { useAuthStore } from "./auth";

export const couponsQueryKey = ["coupons"];

export const COUPON_TYPES = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
};

export const COUPON_TYPE_LABELS = {
  [COUPON_TYPES.PERCENTAGE]: "Yüzde (%)",
  [COUPON_TYPES.FIXED]: "Sabit Tutar (TL)",
};

export const COUPON_TARGET_ITEM_TYPES = {
  PRODUCT: "Ürün",
  APPOINTMENT: "Randevu",
  SERVICE_PACKAGE: "Hizmet Paketi",
  COURSE: "Eğitim",
};

export const COUPON_TARGET_ITEM_TYPE_VALUES = Object.keys(
  COUPON_TARGET_ITEM_TYPES
);

export function normalizeCoupon(item) {
  if (!item || typeof item !== "object") return null;
  return {
    ...item,
    type: item.type ?? COUPON_TYPES.PERCENTAGE,
    value: item.value ?? null,
    minimumAmount: item.minimum_amount ?? null,
    maximumDiscount: item.maximum_discount ?? null,
    usageLimit: item.usage_limit ?? null,
    usageLimitPerUser: item.usage_limit_per_user ?? null,
    startsAt: item.starts_at ?? null,
    expiresAt: item.expires_at ?? null,
    isActive: Boolean(item.is_active),
    targetItemTypes: Array.isArray(item.targeting?.item_types)
      ? item.targeting.item_types
      : [],
    usageCount: Number(item.usage_count ?? 0),
    createdAt: item.created_at ?? null,
  };
}

function normalizeCouponDetail(payload) {
  const item = payload?.data ?? payload;
  const normalized = normalizeCoupon(item);
  if (!normalized) throw new ApiError("Beklenmeyen yanıt formatı");
  return normalized;
}

function normalizeCouponList(payload) {
  const data = payload?.data ?? payload;
  if (!Array.isArray(data)) {
    throw new ApiError("Beklenmeyen yanıt formatı");
  }
  return data.map(normalizeCoupon).filter(Boolean);
}

function useToken() {
  return useAuthStore((state) => state.token);
}

export function couponDetailQueryKey(id) {
  return [...couponsQueryKey, "detail", String(id)];
}

export function useAdminCouponsQuery(filters = {}, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: [couponsQueryKey, "list", filters],
    queryFn: async () => normalizeCouponList(await api.adminCoupons(token, filters)),
    enabled: options.enabled !== false && Boolean(token),
  });
}

export function useAdminCouponQuery(id, options = {}) {
  const token = useToken();

  return useQuery({
    queryKey: couponDetailQueryKey(id),
    queryFn: async () => normalizeCouponDetail(await api.adminCoupon(token, id)),
    enabled: options.enabled !== false && Boolean(token && id),
    retry: false,
  });
}

export function useCreateCoupon() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async (payload) =>
      normalizeCouponDetail(await api.createCoupon(token, payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponsQueryKey });
    },
  });
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: async ({ id, payload }) =>
      normalizeCouponDetail(await api.updateCoupon(token, id, payload)),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: couponsQueryKey });
      queryClient.invalidateQueries({ queryKey: couponDetailQueryKey(id) });
    },
  });
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient();
  const token = useToken();

  return useMutation({
    mutationFn: (id) => api.deleteCoupon(token, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponsQueryKey });
    },
  });
}
