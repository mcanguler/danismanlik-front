"use client";

import Link from "next/link";
import {
  CircleAlert,
  LoaderCircle,
  Package,
  PackageCheck,
  PackageOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  PURCHASE_STATUS_BADGE_CLASSES,
  PURCHASE_STATUS_LABELS,
  packageIsUsable,
  useMyServicePackagesQuery,
} from "@/lib/service-packages";
import { formatDateTr, formatDateTimeTr, formatPrice } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { cn } from "@/lib/utils";

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

function UsageSummary({ purchase }) {
  const total = purchase.totalQuantity ?? 0;
  const used = purchase.usedQuantity ?? 0;
  const remaining = purchase.remainingQuantity ?? 0;
  const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;

  return (
    <div className="mt-3">
      <Progress className="h-2" value={percent} />
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
        <span>Toplam: {total}</span>
        <span>Kullanılan: {used}</span>
        <span className="font-medium text-foreground">Kalan: {remaining}</span>
      </div>
    </div>
  );
}

export function MyServicePackages() {
  const query = useMyServicePackagesQuery();
  const purchases = query.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Satın Aldığım Paketler
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {purchases.length} paket
          </p>
        </div>
        <Button
          className="h-10"
          render={<Link href="/paketler" />}
          variant="outline"
        >
          <Package className="size-4" />
          Paketleri Keşfet
        </Button>
      </div>

      <div className="mt-4 flex flex-col gap-3">
        {query.isPending && (
          <div className="flex justify-center py-16">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {query.isError && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
            <CircleAlert className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {getQueryErrorMessage(query.error)}
            </p>
            <Button onClick={() => query.refetch()} variant="outline">
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && purchases.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <PackageOpen className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz satın aldığınız paket yok</p>
            <p className="text-sm text-muted-foreground">
              Size uygun bir paket seçip hemen başlayabilirsiniz
            </p>
            <Button className="mt-1 h-10" render={<Link href="/paketler" />}>
              <PackageCheck className="size-4" />
              Paketleri Görüntüle
            </Button>
          </div>
        )}

        {purchases.map((purchase) => {
          const pkg = purchase.package;
          return (
            <Link
              className="group block rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
              href={`/dashboard/customer/paketlerim/${purchase.id}`}
              key={purchase.id}
            >
              <Card className="border-0 shadow-none ring-0 transition-colors group-hover:bg-accent/30">
                <CardHeader>
                  <CardTitle className="text-base">
                    {pkg?.name ?? `Paket #${purchase.service_package_id}`}
                  </CardTitle>
                  <CardDescription>
                    {pkg?.category?.name ?? "Kategori yok"} · Satın alma:{" "}
                    {formatDateTimeTr(purchase.purchasedAt)}
                  </CardDescription>
                  <CardAction className="flex flex-col items-end gap-1.5">
                    <StatusBadge status={purchase.status} />
                    {formatPrice(purchase.price) && (
                      <span className="text-xs text-muted-foreground">
                        {formatPrice(purchase.price)}
                      </span>
                    )}
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
                    {purchase.expiresAt && (
                      <span>Son kullanım: {formatDateTr(purchase.expiresAt)}</span>
                    )}
                    {packageIsUsable(purchase) && (
                      <span className="font-medium text-emerald-600 dark:text-emerald-400">
                        Kullanılabilir
                      </span>
                    )}
                  </div>
                  <UsageSummary purchase={purchase} />
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
