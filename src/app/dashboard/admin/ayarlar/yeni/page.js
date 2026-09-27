"use client";

import { RequireRole } from "@/components/require-role";
import { SettingCreatePage } from "@/components/settings/setting-form-page";

export default function AdminNewSettingPage() {
  return (
    <RequireRole role="ADMIN">
      <SettingCreatePage />
    </RequireRole>
  );
}
