"use client";

import { useState } from "react";
import {
  Asterisk,
  Check,
  ListPlus,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { cn } from "@/lib/utils";
import {
  PRODUCT_FIELD_TYPE_LABELS,
  PRODUCT_FIELD_TYPES,
  isOptionBasedFieldType,
  useCreateProductField,
  useCreateProductFieldOption,
  useDeleteProductField,
  useDeleteProductFieldOption,
  useUpdateProductField,
  useUpdateProductFieldOption,
} from "@/lib/products";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

function FieldFormDialog({ product, field, open, onOpenChange }) {
  const isEdit = Boolean(field);
  const create = useCreateProductField(product.id);
  const update = useUpdateProductField();
  const mutation = isEdit ? update : create;

  const [name, setName] = useState(field?.name ?? "");
  const [key, setKey] = useState(field?.key ?? "");
  const [type, setType] = useState(
    field?.type ?? PRODUCT_FIELD_TYPES.SELECT
  );
  const [isRequired, setIsRequired] = useState(
    field ? Boolean(field.is_required) : false
  );
  const [sortOrder, setSortOrder] = useState(String(field?.sort_order ?? 0));
  const [optionLabels, setOptionLabels] = useState([""]);
  const [nameError, setNameError] = useState("");
  const [optionsError, setOptionsError] = useState("");

  const optionBased = isOptionBasedFieldType(type);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedKey = key.trim();
    if (!trimmedName) {
      setNameError("Alan adı zorunludur");
      return;
    }
    if (!isEdit && optionBased) {
      const labels = optionLabels.map((label) => label.trim()).filter(Boolean);
      if (labels.length === 0) {
        setOptionsError("En az bir seçenek girin");
        return;
      }
    }

    const basePayload = {
      name: trimmedName,
      ...(trimmedKey
        ? { key: trimmedKey.toLowerCase() }
        : isEdit
          ? {}
          : { key: null }),
      type,
      is_required: isRequired,
      sort_order: Number(sortOrder) || 0,
    };

    if (isEdit) {
      update.mutate(
        { id: field.id, payload: basePayload },
        {
          onSuccess: () => {
            toast.add({ title: "Alan güncellendi", type: "success" });
            onOpenChange(false);
          },
          onError: (error) => {
            toast.add({
              title: "Alan güncellenemedi",
              description: getErrorMessage(error),
              type: "error",
            });
          },
        }
      );
      return;
    }

    const payload = {
      ...basePayload,
      ...(optionBased
        ? {
            options: optionLabels
              .map((label) => label.trim())
              .filter(Boolean)
              .map((label, index) => ({ label, sort_order: index })),
          }
        : {}),
    };

    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Alan eklendi", type: "success" });
        onOpenChange(false);
      },
      onError: (error) => {
        toast.add({
          title: "Alan eklenemedi",
          description: getErrorMessage(error),
          type: "error",
        });
      },
    });
  };

  const pending = mutation.isPending;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Alanı Düzenle" : "Yeni Alan"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Alan bilgilerini güncelleyin; seçenekler kart üzerinde ayrıca yönetilir"
              : "Ürüne dinamik bir alan ekleyin"}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="field_name">Alan Adı</Label>
            <Input
              id="field_name"
              onChange={(event) => {
                setName(event.target.value);
                setNameError("");
              }}
              placeholder="Örn. Renk"
              type="text"
              value={name}
            />
            {nameError && (
              <p className="text-xs text-destructive">{nameError}</p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="field_key">Key (opsiyonel)</Label>
            <Input
              id="field_key"
              onChange={(event) => setKey(event.target.value)}
              placeholder="renk (boş bırakılırsa otomatik üretilir)"
              type="text"
              value={key}
            />
            <p className="text-xs text-muted-foreground">
              Sadece küçük harf, rakam ve alt çizgi (a-z, 0-9, _)
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="field_type">Tip</Label>
              <select
                className={selectClassName}
                id="field_type"
                onChange={(event) => {
                  setType(event.target.value);
                  setOptionsError("");
                }}
                value={type}
              >
                <option value={PRODUCT_FIELD_TYPES.INPUT}>Metin Girişi</option>
                <option value={PRODUCT_FIELD_TYPES.SELECT}>Seçim Listesi</option>
                <option value={PRODUCT_FIELD_TYPES.RADIO}>Radyo Buton</option>
                <option value={PRODUCT_FIELD_TYPES.CHECKBOX}>
                  Onay Kutusu
                </option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="field_sort_order">Sıra</Label>
              <Input
                id="field_sort_order"
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
              <Label htmlFor="field_is_required">Zorunlu</Label>
              <p className="text-xs text-muted-foreground">
                Müşteri satın alırken doldurmak zorunda
              </p>
            </div>
            <Switch
              checked={isRequired}
              id="field_is_required"
              onCheckedChange={setIsRequired}
            />
          </div>

          {!isEdit && optionBased && (
            <div className="flex flex-col gap-2">
              <Label>Seçenekler</Label>
              <div className="flex flex-col gap-2">
                {optionLabels.map((label, index) => (
                  <div className="flex items-center gap-2" key={index}>
                    <Input
                      onChange={(event) => {
                        setOptionLabels((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index ? event.target.value : item
                          )
                        );
                      }}
                      placeholder={`Seçenek ${index + 1} (Örn. Kırmızı)`}
                      type="text"
                      value={label}
                    />
                    <Button
                      aria-label="Seçeneği kaldır"
                      disabled={optionLabels.length === 1}
                      onClick={() =>
                        setOptionLabels((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index)
                        )
                      }
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <X className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                className="h-8 self-start"
                onClick={() => setOptionLabels((current) => [...current, ""])}
                size="sm"
                type="button"
                variant="outline"
              >
                <Plus className="size-3.5" />
                Seçenek Ekle
              </Button>
              {optionsError && (
                <p className="text-xs text-destructive">{optionsError}</p>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              className="h-10"
              onClick={() => onOpenChange(false)}
              type="button"
              variant="outline"
            >
              İptal
            </Button>
            <Button className="h-10" disabled={pending} type="submit">
              {pending && <LoaderCircle className="size-4 animate-spin" />}
              {pending ? "Kaydediliyor..." : isEdit ? "Kaydet" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldOptionsEditor({ field }) {
  const [newLabel, setNewLabel] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingLabel, setEditingLabel] = useState("");

  const createOption = useCreateProductFieldOption(field.id);
  const updateOption = useUpdateProductFieldOption();
  const deleteOption = useDeleteProductFieldOption();

  const options = field.options ?? [];

  const handleAddSubmit = (event) => {
    event.preventDefault();
    const label = newLabel.trim();
    if (!label) return;
    createOption.mutate(
      { label, sort_order: options.length },
      {
        onSuccess: () => setNewLabel(""),
        onError: (error) => {
          toast.add({
            title: "Seçenek eklenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  const handleUpdate = (option) => {
    const label = editingLabel.trim();
    if (!label) return;
    updateOption.mutate(
      { id: option.id, payload: { label } },
      {
        onSuccess: () => setEditingId(null),
        onError: (error) => {
          toast.add({
            title: "Seçenek güncellenemedi",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-2 border-t border-border/60 pt-3">
      <p className="text-xs font-medium text-muted-foreground">Seçenekler</p>
      {options.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Henüz seçenek yok — aşağıdan ekleyin
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) =>
            editingId === option.id ? (
              <span className="flex items-center gap-1" key={option.id}>
                <Input
                  autoFocus
                  className="h-7 w-32 text-xs"
                  onChange={(event) => setEditingLabel(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleUpdate(option);
                    }
                    if (event.key === "Escape") setEditingId(null);
                  }}
                  type="text"
                  value={editingLabel}
                />
                <Button
                  disabled={updateOption.isPending}
                  onClick={() => handleUpdate(option)}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <Check className="size-3.5" />
                </Button>
                <Button
                  onClick={() => setEditingId(null)}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <X className="size-3.5" />
                </Button>
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 rounded-full border bg-muted/60 py-1 pl-3 pr-1.5 text-xs"
                key={option.id}
              >
                {option.label}
                <button
                  aria-label={`${option.label} düzenle`}
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  onClick={() => {
                    setEditingId(option.id);
                    setEditingLabel(option.label);
                  }}
                  type="button"
                >
                  <Pencil className="size-3" />
                </button>
                <button
                  aria-label={`${option.label} sil`}
                  className="rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-destructive"
                  onClick={() => {
                    deleteOption.mutate(option.id, {
                      onError: (error) => {
                        toast.add({
                          title: "Seçenek silinemedi",
                          description: getErrorMessage(error),
                          type: "error",
                        });
                      },
                    });
                  }}
                  type="button"
                >
                  <Trash2 className="size-3" />
                </button>
              </span>
            )
          )}
        </div>
      )}
      <form className="flex items-center gap-2" onSubmit={handleAddSubmit}>
        <Input
          className="h-7 w-40 text-xs"
          onChange={(event) => setNewLabel(event.target.value)}
          placeholder="Yeni seçenek"
          type="text"
          value={newLabel}
        />
        <Button
          disabled={createOption.isPending || !newLabel.trim()}
          size="sm"
          type="submit"
          variant="outline"
        >
          {createOption.isPending ? (
            <LoaderCircle className="size-3.5 animate-spin" />
          ) : (
            <Plus className="size-3.5" />
          )}
          Ekle
        </Button>
      </form>
    </div>
  );
}

export function ProductFields({ product }) {
  const [fieldDialog, setFieldDialog] = useState(null);
  const [deletingField, setDeletingField] = useState(null);

  const deleteField = useDeleteProductField();
  const fields = product.fields ?? [];

  return (
    <div className="flex flex-col gap-3">
      <Button
        className="h-9 self-start"
        onClick={() => setFieldDialog({ field: null })}
        type="button"
      >
        <ListPlus className="size-4" />
        Alan Ekle
      </Button>

      {fields.length === 0 ? (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-10 text-center">
          <ListPlus className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium">Henüz alan yok</p>
          <p className="text-sm text-muted-foreground">
            Renk, beden gibi dinamik alanlar ekleyin
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {fields.map((field) => (
            <div
              className="flex flex-col gap-3 rounded-xl border bg-muted/30 p-3"
              key={field.id}
            >
              <div className="flex flex-wrap items-center gap-2">
                <p className="min-w-0 flex-1 truncate text-sm font-semibold">
                  {field.name}
                  {field.is_required && (
                    <Asterisk
                      aria-label="Zorunlu alan"
                      className="ml-0.5 inline size-3.5 text-destructive"
                    />
                  )}
                </p>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                  {PRODUCT_FIELD_TYPE_LABELS[field.type] ?? field.type}
                </span>
                <span className="text-xs text-muted-foreground">
                  Sıra: {field.sort_order}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    aria-label={`${field.name} düzenle`}
                    onClick={() => setFieldDialog({ field })}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    aria-label={`${field.name} sil`}
                    className="text-destructive hover:text-destructive"
                    onClick={() => setDeletingField(field)}
                    size="icon-sm"
                    type="button"
                    variant="ghost"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {field.key}
              </p>
              {isOptionBasedFieldType(field.type) && (
                <FieldOptionsEditor field={field} />
              )}
            </div>
          ))}
        </div>
      )}

      <FieldFormDialog
        field={fieldDialog?.field ?? null}
        key={
          fieldDialog ? (fieldDialog.field?.id ?? "new") : "field-closed"
        }
        onOpenChange={(open) => {
          if (!open) setFieldDialog(null);
        }}
        open={Boolean(fieldDialog)}
        product={product}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeletingField(null);
        }}
        open={Boolean(deletingField)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Alanı sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deletingField?.name ?? ""}&quot; alanı ve seçenekleri
              silinecek. Bu alanı kullanan varyasyon bağlantıları da etkilenebilir.
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              disabled={deleteField.isPending}
              onClick={() => {
                if (!deletingField) return;
                deleteField.mutate(deletingField.id, {
                  onSuccess: () => {
                    toast.add({ title: "Alan silindi", type: "success" });
                    setDeletingField(null);
                  },
                  onError: (error) => {
                    toast.add({
                      title: "Alan silinemedi",
                      description: getErrorMessage(error),
                      type: "error",
                    });
                    setDeletingField(null);
                  },
                });
              }}
              variant="destructive"
            >
              {deleteField.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteField.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
