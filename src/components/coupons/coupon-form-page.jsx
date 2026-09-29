"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { AdminFormPage } from "@/components/admin/admin-form-page";
import {
  COUPON_TARGET_ITEM_TYPES,
  COUPON_TARGET_ITEM_TYPE_VALUES,
  COUPON_TYPES,
  COUPON_TYPE_LABELS,
  useCreateCoupon,
  useUpdateCoupon,
} from "@/lib/coupons";

const LIST_PATH = "/dashboard/admin/kuponlar";

const SELECT_CLASS_NAME =
  "h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

const optionalAmountSchema = z.preprocess(
  (value) => (value === "" || value == null ? null : value),
  z.coerce
    .number({ message: "Geçerli bir tutar girin" })
    .min(0, "0 veya daha büyük olmalıdır")
    .nullable()
);

const optionalLimitSchema = z.preprocess(
  (value) => (value === "" || value == null ? null : value),
  z.coerce
    .number({ message: "Geçerli bir limit girin" })
    .int("Tam sayı olmalıdır")
    .min(1, "En az 1 olmalıdır")
    .nullable()
);

const couponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(1, "Kupon kodu zorunludur")
      .max(255, "En fazla 255 karakter olabilir")
      .regex(/^[A-Za-z0-9_-]+$/, "Sadece harf, sayı, tire ve alt çizgi kullanın"),
    type: z.enum([COUPON_TYPES.PERCENTAGE, COUPON_TYPES.FIXED]),
    value: z.preprocess(
      (value) => (value === "" || value == null ? null : value),
      z.coerce
        .number({ message: "Geçerli bir indirim değeri girin" })
        .min(0, "0 veya daha büyük olmalıdır")
        .nullable()
    ),
    minimum_amount: optionalAmountSchema,
    maximum_discount: optionalAmountSchema,
    usage_limit: optionalLimitSchema,
    usage_limit_per_user: optionalLimitSchema,
    starts_at: z.string(),
    expires_at: z.string(),
    is_active: z.boolean(),
    target_item_types: z.array(z.enum(COUPON_TARGET_ITEM_TYPE_VALUES)),
  })
  .superRefine((values, ctx) => {
    if (values.value !== null && values.type === COUPON_TYPES.PERCENTAGE && values.value > 100) {
      ctx.addIssue({
        code: "custom",
        path: ["value"],
        message: "Yüzde kuponlar için indirim en fazla %100 olabilir",
      });
    }
    if (values.starts_at && values.expires_at && values.expires_at <= values.starts_at) {
      ctx.addIssue({
        code: "custom",
        path: ["expires_at"],
        message: "Bitiş tarihi başlangıç tarihinden sonra olmalıdır",
      });
    }
  });

function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toFormValues(coupon) {
  return {
    code: coupon?.code ?? "",
    type: coupon?.type ?? COUPON_TYPES.PERCENTAGE,
    value: coupon?.value ?? "",
    minimum_amount: coupon?.minimumAmount ?? "",
    maximum_discount: coupon?.maximumDiscount ?? "",
    usage_limit: coupon?.usageLimit ?? "",
    usage_limit_per_user: coupon?.usageLimitPerUser ?? "",
    starts_at: toDatetimeLocal(coupon?.startsAt),
    expires_at: toDatetimeLocal(coupon?.expiresAt),
    is_active: coupon ? coupon.isActive : true,
    target_item_types: coupon?.targetItemTypes ?? [],
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function CouponCreatePage() {
  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Kuponlar"
      title="Yeni Kupon"
      description="Sepette kullanılabilecek bir indirim kuponu oluşturun"
      cardTitle="Kupon Bilgileri"
    >
      <CouponForm isEdit={false} coupon={null} />
    </AdminFormPage>
  );
}

export function CouponEditPage({ id, query }) {
  const coupon = query.data;

  if (query.isPending) {
    return (
      <AdminFormPage backHref={LIST_PATH} backLabel="Kuponlar" title="Kuponu Düzenle">
        <div className="flex justify-center py-10">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AdminFormPage>
    );
  }

  if (query.isError) {
    return (
      <AdminFormPage backHref={LIST_PATH} backLabel="Kuponlar" title="Kuponu Düzenle">
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-destructive">{getErrorMessage(query.error)}</p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Tekrar Dene
          </Button>
        </div>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Kuponlar"
      title="Kuponu Düzenle"
      description={`${coupon.code} · ${coupon.usageCount} kullanım`}
      cardTitle="Kupon Bilgileri"
    >
      <CouponForm key={coupon.id} isEdit coupon={coupon} />
    </AdminFormPage>
  );
}

function CouponForm({ isEdit, coupon }) {
  const router = useRouter();
  const create = useCreateCoupon();
  const update = useUpdateCoupon();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(couponSchema.shape);

  const form = useForm({
    resolver: zodResolver(couponSchema),
    defaultValues: toFormValues(coupon),
  });
  const type = useWatch({ control: form.control, name: "type" });
  const targetItemTypes = useWatch({
    control: form.control,
    name: "target_item_types",
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
      code: values.code.trim().toUpperCase(),
      type: values.type,
      value: values.value,
      minimum_amount: values.minimum_amount,
      maximum_discount: values.maximum_discount,
      usage_limit: values.usage_limit,
      usage_limit_per_user: values.usage_limit_per_user,
      starts_at: values.starts_at || null,
      expires_at: values.expires_at || null,
      is_active: values.is_active,
      targeting:
        values.target_item_types.length > 0
          ? { item_types: values.target_item_types }
          : null,
    };

    const mutationOptions = {
      onSuccess: () => {
        toast.add({
          title: isEdit ? "Kupon güncellendi" : "Kupon oluşturuldu",
          type: "success",
        });
        router.push(LIST_PATH);
      },
      onError: handleError,
    };

    if (isEdit) {
      update.mutate({ id: coupon.id, payload }, mutationOptions);
      return;
    }

    create.mutate(payload, mutationOptions);
  });

  const toggleTargetType = (itemType) => {
    const current = form.getValues("target_item_types");
    const next = current.includes(itemType)
      ? current.filter((value) => value !== itemType)
      : [...current, itemType];
    form.setValue("target_item_types", next, {
      shouldDirty: true,
    });
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="code">Kupon Kodu</Label>
          <Input
            id="code"
            type="text"
            placeholder="Örn. YAZ20"
            aria-invalid={Boolean(form.formState.errors.code)}
            {...form.register("code")}
          />
          {form.formState.errors.code && (
            <p className="text-xs text-destructive">
              {form.formState.errors.code.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="type">İndirim Tipi</Label>
          <select
            className={SELECT_CLASS_NAME}
            id="type"
            aria-invalid={Boolean(form.formState.errors.type)}
            {...form.register("type")}
          >
            {Object.entries(COUPON_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          {form.formState.errors.type && (
            <p className="text-xs text-destructive">
              {form.formState.errors.type.message}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="value">
            {type === COUPON_TYPES.PERCENTAGE
              ? "İndirim Yüzdesi (%)"
              : "İndirim Tutarı (TL)"}
          </Label>
          <Input
            id="value"
            type="number"
            inputMode="decimal"
            min="0"
            step={type === COUPON_TYPES.PERCENTAGE ? "1" : "0.01"}
            max={type === COUPON_TYPES.PERCENTAGE ? "100" : undefined}
            placeholder={type === COUPON_TYPES.PERCENTAGE ? "Örn. 10" : "Örn. 150"}
            aria-invalid={Boolean(form.formState.errors.value)}
            {...form.register("value")}
          />
          {form.formState.errors.value && (
            <p className="text-xs text-destructive">
              {form.formState.errors.value.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="maximum_discount">Maksimum İndirim (TL)</Label>
          <Input
            id="maximum_discount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Boş bırakılırsa sınırsız"
            aria-invalid={Boolean(form.formState.errors.maximum_discount)}
            {...form.register("maximum_discount")}
          />
          {form.formState.errors.maximum_discount && (
            <p className="text-xs text-destructive">
              {form.formState.errors.maximum_discount.message}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="minimum_amount">Minimum Sepet Tutarı (TL)</Label>
          <Input
            id="minimum_amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            placeholder="Boş bırakılırsa alt limit yok"
            aria-invalid={Boolean(form.formState.errors.minimum_amount)}
            {...form.register("minimum_amount")}
          />
          {form.formState.errors.minimum_amount && (
            <p className="text-xs text-destructive">
              {form.formState.errors.minimum_amount.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="usage_limit">Toplam Kullanım Limiti</Label>
          <Input
            id="usage_limit"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="Boş bırakılırsa sınırsız"
            aria-invalid={Boolean(form.formState.errors.usage_limit)}
            {...form.register("usage_limit")}
          />
          {form.formState.errors.usage_limit && (
            <p className="text-xs text-destructive">
              {form.formState.errors.usage_limit.message}
            </p>
          )}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="usage_limit_per_user">Kullanıcı Başına Limit</Label>
          <Input
            id="usage_limit_per_user"
            type="number"
            inputMode="numeric"
            min="1"
            step="1"
            placeholder="Boş bırakılırsa sınırsız"
            aria-invalid={Boolean(form.formState.errors.usage_limit_per_user)}
            {...form.register("usage_limit_per_user")}
          />
          {form.formState.errors.usage_limit_per_user && (
            <p className="text-xs text-destructive">
              {form.formState.errors.usage_limit_per_user.message}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="starts_at">Başlangıç Tarihi</Label>
          <Input
            id="starts_at"
            type="datetime-local"
            aria-invalid={Boolean(form.formState.errors.starts_at)}
            {...form.register("starts_at")}
          />
          {form.formState.errors.starts_at && (
            <p className="text-xs text-destructive">
              {form.formState.errors.starts_at.message}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="expires_at">Son Kullanım Tarihi</Label>
        <Input
          id="expires_at"
          type="datetime-local"
          aria-invalid={Boolean(form.formState.errors.expires_at)}
          {...form.register("expires_at")}
        />
        {form.formState.errors.expires_at && (
          <p className="text-xs text-destructive">
            {form.formState.errors.expires_at.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label>Geçerli Öğe Türleri</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {Object.entries(COUPON_TARGET_ITEM_TYPES).map(([value, label]) => {
            const selected = targetItemTypes.includes(value);
            return (
              <button
                className={`flex h-10 items-center justify-center rounded-lg border px-3 text-sm font-medium transition-colors ${
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-input bg-transparent text-foreground hover:bg-accent"
                } disabled:cursor-not-allowed disabled:opacity-50`}
                disabled={mutation.isPending}
                key={value}
                type="button"
                onClick={() => toggleTargetType(value)}
              >
                {label}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Hiçbir tür seçilmezse kupon tüm öğe türlerinde geçerli olur.
        </p>
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="is_active">Aktif</Label>
          <p className="text-xs text-muted-foreground">
            Pasif kuponlar sepette kullanılamaz
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
      <div className="flex items-center justify-end gap-2">
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
      </div>
    </form>
  );
}
