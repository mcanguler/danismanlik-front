"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ConsultantBreakEditPage } from "@/components/consultant/consultant-breaks";

export default function ConsultantBreakEditRoutePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="CONSULTANT">
      <ConsultantBreakEditPage id={id} />
    </RequireRole>
  );
}
