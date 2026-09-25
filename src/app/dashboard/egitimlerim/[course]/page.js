"use client";

import { useParams } from "next/navigation";
import { RequireAuth } from "@/components/require-auth";
import { CourseWatch } from "@/components/education/course-watch";

export default function CourseWatchPage() {
  const params = useParams();
  const id = Array.isArray(params?.course) ? params.course[0] : params?.course;

  return (
    <RequireAuth>
      <CourseWatch courseId={id} />
    </RequireAuth>
  );
}
