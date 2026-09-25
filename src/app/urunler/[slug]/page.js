import { ProductStoreDetail } from "@/components/products/product-store-detail";

export const metadata = {
  title: "Ürün Detayı | Sümeyra Aydın Akademi & Danışmanlık",
};

export default async function ProductStoreDetailRoute({ params }) {
  const { slug } = await params;
  return <ProductStoreDetail slug={slug} />;
}
