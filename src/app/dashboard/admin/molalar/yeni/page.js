"use client";

import { RequireRole } from "@/components/require-role";
import { BreakCreatePage } from "@/components/breaks/break-form-page";

export default function AdminNewBreakPage() {
  return (
    <RequireRole role="ADMIN">
      <BreakCreatePage />
    </RequireRole>
  );
}
