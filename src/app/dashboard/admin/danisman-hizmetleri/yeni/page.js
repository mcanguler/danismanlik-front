"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantServiceCreatePage } from "@/components/consultant-services/consultant-service-form-page";

export default function AdminNewConsultantServicePage() {
  return (
    <RequireRole role="ADMIN">
      <ConsultantServiceCreatePage />
    </RequireRole>
  );
}
