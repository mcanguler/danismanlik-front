"use client";

import { RequireRole } from "@/components/require-role";
import { CustomerServicePackagesManager } from "@/components/service-packages/customer-service-packages-manager";

export default function AdminPackagePurchasesPage() {
  return (
    <RequireRole role="ADMIN">
      <CustomerServicePackagesManager />
    </RequireRole>
  );
}
