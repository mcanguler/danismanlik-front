"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { MyOrderDetail } from "@/components/payments/my-order-detail";

export default function MyOrderDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="CUSTOMER">
      <MyOrderDetail orderId={id} />
    </RequireRole>
  );
}
