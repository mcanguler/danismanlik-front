"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { CourseEditPage } from "@/components/courses/course-edit-page";

export default function AdminCourseDetailPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  return (
    <RequireRole role="ADMIN">
      <CourseEditPage courseId={id} />
    </RequireRole>
  );
}
