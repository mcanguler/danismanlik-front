import Image from "next/image";
import { BookOpen, Calendar, Heart, Sparkles, Star } from "lucide-react";

const PORTRAIT_URL =
  "https://lh3.googleusercontent.com/aida/AEtjO1UFAMOY_ewo7jW-WMwSPz5eZIPPOSSgCbfO14DPB9ypJ25OQo0TnmLrGZWZXMus98TnxTmg2ZlATVYRqR502IkluTHWoPN8qUqHqu-l2Tr-6fecYZHNHqTGNqJFAjXMGNxMUmklEzdxTaPsGMH1K9YyoP1MhxD6SuWxi06QQQKLhcQLV5CazuzZhFukLf1ES6TutiXerNe_Lq2i7SRPb8cNhrrncWpkTgk_6AUIALN1KvSY86kTHXJyRQ";

export function HeroSection() {
  return (
    <div className="relative w-full overflow-hidden">
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-secondary-container/20 via-blush-surface/30 to-transparent blur-3xl pointer-events-none rounded-full" />
      <section className="relative max-w-[1320px] mx-auto px-4 sm:px-6 py-12 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blush-surface text-primary-container shadow-sm">
              <Sparkles className="size-4 text-accent-gold" />
              <span className="font-label-sm text-label-sm uppercase tracking-[0.14em] font-semibold">
                DANIŞMANLIK &amp; AKADEMİ
              </span>
            </div>
            <h1 className="font-display text-display-mobile lg:text-display text-primary leading-[1.15] font-semibold tracking-tight">
              Dişil Enerjinizi Keşfedin &amp;{" "}
              <span className="italic font-normal text-burgundy-light">
                İlişkilerinizi
              </span>{" "}
              Dönüştürün.
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl leading-relaxed">
              Sevgi, güven ve özsaygı ekseninde kurulan kalıcı bağlar. Kendi
              içsel ışığınızla yeniden temas kurarken, ilişkilerinizde derin bir
              anlayış, şefkatli sınırlar ve zarafet dolu bir denge inşa edin.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <a
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-xl hover:bg-burgundy-light transition-all transform hover:-translate-y-0.5"
                href="#e-kitaplar"
              >
                <span>E-Kitapları İncele</span>
                <BookOpen className="size-[18px]" />
              </a>
              <a
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-canvas-pure text-primary-container font-label-lg text-label-lg shadow-md hover:bg-blush-surface transition-all transform hover:-translate-y-0.5"
                href="#seanslar"
              >
                <Calendar className="size-[18px] text-accent-gold" />
                <span>Seans Randevusu Al</span>
              </a>
            </div>
            <div className="pt-4 flex flex-wrap items-center gap-4 bg-canvas-pure/80 backdrop-blur-sm px-5 py-3 rounded-2xl shadow-sm">
              <div className="flex items-center text-accent-gold">
                {[0, 1, 2, 3, 4].map((index) => (
                  <Star key={index} className="size-[18px] fill-current" />
                ))}
              </div>
              <div className="h-4 w-[1px] bg-outline-variant" />
              <span className="font-label-md text-label-md text-on-surface font-medium">
                <strong className="font-semibold text-primary">15.000+</strong>{" "}
                Mutlu Danışan
              </span>
              <span className="text-outline-variant">•</span>
              <span className="font-label-md text-label-md text-on-surface font-medium">
                <strong className="font-semibold text-primary">%98</strong>{" "}
                Memnuniyet
              </span>
              <span className="text-outline-variant">•</span>
              <span className="font-label-md text-label-md text-on-surface font-medium">
                <strong className="font-semibold text-primary">8+ Yıl</strong>{" "}
                Uzmanlık
              </span>
            </div>
          </div>
          <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
            <div className="absolute -inset-4 bg-gradient-to-tr from-secondary-fixed/40 via-tertiary-fixed/30 to-blush-surface/50 rounded-[48px] blur-2xl -z-10" />
            <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-t-full rounded-b-[40px] overflow-hidden bg-canvas-pure shadow-2xl p-2.5">
              <div className="relative w-full h-full rounded-t-full rounded-b-[32px] overflow-hidden">
                <Image
                  alt="Sümeyra Aydın"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                  fill
                  sizes="(min-width: 1024px) 420px, 100vw"
                  src={PORTRAIT_URL}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-40" />
              </div>
            </div>
            <div className="absolute -top-4 -left-4 sm:left-2 bg-canvas-pure/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-blush-surface text-primary-container flex items-center justify-center">
                <Heart className="size-[18px]" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-secondary font-medium tracking-wider uppercase">
                  Uzman
                </span>
                <span className="font-label-md text-label-md font-semibold text-primary">
                  İlişki &amp; Aile Danışmanı
                </span>
              </div>
            </div>
            <div className="absolute -bottom-5 right-2 sm:-right-4 bg-canvas-pure/95 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-tertiary-fixed text-on-tertiary-fixed flex items-center justify-center">
                <BookOpen className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-accent-gold font-bold uppercase tracking-wider">
                  Çok Satan
                </span>
                <span className="font-title-md text-title-md font-headline-sm text-primary">
                  5+ E-Kitap Yazarı
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}