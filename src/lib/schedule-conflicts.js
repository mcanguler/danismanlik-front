import { toast } from "@/components/ui/toast";
import { formatDateTimeTr } from "./format";

/**
 * Çalışma saati/mola/kapalı zaman uçlarının yanıtındaki üst seviye
 * `conflicts` dizisini döner.
 */
export function scheduleConflictsFrom(response) {
  const conflicts = response?.conflicts;
  return Array.isArray(conflicts) ? conflicts.filter(Boolean) : [];
}

/** Çakışan randevuları Türkçe tek bir mesaja dönüştürür. */
export function scheduleConflictMessage(conflicts) {
  const parts = conflicts
    .map((conflict) => {
      const when =
        conflict?.start_at != null ? formatDateTimeTr(conflict.start_at) : "";
      const who = conflict?.customer_name ? conflict.customer_name : "";
      return [when, who].filter(Boolean).join(" - ");
    })
    .filter(Boolean);

  if (parts.length === 0) return "";
  return `Bu değişiklik şu randevularla çakışıyor: ${parts.join(", ")}`;
}

/**
 * Çakışma varsa tek bir toast ile uyarır (tek yer, tekrarlamadan).
 * @returns {boolean} uyarı gösterildi mi
 */
export function notifyScheduleConflicts(response) {
  const conflicts = scheduleConflictsFrom(response);
  if (conflicts.length === 0) return false;

  const description = scheduleConflictMessage(conflicts);
  if (!description) return false;

  toast.add({
    title: "Randevu çakışması",
    description,
    type: "warning",
  });
  return true;
}
