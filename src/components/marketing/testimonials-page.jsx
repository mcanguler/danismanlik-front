"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronDown,
  ChevronLeft,
  CircleCheck,
  Heart,
  Lock,
  LoaderCircle,
  PenLine,
  ShieldCheck,
  Star,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { cn } from "@/lib/utils";
import { marketingNavLinks } from "@/lib/marketing-nav";
import { formatDateTr } from "@/lib/format";
import {
  usePublicTestimonialsQuery,
  useSubmitTestimonial,
} from "@/lib/testimonials";

const SERVICE_OPTIONS = [
  { value: "1e1-video", label: "1e1 Görüntülü Bireysel Seans" },
  { value: "3-paket", label: "3 Seanslık Derin Dönüşüm Paketi" },
  { value: "5-mentor", label: "5 Seanslık Kapsamlı Mentorluk" },
  { value: "cift", label: "Çift & Aile Danışmanlığı Seansı" },
  { value: "kamp", label: "Dişil Zarafet & İlişki Online Kampı" },
  { value: "ekitap", label: "E-Kitap Koleksiyonu & Meditasyon Sesleri" },
  { value: "soru", label: "Sesli Soru Danışmanlığı" },
];

const STAR_LABELS = {
  5: "5.0 / 5.0 (Kusursuz)",
  4: "4.0 / 5.0 (Harika)",
  3: "3.0 / 5.0 (İyi)",
  2: "2.0 / 5.0 (Orta)",
  1: "1.0 / 5.0 (Zayıf)",
};

function TestimonialsPageShell({ children }) {
  return (
    <div className="theme-velvet bg-canvas-cream font-body-md text-on-surface">
      <SiteHeader links={marketingNavLinks("/danisan-yorumlari")} />
      <main className="w-full pt-28 bg-canvas-cream">{children}</main>
      <SiteFooter />
    </div>
  );
}

function displayFirstName(testimonial) {
  const firstName = testimonial.first_name || testimonial.name || "";
  const lastName = testimonial.last_name ?? "";
  if (!lastName) return firstName || "Danışan";
  return `${firstName} ${lastName.slice(0, 1).toUpperCase()}.`;
}

function PrivacyAvatar({ name }) {
  const initials = String(name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return (
    <div className="relative flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-blush-surface font-semibold text-primary-container font-title-md text-title-md">
      {initials || "?"}
    </div>
  );
}

function TestimonialCard({ testimonial }) {
  return (
    <article className="flex flex-col justify-between rounded-2xl bg-canvas-pure p-7 shadow-[0_12px_32px_-4px_rgba(92,29,36,0.06),0_4px_12px_-2px_rgba(197,160,89,0.08)] transition-all duration-300 hover:-translate-y-1">
      <div>
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <PrivacyAvatar name={displayFirstName(testimonial)} />
            <div>
              <h2 className="font-title-md text-title-md text-primary font-semibold">
                {displayFirstName(testimonial)}
              </h2>
              <span className="block font-body-sm text-body-sm text-secondary">
                Danışanımız
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-canvas-cream px-2.5 py-1 text-primary-container">
            <BadgeCheck className="size-4 text-accent-gold" />
            <span className="font-label-sm text-label-sm font-semibold uppercase">
              Doğrulandı
            </span>
          </div>
        </div>
        <p className="mb-6 font-body-md text-body-md italic leading-relaxed text-on-surface-variant">
          &ldquo;{testimonial.message}&rdquo;
        </p>
      </div>
      <div className="-mx-7 -mb-7 flex items-center justify-between rounded-b-2xl bg-canvas-cream/60 px-7 py-3 pt-4">
        <span className="font-label-sm text-label-sm text-secondary">
          Tarih: {formatDateTr(testimonial.created_at) ?? "—"}
        </span>
        <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-primary-container">
          <Heart className="size-3.5" />
          <span>Danışan Deneyimi</span>
        </div>
      </div>
    </article>
  );
}

function MetricCounters({ total }) {
  return (
    <div className="mx-auto grid w-full max-w-3xl grid-cols-1 gap-5 md:grid-cols-3">
      <div className="flex flex-col items-center justify-center rounded-2xl bg-canvas-pure p-6 shadow-[0_12px_32px_-4px_rgba(92,29,36,0.06),0_4px_12px_-2px_rgba(197,160,89,0.08)] transition-transform hover:-translate-y-0.5">
        <div className="mb-2 flex items-center gap-1">
          <span className="font-headline-lg text-headline-lg font-semibold tracking-tight text-primary">
            4.9
          </span>
          <span className="font-headline-sm text-headline-sm font-light text-on-surface-variant/60">
            / 5.0
          </span>
        </div>
        <div className="mb-2 flex items-center gap-1 text-accent-gold">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star className="size-4 fill-current" key={index} />
          ))}
        </div>
        <span className="font-label-md text-label-md uppercase tracking-wider text-secondary">
          Ortalama Memnuniyet Puanı
        </span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl bg-canvas-pure p-6 shadow-[0_12px_32px_-4px_rgba(92,29,36,0.06),0_4px_12px_-2px_rgba(197,160,89,0.08)] transition-transform hover:-translate-y-0.5">
        <div className="mb-2 font-headline-lg text-headline-lg font-semibold tracking-tight text-primary">
          {total > 0 ? `${total}` : "15.000+"}
        </div>
        <div className="mb-3 h-2 w-12 overflow-hidden rounded-full bg-blush-surface">
          <div className="h-full w-full bg-accent-gold" />
        </div>
        <span className="font-label-md text-label-md uppercase tracking-wider text-secondary">
          Paylaşılan Danışan Deneyimi
        </span>
      </div>
      <div className="flex flex-col items-center justify-center rounded-2xl bg-canvas-pure p-6 shadow-[0_12px_32px_-4px_rgba(92,29,36,0.06),0_4px_12px_-2px_rgba(197,160,89,0.08)] transition-transform hover:-translate-y-0.5">
        <div className="mb-2 flex items-baseline gap-1">
          <span className="font-headline-lg text-headline-lg font-semibold tracking-tight text-primary">
            %98
          </span>
          <Heart className="size-5 text-primary-container" />
        </div>
        <div className="mb-3 h-2 w-12 overflow-hidden rounded-full bg-blush-surface">
          <div className="h-full w-[98%] bg-primary-container" />
        </div>
        <span className="font-label-md text-label-md uppercase tracking-wider text-secondary">
          Tavsiye Etme Oranı
        </span>
      </div>
    </div>
  );
}

function TestimonialHero({ total }) {
  return (
    <section className="relative w-full overflow-hidden pb-16 pt-8 md:pb-24 md:pt-14">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/4 rounded-full bg-gradient-to-br from-blush-surface/70 via-secondary-container/20 to-transparent blur-3xl" />
      <div className="pointer-events-none absolute right-10 top-40 h-[320px] w-[320px] rounded-full bg-accent-gold/10 blur-2xl" />
      <div className="relative mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-blush-surface px-4 py-1.5 text-primary-container shadow-sm">
            <ChevronLeft className="size-4 text-accent-gold" />
            <span className="font-label-sm text-label-sm font-bold uppercase tracking-[0.14em] text-primary-container">
              Gerçek Dönüşüm Öyküleri &amp; İçsel Yolculuklar
            </span>
          </div>
          <h1 className="mb-6 font-headline-lg text-headline-lg font-normal tracking-tight text-primary">
            Danışanlarımızın Kaleminden{" "}
            <br className="hidden sm:inline" />
            <span className="font-headline-lg font-medium italic text-primary-container">
              Dönüşüm Deneyimleri
            </span>
          </h1>
          <p className="mb-12 max-w-2xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
            Bireysel seanslar, e-kitaplar ve kamplarımız aracılığıyla kendi
            içsel gücüyle, zarafetiyle ve ilişkileriyle yeniden bağ kuran
            danışanlarımızın içten paylaşımları.
          </p>
          <MetricCounters total={total} />
        </div>
      </div>
    </section>
  );
}

function FilterBar({ total }) {
  return (
    <section className="mb-6 w-full py-4">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-canvas-pure p-4 shadow-[0_4px_20px_rgba(92,29,36,0.04)] lg:flex-row">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary-container px-5 py-2.5 font-label-lg text-label-lg whitespace-nowrap text-on-primary shadow-sm transition-all">
              Tüm Görüşler{" "}
              <span className="ml-1 font-normal opacity-80">({total})</span>
            </span>
          </div>
          <div className="flex w-full items-center justify-end gap-3 lg:w-auto">
            <a
              className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-blush-surface px-5 py-2.5 font-label-lg text-label-lg text-primary-container shadow-sm transition-colors hover:bg-blush-hover"
              href="#yorum-yaz"
            >
              <PenLine className="size-4" />
              <span>Deneyimini Yaz</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function GridSkeleton({ count = 6 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="flex flex-col gap-4 rounded-2xl bg-canvas-pure p-7 shadow-sm animate-pulse"
          key={index}
        >
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-blush-surface/70" />
            <div className="flex flex-col gap-2">
              <div className="h-4 w-28 rounded bg-surface-container" />
              <div className="h-3 w-20 rounded bg-surface-container" />
            </div>
          </div>
          <div className="h-3 w-full rounded bg-surface-container" />
          <div className="h-3 w-5/6 rounded bg-surface-container" />
          <div className="h-3 w-2/3 rounded bg-surface-container" />
        </div>
      ))}
    </>
  );
}

function TestimonialsGrid() {
  const query = usePublicTestimonialsQuery();
  const testimonials = query.data?.items ?? [];
  const meta = query.data?.meta;

  return (
    <section className="w-full py-8">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {query.isPending && <GridSkeleton count={6} />}
          {query.isError && (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-border-delicate bg-canvas-pure px-6 py-16 text-center">
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Danışan yorumları yüklenemedi.
              </p>
              <button
                className="inline-flex items-center gap-2 rounded-full bg-primary-container px-6 py-2.5 font-label-md text-label-md text-on-primary shadow-md transition-all hover:bg-burgundy-light"
                onClick={() => query.refetch()}
                type="button"
              >
                Tekrar Dene
              </button>
            </div>
          )}
          {query.isSuccess && testimonials.length === 0 && (
            <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-border-delicate bg-canvas-pure px-6 py-16 text-center">
              <PenLine className="size-8 text-outline-variant" />
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Henüz yayınlanmış bir danışan yorumu yok.
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Siz ilk deneyimi paylaşan olun.
              </p>
            </div>
          )}
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              testimonial={testimonial}
            />
          ))}
        </div>

        {meta && meta.lastPage > 1 && (
          <div className="mt-10 flex items-center justify-center gap-3">
            <span className="rounded-full border border-border-delicate bg-canvas-pure px-4 py-2 font-label-md text-label-md text-on-surface-variant">
              Sayfa {meta.currentPage} / {meta.lastPage}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}

const INPUT_CLASS =
  "w-full rounded-xl bg-canvas-cream px-4 py-3 font-body-md text-body-md text-on-surface shadow-sm outline-none transition-colors focus:bg-blush-surface/50";

function TestimonialForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [maskLastName, setMaskLastName] = useState(true);
  const [service, setService] = useState("");
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useSubmitTestimonial();

  const handleSubmit = (event) => {
    event.preventDefault();
    setFieldErrors({});
    setError("");

    const nextErrors = {};
    if (!firstName.trim()) nextErrors.first_name = "Adınız zorunludur";
    if (!lastName.trim()) nextErrors.last_name = "Soyadınız zorunludur";
    if (!content.trim()) nextErrors.content = "Deneyiminiz zorunludur";
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const serviceLabel = SERVICE_OPTIONS.find(
      (option) => option.value === service
    )?.label;
    const suffixParts = [];
    if (serviceLabel(service)) suffixParts.push(`Katıldığı hizmet: ${serviceLabel(service)}`);
    suffixParts.push(`Puan: ${rating}/5`);
    const contentWithMeta = `${content.trim()}\n\n(${suffixParts.join(" • ")})`;

    mutation.mutate(
      {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        content: contentWithMeta,
      },
      {
        onSuccess: () => {
          setFirstName("");
          setLastName("");
          setService("");
          setRating(5);
          setContent("");
          setKvkkAccepted(false);
          setSuccess(true);
        },
        onError: (mutationError) => {
          const mapped = {};
          for (const [field, messages] of Object.entries(
            mutationError.errors ?? {}
          )) {
            mapped[field] = Array.isArray(messages) ? messages[0] : messages;
          }
          setFieldErrors(mapped);
          if (
            !mutationError.errors ||
            Object.keys(mutationError.errors).length === 0
          ) {
            setError(mutationError.message ?? "Yorum gönderilemedi");
          }
        },
      }
    );
  };

  return (
    <section className="w-full scroll-mt-28 py-16" id="yorum-yaz">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-canvas-pure shadow-[0_20px_50px_-10px_rgba(92,29,36,0.08),0_4px_20px_-2px_rgba(197,160,89,0.1)]">
          <div className="h-2 w-full bg-gradient-to-r from-accent-gold via-primary-container to-burgundy-light" />
          <div className="p-8 sm:p-12 lg:p-16">
            <div className="mx-auto max-w-3xl">
              <div className="mb-10 text-center">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blush-surface px-3.5 py-1 text-primary-container">
                  <ChevronLeft className="size-4 text-accent-gold" />
                  <span className="font-label-sm text-label-sm font-bold uppercase tracking-wider">
                    Dönüşüm Çemberine Katılın
                  </span>
                </div>
                <h2 className="mb-3 font-headline-md text-headline-md font-medium tracking-tight text-primary">
                  Kendi Dönüşüm Hikayenizi Paylaşın
                </h2>
                <p className="mx-auto max-w-xl font-body-md text-body-md leading-relaxed text-on-surface-variant">
                  Sümeyra Aydın ile çıktığınız bu yolculukta edindiğiniz
                  farkındalıkları paylaşarak diğer kadınlara ilham olun.
                  Görüşünüz moderatör onayından sonra yayınlanır.
                </p>
              </div>
              <form className="flex flex-col gap-6" noValidate onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-lg text-label-lg font-semibold text-primary" htmlFor="testimonial_first_name">
                      Adınız <span className="text-burgundy-light">*</span>
                    </label>
                    <input
                      className={INPUT_CLASS}
                      id="testimonial_first_name"
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="Örn: Elif"
                      type="text"
                      value={firstName}
                    />
                    {fieldErrors.first_name && (
                      <p className="text-xs text-error">{fieldErrors.first_name}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-lg text-label-lg font-semibold text-primary" htmlFor="testimonial_last_name">
                      Soyadınız <span className="text-burgundy-light">*</span>
                    </label>
                    <input
                      className={INPUT_CLASS}
                      id="testimonial_last_name"
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Örn: Kaya"
                      type="text"
                      value={lastName}
                    />
                    {fieldErrors.last_name && (
                      <p className="text-xs text-error">{fieldErrors.last_name}</p>
                    )}
                  </div>
                </div>
                <label className="flex cursor-pointer select-none items-center gap-3">
                  <input
                    checked={maskLastName}
                    className="w-4 h-4 cursor-pointer rounded text-primary-container accent-primary-container"
                    onChange={(event) => setMaskLastName(event.target.checked)}
                    type="checkbox"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Soyadımı sadece baş harf olarak göster (Örn: Elif K. -
                    Mahremiyetinizi önemsiyoruz)
                  </span>
                </label>
                <div className="flex flex-col gap-2">
                  <label className="font-label-lg text-label-lg font-semibold text-primary" htmlFor="testimonial_service">
                    Katıldığınız Hizmet / Seans Seçimi
                  </label>
                  <div className="relative">
                    <select
                      className="w-full cursor-pointer appearance-none rounded-xl bg-canvas-cream px-4 py-3 pr-10 font-body-md text-body-md text-on-surface shadow-sm outline-none transition-colors focus:bg-blush-surface/50"
                      id="testimonial_service"
                      onChange={(event) => setService(event.target.value)}
                      value={service}
                    >
                      <option value="">Lütfen deneyimlediğiniz hizmeti seçiniz</option>
                      {SERVICE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-5 -translate-y-1/2 text-secondary" />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <span className="font-label-lg text-label-lg font-semibold text-primary">
                    Puanlama Seçimi
                  </span>
                  <div className="flex w-fit items-center gap-2 rounded-xl bg-canvas-cream p-3">
                    <div className="flex items-center gap-1 text-accent-gold">
                      {Array.from({ length: 5 }).map((_, index) => (
                        <button
                          aria-label={`${index + 1} Yıldız`}
                          className={cn(
                            "transition-transform hover:scale-110",
                            index + 1 <= rating ? "opacity-100" : "opacity-30"
                          )}
                          key={index}
                          onClick={() => setRating(index + 1)}
                          type="button"
                        >
                          <Star
                            className={cn(
                              "size-6",
                              index + 1 <= rating && "fill-current"
                            )}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="ml-2 font-label-md text-label-md font-bold text-primary">
                      {STAR_LABELS[rating]}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="font-label-lg text-label-lg font-semibold text-primary" htmlFor="testimonial_content">
                    Deneyiminiz / Değerlendirmeniz <span className="text-burgundy-light">*</span>
                  </label>
                  <textarea
                    className="w-full resize-none rounded-xl bg-canvas-cream px-4 py-3 font-body-md text-body-md text-on-surface shadow-sm outline-none transition-colors focus:bg-blush-surface/50"
                    id="testimonial_content"
                    onChange={(event) => setContent(event.target.value)}
                    placeholder="Bu yolculuk hayatınızda, duygularınızda ve ilişkilerinizde neleri dönüştürdü? Düşüncelerinizi samimiyetle paylaşın..."
                    rows={4}
                    value={content}
                  />
                  {fieldErrors.content && (
                    <p className="text-xs text-error">{fieldErrors.content}</p>
                  )}
                </div>
                <label className="flex cursor-pointer select-none items-start gap-3">
                  <input
                    checked={kvkkAccepted}
                    className="mt-0.5 h-4 w-4 cursor-pointer rounded text-primary-container accent-primary-container"
                    onChange={(event) => setKvkkAccepted(event.target.checked)}
                    type="checkbox"
                  />
                  <span className="font-body-sm text-body-sm leading-tight text-on-surface-variant">
                    <Link
                      className="font-medium text-primary underline hover:text-burgundy-light"
                      href="/kvkk-aydinlatma-metni"
                    >
                      KVKK Aydınlatma Metni
                    </Link>{" "}
                    ve Gizlilik Sözleşmesi uyarınca, paylaştığım deneyim ve
                    rumuzun sitede yayımlanmasına izin veriyorum.
                  </span>
                </label>
                {fieldErrors.kvkk && (
                  <p className="text-xs text-error">{fieldErrors.kvkk}</p>
                )}
                {error && <p className="text-sm text-error">{error}</p>}
                {success && (
                  <div className="flex items-center gap-3 rounded-xl bg-blush-surface p-4 text-primary-container">
                    <CircleCheck className="size-5 text-accent-gold" />
                    <span className="font-body-md text-body-md font-medium">
                      Değerli geri bildiriminiz için teşekkürler! Görüşünüz
                      onaylandıktan sonra bu alanda yerini alacaktır.
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-center justify-between gap-4 pt-4 sm:flex-row">
                  <div className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
                    <ShieldCheck className="size-4" />
                    <span>Deneyiminiz 24 saat içinde incelenip onaylanır.</span>
                  </div>
                  <button
                    className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-primary-container px-8 py-3.5 font-label-lg text-label-lg text-on-primary shadow-[0_8px_20px_-4px_rgba(92,29,36,0.35)] transition-all hover:bg-burgundy-light disabled:opacity-60 sm:w-auto"
                    disabled={mutation.isPending}
                    type="submit"
                  >
                    {mutation.isPending && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}
                    <span>
                      {mutation.isPending
                        ? "Gönderiliyor..."
                        : "Görüşümü ve Deneyimimi Gönder"}
                    </span>
                    <ArrowRight className="size-4 text-accent-gold" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function EthicsSection() {
  return (
    <section className="w-full pb-16">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-8 rounded-2xl bg-canvas-pure p-8 shadow-[0_4px_24px_rgba(92,29,36,0.03)] sm:p-10 lg:flex-row">
          <div className="flex max-w-2xl items-start gap-4">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-blush-surface text-primary-container">
              <Lock className="size-6" />
            </div>
            <div>
              <h3 className="mb-2 font-title-lg text-title-lg font-semibold text-primary">
                Danışan Mahremiyeti &amp; Etik İlkeler Taahhüdü
              </h3>
              <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
                Sümeyra Aydın Akademi bünyesinde gerçekleştirilen tüm bireysel
                ve çift seansları uluslararası mesleki etik ve gizlilik
                standartlarına (TPD &amp; ICF) tam uyumludur. Paylaşılan
                yorumlar, danışanların açık yazılı rızası ve gizlilik
                tercihleri (rumuz veya baş harf) doğrultusunda şeffaflıkla
                sunulmaktadır.
              </p>
            </div>
          </div>
          <div className="flex flex-shrink-0 flex-wrap items-center justify-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2 rounded-xl bg-canvas-cream px-4 py-2 text-secondary">
              <BadgeCheck className="size-5 text-accent-gold" />
              <span className="font-label-md text-label-md font-semibold">
                100% Doğrulanmış Yorumlar
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-canvas-cream px-4 py-2 text-secondary">
              <ShieldCheck className="size-5 text-accent-gold" />
              <span className="font-label-md text-label-md font-semibold">
                Tam Mahremiyet Koruması
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function TestimonialsPage() {
  const query = usePublicTestimonialsQuery();
  const total = query.data?.meta?.total ?? query.data?.items.length ?? 0;

  return (
    <TestimonialsPageShell>
      <TestimonialHero total={total} />
      <FilterBar total={total} />
      <TestimonialsGrid />
      <TestimonialForm />
      <EthicsSection />
    </TestimonialsPageShell>
  );
}
