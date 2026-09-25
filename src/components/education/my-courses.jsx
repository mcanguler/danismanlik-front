/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CircleAlert,
  GraduationCap,
  LoaderCircle,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { cn } from "@/lib/utils";
import { formatDateTr, formatPrice } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import {
  COURSE_ACCESS_SOURCES,
  COURSE_ACCESS_SOURCE_BADGE_CLASSES,
  useCourseSectionsQuery,
  useMyCoursesQuery,
} from "@/lib/courses";

function SourceBadge({ source }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-medium",
        COURSE_ACCESS_SOURCE_BADGE_CLASSES[source] ?? "bg-muted text-muted-foreground"
      )}
    >
      {source === COURSE_ACCESS_SOURCES.PURCHASE ? "Satın Alma" : "Yönetici"}
    </span>
  );
}

function totalLessonCount(sections) {
  return (sections ?? []).reduce((total, section) => total + (section.lessonsCount ?? 0), 0);
}

export function MyCourses() {
  const query = useMyCoursesQuery();
  const accesses = query.data ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div>
        <h1 className="font-headline-md text-headline-md tracking-tight text-primary">
          Eğitimlerim
        </h1>
        <p className="mt-0.5 font-body-md text-body-md text-on-surface-variant">
          {accesses.length > 0
            ? `${accesses.length} eğitime erişiminiz var`
            : "Satın aldığınız ve size atanan eğitimler"}
        </p>
      </div>

      <div className="mt-6">
        {query.isPending && (
          <div className="flex justify-center py-16">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {query.isError && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
            <CircleAlert className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {getQueryErrorMessage(query.error)}
            </p>
            <Button variant="outline" onClick={() => query.refetch()}>
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && accesses.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-14 text-center">
            <GraduationCap className="size-8 text-muted-foreground" />
            <p className="font-title-sm text-title-sm font-medium">
              Henüz erişiminiz olan bir eğitim bulunmuyor.
            </p>
            <p className="text-sm text-muted-foreground">
              Satın aldığınız veya size atanan eğitimler bu sayfada listelenir.
            </p>
            <Button render={<Link href="/egitimler" />} variant="outline">
              Eğitimleri Keşfet
            </Button>
          </div>
        )}

        {query.isSuccess && accesses.length > 0 && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {accesses.map((access) => {
              const course = access.course;
              if (!course) return null;
              return (
                <CourseAccessCard access={access} course={course} key={access.id} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseAccessCard({ access, course }) {
  const sectionsQuery = useCourseSectionsQuery(course.id);
  const lessonCount = totalLessonCount(sectionsQuery.data);
  const sectionCount = sectionsQuery.data?.length ?? 0;

  return (
    <div className="flex overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="relative hidden w-40 shrink-0 bg-muted sm:block">
        {course.image ? (
          <img
            alt={course.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="lazy"
            src={course.image}
          />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <GraduationCap className="size-7" />
          </span>
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <Link
            className="line-clamp-2 font-title-md text-title-md font-semibold text-primary hover:text-burgundy-light"
            href={`/dashboard/egitimlerim/${course.id}`}
          >
            {course.title}
          </Link>
          <SourceBadge source={access.source} />
        </div>
        {course.short_description && (
          <p className="line-clamp-2 font-body-sm text-body-sm text-muted-foreground">
            {course.short_description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Fiyat: {formatPrice(course.effective_price) ?? "—"}</span>
          <span>
            {sectionsQuery.data
              ? `${sectionCount} bölüm · ${lessonCount} ders`
              : "İçerik yükleniyor..."}
          </span>
          {access.expires_at && (
            <span>Erişim bitişi: {formatDateTr(access.expires_at)}</span>
          )}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <StatusBadge active={course.is_active} />
          <Button
            className="h-9 rounded-full"
            render={<Link href={`/dashboard/egitimlerim/${course.id}`} />}
            size="sm"
          >
            <PlayCircle className="size-4" />
            İzle
          </Button>
        </div>
      </div>
    </div>
  );
}
