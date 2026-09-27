"use client";

import { RequireRole } from "@/components/require-role";
import { ServicePackageCategoryCreatePage } from "@/components/service-packages/service-package-category-form-page";

export default function AdminNewServicePackageCategoryPage() {
  return (
    <RequireRole role="ADMIN">
      <ServicePackageCategoryCreatePage />
    </RequireRole>
  );
}
