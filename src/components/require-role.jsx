"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-hooks";
import { roleHomePath } from "@/lib/auth";
import { FullPageSpinner } from "@/components/require-auth";

export function RequireRole({ role, roles, children }) {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/login");
      return;
    }
    if (status === "authenticated") {
      const allowed = roles ?? (role ? [role] : null);
      if (allowed && !allowed.includes(user?.role)) {
        router.replace(roleHomePath(user?.role));
      }
    }
  }, [status, user, role, roles, router]);

  if (status === "loading") return <FullPageSpinner />;
  if (status === "unauthenticated") return null;
  const allowed = roles ?? (role ? [role] : null);
  if (allowed && !allowed.includes(user?.role)) return null;

  return children;
}