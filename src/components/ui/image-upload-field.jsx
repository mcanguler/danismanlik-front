"use client";

import { useRef, useState } from "react";
import { ImagePlus, Trash2, Undo2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGE_UPLOAD_ACCEPT } from "@/lib/image-upload";

export function ImageUploadField({
  existingUrl = "",
  removed = false,
  onSelect,
  onClearSelection,
  onRemoveExisting,
  onUndoRemoveExisting,
  error,
  disabled = false,
  id = "image",
}) {
  const inputRef = useRef(null);
  const [selected, setSelected] = useState(null);

  const previewSrc = selected?.url || (removed ? "" : existingUrl);
  const hasNewFile = Boolean(selected);

  const openPicker = () => inputRef.current?.click();

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const result = onSelect?.(file);
    if (result === false) return;
    if (selected?.url) URL.revokeObjectURL(selected.url);
    setSelected({ file, url: URL.createObjectURL(file) });
  };

  const handleClearSelection = () => {
    if (selected?.url) URL.revokeObjectURL(selected.url);
    setSelected(null);
    onClearSelection?.();
  };

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        accept={IMAGE_UPLOAD_ACCEPT}
        className="hidden"
        disabled={disabled}
        id={id}
        type="file"
        onChange={handleFileChange}
      />
      {previewSrc ? (
        <div className="flex items-center gap-3 rounded-lg border border-input p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Görsel önizleme"
            className="size-16 shrink-0 rounded-md border border-border object-cover"
            src={previewSrc}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {hasNewFile ? selected.file.name : "Mevcut görsel"}
            </p>
            <p className="text-xs text-muted-foreground">
              JPG, JPEG, PNG veya WEBP · en fazla 2 MB
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8"
              disabled={disabled}
              onClick={openPicker}
            >
              <ImagePlus className="size-4" />
              Değiştir
            </Button>
            {hasNewFile ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                onClick={handleClearSelection}
                aria-label="Seçilen görseli kaldır"
              >
                <Trash2 className="size-4" />
              </Button>
            ) : removed ? (
              onUndoRemoveExisting && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  disabled={disabled}
                  onClick={onUndoRemoveExisting}
                >
                  <Undo2 className="size-4" />
                  Geri Al
                </Button>
              )
            ) : (
              onRemoveExisting && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  disabled={disabled}
                  onClick={onRemoveExisting}
                  aria-label="Mevcut görseli kaldır"
                >
                  <Trash2 className="size-4" />
                </Button>
              )
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-input px-4 py-6 text-sm text-muted-foreground transition-colors hover:bg-accent/50 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={disabled}
          onClick={openPicker}
        >
          <ImagePlus className="size-5" />
          <span className="font-medium text-foreground">Görsel Seç</span>
          <span className="text-xs">JPG, JPEG, PNG veya WEBP · en fazla 2 MB</span>
        </button>
      )}
      {removed && !hasNewFile && (
        <p className="text-xs text-amber-600">
          Mevcut görsel kaydedildiğinde kaldırılacak
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
