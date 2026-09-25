"use client";

import { useMemo, useState } from "react";
import {
  CircleAlert,
  Layers,
  LoaderCircle,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
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
import { formatPrice } from "@/lib/format";
import {
  PRODUCT_FIELD_TYPES,
  variationOptionIds,
  variationOptionsLabel,
  useCreateProductVariation,
  useDeleteProductVariation,
  useUpdateProductVariation,
} from "@/lib/products";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

const selectClassName =
  "h-9 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

function VariationFormDialog({ product, variation, open, onOpenChange }) {
  const isEdit = Boolean(variation);
  const create = useCreateProductVariation(product.id);
  const update = useUpdateProductVariation();
  const mutation = isEdit ? update : create;

  const optionBasedFields = useMemo(
    () =>
      (product.optionBasedFields ?? []).filter(
        (field) => (field.options ?? []).length > 0
      ),
    [product.optionBasedFields]
  );

  const [sku, setSku] = useState(variation?.sku ?? "");
  const [price, setPrice] = useState(
    variation?.price != null ? String(variation.price) : String(product.price ?? "")
  );
  const [discountPrice, setDiscountPrice] = useState(
    variation?.discount_price != null ? String(variation.discount_price) : ""
  );
  const [stock, setStock] = useState(String(variation?.stock ?? 0));
  const [isActive, setIsActive] = useState(
    variation ? Boolean(variation.is_active) : true
  );
  const [sortOrder, setSortOrder] = useState(String(variation?.sort_order ?? 0));
  const [selectedIds, setSelectedIds] = useState(() => {
    const initial = {};
    for (const field of optionBasedFields) {
      initial[field.id] = [];
    }
    for (const option of variation?.options ?? []) {
      if (initial[option.product_field_id]) {
        initial[option.product_field_id].push(option.id);
      }
    }
    return initial;
  });
  const [skuError, setSkuError] = useState("");

  const selectedOptionIds = useMemo(
    () => Object.values(selectedIds).flat().filter((id) => id != null),
    [selectedIds]
  );

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedSku = sku.trim();
    if (!trimmedSku) {
      setSkuError("SKU zorunludur");
      return;
    }

    const payload = {
      sku: trimmedSku,
      price: price === "" ? 0 : Number(price),
      discount_price: discountPrice === "" ? null : Number(discountPrice),
      stock: stock === "" ? 0 : Number(stock),
      is_active: isActive,
      sort_order: Number(sortOrder) || 0,
      option_ids: selectedOptionIds,
    };

    if (isEdit) {
      update.mutate(
        { id: variation.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Varyasyon güncellendi", type: "success" });
            onOpenChange(false);
          },
          onError: (error) => {
            toast.add({
              title: "Varyasyon güncellenemedi",
              description: getErrorMessage(error),
              type: "error",
            });
          },
        }
      );
      return;
    }

    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Varyasyon eklendi", type: "success" });
        onOpenChange(false);
      },
      onError: (error) => {
        toast.add({
          title: "Varyasyon eklenemedi",
          description: getErrorMessage(error),
          type: "error",
        });
      },
    });
  };

  const toggleOption = (field, optionId) => {
    setSelectedIds((current) => {
      if (field.type === PRODUCT_FIELD_TYPES.CHECKBOX) {
        const selected = current[field.id] ?? [];
        return {
          ...current,
          [field.id]: selected.includes(optionId)
            ? selected.filter((id) => id !== optionId)
            : [...selected, optionId],
        };
      }
      return { ...current, [field.id]: [optionId] };
    });
  };

  const pending = mutation.isPending;
  const hasFields = optionBasedFields.length > 0;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Varyasyonu Düzenle" : "Yeni Varyasyon"}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? variationOptionsLabel(variation) : "Varyasyon bilgilerini girin"}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit}>
          {hasFields && (
            <div className="flex flex-col gap-3">
              <Label>Seçenekler</Label>
              {optionBasedFields.map((field) => (
                <div className="flex flex-col gap-1.5" key={field.id}>
                  <p className="text-xs font-medium text-muted-foreground">
                    {field.name}
                    {field.type === PRODUCT_FIELD_TYPES.CHECKBOX && " (birden fazla seçebilirsiniz)"}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {(field.options ?? []).map((option) => {
                      const isSelected = (selectedIds[field.id] ?? []).includes(
                        option.id
                      );
                      return (
                        <button
                          className={
                            isSelected
                              ? "inline-flex items-center gap-1 rounded-full border border-primary bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                              : "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors hover:bg-accent"
                          }
                          key={option.id}
                          onClick={() => toggleOption(field, option.id)}
                          type="button"
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="variation_sku">SKU</Label>
            <Input
              id="variation_sku"
              onChange={(event) => {
                setSku(event.target.value);
                setSkuError("");
              }}
              placeholder="Örn. KLK-KIRMIZI-S"
              type="text"
              value={sku}
            />
            {skuError && (
              <p className="text-xs text-destructive">{skuError}</p>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="variation_price">Fiyat (TL)</Label>
              <Input
                id="variation_price"
                inputMode="decimal"
                min="0"
                onChange={(event) => setPrice(event.target.value)}
                step="0.01"
                type="number"
                value={price}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="variation_discount_price">
                İndirimli Fiyat (TL)
              </Label>
              <Input
                id="variation_discount_price"
                inputMode="decimal"
                min="0"
                onChange={(event) => setDiscountPrice(event.target.value)}
                placeholder="Boş bırakılırsa indirim yok"
                step="0.01"
                type="number"
                value={discountPrice}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="variation_stock">Stok</Label>
              <Input
                id="variation_stock"
                inputMode="numeric"
                min="0"
                onChange={(event) => setStock(event.target.value)}
                step="1"
                type="number"
                value={stock}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="variation_sort_order">Sıra</Label>
              <Input
                id="variation_sort_order"
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
              <Label htmlFor="variation_is_active">Aktif</Label>
              <p className="text-xs text-muted-foreground">
                Satışta görünecek varyasyonlar
              </p>
            </div>
            <Switch
              checked={isActive}
              id="variation_is_active"
              onCheckedChange={setIsActive}
            />
          </div>

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

function buildCombinations(optionBasedFields) {
  let combinations = [[]];

  for (const field of optionBasedFields) {
    const options = field.options ?? [];
    if (options.length === 0) continue;
    const next = [];
    for (const combination of combinations) {
      for (const option of options) {
        next.push([...combination, option]);
      }
    }
    combinations = next;
  }

  return combinations.filter((combination) => combination.length > 0);
}

function combinationSku(combination) {
  return combination
    .map((option) => option.label.trim())
    .filter(Boolean)
    .join("-")
    .slice(0, 100);
}

export function ProductVariations({ product }) {
  const [variationDialog, setVariationDialog] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [generatorPrice, setGeneratorPrice] = useState(
    product.price != null ? String(product.price) : ""
  );
  const [generatorStock, setGeneratorStock] = useState("0");
  const [generating, setGenerating] = useState(false);
  const [generatorOpen, setGeneratorOpen] = useState(false);

  const create = useCreateProductVariation(product.id);
  const updateMutation = useUpdateProductVariation();
  const deleteMutation = useDeleteProductVariation();

  const optionBasedFields = useMemo(
    () =>
      (product.optionBasedFields ?? []).filter(
        (field) => (field.options ?? []).length > 0
      ),
    [product.optionBasedFields]
  );

  const variations = product.variations ?? [];
  const existingSets = new Set(
    variations.map((variation) => variationOptionIds(variation))
  );

  const missingCombinations = useMemo(() => {
    const combinations = buildCombinations(optionBasedFields);
    return combinations.filter((combination) => {
      const ids = combination
        .map((option) => option.id)
        .sort((a, b) => a - b)
        .join(",");
      return !existingSets.has(ids);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionBasedFields, variations]);

  const hasFields = optionBasedFields.length > 0;

  const handleGenerate = async () => {
    if (missingCombinations.length === 0) return;
    setGenerating(true);

    const price = generatorPrice === "" ? 0 : Number(generatorPrice);
    const stock = generatorStock === "" ? 0 : Number(generatorStock);
    let created = 0;
    let failed = 0;

    for (const combination of missingCombinations) {
      try {
        await create.mutateAsync({
          sku: combinationSku(combination),
          price,
          discount_price: null,
          stock,
          is_active: true,
          sort_order: variations.length + created,
          option_ids: combination.map((option) => option.id),
        });
        created += 1;
      } catch {
        failed += 1;
      }
    }

    setGenerating(false);
    setGeneratorOpen(false);

    if (created > 0) {
      toast.add({
        title: `${created} varyasyon oluşturuldu`,
        type: "success",
      });
    }
    if (failed > 0) {
      toast.add({
        title: `${failed} varyasyon oluşturulamadı`,
        description: "SKU çakışması olabilir, kontrol edin",
        type: "error",
      });
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {hasFields ? (
        <div className="flex flex-wrap items-center gap-2">
          <Button
            className="h-9"
            onClick={() => setVariationDialog({ variation: null })}
            type="button"
          >
            <Plus className="size-4" />
            Varyasyon Ekle
          </Button>
          {missingCombinations.length > 0 && (
            <Button
              className="h-9"
              disabled={generating}
              onClick={() => setGeneratorOpen(true)}
              type="button"
              variant="outline"
            >
              <Sparkles className="size-4" />
              Eksik Kombinasyonları Üret ({missingCombinations.length})
            </Button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-10 text-center">
          <Layers className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium">
            Varyasyon için seçenekli alan gerekli
          </p>
          <p className="text-sm text-muted-foreground">
            Custom Fields bölümünden SELECT, RADIO veya CHECKBOX tipinde alan
            ekleyin; seçeneklerden varyasyon kombinasyonları oluşturulur
          </p>
        </div>
      )}

      {variations.length === 0 && hasFields && (
        <div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed px-4 py-10 text-center">
          <Layers className="size-7 text-muted-foreground" />
          <p className="text-sm font-medium">Henüz varyasyon yok</p>
          <p className="text-sm text-muted-foreground">
            Manuel ekleyin veya seçeneklerden kombinasyon üretin
          </p>
        </div>
      )}

      {variations.length > 0 && (
        <div className="flex flex-col gap-2">
          {variations.map((variation) => (
            <div
              className="flex flex-wrap items-center gap-3 rounded-lg border bg-background px-3 py-2.5"
              key={variation.id}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {variationOptionsLabel(variation)}
                </p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {[
                    `SKU: ${variation.sku}`,
                    formatPrice(variation.effective_price),
                    variation.has_discount
                      ? `Liste ${formatPrice(variation.price)}`
                      : null,
                    `Stok: ${variation.stock}`,
                    `Sıra: ${variation.sort_order}`,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
              <span
                className={
                  variation.is_active
                    ? "inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
                    : "inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                }
              >
                {variation.is_active ? "Aktif" : "Pasif"}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  aria-label="Varyasyonu düzenle"
                  onClick={() => setVariationDialog({ variation })}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Pencil className="size-4" />
                </Button>
                <Button
                  aria-label="Varyasyonu sil"
                  className="text-destructive hover:text-destructive"
                  onClick={() => setDeleting(variation)}
                  size="icon-sm"
                  type="button"
                  variant="ghost"
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <VariationFormDialog
        key={
          variationDialog
            ? `variation-${variationDialog.variation?.id ?? "new"}`
            : "variation-closed"
        }
        onOpenChange={(open) => {
          if (!open) setVariationDialog(null);
        }}
        open={Boolean(variationDialog)}
        product={product}
        variation={variationDialog?.variation ?? null}
      />

      <Dialog
        onOpenChange={(open) => {
          if (!open) setGeneratorOpen(false);
        }}
        open={generatorOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kombinasyonları Üret</DialogTitle>
            <DialogDescription>
              {missingCombinations.length} eksik varyasyon kombinasyonu
              bulunuyor. Üretilecek varyasyonlara aşağıdaki fiyat ve stok
              uygulanır.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="generator_price">Fiyat (TL)</Label>
              <Input
                id="generator_price"
                inputMode="decimal"
                min="0"
                onChange={(event) => setGeneratorPrice(event.target.value)}
                step="0.01"
                type="number"
                value={generatorPrice}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="generator_stock">Stok</Label>
              <Input
                id="generator_stock"
                inputMode="numeric"
                min="0"
                onChange={(event) => setGeneratorStock(event.target.value)}
                step="1"
                type="number"
                value={generatorStock}
              />
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto rounded-lg border p-2 text-xs text-muted-foreground">
            {missingCombinations
              .slice(0, 20)
              .map((combination, index) => (
                <p key={index}>
                  {combination.map((option) => option.label).join(" / ")}
                </p>
              ))}
            {missingCombinations.length > 20 && (
              <p>+{missingCombinations.length - 20} kombinasyon daha</p>
            )}
          </div>
          <DialogFooter>
            <Button
              className="h-10"
              disabled={generating}
              onClick={() => setGeneratorOpen(false)}
              type="button"
              variant="outline"
            >
              İptal
            </Button>
            <Button
              className="h-10"
              disabled={generating}
              onClick={handleGenerate}
              type="button"
            >
              {generating && <LoaderCircle className="size-4 animate-spin" />}
              {generating
                ? "Oluşturuluyor..."
                : `${missingCombinations.length} Varyasyon Oluştur`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        open={Boolean(deleting)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Varyasyonu sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting ? variationOptionsLabel(deleting) : ""}&quot;
              varyasyonu silinecek. Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (!deleting) return;
                deleteMutation.mutate(deleting.id, {
                  onSuccess: () => {
                    toast.add({ title: "Varyasyon silindi", type: "success" });
                    setDeleting(null);
                  },
                  onError: (error) => {
                    toast.add({
                      title: "Varyasyon silinemedi",
                      description: getErrorMessage(error),
                      type: "error",
                    });
                    setDeleting(null);
                  },
                });
              }}
              variant="destructive"
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
