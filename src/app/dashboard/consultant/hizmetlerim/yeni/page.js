"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantServiceCreatePage } from "@/components/consultant/consultant-services";

export default function ConsultantNewServicePage() {
  return (
    <RequireRole role="CONSULTANT">
      <ConsultantServiceCreatePage />
    </RequireRole>
  );
}
