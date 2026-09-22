/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  CircleAlert,
  LoaderCircle,
  Package,
  PackageOpen,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { ServicesPageShell } from "@/components/marketing/services-page";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";
import { toast } from "@/components/ui/toast";
import { ROLES } from "@/lib/auth";
import { useAuth } from "@/lib/auth-hooks";
import { useCreateOrder } from "@/lib/orders";
import {
  packageTotalQuantity,
  usePublicServicePackageQuery,
  usePublicServicePackagesQuery,
} from "@/lib/service-packages";

const CARD_CTA_CLASS =
  "inline-flex items-center justify-center px-7 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold hover:bg-burgundy-light shadow-md transition-all";

function excerpt(text, maxLength = 140) {
  const value = String(text ?? "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function PageHero({ breadcrumb, badge, title, titleAccent, description }) {
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
          {breadcrumb ? (
            <>
              <Link className="hover:text-primary-container transition-colors" href="/paketler">
                Paketler
              </Link>
              <ChevronRight className="size-3.5 text-outline-variant" />
              <span className="text-primary-container font-semibold">{breadcrumb}</span>
            </>
          ) : (
            <span className="text-primary-container font-semibold">Paketler</span>
          )}
        </nav>
        <div className="max-w-3xl flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blush-surface text-primary font-label-sm text-label-sm tracking-[0.14em] uppercase font-bold shadow-sm mb-5">
            <Package className="size-4 text-accent-gold" />
            <span>{badge}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight font-medium mb-6 leading-tight">
            {title}
            {titleAccent && (
              <>
                {" "}
                <br className="hidden sm:inline" />
                <span className="italic font-normal text-burgundy-light">{titleAccent}</span>
              </>
            )}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

function PackageMedia({ alt, src, rounded = "rounded-3xl" }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-surface-container-highest shadow-inner", rounded)}>
      {src && !failed ? (
        <img
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          onError={() => setFailed(true)}
          src={src}
        />
      ) : (
        <div className="absolute inset-0 bg-blush-surface flex items-center justify-center text-primary-container">
          <Package className="size-10" />
        </div>
      )}
    </div>
  );
}

function GridSkeleton({ count = 3 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="flex flex-col gap-6 bg-canvas-pure p-6 sm:p-8 rounded-3xl border border-border-delicate"
          key={index}
        >
          <div className="h-44 w-full rounded-2xl bg-surface-container-highest animate-pulse" />
          <div className="space-y-3">
            <div className="h-5 w-3/4 rounded-full bg-surface-container-highest animate-pulse" />
            <div className="h-4 w-full rounded-full bg-surface-container-highest animate-pulse" />
            <div className="h-9 w-36 rounded-xl bg-surface-container-highest animate-pulse mt-4" />
          </div>
        </div>
      ))}
    </>
  );
}

function GridMessage({ icon: Icon = PackageOpen, children }) {
  return (
    <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-14 text-center">
      <Icon className="size-7 text-accent-gold" />
      <div className="font-body-md text-body-md text-on-surface-variant">{children}</div>
    </div>
  );
}

function ServiceChips({ services }) {
  const list = services ?? [];
  if (list.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((service) => (
        <span
          className="inline-flex items-center gap-1.5 rounded-full bg-blush-surface px-3 py-1 font-label-sm text-label-sm text-primary"
          key={service.id}
        >
          <BadgeCheck className="size-3.5 text-primary-container" />
          <span>{service.name}</span>
          {service.quantity != null && service.quantity > 1 && (
            <span className="font-semibold text-primary-container">×{service.quantity}</span>
          )}
        </span>
      ))}
    </div>
  );
}

function PackageCard({ servicePackage }) {
  const href = `/paketler/${servicePackage.slug || servicePackage.id}`;
  const price = formatPrice(servicePackage.price);
  return (
    <div className="group flex flex-col bg-canvas-pure rounded-3xl border border-border-delicate shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link className="block" href={href}>
        <div className="h-48 w-full relative">
          <PackageMedia alt={servicePackage.name} rounded="rounded-none" src={servicePackage.image} />
          {servicePackage.category && (
            <span className="absolute top-4 left-4 rounded-full bg-canvas-pure/95 px-3 py-1 font-label-sm text-label-sm text-primary shadow-sm">
              {servicePackage.category.name}
            </span>
          )}
        </div>
      </Link>
      <div className="flex flex-col flex-grow p-6 sm:p-7">
        <Link href={href}>
          <h3 className="font-headline-sm text-headline-sm text-primary font-semibold mb-2 hover:text-burgundy-light transition-colors">
            {servicePackage.name}
          </h3>
        </Link>
        {servicePackage.description && (
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">
            {excerpt(servicePackage.seo_description || servicePackage.description, 120)}
          </p>
        )}
        <ServiceChips services={servicePackage.services} />
        <div className="mt-auto pt-6 flex flex-wrap items-center justify-between gap-4">
          {price ? (
            <div className="flex items-baseline gap-1">
              <span className="font-headline-md text-headline-md text-primary font-bold">{price}</span>
            </div>
          ) : (
            <span />
          )}
          <Link className={cn(CARD_CTA_CLASS)} href={href}>
            Paketi İncele
          </Link>
        </div>
      </div>
    </div>
  );
}

function PackageGroupSection({ category, packages }) {
  return (
    <section className="max-w-[1320px] mx-auto px-4 sm:px-6 w-full">
      <div className="flex items-end justify-between gap-4 border-b border-border-delicate pb-4 mb-8">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary font-semibold">
            {category?.name ?? "Diğer Paketler"}
          </h2>
          {category?.description && (
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              {excerpt(category.description, 140)}
            </p>
          )}
        </div>
        <span className="font-label-md text-label-md text-on-surface-variant whitespace-nowrap">
          {packages.length} paket
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((servicePackage) => (
          <PackageCard key={servicePackage.id} servicePackage={servicePackage} />
        ))}
      </div>
    </section>
  );
}

export function ServicePackagesPage() {
  const query = usePublicServicePackagesQuery();

  const groups = useMemo(() => {
    const packages = query.data ?? [];
    const map = new Map();
    for (const servicePackage of packages) {
      const key = servicePackage.category?.id ?? "other";
      if (!map.has(key)) {
        map.set(key, { category: servicePackage.category ?? null, packages: [] });
      }
      map.get(key).packages.push(servicePackage);
    }
    return [...map.values()].sort((a, b) => {
      if (a.category && b.category) return 0;
      if (a.category) return -1;
      return 1;
    });
  }, [query.data]);

  const packages = query.data ?? [];

  console.log(groups)

  return (
    <ServicesPageShell>
      <PageHero
        badge="Avantajlı Seans Paketleri"
        breadcrumb={null}
        description="Düzenli görüşmek isteyen danışanlarımız için hazırlanan paket programları; hem ekonomik hem de dönüşümünüzü kalıcı kılan bütüncül seans içerikleri sunar."
        title="Seans Paketleri &"
        titleAccent="Kampanyalı Programlar"
      />
      <div className="py-16 space-y-16 w-full">
        {query.isPending && (
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <GridSkeleton count={3} />
          </div>
        )}
        {query.isError && (
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
            <GridMessage icon={CircleAlert}>
              Paketler yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
            </GridMessage>
          </div>
        )}
        {query.isSuccess && packages.length === 0 && (
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
            <GridMessage>Şu anda satışta paket bulunmuyor.</GridMessage>
          </div>
        )}
        {groups.map((group) => (
          <PackageGroupSection
            category={group.category}
            key={group.category?.id ?? "other"}
            packages={group.packages}
          />
        ))}
      </div>
    </ServicesPageShell>
  );
}

function PurchasePanel({ servicePackage }) {
  const router = useRouter();
  const { status, user } = useAuth();
  const createOrder = useCreateOrder();
  const [dialogOpen, setDialogOpen] = useState(false);

  const price = formatPrice(servicePackage.price);
  const isCustomer = user?.role === ROLES.CUSTOMER;

  const handleBuyClick = () => {
    if (status === "unauthenticated") {
      toast.add({
        title: "Giriş gerekli",
        description: "Paket satın almak için lütfen giriş yapın.",
        type: "info",
      });
      router.push("/login");
      return;
    }
    if (!isCustomer) {
      toast.add({
        title: "Satın alınamaz",
        description: "Paket satın alma yalnızca müşteri hesaplarıyla yapılabilir.",
        type: "error",
      });
      return;
    }
    setDialogOpen(true);
  };

  const handleConfirmPurchase = () => {
    createOrder.mutate(
      {
        items: [{ item_type: "SERVICE_PACKAGE", item_id: servicePackage.id }],
      },
      {
        onSuccess: (order) => {
          setDialogOpen(false);
          toast.add({
            title: "Sipariş oluşturuldu",
            description: "Güvenli ödeme ekranına yönlendiriliyorsunuz.",
            type: "info",
          });
          router.push(`/odeme/${order.id}`);
        },
        onError: (error) => {
          toast.add({
            title: "Sipariş oluşturulamadı",
            description:
              error?.message ?? "Bir sorun oluştu, lütfen tekrar deneyin.",
            type: "error",
          });
        },
      }
    );
  };

  return (
    <>
      <div className="rounded-2xl border border-border-delicate bg-canvas-pure p-6 shadow-sm flex flex-col gap-4">
        {price && (
          <div>
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary">
              Paket Fiyatı
            </span>
            <div className="font-headline-lg text-headline-lg text-primary font-bold mt-1">
              {price}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
          <span className="flex items-center gap-2">
            <BadgeCheck className="size-4 text-primary-container" />
            Paket içeriğindeki seansları dilediğiniz gibi kullanın
          </span>
          <span className="flex items-center gap-2">
            <CalendarCheck className="size-4 text-primary-container" />
            Randevu alırken &quot;Paketten Kullan&quot; seçeneği
          </span>
          <span className="flex items-center gap-2">
            <Video className="size-4 text-primary-container" />
            Online birebir seanslar
          </span>
          <span className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary-container" />
            Kullanım geçmişi paketinizden takip edilir
          </span>
        </div>
        <Button
          className="h-12 w-full rounded-full text-base"
          disabled={status === "loading" || createOrder.isPending}
          onClick={handleBuyClick}
          type="button"
        >
          {createOrder.isPending ? (
            <>
              <LoaderCircle className="size-4 animate-spin" />
              Yönlendiriliyorsunuz...
            </>
          ) : (
            "Satın Al"
          )}
        </Button>
        {status === "unauthenticated" && (
          <p className="text-center text-xs text-muted-foreground">
            Satın almak için müşteri hesabınızla giriş yapın.
          </p>
        )}
      </div>

      <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Paketi satın al</DialogTitle>
            <DialogDescription>
              &quot;{servicePackage.name}&quot; paketi için {price ?? ""}{" "}
              tutarında sipariş oluşturulacak ve güvenli ödeme ekranına
              yönlendirileceksiniz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              className="h-10"
              onClick={() => setDialogOpen(false)}
              type="button"
              variant="outline"
            >
              Vazgeç
            </Button>
            <Button
              className="h-10"
              disabled={createOrder.isPending}
              onClick={handleConfirmPurchase}
              type="button"
            >
              {createOrder.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {createOrder.isPending ? "Yönlendiriliyorsunuz..." : "Ödemeye Geç"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function ServicePackageDetailPage({ slug }) {
  const query = usePublicServicePackageQuery(slug);
  const servicePackage = query.data;
  const price = formatPrice(servicePackage?.price);
  const totalQuantity = servicePackage ? packageTotalQuantity(servicePackage) : 0;

  return (
    <ServicesPageShell>
      <PageHero
        badge={servicePackage?.category?.name ?? "Seans Paketi"}
        breadcrumb={servicePackage?.name ?? null}
        description={servicePackage?.seo_description?.trim() || servicePackage?.description?.trim() || "Size özel hazırlanan avantajlı seans paketi ile dönüşüm yolculuğunuza hemen başlayın."}
        title={servicePackage?.name ?? "Seans Paketi"}
        titleAccent={servicePackage ? "Avantajlı Paket İçeriği" : undefined}
      />
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pb-20 w-full">
        {query.isPending && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-72 w-full rounded-3xl bg-surface-container-highest animate-pulse" />
              <div className="h-8 w-2/3 rounded-full bg-surface-container-highest animate-pulse" />
              <div className="h-24 w-full rounded-2xl bg-surface-container-highest animate-pulse" />
            </div>
            <div className="h-96 rounded-3xl bg-surface-container-highest animate-pulse" />
          </div>
        )}

        {query.isError && (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-16 text-center">
            <CircleAlert className="size-7 text-destructive" />
            <p className="font-body-md text-body-md text-on-surface-variant">
              Paket yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
            </p>
          </div>
        )}

        {query.isSuccess && !servicePackage && (
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-16 text-center">
            <PackageOpen className="size-8 text-accent-gold" />
            <p className="font-title-md text-title-md text-primary font-semibold">
              Paket bulunamadı
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Aradığınız paket mevcut değil veya satıştan kaldırılmış olabilir.
            </p>
            <Link className={cn(CARD_CTA_CLASS, "mt-2")} href="/paketler">
              Tüm Paketleri Görüntüle
            </Link>
          </div>
        )}

        {servicePackage && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 flex flex-col gap-8">
              <PackageMedia
                alt={servicePackage.name}
                rounded="rounded-3xl"
                src={servicePackage.image}
              />
              <div className="rounded-3xl bg-canvas-pure border border-border-delicate p-6 sm:p-8">
                {servicePackage.category && (
                  <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blush-surface text-primary font-label-sm text-label-sm font-bold mb-4">
                    {servicePackage.category.name}
                  </span>
                )}
                <h2 className="font-headline-md text-headline-md text-primary font-semibold mb-3">
                  Paket İçeriği
                </h2>
                {servicePackage.description ? (
                  <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-line mb-6">
                    {servicePackage.description}
                  </p>
                ) : null}
                {servicePackage.services.length > 0 ? (
                  <ul className="flex flex-col gap-3">
                    {servicePackage.services.map((service) => (
                      <li
                        className="flex items-start justify-between gap-3 rounded-2xl bg-blush-surface/60 px-4 py-3"
                        key={service.id}
                      >
                        <span className="flex items-center gap-2 font-body-md text-body-md text-on-surface">
                          <BadgeCheck className="size-4 text-primary-container shrink-0" />
                          {service.name}
                        </span>
                        <span className="whitespace-nowrap font-label-md text-label-md font-semibold text-primary-container">
                          {service.quantity != null && service.quantity > 1
                            ? `${service.quantity} kullanım`
                            : "1 kullanım"}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Bu paket için tanımlı hizmet bulunmuyor.
                  </p>
                )}
                {servicePackage.services.length > 0 && (
                  <div className="mt-6 flex items-center justify-between rounded-2xl bg-surface-container-low px-4 py-3.5">
                    <span className="font-title-sm text-title-sm text-primary font-semibold">
                      Toplam Paket İçeriği
                    </span>
                    <span className="font-title-sm text-title-sm text-primary-container font-bold">
                      {totalQuantity} seans
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-32 flex flex-col gap-4">
                <div>
                  <h1 className="font-headline-md text-headline-md text-primary font-semibold leading-snug">
                    {servicePackage.name}
                  </h1>
                  {servicePackage.category && (
                    <p className="font-label-md text-label-md text-on-surface-variant mt-1">
                      {servicePackage.category.name}
                    </p>
                  )}
                </div>
                <PurchasePanel servicePackage={servicePackage} />
              </div>
            </div>
          </div>
        )}
      </div>
    </ServicesPageShell>
  );
}
