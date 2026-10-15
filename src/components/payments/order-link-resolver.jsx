"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CircleAlert, LoaderCircle, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ORDER_STATUSES, useOrdersQuery } from "@/lib/orders";
import { getQueryErrorMessage } from "@/lib/query-errors";

/**
 * Bildirim e-postalarındaki /orders/{order_no} bağlantılarını karşılar.
 * Siparişi order_no ile bulur; ödeme bekleniyorsa /odeme/{id} sayfasına,
 * aksi halde sipariş detayına yönlendirir.
 */
export function OrderLinkResolver({ orderNo, mode = "auto" }) {
  const router = useRouter();
  const query = useOrdersQuery();
  const orders = query.data ?? [];
  const order = orders.find((item) => String(item.orderNo) === String(orderNo));

  useEffect(() => {
    if (!query.isSuccess || !order) return;
    if (mode === "auto" && order.status === ORDER_STATUSES.PENDING) {
      router.replace(`/odeme/${order.id}`);
      return;
    }
    router.replace(`/dashboard/customer/siparislerim/${order.id}`);
  }, [query.isSuccess, order, mode, router]);

  if (query.isPending || (query.isSuccess && order)) {
    return (
      <div className="flex justify-center py-20">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-20 text-center">
        <CircleAlert className="size-6 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {getQueryErrorMessage(query.error)}
        </p>
        <Button variant="outline" onClick={() => query.refetch()}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-20 text-center">
      <ReceiptText className="size-8 text-muted-foreground" />
      <p className="text-sm font-medium">Sipariş bulunamadı</p>
      <p className="text-sm text-muted-foreground">
        {orderNo} numaralı sipariş hesabınıza tanımlı değil.
      </p>
      <Button render={<Link href="/dashboard/customer/siparislerim" />}>
        Siparişlerime git
      </Button>
    </div>
  );
}
