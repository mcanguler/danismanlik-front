"use client";

import { RequireRole } from "@/components/require-role";
import { WorkingHourCreatePage } from "@/components/working-hours/working-hour-form-page";

export default function AdminNewWorkingHourPage() {
  return (
    <RequireRole role="ADMIN">
      <WorkingHourCreatePage />
    </RequireRole>
  );
}
