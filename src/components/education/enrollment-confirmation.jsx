"use client";

import Link from "next/link";
import { BadgeCheck,
  CalendarCheck,
  ChevronRight,
  CircleAlert,
  Clock,
  CreditCard,
  GraduationCap,
  LoaderCircle,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/require-auth";
import { marketingNavLinks } from "@/lib/marketing-nav";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { formatDateTimeTr, formatPrice } from "@/lib/format";
import {
  ORDER_STATUSES,
  useOrderQuery,
} from "@/lib/orders";

function courseItem(order) {
  return (order?.items ?? []).find((item) => item.itemType === "COURSE") ?? null;
}

export function EnrollmentConfirmation({ orderId }) {
  const orderQuery = useOrderQuery(orderId);
  const order = orderQuery.data;
  const item = courseItem(order);
  const isPaid = order?.status === ORDER_STATUSES.PAID;

  return (
    <RequireAuth>
      <div className="theme-velvet min-h-dvh flex flex-col bg-canvas-cream">
        <SiteHeader links={marketingNavLinks("/egitimler")} />
        <main className="w-full flex-1 pt-28">
          <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
            <nav className="mb-6 flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface-variant">
              <Link className="transition-colors hover:text-primary-container" href="/">
                Anasayfa
              </Link>
              <ChevronRight className="size-3.5 text-outline-variant" />
              <Link className="transition-colors hover:text-primary-container" href="/egitimler">
                Eğitimler
              </Link>
              <ChevronRight className="size-3.5 text-outline-variant" />
              <span className="font-semibold text-primary-container">Kayıt Onayı</span>
            </nav>

            {orderQuery.isPending && (
              <div className="flex justify-center py-20">
                <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {orderQuery.isError && (
              <div className="flex flex-col items-center gap-4 rounded-[2rem] border border-border-delicate bg-canvas-pure px-6 py-16 text-center">
                <CircleAlert className="size-8 text-destructive" />
                <p className="font-title-md text-title-md font-semibold text-primary">
                  Kayıt bilgileri yüklenemedi
                </p>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  {getQueryErrorMessage(orderQuery.error)}
                </p>
                <Button render={<Link href="/egitimler" />} variant="outline">
                  Eğitimlere Dön
                </Button>
              </div>
            )}

            {order && (
              <>
                <section className="relative overflow-hidden rounded-[2rem] border border-border-delicate bg-gradient-to-b from-blush-surface/60 via-canvas-pure to-canvas-pure px-6 py-12 text-center shadow-[0_8px_32px_rgba(92,29,36,0.06)] sm:px-10">
                  <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-secondary-container/15 blur-3xl" />
                  <div className="relative z-10 flex flex-col items-center gap-5">
                    <span className="flex size-16 items-center justify-center rounded-full bg-primary-container text-on-primary shadow-md">
                      {isPaid ? (
                        <BadgeCheck className="size-8" />
                      ) : (
                        <Clock className="size-8" />
                      )}
                    </span>
                    <div>
                      <p className="font-label-md text-label-md font-semibold uppercase tracking-[0.1em] text-secondary">
                        Akademi Eğitim Kaydı
                      </p>
                      <h1 className="mt-3 font-headline-md text-headline-md font-medium tracking-tight text-primary">
                        {isPaid
                          ? "Eğitim kaydınız onaylandı"
                          : "Kayıt işleminiz ödemeyi bekliyor"}
                      </h1>
                    </div>
                    <p className="max-w-xl font-body-md text-body-md leading-relaxed text-on-surface-variant">
                      {isPaid
                        ? "Eğitim içeriği hesabınıza tanımlandı. Bölümlere ve derslere Danışan Panelinizdeki Eğitimlerim sayfasından dilediğiniz zaman erişebilirsiniz."
                        : "Kayıt işleminizi tamamlamak için ödemenizi bekliyor. Ödeme tamamlandığında eğitim içerikleri hesabınıza açılacaktır."}
                    </p>

                    <div className="grid w-full grid-cols-2 gap-3 rounded-2xl border border-border-delicate bg-canvas-pure/80 p-4 text-left sm:grid-cols-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                          Kayıt No
                        </span>
                        <span className="truncate font-title-sm text-title-sm font-semibold text-primary">
                          {order.orderNo ?? `#${order.id}`}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                          İşlem Tarihi
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface">
                          {order.createdAt ? formatDateTimeTr(order.createdAt) : "—"}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                          Ödeme Tutarı
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface">
                          {formatPrice(order.totalAmount)} {order.currency === "TRY" ? "(Kredi Kartı)" : ""}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-label-sm text-label-sm font-semibold uppercase tracking-wider text-secondary">
                          Kayıt Durumu
                        </span>
                        <span
                          className={
                            isPaid
                              ? "inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-label-sm text-label-sm font-medium text-emerald-600 dark:text-emerald-400"
                              : "inline-flex w-fit items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-label-sm text-label-sm font-medium text-amber-600 dark:text-amber-400"
                          }
                        >
                          {isPaid ? "Kesin Kayıt Onaylandı" : "Ödeme Bekleniyor"}
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="mt-6 grid gap-6 sm:grid-cols-2">
                  <div className="rounded-3xl border border-border-delicate bg-canvas-pure p-6">
                    <div className="mb-4 flex items-center gap-2 font-label-md text-label-md font-semibold uppercase tracking-[0.08em] text-secondary">
                      <GraduationCap className="size-4" />
                      <span>Kaydınız</span>
                    </div>
                    {item ? (
                      <div className="flex flex-col gap-3">
                        <p className="font-title-md text-title-md font-semibold text-primary">
                          {item.name ?? "Eğitim"}
                        </p>
                        {item.total_price != null && (
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Tutar: {formatPrice(item.total_price)}
                          </p>
                        )}
                        <div className="flex flex-col gap-2 pt-2">
                          {isPaid && item.item_id != null ? (
                            <Button
                              className="h-11 rounded-full"
                              render={
                                <Link href={`/dashboard/egitimlerim/${item.item_id}`} />
                              }
                            >
                              <PlayCircle className="size-4" />
                              Eğitimi İzlemeye Başla
                            </Button>
                          ) : null}
                          <Button
                            className="h-11 rounded-full"
                            render={<Link href="/dashboard/egitimlerim" />}
                            variant={isPaid ? "outline" : "default"}
                          >
                            <GraduationCap className="size-4" />
                            Eğitimlerime Git
                          </Button>
                          {!isPaid && (
                            <Button
                              className="h-11 rounded-full"
                              render={<Link href={`/odeme/${orderId}`} />}
                            >
                              <CreditCard className="size-4" />
                              Ödemeye Dön
                            </Button>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="font-body-md text-body-md text-on-surface-variant">
                        Bu siparişte eğitim kaydı bulunmuyor.
                      </p>
                    )}
                  </div>

                  <div className="rounded-3xl border border-border-delicate bg-canvas-pure p-6">
                    <div className="mb-4 flex items-center gap-2 font-label-md text-label-md font-semibold uppercase tracking-[0.08em] text-secondary">
                      <CalendarCheck className="size-4" />
                      <span>Sırada Ne Var?</span>
                    </div>
                    <ol className="flex flex-col gap-4">
                      <li className="flex gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blush-surface font-label-md text-label-md font-bold text-primary">
                          1
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Danışan panelinizde Eğitimlerim sayfasını açın; eğitiminiz
                          orada sizi bekliyor.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blush-surface font-label-md text-label-md font-bold text-primary">
                          2
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          İlk dersinizden başlayarak bölümleri kendi hızınızda
                          tamamlayın.
                        </p>
                      </li>
                      <li className="flex gap-3">
                        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blush-surface font-label-md text-label-md font-bold text-primary">
                          3
                        </span>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Dilediğiniz zaman kaldığınız yerden devam edin; erişim
                          süreniz boyunca içerikler hesabınızda kalır.
                        </p>
                      </li>
                    </ol>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </RequireAuth>
  );
}
