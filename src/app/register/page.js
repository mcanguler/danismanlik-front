"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterForm } from "@/components/auth/register-form";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { FullPageSpinner } from "@/components/require-auth";
import { marketingNavLinks } from "@/lib/marketing-nav";
import { roleHomePath } from "@/lib/auth";
import { useAuth } from "@/lib/auth-hooks";

export default function RegisterPage() {
  const { status, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(roleHomePath(user?.role));
    }
  }, [status, user, router]);

  if (status === "loading") return <FullPageSpinner />;
  if (status === "authenticated") return null;

  return (
    <div className="theme-velvet bg-canvas-cream min-h-dvh flex flex-col">
      <SiteHeader links={marketingNavLinks("/register")} />
      <main className="w-full pt-28 flex-1">
        <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 py-8 sm:py-12">
          <RegisterForm />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
