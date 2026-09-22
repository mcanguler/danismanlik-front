"use client";

import { RequireAuth } from "@/components/require-auth";
import { AppointmentBooking } from "@/components/appointments/appointment-booking";

export default function BookAppointmentPage() {
  return (
    <RequireAuth>
      <AppointmentBooking />
    </RequireAuth>
  );
}
