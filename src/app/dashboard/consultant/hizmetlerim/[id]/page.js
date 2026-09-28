"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ConsultantServiceEditPage } from "@/components/consultant/consultant-services";

export default function ConsultantServiceEditRoutePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="CONSULTANT">
      <ConsultantServiceEditPage id={id} />
    </RequireRole>
  );
}
