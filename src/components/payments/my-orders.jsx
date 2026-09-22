"use client";

import Link from "next/link";
import {
  CircleAlert,
  CreditCard,
  LoaderCircle,
  ReceiptText,
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
import {
  ORDER_STATUS_BADGE_CLASSES,
  ORDER_STATUS_LABELS,
  ORDER_ITEM_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  latestPayment,
  useOrdersQuery,
} from "@/lib/orders";
import { formatDateTimeTr, formatPrice } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { cn } from "@/lib/utils";

function OrderStatusBadge({ order }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        ORDER_STATUS_BADGE_CLASSES[order.status] ??
          "bg-muted text-muted-foreground"
      )}
    >
      {ORDER_STATUS_LABELS[order.status] ?? order.status}
    </span>
  );
}

export function MyOrders() {
  const query = useOrdersQuery();
  const orders = query.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Siparişlerim</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {query.isSuccess ? `${orders.length} sipariş` : "Satın alımlarınız"}
          </p>
        </div>
        <Button render={<Link href="/paketler" />} variant="outline">
          <CreditCard className="size-4" />
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

        {query.isSuccess && orders.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <ReceiptText className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz siparişiniz yok</p>
            <p className="text-sm text-muted-foreground">
              Paket satın aldığınızda siparişleriniz burada listelenir
            </p>
            <Button className="mt-1" render={<Link href="/paketler" />}>
              <CreditCard className="size-4" />
              Paketleri Görüntüle
            </Button>
          </div>
        )}

        {orders.map((order) => {
          const payment = latestPayment(order);
          return (
            <Link
              className="group block rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
              href={`/dashboard/customer/siparislerim/${order.id}`}
              key={order.id}
            >
              <Card className="border-0 shadow-none ring-0 transition-colors group-hover:bg-accent/30">
                <CardHeader>
                  <CardTitle className="font-mono text-sm">
                    {order.orderNo}
                  </CardTitle>
                  <CardDescription>
                    {formatDateTimeTr(order.createdAt)} ·{" "}
                    {(order.items ?? [])
                      .map((item) => item.name)
                      .filter(Boolean)
                      .join(", ")}
                  </CardDescription>
                  <CardAction className="flex flex-col items-end gap-1.5">
                    <OrderStatusBadge order={order} />
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(order.totalAmount)} {order.currency}
                    </span>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>
                      {(order.items ?? [])
                        .map((item) => ORDER_ITEM_TYPE_LABELS[item.itemType])
                        .filter(Boolean)
                        .join(" + ") || "Sipariş"}
                    </span>
                    {payment && (
                      <span>Ödeme: {PAYMENT_STATUS_LABELS[payment.status]}</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
