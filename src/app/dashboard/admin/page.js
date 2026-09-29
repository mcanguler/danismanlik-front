"use client";

import { RequireRole } from "@/components/require-role";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";

export default function AdminDashboardPage() {
  return (
    <RequireRole role="ADMIN">
      <AdminDashboard />
    </RequireRole>
  );
}
