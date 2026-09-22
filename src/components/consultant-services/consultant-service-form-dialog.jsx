"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useConsultantsQuery } from "@/lib/consultants";
import { useServicesQuery } from "@/lib/services";
import {
  useCreateConsultantService,
  useUpdateConsultantService,
} from "@/lib/consultant-services";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

const consultantServiceSchema = z.object({
  consultant_id: z.coerce
    .number({ message: "Danışman seçin" })
    .int({ message: "Danışman seçin" })
    .min(1, "Danışman seçin"),
  service_id: z.coerce
    .number({ message: "Hizmet seçin" })
    .int({ message: "Hizmet seçin" })
    .min(1, "Hizmet seçin"),
  price: z.coerce
    .number({ message: "Geçerli bir fiyat girin" })
    .min(0, "Fiyat 0 veya daha büyük olmalıdır"),
  duration: z.coerce
    .number({ message: "Geçerli bir süre girin" })
    .int({ message: "Süre tam sayı olmalıdır" })
    .min(1, "Süre en az 1 dakika olmalıdır"),
  break_duration: z.coerce
    .number({ message: "Geçerli bir mola süresi girin" })
    .int({ message: "Mola süresi tam sayı olmalıdır" })
    .min(0, "Mola süresi 0 veya daha büyük olmalıdır"),
  is_active: z.boolean(),
});

function toFormValues(consultantService) {
  return {
    consultant_id: consultantService?.consultant_id ?? "",
    service_id: consultantService?.service_id ?? "",
    price: consultantService?.price ?? "",
    duration: consultantService?.duration ?? "",
    break_duration: consultantService?.break_duration ?? 0,
    is_active: consultantService ? Boolean(consultantService.is_active) : true,
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function SelectField({ id, label, loading, error, children, ...selectProps }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {loading ? (
        <div className="flex h-8 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Yükleniyor...
        </div>
      ) : (
        <select
          id={id}
          className={selectClassName}
          aria-invalid={Boolean(error)}
          {...selectProps}
        >
          {children}
        </select>
      )}
      {error && <p className="text-xs text-destructive">{error.message}</p>}
    </div>
  );
}

export function ConsultantServiceFormDialog({
  open,
  consultantService,
  onOpenChange,
}) {
  const isEdit = Boolean(consultantService);
  const create = useCreateConsultantService();
  const update = useUpdateConsultantService();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(consultantServiceSchema.shape);

  const consultantsQuery = useConsultantsQuery();
  const servicesQuery = useServicesQuery();
  const consultants = consultantsQuery.data ?? [];
  const services = servicesQuery.data ?? [];

  const form = useForm({
    resolver: zodResolver(consultantServiceSchema),
    defaultValues: toFormValues(consultantService),
  });

  const handleError = (error) => {
    if (error instanceof ApiError) {
      for (const [field, messages] of Object.entries(error.errors ?? {})) {
        if (fieldNames.includes(field)) {
          const message = Array.isArray(messages) ? messages[0] : messages;
          form.setError(field, { message });
        }
      }
      form.setError("root", { message: error.message });
    } else {
      form.setError("root", { message: getErrorMessage(error) });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      consultant_id: Number(values.consultant_id),
      service_id: Number(values.service_id),
      price: Number(values.price),
      duration: Number(values.duration),
      break_duration: Number(values.break_duration),
      is_active: values.is_active,
    };
    if (isEdit) {
      update.mutate(
        { id: consultantService.id, payload },
        {
          onSuccess: () => {
            toast.add({
              title: "Danışman hizmeti güncellendi",
              type: "success",
            });
            onOpenChange(false);
          },
          onError: handleError,
        }
      );
      return;
    }
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Danışman hizmeti oluşturuldu", type: "success" });
        onOpenChange(false);
      },
      onError: handleError,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Danışman Hizmetini Düzenle" : "Yeni Danışman Hizmeti"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `${consultantService.consultantName} · ${consultantService.serviceName}`
              : "Danışmana hizmet atayın"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
          <Controller
            control={form.control}
            name="consultant_id"
            render={({ field }) => (
              <SelectField
                id="consultant_id"
                label="Danışman"
                loading={consultantsQuery.isPending}
                error={form.formState.errors.consultant_id}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                <option value="">Danışman seçin</option>
                {consultants.map((consultant) => (
                  <option key={consultant.id} value={consultant.id}>
                    {consultant.name}
                  </option>
                ))}
              </SelectField>
            )}
          />
          <Controller
            control={form.control}
            name="service_id"
            render={({ field }) => (
              <SelectField
                id="service_id"
                label="Hizmet"
                loading={servicesQuery.isPending}
                error={form.formState.errors.service_id}
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              >
                <option value="">Hizmet seçin</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </SelectField>
            )}
          />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="price">Fiyat</Label>
            <Input
              id="price"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="Örn. 150"
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
            <Label htmlFor="duration">Süre (dakika)</Label>
            <Input
              id="duration"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              placeholder="Örn. 60"
              aria-invalid={Boolean(form.formState.errors.duration)}
              {...form.register("duration")}
            />
            {form.formState.errors.duration && (
              <p className="text-xs text-destructive">
                {form.formState.errors.duration.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="break_duration">Mola Süresi (dakika)</Label>
            <Input
              id="break_duration"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              placeholder="Örn. 15"
              aria-invalid={Boolean(form.formState.errors.break_duration)}
              {...form.register("break_duration")}
            />
            {form.formState.errors.break_duration && (
              <p className="text-xs text-destructive">
                {form.formState.errors.break_duration.message}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="is_active">Aktif</Label>
              <p className="text-xs text-muted-foreground">
                Atamanın aktif/pasif durumu
              </p>
            </div>
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Switch
                  id="is_active"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          {form.formState.errors.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.root.message}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10"
            >
              İptal
            </Button>
            <Button type="submit" disabled={mutation.isPending} className="h-10">
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