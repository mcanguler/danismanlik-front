import { useAuth } from "./auth-hooks";

export function useMyConsultant() {
  const { user } = useAuth();
  const consultantId = user?.consultant_id
    ? Number(user.consultant_id)
    : null;

  return {
    user,
    consultantId,
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
