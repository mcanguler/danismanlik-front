"use client";

import { RequireRole } from "@/components/require-role";
import { WorkingHoursManager } from "@/components/working-hours/working-hours-manager";

export default function AdminWorkingHoursPage() {
  return (
    <RequireRole role="ADMIN">
      <WorkingHoursManager />
    </RequireRole>
  );
}