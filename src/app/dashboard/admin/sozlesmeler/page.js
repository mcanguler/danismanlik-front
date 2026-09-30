"use client";

import { RequireRole } from "@/components/require-role";
import { ContractsManager } from "@/components/contracts/contracts-manager";

export default function AdminContractsPage() {
  return (
    <RequireRole role="ADMIN">
      <ContractsManager />
    </RequireRole>
  );
}
