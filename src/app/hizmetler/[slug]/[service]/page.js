import { ServiceDetailPage } from "@/components/marketing/service-detail-page";
import {
  cleanMetaText,
  fetchPublicServiceCategories,
  fetchPublicServices,
  findPublicItem,
} from "@/lib/marketing-seo";

const BRAND_SUFFIX = "Sümeyra Aydın Akademi & Danışmanlık";
const DEFAULT_TITLE = `1e1 Seanslar | ${BRAND_SUFFIX}`;
const DEFAULT_DESCRIPTION =
  "Birebir online danışmanlık seansı için hemen randevunuzu oluşturun.";

export async function generateMetadata({ params }) {
  const { slug, service: serviceKey } = await params;
  const [categories, services] = await Promise.all([
    fetchPublicServiceCategories(),
    fetchPublicServices(),
  ]);
  const category = findPublicItem(categories, slug);
  const service = findPublicItem(services, serviceKey);

  const serviceName = cleanMetaText(service?.name);
  const categoryName = cleanMetaText(category?.name);
  return {
    title:
      cleanMetaText(service?.seo_title) ||
      (serviceName
        ? `${serviceName} | ${categoryName || "1e1 Seanslar"} | ${BRAND_SUFFIX}`
        : DEFAULT_TITLE),
    description:
      cleanMetaText(service?.seo_description) ||
      cleanMetaText(service?.short_description) ||
      cleanMetaText(service?.description) ||
      DEFAULT_DESCRIPTION,
  };
}

export default async function ServiceDetailRoute({ params }) {
  const { slug, service } = await params;
  return <ServiceDetailPage categorySlug={slug} serviceSlug={service} />;
}
