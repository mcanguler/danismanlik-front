"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ServicePackageCategoryEditPage } from "@/components/service-packages/service-package-category-form-page";

export default function AdminServicePackageCategoryDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <ServicePackageCategoryEditPage id={id} />
    </RequireRole>
  );
}
