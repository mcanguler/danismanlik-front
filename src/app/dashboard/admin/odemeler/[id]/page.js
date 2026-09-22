"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { AdminPaymentDetail } from "@/components/payments/admin-payment-detail";

export default function AdminPaymentDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <AdminPaymentDetail paymentId={id} />
    </RequireRole>
  );
}
