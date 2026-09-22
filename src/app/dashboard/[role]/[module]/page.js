"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { findModule, ROLE_SLUGS } from "@/lib/nav";
import { roleHomePath } from "@/lib/auth";

export default function RoleModulePage() {
  const params = useParams();
  const router = useRouter();
  const role = ROLE_SLUGS[params.role];
  const moduleItem = findModule(role, params.module);

  useEffect(() => {
    if (!role) {
      router.replace("/dashboard");
    } else if (!moduleItem) {
      router.replace(roleHomePath(role));
    }
  }, [role, moduleItem, router]);

  if (!role || !moduleItem) return null;

  return (
    <RequireRole role={role}>
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight">{moduleItem.label}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bu modül yakında kullanıma açılacak.
        </p>
      </div>
    </RequireRole>
  );
}
