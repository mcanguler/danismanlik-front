"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { PageEditPage } from "@/components/pages/page-form-page";
import { useAdminPageQuery } from "@/lib/pages";

export default function AdminPageDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useAdminPageQuery(id);

  return (
    <RequireRole role="ADMIN">
      <PageEditPage id={id} query={query} />
    </RequireRole>
  );
}
