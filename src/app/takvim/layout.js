import { RequireAuth } from "@/components/require-auth";
import { AppShell } from "@/components/layout/app-shell";

export default function CalendarLayout({ children }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
