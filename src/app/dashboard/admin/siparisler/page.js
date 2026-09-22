"use client";

import { RequireRole } from "@/components/require-role";
import { AdminOrdersManager } from "@/components/payments/admin-orders-manager";

export default function AdminOrdersPage() {
  return (
    <RequireRole role="ADMIN">
      <AdminOrdersManager />
    </RequireRole>
  );
}
