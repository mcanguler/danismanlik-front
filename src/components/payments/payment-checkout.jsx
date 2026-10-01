"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-hooks";
import {
  BadgeCheck,
  CircleAlert,
  CircleCheck,
  Clock,
  CreditCard,
  Download,
  GraduationCap,
  LoaderCircle,
  Package,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { RequireAuth } from "@/components/require-auth";
import { api, ApiError } from "@/lib/api";
import { useQueryClient } from "@tanstack/react-query";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { formatDateTimeTr, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { marketingNavLinks } from "@/lib/marketing-nav";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  ORDER_ITEM_TYPE_LABELS,
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  invalidatePaymentRelatedQueries,
  latestPayment,
  useCreateOrder,
  useCreateOrderPayment,
  useOrderDownloadsQuery,
  useOrderQuery,
} from "@/lib/orders";

function sanitizeFileName(value) {
  return String(value ?? "dijital-dosya")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim() || "dijital-dosya";
}

function OrderStatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === ORDER_STATUSES.PAID &&
          "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        status === ORDER_STATUSES.PENDING &&
          "bg-amber-500/10 text-amber-600 dark:text-amber-400",
        status === ORDER_STATUSES.FAILED && "bg-destructive/10 text-destructive",
        (status === ORDER_STATUSES.CANCELLED ||
          status === ORDER_STATUSES.REFUNDED) &&
          "bg-muted text-muted-foreground"
      )}
    >
      {status === ORDER_STATUSES.PAID
        ? "Ödendi"
        : status === ORDER_STATUSES.PENDING
          ? "Ödeme Bekleniyor"
          : status === ORDER_STATUSES.FAILED
            ? "Başarısız"
            : status === ORDER_STATUSES.CANCELLED
              ? "İptal Edildi"
              : "İade Edildi"}
    </span>
  );
}

function OrderSummaryCard({ order }) {
  const total = formatPrice(order.totalAmount);
  return (
    <div className="rounded-2xl border border-border-delicate bg-canvas-pure shadow-[0_4px_24px_rgba(92,29,36,0.04)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">
            {order.orderNo}
          </p>
          <p className="mt-1 font-medium">
            {(order.items ?? [])
              .map((item) => item.name)
              .filter(Boolean)
              .join(", ") || "Sipariş"}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
        {(order.items ?? []).map((item) => (
          <div className="flex justify-between gap-3" key={item.id}>
            <span className="truncate">{item.name}</span>
            <span>{formatPrice(item.total_price)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-2 font-medium text-foreground">
          <span>Toplam</span>
          <span className="font-semibold">
            {total ? `${total}` : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}

function PaymentProcessing() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[2rem] border border-border-delicate bg-canvas-pure px-6 py-16 text-center shadow-[0_4px_24px_rgba(92,29,36,0.04)]">
      <LoaderCircle className="size-8 animate-spin text-secondary" />
      <div>
        <p className="font-title-md text-title-md text-on-surface">Ödeme ekranı hazırlanıyor</p>
        <p className="mt-1 text-sm text-on-surface-variant">
          Lütfen sayfayı kapatmayın...
        </p>
      </div>
    </div>
  );
}

function ResultShell({ children }) {
  return (
    <div className="w-full flex-1 px-4 py-10">
      <div className="flex flex-col items-center gap-5 rounded-[2rem] border border-border-delicate bg-canvas-pure px-8 py-14 text-center shadow-[0_8px_32px_rgba(92,29,36,0.06)]">
        {children}
      </div>
    </div>
  );
}

export function PaymentCheckout({ orderId }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { token } = useAuth();
  const invalidatedRef = useRef(false);
  const initiatedRef = useRef(false);
  const [iframeUrl, setIframeUrl] = useState(null);
  const [initError, setInitError] = useState(null);
  const [universalDownloadingId, setUniversalDownloadingId] = useState(null);

  const orderQuery = useOrderQuery(orderId, {
    refetchInterval: (query) =>
      query.state.data?.status === ORDER_STATUSES.PENDING ? 4000 : false,
  });
  const order = orderQuery.data;
  const orderStatus = order?.status ?? null;
  const payment = latestPayment(order);
  const isPendingOrder = orderStatus === ORDER_STATUSES.PENDING;
  const hasAppointmentItem = (order?.items ?? []).some(
    (item) => item.itemType === "APPOINTMENT"
  );
  const hasCourseItem = (order?.items ?? []).some(
    (item) => item.itemType === "COURSE"
  );
  const universalDownloadsQuery = useOrderDownloadsQuery(orderId, {
    enabled: orderStatus === ORDER_STATUSES.PAID,
  });
  const universalDownloads = universalDownloadsQuery.data ?? [];

  const handleUniversalDownload = async (download) => {
    setUniversalDownloadingId(download.id);
    try {
      const blob = await api.downloadOrderFile(token, orderId, download.id);
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = sanitizeFileName(
        download.product?.title
          ? `${download.product.title} - ${download.title}`
          : download.title
      );
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.add({
        title: "Dosya indirilemedi",
        description:
          error instanceof ApiError
            ? error.message
            : "Beklenmeyen bir hata oluştu",
        type: "error",
      });
    } finally {
      setUniversalDownloadingId(null);
    }
  };

  const startPayment = useCreateOrderPayment();
  const createOrder = useCreateOrder();

  const initiate = () => {
    startPayment.mutate(orderId, {
      onSuccess: (result) => {
        setIframeUrl(result.paytr.iframeUrl || null);
        setInitError(null);
      },
      onError: (error) => {
        setIframeUrl(null);
        setInitError(error);
      },
    });
  };

  useEffect(() => {
    if (!isPendingOrder || initiatedRef.current) return;
    initiatedRef.current = true;
    initiate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPendingOrder, orderId]);

  useEffect(() => {
    if (orderStatus !== ORDER_STATUSES.PAID || invalidatedRef.current) return;
    invalidatedRef.current = true;
    invalidatePaymentRelatedQueries(queryClient);
  }, [orderStatus, queryClient]);

  useEffect(() => {
    if (orderStatus !== ORDER_STATUSES.PAID) return;
    toast.add({
      title: "Ödeme başarılı",
      description: hasAppointmentItem
        ? "Randevunuz onaylandı."
        : hasCourseItem
          ? "Eğitiminize erişim sağlandı."
          : "Satın aldığınız paket hesabınıza eklendi.",
      type: "success",
    });
  }, [orderStatus, hasAppointmentItem, hasCourseItem]);

  if (orderQuery.isPending) {
    return (
      <div className="flex justify-center py-20">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (orderQuery.isError) {
    return (
      <ResultShell>
        <CircleAlert className="size-8 text-muted-foreground" />
        <p className="font-medium">Sipariş yüklenemedi</p>
        <p className="text-sm text-muted-foreground">
          {orderQuery.error?.status === 403
            ? "Bu siparişi görüntüleme yetkiniz yok."
            : getQueryErrorMessage(orderQuery.error)}
        </p>
        <Button render={<Link href="/" />} variant="outline">
          Anasayfaya Dön
        </Button>
      </ResultShell>
    );
  }

  if (orderStatus === ORDER_STATUSES.PAID) {
    const items = order?.items ?? [];
    const groups = {
      APPOINTMENT: items.filter((item) => item.itemType === "APPOINTMENT"),
      COURSE: items.filter((item) => item.itemType === "COURSE"),
      SERVICE_PACKAGE: items.filter((item) => item.itemType === "SERVICE_PACKAGE"),
      PRODUCT: items.filter((item) => item.itemType === "PRODUCT"),
    };
    const primaryType =
      groups.APPOINTMENT.length > 0
        ? "APPOINTMENT"
        : groups.COURSE.length > 0
          ? "COURSE"
          : groups.SERVICE_PACKAGE.length > 0
            ? "SERVICE_PACKAGE"
            : "PRODUCT";
    const resultDescription =
      primaryType === "APPOINTMENT"
        ? "Randevunuz onaylandı. Randevu detayları SMS ve WhatsApp üzerinden size iletilecek."
        : primaryType === "COURSE"
          ? "Eğitim kaydınız onaylandı. Eğitim içerikleri hesabınıza tanımlandı."
          : primaryType === "SERVICE_PACKAGE"
            ? "Paketiniz hesabınıza eklendi. Randevu oluştururken paketinizi kullanabilirsiniz."
            : "Satın aldığınız içerikler hesabınıza tanımlandı.";
    return (
      <ResultShell>
        <CircleCheck className="size-14 text-emerald-600" />
        <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight">
          Ödemeniz başarıyla tamamlandı
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {resultDescription}
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 rounded-2xl border border-border-delicate bg-canvas-pure px-5 py-4 text-sm">
          <span className="font-mono text-muted-foreground">
            {order?.orderNo ?? `#${orderId}`}
          </span>
          <span className="font-semibold text-primary">
            {formatPrice(order?.totalAmount)} {order?.currency ?? "TRY"}
          </span>
        </div>
        {items.length > 0 && (
          <div className="mt-3 w-full max-w-md rounded-2xl border border-border-delicate bg-canvas-pure p-4 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Satın Alınan İçerikler
            </p>
            <ul className="space-y-2.5">
              {items.map((item) => (
                <li className="flex items-start justify-between gap-3 text-sm" key={item.id}>
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ORDER_ITEM_TYPE_LABELS[item.itemType] ?? item.itemType} ·{" "}
                      {item.quantity} adet
                      {primaryType === "APPOINTMENT" &&
                        item.itemType === "APPOINTMENT" &&
                        item.metadata?.start_at
                        ? ` · ${formatDateTimeTr(item.metadata.start_at)}`
                        : null}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-sm">
                    {formatPrice(item.total_price)}
                  </span>
                </li>
              ))}
            </ul>
            {universalDownloads.length > 0 && (
              <div className="mt-3 border-t pt-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  İndirilebilir Dosyalar
                </p>
                <div className="space-y-2">
                  {universalDownloads.map((download) => (
                    <div className="flex items-center justify-between gap-3" key={download.id}>
                      <p className="min-w-0 truncate text-sm">
                        {download.title}
                      </p>
                      <Button
                        disabled={universalDownloadingId != null}
                        onClick={() => handleUniversalDownload(download)}
                        size="sm"
                        type="button"
                        variant="outline"
                      >
                        {universalDownloadingId === download.id ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <Download className="size-4" />
                        )}
                        İndir
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {primaryType === "APPOINTMENT" ? (
            <Button render={<Link href="/appointments" />}>
              <BadgeCheck className="size-4" />
              Randevularıma Git
            </Button>
          ) : primaryType === "COURSE" ? (
            <Button render={<Link href={`/egitimler/kayit-onay/${orderId}`} />}>
              <GraduationCap className="size-4" />
              Kayıt Onayım
            </Button>
          ) : primaryType === "SERVICE_PACKAGE" ? (
            <Button render={<Link href="/dashboard/customer/paketlerim" />}>
              <Package className="size-4" />
              Paketlerime Git
            </Button>
          ) : (
            <Button render={<Link href={`/dashboard/customer/siparislerim/${orderId}`} />}>
              <Package className="size-4" />
              Sipariş Detayına Git
            </Button>
          )}
          <Button
            render={<Link href="/dashboard/customer/siparislerim" />}
            variant="outline"
          >
            Siparişlerime Git
          </Button>
        </div>
      </ResultShell>
    );
  }

  if (
    orderStatus === ORDER_STATUSES.FAILED ||
    orderStatus === ORDER_STATUSES.CANCELLED ||
    orderStatus === ORDER_STATUSES.REFUNDED
  ) {
    const failed = orderStatus === ORDER_STATUSES.FAILED;
    const failedPayment = (order.payments ?? []).find(
      (item) => item.status === PAYMENT_STATUSES.FAILED
    );

    const handleRetry = async () => {
      let newOrder;
      try {
        newOrder = await createOrder.mutateAsync({
          items: (order.items ?? []).map((item) => ({
            item_type: item.itemType,
            item_id: item.item_id,
          })),
        });
      } catch (error) {
        toast.add({
          title: "Yeni sipariş oluşturulamadı",
          description: getQueryErrorMessage(error),
          type: "error",
        });
        return;
      }
      try {
        router.push(`/odeme/${newOrder.id}`);
      } catch (error) {
        console.error("Ödeme sayfasına yönlendirilemedi", error);
      }
    };

    return (
      <ResultShell>
        <CircleAlert className="size-14 text-destructive" />
        <h1 className="font-headline-sm text-headline-sm text-primary tracking-tight">
          {failed ? "Ödemeniz gerçekleştirilemedi" : "Sipariş tamamlanmadı"}
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {failed
            ? `Ödeme sırasında bir sorun oluştu${
                failedPayment?.failure_message
                  ? `: ${failedPayment.failure_message}`
                  : ". Lütfen tekrar deneyin."
              }`
            : "Bu sipariş için ödeme tamamlanmadı."}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button disabled={createOrder.isPending} onClick={handleRetry}>
            {createOrder.isPending ? (
              <RefreshCw className="size-4 animate-spin" />
            ) : (
              <CreditCard className="size-4" />
            )}
            {createOrder.isPending ? "Yönlendiriliyorsunuz..." : "Tekrar Öde"}
          </Button>
          <Button
            render={<Link href="/dashboard/customer/siparislerim" />}
            variant="outline"
          >
            Siparişlerime Git
          </Button>
        </div>
      </ResultShell>
    );
  }

  const errorMessage = initError ? getQueryErrorMessage(initError) : null;

  return (
    <div className="w-full flex-1 px-4 py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-headline-md text-headline-md text-primary tracking-tight">Ödeme</h1>

        </div>
      </div>

      <OrderSummaryCard order={order} />

      <div className="mt-4">
        {errorMessage ? (
          <div className="flex flex-col items-center gap-3 rounded-[2rem] border border-destructive/20 bg-canvas-pure px-6 py-10 text-center shadow-[0_2px_12px_rgba(92,29,36,0.03)]">
            <CircleAlert className="size-7 text-destructive" />
            <p className="text-sm font-medium">Ödeme başlatılamadı</p>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
            <Button
              disabled={startPayment.isPending}
              onClick={() => {
                initiatedRef.current = true;
                initiate();
              }}
            >
              {startPayment.isPending ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <CreditCard className="size-4" />
              )}
              Tekrar Dene
            </Button>
          </div>
        ) : startPayment.isPending || !iframeUrl ? (
          <PaymentProcessing />
        ) : (
          <div className="overflow-hidden rounded-[2rem] border border-border-delicate bg-canvas-pure shadow-[0_8px_32px_rgba(92,29,36,0.06)]">
            <iframe
              allow="payment"
              className="h-[600px] w-full border-0 sm:h-[720px]"
              src={iframeUrl}
              title="Güvenli ödeme ekranı"
            />
          </div>
        )}

        {isPendingOrder && !errorMessage && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-border-delicate bg-canvas-pure p-5 shadow-[0_2px_12px_rgba(92,29,36,0.03)]">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <p className="text-sm text-muted-foreground">
                {payment?.status === PAYMENT_STATUSES.PENDING
                  ? "Ödemeniz beklemede. PayTR ekranında işlemi tamamladıktan sonra bu sayfa otomatik güncellenecek. Sekmeyi kapattıysanız bu sayfadan ödemeye devam edebilirsiniz."
                  : "Ödemenizin sonucu kontrol ediliyor..."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                className="h-9"
                onClick={() => orderQuery.refetch()}
                variant="outline"
              >
                <RefreshCw className="size-4" />
                Ödeme Durumunu Kontrol Et
              </Button>
              {iframeUrl && (
                <Button
                  className="h-9"
                  disabled={startPayment.isPending}
                  onClick={() => initiate()}
                  variant="outline"
                >
                  <CreditCard className="size-4" />
                  Ödemeyi Yeniden Başlat
                </Button>
              )}
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" />
              Ödemeniz PayTR altyapısı ile güvenli olarak alınır; kart
              bilgilerimizde saklanmaz.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function PaymentCheckoutPage({ orderId }) {
  return (
    <RequireAuth>
      <div className="theme-velvet bg-canvas-cream min-h-dvh flex flex-col">
        <SiteHeader links={marketingNavLinks("/odeme")} />
        <main className="w-full pt-28 flex-1">
          <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
            <PaymentCheckout orderId={orderId} />
          </div>
        </main>
        <SiteFooter />
      </div>
    </RequireAuth>
  );
}
