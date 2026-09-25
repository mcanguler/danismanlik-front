"use client";

import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  CircleAlert,
  CloudUpload,
  LoaderCircle,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import {
  useAddProductDownload,
  useDeleteProductDownload,
  useUpdateProductDownload,
} from "@/lib/products";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

function DownloadRow({ download, index, total, move, update, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(download.title ?? "");

  const saveTitle = () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === download.title) {
      setEditing(false);
      setTitle(download.title ?? "");
      return;
    }
    update.mutate(
      { id: download.id, payload: { title: trimmed } },
      {
        onSuccess: () => setEditing(false),
        onError: (error) => {
          toast.add({
            title: "Güncellenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-background px-3 py-2.5">
      <div className="min-w-0 flex-1">
        {editing ? (
          <span className="flex items-center gap-1">
            <Input
              autoFocus
              className="h-7 text-sm"
              onChange={(event) => setTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  saveTitle();
                }
                if (event.key === "Escape") {
                  setTitle(download.title ?? "");
                  setEditing(false);
                }
              }}
              type="text"
              value={title}
            />
            <Button
              disabled={update.isPending}
              onClick={saveTitle}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <Check className="size-3.5" />
            </Button>
            <Button
              onClick={() => {
                setTitle(download.title ?? "");
                setEditing(false);
              }}
              size="icon-xs"
              type="button"
              variant="ghost"
            >
              <X className="size-3.5" />
            </Button>
          </span>
        ) : (
          <>
            <p className="truncate text-sm font-medium">{download.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Sıra: {(download.sort_order ?? 0) + 1}
            </p>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Aktif</span>
        <Switch
          checked={download.is_active}
          onCheckedChange={(checked) => {
            update.mutate(
              { id: download.id, payload: { is_active: checked } },
              {
                onError: (error) => {
                  toast.add({
                    title: "Güncellenemedi",
                    description: getErrorMessage(error),
                    type: "error",
                  });
                },
              }
            );
          }}
        />
        <span className="flex items-center gap-0.5">
          <Button
            aria-label="Yukarı taşı"
            disabled={index === 0 || update.isPending}
            onClick={() => move(download, "up")}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            aria-label="Aşağı taşı"
            disabled={index === total - 1 || update.isPending}
            onClick={() => move(download, "down")}
            size="icon-xs"
            type="button"
            variant="ghost"
          >
            <ArrowDown className="size-3.5" />
          </Button>
        </span>
        <Button
          aria-label="Başlığı düzenle"
          onClick={() => setEditing(true)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Pencil className="size-4" />
        </Button>
        <Button
          aria-label={`${download.title} sil`}
          className="text-destructive hover:text-destructive"
          onClick={() => onDelete(download)}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

export function ProductDownloads({ product }) {
  const inputRef = useRef(null);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [deleting, setDeleting] = useState(null);

  const addDownload = useAddProductDownload(product.id);
  const updateDownload = useUpdateProductDownload();
  const deleteDownload = useDeleteProductDownload();

  const downloads = product.downloads ?? [];

  const moveDownload = (download, direction) => {
    const index = downloads.findIndex((item) => item.id === download.id);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= downloads.length) return;

    const current = downloads[index];
    const target = downloads[targetIndex];

    updateDownload.mutate(
      { id: current.id, payload: { sort_order: target.sort_order ?? 0 } },
      {
        onSuccess: () => {
          updateDownload.mutate({
            id: target.id,
            payload: { sort_order: current.sort_order ?? 0 },
          });
        },
        onError: (error) => {
          toast.add({
            title: "Sıralama güncellenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    event.target.value = "";
    if (!selected) return;
    if (selected.size > MAX_FILE_SIZE) {
      toast.add({
        title: "Dosya çok büyük",
        description: "Dosya boyutu en fazla 50 MB olabilir",
        type: "error",
      });
      return;
    }
    setFile(selected);
  };

  const handleUpload = () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("title", title.trim() || file.name);
    formData.append("file", file);
    addDownload.mutate(
      { formData, onProgress: setProgress },
      {
        onSuccess: () => {
          toast.add({ title: "Dosya yüklendi", type: "success" });
          setFile(null);
          setTitle("");
          setProgress(0);
        },
        onError: (error) => {
          toast.add({
            title: "Dosya yüklenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
          setProgress(0);
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-xl border border-dashed p-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="download_title">Dosya Adı / Başlık</Label>
            <Input
              id="download_title"
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Müşteriye görünen başlık"
              type="text"
              value={title}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="download_file">Dosya</Label>
            <input
              className="w-full cursor-pointer rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-accent dark:bg-input/30"
              disabled={addDownload.isPending}
              id="download_file"
              ref={inputRef}
              type="file"
              onChange={handleFileChange}
            />
          </div>
        </div>
        {addDownload.isPending && (
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
          className="h-9 self-start"
          disabled={!file || addDownload.isPending}
          onClick={handleUpload}
          type="button"
        >
          {addDownload.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <CloudUpload className="size-4" />
          )}
          {addDownload.isPending ? "Yükleniyor..." : "Dosya Yükle"}
        </Button>
        <p className="text-xs text-muted-foreground">
          Dosyalar güvenli depoda saklanır ve yalnızca satın alma sonrası
          müşteriye backend üzerinden sunulur. En fazla 50 MB.
        </p>
      </div>

      {downloads.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-10 text-center">
          <CloudUpload className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium">Henüz dosya yok</p>
          <p className="text-sm text-muted-foreground">
            Ürünü satın alan müşterilere sunulacak dosyaları yükleyin
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {downloads.map((download, index) => (
            <DownloadRow
              download={download}
              index={index}
              key={download.id}
              move={moveDownload}
              onDelete={setDeleting}
              total={downloads.length}
              update={updateDownload}
            />
          ))}
        </div>
      )}

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        open={Boolean(deleting)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dosyayı sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.title ?? ""}&quot; dosyası kalıcı olarak
              silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              disabled={deleteDownload.isPending}
              onClick={() => {
                if (!deleting) return;
                deleteDownload.mutate(deleting.id, {
                  onSuccess: () => {
                    toast.add({ title: "Dosya silindi", type: "success" });
                    setDeleting(null);
                  },
                  onError: (error) => {
                    toast.add({
                      title: "Dosya silinemedi",
                      description: getErrorMessage(error),
                      type: "error",
                    });
                    setDeleting(null);
                  },
                });
              }}
              variant="destructive"
            >
              {deleteDownload.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteDownload.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
