import { useMutation } from "@tanstack/react-query";
import { api } from "./api";
import { useSettingsQuery } from "./settings";

export const CONTACT_PAGE_PATH = "/iletisim";

export const CONTACT_SUBJECT_OPTIONS = [
  { value: "1e1", label: "1e1 Bireysel Danışmanlık Seansı" },
  { value: "cift", label: "Çift & İlişki Danışmanlığı" },
  { value: "egitim", label: "Online Eğitimler & Gelişim Kampları" },
  { value: "ekitap", label: "E-Kitap Satın Alma & Erişim Desteği" },
  { value: "kurumsal", label: "Kurumsal Konuşma & Atölye Talebi" },
  { value: "diger", label: "Diğer Sorularım Var" },
];

export const CONTACT_PREFERENCE_LABELS = {
  whatsapp: "WhatsApp",
  phone: "Telefon Araması",
  email: "E-Posta",
};

const DEFAULT_CONTACT = {
  phone: "+90 506 115 10 10",
  email: "iletisim@sumeyraaydin.com",
  workingHours: "09:30 - 18:30",
};

export function whatsappUrlFromPhone(phone) {
  const digits = String(phone ?? "").replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

/**
 * İletişim bilgileri ayarlardaki `contact.*` key'lerinden okunur;
 * key yoksa mevcut varsayılan değerlere düşer.
 */
export function useContactInfo() {
  const settingsQuery = useSettingsQuery();
  const settings = settingsQuery.data ?? {};

  const phone = settings["contact.phone"] || DEFAULT_CONTACT.phone;
  const instagramUrl = settings["contact.instagram_url"] || "";
  const instagramUsername = settings["contact.instagram_username"] || "";

  return {
    phone,
    whatsappUrl: whatsappUrlFromPhone(phone),
    email: settings["contact.email"] || DEFAULT_CONTACT.email,
    workingHours:
      settings["contact.working_hours"] || DEFAULT_CONTACT.workingHours,
    instagramUrl,
    instagramUsername,
    instagramHref:
      instagramUrl ||
      (instagramUsername
        ? `https://instagram.com/${instagramUsername}`
        : ""),
  };
}

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: (payload) => api.submitContactMessage(payload),
  });
}
