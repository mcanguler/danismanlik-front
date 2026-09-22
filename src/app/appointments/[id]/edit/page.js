"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { ROLES } from "@/lib/auth";
import { AppointmentEditForm } from "@/components/appointments/appointment-edit-form";

export default function EditAppointmentPage() {
  const params = useParams();
  const id = params?.id;

  return (
    <RequireRole roles={[ROLES.ADMIN, ROLES.CONSULTANT]}>
      <AppointmentEditForm id={id} />
    </RequireRole>
  );
}
