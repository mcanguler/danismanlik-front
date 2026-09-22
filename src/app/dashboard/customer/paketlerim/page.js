"use client";

import { RequireRole } from "@/components/require-role";
import { MyServicePackages } from "@/components/service-packages/my-service-packages";

export default function MyPackagesPage() {
  return (
    <RequireRole role="CUSTOMER">
      <MyServicePackages />
    </RequireRole>
  );
}
