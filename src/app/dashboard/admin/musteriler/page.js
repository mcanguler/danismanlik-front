"use client";

import { RequireRole } from "@/components/require-role";
import { CustomersManager } from "@/components/customers/customers-manager";

export default function AdminCustomersPage() {
  return (
    <RequireRole role="ADMIN">
      <CustomersManager />
    </RequireRole>
  );
}