import { AppointmentBooking } from "@/components/appointments/appointment-booking";

export const metadata = {
  title: "Yeni Randevu | Sümeyra Aydın Akademi & Danışmanlık",
};

export default function NewAppointmentPage() {
  return <AppointmentBooking redirectTo="/appointments" />;
}
