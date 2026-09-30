import { EducationCoursesPage } from "@/components/education/education-courses-page";
import { buildMetadata, getSeoSettings } from "@/lib/seo";

export async function generateMetadata() {
  const seo = await getSeoSettings();
  return buildMetadata({
    title: seo.coursesTitle || "Eğitimler & Kamplar",
    description:
      seo.coursesDescription ||
      "Bilinçaltı ve dişil dönüşüm eğitimleri; canlı seanslarla desteklenen akademi programlarını keşfedin ve eğitimlere kaydolun.",
    path: "/egitimler",
  });
}

export default function EducationCoursesRoute() {
  return <EducationCoursesPage />;
}
