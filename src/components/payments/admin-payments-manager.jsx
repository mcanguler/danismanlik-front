"use client";

import { useState } from "react";
import Link from "next/link";
import { CircleAlert, CreditCard, LoaderCircle, Search } from "lucide-react";
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
  PAYMENT_STATUS_BADGE_CLASSES,
  PAYMENT_STATUS_LABELS,
  useAdminPaymentsQuery,
} from "@/lib/orders";
import { formatDateTimeTr, formatPrice } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { cn } from "@/lib/utils";

const STATUS_OPTIONS = ["", "PENDING", "SUCCESS", "FAILED", "CANCELLED", "REFUNDED"];

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

export function AdminPaymentsManager() {
  const [filters, setFilters] = useState({
    merchant_oid: "",
    status: "",
    created_from: "",
    created_to: "",
  });
  const [page, setPage] = useState(1);

  const query = useAdminPaymentsQuery({
    merchant_oid: filters.merchant_oid,
    status: filters.status,
    created_from: filters.created_from,
    created_to: filters.created_to,
    page,
  });
  const payments = query.data?.items ?? [];
  const meta = query.data?.meta;

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
    setPage(1);
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Ödemeler</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {meta ? `${meta.total} ödeme` : "Tüm ödemeler"}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-56 pl-8"
            onChange={(event) => updateFilter("merchant_oid", event.target.value)}
            placeholder="Merchant OID ara"
            type="text"
            value={filters.merchant_oid}
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
              {status ? PAYMENT_STATUS_LABELS[status] : "Tüm durumlar"}
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

        {query.isSuccess && payments.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <CreditCard className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Ödeme bulunmuyor</p>
            <p className="text-sm text-muted-foreground">
              Filtreleri değiştirerek tekrar arayabilirsiniz
            </p>
          </div>
        )}

        {query.isSuccess && payments.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Merchant OID</TableHead>
                    <TableHead>Sipariş No</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Sağlayıcı</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4">Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="pl-4">
                        <Link
                          className="font-mono text-sm font-medium underline-offset-4 hover:underline"
                          href={`/dashboard/admin/odemeler/${payment.id}`}
                        >
                          {payment.merchantOid}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {payment.order?.order_no ?? "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm font-medium">
                        {formatPrice(payment.amount)} {payment.currency}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.provider}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {payment.paymentType ?? "—"}
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap pr-4 text-sm text-muted-foreground">
                        {formatDateTimeTr(payment.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {payments.map((payment) => (
                <Link
                  className="rounded-xl border bg-card p-4 transition-colors hover:bg-accent/30"
                  href={`/dashboard/admin/odemeler/${payment.id}`}
                  key={payment.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-sm font-medium">
                        {payment.merchantOid}
                      </p>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        {payment.order?.order_no ?? "—"}
                      </p>
                    </div>
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {formatPrice(payment.amount)} {payment.currency}
                    </span>
                    <span>{payment.provider}</span>
                    <span>{payment.paymentType ?? "—"}</span>
                    <span>{formatDateTimeTr(payment.createdAt)}</span>
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
