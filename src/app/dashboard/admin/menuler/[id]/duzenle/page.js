"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { MenuEditPage } from "@/components/menus/menu-form-page";
import { useAdminMenuQuery } from "@/lib/menus";

export default function AdminMenuEditPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useAdminMenuQuery(id);

  return (
    <RequireRole role="ADMIN">
      <MenuEditPage id={id} query={query} />
    </RequireRole>
  );
}
