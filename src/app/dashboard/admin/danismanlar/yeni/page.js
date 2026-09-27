"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantCreatePage } from "@/components/consultants/consultant-form-page";

export default function AdminNewConsultantPage() {
  return (
    <RequireRole role="ADMIN">
      <ConsultantCreatePage />
    </RequireRole>
  );
}
