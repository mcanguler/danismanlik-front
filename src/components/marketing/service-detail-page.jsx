/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  ChevronRight,
  Headset,
  Info,
  Lock,
  MonitorSmartphone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import {
  usePublicServiceCategoriesQuery,
} from "@/lib/service-categories";
import { usePublicServicesQuery } from "@/lib/services";
import {
  useConsultantServiceOfferingsQuery,
} from "@/lib/consultant-services";
import { formatPrice } from "@/lib/format";
import { ServicesPageShell } from "@/components/marketing/services-page";
import { ServiceBookingWizard } from "@/components/marketing/service-booking-wizard";

function TrustBadges() {
  const badges = [
    {
      icon: ShieldCheck,
      title: "%100 Gizlilik ve Etik",
      description:
        "Tüm görüşmeler uluslararası psikolojik danışmanlık ve gizlilik ilkeleri doğrultusunda gizli tutulur.",
    },
    {
      icon: MonitorSmartphone,
      title: "Zoom & WhatsApp Uyumlu",
      description:
        "Uygulama yüklemeden tek bir tıklama ile telefonunuzdan veya bilgisayarınızdan canlı bağlanın.",
    },
    {
      icon: RefreshCw,
      title: "Esnek Erteleme",
      description:
        "Seans saatine 24 saat kalana dek ek ücret ödemeksizin tarihinizi erteleyebilir ya da iptal edebilirsiniz.",
    },
    {
      icon: Headset,
      title: "Canlı Danışan Destek",
      description:
        "Sorularınız için WhatsApp destek hattımız (+90 506 115 10 10) randevunuz boyunca yanınızda.",
    },
  ];
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
      {badges.map((badge) => (
        <div
          className="p-6 rounded-2xl bg-canvas-pure shadow-sm flex flex-col space-y-3"
          key={badge.title}
        >
          <div className="w-10 h-10 rounded-full bg-blush-surface text-primary-container flex items-center justify-center">
            <badge.icon className="size-5" />
          </div>
          <h4 className="font-title-md text-title-md text-primary font-semibold">
            {badge.title}
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
            {badge.description}
          </p>
        </div>
      ))}
    </section>
  );
}

function ServiceMedia({ src, alt }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-surface-container-low shadow-xl aspect-[4/3]">
      {src && !failed ? (
        <img
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="lazy"
          onError={() => setFailed(true)}
          src={src}
        />
      ) : (
        <div className="absolute inset-0 bg-blush-surface flex items-center justify-center text-primary-container">
          <Sparkles className="size-12" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-primary/30 via-transparent to-transparent pointer-events-none" />
      <div className="absolute bottom-4 left-4 bg-canvas-pure/95 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-md flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
        <div className="flex flex-col">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
            Canlı Birebir
          </span>
          <span className="font-label-md text-label-md text-primary font-semibold">
            Aktif Randevu Takvimi
          </span>
        </div>
      </div>
    </div>
  );
}

export function ServiceDetailPage({ categorySlug, serviceSlug }) {
  const categoriesQuery = usePublicServiceCategoriesQuery();
  const servicesQuery = usePublicServicesQuery();

  const category = useMemo(
    () =>
      (categoriesQuery.data ?? []).find(
        (item) =>
          item.slug === categorySlug || String(item.id) === String(categorySlug)
      ),
    [categoriesQuery.data, categorySlug]
  );

  const service = useMemo(
    () =>
      (servicesQuery.data ?? []).find(
        (item) =>
          item.slug === serviceSlug || String(item.id) === String(serviceSlug)
      ),
    [servicesQuery.data, serviceSlug]
  );

  const offeringsQuery = useConsultantServiceOfferingsQuery(
    service ? service.id : undefined
  );
  const offerings = offeringsQuery.data ?? [];
  const singleOffering = offerings.length === 1 ? offerings[0] : null;

  const description =
    service?.seo_description?.trim() ||
    service?.description?.trim() ||
    "Uzmanınız Sümeyra Aydın ile birebir gerçekleşen, tamamen size özel hazırlanan dönüşüm seansı.";

  return (
    <ServicesPageShell>
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
        <nav className="flex flex-wrap items-center gap-2 text-body-sm font-body-sm text-on-surface-variant">
          <Link className="hover:text-primary-container transition-colors" href="/">
            Anasayfa
          </Link>
          <ChevronRight className="size-3.5 text-outline" />
          <Link className="hover:text-primary-container transition-colors" href="/hizmetler">
            1e1 Seanslar
          </Link>
          {category && (
            <>
              <ChevronRight className="size-3.5 text-outline" />
              <Link
                className="hover:text-primary-container transition-colors"
                href={`/hizmetler/${category.slug || category.id}`}
              >
                {category.name}
              </Link>
            </>
          )}
          {service && (
            <>
              <ChevronRight className="size-3.5 text-outline" />
              <span className="text-primary font-medium">{service.name}</span>
            </>
          )}
        </nav>

        {servicesQuery.isPending && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-6 aspect-[4/3] rounded-2xl bg-surface-container-low animate-pulse" />
            <div className="lg:col-span-6 space-y-4">
              <div className="h-6 w-32 rounded-full bg-surface-container-low animate-pulse" />
              <div className="h-10 w-3/4 rounded-full bg-surface-container-low animate-pulse" />
              <div className="h-5 w-1/2 rounded-full bg-surface-container-low animate-pulse" />
              <div className="h-20 w-full rounded-xl bg-surface-container-low animate-pulse" />
            </div>
          </div>
        )}

        {servicesQuery.isError && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
            <Info className="size-6 text-destructive" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              Hizmet bilgisi yüklenemedi. Lütfen sayfayı yenileyip tekrar
              deneyin.
            </p>
          </div>
        )}

        {servicesQuery.isSuccess && !service && (
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-border-delicate bg-canvas-pure px-4 py-14 text-center">
            <Sparkles className="size-6 text-accent-gold" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              Aradığınız hizmet bulunamadı. Tüm seansları görmek için{" "}
              <Link
                className="text-primary underline underline-offset-4"
                href="/hizmetler"
              >
                buraya tıklayın
              </Link>
              .
            </p>
          </div>
        )}

        {service && (
          <>
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              <div className="lg:col-span-6">
                <ServiceMedia alt={service.name} src={service.image} />
              </div>
              <div className="lg:col-span-6 flex flex-col space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush-surface text-primary-container font-label-sm text-label-sm tracking-[0.14em] uppercase font-bold">
                    <Video className="size-3.5 text-accent-gold" />
                    <span>{category?.name ?? "1E1 SEANSLAR"}</span>
                  </div>
                  <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-medium">
                    {service.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {offeringsQuery.isPending ? (
                      <span className="h-7 w-32 rounded-full bg-surface-container-low animate-pulse block" />
                    ) : singleOffering ? (
                      <>
                        <span className="font-headline-sm text-headline-sm text-primary-container font-semibold">
                          {formatPrice(singleOffering.offering.price)}
                        </span>
                        {singleOffering.offering.duration && (
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            / {singleOffering.offering.duration} Dakika Özel
                            Seans
                          </span>
                        )}
                      </>
                    ) : offerings.length > 1 ? (
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Fiyat, seçeceğiniz danışmana göre belirlenir.
                      </span>
                    ) : null}
                    <span className="ml-0 px-2.5 py-0.5 rounded-full bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm font-semibold">
                      Kişiye Özel
                    </span>
                  </div>
                </div>
                <div className="space-y-4 text-on-surface-variant font-body-md text-body-md leading-relaxed">
                  <p>{description}</p>
                  <p>
                    Randevu gün ve saati geldiğinde uzmanınız{" "}
                    <strong className="text-primary font-semibold">
                      Sümeyra Aydın
                    </strong>{" "}
                    ile birebir görüşme gerçekleştirilmektedir. Randevu günü ve
                    saati geldiğinde sizi arıyor ve güvenli dijital seans
                    odasında seansı başlatıyoruz.
                  </p>
                  <div className="p-4 rounded-xl bg-surface-container-low flex items-start gap-3">
                    <Info className="size-5 text-primary-container flex-shrink-0 mt-0.5" />
                    <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant">
                      <strong className="font-semibold text-primary">
                        Önemli Not:
                      </strong>{" "}
                      Lütfen telefon numaranızı ve WhatsApp bilginizi doğru
                      girdiğinizden emin olunuz. Seans bağlantı linki SMS ve
                      WhatsApp üzerinden iletilecektir.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  {[
                    { icon: BadgeCheck, label: "Uluslararası Etik İlkeler" },
                    { icon: Lock, label: "%100 Danışan Gizliliği" },
                    { icon: Video, label: "Zoom & WhatsApp Destekli" },
                    { icon: RefreshCw, label: "24 Saat Öncesine Kadar İptal" },
                  ].map((item) => (
                    <div
                      className="flex items-center gap-2.5 font-body-sm text-body-sm text-on-surface"
                      key={item.label}
                    >
                      <item.icon className="size-4 text-accent-gold shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <ServiceBookingWizard
              offerings={offerings}
              offeringsPending={offeringsQuery.isPending}
              service={service}
            />
          </>
        )}

        <TrustBadges />
      </div>
    </ServicesPageShell>
  );
}
