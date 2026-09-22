"use client";

import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoaderCircle, MapPin, Pencil, Phone as PhoneIcon, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { PhoneInput, normalizePhoneToE164 } from "@/components/phone-input";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import {
  ADDRESS_TYPE_LABELS,
  useCreateCustomer,
  useUpdateCustomer,
} from "@/lib/customers";
import { AddressFormDialog } from "@/components/customers/address-form-dialog";

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

function toFormValues(customer) {
  const user = customer?.user ?? {};
  return {
    first_name: user.first_name ?? customer?.first_name ?? "",
    last_name: user.last_name ?? customer?.last_name ?? "",
    phone: normalizePhoneToE164(user.phone ?? customer?.phone),
    email: user.email ?? customer?.email ?? "",
    password: "",
    password_confirmation: "",
    addresses: (customer?.addresses ?? []).map((address) => ({ ...address })),
  };
}

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function CustomerFormDialog({
  open,
  mode,
  customer,
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
          <DialogTitle>{isEdit ? "Müşteriyi Düzenle" : "Yeni Müşteri"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? customer?.name ?? "Müşteri bilgileri"
              : "Müşteri bilgilerini girin"}
          </DialogDescription>
        </DialogHeader>
        {isEdit && loading && (
          <div className="flex justify-center py-10">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {isEdit && error && !loading && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Tekrar Dene
            </Button>
          </div>
        )}
        {(!isEdit || customer) && (
          <CustomerFormBody
            key={isEdit ? customer.id : "new"}
            isEdit={isEdit}
            customer={isEdit ? customer : null}
            onOpenChange={onOpenChange}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function CustomerFormBody({ isEdit, customer, onOpenChange }) {
  const create = useCreateCustomer();
  const update = useUpdateCustomer();
  const mutation = isEdit ? update : create;
  const schema = isEdit ? updateSchema : createSchema;
  const fieldNames = Object.keys(schema.shape);

  const [addressesTouched, setAddressesTouched] = useState(false);
  const [addressEditor, setAddressEditor] = useState(null);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: toFormValues(customer),
  });
  const { fields, append, update: updateField, remove } = useFieldArray({
    control: form.control,
    name: "addresses",
    keyName: "fieldKey",
  });

  const handleAddressSave = (values) => {
    const index = addressEditor?.index;
    if (index === undefined) {
      append(values);
    } else {
      updateField(index, { ...fields[index], ...values });
    }
    setAddressesTouched(true);
    setAddressEditor(null);
  };

  const handleAddressRemove = (index) => {
    remove(index);
    setAddressesTouched(true);
  };

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
      form.setError("root", { message: "Beklenmeyen bir hata oluştu" });
    }
  };

  const onSubmit = form.handleSubmit((values) => {
    const { password, password_confirmation, addresses, ...rest } = values;
    let payload = rest;
    if (isEdit && password) {
      payload = { ...payload, password, password_confirmation };
    }
    if (addressesTouched) {
      payload = { ...payload, addresses };
    }
    if (isEdit) {
      update.mutate(
        { id: customer.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Müşteri güncellendi", type: "success" });
            onOpenChange(false);
          },
          onError: handleError,
        }
      );
      return;
    }
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Müşteri oluşturuldu", type: "success" });
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
          placeholder="Ad"
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
          placeholder="Soyad"
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

      <div className="mt-2 flex items-center justify-between gap-3 border-t pt-4">
        <div>
          <p className="text-sm font-medium">Adresler</p>
          <p className="text-xs text-muted-foreground">
            {fields.length} adres — opsiyonel
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9"
          onClick={() => setAddressEditor({})}
        >
          <Plus className="size-4" />
          Adres Ekle
        </Button>
      </div>

      {fields.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {fields.map((field, index) => (
            <div key={field.fieldKey} className="rounded-lg border bg-card p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <p className="truncate text-sm font-medium">
                    {field.title ||
                      [field.first_name, field.last_name].filter(Boolean).join(" ") ||
                      "Adres"}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                  {ADDRESS_TYPE_LABELS[field.address_type] ?? field.address_type}
                </span>
              </div>
              <p className="mt-1.5 truncate text-xs text-muted-foreground">
                {[field.address, field.district, field.city, field.country]
                  .filter(Boolean)
                  .join(", ") || "Adres bilgisi yok"}
              </p>
              {field.phone && (
                <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <PhoneIcon className="size-3 shrink-0" />
                  {field.phone}
                </p>
              )}
              <div className="mt-2 flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setAddressEditor({ index })}
                  aria-label="Adresi düzenle"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleAddressRemove(index)}
                  aria-label="Adresi sil"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

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

      <AddressFormDialog
        key={addressEditor ? (addressEditor.index ?? "new") : "closed"}
        open={Boolean(addressEditor)}
        initialValues={
          addressEditor?.index === undefined
            ? null
            : fields[addressEditor.index] ?? null
        }
        onSave={handleAddressSave}
        onOpenChange={(open) => {
          if (!open) setAddressEditor(null);
        }}
      />
    </form>
  );
}