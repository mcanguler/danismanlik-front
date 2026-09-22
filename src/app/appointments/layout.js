import { RequireAuth } from "@/components/require-auth";
import { AppShell } from "@/components/layout/app-shell";

export default function AppointmentsLayout({ children }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
