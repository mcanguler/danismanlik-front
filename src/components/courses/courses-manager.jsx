"use client";

import { useState } from "react";
import Link from "next/link";
import { useQueries } from "@tanstack/react-query";
import {
  CircleAlert,
  GraduationCap,
  Image as ImageIcon,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { api, ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { useAuthStore } from "@/lib/auth";
import {
  courseDetailQueryKey,
  normalizeCourseDetail,
  useAdminCoursesQuery,
  useDeleteCourse,
} from "@/lib/courses";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function CourseAvatar({ course }) {
  return (
    <Avatar className="size-8 rounded-lg after:rounded-lg">
      <AvatarImage src={course.image} alt={course.title} className="rounded-lg" />
      <AvatarFallback className="rounded-lg">
        <ImageIcon className="size-4" />
      </AvatarFallback>
    </Avatar>
  );
}

function CoursePrice({ course }) {
  if (course.has_discount) {
    return (
      <div className="flex flex-col items-start">
        <span className="font-medium">{formatPrice(course.effective_price)}</span>
        <span className="text-xs text-muted-foreground line-through">
          {formatPrice(course.price)}
        </span>
      </div>
    );
  }
  return <span className="whitespace-nowrap font-medium">{formatPrice(course.price)}</span>;
}

export function CoursesManager() {
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteCourse();

  const query = useAdminCoursesQuery({ page });
  const courses = query.data?.items ?? [];
  const meta = query.data?.meta;

  const token = useAuthStore((state) => state.token);
  const curriculumQueries = useQueries({
    queries: courses.map((course) => ({
      queryKey: courseDetailQueryKey(course.id),
      queryFn: async () =>
        normalizeCourseDetail(await api.adminCourse(token, course.id)),
      enabled: Boolean(token),
      staleTime: 60 * 1000,
    })),
  });
  const countsById = new Map(
    courses.map((course, index) => {
      const curriculum = curriculumQueries[index]?.data;
      return [
        course.id,
        curriculum
          ? { sections: curriculum.sectionsCount, lessons: curriculum.lessonsCount }
          : null,
      ];
    })
  );

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Kurs silindi", type: "success" });
        setDeleting(null);
      },
      onError: (error) => {
        toast.add({
          title: "Silme başarısız",
          description: getErrorMessage(error),
          type: "error",
        });
        setDeleting(null);
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Kurslar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {meta ? `${meta.total} kurs` : "Tüm kurslar"}
          </p>
        </div>
        <Button
          size="lg"
          className="h-10"
          render={<Link href="/dashboard/admin/kurslar/yeni" />}
        >
          <Plus className="size-4" />
          Yeni Kurs
        </Button>
      </div>

      <div className="mt-4">
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

        {query.isSuccess && courses.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <GraduationCap className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz kurs yok</p>
            <p className="text-sm text-muted-foreground">
              İlk kursu ekleyerek başlayın
            </p>
            <Button
              variant="outline"
              render={<Link href="/dashboard/admin/kurslar/yeni" />}
            >
              <Plus className="size-4" />
              Yeni Kurs
            </Button>
          </div>
        )}

        {query.isSuccess && courses.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4 w-14">Görsel</TableHead>
                    <TableHead>Başlık</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Bölüm / Ders</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.map((course) => {
                    const counts = countsById.get(course.id);
                    return (
                      <TableRow key={course.id}>
                        <TableCell className="pl-4">
                          <CourseAvatar course={course} />
                        </TableCell>
                        <TableCell>
                          <Link
                            className="font-medium underline-offset-4 hover:underline"
                            href={`/dashboard/admin/kurslar/${course.id}`}
                          >
                            {course.title}
                          </Link>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            Sıra: {course.sort_order}
                          </p>
                        </TableCell>
                        <TableCell>
                          <CoursePrice course={course} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge active={course.is_active} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {counts
                            ? `${counts.sections} bölüm / ${counts.lessons} ders`
                            : "—"}
                        </TableCell>
                        <TableCell className="pr-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              render={
                                <Link
                                  href={`/dashboard/admin/kurslar/${course.id}`}
                                />
                              }
                              aria-label={`${course.title} düzenle`}
                            >
                              <Pencil className="size-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => setDeleting(course)}
                              aria-label={`${course.title} sil`}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {courses.map((course) => {
                const counts = countsById.get(course.id);
                return (
                  <div
                    key={course.id}
                    className="rounded-xl border bg-card p-4"
                  >
                    <div className="flex items-start gap-3">
                      <CourseAvatar course={course} />
                      <div className="min-w-0 flex-1">
                        <Link
                          className="truncate font-medium underline-offset-4 hover:underline"
                          href={`/dashboard/admin/kurslar/${course.id}`}
                        >
                          {course.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Sıra: {course.sort_order}
                        </p>
                      </div>
                      <StatusBadge active={course.is_active} />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <CoursePrice course={course} />
                      <p className="text-xs text-muted-foreground">
                        {counts
                          ? `${counts.sections} bölüm · ${counts.lessons} ders`
                          : "—"}
                      </p>
                    </div>
                    <div className="mt-3 flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9"
                        render={
                          <Link href={`/dashboard/admin/kurslar/${course.id}`} />
                        }
                      >
                        <Pencil className="size-3.5" />
                        Düzenle
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-9 text-destructive hover:text-destructive"
                        onClick={() => setDeleting(course)}
                      >
                        <Trash2 className="size-3.5" />
                        Sil
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {meta && meta.lastPage > 1 && (
              <div className="mt-4 flex items-center justify-center gap-3">
                <Button
                  disabled={meta.currentPage <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  size="sm"
                  variant="outline"
                >
                  Önceki
                </Button>
                <span className="text-sm text-muted-foreground">
                  Sayfa {meta.currentPage} / {meta.lastPage}
                </span>
                <Button
                  disabled={meta.currentPage >= meta.lastPage}
                  onClick={() => setPage((current) => current + 1)}
                  size="sm"
                  variant="outline"
                >
                  Sonraki
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kursu sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.title ?? ""}&quot; adlı kurs bölümleri, dersleri
              ve erişimleriyle birlikte silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-10"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
