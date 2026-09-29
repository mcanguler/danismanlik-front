/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  ChevronRight,
  ClipboardList,
  Lock,
  MessageCircle,
  Phone,
  Scale,
  Search,
  Sparkles,
  ZoomIn,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { marketingNavLinks } from "@/lib/marketing-nav";
import {
  usePublicConsultantQuery,
  usePublicConsultantsQuery,
} from "@/lib/consultants";
import { useContactInfo } from "@/lib/contact";

// Sadeleştirme: WhatsApp hattı artık contact.phone ayarından geliyor
// const WHATSAPP_URL =
//   "https://wa.me/905061151010?text=Merhaba,%20dan%C4%B1%C5%9Fman%20se%C3%A7imi%20hakk%C4%B1nda%20bilgi%20ve%20destek%20almak%20istiyorum.";

const HERO_DESCRIPTION =
  "Alanında yetkin, etik değerlere bağlı ve bütüncül yaklaşıma sahip lisanslı uzmanlarımızla içsel dönüşüm yolculuğunuzda yanınızdayız.";

function excerpt(text, maxLength = 150) {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function ConsultantsPageShell({ children }) {
  return (
    <div className="theme-velvet bg-canvas-cream font-body-md text-on-surface">
      <SiteHeader links={marketingNavLinks("/danismanlar")} />
      <main className="w-full pt-28 bg-canvas-cream">{children}</main>
      <SiteFooter />
    </div>
  );
}

function MetricRibbon() {
  const metrics = [
    { value: "12+", label: "Alanında Uzman" },
    { value: "4.800+", label: "Tamamlanan Seans" },
    { value: "%98.4", label: "Danışan Memnuniyeti" },
    { value: "100%", label: "Etik Mahremiyet" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full pt-4">
      {metrics.map((metric) => (
        <div
          className="flex flex-col items-center p-4 rounded-xl bg-canvas-pure shadow-sm"
          key={metric.label}
        >
          <span className="font-headline-sm text-headline-sm text-primary font-semibold">
            {metric.value}
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">
            {metric.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function ConsultantCard({ consultant }) {
  return (
    <div className="group flex flex-col bg-canvas-pure rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative w-full aspect-square overflow-hidden bg-blush-surface">
        {consultant.profile_image ? (
          <img
            alt={consultant.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            src={consultant.profile_image}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-headline-lg text-headline-lg text-primary-container/40">
              {consultant.name?.slice(0, 1) ?? "?"}
            </span>
          </div>
        )}
        {/*<div className="absolute top-3.5 left-3.5 flex flex-col gap-1.5 items-start">*/}
        {/*  <span className="px-3 py-1 rounded-full bg-primary-container text-on-primary font-label-sm text-label-sm tracking-wider uppercase shadow-md flex items-center gap-1">*/}
        {/*    <BadgeCheck className="size-3.5 text-accent-gold" />*/}
        {/*    <span>Uzman Kadro</span>*/}
        {/*  </span>*/}
        {/*</div>*/}
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-primary/30 to-transparent" />
      </div>
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <Link
              className="hover:underline"
              href={`/danismanlar/${consultant.slug}`}
          > <h3 className="font-headline-sm text-headline-sm text-primary tracking-tight mb-1.5">
            {consultant.name}
          </h3>
          </Link>
          {consultant.title ? (
            <p className="font-label-md text-label-md text-secondary font-medium uppercase tracking-wider mb-3">
              {consultant.title}
            </p>
          ) : null}
          {/*{consultant.biography ? (*/}
          {/*  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3 mb-4 leading-relaxed">*/}
          {/*    {consultant.biography}*/}
          {/*  </p>*/}
          {/*) : null}*/}
        </div>
        <div className="pt-4 mt-auto">
          <Link
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blush-surface text-primary-container hover:bg-blush-hover font-label-md text-label-md tracking-wider transition-all"
            href={`/danismanlar/${consultant.slug}`}
          >
            <span>Danışmanı İncele</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StandardsSection() {
  const standards = [
    {
      icon: Scale,
      title: "Etik Sözleşme",
      description:
        "Tüm uzmanlarımız uluslararası psikolojik danışmanlık etik kodlarını yazılı olarak taahhüt eder.",
    },
    {
      icon: BadgeCheck,
      title: "TPD Standartları",
      description:
        "Türk Psikologlar Derneği ve EFTA ilkelerine uygun diploma, seans ve uygulama protokolleri.",
    },
    {
      icon: ClipboardList,
      title: "Düzenli Süpervizyon",
      description:
        "Kıdemli kurul denetiminde aylık vaka analizleri ve kesintisiz mesleki gelişim oturumları.",
    },
    {
      icon: Lock,
      title: "%100 Mahremiyet",
      description:
        "KVKK uyumlu ve uçtan uca şifreli altyapı ile paylaşılan hiçbir bilgi üçüncü taraflara aktarılmaz.",
    },
  ];

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 mb-16 w-full">
      <div className="p-8 md:p-12 rounded-3xl bg-canvas-pure shadow-sm relative overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-blush-surface/50 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10">
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-[0.2em] text-accent-gold font-bold">
              Kurumsal Güvence
            </span>
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight mt-1">
              Danışmanlık Standartlarımız
            </h2>
          </div>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
            Danışanlarımızın ruhsal ve duygusal esenliğini en üst düzeyde
            korumak amacıyla uluslararası mesleki ilkeler ve sıkı süpervizyon
            ağları ile çalışıyoruz.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {standards.map((standard) => (
            <div
              className="p-6 rounded-2xl bg-canvas-cream flex flex-col justify-between hover:bg-blush-surface/60 transition-colors"
              key={standard.title}
            >
              <div className="w-12 h-12 rounded-xl bg-blush-surface text-primary-container flex items-center justify-center mb-4">
                <standard.icon className="size-6" />
              </div>
              <h4 className="font-title-md text-title-md text-primary font-semibold mb-2">
                {standard.title}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                {standard.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ConciergeSection() {
  const contact = useContactInfo();
  const whatsappHref = contact.whatsappUrl.startsWith("http")
    ? `${contact.whatsappUrl}?text=Merhaba,%20dan%C4%B1%C5%9Fman%20se%C3%A7imi%20hakk%C4%B1nda%20bilgi%20ve%20destek%20almak%20istiyorum.`
    : contact.whatsappUrl;

  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 mb-24 w-full">
      <div className="rounded-3xl bg-gradient-to-r from-primary-container via-burgundy-light to-primary p-8 md:p-12 text-on-primary shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl relative z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-on-primary/10 font-label-sm text-label-sm uppercase tracking-wider text-accent-gold mb-4">
            <Sparkles className="size-4" />
            <span>Kişiselleştirilmiş Eşleştirme Desteği</span>
          </div>
          <h3 className="font-headline-lg text-headline-lg text-on-primary tracking-tight mb-3">
            Hangi Danışmanın Size Uygun Olduğuna Karar Veremediniz mi?
          </h3>
          <p className="font-body-md text-body-md text-on-primary/80 leading-relaxed">
            Yaşadığınız durum, beklentileriniz ve seans hedeflerinizi uzman
            danışma koordinatörümüzle ücretsiz paylaşın; size en uygun
            uzmanımızı birlikte belirleyelim.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 w-full lg:w-auto flex-shrink-0">
          <a
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full bg-accent-gold text-tertiary font-label-lg text-label-lg font-bold shadow-lg hover:bg-tertiary-fixed transition-all hover:scale-105"
            href={whatsappHref}
            rel="noopener noreferrer"
            target="_blank"
          >
            <MessageCircle className="size-5" />
            <span>WhatsApp Koordinatör Desteği</span>
          </a>
          <a
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-4 rounded-full bg-on-primary/15 hover:bg-on-primary/25 text-on-primary font-label-md text-label-md transition-colors"
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
          >
            <Phone className="size-4" />
            <span>Hemen Ara</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function ListToolbar({ search, onSearchChange, resultCount }) {
  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 mb-12 w-full">
      <div className="bg-canvas-pure rounded-2xl p-4 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-sm">
            <span>Tümü</span>
            <span className="px-2 py-0.5 rounded-full bg-burgundy-light font-label-sm text-label-sm text-on-primary">
              {resultCount}
            </span>
          </span>
        </div>
        <div className="relative w-full lg:w-80 flex-shrink-0">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
          <input
            className="w-full pl-11 pr-4 py-2.5 rounded-full bg-canvas-cream text-on-surface placeholder:text-on-surface-variant font-body-sm text-body-sm focus:outline-none focus:bg-canvas-pure transition-all"
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="İsim veya unvan ara..."
            type="text"
            value={search}
          />
        </div>
      </div>
    </section>
  );
}

function GridMessage({ children }) {
  return (
    <div className="col-span-full flex flex-col items-center gap-3 rounded-2xl border border-border-delicate bg-canvas-pure px-6 py-14 text-center">
      {children}
    </div>
  );
}

function GridSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="rounded-2xl bg-canvas-pure shadow-sm overflow-hidden animate-pulse"
          key={index}
        >
          <div className="aspect-square bg-blush-surface/50" />
          <div className="p-6 flex flex-col gap-3">
            <div className="h-5 w-2/3 rounded bg-surface-container" />
            <div className="h-3 w-1/2 rounded bg-surface-container" />
            <div className="h-3 w-full rounded bg-surface-container" />
            <div className="h-10 w-full rounded-xl bg-surface-container mt-2" />
          </div>
        </div>
      ))}
    </>
  );
}

export function ConsultantsPage() {
  const [search, setSearch] = useState("");
  const query = usePublicConsultantsQuery();

  const consultants = useMemo(() => {
    const items = (query.data ?? []).filter((item) => item.is_active);
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.name} ${item.title ?? ""}`.toLowerCase().includes(q)
    );
  }, [query.data, search]);

  return (
    <ConsultantsPageShell>
      <div className="relative w-full overflow-hidden">
        <section className="w-full pt-16 pb-16 px-4 sm:px-6 max-w-[1320px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            {/*<div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blush-surface text-primary-container font-label-sm text-label-sm uppercase tracking-[0.16em] mb-4 shadow-sm">*/}
            {/*  <BadgeCheck className="size-4 text-accent-gold" />*/}
            {/*  <span>Akredite &amp; Lisanslı Kadro</span>*/}
            {/*</div>*/}
            <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
              Uzman Danışman Kadromuz
            </h2>
            {/*<p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed mb-8">*/}
            {/*  {HERO_DESCRIPTION}*/}
            {/*</p>*/}
            {/*<MetricRibbon />*/}
          </div>
        </section>
        {/*<ListToolbar*/}
        {/*  onSearchChange={setSearch}*/}
        {/*  resultCount={consultants.length}*/}
        {/*  search={search}*/}
        {/*/>*/}
        <section className="max-w-[1320px] mx-auto px-4 sm:px-6 mb-20 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {query.isPending && <GridSkeleton count={4} />}
            {query.isError && (
              <GridMessage>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Danışanlar yüklenemedi. Lütfen sayfayı yenileyip tekrar
                  deneyin.
                </p>
                <button
                  className="mt-2 inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-md hover:bg-burgundy-light transition-all"
                  onClick={() => query.refetch()}
                  type="button"
                >
                  Tekrar Dene
                </button>
              </GridMessage>
            )}
            {query.isSuccess && consultants.length === 0 && (
              <GridMessage>
                <Search className="size-8 text-outline-variant" />
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {search.trim()
                    ? "Aramanızla eşleşen danışman bulunamadı."
                    : "Henüz aktif bir danışman bulunmuyor."}
                </p>
              </GridMessage>
            )}
            {consultants.map((consultant) => (
              <ConsultantCard consultant={consultant} key={consultant.id} />
            ))}
          </div>
        </section>
        {/*<StandardsSection />*/}
        {/*<ConciergeSection />*/}
      </div>
    </ConsultantsPageShell>
  );
}

function SectionOverline({ children }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="w-8 h-px bg-accent-gold" />
      <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
        {children}
      </span>
    </div>
  );
}

function MediaCard({ entry }) {
  return (
    <a
      className="group relative rounded-2xl overflow-hidden bg-canvas-cream border border-border-delicate shadow-sm hover:shadow-md transition-all"
      href={entry.src}
      rel="noopener noreferrer"
      target="_blank"
    >
      <div className="aspect-[4/3] bg-blush-surface relative overflow-hidden">
        <img
          alt={entry.title ?? ""}
          className="w-full h-full object-cover"
          src={entry.src}
        />
        <div className="absolute inset-0 bg-primary/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <ZoomIn className="size-7 text-on-primary" />
          <span className="text-on-primary font-label-sm text-label-sm">
            Belgeyi Gör
          </span>
        </div>
      </div>
      {entry.title ? (
        <div className="p-4">
          <h4 className="font-title-md text-title-md text-primary font-semibold text-[15px] leading-snug">
            {entry.title}
          </h4>
        </div>
      ) : null}
    </a>
  );
}

export function ConsultantDetailPage({ id }) {
  const query = usePublicConsultantQuery(id);
  const consultant = query.data;

  const certificates = consultant?.certificates ?? [];
  const gallery = consultant?.images ?? [];

  return (
    <ConsultantsPageShell>
      <div className="relative w-full overflow-hidden">
        <div className="absolute -top-32 right-1/4 w-96 h-96 bg-primary-fixed/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-96 left-10 w-80 h-80 bg-tertiary-fixed/30 rounded-full blur-3xl pointer-events-none" />
        <div className="max-w-[1100px] mx-auto px-4 sm:px-6 pt-8 pb-20 relative">
          {query.isPending && (
            <div className="flex justify-center py-24">
              <Sparkles className="size-8 animate-pulse text-accent-gold" />
            </div>
          )}

          {query.isError && (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-border-delicate bg-canvas-pure px-6 py-16 text-center">
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Danışman bilgileri yüklenemedi.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-md hover:bg-burgundy-light transition-all"
                  onClick={() => query.refetch()}
                  type="button"
                >
                  Tekrar Dene
                </button>
                <Link
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-blush-surface text-primary-container font-label-md text-label-md hover:bg-blush-hover transition-all"
                  href="/danismanlar"
                >
                  Danışman Kadromuza Dön
                </Link>
              </div>
            </div>
          )}

          {query.isSuccess && !consultant && (
            <div className="flex flex-col items-center gap-4 rounded-3xl border border-border-delicate bg-canvas-pure px-6 py-16 text-center">
              <p className="font-body-lg text-body-lg text-on-surface-variant">
                Aradığınız danışman bulunamadı.
              </p>
              <Link
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-primary-container text-on-primary font-label-md text-label-md shadow-md hover:bg-burgundy-light transition-all"
                href="/danismanlar"
              >
                Danışman Kadromuza Dön
              </Link>
            </div>
          )}

          {consultant && (
            <>
              <nav className="flex flex-wrap items-center gap-2 mb-8 font-label-md text-label-md text-on-surface-variant">
                <Link className="hover:text-primary transition-colors" href="/">
                  Ana Sayfa
                </Link>
                <ChevronRight className="size-3.5 text-outline" />
                <Link className="hover:text-primary transition-colors" href="/danismanlar">
                  Danışman Kadromuz
                </Link>
                <ChevronRight className="size-3.5 text-outline" />
                <span className="text-primary font-semibold">{consultant.name}</span>
              </nav>

              <div className="space-y-10">
                <article className="bg-canvas-pure rounded-3xl p-8 lg:p-12 shadow-[0_16px_40px_-8px_rgba(92,29,36,0.06),0_4px_20px_-4px_rgba(212,175,55,0.05)] border border-border-delicate">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                    <div className="lg:col-span-4 lg:sticky lg:top-28">
                      <div className="relative rounded-2xl overflow-hidden shadow-xl border border-border-delicate/60 bg-blush-surface group aspect-[4/5] max-w-[340px] mx-auto lg:max-w-none">
                        {consultant.profile_image ? (
                          <img
                            alt={consultant.name}
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700 ease-out"
                            src={consultant.profile_image}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-headline-lg text-headline-lg text-primary-container/40">
                              {consultant.name?.slice(0, 1) ?? "?"}
                            </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent" />
                      </div>
                      {/*<div className="mt-4 flex flex-wrap gap-2 justify-center lg:justify-start">*/}
                      {/*  <span className="px-3 py-1 rounded-full bg-blush-surface text-primary-container font-label-sm text-label-sm font-semibold tracking-wider uppercase">*/}
                      {/*    Uzman Kadro*/}
                      {/*  </span>*/}
                      {/*</div>*/}
                    </div>
                    <div className="lg:col-span-8 flex flex-col">
                      <div className="border-b border-border-delicate pb-6 mb-6">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="w-6 h-px bg-accent-gold" />
                          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-bold">
                            Özgeçmiş &amp; Biyografi
                          </span>
                        </div>
                        <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight mb-2">
                          {consultant.name}
                        </h1>
                        {consultant.title ? (
                          <p className="font-title-lg text-title-lg text-secondary font-medium">
                            {consultant.title}
                          </p>
                        ) : null}
                      </div>
                      {consultant.biography ? (
                        <div className="font-body-lg text-body-lg text-on-surface-variant space-y-5 leading-relaxed whitespace-pre-line">
                          {consultant.biography}
                        </div>
                      ) : (
                        <p className="font-body-md text-body-md text-on-surface-variant italic">
                          Biyografi bilgisi henüz eklenmemiş.
                        </p>
                      )}
                    </div>
                  </div>
                </article>

                {consultant.education ? (
                  <article className="bg-canvas-pure rounded-3xl p-8 lg:p-12 shadow-[0_4px_24px_rgba(92,29,36,0.04)] border border-border-delicate">
                    <SectionOverline>Eğitim &amp; Akademik Yolculuk</SectionOverline>
                    <h2 className="font-headline-md text-headline-md text-primary mb-6">
                      Akademik Temeller
                    </h2>
                    <div className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
                      {consultant.education}
                    </div>
                  </article>
                ) : null}

                {consultant.experience ? (
                  <article className="bg-canvas-pure rounded-3xl p-8 lg:p-12 shadow-[0_4px_24px_rgba(92,29,36,0.04)] border border-border-delicate">
                    <SectionOverline>
                      Mesleki Deneyim &amp; Kariyer
                    </SectionOverline>
                    <h2 className="font-headline-md text-headline-md text-primary mb-6">
                      Klinik Deneyim Geçmişi
                    </h2>
                    <div className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed whitespace-pre-line">
                      {consultant.experience}
                    </div>
                  </article>
                ) : null}

                {certificates.length > 0 && (
                  <article className="bg-canvas-pure rounded-3xl p-8 lg:p-12 shadow-[0_4px_24px_rgba(92,29,36,0.04)] border border-border-delicate">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-border-delicate">
                      <div>
                        <SectionOverline>
                          Belgeler &amp; Sertifikalar
                        </SectionOverline>
                        <h2 className="font-headline-md text-headline-md text-primary">
                          Sertifikalar &amp; Akreditasyonlar
                        </h2>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 md:mt-0">
                        Yetkili kurumlarca onaylanmış resmi akreditasyon
                        belgeleri.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {certificates.map((entry, index) => (
                        <MediaCard entry={entry} key={`${entry.src}-${index}`} />
                      ))}
                    </div>
                  </article>
                )}

                {gallery.length > 0 && (
                  <article className="bg-canvas-pure rounded-3xl p-8 lg:p-12 shadow-[0_4px_24px_rgba(92,29,36,0.04)] border border-border-delicate">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-border-delicate">
                      <div>
                        <SectionOverline>Galeri</SectionOverline>
                        <h2 className="font-headline-md text-headline-md text-primary">
                          Görseller
                        </h2>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {gallery.map((entry, index) => (
                        <MediaCard entry={entry} key={`${entry.src}-${index}`} />
                      ))}
                    </div>
                  </article>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </ConsultantsPageShell>
  );
}
