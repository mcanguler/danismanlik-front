"use client";

import { RequireRole } from "@/components/require-role";
import { ServiceCategoryCreatePage } from "@/components/service-categories/service-category-form-page";

export default function AdminNewServiceCategoryPage() {
  return (
    <RequireRole role="ADMIN">
      <ServiceCategoryCreatePage />
    </RequireRole>
  );
}
