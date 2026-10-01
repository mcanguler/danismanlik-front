"use client";

import {
  CircleAlert,
  LoaderCircle,
  PackageOpen,
} from "lucide-react";
import { ServicesPageShell } from "@/components/marketing/services-page";
import { EducationCourseCard } from "@/components/education/course-card";
import { usePublicCoursesQuery } from "@/lib/courses";

export function EducationCoursesPage() {
  const query = usePublicCoursesQuery();
  const courses = (query.data ?? []).filter((course) => course.is_active);

  return (
    <ServicesPageShell>
      <div className="flex flex-col gap-16 py-10">
        {query.isPending && (
          <div className="flex justify-center py-16">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {query.isError && (
          <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-14 text-center">
              <CircleAlert className="size-7 text-destructive" />
              <p className="font-body-md text-body-md text-on-surface-variant">
                Eğitimler yüklenemedi. Lütfen sayfayı yenileyip tekrar deneyin.
              </p>
            </div>
          </div>
        )}

        {query.isSuccess && courses.length === 0 && (
          <div className="mx-auto w-full max-w-[1320px] px-4 sm:px-6">
            <div className="flex flex-col items-center gap-3 rounded-3xl border border-border-delicate bg-canvas-pure px-4 py-14 text-center">
              <PackageOpen className="size-8 text-accent-gold" />
              <p className="font-title-md text-title-md font-semibold text-primary">
                Şu anda kayıta açık eğitim bulunmuyor
              </p>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Yeni eğitim dönemleri için kısa süre içinde tekrar ziyaret edin.
              </p>
            </div>
          </div>
        )}

        {courses.length > 0 && (
          <section className="mx-auto w-full max-w-330 px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="font-headline-lg text-headline-lg text-primary tracking-tight">
                Eğitimler
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <EducationCourseCard course={course} key={course.id} />
              ))}
            </div>
          </section>
        )}
      </div>
    </ServicesPageShell>
  );
}
