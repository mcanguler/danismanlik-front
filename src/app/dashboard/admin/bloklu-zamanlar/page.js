"use client";

import { RequireRole } from "@/components/require-role";
import { BlockedTimesManager } from "@/components/blocked-times/blocked-times-manager";

export default function AdminBlockedTimesPage() {
  return (
    <RequireRole role="ADMIN">
      <BlockedTimesManager />
    </RequireRole>
  );
}