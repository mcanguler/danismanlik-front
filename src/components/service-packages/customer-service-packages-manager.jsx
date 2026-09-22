"use client";

import { useState } from "react";
import {
  CircleAlert,
  LoaderCircle,
  ReceiptText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PURCHASE_STATUS_BADGE_CLASSES,
  PURCHASE_STATUS_LABELS,
  useCustomerServicePackagesQuery,
} from "@/lib/service-packages";
import { formatDateTr, formatDateTimeTr, formatPrice } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { cn } from "@/lib/utils";

function PurchaseStatusBadge({ status }) {
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

export function CustomerServicePackagesManager() {
  const query = useCustomerServicePackagesQuery();
  const [statusFilter, setStatusFilter] = useState("");

  const purchases = (query.data ?? []).filter((purchase) =>
    statusFilter ? purchase.status === statusFilter : true
  );

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Paket Satın Alımları
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {query.isSuccess ? `${purchases.length} satın alım` : "Müşteri paket satın alımları"}
          </p>
        </div>
        <select
          className="h-10 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          onChange={(event) => setStatusFilter(event.target.value)}
          value={statusFilter}
          aria-label="Durum filtresi"
        >
          <option value="">Tüm durumlar</option>
          {Object.entries(PURCHASE_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4">
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
            <ReceiptText className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Satın alım bulunmuyor</p>
            <p className="text-sm text-muted-foreground">
              Müşteriler paket satın aldığında burada listelenir
            </p>
          </div>
        )}

        {query.isSuccess && purchases.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Müşteri</TableHead>
                    <TableHead>Paket</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Satın Alma</TableHead>
                    <TableHead>Kullanım</TableHead>
                    <TableHead>Durum</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {purchases.map((purchase) => (
                    <TableRow key={purchase.id}>
                      <TableCell className="pl-4 font-medium">
                        {purchase.customer?.name ?? `#${purchase.customer_id}`}
                      </TableCell>
                      <TableCell>
                        {purchase.package?.name ?? `#${purchase.service_package_id}`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {purchase.package?.category?.name || "—"}
                      </TableCell>
                      <TableCell>{formatPrice(purchase.price) ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDateTimeTr(purchase.purchasedAt)}
                        {purchase.expiresAt && (
                          <span className="block text-xs">
                            Son: {formatDateTr(purchase.expiresAt)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {purchase.usedQuantity}/{purchase.totalQuantity}
                        <span className="block text-xs">
                          Kalan: {purchase.remainingQuantity}
                        </span>
                      </TableCell>
                      <TableCell className="pr-4">
                        <PurchaseStatusBadge status={purchase.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {purchases.map((purchase) => (
                <div className="rounded-xl border bg-card p-4" key={purchase.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {purchase.package?.name ?? `#${purchase.service_package_id}`}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {purchase.customer?.name ?? `#${purchase.customer_id}`}
                        {purchase.package?.category
                          ? ` · ${purchase.package.category.name}`
                          : ""}
                      </p>
                    </div>
                    <PurchaseStatusBadge status={purchase.status} />
                  </div>
                  <div className="mt-2 flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <span>{formatPrice(purchase.price) ?? "—"}</span>
                    <span>Satın alma: {formatDateTimeTr(purchase.purchasedAt)}</span>
                    {purchase.expiresAt && (
                      <span>Son kullanım: {formatDateTr(purchase.expiresAt)}</span>
                    )}
                    <span>
                      Kullanım: {purchase.usedQuantity}/{purchase.totalQuantity} ·
                      Kalan: {purchase.remainingQuantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
