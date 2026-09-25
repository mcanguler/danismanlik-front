"use client";

import { RequireRole } from "@/components/require-role";
import { AdminOrderCreate } from "@/components/payments/admin-order-create";

export default function AdminNewOrderPage() {
  return (
    <RequireRole role="ADMIN">
      <AdminOrderCreate />
    </RequireRole>
  );
}
