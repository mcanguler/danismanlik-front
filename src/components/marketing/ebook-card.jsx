import Image from "next/image";
import { ShoppingBag } from "lucide-react";

export function EbookCard({ ebook }) {
  return (
    <div className="group flex flex-col rounded-2xl bg-canvas-pure overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative w-full aspect-[4/5] bg-gradient-to-tr from-blush-surface via-canvas-pure to-tertiary-fixed/20 overflow-hidden">
        <Image
          alt={ebook.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          src={ebook.image}
        />
        <div className="relative z-10 flex justify-between items-start">
          <span className="px-3 py-1 rounded-full bg-accent-gold text-primary font-label-sm text-label-sm font-bold shadow-md">
            {ebook.discount}
          </span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-grow justify-between">
        <h3 className="font-title-md text-title-md text-primary font-semibold leading-snug mb-4">
          {ebook.title}
        </h3>
        <div className="pt-3 flex items-center justify-between border-t border-surface-container">
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm line-through text-outline">
              {ebook.oldPrice}
            </span>
            <span className="font-title-lg text-title-lg font-bold text-primary-container">
              {ebook.price}
            </span>
          </div>
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md hover:bg-burgundy-light transition-colors shadow-sm"
            type="button"
          >
            <ShoppingBag className="size-4" />
            <span>Sepete Ekle</span>
          </button>
        </div>
      </div>
    </div>
  );
}