import { ConsultantsPage } from "@/components/marketing/consultants-page";
import { buildMetadata, getSeoSettings } from "@/lib/seo";

export async function generateMetadata() {
  const seo = await getSeoSettings();
  return buildMetadata({
    title: seo.consultantsTitle || "Danışman Kadromuz",
    description:
      seo.consultantsDescription ||
      "Alanında yetkin, etik değerlere bağlı ve bütüncül yaklaşıma sahip lisanslı uzman danışman kadromuzu keşfedin.",
    path: "/danismanlar",
  });
}

export default function ConsultantsListPage() {
  return <ConsultantsPage />;
}
