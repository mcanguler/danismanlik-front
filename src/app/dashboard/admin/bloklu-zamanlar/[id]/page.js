"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { BlockedTimeEditPage } from "@/components/blocked-times/blocked-time-form-page";

export default function AdminBlockedTimeEditRoutePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <BlockedTimeEditPage id={id} />
    </RequireRole>
  );
}
