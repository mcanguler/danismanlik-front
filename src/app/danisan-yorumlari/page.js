import TestimonialsPage from "@/components/marketing/testimonials-page";
import { buildMetadata, getSeoSettings } from "@/lib/seo";

export async function generateMetadata() {
  const seo = await getSeoSettings();
  return buildMetadata({
    title: seo.testimonialsTitle || "Danışan Yorumları",
    description:
      seo.testimonialsDescription ||
      "Danışanlarımızın bireysel seanslar, e-kitaplar ve kamplar aracılığıyla edindikleri dönüşüm deneyimleri ve içten paylaşımları.",
    path: "/danisan-yorumlari",
  });
}

export default function PublicTestimonialsPageRoute() {
  return <TestimonialsPage />;
}
