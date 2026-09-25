"use client";

import { RequireAuth } from "@/components/require-auth";
import { MyCourses } from "@/components/education/my-courses";

export default function MyCoursesPage() {
  return (
    <RequireAuth>
      <MyCourses />
    </RequireAuth>
  );
}
