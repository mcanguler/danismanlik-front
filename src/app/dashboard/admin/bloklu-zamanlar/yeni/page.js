"use client";

import { RequireRole } from "@/components/require-role";
import { BlockedTimeCreatePage } from "@/components/blocked-times/blocked-time-form-page";

export default function AdminNewBlockedTimePage() {
  return (
    <RequireRole role="ADMIN">
      <BlockedTimeCreatePage />
    </RequireRole>
  );
}
