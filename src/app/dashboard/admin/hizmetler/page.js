"use client";

import { RequireRole } from "@/components/require-role";
import { ServicesManager } from "@/components/services/services-manager";

export default function AdminServicesPage() {
  return (
    <RequireRole role="ADMIN">
      <ServicesManager />
    </RequireRole>
  );
}