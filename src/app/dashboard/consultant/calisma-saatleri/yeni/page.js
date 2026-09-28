"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantWorkingHourCreatePage } from "@/components/consultant/consultant-working-hours";

export default function ConsultantNewWorkingHourPage() {
  return (
    <RequireRole role="CONSULTANT">
      <ConsultantWorkingHourCreatePage />
    </RequireRole>
  );
}
