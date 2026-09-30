"use client";

import { RequireRole } from "@/components/require-role";
import { ContractTemplateCreatePage } from "@/components/contracts/contract-form-page";

export default function AdminNewContractPage() {
  return (
    <RequireRole role="ADMIN">
      <ContractTemplateCreatePage />
    </RequireRole>
  );
}
