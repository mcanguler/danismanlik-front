"use client";

import { RequireRole } from "@/components/require-role";
import { AppointmentsList } from "@/components/appointments/appointments-list";

export default function ConsultantAppointmentsPage() {
  return (
    <RequireRole role="CONSULTANT">
      <AppointmentsList />
    </RequireRole>
  );
}
