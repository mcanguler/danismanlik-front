import { CategoryServicesPage } from "@/components/marketing/services-page";
import {
  cleanMetaText,
  fetchPublicServiceCategories,
  findPublicItem,
} from "@/lib/marketing-seo";

const BRAND_SUFFIX = "Sümeyra Aydın Akademi & Danışmanlık";
const DEFAULT_TITLE = `1e1 Seanslar | ${BRAND_SUFFIX}`;
const DEFAULT_DESCRIPTION =
  "Birebir online danışmanlık seans kategorilerini keşfedin; size uygun kategoride hemen randevunuzu oluşturun.";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categories = await fetchPublicServiceCategories();
  const category = findPublicItem(categories, slug);

  const name = cleanMetaText(category?.name);
  return {
    title:
      cleanMetaText(category?.seo_title) ||
      (name ? `${name} | ${BRAND_SUFFIX}` : DEFAULT_TITLE),
    description:
      cleanMetaText(category?.seo_description) ||
      cleanMetaText(category?.short_description) ||
      DEFAULT_DESCRIPTION,
  };
}

export default async function ServiceCategoryPage({ params }) {
  const { slug } = await params;
  return <CategoryServicesPage slug={slug} />;
}
