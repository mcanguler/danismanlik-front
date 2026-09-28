"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantBlockedTimeCreatePage } from "@/components/consultant/consultant-blocked-times";

export default function ConsultantNewBlockedTimePage() {
  return (
    <RequireRole role="CONSULTANT">
      <ConsultantBlockedTimeCreatePage />
    </RequireRole>
  );
}
