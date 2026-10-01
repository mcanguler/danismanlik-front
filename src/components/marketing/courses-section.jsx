import { EducationCourseCard } from "@/components/education/course-card";
import { SectionHeading } from "@/components/marketing/section-heading";

function CoursesGridSkeleton({ count = 3 }) {
  return (
    <div className="grid animate-pulse grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <div
          className="overflow-hidden rounded-3xl border border-border-delicate bg-canvas-pure"
          key={index}
        >
          <div className="h-48 bg-surface-container" />
          <div className="flex flex-col gap-3 p-6">
            <div className="h-5 w-3/4 rounded bg-surface-container" />
            <div className="h-3 w-full rounded bg-surface-container" />
            <div className="h-3 w-2/3 rounded bg-surface-container" />
            <div className="mt-3 flex items-center justify-between border-t border-surface-container pt-4">
              <div className="h-4 w-24 rounded bg-surface-container" />
              <div className="h-10 w-28 rounded-full bg-surface-container" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function CoursesSection({ courses, loading = false }) {
  if (loading) {
    return (
      <section className="w-full bg-surface-container-low py-20" id="egitimler">
        <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
          <SectionHeading align="center" title="Eğitimler" />
          <CoursesGridSkeleton count={3} />
        </div>
      </section>
    );
  }

  if (!courses || courses.length === 0) return null;

  return (
    <section className="w-full bg-surface-container-low py-20" id="egitimler">
      <div className="mx-auto max-w-[1320px] px-4 sm:px-6">
        <SectionHeading align="center" title="Eğitimler" />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <EducationCourseCard course={course} key={course.id ?? course.title} />
          ))}
        </div>
      </div>
    </section>
  );
}
