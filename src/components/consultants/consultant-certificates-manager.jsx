"use client";

import { useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
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
import { isApiError } from "@/lib/query-errors";
import { toast } from "@/components/ui/toast";
import { IMAGE_ALLOWED_MIME_TYPES, IMAGE_MAX_SIZE_BYTES } from "@/lib/image-upload";
import {
  useAddConsultantCertificate,
  useDeleteConsultantCertificate,
  useUpdateConsultantCertificate,
} from "@/lib/consultants";

function getErrorMessage(error) {
  if (isApiError(error)) {
    const imageErrors = error.errors?.image;
    if (Array.isArray(imageErrors) && imageErrors.length > 0) {
      return imageErrors[0];
    }
    if (typeof imageErrors === "string") return imageErrors;
    return error.message || "Beklenmeyen bir hata oluştu";
  }
  return "Beklenmeyen bir hata oluştu";
}

export function ConsultantCertificatesManager({ consultant }) {
  const inputRef = useRef(null);
  const [deleting, setDeleting] = useState(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  const addCertificate = useAddConsultantCertificate(consultant.id);
  const updateCertificate = useUpdateConsultantCertificate();
  const deleteCertificate = useDeleteConsultantCertificate();

  const certificates = consultant.certificates ?? [];

  const moveCertificate = (certificate, direction) => {
    const index = certificates.findIndex((item) => item.id === certificate.id);
    if (index < 0) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= certificates.length) return;

    const current = certificates[index];
    const target = certificates[targetIndex];

    updateCertificate.mutate(
      { id: current.id, payload: { sort_order: target.sort_order ?? 0 } },
      {
        onSuccess: () => {
          updateCertificate.mutate({
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
        title: "Sertifika eklenemedi",
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
      addCertificate.mutate(formData, {
        onSuccess: () => {
          toast.add({
            title: "Sertifika yüklendi",
            description: file.name,
            type: "success",
          });
          finish();
        },
        onError: (error) => {
          toast.add({
            title: "Sertifika yüklenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
          finish();
        },
      });
    });
  };

  const busy =
    addCertificate.isPending ||
    updateCertificate.isPending ||
    deleteCertificate.isPending ||
    uploadingCount > 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          className="h-9"
          disabled={busy}
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
            : "Sertifika Ekle"}
        </Button>
        <p className="text-xs text-muted-foreground">
          JPG, JPEG, PNG, WEBP · En fazla 2 MB · Birden fazla dosya
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

      {certificates.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-10 text-center">
          <BadgeCheck className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium">Henüz sertifika yok</p>
          <p className="text-sm text-muted-foreground">
            Danışmanın sertifika ve belgelerini yükleyin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {certificates.map((certificate, index) => (
            <div
              className="overflow-hidden rounded-xl border bg-background"
              key={certificate.id}
            >
              <div className="aspect-3/4 w-full bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt={`Sertifika #${(certificate.sort_order ?? 0) + 1}`}
                  className="h-full w-full object-cover"
                  src={certificate.src}
                />
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="text-xs text-muted-foreground">
                  #{(certificate.sort_order ?? 0) + 1}
                </span>
                <div className="flex items-center gap-0.5">
                  <Button
                    aria-label="Yukarı taşı"
                    disabled={index === 0 || busy}
                    onClick={() => moveCertificate(certificate, "up")}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowUp className="size-3.5" />
                  </Button>
                  <Button
                    aria-label="Aşağı taşı"
                    disabled={
                      index === certificates.length - 1 || busy
                    }
                    onClick={() => moveCertificate(certificate, "down")}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <ArrowDown className="size-3.5" />
                  </Button>
                  <Button
                    aria-label="Sertifikayı sil"
                    className="text-destructive hover:text-destructive"
                    disabled={busy}
                    onClick={() => setDeleting(certificate)}
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
            <AlertDialogTitle>Sertifikayı sil</AlertDialogTitle>
            <AlertDialogDescription>
              Seçilen sertifika görseli kalıcı olarak silinecek. Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              disabled={deleteCertificate.isPending}
              onClick={() => {
                if (!deleting) return;
                deleteCertificate.mutate(deleting.id, {
                  onSuccess: () => {
                    toast.add({
                      title: "Sertifika silindi",
                      type: "success",
                    });
                    setDeleting(null);
                  },
                  onError: (error) => {
                    toast.add({
                      title: "Sertifika silinemedi",
                      description: getErrorMessage(error),
                      type: "error",
                    });
                    setDeleting(null);
                  },
                });
              }}
              variant="destructive"
            >
              {deleteCertificate.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteCertificate.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
