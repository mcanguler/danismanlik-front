"use client";

import Link from "next/link";
import {
  CalendarDays,
  CircleAlert,
  CreditCard,
  LoaderCircle,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ORDER_ITEM_TYPE_LABELS,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_BADGE_CLASSES,
  PAYMENT_STATUS_LABELS,
  useOrderQuery,
} from "@/lib/orders";
import { formatDateTimeTr, formatPrice } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { cn } from "@/lib/utils";

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

function PaymentStatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        PAYMENT_STATUS_BADGE_CLASSES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {PAYMENT_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function OrderStatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        ORDER_STATUS_BADGE_CLASSES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function MyOrderDetail({ orderId }) {
  const query = useOrderQuery(orderId);
  const order = query.data;

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="flex justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (query.isError) {
    const isNotFound = query.error?.status === 404;
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
          <CircleAlert className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">
            {isNotFound ? "Sipariş bulunamadı" : "Sipariş yüklenemedi"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isNotFound
              ? "Aradığınız sipariş mevcut değil veya hesabınıza ait olmayabilir."
              : getQueryErrorMessage(query.error)}
          </p>
          <Button render={<Link href="/dashboard/customer/siparislerim" />} variant="outline">
            Siparişlerime Dön
          </Button>
        </div>
      </div>
    );
  }

  const isPending = order.status === "PENDING";

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/dashboard/customer/siparislerim"
        >
          ← Siparişlerim
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-xl font-semibold tracking-tight">
            {order.orderNo}
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {formatDateTimeTr(order.createdAt)}
        </p>
      </div>

      {isPending && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="text-sm text-muted-foreground">
            Bu sipariş için ödeme bekleniyor.
          </p>
          <Button render={<Link href={`/odeme/${order.id}`} />}>
            <CreditCard className="size-4" />
            Ödemeyi Tamamla
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sipariş Kalemleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(order.items ?? []).map((item) => {
              const metadata = item.metadata ?? {};
              return (
                <div
                  className="rounded-xl border p-4"
                  key={item.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {ORDER_ITEM_TYPE_LABELS[item.itemType] ?? item.itemType}{" "}
                        · {item.quantity} adet · Birim{" "}
                        {formatPrice(item.unit_price)}
                      </p>
                    </div>
                    <span className="whitespace-nowrap text-sm font-semibold">
                      {formatPrice(item.total_price)}
                    </span>
                  </div>
                  {item.itemType === "APPOINTMENT" && metadata.start_at && (
                    <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="size-3.5" />
                      {formatDateTimeTr(metadata.start_at)}
                    </p>
                  )}
                  {item.itemType === "SERVICE_PACKAGE" && metadata.slug && (
                    <Link
                      className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary underline underline-offset-4"
                      href={`/paketler/${metadata.slug}`}
                    >
                      <Package className="size-3.5" />
                      Paketi Görüntüle
                    </Link>
                  )}
                </div>
              );
            })}
            <div className="flex justify-between border-t pt-3 text-sm font-semibold">
              <span>Toplam Tutar</span>
              <span>
                {formatPrice(order.totalAmount)} {order.currency}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ödeme Durumu</CardTitle>
          </CardHeader>
          <CardContent>
            {(order.payments ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Bu sipariş için henüz ödeme başlatılmamış
              </p>
            ) : (
              <div className="divide-y">
                {(order.payments ?? []).map((payment) => (
                  <div className="py-3" key={payment.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {payment.merchant_oid}
                      </p>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          PAYMENT_STATUS_BADGE_CLASSES[payment.status] ??
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
                      </span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                      <span>
                        {formatPrice(payment.amount)} {payment.currency}
                      </span>
                      <span>Sağlayıcı: {payment.provider}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
