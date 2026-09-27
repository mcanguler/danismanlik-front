"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { BreakEditPage } from "@/components/breaks/break-form-page";

export default function AdminBreakEditRoutePage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <BreakEditPage id={id} />
    </RequireRole>
  );
}
