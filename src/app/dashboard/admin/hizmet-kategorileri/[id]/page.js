"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ServiceCategoryEditPage } from "@/components/service-categories/service-category-form-page";

export default function AdminServiceCategoryDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <ServiceCategoryEditPage id={id} />
    </RequireRole>
  );
}
