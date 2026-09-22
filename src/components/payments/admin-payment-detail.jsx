"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronRight,
  CircleAlert,
  History,
  LoaderCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PAYMENT_LOG_EVENT_LABELS,
  PAYMENT_STATUS_BADGE_CLASSES,
  PAYMENT_STATUS_LABELS,
  useAdminPaymentQuery,
  usePaymentLogsQuery,
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

function PaymentLogRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const hasPayload = log.request_data != null || log.response_data != null;

  return (
    <>
      <TableRow key={log.id}>
        <TableCell className="pl-4 text-sm font-medium">
          {cn(PAYMENT_LOG_EVENT_LABELS[log.event] ?? log.event)}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {log.statusCode ?? "—"}
        </TableCell>
        <TableCell className="max-w-56 text-sm text-muted-foreground">
          <span className="line-clamp-1">{log.message ?? "—"}</span>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {formatDateTimeTr(log.createdAt)}
        </TableCell>
        <TableCell>
          {hasPayload && (
            <Button
              aria-label="Log detayını göster"
              onClick={() => setExpanded((current) => !current)}
              size="icon-sm"
              variant="ghost"
            >
              {expanded ? (
                <ChevronDown className="size-4" />
              ) : (
                <ChevronRight className="size-4" />
              )}
            </Button>
          )}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell className="bg-muted/30" colSpan={5}>
            <div className="grid gap-3 p-2 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-semibold">Request</p>
                <pre className="max-h-56 overflow-auto rounded-lg bg-background p-3 text-xs">
                  {log.request_data
                    ? JSON.stringify(log.request_data, null, 2)
                    : "—"}
                </pre>
              </div>
              <div>
                <p className="mb-1 text-xs font-semibold">Response</p>
                <pre className="max-h-56 overflow-auto rounded-lg bg-background p-3 text-xs">
                  {log.response_data
                    ? JSON.stringify(log.response_data, null, 2)
                    : "—"}
                </pre>
              </div>
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

function PaymentLogs({ paymentId }) {
  const logsQuery = usePaymentLogsQuery({ payment_id: paymentId, per_page: 50 });
  const logs = logsQuery.data?.items ?? [];

  if (logsQuery.isPending) {
    return (
      <div className="flex justify-center py-8">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (logsQuery.isError) {
    return (
      <p className="py-6 text-center text-sm text-destructive">
        {getQueryErrorMessage(logsQuery.error)}
      </p>
    );
  }

  if (logs.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-muted-foreground">
        Bu ödeme için log kaydı yok
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="pl-4">Olay</TableHead>
            <TableHead>Status Code</TableHead>
            <TableHead>Mesaj</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <PaymentLogRow key={log.id} log={log} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function AdminPaymentDetail({ paymentId }) {
  const query = useAdminPaymentQuery(paymentId);
  const payment = query.data;

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
          <p className="text-sm font-medium">Ödeme yüklenemedi</p>
          <p className="text-sm text-muted-foreground">
            {getQueryErrorMessage(query.error)}
          </p>
          <Button render={<Link href="/dashboard/admin/odemeler" />} variant="outline">
            Ödemelere Dön
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
          href="/dashboard/admin/odemeler"
        >
          ← Ödemeler
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-xl font-semibold tracking-tight">
            {payment.merchantOid}
          </h1>
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              PAYMENT_STATUS_BADGE_CLASSES[payment.status] ??
                "bg-muted text-muted-foreground"
            )}
          >
            {PAYMENT_STATUS_LABELS[payment.status] ?? payment.status}
          </span>
          {payment.testMode && (
            <span className="inline-flex items-center rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              Test Modu
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Ödeme Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            <DetailRow
              label="Sipariş No"
              value={
                payment.order?.order_no ? (
                  <Link
                    className="underline underline-offset-4"
                    href={`/dashboard/admin/siparisler/${payment.order.id}`}
                  >
                    {payment.order.order_no}
                  </Link>
                ) : null
              }
            />
            <DetailRow
              label="Tutar"
              value={`${formatPrice(payment.amount) ?? "—"} ${payment.currency}`}
            />
            <DetailRow label="Sağlayıcı" value={payment.provider} />
            <DetailRow label="Ödeme Tipi" value={payment.paymentType} />
            <DetailRow label="Durum" value={PAYMENT_STATUS_LABELS[payment.status]} />
            <DetailRow
              label="Sağlayıcı İşlem No"
              value={payment.provider_transaction_id}
            />
            <DetailRow
              label="Ödeme Tarihi"
              value={formatDateTimeTr(payment.paidAt)}
            />
            <DetailRow
              label="Hata Tarihi"
              value={formatDateTimeTr(payment.failedAt)}
            />
            <DetailRow label="Hata Kodu" value={payment.failureCode} />
            <DetailRow label="Hata Mesajı" value={payment.failureMessage} />
            <DetailRow
              label="Oluşturma"
              value={formatDateTimeTr(payment.createdAt)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-4 text-muted-foreground" />
              Payment Logları
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentLogs paymentId={payment.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
