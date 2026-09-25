"use client";

import { RequireRole } from "@/components/require-role";
import { CourseCreatePage } from "@/components/courses/course-create-page";

export default function AdminNewCoursePage() {
  return (
    <RequireRole role="ADMIN">
      <CourseCreatePage />
    </RequireRole>
  );
}
