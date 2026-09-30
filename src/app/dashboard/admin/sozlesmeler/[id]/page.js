"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ContractTemplateEditPage } from "@/components/contracts/contract-form-page";
import { useAdminContractTemplateQuery } from "@/lib/contracts";

export default function AdminContractDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const query = useAdminContractTemplateQuery(id);

  return (
    <RequireRole role="ADMIN">
      <ContractTemplateEditPage id={id} query={query} />
    </RequireRole>
  );
}
