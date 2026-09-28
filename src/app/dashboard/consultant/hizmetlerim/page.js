"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantServicesManager } from "@/components/consultant/consultant-services";

export default function ConsultantServicesPage() {
  return (
    <RequireRole role="CONSULTANT">
      <ConsultantServicesManager />
    </RequireRole>
  );
}
