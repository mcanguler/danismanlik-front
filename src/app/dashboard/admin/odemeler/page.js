"use client";

import { RequireRole } from "@/components/require-role";
import { AdminPaymentsManager } from "@/components/payments/admin-payments-manager";

export default function AdminPaymentsPage() {
  return (
    <RequireRole role="ADMIN">
      <AdminPaymentsManager />
    </RequireRole>
  );
}
