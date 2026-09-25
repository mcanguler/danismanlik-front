"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CircleAlert,
  FolderTree,
  Layers,
  ListVideo,
  LoaderCircle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { useAdminCourseQuery } from "@/lib/courses";
import { CourseInfoForm } from "@/components/courses/course-info-form";
import { CourseCurriculum } from "@/components/courses/course-curriculum";
import { BunnyVideosPanel } from "@/components/courses/bunny-videos-panel";
import { CourseStudents } from "@/components/courses/course-students";

function SectionTitle({ icon: Icon, title, description }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div>
        <CardTitle>{title}</CardTitle>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

export function CourseEditPage({ courseId }) {
  const query = useAdminCourseQuery(courseId);
  const course = query.data;

  if (query.isPending) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="flex justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (query.isError || !course) {
    return (
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
        <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
          <CircleAlert className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Kurs yüklenemedi</p>
          <p className="text-sm text-muted-foreground">
            {getQueryErrorMessage(query.error)}
          </p>
          <Button
            render={<Link href="/dashboard/admin/kurslar" />}
            variant="outline"
          >
            Kurslara Dön
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/dashboard/admin/kurslar"
        >
          ← Kurslar
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {course.title}
          </h1>
          <StatusBadge active={course.is_active} />
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Bilgiler → Müfredat → Bunny Videolar → Öğrenciler sırasıyla yönetin
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="border-b [.border-b]:pb-4">
            <SectionTitle
              description="Kursun temel ve satış bilgileri"
              icon={ListVideo}
              title="Bilgiler"
            />
          </CardHeader>
          <CardContent className="pt-4">
            <CourseInfoForm compact course={course} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b [.border-b]:pb-4">
            <SectionTitle
              description="Bölüm ve derslerle müfredatı yönetin"
              icon={FolderTree}
              title="Müfredat"
            />
          </CardHeader>
          <CardContent className="pt-4">
            <CourseCurriculum course={course} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b [.border-b]:pb-4">
            <SectionTitle
              description="Derslerde kullanmak için video kütüphanesi"
              icon={Layers}
              title="Bunny Videolar"
            />
          </CardHeader>
          <CardContent className="pt-4">
            <BunnyVideosPanel />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b [.border-b]:pb-4">
            <SectionTitle
              description="Kursa erişimi olan müşteriler"
              icon={Users}
              title="Öğrenciler / Erişimler"
            />
          </CardHeader>
          <CardContent className="pt-4">
            <CourseStudents courseId={course.id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
