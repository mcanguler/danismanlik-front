"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CircleAlert,
  CircleCheck,
  Clock,
  CreditCard,
  Download,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth-hooks";
import { api, ApiError } from "@/lib/api";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { formatDateTimeTr, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { marketingNavLinks } from "@/lib/marketing-nav";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import {
  ORDER_ITEM_TYPE_LABELS,
  ORDER_STATUSES,
  useOrderDownloadsQuery,
  useOrderQuery,
} from "@/lib/orders";

function sanitizeFileName(value) {
  return (
    String(value ?? "dijital-dosya")
      .replace(/[\\/:*?"<>|]/g, "-")
      .trim() || "dijital-dosya"
  );
}

function ResultShell({ children }) {
  return (
    <div className="w-full flex-1 px-4 py-10">
      <div className="mx-auto flex max-w-xl flex-col items-center gap-5 rounded-[2rem] border border-border-delicate bg-canvas-pure px-6 py-12 text-center shadow-[0_8px_32px_rgba(92,29,36,0.06)] sm:px-8">
        {children}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
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

function OrderSummary({ order }) {
  const items = order?.items ?? [];
  return (
    <div className="mt-2 w-full rounded-2xl border border-border-delicate bg-canvas-pure p-4 text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-xs text-muted-foreground">
            {order?.orderNo ?? "—"}
          </p>
          <p className="mt-1 text-sm font-medium">
            {formatPrice(order?.totalAmount)} {order?.currency ?? "TRY"}
          </p>
        </div>
        <StatusBadge status={order?.status} />
      </div>
      {items.length > 0 && (
        <ul className="mt-3 space-y-2.5 border-t pt-3">
          {items.map((item) => (
            <li
              className="flex items-start justify-between gap-3 text-sm"
              key={item.id}
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  {ORDER_ITEM_TYPE_LABELS[item.itemType] ?? item.itemType} ·{" "}
                  {item.quantity} adet
                  {item.itemType === "APPOINTMENT" && item.metadata?.start_at
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
      )}
    </div>
  );
}

export function OrderResultPage({ orderId, variant = "success" }) {
  const { token } = useAuth();
  const orderQuery = useOrderQuery(orderId, {
    refetchInterval: (query) =>
      query.state.data?.status === ORDER_STATUSES.PENDING ? 4000 : false,
  });
  const order = orderQuery.data;
  const status = order?.status ?? null;
  const [downloadingId, setDownloadingId] = useState(null);

  const downloadsQuery = useOrderDownloadsQuery(orderId, {
    enabled: status === ORDER_STATUSES.PAID,
  });
  const downloads = downloadsQuery.data ?? [];

  const handleDownload = async (download) => {
    setDownloadingId(download.id);
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
      setDownloadingId(null);
    }
  };

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
          {orderQuery.error instanceof ApiError && orderQuery.error.status === 403
            ? "Bu siparişi görüntüleme yetkiniz yok."
            : getQueryErrorMessage(orderQuery.error)}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" onClick={() => orderQuery.refetch()}>
            <RefreshCw className="size-4" />
            Tekrar Dene
          </Button>
          <Button render={<Link href="/dashboard/customer/siparislerim" />}>
            Siparişlerime Git
          </Button>
        </div>
      </ResultShell>
    );
  }

  if (status === ORDER_STATUSES.PAID) {
    return (
      <ResultShell>
        <CircleCheck className="size-14 text-emerald-600" />
        <h1 className="font-headline-sm text-headline-sm tracking-tight text-primary">
          Ödemeniz başarıyla tamamlandı
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Teşekkürler! Satın aldığınız içerikler hesabınıza tanımlandı. Dijital
          ürünlerin indirme bağlantıları kayıtlı e-posta adresinize de
          gönderilir.
        </p>
        <OrderSummary order={order} />

        {downloads.length > 0 && (
          <div className="w-full rounded-2xl border border-border-delicate bg-canvas-pure p-4 text-left">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              İndirilebilir Dosyalar
            </p>
            <div className="space-y-2">
              {downloads.map((download) => (
                <div
                  className="flex items-center justify-between gap-3"
                  key={download.id}
                >
                  <p className="min-w-0 truncate text-sm">{download.title}</p>
                  <Button
                    disabled={downloadingId != null}
                    onClick={() => handleDownload(download)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {downloadingId === download.id ? (
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

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button render={<Link href={`/dashboard/customer/siparislerim/${orderId}`} />}>
            Sipariş Detayı
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

  if (status === ORDER_STATUSES.PENDING) {
    return (
      <ResultShell>
        <Clock className="size-14 text-amber-600" />
        <h1 className="font-headline-sm text-headline-sm tracking-tight text-primary">
          Ödeme durumunuz doğrulanıyor
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          PayTR dönüşü tek başına ödeme onayı değildir; onay sunucularımıza
          ulaştığında bu sayfa otomatik güncellenir. Lütfen bekleyin.
        </p>
        <OrderSummary order={order} />
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button variant="outline" onClick={() => orderQuery.refetch()}>
            <RefreshCw className="size-4" />
            Ödeme Durumunu Kontrol Et
          </Button>
          <Button render={<Link href={`/odeme/${orderId}`} />}>
            <CreditCard className="size-4" />
            Ödeme Sayfasına Dön
          </Button>
        </div>
      </ResultShell>
    );
  }

  // FAILED / CANCELLED / REFUNDED — ve basarisiz sayfasının varsayılanı.
  return (
    <ResultShell>
      <CircleAlert className="size-14 text-destructive" />
      <h1 className="font-headline-sm text-headline-sm tracking-tight text-primary">
        Ödeme tamamlanamadı
      </h1>
      <p className="max-w-md text-sm text-muted-foreground">
        {variant === "success"
          ? "Ödemeniz henüz tamamlanmamış görünüyor. Aşağıdan tekrar deneyebilirsiniz."
          : "Ödeme sırasında bir sorun oluştu ya da işlem iptal edildi. Aşağıdan tekrar deneyebilirsiniz."}
      </p>
      <OrderSummary order={order} />
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button render={<Link href={`/odeme/${orderId}`} />}>
          <CreditCard className="size-4" />
          Tekrar Dene
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

export function OrderResultPageShell({ orderId, variant }) {
  return (
    <RequireAuth>
      <div className="theme-velvet flex min-h-dvh flex-col bg-canvas-cream">
        <SiteHeader links={marketingNavLinks("/odeme")} />
        <main className="w-full flex-1 pt-28">
          <OrderResultPage orderId={orderId} variant={variant} />
        </main>
        <SiteFooter />
      </div>
    </RequireAuth>
  );
}
