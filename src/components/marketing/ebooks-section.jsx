import { EbookCard } from "@/components/marketing/ebook-card";
import { SectionHeading } from "@/components/marketing/section-heading";

function EbooksGridSkeleton({ count = 4 }) {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="overflow-hidden rounded-2xl border border-border-delicate bg-canvas-pure"
          key={index}
        >
          <div className="aspect-[4/5] bg-blush-surface/60" />
          <div className="flex flex-col gap-3 p-5">
            <div className="h-4 w-3/4 rounded bg-surface-container" />
            <div className="h-3 w-1/2 rounded bg-surface-container" />
            <div className="mt-2 h-9 w-full rounded-full bg-surface-container" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function EbooksSection({ ebooks, loading = false }) {
  if (loading) {
    return (
      <section
        className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6"
        id="e-kitaplar"
      >
        <SectionHeading description="" eyebrow="" title="E-Kitaplar" />
        <EbooksGridSkeleton count={4} />
      </section>
    );
  }

  if (!ebooks || ebooks.length === 0) return null;

  return (
    <section
      className="mx-auto w-full max-w-[1320px] px-4 py-16 sm:px-6"
      id="e-kitaplar"
    >
      <SectionHeading description="" eyebrow="" title="E-Kitaplar" />
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ebooks.map((ebook) => (
          <EbookCard ebook={ebook} key={ebook.id ?? ebook.title} />
        ))}
      </div>
    </section>
  );
}
