"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { FullPageSpinner } from "@/components/require-auth";
import { marketingNavLinks } from "@/lib/marketing-nav";
import { readRedirectParam, roleHomePath } from "@/lib/auth";
import { useAuth } from "@/lib/auth-hooks";

export default function LoginPage() {
  const { status, user } = useAuth();
  const router = useRouter();
  const [redirect] = useState(() => readRedirectParam());

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirect ?? roleHomePath(user?.role));
    }
  }, [status, user, router, redirect]);

  if (status === "loading") return <FullPageSpinner />;
  if (status === "authenticated") return null;

  return (
    <div className="theme-velvet bg-canvas-cream min-h-dvh flex flex-col">
      <SiteHeader links={marketingNavLinks("/login")} />
      <main className="w-full pt-28 flex-1">
        <div className="mx-auto w-full max-w-lg px-4 py-10 sm:px-6 sm:py-16">
          <LoginForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
