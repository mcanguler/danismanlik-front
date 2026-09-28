"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ConsultantBlockedTimeEditPage } from "@/components/consultant/consultant-blocked-times";

export default function ConsultantBlockedTimeEditRoutePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="CONSULTANT">
      <ConsultantBlockedTimeEditPage id={id} />
    </RequireRole>
  );
}
