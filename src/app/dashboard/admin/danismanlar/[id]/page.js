"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ConsultantEditPage } from "@/components/consultants/consultant-form-page";
import { useConsultantQuery } from "@/lib/consultants";

export default function AdminConsultantDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useConsultantQuery(id);

  return (
    <RequireRole role="ADMIN">
      <ConsultantEditPage id={id} query={query} />
    </RequireRole>
  );
}
