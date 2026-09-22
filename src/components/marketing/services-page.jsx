/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BadgeCheck,
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Clock,
  CreditCard,
  Globe,
  HeartHandshake,
  Lock,
  MessageCircle,
  Mic,
  Send,
  Sparkles,
  Star,
  Users,
  Video,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { cn } from "@/lib/utils";
import {
  usePublicServiceCategoriesQuery,
} from "@/lib/service-categories";
import { usePublicServicesQuery } from "@/lib/services";
import { marketingNavLinks } from "@/lib/marketing-nav";

const PORTRAIT_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA8tjFifK4v-U1Zh_nHOOtS__aE0NScREXl24jV6FOtRbCSopSiBDhYALBLO-XluzXBnBwtXjCMoGhY7yRcYxCOPYCfUoNcxzZUY9vbTY7B2qpLavrrrFoooCMs64z5if6cvzOLICUOeD__jZfOxlHNLovE8EiuhwDCYvNwLb2yMuG03ocdjaIsmZ55faCSnsMtDxy_LP2iMQLz_PY1pjgertu5cFnn64mK3u93Aah0OgYBZG77VAGx";

const ASSISTANT_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAMLxiDTd7m7wYZ__QFZxbIfRPREa3sI9GRmclpPCU1zlWgZxIU8CTozuuDuGVbLJx4VhFfvWYXrGpCMn-BF-m7NMyMGZc3GUpXALkjOWaGTIOKg4639dSuLPCE6utzqVekNNEZIQdJ40CfrUcVz78V8XHkcowy-oNB20i7bGKFbWcszRyzEkIUoAmOYx3-vHod6FyrEAzBTOHZzmfw9-_j7HV6C6LQxC3nxYNMP4g8VT9fLVpsBHxd";

const CTA_PRIMARY_CLASS =
  "inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-lg hover:bg-burgundy-light transition-all transform hover:-translate-y-0.5";

const CTA_SECONDARY_CLASS =
  "inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-surface-container-lowest text-primary font-label-lg text-label-lg shadow-sm hover:bg-blush-surface transition-all";

const CARD_CTA_CLASS =
  " inline-flex items-center justify-center px-7 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold group-hover:bg-burgundy-light shadow-md transition-all";

function excerpt(text, maxLength = 140) {
  const value = String(text ?? "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function sortItems(items) {
  return [...items].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
}

function PageHero({
  breadcrumb,
  badge,
  title,
  titleAccent,
  description,
}) {
  return (
    <section className="w-full relative overflow-hidden py-14 lg:py-20 bg-gradient-to-b from-canvas-pure via-blush-surface/30 to-canvas-cream">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-accent-gold/10 blur-3xl pointer-events-none" />
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 relative z-10">
        <nav className="flex flex-wrap items-center gap-2 text-on-surface-variant font-label-md text-label-md mb-8">
          <Link className="hover:text-primary-container transition-colors" href="/">
            Anasayfa
          </Link>
          <ChevronRight className="size-3.5 text-outline-variant" />
          <Link className="hover:text-primary-container transition-colors" href="/hizmetler">
            1e1 Seanslar
          </Link>
          {breadcrumb && (
            <>
              <ChevronRight className="size-3.5 text-outline-variant" />
              <span className="text-primary-container font-semibold">
                {breadcrumb}
              </span>
            </>
          )}
        </nav>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-8 flex flex-col items-start">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blush-surface text-primary font-label-sm text-label-sm tracking-[0.14em] uppercase font-bold shadow-sm mb-5">
              <Sparkles className="size-4 text-accent-gold" />
              <span>{badge}</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-medium mb-6 leading-tight">
              {title}
              {titleAccent && (
                <>
                  {" "}
                  <br className="hidden sm:inline" />
                  <span className="italic font-normal text-burgundy-light">
                    {titleAccent}
                  </span>
                </>
              )}
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed mb-8">
              {description}
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Link className={CTA_PRIMARY_CLASS} href="#paketler">
                <span>Seans Seçeneklerini Keşfet</span>
                <ChevronDown className="size-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-4 relative flex justify-center">
            <div className="relative w-full max-w-sm aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl bg-surface-container-highest">
              <Image
                alt="Sümeyra Aydın"
                className="w-full h-full object-cover"
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                src={PORTRAIT_URL}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/10 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-on-primary">
                <p className="font-headline-sm text-headline-sm text-on-primary font-medium">
                  Sümeyra Aydın
                </p>
                <p className="font-label-sm text-label-sm text-secondary-fixed tracking-wider uppercase">
                  İlişki Mentörü &amp; Dişil Enerji Terapisti
                </p>
              </div>
            </div>
          </div>
        </div>
        <TrustPillars />
      </div>
    </section>
  );
}

function TrustPillars() {
  const pillars = [
    { icon: Lock, title: "Gizlilik & Etik", description: "Yüzde 100 Mahremiyet" },
    { icon: Video, title: "Online Seanslar", description: "Zoom & Google Meet" },
    { icon: BookOpen, title: "Özel Eylem Planı", description: "Kişisel Yol Haritası" },
    { icon: BadgeCheck, title: "Sürekli Destek", description: "WhatsApp Seans Takibi" },
  ];
  return (
    <div className="mt-14 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-canvas-pure rounded-2xl p-6 shadow-sm">
      {pillars.map((pillar) => (
        <div className="flex items-center gap-3" key={pillar.title}>
          <div className="w-10 h-10 rounded-full bg-blush-surface text-primary-container flex items-center justify-center flex-shrink-0">
            <pillar.icon className="size-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-body-md text-body-md font-semibold text-primary">
              {pillar.title}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {pillar.description}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PackagesSection({ children }) {
  return (
    <section
      className="w-full py-20 px-4 sm:px-6 max-w-[1320px] mx-auto"
      id="paketler"
    >
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-burgundy-light font-bold">
          KİŞİYE ÖZEL ÇÖZÜMLER
        </span>
        <h2 className="font-headline-lg text-headline-lg text-primary font-semibold mt-2 mb-4">
          Danışmanlık &amp; Seans Seçenekleri
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          İçinde bulunduğunuz dönemin ihtiyacına göre size en uygun seans
          formatını seçin.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch max-w-[1240px] mx-auto">
        {children}
      </div>
    </section>
  );
}

function CardMedia({ alt, src }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden flex-shrink-0 bg-surface-container-highest shadow-inner relative">
      {src && !failed ? (
        <img
          alt={alt}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
          src={src}
        />
      ) : (
        <div className="w-full h-full bg-blush-surface flex items-center justify-center text-primary-container">
          <Sparkles className="size-8" />
        </div>
      )}
    </div>
  );
}

function GridSkeleton({ count = 4 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-canvas-pure p-6 sm:p-8 rounded-3xl border border-border-delicate"
          key={index}
        >
          <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-surface-container-highest animate-pulse flex-shrink-0" />
          <div className="flex-1 w-full space-y-3">
            <div className="h-5 w-3/4 rounded-full bg-surface-container-highest animate-pulse" />
            <div className="h-4 w-full rounded-full bg-surface-container-highest animate-pulse" />
            <div className="h-4 w-2/3 rounded-full bg-surface-container-highest animate-pulse" />
            <div className="h-9 w-36 rounded-xl bg-surface-container-highest animate-pulse mt-4" />
          </div>
        </div>
      ))}
    </>
  );
}

function GridMessage({ children }) {
  return (
    <div className="md:col-span-2 flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-14 text-center">
      <Sparkles className="size-6 text-accent-gold" />
      <p className="font-body-md text-body-md text-on-surface-variant">
        {children}
      </p>
    </div>
  );
}

function CategoryCard({ category }) {
  const href = `/hizmetler/${category.slug || category.id}`;
  return (
    <Link
      className="group flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-canvas-pure p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border-delicate"
      href={href}
    >
      <CardMedia alt={category.name} src={category.image} />
      <div className="flex flex-col items-center sm:items-start justify-between flex-grow h-full text-center sm:text-left">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-2 group-hover:text-burgundy-light transition-colors">
            {category.name}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-1">
            {excerpt(category.seo_description || category.seo_title, 120)}
          </p>
        </div>
        <span className={cn(CARD_CTA_CLASS, "mt-4 sm:mt-6")}>
          Kategoriyi Keşfet
        </span>
      </div>
    </Link>
  );
}

function ServiceCard({ categoryHref, service }) {
  const detailHref = `${categoryHref}/${service.slug || service.id}`;
  return (
    <Link href={detailHref} className="group flex flex-col sm:flex-row items-center sm:items-start gap-6 bg-canvas-pure p-6 sm:p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 border border-border-delicate">
      <CardMedia alt={service.name} src={service.image} />
      <div className="flex flex-col items-center sm:items-start justify-between flex-grow h-full text-center sm:text-left">
        <div>
          <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-2">
            {service.name}
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-1">
            {excerpt(service.seo_description || service.description, 120)}
          </p>
        </div>
        <span className={cn(CARD_CTA_CLASS, "mt-4 sm:mt-6")} >
          Randevu Al
        </span>
      </div>
    </Link>
  );
}

function VoiceQuestionBanner() {
  return (
    <section
      className="w-full py-12 px-4 sm:px-6 max-w-[1320px] mx-auto"
      id="hizli-soru"
    >
      <div className="rounded-3xl bg-gradient-to-r from-primary-container via-burgundy-light to-primary text-on-primary p-8 lg:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-accent-gold/15 blur-2xl pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
          <div className="lg:col-span-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-canvas-pure/15 text-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider mb-4">
              <Mic className="size-4 text-accent-gold" />
              <span>Hızlı &amp; Asenkron Danışmanlık Alternatifi</span>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-primary font-semibold mb-3">
              Vaktiniz kısıtlı mı? Sesli Soru Danışmanlığı
            </h2>
            <p className="font-body-md text-body-md text-primary-fixed leading-relaxed max-w-2xl">
              İlişkinizle ilgili anlık kafa karışıklığınızı, mesajlaşma
              çıkmazını veya spesifik bir tartışmayı ses kaydı ya da metin
              olarak iletin. Sümeyra Aydın sorunuzu 24 saat içinde 5-7
              dakikalık kişiselleştirilmiş derinlikli sesli analizle
              cevaplasın.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-secondary-fixed font-label-md text-label-md">
                <BadgeCheck className="size-5 text-accent-gold" />
                <span>24 Saat İçinde Teslimat</span>
              </div>
              <div className="flex items-center gap-2 text-secondary-fixed font-label-md text-label-md">
                <Mic className="size-5 text-accent-gold" />
                <span>5-7 Dk Özel Ses Kaydı</span>
              </div>
              <div className="flex items-center gap-2 text-secondary-fixed font-label-md text-label-md">
                <Lock className="size-5 text-accent-gold" />
                <span>Tamamen Gizli</span>
              </div>
            </div>
          </div>
          <div className="lg:col-span-4 flex flex-col items-start lg:items-end justify-center">
            <div className="bg-canvas-pure text-on-surface p-6 rounded-2xl shadow-xl w-full max-w-xs text-center flex flex-col items-center">
              <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
                Tek Soru Yanıtı
              </span>
              <div className="flex items-baseline gap-1 my-2">
                <span className="font-headline-lg text-headline-lg text-primary font-bold">
                  490
                </span>
                <span className="font-title-md text-title-md text-secondary font-semibold">
                  TL
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                Canlı randevu beklemeden aynı gün uzman görüşü alın.
              </p>
              <a
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-accent-gold text-tertiary font-label-lg text-label-lg font-bold hover:brightness-105 shadow-md transition-all"
                href="https://wa.me/905061151010?text=Merhaba,%20Sesli%20Soru%20Dan%C4%B1%C5%9Fmanl%C4%B1%C4%9F%C4%B1%20hakk%C4%B1nda%20bilgi%20ve%20soru%20g%C3%B6ndermek%20istiyorum."
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-4" />
                <span>Soru Gönder &amp; Yanıt Al</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProcessSection() {
  const steps = [
    {
      icon: CalendarDays,
      chip: "Esnek Takvim Seçimi",
      title: "Paketinizi Seçin & Randevuyu Oluşturun",
      description:
        "İhtiyacınıza uygun seans formatını belirleyin. Size en uygun gün ve saat dilimini takvimden kolayca rezerve edin.",
    },
    {
      icon: ClipboardList,
      chip: "Kişisel Ön Analiz",
      title: "Ön Değerlendirme Formunu Doldurun",
      description:
        "Görüşme öncesi durumunuzu, beklentilerinizi ve hedeflerinizi içeren kısa gizli anketi yanıtlayın. Seans verimini maksimuma çıkarın.",
    },
    {
      icon: Users,
      chip: "Güvenli & Şefkatli Alan",
      title: "Canlı Görüşme & Derin Farkındalık",
      description:
        "Zoom üzerinden kameranız açık, güvenli, şefkatli ve yargısız bir alanda birebir derin seans gerçekleştirin.",
    },
    {
      icon: CircleCheck,
      chip: "Kalıcı Dönüşüm",
      title: "Eylem Planı & Seans Sonrası Takip",
      description:
        "Görüşme sonunda size özel ev ödevleri, farkındalık pratikleri ve WhatsApp takip süreci başlar.",
    },
  ];
  return (
    <section className="w-full py-20 bg-surface-container-low/50">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-secondary font-bold">
            REHBERLİK YOLCULUĞU
          </span>
          <h2 className="font-headline-lg text-headline-lg text-primary font-semibold mt-2 mb-4">
            Seans Süreci Nasıl İşler?
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            İlk adımdan dönüşümün köklenmesine kadar geçen 4 aşamalı şeffaf ve
            güvenli süreç.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              className="rounded-3xl bg-canvas-pure p-8 shadow-sm relative flex flex-col justify-between"
              key={step.title}
            >
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blush-surface text-primary-container font-headline-sm text-headline-sm font-bold flex items-center justify-center mb-6">
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="font-title-lg text-title-lg text-primary font-semibold mb-3">
                  {step.title}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                  {step.description}
                </p>
              </div>
              <div className="mt-6 pt-4 flex items-center gap-2 text-primary-container font-label-sm text-label-sm font-semibold">
                <step.icon className="size-4" />
                <span>{step.chip}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  const stories = [
    {
      initials: "E.K.",
      name: "Elif K. (34)",
      role: "Mimar • 3 Seanslık Dönüşüm Paketi",
      quote:
        "Boşanmanın eşiğindeydik. Sürekli birbirimizi suçluyor ve aynı kavgalarda boğuluyorduk. 3 seanslık pakette Sümeyra Hanım dişil-eril kutuplaşmamızı öyle berrak bir aynayla gösterdi ki, kocamla ilk flört günlerimize geri döndük.",
    },
    {
      initials: "B.T.",
      name: "Burcu T. (29)",
      role: "İK Yöneticisi • 5 Seanslık Mentörlük",
      quote:
        "Hayatım boyunca 'aşırı verici' olmuştum. Sevilmek için sürekli çabalamam gerektiğine inanıyordum. Seanslarda sınır koymanın soğukluk değil, en yüce dişil zarafet olduğunu öğrendim. Hayatımdaki tüm ilişki dinamiklerim değişti.",
    },
    {
      initials: "S.A.",
      name: "Seda A. (38)",
      role: "Öğretmen • Bireysel Seans",
      quote:
        "Yıllardır süren kaygılı bağlanmam sebebiyle partnerimi boğuyor ve uzaklaştırıyordum. Tek bir seansta tespit ettiği kök inanç ve sonrasında verdiği pratikler sayesinde iç huzurumu ilk defa geri kazandım. Minnettarım.",
    },
  ];
  return (
    <section className="w-full py-20 px-4 sm:px-6 max-w-[1320px] mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-accent-gold font-bold">
          GERÇEK DÖNÜŞÜM ÖYKÜLERİ
        </span>
        <h2 className="font-headline-lg text-headline-lg text-primary font-semibold mt-2 mb-4">
          1e1 Seans Alan Danışan Deneyimleri
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Birebir rehberlik ile ilişkilerinde netlik, huzur ve derin bağ
          yakalayan kadınların geri bildirimleri.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stories.map((story) => (
          <div
            className="p-8 rounded-3xl bg-canvas-pure shadow-sm flex flex-col justify-between relative"
            key={story.name}
          >
            <div className="flex items-center gap-1 text-accent-gold mb-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star className="size-5 fill-current" key={index} />
              ))}
            </div>
            <p className="font-body-md text-body-md text-on-surface italic leading-relaxed mb-6">
              “{story.quote}”
            </p>
            <div className="flex items-center gap-3 pt-4">
              <div className="w-11 h-11 rounded-full bg-blush-surface text-primary font-body-md text-body-md font-semibold flex items-center justify-center">
                {story.initials}
              </div>
              <div>
                <h4 className="font-body-md text-body-md font-semibold text-primary">
                  {story.name}
                </h4>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {story.role}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}



function FaqSection() {
  const faqs = [
    {
      question: "Seanslar hangi platform üzerinden gerçekleşiyor?",
      answer:
        "Seanslarımız Zoom veya Google Meet üzerinden birebir görüntülü olarak gerçekleştirilir. Randevunuz kesinleştikten sonra görüşme linki WhatsApp ve e-posta adresinize iletilir. Dilerseniz sadece sesli katılım seçeneği de mevcuttur.",
    },
    {
      question: "Görüşmelerin gizliliği nasıl korunuyor?",
      answer:
        "Danışmanlık sürecinde paylaştığınız tüm kişisel veriler, hikayeniz ve konuşulanlar katı etik kurallar çerçevesinde yüzde yüz gizli tutulur. Görüşmeler asla kayıt altına alınmaz ve üçüncü şahıslarla paylaşılmaz.",
    },
    {
      question: "Randevu saatimi sonradan değiştirebilir miyim?",
      answer:
        "Evet, seans saatinizden en geç 24 saat öncesine kadar asistanımızla iletişime geçerek randevu tarihinizi ücretsiz olarak erteleyebilir ve başka bir güne aktarabilirsiniz.",
    },
    {
      question: "Tek seans mı yoksa paket mi tercih etmeliyim?",
      answer:
        "Anlık bir karar veya belirli bir durum analizi için tek seans yeterli olabilir. Ancak kök inançların dönüştürülmesi, bağlanma yaralarının onarılması ve yeni dişil davranış kalıplarının hayata geçirilmesi için 3 veya 5 seanslık paketler kalıcı sonuç sağlamaktadır.",
    },
    {
      question: "Yurt dışından katılımlar için saat farkı ve ödeme nasıl oluyor?",
      answer:
        "Avrupa, Amerika ve Orta Doğu'daki danışanlarımız için saat dilimine özel seans planlaması yapılır. Ödemelerinizi uluslararası Visa/Mastercard, Swift veya Wise ile güvenle gerçekleştirebilirsiniz.",
    },
  ];
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <section className="w-full py-20 px-4 sm:px-6 max-w-[1000px] mx-auto">
      <div className="text-center mb-16">
        <span className="font-label-sm text-label-sm uppercase tracking-[0.18em] text-secondary font-bold">
          MERAK EDİLENLER
        </span>
        <h2 className="font-headline-lg text-headline-lg text-primary font-semibold mt-2 mb-4">
          Sıkça Sorulan Sorular
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Seans sürecine dair aklınıza takılabilecek tüm detaylar.
        </p>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const open = openIndex === index;
          return (
            <div
              className="rounded-2xl bg-canvas-pure shadow-sm overflow-hidden transition-all"
              key={faq.question}
            >
              <button
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
                onClick={() => setOpenIndex(open ? null : index)}
                type="button"
              >
                <span className="font-title-md text-title-md text-primary font-semibold">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "size-5 text-primary-container transition-transform shrink-0",
                    open && "rotate-180"
                  )}
                />
              </button>
              {open && (
                <div className="px-6 pb-6 text-on-surface-variant font-body-md text-body-md leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}



export function ServicesPageShell({ children }) {
  return (
    <div className="theme-velvet bg-canvas-cream font-body-md text-on-surface">
      <SiteHeader links={marketingNavLinks("/hizmetler")} />
      <main className="w-full pt-28 bg-canvas-cream">{children}</main>
      <SiteFooter />
    </div>
  );
}

const DEFAULT_HERO_DESCRIPTION =
  "İlişkilerinizdeki tekrar eden tıkanıklıkları, bastırılmış dişil enerji blokajlarını ve derin bağlanma yaralarını Sümeyra Aydın rehberliğinde; şefkatli, yargısız ve güvenli bir alanda kalıcı çözüme dönüştürün.";

export function ServiceCategoriesPage() {
  const query = usePublicServiceCategoriesQuery();
  const categories = useMemo(
    () => sortItems((query.data ?? []).filter((item) => item.is_active)),
    [query.data]
  );

  return (
    <ServicesPageShell>
      <PageHero
        badge="Kişiselleştirilmiş Dönüşüm & Rehberlik"
        breadcrumb={null}
        description={DEFAULT_HERO_DESCRIPTION}
        title="1e1 Seanslar"
        // titleAccent="Bütüncül Seans Paketleri"
      />
      <PackagesSection>
        {query.isPending && <GridSkeleton count={4} />}
        {query.isError && (
          <GridMessage>
            Hizmet kategorileri yüklenemedi. Lütfen sayfayı yenileyip tekrar
            deneyin.
          </GridMessage>
        )}
        {query.isSuccess && categories.length === 0 && (
          <GridMessage>Henüz hizmet kategorisi bulunmuyor.</GridMessage>
        )}
        {categories.map((category) => (
          <CategoryCard category={category} key={category.id} />
        ))}
      </PackagesSection>
      <VoiceQuestionBanner />
      <ProcessSection />
      <TestimonialsSection />
      <FaqSection />
    </ServicesPageShell>
  );
}

export function CategoryServicesPage({ slug }) {
  const categoriesQuery = usePublicServiceCategoriesQuery();
  const servicesQuery = usePublicServicesQuery();

  const categories = categoriesQuery.data ?? [];
  const category =
    categories.find((item) => item.slug === slug) ??
    categories.find((item) => String(item.id) === String(slug));

  const services = useMemo(() => {
    if (!category) return [];
    return sortItems(
      (servicesQuery.data ?? []).filter(
        (item) =>
          item.is_active && item.service_category_id === category.id
      )
    );
  }, [category, servicesQuery.data]);

  const heroDescription =
    category?.seo_description?.trim() || DEFAULT_HERO_DESCRIPTION;

  return (
    <ServicesPageShell>
      <PageHero
        badge="Kişiselleştirilmiş Dönüşüm & Rehberlik"
        breadcrumb={category?.name ?? null}
        description={heroDescription}
        title={category?.name ?? "1e1 Seanslar"}
        titleAccent={category ? "Birebir Seans Paketleri" : undefined}
      />
      <PackagesSection>
        {categoriesQuery.isPending && <GridSkeleton count={4} />}
        {categoriesQuery.isError && (
          <GridMessage>
            Kategori bilgisi yüklenemedi. Lütfen sayfayı yenileyip tekrar
            deneyin.
          </GridMessage>
        )}
        {categoriesQuery.isSuccess && !category && (
          <GridMessage>
            Aradığınız kategori bulunamadı. Tüm seansları görmek için{" "}
            <Link className="text-primary underline underline-offset-4" href="/hizmetler">
              buraya tıklayın
            </Link>
            .
          </GridMessage>
        )}
        {category && servicesQuery.isPending && <GridSkeleton count={2} />}
        {category && servicesQuery.isError && (
          <GridMessage>
            Hizmetler yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
          </GridMessage>
        )}
        {category &&
          servicesQuery.isSuccess &&
          services.length === 0 && (
            <GridMessage>
              Bu kategoride henüz hizmet bulunmuyor.
            </GridMessage>
          )}
        {services.map((service) => (
          <ServiceCard
            categoryHref={`/hizmetler/${category?.slug || category?.id || slug}`}
            key={service.slug}
            service={service}
          />
        ))}
      </PackagesSection>
      <VoiceQuestionBanner />
      <ProcessSection />
      <TestimonialsSection />
      <FaqSection />
    </ServicesPageShell>
  );
}
