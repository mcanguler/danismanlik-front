"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { WorkingHourEditPage } from "@/components/working-hours/working-hour-form-page";

export default function AdminWorkingHourEditRoutePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <WorkingHourEditPage id={id} />
    </RequireRole>
  );
}
