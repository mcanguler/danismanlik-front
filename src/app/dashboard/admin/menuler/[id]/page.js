"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { MenuItemsEditor } from "@/components/menus/menu-items-editor";

export default function AdminMenuItemsPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <MenuItemsEditor menuId={id} />
    </RequireRole>
  );
}
