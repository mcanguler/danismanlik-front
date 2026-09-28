"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantWorkingHoursManager } from "@/components/consultant/consultant-working-hours";

export default function ConsultantWorkingHoursPage() {
  return (
    <RequireRole role="CONSULTANT">
      <ConsultantWorkingHoursManager />
    </RequireRole>
  );
}
