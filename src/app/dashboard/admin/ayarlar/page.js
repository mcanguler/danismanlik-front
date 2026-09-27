"use client";

import { RequireRole } from "@/components/require-role";
import { SettingsManager } from "@/components/settings/settings-manager";

export default function AdminSettingsPage() {
  return (
    <RequireRole role="ADMIN">
      <SettingsManager />
    </RequireRole>
  );
}
