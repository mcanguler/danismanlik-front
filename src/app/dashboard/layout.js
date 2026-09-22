import { RequireAuth } from "@/components/require-auth";
import { AppShell } from "@/components/layout/app-shell";

export default function DashboardLayout({ children }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}