"use client";

import { RequireRole } from "@/components/require-role";
import { ServiceCategoriesManager } from "@/components/service-categories/service-categories-manager";

export default function AdminServiceCategoriesPage() {
  return (
    <RequireRole role="ADMIN">
      <ServiceCategoriesManager />
    </RequireRole>
  );
}