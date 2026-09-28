import { useQuery } from "@tanstack/react-query";
import { api } from "./api";
import { normalizeConsultant, consultantsQueryKey } from "./consultants";
import { useAuth } from "./auth-hooks";
import { useAuthStore } from "./auth";

function useConsultantsListForSelf() {
  const token = useAuthStore((state) => state.token);
  const { user } = useAuth();

  return useQuery({
    queryKey: [...consultantsQueryKey, "self"],
    queryFn: async () => {
      const payload = await api.consultants(token, {});
      const data = payload?.data ?? payload;
      if (!Array.isArray(data)) return [];
      return data.map(normalizeConsultant).filter(Boolean);
    },
    enabled: user?.role === "CONSULTANT" && Boolean(user?.consultant_id),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMyConsultant() {
  const { user } = useAuth();
  const consultantId = user?.consultant_id
    ? Number(user.consultant_id)
    : null;

  const consultantsQuery = useConsultantsListForSelf();

  const ownConsultant =
    (consultantsQuery.data ?? []).find(
      (item) => String(item.id) === String(consultantId)
    ) ?? null;
  const consultantSlug = ownConsultant?.slug
    ? String(ownConsultant.slug)
    : null;

  return {
    user,
    consultantId,
    consultantSlug,
    hasConsultant: Boolean(consultantId),
  };
}

export function isOwnRecord(item, consultantId) {
  if (!item || !consultantId) return false;
  return String(item.consultant_id) === String(consultantId);
}

export function scopeToOwn(items, consultantId) {
  if (!consultantId) return [];
  return items.filter((item) => isOwnRecord(item, consultantId));
}
