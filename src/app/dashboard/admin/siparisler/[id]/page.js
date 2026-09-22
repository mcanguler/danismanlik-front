"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { AdminOrderDetail } from "@/components/payments/admin-order-detail";

export default function AdminOrderDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <AdminOrderDetail orderId={id} />
    </RequireRole>
  );
}
