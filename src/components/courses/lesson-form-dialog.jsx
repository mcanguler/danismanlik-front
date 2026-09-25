"use client";

import { useState } from "react";
import {
  Check,
  CircleAlert,
  HardDriveUpload,
  ImageOff,
  Library,
  LoaderCircle,
  MonitorPlay,
  RefreshCcw,
  Search,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  BUNNY_VIDEO_STATUS_LABELS,
  formatLessonDuration,
  normalizeBunnyVideo,
  useBunnyVideoQuery,
  useBunnyVideosQuery,
  useCreateCourseLesson,
  useUpdateCourseLesson,
  useUploadBunnyVideo,
} from "@/lib/courses";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function bunnyStatusText(video) {
  if (video.status === 3) return "Hazır";
  return (
    BUNNY_VIDEO_STATUS_LABELS[video.status] ?? `Durum: ${video.status ?? "—"}`
  );
}

function VideoThumbnail({ video, className }) {
  if (video.thumbnail_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        className={cn("shrink-0 rounded-md border border-border object-cover", className)}
        src={video.thumbnail_url}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md border border-border bg-muted",
        className
      )}
    >
      <MonitorPlay className="size-4 text-muted-foreground" />
    </span>
  );
}

function SelectedVideoCard({ video, onChange, disabled }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-input p-2">
      <VideoThumbnail className="h-12 w-20" video={video} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {video.title || video.guid}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {[
            bunnyStatusText(video),
            video.length ? formatLessonDuration(video.length) : null,
            video.guid,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      {onChange && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8"
          disabled={disabled}
          onClick={onChange}
        >
          <RefreshCcw className="size-4" />
          Değiştir
        </Button>
      )}
    </div>
  );
}

function BunnyVideoLibrary({ search, page, onSearchChange, onPageChange, onPick, selectedGuid }) {
  const query = useBunnyVideosQuery({
    page,
    per_page: 10,
    ...(search ? { search } : {}),
  });
  const videos = query.data?.items ?? [];
  const meta = query.data?.meta;

  if (query.isPending) {
    return (
      <div className="flex justify-center py-10">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
        <CircleAlert className="size-5 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {getErrorMessage(query.error)}
        </p>
        <Button size="sm" type="button" variant="outline" onClick={() => query.refetch()}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed px-4 py-8 text-center">
        <Video className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">
          {search ? "Video bulunamadı" : "Kütüphanede video yok"}
        </p>
        <p className="text-xs text-muted-foreground">
          {search
            ? "Aramanızı değiştirin"
            : "Yeni Video Yükle sekmesinden video yükleyebilirsiniz"}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex max-h-56 flex-col gap-1.5 overflow-y-auto pr-1">
        {videos.map((video) => {
          const isSelected = selectedGuid === video.guid;
          return (
            <button
              key={video.guid}
              type="button"
              className={cn(
                "flex items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-input hover:bg-accent/40"
              )}
              onClick={() => onPick(video)}
            >
              <VideoThumbnail className="h-10 w-16" video={video} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {video.title || video.guid}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {[
                    bunnyStatusText(video),
                    video.length ? formatLessonDuration(video.length) : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </span>
              {isSelected && <Check className="size-4 shrink-0 text-primary" />}
            </button>
          );
        })}
      </div>
      {meta && meta.totalItems > meta.perPage && (
        <div className="flex items-center justify-center gap-3">
          <Button
            disabled={meta.currentPage <= 1}
            onClick={() => onPageChange(page - 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            Önceki
          </Button>
          <span className="text-xs text-muted-foreground">
            Sayfa {meta.currentPage} /{" "}
            {Math.max(1, Math.ceil(meta.totalItems / meta.perPage))}
          </span>
          <Button
            disabled={meta.currentPage * meta.perPage >= meta.totalItems}
            onClick={() => onPageChange(page + 1)}
            size="sm"
            type="button"
            variant="outline"
          >
            Sonraki
          </Button>
        </div>
      )}
    </div>
  );
}

function VideoUploader({ defaultTitle, onUploaded }) {
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const upload = useUploadBunnyVideo();

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    setFile(selected);
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("title", title.trim() || defaultTitle || file.name);
    formData.append("file", file);
    upload.mutate(
      { formData, onProgress: setProgress },
      {
        onSuccess: (payload) => {
          const video = normalizeBunnyVideo(payload?.data ?? payload);
          if (!video?.guid) {
            toast.add({
              title: "Video yüklenemedi",
              description: "Beklenmeyen yanıt formatı",
              type: "error",
            });
            return;
          }
          toast.add({ title: "Video yüklendi", type: "success" });
          setFile(null);
          setProgress(0);
          onUploaded(video);
        },
        onError: (error) => {
          toast.add({
            title: "Video yüklenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
          setProgress(0);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bunny_upload_title">Video Başlığı</Label>
        <Input
          id="bunny_upload_title"
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Video kütüphanesinde görünen başlık"
          type="text"
          value={title}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="bunny_upload_file">Video Dosyası</Label>
        <input
          accept="video/*"
          className="w-full cursor-pointer rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-accent dark:bg-input/30"
          disabled={upload.isPending}
          id="bunny_upload_file"
          type="file"
          onChange={handleFileChange}
        />
        <p className="text-xs text-muted-foreground">
          Video doğrudan Bunny kütüphanesine yüklenir; dosya boyutuna göre
          işlem birkaç dakika sürebilir.
        </p>
      </div>
      {upload.isPending && (
        <div className="flex flex-col gap-1.5">
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.max(progress, 5)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Yükleniyor... %{progress}
          </p>
        </div>
      )}
      <Button
        type="button"
        className="h-9 self-start"
        disabled={!file || upload.isPending}
        onClick={handleUpload}
      >
        {upload.isPending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <HardDriveUpload className="size-4" />
        )}
        {upload.isPending ? "Yükleniyor..." : "Yükle ve Seç"}
      </Button>
    </div>
  );
}

export function LessonFormDialog({ open, section, lesson, onOpenChange }) {
  const isEdit = Boolean(lesson);
  const create = useCreateCourseLesson();
  const update = useUpdateCourseLesson();
  const mutation = isEdit ? update : create;

  const [title, setTitle] = useState(lesson?.title ?? "");
  const [description, setDescription] = useState(lesson?.description ?? "");
  const [duration, setDuration] = useState(
    lesson?.duration != null ? String(lesson.duration) : ""
  );
  const [isActive, setIsActive] = useState(
    lesson ? Boolean(lesson.is_active) : true
  );
  const [sortOrder, setSortOrder] = useState(String(lesson?.sort_order ?? 0));
  const [pickedVideo, setPickedVideo] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mode, setMode] = useState("library");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [videoError, setVideoError] = useState("");

  const linkedVideoQuery = useBunnyVideoQuery(lesson?.bunny_video_id, {
    enabled: Boolean(lesson?.bunny_video_id) && !pickedVideo,
  });

  const video =
    pickedVideo ??
    (linkedVideoQuery.data
      ? linkedVideoQuery.data
      : lesson?.bunny_video_id
        ? {
            guid: lesson.bunny_video_id,
            video_library_id: lesson.bunny_library_id,
            title: "",
            status: null,
            length: null,
            thumbnail_url: null,
          }
        : null);

  const pending = mutation.isPending;

  const pickVideo = (picked) => {
    setPickedVideo(picked);
    setVideoError("");
    setPickerOpen(false);
    if (picked.length != null && picked.length > 0) {
      setDuration(String(Math.round(picked.length)));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    if (!video?.guid) {
      setVideoError("Bir video seçin veya yeni video yükleyin");
      return;
    }

    const payload = {
      title: trimmedTitle,
      description,
      bunny_video_id: video.guid,
      bunny_library_id: video.video_library_id ?? null,
      duration: duration === "" ? null : Number(duration),
      is_active: isActive,
      sort_order: Number(sortOrder) || 0,
    };

    if (isEdit) {
      update.mutate(
        { id: lesson.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Ders güncellendi", type: "success" });
            onOpenChange(false);
          },
          onError: (error) => {
            toast.add({
              title: "Ders güncellenemedi",
              description: getErrorMessage(error),
              type: "error",
            });
          },
        }
      );
      return;
    }

    create.mutate(
      { sectionId: section.id, payload },
      {
        onSuccess: () => {
          toast.add({ title: "Ders eklendi", type: "success" });
          onOpenChange(false);
        },
        onError: (error) => {
          toast.add({
            title: "Ders eklenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  const trimmedTitle = title.trim();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Dersi Düzenle" : "Yeni Ders"}</DialogTitle>
          <DialogDescription>
            {section?.title ?? ""} bölümünde ders
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson_title">Başlık</Label>
            <Input
              aria-invalid={!trimmedTitle}
              id="lesson_title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Örn. Hoş Geldiniz"
              type="text"
              value={title}
            />
            {!trimmedTitle && (
              <p className="text-xs text-destructive">Başlık zorunludur</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lesson_description">Açıklama</Label>
            <Textarea
              id="lesson_description"
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Ders açıklaması"
              rows={3}
              value={description}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Video</Label>
            {video && !pickerOpen ? (
              <SelectedVideoCard
                disabled={pending}
                onChange={() => setPickerOpen(true)}
                video={video}
              />
            ) : (
              <div className="flex flex-col gap-3 rounded-lg border border-input p-3">
                <div className="flex gap-1 rounded-lg bg-muted p-1">
                  <button
                    className={cn(
                      "flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors",
                      mode === "library"
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setMode("library")}
                    type="button"
                  >
                    <Library className="size-3.5" />
                    Kütüphaneden Seç
                  </button>
                  <button
                    className={cn(
                      "flex h-7 flex-1 items-center justify-center gap-1.5 rounded-md text-xs font-medium transition-colors",
                      mode === "upload"
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setMode("upload")}
                    type="button"
                  >
                    <HardDriveUpload className="size-3.5" />
                    Yeni Video Yükle
                  </button>
                </div>
                {mode === "library" ? (
                  <>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        className="pl-8"
                        onChange={(event) => {
                          setSearch(event.target.value);
                          setPage(1);
                        }}
                        placeholder="Video başlığına göre ara"
                        type="text"
                        value={search}
                      />
                    </div>
                    <BunnyVideoLibrary
                      onPick={pickVideo}
                      onPageChange={setPage}
                      page={page}
                      search={search}
                      selectedGuid={video?.guid ?? null}
                    />
                  </>
                ) : (
                  <VideoUploader
                    defaultTitle={trimmedTitle}
                    onUploaded={pickVideo}
                  />
                )}
              </div>
            )}
            {videoError && (
              <p className="text-xs text-destructive">{videoError}</p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lesson_duration">Süre (saniye)</Label>
              <Input
                id="lesson_duration"
                inputMode="numeric"
                min="0"
                onChange={(event) => setDuration(event.target.value)}
                step="1"
                type="number"
                value={duration}
              />
              <p className="text-xs text-muted-foreground">
                Video seçildiğinde otomatik doldurulur
                {duration !== "" && formatLessonDuration(duration)
                  ? ` · ${formatLessonDuration(duration)}`
                  : ""}
              </p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="lesson_sort_order">Sıra</Label>
              <Input
                id="lesson_sort_order"
                inputMode="numeric"
                min="0"
                onChange={(event) => setSortOrder(event.target.value)}
                step="1"
                type="number"
                value={sortOrder}
              />
            </div>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="lesson_is_active">Aktif</Label>
              <p className="text-xs text-muted-foreground">
                Öğrencilerin görebileceği dersler
              </p>
            </div>
            <Switch
              checked={isActive}
              id="lesson_is_active"
              onCheckedChange={setIsActive}
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
            <Button
              type="submit"
              className="h-10"
              disabled={pending || !trimmedTitle}
            >
              {pending && <LoaderCircle className="size-4 animate-spin" />}
              {pending ? "Kaydediliyor..." : isEdit ? "Kaydet" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
