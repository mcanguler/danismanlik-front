import { cache } from "react";
import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/marketing/service-detail-page";
import {
  fetchPublicServiceCategories,
} from "@/lib/service-categories";
import { fetchPublicServices } from "@/lib/services";
import { buildMetadata } from "@/lib/seo";

function findItem(items, key) {
  const value = String(key ?? "");
  return (
    items.find((item) => item.is_active && item.slug === value) ??
    items.find(
      (item) => item.is_active && String(item.id) === String(value)
    ) ??
    null
  );
}

// generateMetadata ve sayfa aynı isteği paylaşır (istek başına tek fetch).
const loadServicePage = cache(async (categorySlug, serviceSlug) => {
  const [categories, services] = await Promise.all([
    fetchPublicServiceCategories().catch(() => []),
    fetchPublicServices().catch(() => []),
  ]);
  const category = findItem(categories, categorySlug);
  const service = findItem(services, serviceSlug);
  if (!category || !service) return null;
  return { category, service, categories, services };
});

export async function generateMetadata({ params }) {
  const { slug, service: serviceKey } = await params;
  const data = await loadServicePage(slug, serviceKey);
  const service = data?.service;
  if (!service) {
    return buildMetadata({
      title: "Seans Detayı",
      path: `/hizmetler/${slug}/${serviceKey}`,
    });
  }
  return buildMetadata({
    title: service.seo_title || service.name,
    description:
      service.seo_description ||
      service.short_description ||
      service.description ||
      undefined,
    image: service.image || undefined,
    path: `/hizmetler/${data.category.slug}/${service.slug || service.id}`,
  });
}

export default async function ServiceDetailRoute({ params }) {
  const { slug, service: serviceKey } = await params;
  const data = await loadServicePage(slug, serviceKey);
  if (!data) notFound();

  return (
    <ServiceDetailPage
      categorySlug={slug}
      initialCategories={data.categories}
      initialServices={data.services}
      serviceSlug={serviceKey}
    />
  );
}
