"use client";

import { RequireRole } from "@/components/require-role";
import { ServicePackageCreatePage } from "@/components/service-packages/service-package-form-page";

export default function AdminNewServicePackagePage() {
  return (
    <RequireRole role="ADMIN">
      <ServicePackageCreatePage />
    </RequireRole>
  );
}
