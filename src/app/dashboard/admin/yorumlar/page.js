"use client";

import { RequireRole } from "@/components/require-role";
import { TestimonialsManager } from "@/components/testimonials/testimonials-manager";

export default function AdminTestimonialsPage() {
  return (
    <RequireRole role="ADMIN">
      <TestimonialsManager />
    </RequireRole>
  );
}
