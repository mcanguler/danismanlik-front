import { GraduationCap } from "lucide-react";
import { CourseCard } from "@/components/marketing/course-card";
import { SectionHeading } from "@/components/marketing/section-heading";

export function CoursesSection({ courses }) {
  return (
    <section className="w-full bg-surface-container-low py-20" id="egitimler">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6">
        <SectionHeading
          align="center"
          description="Bilinçaltı kalıplarınızı dönüştüren, canlı seanslarla desteklenen kapsamlı akademi modülleri."
          eyebrow="Akademi Programları"
          icon={GraduationCap}
          pill
          title="Dönüştürücü Online Masterclass & Kamplar"
        />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <CourseCard key={course.title} course={course} />
          ))}
        </div>
      </div>
    </section>
  );
}