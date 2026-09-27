"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ServicePackageEditPage } from "@/components/service-packages/service-package-form-page";
import { useServicePackageQuery } from "@/lib/service-packages";

export default function AdminServicePackageDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useServicePackageQuery(id);

  return (
    <RequireRole role="ADMIN">
      <ServicePackageEditPage id={id} query={query} />
    </RequireRole>
  );
}
