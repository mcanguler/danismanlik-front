import { EducationCourseDetail } from "@/components/education/education-course-detail";

export const metadata = {
  title: "Eğitim Detayı | Sümeyra Aydın Akademi & Danışmanlık",
};

export default async function EducationCourseDetailRoute({ params }) {
  const { slug } = await params;
  return <EducationCourseDetail slug={slug} />;
}
