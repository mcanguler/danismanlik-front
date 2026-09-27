"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { SettingEditPage } from "@/components/settings/setting-form-page";
import { useAdminSettingQuery } from "@/lib/settings";

export default function AdminSettingDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useAdminSettingQuery(id);

  return (
    <RequireRole role="ADMIN">
      <SettingEditPage id={id} query={query} />
    </RequireRole>
  );
}
