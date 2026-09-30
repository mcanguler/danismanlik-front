import { cache } from "react";
import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { ProductStorePage } from "@/components/products/product-store-page";
import {
  fetchPublicProductCategories,
  fetchPublicProducts,
} from "@/lib/products";
import { buildMetadata, getSeoSettings } from "@/lib/seo";

const loadStoreData = cache(async (category) => {
  const [products, categories, seo] = await Promise.all([
    fetchPublicProducts(category ? { category } : {}).catch(() => []),
    fetchPublicProductCategories().catch(() => []),
    getSeoSettings(),
  ]);
  return { products, categories, seo };
});

export async function generateMetadata({ searchParams }) {
  const { category } = (await searchParams) ?? {};
  const { categories, seo } = await loadStoreData(category);
  const activeCategory = category
    ? (categories.find((item) => item.slug === category) ??
      categories.find((item) => String(item.id) === String(category)) ??
      null)
    : null;

  return buildMetadata({
    title:
      activeCategory?.seo_title ||
      activeCategory?.name ||
      seo.productsTitle ||
      "Ürünler",
    description:
      activeCategory?.seo_description ||
      seo.productsDescription ||
      "Boutique ürün koleksiyonunu keşfedin; güvenli ödeme altyapısıyla sipariş verin.",
    keywords: seo.productsKeywords,
    path: category
      ? `/urunler?category=${encodeURIComponent(category)}`
      : "/urunler",
  });
}

export default async function ProductStoreRoute({ searchParams }) {
  const { category } = (await searchParams) ?? {};
  const { products, categories } = await loadStoreData(category);

  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProductStorePage
        initialCategories={categories}
        initialProducts={products}
      />
    </Suspense>
  );
}
