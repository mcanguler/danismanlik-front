"use client";

import { RequireRole } from "@/components/require-role";
import { BreaksManager } from "@/components/breaks/breaks-manager";

export default function AdminBreaksPage() {
  return (
    <RequireRole role="ADMIN">
      <BreaksManager />
    </RequireRole>
  );
}