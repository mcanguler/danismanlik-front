/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Award,
  CalendarCheck,
  ChevronRight,
  CircleAlert,
  GraduationCap,
  Infinity as InfinityIcon,
  LoaderCircle,
  PackageOpen,
  PlayCircle,
  Sparkles,
  UsersRound,
  Video,
} from "lucide-react";
import { ServicesPageShell } from "@/components/marketing/services-page";
import { SectionHeading } from "@/components/marketing/section-heading";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { usePublicCoursesQuery } from "@/lib/courses";

const CARD_CTA_CLASS =
  "inline-flex items-center justify-center gap-2 px-7 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-burgundy-light shadow-md transition-all";

function excerpt(text, maxLength = 150) {
  const value = String(text ?? "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function CourseMedia({ alt, src, className }) {
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
          <GraduationCap className="size-10" />
        </div>
      )}
    </div>
  );
}

function PriceBlock({ course, large = false }) {
  if (course.has_discount) {
    return (
      <div className="flex items-baseline gap-2">
        <span className={cn("font-bold text-primary", large ? "font-headline-md text-headline-md" : "font-headline-sm text-headline-sm")}>
          {formatPrice(course.effective_price)}
        </span>
        <span className="font-body-sm text-body-sm text-outline line-through">
          {formatPrice(course.price)}
        </span>
        <span className="rounded-full bg-accent-gold px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-primary">
          İndirimli
        </span>
      </div>
    );
  }
  return (
    <span className={cn("font-bold text-primary", large ? "font-headline-md text-headline-md" : "font-headline-sm text-headline-sm")}>
      {formatPrice(course.price)}
    </span>
  );
}

function FeaturedCourse({ course }) {
  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 w-full">
      <div className="grid grid-cols-1 items-stretch gap-0 overflow-hidden rounded-[2rem] border border-border-delicate bg-canvas-pure shadow-[0_12px_32px_-4px_rgba(92,29,36,0.06)] lg:grid-cols-2">
        <Link
          className="group relative block min-h-64 lg:min-h-full"
          href={`/egitimler/${course.slug || course.id}`}
        >
          <CourseMedia
            alt={course.title}
            className="h-full min-h-64 rounded-none"
            src={course.image}
          />
          <span className="absolute left-5 top-5 inline-flex items-center gap-1.5 rounded-full bg-canvas-pure/95 px-3.5 py-1 font-label-sm text-label-sm font-bold text-primary shadow-sm">
            <Sparkles className="size-3.5 text-accent-gold" />
            Öne Çıkan Eğitim
          </span>
        </Link>
        <div className="flex flex-col gap-4 p-6 sm:p-10">
          <div className="flex flex-wrap items-center gap-2 font-label-md text-label-md text-secondary">
            <CalendarCheck className="size-4" />
            <span>Akademi &amp; Dönüşümcü Programlar</span>
          </div>
          <Link href={`/egitimler/${course.slug || course.id}`}>
            <h2 className="font-headline-md text-headline-md text-primary font-semibold leading-snug hover:text-burgundy-light transition-colors">
              {course.title}
            </h2>
          </Link>
          {course.short_description && (
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {course.short_description}
            </p>
          )}
          <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-4">
            <PriceBlock course={course} large />
            <Link className={CARD_CTA_CLASS} href={`/egitimler/${course.slug || course.id}`}>
              Eğitime Hemen Kaydol
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function CourseGridCard({ course }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border-delicate bg-canvas-pure shadow-sm hover:shadow-xl transition-all duration-300">
      <Link className="relative block h-48" href={`/egitimler/${course.slug || course.id}`}>
        <CourseMedia alt={course.title} className="h-full rounded-none" src={course.image} />
      </Link>
      <div className="flex flex-grow flex-col p-6">
        <Link href={`/egitimler/${course.slug || course.id}`}>
          <h3 className="font-headline-sm text-headline-sm text-primary font-semibold leading-snug hover:text-burgundy-light transition-colors">
            {course.title}
          </h3>
        </Link>
        {course.short_description && (
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            {excerpt(course.short_description, 120)}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
          <PriceBlock course={course} />
          <Link
            className="inline-flex items-center gap-1.5 rounded-xl bg-blush-surface px-5 py-2 font-label-md text-label-md font-semibold text-primary transition-colors hover:bg-blush-hover"
            href={`/egitimler/${course.slug || course.id}`}
          >
            <PlayCircle className="size-4" />
            İncele
          </Link>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  {
    icon: InfinityIcon,
    title: "Ömür Boyu Erişim",
    description: "Süre geçmeden izleyin, dilediğinizde tekrar edin",
  },
  {
    icon: Video,
    title: "Canlı Soru-Cevap",
    description: "İnteraktif seanslar ve kayıt erişimi",
  },
  {
    icon: Award,
    title: "Akademi Belgesi",
    description: "Tamamlanan eğitimlerde katılım belgesi",
  },
  {
    icon: UsersRound,
    title: "Kapalı Destek Ağı",
    description: "Katılımcılarla özel paylaşım alanı",
  },
];

export function EducationCoursesPage() {
  const query = usePublicCoursesQuery();
  const courses = query.data ?? [];
  const [featured, ...rest] = courses;

  return (
    <ServicesPageShell>
      <section className="w-full relative overflow-hidden py-14 lg:py-20 bg-gradient-to-b from-canvas-pure via-blush-surface/30 to-canvas-cream">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -left-32 w-80 h-80 rounded-full bg-accent-gold/10 blur-3xl pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 relative z-10">
          <nav className="flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface-variant mb-8">
            <Link className="transition-colors hover:text-primary-container" href="/">
              Anasayfa
            </Link>
            <ChevronRight className="size-3.5 text-outline-variant" />
            <span className="font-semibold text-primary-container">Eğitimler &amp; Kamplar</span>
          </nav>
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blush-surface px-4 py-1.5 font-label-sm text-label-sm font-bold uppercase tracking-[0.14em] text-primary shadow-sm">
              <GraduationCap className="size-4 text-accent-gold" />
              <span>Akademi &amp; Dönüşümcü Programlar</span>
            </div>
            <h1 className="mb-6 font-headline-lg text-headline-lg font-medium tracking-tight text-primary">
              Bilinçaltı &amp; Dişil{" "}
              <span className="italic font-normal text-burgundy-light">Dönüşüm Eğitimleri</span>
            </h1>
            <p className="max-w-2xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
              İçsel yaraların, dişil enerjinin ve ruh arınmasının hedeflendiği özel
              atölyeler; canlı seanslarla desteklenen dönemsel programlar ve
              kişisel gelişiminize özel tasarlanmış özgün içerikler bir arada.
            </p>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <div
                className="flex flex-col items-center gap-2 rounded-2xl border border-border-delicate bg-canvas-pure/80 px-4 py-5 text-center shadow-sm"
                key={feature.title}
              >
                <feature.icon className="size-5 text-primary-container" />
                <p className="font-title-sm text-title-sm font-semibold text-primary">
                  {feature.title}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="w-full space-y-16 py-16">
        {query.isPending && (
          <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-8 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((index) => (
              <div
                className="flex flex-col gap-5 rounded-3xl border border-border-delicate bg-canvas-pure p-6"
                key={index}
              >
                <div className="h-44 w-full animate-pulse rounded-2xl bg-surface-container-highest" />
                <div className="h-5 w-3/4 animate-pulse rounded-full bg-surface-container-highest" />
                <div className="h-4 w-full animate-pulse rounded-full bg-surface-container-highest" />
                <div className="mt-3 h-9 w-32 animate-pulse rounded-xl bg-surface-container-highest" />
              </div>
            ))}
          </div>
        )}

        {query.isError && (
          <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-14 text-center">
              <CircleAlert className="size-7 text-destructive" />
              <p className="font-body-md text-body-md text-on-surface-variant">
                Eğitimler yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
              </p>
            </div>
          </div>
        )}

        {query.isSuccess && courses.length === 0 && (
          <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-14 text-center">
              <PackageOpen className="size-8 text-accent-gold" />
              <p className="font-title-md text-title-md font-semibold text-primary">
                Şu anda kayıta açık eğitim bulunmuyor
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Yeni eğitim dönemleri için kısa süre içinde tekrar ziyaret edin.
              </p>
            </div>
          </div>
        )}

        {courses.length > 0 && (
          <>
            {featured && <FeaturedCourse course={featured} />}
            <section className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
              <SectionHeading
                align="center"
                description="Her biri özel çalışma kitapları, canlı veya arşiv ders kayıtları ve akademi sertifikası içeren dönüştürücü eğitim yolculukları."
                eyebrow="Kapsamlı Akademi Programları &amp; Atölyeler"
                icon={GraduationCap}
                pill
                title="Tüm Eğitimler &amp; Atölyeler"
              />
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {rest.map((course) => (
                  <CourseGridCard course={course} key={course.id} />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </ServicesPageShell>
  );
}
