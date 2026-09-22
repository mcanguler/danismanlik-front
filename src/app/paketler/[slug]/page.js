import { ServicePackageDetailPage } from "@/components/marketing/service-packages-page";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `Seans Paketi | Sümeyra Aydın Akademi & Danışmanlık`,
    description: `${slug} paketinin içeriği, fiyatı ve satın alma seçenekleri.`,
  };
}

export default async function PackageDetailPage({ params }) {
  const { slug } = await params;
  return <ServicePackageDetailPage slug={slug} />;
}
