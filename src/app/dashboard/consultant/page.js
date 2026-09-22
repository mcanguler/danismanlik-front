"use client";

import { RequireRole } from "@/components/require-role";

export default function ConsultantDashboardPage() {
  return (
    <RequireRole role="CONSULTANT">
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Danışman Panosu
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bu alan yalnızca CONSULTANT rolündeki kullanıcılar tarafından
          görülebilir.
        </p>
      </div>
    </RequireRole>
  );
}
