"use client";

import { ProductCard } from "@/components/products/product-card";

export function EbookCard({ ebook }) {
  if (!ebook) return null;
  const product = ebook.effective_price != null
    ? ebook
    : {
        ...ebook,
        thumbnail: ebook.thumbnail ?? ebook.image,
        effective_price: ebook.effectivePrice ?? ebook.effective_price,
      };
  return <ProductCard product={product} />;
}
