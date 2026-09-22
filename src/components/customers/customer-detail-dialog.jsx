"use client";

import { LoaderCircle, MapPin, Mail, Phone as PhoneIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ApiError } from "@/lib/api";
import { ADDRESS_TYPE_LABELS } from "@/lib/customers";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 flex-1 truncate font-medium">{children}</span>
    </div>
  );
}

export function CustomerDetailDialog({
  open,
  customer,
  loading,
  error,
  onRetry,
  onOpenChange,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{customer?.name ?? "Müşteri Detayı"}</DialogTitle>
          <DialogDescription>Müşteri ve adres bilgileri</DialogDescription>
        </DialogHeader>
        {loading && (
          <div className="flex justify-center py-10">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}
        {error && !loading && (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-destructive">{getErrorMessage(error)}</p>
            <Button variant="outline" size="sm" onClick={onRetry}>
              Tekrar Dene
            </Button>
          </div>
        )}
        {customer && (
          <div className="flex flex-col gap-4">
            <div className="rounded-lg border bg-card p-3">
              <InfoRow icon={PhoneIcon} label="Telefon">
                {customer.phone || "—"}
              </InfoRow>
              <InfoRow icon={Mail} label="E-posta">
                {customer.email || "—"}
              </InfoRow>
              <InfoRow icon={MapPin} label="Adres">
                {customer.addresses.length} adres
              </InfoRow>
            </div>
            {customer.addresses.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Bu müşterinin kayıtlı adresi yok
              </p>
            )}
            {customer.addresses.length > 0 && (
              <div className="flex flex-col gap-3">
                {customer.addresses.map((address) => (
                  <div key={address.id ?? address.title ?? "address"} className="rounded-lg border bg-card p-3">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-sm font-medium">
                        {address.title ||
                          [address.first_name, address.last_name].filter(Boolean).join(" ") ||
                          "Adres"}
                      </p>
                      <span className="shrink-0 rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
                        {ADDRESS_TYPE_LABELS[address.address_type] ?? address.address_type}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                      {[address.first_name, address.last_name].filter(Boolean).join(" ") && (
                        <p>
                          {[address.first_name, address.last_name].filter(Boolean).join(" ")}
                        </p>
                      )}
                      {address.company_name && <p>{address.company_name}</p>}
                      {(address.tax_number || address.tax_office) && (
                        <p>
                          {[address.tax_office, address.tax_number].filter(Boolean).join(" · ")}
                        </p>
                      )}
                      {address.phone && (
                        <p>
                          <PhoneIcon className="mr-1 inline size-3.5" />
                          {address.phone}
                        </p>
                      )}
                      <p>
                        {[address.address, address.district, address.city, address.country]
                          .filter(Boolean)
                          .join(", ") || "Adres bilgisi yok"}
                        {address.postal_code ? ` · ${address.postal_code}` : ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  );
}