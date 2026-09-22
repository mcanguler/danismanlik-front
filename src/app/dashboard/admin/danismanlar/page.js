"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantsManager } from "@/components/consultants/consultants-manager";

export default function AdminConsultantsPage() {
  return (
    <RequireRole role="ADMIN">
      <ConsultantsManager />
    </RequireRole>
  );
}