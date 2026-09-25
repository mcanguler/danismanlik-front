"use client";

import { RequireRole } from "@/components/require-role";
import { CoursesManager } from "@/components/courses/courses-manager";

export default function AdminCoursesPage() {
  return (
    <RequireRole role="ADMIN">
      <CoursesManager />
    </RequireRole>
  );
}
