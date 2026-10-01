"use client";

import { EducationCourseCard } from "@/components/education/course-card";

export function CourseCard({ course }) {
  if (!course) return null;
  const normalized = course.effective_price != null
    ? course
    : {
        ...course,
        effective_price: course.effectivePrice ?? course.effective_price,
        short_description: course.short_description ?? course.description,
      };
  return <EducationCourseCard course={normalized} />;
}
