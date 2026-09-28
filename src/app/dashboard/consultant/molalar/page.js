"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantBreaksManager } from "@/components/consultant/consultant-breaks";

export default function ConsultantBreaksPage() {
  return (
    <RequireRole role="CONSULTANT">
      <ConsultantBreaksManager />
    </RequireRole>
  );
}
