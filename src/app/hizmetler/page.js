import { cache } from "react";
import { ServiceCategoriesPage } from "@/components/marketing/services-page";
import { fetchPublicServiceCategories } from "@/lib/service-categories";
import { buildMetadata, getSeoSettings } from "@/lib/seo";

const loadCatalogData = cache(async () => {
  const [categories, seo] = await Promise.all([
    fetchPublicServiceCategories().catch(() => []),
    getSeoSettings(),
  ]);
  return { categories, seo };
});

export async function generateMetadata() {
  const { seo } = await loadCatalogData();
  return buildMetadata({
    title: seo.servicesTitle || "1e1 Seanslar",
    description:
      seo.servicesDescription ||
      "Birebir online danışmanlık seans kategorilerini keşfedin; size uygun kategoride hemen randevunuzu oluşturun.",
    path: "/hizmetler",
  });
}

export default async function ServicesCatalogRoute() {
  const { categories } = await loadCatalogData();
  return <ServiceCategoriesPage initialCategories={categories} />;
}
