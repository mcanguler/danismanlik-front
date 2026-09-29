import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { ProductStorePage } from "@/components/products/product-store-page";

export const metadata = {
  title: "Ürünler | Sümeyra Aydın Akademi & Danışmanlık",
  description:
    "Boutique ürün koleksiyonunu keşfedin; güvenli ödeme altyapısıyla sipariş verin.",
};

export default function ProductStoreRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <ProductStorePage />
    </Suspense>
  );
}
