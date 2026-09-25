"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  ChevronRight,
  CircleAlert,
  GraduationCap,
  Layers,
  LoaderCircle,
  Lock,
  MonitorPlay,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import {
  formatLessonDuration,
  useCourseQuery,
  useCourseSectionsQuery,
  useLessonQuery,
  useLessonVideoQuery,
} from "@/lib/courses";

function LessonVideoPlayer({ lessonTitle, video }) {
  if (!video) return null;

  if (video.iframeUrl) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl border border-border-delicate bg-black pt-[56.25%]">
        <iframe
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full border-0"
          src={video.iframeUrl}
          title={lessonTitle}
        />
      </div>
    );
  }

  if (video.hlsUrl) {
    return (
      <div className="overflow-hidden rounded-2xl border border-border-delicate bg-black">
        <video className="aspect-video w-full" controls playsInline src={video.hlsUrl} />
      </div>
    );
  }

  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-outline-variant bg-surface-container-low text-center">
      <MonitorPlay className="size-8 text-muted-foreground" />
      <p className="font-title-sm text-title-sm font-medium">
        Video şu anda hazırlanıyor
      </p>
      <p className="max-w-sm font-body-sm text-body-sm text-muted-foreground">
        Ders videosu işleniyor. Kısa süre sonra tekrar deneyin.
      </p>
    </div>
  );
}

function SectionGroup({ section, activeLessonId, onSelectLesson }) {
  const containsActive = (section.lessons ?? []).some(
    (lesson) => lesson.id === activeLessonId
  );
  const [userOpen, setUserOpen] = useState(null);
  const open = userOpen ?? containsActive;

  return (
    <div className="overflow-hidden rounded-2xl border border-border-delicate bg-card">
      <button
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-accent/40"
        onClick={() => setUserOpen(!open)}
        type="button"
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blush-surface text-primary-container">
          <Layers className="size-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-title-sm text-title-sm font-semibold">
            {section.title}
          </span>
          <span className="block font-label-sm text-label-sm text-muted-foreground">
            {section.lessonsCount} ders
          </span>
        </span>
        <ChevronRight
          className={cn(
            "size-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-90"
          )}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-1.5 border-t border-border-delicate p-2.5">
          {section.lessons.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              Bu bölümde henüz ders yok
            </p>
          ) : (
            section.lessons.map((lesson) => {
              const active = activeLessonId === lesson.id;
              const duration = formatLessonDuration(lesson.duration);
              return (
                <button
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left transition-colors",
                    active
                      ? "bg-primary-container text-on-primary"
                      : "hover:bg-accent/40"
                  )}
                  key={lesson.id}
                  onClick={() => onSelectLesson(lesson)}
                  type="button"
                >
                  <PlayCircle className="size-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">
                      {lesson.title}
                    </span>
                    {duration && (
                      <span
                        className={cn(
                          "block text-xs",
                          active ? "text-on-primary/80" : "text-muted-foreground"
                        )}
                      >
                        {duration}
                      </span>
                    )}
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function CourseError({ error }) {
  const router = useRouter();
  const status = error instanceof ApiError ? error.status : null;

  useEffect(() => {
    if (status === 401) {
      toast.add({
        title: "Oturum süresi doldu",
        description: "Devam etmek için lütfen tekrar giriş yapın.",
        type: "info",
      });
      router.replace("/login");
    }
  }, [status, router]);

  if (status === 401) {
    return (
      <div className="flex justify-center py-16">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === 403) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-14 text-center">
        <Lock className="size-8 text-destructive" />
        <p className="font-title-md text-title-md font-medium">
          Bu eğitime erişiminiz yok.
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          Bu eğitimin içeriğini görüntülemek için aktif bir kaydınız bulunmuyor.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
          <Button render={<Link href="/dashboard/egitimlerim" />} variant="outline">
            Eğitimlerime Dön
          </Button>
          <Button render={<Link href="/egitimler" />}>Eğitimleri Keşfet</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
      <CircleAlert className="size-8 text-muted-foreground" />
      <p className="font-title-md text-title-md font-medium">
        Eğitim bulunamadı.
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        Aradığınız eğitim kaldırılmış veya adres hatalı olabilir.
      </p>
      <Button render={<Link href="/dashboard/egitimlerim" />} variant="outline">
        Eğitimlerime Dön
      </Button>
    </div>
  );
}

export function CourseWatch({ courseId }) {
  const [activeLessonId, setActiveLessonId] = useState(null);

  const courseQuery = useCourseQuery(courseId);
  const course = courseQuery.data;

  const sectionsQuery = useCourseSectionsQuery(courseId, {
    enabled: courseQuery.isSuccess,
  });
  const sections = sectionsQuery.data ?? [];

  const lessonQuery = useLessonQuery(activeLessonId, {
    enabled: activeLessonId != null,
  });
  const lessonVideoQuery = useLessonVideoQuery(activeLessonId, {
    enabled: activeLessonId != null,
  });

  if (courseQuery.isPending) {
    return (
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <div className="flex justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (courseQuery.isError || !course) {
    return (
      <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <CourseError error={courseQuery.error} />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          href="/dashboard/egitimlerim"
        >
          ← Eğitimlerim
        </Link>
        <h1 className="mt-2 font-headline-md text-headline-md tracking-tight text-primary">
          {course.title}
        </h1>
        {course.short_description && (
          <p className="mt-1 max-w-3xl font-body-md text-body-md text-muted-foreground">
            {course.short_description}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <LessonVideoPlayer
            lessonTitle={lessonQuery.data?.title ?? ""}
            video={lessonVideoQuery.data?.video}
          />
          <div className="rounded-2xl border border-border-delicate bg-card p-5">
            <div className="flex items-center gap-2">
              <BadgeCheck className="size-4 shrink-0 text-primary-container" />
              <h2 className="font-title-md text-title-md font-semibold">
                {lessonQuery.data?.title ?? "Ders seçin"}
              </h2>
            </div>
            {lessonQuery.data?.duration != null && (
              <p className="mt-1 text-xs text-muted-foreground">
                Süre: {formatLessonDuration(lessonQuery.data.duration)}
              </p>
            )}
            {lessonQuery.data?.description && (
              <p className="mt-2 whitespace-pre-line font-body-md text-body-md text-muted-foreground">
                {lessonQuery.data.description}
              </p>
            )}
            {activeLessonId != null && lessonVideoQuery.isError && (
              <p className="mt-2 text-sm text-destructive">
                Video bilgileri yüklenemedi. Lütfen tekrar deneyin.
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 font-label-md text-label-md font-semibold uppercase tracking-[0.08em] text-secondary">
            <GraduationCap className="size-4" />
            <span>Müfredat</span>
          </div>
          {sectionsQuery.isPending && (
            <div className="flex justify-center py-10">
              <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
            </div>
          )}
          {sectionsQuery.isError && (
            <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
              <Lock className="size-6 text-destructive" />
              <p className="text-sm font-medium">
                {sectionsQuery.error instanceof ApiError &&
                sectionsQuery.error.status === 403
                  ? "Bu eğitime erişiminiz yok."
                  : "Müfredat yüklenemedi."}
              </p>
              <Button
                render={<Link href="/dashboard/egitimlerim" />}
                size="sm"
                variant="outline"
              >
                Eğitimlerime Dön
              </Button>
            </div>
          )}
          {sectionsQuery.isSuccess && sections.length === 0 && (
            <p className="rounded-xl border border-dashed px-4 py-8 text-center text-sm text-muted-foreground">
              Bu eğitim için henüz yayınlanmış bir içerik yok.
            </p>
          )}
          {sections.length > 0 && (
            <div className="flex flex-col gap-3">
              {sections.map((section) => (
                <SectionGroup
                  activeLessonId={activeLessonId}
                  key={section.id}
                  onSelectLesson={(lesson) => setActiveLessonId(lesson.id)}
                  section={section}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
