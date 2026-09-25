"use client";

import { useState } from "react";
import {
  CircleAlert,
  HardDriveUpload,
  ImageOff,
  LoaderCircle,
  Search,
  Trash2,
  Video,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { cn } from "@/lib/utils";
import {
  BUNNY_VIDEO_STATUS_LABELS,
  formatLessonDuration,
  normalizeBunnyVideo,
  useBunnyVideosQuery,
  useDeleteBunnyVideo,
  useUploadBunnyVideo,
} from "@/lib/courses";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function bunnyStatusBadgeClass(status) {
  if (status === 3) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }
  if (status === 4 || status === 5 || status === 6) {
    return "bg-destructive/10 text-destructive";
  }
  return "bg-amber-500/10 text-amber-600 dark:text-amber-400";
}

function bunnyStatusText(status) {
  if (status === 3) return "Hazır";
  return BUNNY_VIDEO_STATUS_LABELS[status] ?? `Durum: ${status ?? "—"}`;
}

function VideoThumb({ video }) {
  if (video.thumbnail_url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        className="h-12 w-20 shrink-0 rounded-md border border-border object-cover"
        src={video.thumbnail_url}
      />
    );
  }
  return (
    <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
      <ImageOff className="size-4 text-muted-foreground" />
    </span>
  );
}

function BunnyVideoRow({ video, onDelete }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2.5">
      <VideoThumb video={video} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{video.title || video.guid}</p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {[
            bunnyStatusText(video.status),
            video.length ? formatLessonDuration(video.length) : null,
            video.guid,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </div>
      <span
        className={cn(
          "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
          bunnyStatusBadgeClass(video.status)
        )}
      >
        {bunnyStatusText(video.status)}
      </span>
      <Button
        variant="ghost"
        size="icon-sm"
        className="shrink-0 text-destructive hover:text-destructive"
        onClick={() => onDelete(video)}
        aria-label={`${video.title || video.guid} sil`}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}

export function BunnyVideosPanel() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [uploadTitle, setUploadTitle] = useState("");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const query = useBunnyVideosQuery({
    page,
    per_page: 12,
    ...(search ? { search } : {}),
  });
  const upload = useUploadBunnyVideo();
  const deleteMutation = useDeleteBunnyVideo();

  const videos = query.data?.items ?? [];
  const meta = query.data?.meta;

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    setFile(selected);
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("title", uploadTitle.trim() || file.name);
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
          setUploadTitle("");
          setProgress(0);
          setPage(1);
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

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.guid, {
      onSuccess: () => {
        toast.add({ title: "Video silindi", type: "success" });
        setDeleting(null);
      },
      onError: (error) => {
        toast.add({
          title: "Video silinemedi",
          description: getErrorMessage(error),
          type: "error",
        });
        setDeleting(null);
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-dashed p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bunny_panel_title">Video Başlığı</Label>
            <Input
              id="bunny_panel_title"
              onChange={(event) => setUploadTitle(event.target.value)}
              placeholder="Kütüphanede görünen başlık"
              type="text"
              value={uploadTitle}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="bunny_panel_file">Video Dosyası</Label>
            <input
              accept="video/*"
              className="w-full cursor-pointer rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-accent dark:bg-input/30"
              disabled={upload.isPending}
              id="bunny_panel_file"
              type="file"
              onChange={handleFileChange}
            />
          </div>
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
              Yükleniyor... %{progress} · Dosya boyutuna göre bu işlem birkaç
              dakika sürebilir
            </p>
          </div>
        )}
        <Button
          className="h-9 self-start"
          disabled={!file || upload.isPending}
          onClick={handleUpload}
        >
          {upload.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <HardDriveUpload className="size-4" />
          )}
          {upload.isPending ? "Yükleniyor..." : "Video Yükle"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Yüklenen videolar Bunny kütüphanesine gider; derslerde bu
          kütüphaneden seçilir.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-48 pl-8"
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Video ara"
            type="text"
            value={search}
          />
        </div>
        {query.isSuccess && (
          <p className="text-xs text-muted-foreground">
            {meta?.totalItems ?? videos.length} video
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {query.isPending && (
          <div className="flex justify-center py-10">
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {query.isError && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-8 text-center">
            <CircleAlert className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {getErrorMessage(query.error)}
            </p>
            <Button size="sm" variant="outline" onClick={() => query.refetch()}>
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && videos.length === 0 && (
          <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-10 text-center">
            <Video className="size-7 text-muted-foreground" />
            <p className="text-sm font-medium">
              {search ? "Video bulunamadı" : "Kütüphanede video yok"}
            </p>
            <p className="text-sm text-muted-foreground">
              {search
                ? "Aramanızı değiştirin"
                : "Yukarıdan ilk videonuzu yükleyin"}
            </p>
          </div>
        )}

        {query.isSuccess &&
          videos.map((video) => (
            <BunnyVideoRow
              key={video.guid}
              video={video}
              onDelete={setDeleting}
            />
          ))}

        {meta && meta.totalItems > meta.perPage && (
          <div className="flex items-center justify-center gap-3">
            <Button
              disabled={meta.currentPage <= 1}
              onClick={() => setPage((current) => current - 1)}
              size="sm"
              variant="outline"
            >
              Önceki
            </Button>
            <span className="text-sm text-muted-foreground">
              Sayfa {meta.currentPage} /{" "}
              {Math.max(1, Math.ceil(meta.totalItems / meta.perPage))}
            </span>
            <Button
              disabled={meta.currentPage * meta.perPage >= meta.totalItems}
              onClick={() => setPage((current) => current + 1)}
              size="sm"
              variant="outline"
            >
              Sonraki
            </Button>
          </div>
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
            <AlertDialogTitle>Videoyu sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting ? deleting.title || deleting.guid : ""}&quot;
              videosu Bunny kütüphanesinden kalıcı olarak silinecek. Bu
              videoya bağlı derslerin videosu bozulur. Bu işlem geri alınamaz.
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
