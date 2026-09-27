"use client";

import { RequireRole } from "@/components/require-role";
import { PageCreatePage } from "@/components/pages/page-form-page";

export default function AdminNewPagePage() {
  return (
    <RequireRole role="ADMIN">
      <PageCreatePage />
    </RequireRole>
  );
}
