"use client";

import { RequireRole } from "@/components/require-role";
import { ServicePackagesManager } from "@/components/service-packages/service-packages-manager";

export default function AdminPackagesPage() {
  return (
    <RequireRole role="ADMIN">
      <ServicePackagesManager />
    </RequireRole>
  );
}
