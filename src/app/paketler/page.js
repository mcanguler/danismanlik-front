import { ServicePackagesPage } from "@/components/marketing/service-packages-page";
import { buildMetadata, getSeoSettings } from "@/lib/seo";

export async function generateMetadata() {
  const seo = await getSeoSettings();
  return buildMetadata({
    title: seo.packagesTitle || "Seans Paketleri",
    description:
      seo.packagesDescription ||
      "Kategori bazında listelenen avantajlı seans paketlerini keşfedin; paket içeriklerini inceleyin ve müşteri hesabınızla satın alın.",
    path: "/paketler",
  });
}

export default function PackagesPage() {
  return <ServicePackagesPage />;
}
