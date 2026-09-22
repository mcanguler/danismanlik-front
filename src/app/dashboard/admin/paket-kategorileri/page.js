"use client";

import { RequireRole } from "@/components/require-role";
import { ServicePackageCategoriesManager } from "@/components/service-packages/service-package-categories-manager";

export default function AdminPackageCategoriesPage() {
  return (
    <RequireRole role="ADMIN">
      <ServicePackageCategoriesManager />
    </RequireRole>
  );
}
