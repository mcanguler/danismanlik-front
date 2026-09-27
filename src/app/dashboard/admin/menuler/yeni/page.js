"use client";

import { RequireRole } from "@/components/require-role";
import { MenuCreatePage } from "@/components/menus/menu-form-page";

export default function AdminNewMenuPage() {
  return (
    <RequireRole role="ADMIN">
      <MenuCreatePage />
    </RequireRole>
  );
}
