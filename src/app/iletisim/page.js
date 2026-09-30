import ContactPage from "@/components/marketing/contact-page";
import { buildMetadata, getSeoSettings } from "@/lib/seo";

export async function generateMetadata() {
  const seo = await getSeoSettings();
  return buildMetadata({
    title: seo.contactTitle || "İletişim",
    description:
      seo.contactDescription ||
      "Seans paketleri, online eğitimler, kurumsal atölyeler veya randevu süreçleri hakkında soru ve danışma talepleriniz için bize ulaşın.",
    path: "/iletisim",
  });
}

export default function ContactPageRoute() {
  return <ContactPage />;
}
