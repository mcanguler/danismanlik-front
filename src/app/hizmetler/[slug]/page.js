import { cache } from "react";
import { notFound } from "next/navigation";
import { CategoryServicesPage } from "@/components/marketing/services-page";
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
const loadCategoryPage = cache(async (slug) => {
  const [categories, services] = await Promise.all([
    fetchPublicServiceCategories().catch(() => []),
    fetchPublicServices().catch(() => []),
  ]);
  const category = findItem(categories, slug);
  if (!category) return null;
  return { category, categories, services };
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await loadCategoryPage(slug);
  const category = data?.category;
  if (!category) {
    return buildMetadata({ title: "1e1 Seanslar", path: `/hizmetler/${slug}` });
  }
  return buildMetadata({
    title: category.seo_title || category.name,
    description:
      category.seo_description ||
      category.short_description ||
      undefined,
    image: category.image || undefined,
    path: `/hizmetler/${category.slug || category.id}`,
  });
}

export default async function ServiceCategoryPage({ params }) {
  const { slug } = await params;
  const data = await loadCategoryPage(slug);
  if (!data) notFound();

  return (
    <CategoryServicesPage
      initialCategories={data.categories}
      initialServices={data.services}
      slug={slug}
    />
  );
}
