import { ConsultantDetailPage } from "@/components/marketing/consultants-page";

export const metadata = {
  title: "Danışman Detayı | Sümeyra Aydın Akademi & Danışmanlık",
  description:
    "Uzman danışmanımızın özgeçmişi, eğitimi, deneyimi, sertifikaları ve çalışma alanları.",
};

export default async function ConsultantDetailRoute({ params }) {
  const { id } = await params;
  return <ConsultantDetailPage id={id} />;
}
