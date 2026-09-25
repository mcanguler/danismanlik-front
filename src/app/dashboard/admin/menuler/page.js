"use client";

import { RequireRole } from "@/components/require-role";
import { MenusManager } from "@/components/menus/menus-manager";

export default function AdminMenusPage() {
  return (
    <RequireRole role="ADMIN">
      <MenusManager />
    </RequireRole>
  );
}
