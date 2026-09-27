"use client";

import { RequireRole } from "@/components/require-role";
import { ServiceCreatePage } from "@/components/services/service-form-page";

export default function AdminNewServicePage() {
  return (
    <RequireRole role="ADMIN">
      <ServiceCreatePage />
    </RequireRole>
  );
}
