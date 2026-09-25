"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CircleAlert,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ALLOWED_ORDER_STATUS_TRANSITIONS,
  ORDER_ITEM_TYPE_LABELS,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_BADGE_CLASSES,
  PAYMENT_STATUS_LABELS,
  useAdminOrderQuery,
  useAdminUpdateOrderStatus,
} from "@/lib/orders";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
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

const STATUS_ACTION_DESCRIPTIONS = {
  PAID: "Ödeme onaylanır ve backend tüm kalemler için teslimatı (kurs erişimi, hizmet paketi, ürün stok işlemleri) hemen çalıştırır.",
  FAILED: "Sipariş başarısız olarak işaretlenir ve bekleyen stok rezervleri serbest bırakılır.",
  CANCELLED: "Sipariş iptal edilir. Bu işlem geri alınamaz.",
  REFUNDED: "Ödeme iade edilir ve backend verilen tüm teslimatları geri alır.",
};

function StatusChangeCard({ order }) {
  const updateStatus = useAdminUpdateOrderStatus();
  const [pendingStatus, setPendingStatus] = useState(null);

  const allowed = ALLOWED_ORDER_STATUS_TRANSITIONS[order.status] ?? [];
  const terminal = allowed.length === 0;

  const applyStatus = () => {
    if (!pendingStatus) return;
    updateStatus.mutate(
      { id: order.id, status: pendingStatus },
      {
        onSuccess: (updated) => {
          toast.add({
            title: "Durum güncellendi",
            description: `Sipariş durumu: ${
              ORDER_STATUS_LABELS[updated.status] ?? updated.status
            }`,
            type: "success",
          });
          setPendingStatus(null);
        },
        onError: (error) => {
          const apiMessage =
            error instanceof ApiError
              ? error.errors?.status?.[0] ?? error.message
              : "Beklenmeyen bir hata oluştu";
          toast.add({
            title: "Durum değiştirilemedi",
            description: apiMessage,
            type: "error",
          });
          setPendingStatus(null);
        },
      }
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Durum Değiştir</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {terminal ? (
          <p className="flex items-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0" />
            Bu sipariş terminal durumda ({ORDER_STATUS_LABELS[order.status] ?? order.status});
            durum artık değiştirilemez.
          </p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {allowed.map((status) => (
                <Button
                  className="h-9"
                  key={status}
                  onClick={() => setPendingStatus(status)}
                  size="sm"
                  type="button"
                  variant={
                    status === "PAID"
                      ? "default"
                      : status === "REFUNDED"
                        ? "outline"
                        : "outline"
                  }
                >
                  {ORDER_STATUS_LABELS[status] ?? status} Yap
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Durum geçişlerini backend belirler; geçersiz geçiş denemelerinde
              API hata mesajı gösterilir.
            </p>
          </>
        )}

        <Dialog
          onOpenChange={(open) => {
            if (!open) setPendingStatus(null);
          }}
          open={Boolean(pendingStatus)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Durumu &quot;{ORDER_STATUS_LABELS[pendingStatus] ?? pendingStatus}&quot;
                yap
              </DialogTitle>
              <DialogDescription>
                {STATUS_ACTION_DESCRIPTIONS[pendingStatus] ?? ""}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                className="h-10"
                disabled={updateStatus.isPending}
                onClick={() => setPendingStatus(null)}
                type="button"
                variant="outline"
              >
                Vazgeç
              </Button>
              <Button
                className="h-10"
                disabled={updateStatus.isPending}
                onClick={applyStatus}
                type="button"
              >
                {updateStatus.isPending && (
                  <LoaderCircle className="size-4 animate-spin" />
                )}
                {updateStatus.isPending
                  ? "Güncelleniyor..."
                  : "Onayla"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

function ItemMetadata({ item }) {
  const metadata = item.metadata;
  if (!metadata || typeof metadata !== "object") return null;

  const sku = metadata.sku;
  const variationId = metadata.variation_id;
  const customFields = Array.isArray(metadata.custom_fields)
    ? metadata.custom_fields
    : [];

  if (!sku && variationId == null && customFields.length === 0) return null;

  return (
    <div className="mt-3 space-y-1.5 border-t pt-3 text-xs text-muted-foreground">
      {sku && (
        <p>
          <span className="font-medium text-foreground">SKU:</span> {sku}
        </p>
      )}
      {variationId != null && (
        <p>
          <span className="font-medium text-foreground">Varyasyon:</span> #
          {variationId}
        </p>
      )}
      {customFields.map((field) => {
        const values = Array.isArray(field.values) ? field.values : [];
        const text =
          values.length > 0
            ? values
                .map((value) =>
                  typeof value === "object" && value !== null
                    ? (value.label ?? value.value ?? JSON.stringify(value))
                    : String(value)
                )
                .join(", ")
            : "—";
        return (
          <p key={field.key}>
            <span className="font-medium text-foreground">{field.name}:</span>{" "}
            {text}
          </p>
        );
      })}
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
                <ItemMetadata item={item} />
              </div>
            ))}
          </CardContent>
        </Card>

        <StatusChangeCard order={order} />

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
