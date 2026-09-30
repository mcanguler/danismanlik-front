import { cache } from "react";
import { notFound } from "next/navigation";
import { ProductStoreDetail } from "@/components/products/product-store-detail";
import {
  fetchPublicProduct,
  fetchPublicProducts,
} from "@/lib/products";
import { buildMetadata } from "@/lib/seo";

function resolveSummary(products, slug) {
  const value = String(slug ?? "").toLowerCase();
  return (
    products.find((product) => String(product.slug).toLowerCase() === value) ??
    products.find((product) => String(product.id) === value) ??
    null
  );
}

// generateMetadata ve sayfa aynı isteği paylaşır (istek başına tek fetch).
const loadProductPage = cache(async (slug) => {
  const products = await fetchPublicProducts().catch(() => []);
  const summary = resolveSummary(products, slug);
  if (summary) {
    const product = await fetchPublicProduct(summary.id).catch(() => summary);
    return { product, products };
  }
  // Listede olmayan (show_in_listing=false) ürünler sayısal adresle
  // doğrudan detay uç noktasından denenir.
  if (/^\d+$/.test(String(slug ?? ""))) {
    const product = await fetchPublicProduct(slug).catch(() => null);
    if (product) return { product, products };
  }
  return null;
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await loadProductPage(slug);
  const product = data?.product;
  if (!product) {
    return buildMetadata({ title: "Ürün Detayı", path: `/urunler/${slug}` });
  }
  return buildMetadata({
    title: product.seo_title || product.title,
    description:
      product.seo_description ||
      product.short_description ||
      product.description ||
      undefined,
    image: product.thumbnail || undefined,
    path: `/urunler/${product.slug || product.id}`,
  });
}

export default async function ProductStoreDetailRoute({ params }) {
  const { slug } = await params;
  const data = await loadProductPage(slug);
  if (!data) notFound();

  return (
    <ProductStoreDetail
      initialProduct={data.product}
      initialProducts={data.products}
      slug={slug}
    />
  );
}
