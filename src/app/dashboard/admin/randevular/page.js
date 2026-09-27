"use client";

import { RequireRole } from "@/components/require-role";
import { AdminAppointmentsManager } from "@/components/appointments/admin-appointments-manager";

export default function AdminAppointmentsPage() {
  return (
    <RequireRole role="ADMIN">
      <AdminAppointmentsManager />
    </RequireRole>
  );
}
