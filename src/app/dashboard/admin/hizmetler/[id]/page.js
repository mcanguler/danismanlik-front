"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ServiceEditPage } from "@/components/services/service-form-page";

export default function AdminServiceDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <ServiceEditPage id={id} />
    </RequireRole>
  );
}
