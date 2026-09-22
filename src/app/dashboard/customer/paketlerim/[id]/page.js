"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { MyServicePackageDetail } from "@/components/service-packages/my-service-package-detail";

export default function MyPackageDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="CUSTOMER">
      <MyServicePackageDetail id={id} />
    </RequireRole>
  );
}
