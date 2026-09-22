"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/phone-input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ADDRESS_TYPES } from "@/lib/customers";

const addressFormSchema = z.object({
  address_type: z.enum([
    ADDRESS_TYPES.SHIPPING,
    ADDRESS_TYPES.BILLING,
    ADDRESS_TYPES.BOTH,
  ]),
  title: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  company_name: z.string(),
  tax_number: z.string(),
  tax_office: z.string(),
  phone: z.string(),
  country: z.string(),
  city: z.string(),
  district: z.string(),
  address: z.string(),
  postal_code: z.string(),
});

function toFormValues(address) {
  return {
    address_type: address?.address_type ?? ADDRESS_TYPES.SHIPPING,
    title: address?.title ?? "",
    first_name: address?.first_name ?? "",
    last_name: address?.last_name ?? "",
    company_name: address?.company_name ?? "",
    tax_number: address?.tax_number ?? "",
    tax_office: address?.tax_office ?? "",
    phone: address?.phone ?? "",
    country: address?.country ?? "",
    city: address?.city ?? "",
    district: address?.district ?? "",
    address: address?.address ?? "",
    postal_code: address?.postal_code ?? "",
  };
}

export function AddressFormDialog({ open, initialValues, onSave, onOpenChange }) {
  const form = useForm({
    resolver: zodResolver(addressFormSchema),
    defaultValues: toFormValues(initialValues),
  });

  const onSubmit = form.handleSubmit((values) => {
    onSave(values);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialValues ? "Adresi Düzenle" : "Adres Ekle"}</DialogTitle>
          <DialogDescription>
            {initialValues
              ? "Müşteri adres bilgilerini güncelleyin"
              : "Yeni adres bilgilerini girin"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-2" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address_type">Adres Tipi</Label>
            <select
              id="address_type"
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
              {...form.register("address_type")}
            >
              <option value={ADDRESS_TYPES.SHIPPING}>Teslimat</option>
              <option value={ADDRESS_TYPES.BILLING}>Fatura</option>
              <option value={ADDRESS_TYPES.BOTH}>Teslimat + Fatura</option>
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address_title">Başlık</Label>
            <Input
              id="address_title"
              type="text"
              placeholder="Ev, İş, ..."
              {...form.register("title")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address_first_name">Ad</Label>
            <Input
              id="address_first_name"
              type="text"
              placeholder="Ad"
              {...form.register("first_name")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address_last_name">Soyad</Label>
            <Input
              id="address_last_name"
              type="text"
              placeholder="Soyad"
              {...form.register("last_name")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="company_name">Şirket Adı</Label>
            <Input
              id="company_name"
              type="text"
              placeholder="Şirket adı (opsiyonel)"
              {...form.register("company_name")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tax_number">Vergi No</Label>
            <Input
              id="tax_number"
              type="text"
              placeholder="Vergi no (opsiyonel)"
              {...form.register("tax_number")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tax_office">Vergi Dairesi</Label>
            <Input
              id="tax_office"
              type="text"
              placeholder="Vergi dairesi (opsiyonel)"
              {...form.register("tax_office")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address_phone">Telefon</Label>
            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <PhoneInput
                  id="address_phone"
                  autoComplete="tel"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="country">Ülke</Label>
            <Input
              id="country"
              type="text"
              placeholder="Türkiye"
              {...form.register("country")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="city">İl</Label>
            <Input
              id="city"
              type="text"
              placeholder="İstanbul"
              {...form.register("city")}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="district">İlçe</Label>
            <Input
              id="district"
              type="text"
              placeholder="Kadıköy"
              {...form.register("district")}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="address">Adres</Label>
            <Textarea
              id="address"
              rows={3}
              placeholder="Mahalle, sokak, no, daire..."
              {...form.register("address")}
            />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="postal_code">Posta Kodu</Label>
            <Input
              id="postal_code"
              type="text"
              inputMode="numeric"
              placeholder="34000"
              {...form.register("postal_code")}
            />
          </div>
          <DialogFooter className="sm:col-span-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-10"
            >
              İptal
            </Button>
            <Button type="submit" className="h-10">
              {initialValues ? "Kaydet" : "Ekle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}