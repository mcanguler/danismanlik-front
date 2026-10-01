/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, PlayCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/format";

function excerpt(text, maxLength = 150) {
  const value = String(text ?? "").trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

export function CourseMedia({ alt, src, className }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className={cn("relative overflow-hidden bg-surface-container-highest", className)}>
      {src && !failed ? (
        <img
          alt={alt}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={() => setFailed(true)}
          src={src}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-blush-surface text-primary-container">
          <GraduationCap className="size-10" />
        </div>
      )}
    </div>
  );
}

export function CoursePriceBlock({ course, large = false }) {
  if (course.has_discount) {
    return (
      <div className="flex items-baseline gap-2">
        <span className={cn("font-bold text-primary", large ? "font-headline-md text-headline-md" : "font-headline-sm text-headline-sm")}>
          {formatPrice(course.effective_price)}
        </span>
        <span className="font-body-sm text-body-sm text-outline line-through">
          {formatPrice(course.price)}
        </span>
        <span className="rounded-full bg-accent-gold px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-primary">
          İndirimli
        </span>
      </div>
    );
  }
  return (
    <span className={cn("font-bold text-primary", large ? "font-headline-md text-headline-md" : "font-headline-sm text-headline-sm")}>
      {formatPrice(course.effective_price ?? course.price)}
    </span>
  );
}

export function EducationCourseCard({ course }) {
  const href = `/egitimler/${course.slug || course.id}`;
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-border-delicate bg-canvas-pure shadow-sm hover:shadow-xl transition-all duration-300">
      <Link className="relative block h-48" href={href}>
        <CourseMedia alt={course.title} className="h-full rounded-none" src={course.image} />
      </Link>
      <div className="flex flex-grow flex-col p-6">
        <Link href={href}>
          <h3 className="font-headline-sm text-headline-sm text-primary font-semibold leading-snug hover:text-burgundy-light transition-colors">
            {course.title}
          </h3>
        </Link>
        {course.short_description && (
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant">
            {excerpt(course.short_description, 120)}
          </p>
        )}
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-6">
          <CoursePriceBlock course={course} />
          <Link
            className="inline-flex items-center gap-1.5 rounded-xl bg-blush-surface px-5 py-2 font-label-md text-label-md font-semibold text-primary transition-colors hover:bg-blush-hover"
            href={href}
          >
            <PlayCircle className="size-4" />
            İncele
          </Link>
        </div>
      </div>
    </div>
  );
}
