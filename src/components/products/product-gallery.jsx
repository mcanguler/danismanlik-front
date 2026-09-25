"use client";

import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  LoaderCircle,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { IMAGE_ALLOWED_MIME_TYPES, IMAGE_MAX_SIZE_BYTES } from "@/lib/image-upload";
import {
  useAddProductGalleryImage,
  useDeleteProductGalleryImage,
  useUpdateProductGalleryImage,
} from "@/lib/products";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function ProductGallery({ product }) {
  const inputRef = useRef(null);
  const [deleting, setDeleting] = useState(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  const addImage = useAddProductGalleryImage(product.id);
  const updateImage = useUpdateProductGalleryImage();
  const deleteImage = useDeleteProductGalleryImage();

  const gallery = product.gallery ?? [];

  const moveImage = (image, direction) => {
    const index = gallery.findIndex((item) => item.id === image.id);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= gallery.length) return;

    const current = gallery[index];
    const target = gallery[targetIndex];

    updateImage.mutate(
      { id: current.id, payload: { sort_order: target.sort_order ?? 0 } },
      {
        onSuccess: () => {
          updateImage.mutate({
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

  const handleFilesChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const invalidFile = files.find(
      (file) =>
        !IMAGE_ALLOWED_MIME_TYPES.includes(file.type) ||
        file.size > IMAGE_MAX_SIZE_BYTES
    );
    if (invalidFile) {
      toast.add({
        title: "Görsel eklenemedi",
        description: `${invalidFile.name}: Sadece JPG, JPEG, PNG ve WEBP formatları, en fazla 2 MB desteklenir`,
        type: "error",
      });
      return;
    }

    setUploadingCount(files.length);

    let pending = files.length;
    const finish = () => {
      pending -= 1;
      if (pending <= 0) {
        setUploadingCount(0);
      }
    };

    files.forEach((file) => {
      const formData = new FormData();
      formData.append("image", file);
      addImage.mutate(formData, {
        onSuccess: finish,
        onError: (error) => {
          toast.add({
            title: "Görsel eklenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
          finish();
        },
      });
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          className="h-9"
          disabled={addImage.isPending || uploadingCount > 0}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          {uploadingCount > 0 ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <ImagePlus className="size-4" />
          )}
          {uploadingCount > 0
            ? `Yükleniyor (${uploadingCount})...`
            : "Görsel Ekle"}
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG, JPEG, PNG, WEBP · En fazla 2 MB · Birden fazla görsel
          seçebilirsiniz
        </p>
      </div>
      <input
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        multiple
        ref={inputRef}
        type="file"
        onChange={handleFilesChange}
      />

      {gallery.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-10 text-center">
          <ImagePlus className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium">Galeride görsel yok</p>
          <p className="text-sm text-muted-foreground">
            Ürün detay sayfası için görsel ekleyin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.map((image, index) => (
            <div
              className="overflow-hidden rounded-xl border bg-background"
              key={image.id}
            >
              <div className="aspect-square w-full bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={product.title}
                  className="h-full w-full object-cover"
                  src={image.image}
                />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="text-xs text-muted-foreground">
                  #{(image.sort_order ?? 0) + 1}
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    aria-label="Yukarı taşı"
                    disabled={index === 0 || updateImage.isPending}
                    onClick={() => moveImage(image, "up")}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    aria-label="Aşağı taşı"
                    disabled={index === gallery.length - 1 || updateImage.isPending}
                    onClick={() => moveImage(image, "down")}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    aria-label="Görseli sil"
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeleting(image)}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              </div>
            </div>
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
            <AlertDialogTitle>Görseli sil</AlertDialogTitle>
            <AlertDialogDescription>
              Seçilen galeri görseli kalıcı olarak silinecek. Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              disabled={deleteImage.isPending}
              onClick={() => {
                if (!deleting) return;
                deleteImage.mutate(deleting.id, {
                  onSuccess: () => {
                    toast.add({ title: "Görsel silindi", type: "success" });
                    setDeleting(null);
                  },
                  onError: (error) => {
                    toast.add({
                      title: "Görsel silinemedi",
                      description: getErrorMessage(error),
                      type: "error",
                    });
                    setDeleting(null);
                  },
                });
              }}
              variant="destructive"
            >
              {deleteImage.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteImage.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
