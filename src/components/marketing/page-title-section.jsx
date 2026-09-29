/**
 * Standart sayfa başlığı: h2, ortalanmış; headerdan pt-16 (64px),
 * content'e pb-16 (64px) uzaklık. Tüm public sayfalar bu bileşeni kullanır.
 */
export function PageTitleSection({ title, description, className = "" }) {
  return (
    <section className={`w-full pt-16 pb-16 ${className}`.trim()}>
      <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
            {title}
          </h2>
          {description ? (
            <p className="mt-4 font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
