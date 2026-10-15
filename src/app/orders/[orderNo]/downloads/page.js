"use client";

import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/require-auth";
import { AppShell } from "@/components/layout/app-shell";
import { OrderLinkResolver } from "@/components/payments/order-link-resolver";

export default function OrderDownloadsLinkPage() {
  const params = useParams();
  const orderNo = Array.isArray(params?.orderNo) ? params.orderNo[0] : params?.orderNo;

  return (
    <RequireAuth>
      <AppShell>
        <OrderLinkResolver mode="downloads" orderNo={orderNo} />
      </AppShell>
    </RequireAuth>
  );
}
