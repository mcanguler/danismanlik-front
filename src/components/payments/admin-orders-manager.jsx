"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleAlert, LoaderCircle, ReceiptText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ORDER_ITEM_TYPE_LABELS,
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  useAdminOrdersQuery,
} from "@/lib/orders";
import { formatDateTimeTr, formatPrice } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = [
  "",
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
  "REFUNDED",
];

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

export function AdminOrdersManager() {
  const [filters, setFilters] = useState({
    order_no: "",
    status: "",
    created_from: "",
    created_to: "",
  });
  const [page, setPage] = useState(1);

  const query = useAdminOrdersQuery({
    order_no: filters.order_no,
    status: filters.status,
    created_from: filters.created_from,
    created_to: filters.created_to,
    page,
  });
  const orders = query.data?.items ?? [];
  const meta = query.data?.meta;

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Siparişler</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {meta ? `${meta.total} sipariş` : "Tüm siparişler"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-48 pl-8"
            onChange={(event) => updateFilter("order_no", event.target.value)}
            placeholder="Sipariş no ara"
            type="text"
            value={filters.order_no}
          />
        </div>
        <select
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          onChange={(event) => updateFilter("status", event.target.value)}
          value={filters.status}
          aria-label="Durum filtresi"
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status
                ? ORDER_STATUS_LABELS[status]
                : "Tüm durumlar"}
            </option>
          ))}
        </select>
        <Input
          aria-label="Başlangıç tarihi"
          className="w-40"
          onChange={(event) => updateFilter("created_from", event.target.value)}
          type="date"
          value={filters.created_from}
        />
        <Input
          aria-label="Bitiş tarihi"
          className="w-40"
          onChange={(event) => updateFilter("created_to", event.target.value)}
          type="date"
          value={filters.created_to}
        />
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

        {query.isSuccess && orders.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <ReceiptText className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Sipariş bulunmuyor</p>
            <p className="text-sm text-muted-foreground">
              Filtreleri değiştirerek tekrar arayabilirsiniz
            </p>
          </div>
        )}

        {query.isSuccess && orders.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Sipariş No</TableHead>
                    <TableHead>Kullanıcı</TableHead>
                    <TableHead>Kalemler</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4">Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="pl-4">
                        <Link
                          className="font-mono text-sm font-medium underline-offset-4 hover:underline"
                          href={`/dashboard/admin/siparisler/${order.id}`}
                        >
                          {order.orderNo}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm">
                        {order.user?.name ?? `#${order.user_id}`}
                      </TableCell>
                      <TableCell className="max-w-56 text-sm text-muted-foreground">
                        <span className="line-clamp-1">
                          {(order.items ?? [])
                            .map(
                              (item) =>
                                `${item.name} (${ORDER_ITEM_TYPE_LABELS[item.itemType] ?? item.itemType})`
                            )
                            .join(", ")}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-medium">
                        {formatPrice(order.totalAmount)} {order.currency}
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap pr-4 text-sm text-muted-foreground">
                        {formatDateTimeTr(order.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {orders.map((order) => (
                <Link
                  className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30"
                  href={`/dashboard/admin/siparisler/${order.id}`}
                  key={order.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-medium">
                        {order.orderNo}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {order.user?.name ?? `#${order.user_id}`}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {(order.items ?? [])
                          .map((item) => item.name)
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatPrice(order.totalAmount)} {order.currency}
                    </span>
                    <span>{formatDateTimeTr(order.createdAt)}</span>
                  </div>
                </Link>
              ))}
            </div>

            {meta && meta.lastPage > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button
                  disabled={meta.currentPage <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  size="sm"
                  variant="outline"
                >
                  Önceki
                </Button>
                <span className="text-sm text-muted-foreground">
                  Sayfa {meta.currentPage} / {meta.lastPage}
                </span>
                <Button
                  disabled={meta.currentPage >= meta.lastPage}
                  onClick={() => setPage((current) => current + 1)}
                  size="sm"
                  variant="outline"
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
