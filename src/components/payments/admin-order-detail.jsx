"use client";

import Link from "next/link";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ORDER_ITEM_TYPE_LABELS,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_BADGE_CLASSES,
  PAYMENT_STATUS_LABELS,
  useAdminOrderQuery,
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

export function AdminOrderDetail({ orderId }) {
  const query = useAdminOrderQuery(orderId);
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
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
          <CircleAlert className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Sipariş yüklenemedi</p>
          <p className="text-sm text-muted-foreground">
            {getQueryErrorMessage(query.error)}
          </p>
          <Button render={<Link href="/dashboard/admin/siparisler" />} variant="outline">
            Siparişlere Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/dashboard/admin/siparisler"
        >
          ← Siparişler
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-xl font-semibold tracking-tight">
            {order.orderNo}
          </h1>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              ORDER_STATUS_BADGE_CLASSES[order.status] ??
                "bg-muted text-muted-foreground"
            )}
          >
            {ORDER_STATUS_LABELS[order.status] ?? order.status}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Sipariş Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <DetailRow label="Kullanıcı" value={order.user?.name} />
            <DetailRow label="E-Posta" value={order.user?.email} />
            <DetailRow label="Sipariş No" value={order.orderNo} />
            <DetailRow
              label="Tarih"
              value={formatDateTimeTr(order.createdAt)}
            />
            <DetailRow label="Para Birimi" value={order.currency} />
            <DetailRow
              label="Toplam Tutar"
              value={formatPrice(order.totalAmount)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sipariş Kalemleri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {(order.items ?? []).map((item) => (
              <div className="rounded-xl border p-4" key={item.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ORDER_ITEM_TYPE_LABELS[item.itemType] ?? item.itemType} ·{" "}
                      {item.quantity} adet · Birim {formatPrice(item.unit_price)}
                      {item.item_id ? ` · ${item.itemType} #${item.item_id}` : ""}
                    </p>
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold">
                    {formatPrice(item.total_price)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ödemeler</CardTitle>
          </CardHeader>
          <CardContent>
            {(order.payments ?? []).length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Bu sipariş için ödeme kaydı yok
              </p>
            ) : (
              <div className="divide-y">
                {(order.payments ?? []).map((payment) => (
                  <div className="flex items-center justify-between gap-3 py-3" key={payment.id}>
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs text-muted-foreground">
                        {payment.merchant_oid}
                      </p>
                      <p className="text-sm font-medium">
                        {formatPrice(payment.amount)}
                      </p>
                    </div>
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
