"use client";

import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  CircleAlert,
  ImagePlus,
  LoaderCircle,
  Trash2,
  Undo2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useMyConsultant } from "@/lib/consultant-scope";
import { useConsultantQuery, useUpdateConsultant } from "@/lib/consultants";
import {
  IMAGE_UPLOAD_ACCEPT,
  buildFormData,
  imageFileError,
} from "@/lib/image-upload";
import { normalizePhoneToE164 } from "@/components/phone-input";

function entryKey(entry) {
  return entry.id != null ? String(entry.id) : entry.src;
}

export function ConsultantCertificates() {
  const { consultantId, hasConsultant } = useMyConsultant();
  const query = useConsultantQuery(hasConsultant ? consultantId : null);
  const update = useUpdateConsultant();

  const inputRef = useRef(null);
  const [newFiles, setNewFiles] = useState([]);
  const [removedKeys, setRemovedKeys] = useState([]);

  const consultant = query.data ?? null;
  const certificates = consultant?.certificates ?? [];

  const newFilesRef = useRef(newFiles);
  useEffect(() => {
    newFilesRef.current = newFiles;
  }, [newFiles]);
  useEffect(() => {
    return () => {
      for (const item of newFilesRef.current) {
        URL.revokeObjectURL(item.url);
      }
    };
  }, []);

  if (!hasConsultant) {
    return (
      <div className="w-full">
        <p className="text-sm text-muted-foreground">
          Danışman profiliniz bulunamadığı için sertifika yönetimi
          kullanılamıyor.
        </p>
      </div>
    );
  }

  if (query.isPending) {
    return (
      <div className="flex justify-center py-10">
        <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
        <CircleAlert className="size-6 text-destructive" />
        <p className="text-sm text-muted-foreground">
          {query.error instanceof ApiError
            ? query.error.message
            : "Sertifikalar yüklenemedi"}
        </p>
        <Button variant="outline" size="sm" onClick={() => query.refetch()}>
          Tekrar Dene
        </Button>
      </div>
    );
  }

  const visibleCertificates = certificates.filter(
    (entry) => !removedKeys.includes(entryKey(entry))
  );

  const hasChanges = newFiles.length > 0 || removedKeys.length > 0;

  const openPicker = () => inputRef.current?.click();

  const handleFilesChange = (event) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    const accepted = [];
    for (const file of files) {
      const fileError = imageFileError(file);
      if (fileError) {
        toast.add({
          title: `"${file.name}" eklenemedi`,
          description: fileError,
          type: "error",
        });
        continue;
      }
      accepted.push({ file, url: URL.createObjectURL(file) });
    }
    if (accepted.length > 0) {
      setNewFiles((current) => [...current, ...accepted]);
    }
  };

  const handleRemoveNew = (url) => {
    setNewFiles((current) => {
      const next = current.filter((item) => item.url !== url);
      URL.revokeObjectURL(url);
      return next;
    });
  };

  const handleRemoveExisting = (entry) => {
    setRemovedKeys((current) =>
      current.includes(entryKey(entry))
        ? current
        : [...current, entryKey(entry)]
    );
  };

  const handleUndoRemoveExisting = (entry) => {
    setRemovedKeys((current) =>
      current.filter((key) => key !== entryKey(entry))
    );
  };

  const handleSave = () => {
    if (!consultant || !hasChanges) return;

    const user = consultant.user ?? {};
    const fields = {
      _method: "PUT",
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      phone: normalizePhoneToE164(user.phone ?? consultant.phone ?? ""),
      email: user.email ?? consultant.email ?? "",
      title: consultant.title ?? "",
      biography: consultant.biography ?? "",
      education: consultant.education ?? "",
      experience: consultant.experience ?? "",
      slug: consultant.slug ?? "",
      is_active: consultant.is_active,
    };
    const formData = buildFormData(fields);
    for (const item of newFiles) {
      formData.append("certificates[]", item.file);
    }
    for (const key of removedKeys) {
      formData.append("certificates_remove[]", key);
    }

    update.mutate(
      { id: consultant.id, payload: formData },
      {
        onSuccess: () => {
          toast.add({
            title: "Sertifikalar güncellendi",
            type: "success",
          });
          for (const item of newFiles) {
            URL.revokeObjectURL(item.url);
          }
          setNewFiles([]);
          setRemovedKeys([]);
        },
        onError: (error) => {
          toast.add({
            title: "Sertifikalar kaydedilemedi",
            description:
              error instanceof ApiError
                ? error.message
                : "Beklenmeyen bir hata oluştu",
            type: "error",
          });
        },
      }
    );
  };

  return (
    <div className="rounded-2xl bg-surface-container-lowest p-6 shadow-sm sm:p-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-surface-container-high pb-6">
        <div className="flex items-center gap-3">
          <span className="h-6 w-2.5 rounded-full bg-accent-gold" />
          <div className="flex flex-col">
            <h2 className="font-title-lg text-title-lg text-primary">
              Sertifikalar
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Sertifika ve belgelerinizi buraya yükleyebilirsiniz. Birden fazla
              görsel ekleyebilirsiniz.
            </p>
          </div>
        </div>
        <span className="font-label-sm text-label-sm text-on-surface-variant">
          JPG, JPEG, PNG veya WEBP · en fazla 2 MB
        </span>
      </div>

      <input
        ref={inputRef}
        accept={IMAGE_UPLOAD_ACCEPT}
        className="hidden"
        disabled={update.isPending}
        id="certificates"
        multiple
        type="file"
        onChange={handleFilesChange}
      />

      {visibleCertificates.length === 0 && newFiles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-10 text-center">
          <BadgeCheck className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">Henüz sertifikanız yok</p>
          <p className="text-sm text-muted-foreground">
            Sertifika ve belgelerinizi yükleyerek profilinizi güçlendirin
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {visibleCertificates.map((entry) => (
            <div
              className="group relative overflow-hidden rounded-xl border bg-surface-container-low"
              key={entryKey(entry)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={entry.title ?? "Sertifika"}
                className="aspect-3/4 w-full object-cover"
                src={entry.src}
              />
              <button
                aria-label="Sertifikayı kaldır"
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/90 text-destructive shadow-sm transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                disabled={update.isPending}
                type="button"
                onClick={() => handleRemoveExisting(entry)}
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
          {newFiles.map((item) => (
            <div
              className="relative overflow-hidden rounded-xl border border-primary/40 bg-primary/5"
              key={item.url}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={item.file.name}
                className="aspect-3/4 w-full object-cover"
                src={item.url}
              />
              <button
                aria-label="Seçilen görseli kaldır"
                className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/90 text-destructive transition-colors hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
                disabled={update.isPending}
                type="button"
                onClick={() => handleRemoveNew(item.url)}
              >
                <Trash2 className="size-4" />
              </button>
              <span className="absolute inset-x-0 bottom-0 truncate bg-background/90 px-2 py-1 text-xs text-muted-foreground">
                {item.file.name}
              </span>
            </div>
          ))}
          <button
            className="flex min-h-32 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-input px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={update.isPending}
            type="button"
            onClick={openPicker}
          >
            <ImagePlus className="size-5" />
            <span className="font-medium text-foreground">Görsel Ekle</span>
            <span className="text-xs">Birden fazla seçebilirsiniz</span>
          </button>
        </div>
      )}

      {removedKeys.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <p className="text-xs text-amber-600">
            {removedKeys.length} sertifika kaydedildiğinde kaldırılacak
          </p>
          <Button
            className="h-7 text-xs"
            disabled={update.isPending}
            size="sm"
            type="button"
            variant="ghost"
            onClick={() => setRemovedKeys([])}
          >
            <Undo2 className="size-3.5" />
            Tümünü Geri Al
          </Button>
        </div>
      )}

      <div className="mt-6 flex items-center justify-end gap-2 border-t border-surface-container-high pt-4">
        <Button
          className="h-10"
          disabled={!hasChanges || update.isPending}
          onClick={handleSave}
          type="button"
        >
          {update.isPending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <BadgeCheck className="size-4" />
          )}
          {update.isPending ? "Kaydediliyor..." : "Sertifikaları Kaydet"}
        </Button>
      </div>
    </div>
  );
}
