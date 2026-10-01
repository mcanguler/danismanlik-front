/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { LoaderCircle, Package, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { useAddToCart } from "@/components/marketing/use-add-to-cart";

function excerpt(text, maxLength = 110) {
  const value = String(text ?? "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function ProductMedia({ alt, src, className }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-surface-container-highest", className)}>
      {src && !failed ? (
        <img
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setFailed(true)}
          src={src}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-blush-surface text-primary-container">
          <Package className="size-9" />
        </div>
      )}
    </div>
  );
}

function PriceTag({ product, large = false }) {
  if (product.has_discount) {
    return (
      <div className="flex flex-col">
        <span
          className={cn(
            "font-bold text-primary",
            large ? "font-headline-md text-headline-md" : "font-title-sm text-title-sm"
          )}
        >
          {formatPrice(product.effective_price)}
        </span>
        <span className="font-body-sm text-body-sm text-outline line-through">
          {formatPrice(product.price)}
        </span>
      </div>
    );
  }
  return (
    <span
      className={cn(
        "font-bold text-primary",
        large ? "font-headline-md text-headline-md" : "font-title-sm text-title-sm"
      )}
    >
      {formatPrice(product.effective_price)}
    </span>
  );
}

export function ProductCard({ product, onAddToCart, adding = false }) {
  const { addToCart, isPending } = useAddToCart();
  const busy = adding || isPending;
  const href = `/urunler/${product.slug || product.id}`;

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product);
      return;
    }
    addToCart(
      { product_id: product.id, quantity: 1 },
      {
        title: product.title,
        snapshot: {
          unitPrice: Number(product.effective_price ?? 0),
          product: {
            id: product.id,
            title: product.title,
            slug: product.slug,
            thumbnail: product.thumbnail,
            max_purchase_quantity: product.max_purchase_quantity ?? null,
            fields: product.fields ?? [],
          },
        },
      }
    );
  };

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border-delicate bg-canvas-pure shadow-sm hover:shadow-xl transition-all duration-300">
      <Link className="relative block aspect-square" href={href}>
        <ProductMedia alt={product.title} className="h-full rounded-none" src={product.thumbnail} />
        {product.has_discount && (
          <span className="absolute left-3 top-3 rounded-full bg-accent-gold px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-primary shadow-sm">
            İndirimli
          </span>
        )}
      </Link>
      <div className="flex flex-grow flex-col gap-2 p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-1.5">
          {product.category?.name ? (
            <span className="rounded-full bg-blush-surface px-2 py-0.5 font-label-sm text-label-sm text-primary">
              {product.category.name}
            </span>
          ) : (
            <span className="rounded-full bg-muted px-2 py-0.5 font-label-sm text-label-sm text-muted-foreground">
              Kategorisiz
            </span>
          )}
        </div>
        <Link href={href}>
          <h3 className="font-title-md text-title-md font-semibold leading-snug text-primary transition-colors hover:text-burgundy-light">
            {product.title}
          </h3>
        </Link>
        {product.short_description && (
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {excerpt(product.short_description, 100)}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
          <PriceTag product={product} />
          <Button
            className="h-9 rounded-full"
            disabled={busy}
            onClick={handleAdd}
            size="sm"
            type="button"
          >
            {busy ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Store className="size-4" />
            )}
            {busy ? "Ekleniyor..." : "Sepete Ekle"}
          </Button>
        </div>
      </div>
    </div>
  );
}
