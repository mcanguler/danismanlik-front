"use client";

import { RequireRole } from "@/components/require-role";
import { PagesManager } from "@/components/pages/pages-manager";

export default function AdminPagesPage() {
  return (
    <RequireRole role="ADMIN">
      <PagesManager />
    </RequireRole>
  );
}
