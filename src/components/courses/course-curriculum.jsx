"use client";

import { useState } from "react";
import {
  FolderPlus,
  Layers,
  LoaderCircle,
  MonitorPlay,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { formatLessonDuration, useCreateCourseSection, useDeleteCourseLesson, useDeleteCourseSection, useUpdateCourseSection } from "@/lib/courses";
import { LessonFormDialog } from "@/components/courses/lesson-form-dialog";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function SectionFormDialog({ course, section, open, onOpenChange }) {
  const isEdit = Boolean(section);
  const create = useCreateCourseSection();
  const update = useUpdateCourseSection();
  const mutation = isEdit ? update : create;

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const values = {
      title: String(formData.get("title") ?? "").trim(),
      sort_order: Number(formData.get("sort_order") ?? 0),
    };
    if (!values.title) return;

    if (isEdit) {
      mutation.mutate(
        { id: section.id, payload: values },
        {
          onSuccess: () => {
            toast.add({ title: "Bölüm güncellendi", type: "success" });
            onOpenChange(false);
          },
          onError: (error) => {
            toast.add({
              title: "Bölüm güncellenemedi",
              description: getErrorMessage(error),
              type: "error",
            });
          },
        }
      );
      return;
    }

    mutation.mutate(
      { courseId: course.id, payload: values },
      {
        onSuccess: () => {
          toast.add({ title: "Bölüm eklendi", type: "success" });
          onOpenChange(false);
        },
        onError: (error) => {
          toast.add({
            title: "Bölüm eklenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Bölümü Düzenle" : "Yeni Bölüm"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? section.title : "Kursa yeni bir bölüm ekleyin"}
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="section_title">Başlık</Label>
            <Input
              autoFocus
              defaultValue={section?.title ?? ""}
              id="section_title"
              name="title"
              placeholder="Örn. Giriş"
              required
              type="text"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="section_sort_order">Sıra</Label>
            <Input
              defaultValue={section?.sort_order ?? 0}
              id="section_sort_order"
              inputMode="numeric"
              min="0"
              name="sort_order"
              step="1"
              type="number"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" className="h-10" disabled={mutation.isPending}>
              {mutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {mutation.isPending
                ? "Kaydediliyor..."
                : isEdit
                  ? "Kaydet"
                  : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LessonRow({ lesson, onEdit, onDelete }) {
  const duration = formatLessonDuration(lesson.duration);
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5">
      <MonitorPlay className="size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{lesson.title}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          Sıra: {lesson.sort_order}
          {duration ? ` · ${duration}` : ""}
          {lesson.bunny_video_id ? " · Video bağlı" : " · Video yok"}
        </p>
      </div>
      <StatusBadge active={lesson.is_active} />
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          aria-label={`${lesson.title} düzenle`}
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-destructive hover:text-destructive"
          onClick={onDelete}
          aria-label={`${lesson.title} sil`}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function CourseCurriculum({ course }) {
  const [sectionDialog, setSectionDialog] = useState(null);
  const [lessonDialog, setLessonDialog] = useState(null);
  const [deletingSection, setDeletingSection] = useState(null);
  const [deletingLesson, setDeletingLesson] = useState(null);

  const deleteSection = useDeleteCourseSection();
  const deleteLesson = useDeleteCourseLesson();

  const sections = course.sections ?? [];

  const handleDeleteSection = () => {
    if (!deletingSection) return;
    deleteSection.mutate(deletingSection.id, {
      onSuccess: () => {
        toast.add({ title: "Bölüm silindi", type: "success" });
        setDeletingSection(null);
      },
      onError: (error) => {
        toast.add({
          title: "Bölüm silinemedi",
          description: getErrorMessage(error),
          type: "error",
        });
        setDeletingSection(null);
      },
    });
  };

  const handleDeleteLesson = () => {
    if (!deletingLesson) return;
    deleteLesson.mutate(deletingLesson.id, {
      onSuccess: () => {
        toast.add({ title: "Ders silindi", type: "success" });
        setDeletingLesson(null);
      },
      onError: (error) => {
        toast.add({
          title: "Ders silinemedi",
          description: getErrorMessage(error),
          type: "error",
        });
        setDeletingLesson(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Button
        variant="outline"
        className="h-9 self-start"
        onClick={() => setSectionDialog({ section: null })}
      >
        <FolderPlus className="size-4" />
        Bölüm Ekle
      </Button>

      {sections.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-4 py-10 text-center">
          <Layers className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium">Henüz bölüm yok</p>
          <p className="text-sm text-muted-foreground">
            Müfredatı bölüm ve derslerle oluşturun
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="overflow-hidden rounded-xl border bg-muted/30"
            >
              <div className="flex flex-wrap items-center gap-2 border-b bg-muted/40 px-3 py-2.5">
                <Layers className="size-4 shrink-0 text-muted-foreground" />
                <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {section.title}
                </p>
                <span className="text-xs text-muted-foreground">
                  {section.lessonsCount} ders · Sıra: {section.sort_order}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setSectionDialog({ section })}
                    aria-label={`${section.title} düzenle`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeletingSection(section)}
                    aria-label={`${section.title} sil`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-col gap-2 p-3">
                {section.lessons.length === 0 ? (
                  <p className="py-2 text-center text-xs text-muted-foreground">
                    Bu bölümde henüz ders yok
                  </p>
                ) : (
                  section.lessons.map((lesson) => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      onEdit={() => setLessonDialog({ section, lesson })}
                      onDelete={() => setDeletingLesson(lesson)}
                    />
                  ))
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 self-start"
                  onClick={() => setLessonDialog({ section, lesson: null })}
                >
                  <Plus className="size-3.5" />
                  Ders Ekle
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionFormDialog
        key={sectionDialog ? (sectionDialog.section?.id ?? "new") : "closed"}
        course={course}
        open={Boolean(sectionDialog)}
        section={sectionDialog?.section ?? null}
        onOpenChange={(open) => {
          if (!open) setSectionDialog(null);
        }}
      />

      <LessonFormDialog
        key={lessonDialog ? `lesson-${lessonDialog.lesson?.id ?? "new"}-${lessonDialog.section.id}` : "lesson-closed"}
        open={Boolean(lessonDialog)}
        section={lessonDialog?.section ?? null}
        lesson={lessonDialog?.lesson ?? null}
        onOpenChange={(open) => {
          if (!open) setLessonDialog(null);
        }}
      />

      <AlertDialog
        open={Boolean(deletingSection)}
        onOpenChange={(open) => {
          if (!open) setDeletingSection(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bölümü sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingSection?.title ?? ""}&quot; bölümü ve içindeki tüm
              dersler silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-10"
              onClick={handleDeleteSection}
              disabled={deleteSection.isPending}
            >
              {deleteSection.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteSection.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={Boolean(deletingLesson)}
        onOpenChange={(open) => {
          if (!open) setDeletingLesson(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dersi sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingLesson?.title ?? ""}&quot; dersi silinecek. Bu
              işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-10"
              onClick={handleDeleteLesson}
              disabled={deleteLesson.isPending}
            >
              {deleteLesson.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteLesson.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
