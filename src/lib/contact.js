import { useMutation } from "@tanstack/react-query";
import { api } from "./api";

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

export function useSubmitContactMessage() {
  return useMutation({
    mutationFn: (payload) => api.submitContactMessage(payload),
  });
}
