"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PhoneInput, normalizePhoneToE164 } from "@/components/phone-input";
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
import {
  IMAGE_ALLOWED_MIME_TYPES,
  IMAGE_MAX_SIZE_BYTES,
  IMAGE_MAX_SIZE_MB,
  buildFormData,
  imageFileError,
} from "@/lib/image-upload";
import { ImageUploadField } from "@/components/ui/image-upload-field";
import { useCreateConsultant, useUpdateConsultant } from "@/lib/consultants";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const phoneRegex = /^\+\d{8,15}$/;

const baseFields = {
  first_name: z.string().min(1, "Ad zorunludur"),
  last_name: z.string().min(1, "Soyad zorunludur"),
  phone: z
    .string()
    .min(1, "Telefon numarası zorunludur")
    .regex(phoneRegex, "Geçerli bir telefon numarası girin"),
  email: z
    .string()
    .min(1, "E-posta zorunludur")
    .trim()
    .email("Geçerli bir e-posta girin"),
  title: z.string().min(1, "Title zorunludur"),
  biography: z.string(),
  education: z.string(),
  experience: z.string(),
  profile_image: z
    .any()
    .refine(
      (value) => value == null || IMAGE_ALLOWED_MIME_TYPES.includes(value.type),
      "Sadece JPG, JPEG, PNG ve WEBP formatları desteklenir"
    )
    .refine(
      (value) => value == null || value.size <= IMAGE_MAX_SIZE_BYTES,
      `Dosya boyutu en fazla ${IMAGE_MAX_SIZE_MB} MB olabilir`
    ),
  slug: z.union([
    z.literal(""),
    z.string().regex(slugRegex, "Slug küçük harf, rakam ve tire içerebilir"),
  ]),
  is_active: z.boolean(),
};

const createSchema = z
  .object({
    ...baseFields,
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
    password_confirmation: z.string().min(1, "Şifre tekrarı zorunludur"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler eşleşmiyor",
    path: ["password_confirmation"],
  });

const updateSchema = z
  .object({
    ...baseFields,
    password: z.union([
      z.literal(""),
      z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
    ]),
    password_confirmation: z.union([z.literal(""), z.string()]),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler eşleşmiyor",
    path: ["password_confirmation"],
  });

function toFormValues(consultant) {
  const user = consultant?.user ?? {};
  return {
    first_name: user.first_name ?? consultant?.first_name ?? "",
    last_name: user.last_name ?? consultant?.last_name ?? "",
    phone: normalizePhoneToE164(user.phone ?? consultant?.phone),
    email: user.email ?? consultant?.email ?? "",
    password: "",
    password_confirmation: "",
    title: consultant?.title ?? "",
    biography: consultant?.biography ?? "",
    education: consultant?.education ?? "",
    experience: consultant?.experience ?? "",
    profile_image: null,
    slug: consultant?.slug ?? "",
    is_active: consultant ? Boolean(consultant.is_active) : true,
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function ConsultantFormDialog({
  open,
  mode,
  consultant,
  loading,
  error,
  onRetry,
  onOpenChange,
}) {
  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Danışmanı Düzenle" : "Yeni Danışman"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? consultant?.name ?? "Danışman bilgileri"
              : "Danışman bilgilerini girin"}
          </DialogDescription>
        </DialogHeader>
        {isEdit && loading && (
          <div className="flex justify-center py-10">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {isEdit && error && !loading && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-destructive">
              {getErrorMessage(error)}
            </p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Tekrar Dene
            </Button>
          </div>
        )}
        {(!isEdit || consultant) && (
          <ConsultantFormBody
            key={isEdit ? consultant.id : "new"}
            isEdit={isEdit}
            consultant={isEdit ? consultant : null}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConsultantFormBody({ isEdit, consultant, onOpenChange }) {
  const create = useCreateConsultant();
  const update = useUpdateConsultant();
  const mutation = isEdit ? update : create;
  const schema = isEdit ? updateSchema : createSchema;
  const fieldNames = Object.keys(schema.shape);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(consultant),
  });
  const [profileImageRemoved, setProfileImageRemoved] = useState(false);

  const handleError = (error) => {
    if (error instanceof ApiError) {
      for (const [field, messages] of Object.entries(error.errors ?? {})) {
        const formField = field === "image" ? "profile_image" : field;
        if (fieldNames.includes(formField)) {
          const message = Array.isArray(messages) ? messages[0] : messages;
          form.setError(formField, { message });
        }
      }
      form.setError("root", { message: error.message });
    } else {
      form.setError("root", { message: "Beklenmeyen bir hata oluştu" });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    const { profile_image, password, password_confirmation, ...rest } = values;
    const fields = {
      first_name: rest.first_name,
      last_name: rest.last_name,
      phone: rest.phone,
      email: rest.email,
      title: rest.title,
      biography: rest.biography ?? "",
      education: rest.education ?? "",
      experience: rest.experience ?? "",
      slug: rest.slug ?? "",
      is_active: rest.is_active,
    };
    if (password) {
      fields.password = password;
      fields.password_confirmation = password_confirmation;
    }
    const hasNewImage =
      typeof File !== "undefined" && profile_image instanceof File;

    if (isEdit) {
      let payload;
      if (hasNewImage) {
        payload = buildFormData({ _method: "PUT", ...fields });
        payload.append("profile_image", profile_image);
      } else if (profileImageRemoved) {
        payload = buildFormData({
          _method: "PUT",
          ...fields,
          image_remove: 1,
        });
      } else {
        payload = fields;
      }
      update.mutate(
        { id: consultant.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Danışman güncellendi", type: "success" });
            onOpenChange(false);
          },
          onError: handleError,
        }
      );
      return;
    }

    const payload = buildFormData(fields);
    if (hasNewImage) payload.append("image", profile_image);
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Danışman oluşturuldu", type: "success" });
        onOpenChange(false);
      },
      onError: handleError,
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="first_name">Ad</Label>
        <Input
          id="first_name"
          type="text"
          autoComplete="given-name"
          placeholder="Adınız"
          aria-invalid={Boolean(form.formState.errors.first_name)}
          {...form.register("first_name")}
        />
        {form.formState.errors.first_name && (
          <p className="text-xs text-destructive">
            {form.formState.errors.first_name.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="last_name">Soyad</Label>
        <Input
          id="last_name"
          type="text"
          autoComplete="family-name"
          placeholder="Soyadınız"
          aria-invalid={Boolean(form.formState.errors.last_name)}
          {...form.register("last_name")}
        />
        {form.formState.errors.last_name && (
          <p className="text-xs text-destructive">
            {form.formState.errors.last_name.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="phone">Telefon</Label>
        <Controller
          control={form.control}
          name="phone"
          render={({ field }) => (
            <PhoneInput
              id="phone"
              name="phone"
              autoComplete="tel"
              value={field.value}
              onChange={field.onChange}
              aria-invalid={Boolean(form.formState.errors.phone)}
            />
          )}
        />
        {form.formState.errors.phone && (
          <p className="text-xs text-destructive">
            {form.formState.errors.phone.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-posta</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="ornek@eposta.com"
          aria-invalid={Boolean(form.formState.errors.email)}
          {...form.register("email")}
        />
        {form.formState.errors.email && (
          <p className="text-xs text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password">
          {isEdit ? "Şifre (opsiyonel)" : "Şifre"}
        </Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(form.formState.errors.password)}
          {...form.register("password")}
        />
        {isEdit && (
          <p className="text-xs text-muted-foreground">
            Boş bırakılırsa şifre değiştirilmez
          </p>
        )}
        {form.formState.errors.password && (
          <p className="text-xs text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="password_confirmation">Şifre Tekrarı</Label>
        <Input
          id="password_confirmation"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(form.formState.errors.password_confirmation)}
          {...form.register("password_confirmation")}
        />
        {form.formState.errors.password_confirmation && (
          <p className="text-xs text-destructive">
            {form.formState.errors.password_confirmation.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="Örn. Kurucu Danışman"
          aria-invalid={Boolean(form.formState.errors.title)}
          {...form.register("title")}
        />
        {form.formState.errors.title && (
          <p className="text-xs text-destructive">
            {form.formState.errors.title.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="biography">Biyografi</Label>
        <Textarea
          id="biography"
          rows={3}
          placeholder="Danışman hakkında kısa bilgi"
          {...form.register("biography")}
        />
        {form.formState.errors.biography && (
          <p className="text-xs text-destructive">
            {form.formState.errors.biography.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="education">Eğitim</Label>
        <Textarea
          id="education"
          rows={2}
          placeholder="Eğitim bilgileri"
          {...form.register("education")}
        />
        {form.formState.errors.education && (
          <p className="text-xs text-destructive">
            {form.formState.errors.education.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="experience">Deneyim</Label>
        <Textarea
          id="experience"
          rows={2}
          placeholder="Deneyim bilgileri"
          {...form.register("experience")}
        />
        {form.formState.errors.experience && (
          <p className="text-xs text-destructive">
            {form.formState.errors.experience.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="profile_image">Profil Görseli</Label>
        <Controller
          control={form.control}
          name="profile_image"
          render={({ field }) => (
            <ImageUploadField
              disabled={mutation.isPending}
              error={form.formState.errors.profile_image?.message}
              existingUrl={isEdit ? (consultant.profile_image ?? "") : ""}
              id="profile_image"
              removed={profileImageRemoved}
              onClearSelection={() => field.onChange(null)}
              onRemoveExisting={
                isEdit ? () => setProfileImageRemoved(true) : undefined
              }
              onSelect={(file) => {
                const fileError = imageFileError(file);
                if (fileError) {
                  form.setError("profile_image", { message: fileError });
                  return false;
                }
                setProfileImageRemoved(false);
                field.onChange(file);
                return true;
              }}
              onUndoRemoveExisting={
                isEdit ? () => setProfileImageRemoved(false) : undefined
              }
            />
          )}
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          type="text"
          placeholder="ornek-danisman"
          aria-invalid={Boolean(form.formState.errors.slug)}
          {...form.register("slug")}
        />
        <p className="text-xs text-muted-foreground">
          Boş bırakılırsa otomatik oluşturulur
        </p>
        {form.formState.errors.slug && (
          <p className="text-xs text-destructive">
            {form.formState.errors.slug.message}
          </p>
        )}
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <Label htmlFor="is_active">Aktif</Label>
          <p className="text-xs text-muted-foreground">
            Danışmanın aktif/pasif durumu
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
  );
}