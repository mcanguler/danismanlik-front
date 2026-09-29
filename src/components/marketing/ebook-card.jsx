"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LoaderCircle, ShoppingBag } from "lucide-react";
import { useAddToCart } from "@/components/marketing/use-add-to-cart";

export function EbookCard({ ebook }) {
  const router = useRouter();
  const { addToCart, isPending } = useAddToCart();
  const href = `/urunler/${ebook.slug || ebook.id}`;
  const canQuickAdd = ebook.canQuickAdd !== false;

  const handleAddToCart = () => {
    if (!canQuickAdd) {
      router.push(href);
      return;
    }
    addToCart({ product_id: ebook.id, quantity: 1 }, { title: ebook.title });
  };

  return (
    <div className="group flex flex-col rounded-2xl bg-canvas-pure overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <Link
        className="relative block w-full aspect-[4/5] bg-gradient-to-tr from-blush-surface via-canvas-pure to-tertiary-fixed/20 overflow-hidden"
        href={href}
      >
        <Image
          alt={ebook.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          src={ebook.image}
        />
        <div className="relative z-10 flex justify-between items-start">
          {ebook.discount && (
            <span className="px-3 py-1 rounded-full bg-accent-gold text-primary font-label-sm text-label-sm font-bold shadow-md">
              {ebook.discount}
            </span>
          )}
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-grow justify-between">
        <Link href={href}>
          <h3 className="font-title-md text-title-md text-primary font-semibold leading-snug mb-4 transition-colors hover:text-burgundy-light">
            {ebook.title}
          </h3>
        </Link>
        <div className="pt-3 flex items-center justify-between border-t border-surface-container">
          <div className="flex flex-col">
            {ebook.oldPrice && (
              <span className="font-body-sm text-body-sm line-through text-outline">
                {ebook.oldPrice}
              </span>
            )}
            <span className="font-title-lg text-title-lg font-bold text-primary-container">
              {ebook.price}
            </span>
          </div>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md hover:bg-burgundy-light transition-colors shadow-sm disabled:opacity-60"
            disabled={isPending || ebook.outOfStock}
            type="button"
            onClick={handleAddToCart}
          >
            {isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <ShoppingBag className="size-4" />
            )}
            <span>
              {ebook.outOfStock
                ? "Stokta Yok"
                : canQuickAdd
                  ? "Sepete Ekle"
                  : "İncele"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
