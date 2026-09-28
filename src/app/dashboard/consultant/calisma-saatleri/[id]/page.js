"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ConsultantWorkingHourEditPage } from "@/components/consultant/consultant-working-hours";

export default function ConsultantWorkingHourEditRoutePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="CONSULTANT">
      <ConsultantWorkingHourEditPage id={id} />
    </RequireRole>
  );
}
