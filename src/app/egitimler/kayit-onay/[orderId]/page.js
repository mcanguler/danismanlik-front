import { EnrollmentConfirmation } from "@/components/education/enrollment-confirmation";

export const metadata = {
  title: "Kayıt Onayı | Sümeyra Aydın Akademi & Danışmanlık",
};

export default async function EducationEnrollmentConfirmationRoute({
  params,
}) {
  const { orderId } = await params;
  return <EnrollmentConfirmation orderId={orderId} />;
}
