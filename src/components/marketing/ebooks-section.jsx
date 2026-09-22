import { ArrowRight } from "lucide-react";
import { EbookCard } from "@/components/marketing/ebook-card";
import { SectionHeading } from "@/components/marketing/section-heading";

export function EbooksSection({ ebooks }) {
  return (
    <section
      className="max-w-[1320px] mx-auto px-4 sm:px-6 py-16 w-full"
      id="e-kitaplar"
    >
      <SectionHeading
        description=""
        eyebrow=""
        title="Öne Çıkan E-Kitaplar"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {ebooks.map((ebook) => (
          <EbookCard key={ebook.title} ebook={ebook} />
        ))}
      </div>
      <div className="mt-12 text-center">
        <a
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-canvas-pure text-primary-container font-label-lg text-label-lg shadow-sm hover:shadow-md hover:bg-blush-surface transition-all"
          href="#"
        >
          <span>Tüm E-Kitapları Gör (14 Kitap)</span>
          <ArrowRight className="size-[18px]" />
        </a>
      </div>
    </section>
  );
}