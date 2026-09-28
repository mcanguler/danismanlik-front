"use client";

import { RequireRole } from "@/components/require-role";
import { ConsultantProfilePage } from "@/components/consultant/consultant-profile";

export default function Page() {
  return (
    <RequireRole role="CONSULTANT">
      <ConsultantProfilePage />
    </RequireRole>
  );
}
