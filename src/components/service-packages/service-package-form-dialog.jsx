"use client";

import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle, Search } from "lucide-react";
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
import {
  IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_MB,
  buildFormData,
  imageFileError,
} from "@/lib/image-upload";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { useServicesQuery } from "@/lib/services";
import {
  useCreateServicePackage,
  useServicePackageCategoriesQuery,
  useUpdateServicePackage,
} from "@/lib/service-packages";
import { slugify } from "@/lib/slugify";

const packageFormSchema = z.object({
  category_id: z.coerce
    .number({ message: "Kategori seçin" })
    .int({ message: "Kategori seçin" })
    .min(1, "Kategori seçin"),
  name: z.string().min(1, "Name zorunludur"),
  slug: z
    .string()
    .min(1, "Slug zorunludur")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Geçerli bir slug girin"),
  description: z.string(),
  image: z
    .any()
    .refine(
      (value) => value == null || IMAGE_ALLOWED_MIME_TYPES.includes(value.type),
      "Sadece JPG, JPEG, PNG ve WEBP formatları desteklenir"
    )
    .refine(
      (value) => value == null || value.size <= IMAGE_MAX_SIZE_BYTES,
      `Dosya boyutu en fazla ${IMAGE_MAX_SIZE_MB} MB olabilir`
    ),
  seo_title: z.string(),
  seo_description: z.string(),
  price: z.coerce
    .number({ message: "Geçerli bir fiyat girin" })
    .min(0, "Fiyat 0 veya daha büyük olmalıdır"),
  is_active: z.boolean(),
  sort_order: z.coerce
    .number({ message: "Geçerli bir sıra numarası girin" })
    .int({ message: "Sıra numarası tam sayı olmalıdır" })
    .min(0, "Sıra numarası 0 veya daha büyük olmalıdır"),
});

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

function toFormValues(servicePackage) {
  return {
    category_id: servicePackage?.category?.id ?? servicePackage?.category_id ?? "",
    name: servicePackage?.name ?? "",
    slug: servicePackage?.slug ?? "",
    description: servicePackage?.description ?? "",
    image: null,
    seo_title: servicePackage?.seo_title ?? "",
    seo_description: servicePackage?.seo_description ?? "",
    price: servicePackage?.price ?? "",
    is_active: servicePackage ? Boolean(servicePackage.is_active) : true,
    sort_order: servicePackage?.sort_order ?? 0,
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function ServicePackageFormDialog({ open, servicePackage, onOpenChange }) {
  const isEdit = Boolean(servicePackage);
  const create = useCreateServicePackage();
  const update = useUpdateServicePackage();
  const mutation = isEdit ? update : create;

  const categoriesQuery = useServicePackageCategoriesQuery();
  const categories = categoriesQuery.data ?? [];
  const servicesQuery = useServicesQuery();
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceQuantities, setServiceQuantities] = useState(() => {
    const initial = {};
    for (const service of servicePackage?.services ?? []) {
      const quantity = Number(service.quantity ?? 1);
      initial[Number(service.id)] = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;
    }
    return initial;
  });

  const form = useForm({
    resolver: zodResolver(packageFormSchema),
    defaultValues: toFormValues(servicePackage),
  });
  const [imageRemoved, setImageRemoved] = useState(false);

  const fieldNames = Object.keys(packageFormSchema.shape);
  const selectedServiceIds = Object.keys(serviceQuantities).map(Number);

  const filteredServices = useMemo(() => {
    const services = servicesQuery.data ?? [];
    const term = serviceSearch.trim().toLocaleLowerCase("tr");
    if (!term) return services;
    return services.filter((service) =>
      service.name.toLocaleLowerCase("tr").includes(term)
    );
  }, [servicesQuery.data, serviceSearch]);

  const handleError = (error) => {
    if (error instanceof ApiError) {
      let serviceQuantitiesMessage = null;
      for (const [field, messages] of Object.entries(error.errors ?? {})) {
        const message = Array.isArray(messages) ? messages[0] : messages;
        if (fieldNames.includes(field)) {
          form.setError(field, { message });
        } else if (
          field.startsWith("service_quantities") &&
          !serviceQuantitiesMessage
        ) {
          serviceQuantitiesMessage = message;
        }
      }
      form.setError("root", {
        message: serviceQuantitiesMessage ?? error.message,
      });
    } else {
      form.setError("root", { message: getErrorMessage(error) });
    }
  };

  const toggleService = (serviceId) => {
    setServiceQuantities((current) => {
      const next = { ...current };
      if (Object.prototype.hasOwnProperty.call(next, serviceId)) {
        delete next[serviceId];
      } else {
        next[serviceId] = 1;
      }
      return next;
    });
  };

  const setServiceQuantity = (serviceId, quantity) => {
    setServiceQuantities((current) => ({ ...current, [serviceId]: quantity }));
  };

  const onSubmit = form.handleSubmit((values) => {
    const { image, ...rest } = values;
    const fields = {
      category_id: Number(rest.category_id),
      name: rest.name,
      description: rest.description ?? "",
      seo_title: rest.seo_title ?? "",
      seo_description: rest.seo_description ?? "",
      price: Number(rest.price),
      is_active: rest.is_active,
      sort_order: Number(rest.sort_order),
    };
    if (!isEdit || rest.slug !== servicePackage.slug) {
      fields.slug = rest.slug;
    }
    const hasNewImage =
      typeof File !== "undefined" && image instanceof File;

    const appendServiceItems = (formData) => {
      selectedServiceIds.forEach((serviceId, index) => {
        formData.append(`service_ids[${index}]`, String(serviceId));
        const parsed = Number.parseInt(serviceQuantities[serviceId], 10);
        const quantity = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
        formData.append(`service_quantities[${index}][service_id]`, String(serviceId));
        formData.append(`service_quantities[${index}][quantity]`, String(quantity));
      });
    };

    if (isEdit) {
      let payload;
      if (hasNewImage) {
        payload = buildFormData({ _method: "PUT", ...fields });
        appendServiceItems(payload);
        payload.append("image", image);
      } else if (imageRemoved) {
        payload = buildFormData({ _method: "PUT", ...fields, image_remove: 1 });
        appendServiceItems(payload);
      } else {
        payload = {
          ...fields,
          description: rest.description ? rest.description : null,
          seo_title: rest.seo_title ? rest.seo_title : null,
          seo_description: rest.seo_description ? rest.seo_description : null,
          service_ids: selectedServiceIds,
          service_quantities: selectedServiceIds.map((serviceId) => {
            const parsed = Number.parseInt(serviceQuantities[serviceId], 10);
            return {
              service_id: serviceId,
              quantity: Number.isFinite(parsed) && parsed > 0 ? parsed : 1,
            };
          }),
        };
      }
      update.mutate(
        { id: servicePackage.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Paket güncellendi", type: "success" });
            onOpenChange(false);
          },
          onError: handleError,
        }
      );
      return;
    }

    const payload = buildFormData(fields);
    appendServiceItems(payload);
    if (hasNewImage) payload.append("image", image);
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Paket oluşturuldu", type: "success" });
        onOpenChange(false);
      },
      onError: handleError,
    });
  });

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Paketi Düzenle" : "Yeni Paket"}</DialogTitle>
          <DialogDescription>
            {isEdit ? servicePackage.name : "Paket bilgilerini girin"}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-category">Kategori</Label>
            {categoriesQuery.isPending ? (
              <div className="flex h-8 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Kategoriler yükleniyor...
              </div>
            ) : (
              <select
                id="pkg-category"
                className={selectClassName}
                disabled={categories.length === 0}
                aria-invalid={Boolean(form.formState.errors.category_id)}
                {...form.register("category_id")}
              >
                <option value="">Kategori seçin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            )}
            {!categoriesQuery.isPending && categories.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Önce bir paket kategorisi ekleyin
              </p>
            )}
            {form.formState.errors.category_id && (
              <p className="text-xs text-destructive">
                {form.formState.errors.category_id.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-name">Name</Label>
            <Input
              id="pkg-name"
              type="text"
              placeholder="Örn. 10'lu Görüntülü Görüşme Paketi"
              aria-invalid={Boolean(form.formState.errors.name)}
              {...form.register("name", {
                onBlur: (event) => {
                  if (!isEdit) {
                    form.setValue("slug", slugify(event.target.value));
                  }
                },
              })}
            />
            {form.formState.errors.name && (
              <p className="text-xs text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-slug">Slug</Label>
            <Input
              id="pkg-slug"
              type="text"
              placeholder="10lu-goruntulu-gorusme-paketi"
              aria-invalid={Boolean(form.formState.errors.slug)}
              {...form.register("slug")}
            />
            {form.formState.errors.slug && (
              <p className="text-xs text-destructive">
                {form.formState.errors.slug.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-price">Fiyat (TL)</Label>
            <Input
              id="pkg-price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              aria-invalid={Boolean(form.formState.errors.price)}
              {...form.register("price")}
            />
            {form.formState.errors.price && (
              <p className="text-xs text-destructive">
                {form.formState.errors.price.message}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-description">Açıklama</Label>
            <Textarea
              id="pkg-description"
              rows={3}
              placeholder="Paket açıklaması"
              {...form.register("description")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-image">Görsel</Label>
            <Controller
              control={form.control}
              name="image"
              render={({ field }) => (
                <ImageUploadField
                  disabled={mutation.isPending}
                  error={form.formState.errors.image?.message}
                  existingUrl={isEdit ? (servicePackage.image ?? "") : ""}
                  id="pkg-image"
                  removed={imageRemoved}
                  onClearSelection={() => field.onChange(null)}
                  onRemoveExisting={
                    isEdit ? () => setImageRemoved(true) : undefined
                  }
                  onSelect={(file) => {
                    const fileError = imageFileError(file);
                    if (fileError) {
                      form.setError("image", { message: fileError });
                      return false;
                    }
                    setImageRemoved(false);
                    field.onChange(file);
                    return true;
                  }}
                  onUndoRemoveExisting={
                    isEdit ? () => setImageRemoved(false) : undefined
                  }
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>İçerdiği Hizmetler</Label>
            {servicesQuery.isPending ? (
              <div className="flex h-8 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Hizmetler yükleniyor...
              </div>
            ) : servicesQuery.data.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                Önce hizmet ekleyin, ardından pakete dahil edin
              </p>
            ) : (
              <div className="flex flex-col gap-2 rounded-xl border p-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-8"
                    onChange={(event) => setServiceSearch(event.target.value)}
                    placeholder="Hizmet ara"
                    type="text"
                    value={serviceSearch}
                  />
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredServices.length === 0 ? (
                    <p className="py-3 text-center text-xs text-muted-foreground">
                      Aramanızla eşleşen hizmet yok
                    </p>
                  ) : (
                    filteredServices.map((service) => {
                      const serviceId = Number(service.id);
                      const isSelected = Object.prototype.hasOwnProperty.call(
                        serviceQuantities,
                        serviceId
                      );
                      return (
                        <div
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted/60"
                          key={service.id}
                        >
                          <label
                            className="flex min-w-0 flex-1 cursor-pointer items-center gap-2.5 text-sm"
                          >
                            <input
                              checked={isSelected}
                              onChange={() => toggleService(serviceId)}
                              type="checkbox"
                              className="size-4 accent-primary"
                            />
                            <span className="truncate">{service.name}</span>
                          </label>
                          {isSelected && (
                            <div className="flex shrink-0 items-center gap-1.5">
                              <Input
                                aria-label={`${service.name} kullanım adedi`}
                                className="h-8 w-16 text-right"
                                min="1"
                                onChange={(event) =>
                                  setServiceQuantity(
                                    serviceId,
                                    event.target.value
                                  )
                                }
                                step="1"
                                type="number"
                                value={serviceQuantities[serviceId]}
                              />
                              <span className="text-xs text-muted-foreground">
                                adet
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedServiceIds.length} hizmet seçildi · Toplam{" "}
                  {selectedServiceIds.reduce(
                    (sum, serviceId) =>
                      sum +
                      (Number.parseInt(serviceQuantities[serviceId], 10) || 1),
                    0
                  )}{" "}
                  kullanım
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-seo-title">SEO Title</Label>
            <Input
              id="pkg-seo-title"
              type="text"
              placeholder="SEO başlığı"
              {...form.register("seo_title")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-seo-description">SEO Description</Label>
            <Textarea
              id="pkg-seo-description"
              rows={2}
              placeholder="SEO açıklaması"
              {...form.register("seo_description")}
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="pkg-active">Aktif</Label>
              <p className="text-xs text-muted-foreground">
                Aktif paketler mağazada görünür
              </p>
            </div>
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Switch
                  id="pkg-active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="pkg-sort">Sıra</Label>
            <Input
              id="pkg-sort"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              aria-invalid={Boolean(form.formState.errors.sort_order)}
              {...form.register("sort_order")}
            />
            {form.formState.errors.sort_order && (
              <p className="text-xs text-destructive">
                {form.formState.errors.sort_order.message}
              </p>
            )}
          </div>

          {form.formState.errors.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
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
            <Button className="h-10" disabled={mutation.isPending} type="submit">
              {mutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {mutation.isPending
                ? "Kaydediliyor..."
                : isEdit
                  ? "Kaydet"
                  : "Oluştur"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
