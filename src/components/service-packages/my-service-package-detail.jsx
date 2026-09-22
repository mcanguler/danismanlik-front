"use client";

import Link from "next/link";
import {
  CircleAlert,
  Clock,
  LoaderCircle,
  Package,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PackageUsageHistory } from "@/components/service-packages/package-usage-history";
import {
  PURCHASE_STATUS_BADGE_CLASSES,
  PURCHASE_STATUS_LABELS,
  packageIsUsable,
  useMyServicePackageQuery,
} from "@/lib/service-packages";
import { formatDateTr, formatDateTimeTr, formatPrice } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { cn } from "@/lib/utils";

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        PURCHASE_STATUS_BADGE_CLASSES[status] ?? "bg-muted text-muted-foreground"
      )}
    >
      {PURCHASE_STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function MyServicePackageDetail({ id }) {
  const query = useMyServicePackageQuery(id);
  const purchase = query.data;
  const pkg = purchase?.package;

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
            {isNotFound ? "Paket bulunamadı" : "Paket yüklenemedi"}
          </p>
          <p className="text-sm text-muted-foreground">
            {isNotFound
              ? "Aradığınız paket mevcut değil veya hesabınıza ait olmayabilir."
              : getQueryErrorMessage(query.error)}
          </p>
          <Button render={<Link href="/dashboard/customer/paketlerim" />} variant="outline">
            Paketlerime Dön
          </Button>
        </div>
      </div>
    );
  }

  const total = purchase.totalQuantity ?? 0;
  const used = purchase.usedQuantity ?? 0;
  const remaining = purchase.remainingQuantity ?? 0;
  const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/dashboard/customer/paketlerim"
        >
          ← Satın Aldığım Paketler
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {pkg?.name ?? `Paket #${purchase.service_package_id}`}
          </h1>
          <StatusBadge status={purchase.status} />
        </div>
        {pkg?.category?.name && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            {pkg.category.name}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="size-4 text-muted-foreground" />
              Satın Alma Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <DetailRow
              label="Satın Alma Tarihi"
              value={formatDateTimeTr(purchase.purchasedAt)}
            />
            <DetailRow label="Satın Alma Fiyatı" value={formatPrice(purchase.price)} />
            <DetailRow
              label="Son Kullanım Tarihi"
              value={
                purchase.expiresAt ? formatDateTr(purchase.expiresAt) : "Süresiz"
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="size-4 text-muted-foreground" />
              Kullanım Durumu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-xl bg-muted/50 px-2 py-3">
                <p className="text-xs text-muted-foreground">Toplam</p>
                <p className="text-lg font-semibold">{total}</p>
              </div>
              <div className="rounded-xl bg-muted/50 px-2 py-3">
                <p className="text-xs text-muted-foreground">Kullanılan</p>
                <p className="text-lg font-semibold">{used}</p>
              </div>
              <div className="rounded-xl bg-muted/50 px-2 py-3">
                <p className="text-xs text-muted-foreground">Kalan</p>
                <p className="text-lg font-semibold text-emerald-600 dark:text-emerald-400">
                  {remaining}
                </p>
              </div>
            </div>
            <Progress className="mt-4 h-2" value={percent} />
            {packageIsUsable(purchase) && (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                <Clock className="size-3.5" />
                Paketiniz aktif; randevu alırken &quot;Paketten Kullan&quot;
                seçebilirsiniz.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paket Hizmetleri</CardTitle>
          </CardHeader>
          <CardContent>
            {purchase.items.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Bu pakette hizmet bulunmuyor
              </p>
            ) : (
              <div className="divide-y">
                {purchase.items.map((item) => (
                  <div className="flex items-center justify-between gap-3 py-3" key={item.id}>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {item.service?.name ?? `Hizmet #${item.service_id ?? "?"}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.used_quantity}/{item.quantity} kullanıldı
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress
                        className="hidden h-1.5 w-24 sm:block"
                        value={
                          item.quantity > 0
                            ? (item.used_quantity / item.quantity) * 100
                            : 0
                        }
                      />
                      <span className="w-16 text-right text-xs font-medium text-muted-foreground">
                        Kalan: {item.remaining_quantity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <PackageUsageHistory purchase={purchase} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
