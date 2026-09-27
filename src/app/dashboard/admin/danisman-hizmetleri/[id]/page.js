"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ConsultantServiceEditPage } from "@/components/consultant-services/consultant-service-form-page";

export default function AdminConsultantServiceEditRoutePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <ConsultantServiceEditPage id={id} />
    </RequireRole>
  );
}
