"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantBreakCreatePage } from "@/components/consultant/consultant-breaks";

export default function ConsultantNewBreakPage() {
  return (
    <RequireRole role="CONSULTANT">
      <ConsultantBreakCreatePage />
    </RequireRole>
  );
}
