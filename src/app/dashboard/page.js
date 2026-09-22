"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FullPageSpinner } from "@/components/require-auth";
import { roleHomePath } from "@/lib/auth";
import { useAuth } from "@/lib/auth-hooks";

export default function DashboardIndexPage() {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(roleHomePath(user?.role));
    }
  }, [status, user, router]);

  if (status === "loading") return <FullPageSpinner />;

  return null;
}
