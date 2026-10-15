"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantDashboard } from "@/components/dashboard/consultant-dashboard";

export default function ConsultantDashboardPage() {
  return (
    <RequireRole role="CONSULTANT">
      <div className="w-full flex-1 px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight">Danışman Panosu</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Randevularınızın ve onay bekleyen taleplerin özeti
        </p>
        <div className="mt-5">
          <ConsultantDashboard />
        </div>
      </div>
    </RequireRole>
  );
}
