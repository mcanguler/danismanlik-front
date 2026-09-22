"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantServicesManager } from "@/components/consultant-services/consultant-services-manager";

export default function AdminConsultantServicesPage() {
  return (
    <RequireRole role="ADMIN">
      <ConsultantServicesManager />
    </RequireRole>
  );
}