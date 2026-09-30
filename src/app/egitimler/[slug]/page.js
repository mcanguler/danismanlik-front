import { cache } from "react";
import { notFound } from "next/navigation";
import { EducationCourseDetail } from "@/components/education/education-course-detail";
import { fetchPublicCourses } from "@/lib/courses";
import { buildMetadata } from "@/lib/seo";

function resolveCourse(courses, slug) {
  const value = String(slug ?? "").toLowerCase();
  return (
    courses.find((course) => String(course.slug).toLowerCase() === value) ??
    courses.find((course) => String(course.id) === value) ??
    null
  );
}

// generateMetadata ve sayfa aynı isteği paylaşır (istek başına tek fetch).
const loadCoursePage = cache(async (slug) => {
  const courses = await fetchPublicCourses().catch(() => []);
  const course = resolveCourse(courses, slug);
  if (!course) return null;
  return { course, courses };
});

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const data = await loadCoursePage(slug);
  const course = data?.course;
  if (!course) {
    return buildMetadata({ title: "Eğitim Detayı", path: `/egitimler/${slug}` });
  }
  return buildMetadata({
    title: course.seo_title || course.title,
    description:
      course.seo_description ||
      course.short_description ||
      course.description ||
      undefined,
    image: course.image || undefined,
    path: `/egitimler/${course.slug || course.id}`,
  });
}

export default async function EducationCourseDetailRoute({ params }) {
  const { slug } = await params;
  const data = await loadCoursePage(slug);
  if (!data) notFound();

  return (
    <EducationCourseDetail initialCourses={data.courses} slug={slug} />
  );
}
