"use client";

import { RequireRole } from "@/components/require-role";
import { TestimonialCreatePage } from "@/components/testimonials/testimonial-form-page";

export default function AdminNewTestimonialPage() {
  return (
    <RequireRole role="ADMIN">
      <TestimonialCreatePage />
    </RequireRole>
  );
}
