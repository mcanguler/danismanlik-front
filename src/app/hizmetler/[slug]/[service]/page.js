import { ServiceDetailPage } from "@/components/marketing/service-detail-page";

export async function generateMetadata({ params }) {
  const { slug, service } = await params;
  return {
    title: `${service} | 1e1 Seanslar | Sümeyra Aydın Akademi & Danışmanlık`,
    description: "Birebir online danışmanlık seansı için hemen randevunuzu oluşturun.",
  };
}

export default async function ServiceDetailRoute({ params }) {
  const { slug, service } = await params;
  return <ServiceDetailPage categorySlug={slug} serviceSlug={service} />;
}
