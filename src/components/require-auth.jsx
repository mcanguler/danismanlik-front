"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-hooks";

export function FullPageSpinner() {
  return (
    <div className="flex min-h-dvh flex-1 items-center justify-center">
      <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}

export function RequireAuth({ children }) {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  if (status === "loading") return <FullPageSpinner />;
  if (status === "unauthenticated") return null;

  return children;
}
