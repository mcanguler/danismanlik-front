"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantBlockedTimesManager } from "@/components/consultant/consultant-blocked-times";

export default function ConsultantBlockedTimesPage() {
  return (
    <RequireRole role="CONSULTANT">
      <ConsultantBlockedTimesManager />
    </RequireRole>
  );
}
