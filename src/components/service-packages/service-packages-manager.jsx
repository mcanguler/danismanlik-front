"use client";

import { useState } from "react";
import {
  CircleAlert,
  Image as ImageIcon,
  LoaderCircle,
  Package,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { toast } from "@/components/ui/toast";
import {
  packageTotalQuantity,
  useDeleteServicePackage,
  useServicePackagesQuery,
} from "@/lib/service-packages";
import { formatPrice } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import { ServicePackageFormDialog } from "@/components/service-packages/service-package-form-dialog";

function PackageAvatar({ servicePackage }) {
  return (
    <Avatar className="size-8 rounded-lg after:rounded-lg">
      <AvatarImage
        alt={servicePackage.name}
        className="rounded-lg"
        src={servicePackage.image}
      />
      <AvatarFallback className="rounded-lg">
        <ImageIcon className="size-4" />
      </AvatarFallback>
    </Avatar>
  );
}

export function ServicePackagesManager() {
  const [dialogState, setDialogState] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteServicePackage();

  const query = useServicePackagesQuery();
  const packages = query.data ?? [];

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Paket silindi", type: "success" });
        setDeleting(null);
      },
      onError: (error) => {
        toast.add({
          title: "Silme başarısız",
          description: getQueryErrorMessage(error),
          type: "error",
        });
        setDeleting(null);
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Paketler</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {packages.length} paket
          </p>
        </div>
        <Button className="h-10" onClick={() => setDialogState({ servicePackage: null })}>
          <Plus className="size-4" />
          Yeni Paket
        </Button>
      </div>

      <div className="mt-4">
        {query.isPending && (
          <div className="flex justify-center py-16">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {query.isError && (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
            <CircleAlert className="size-6 text-destructive" />
            <p className="text-sm text-muted-foreground">
              {getQueryErrorMessage(query.error)}
            </p>
            <Button onClick={() => query.refetch()} variant="outline">
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && packages.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <Package className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz paket yok</p>
            <p className="text-sm text-muted-foreground">
              İlk paketi oluşturarak başlayın
            </p>
            <Button
              className="mt-1"
              onClick={() => setDialogState({ servicePackage: null })}
              variant="outline"
            >
              <Plus className="size-4" />
              Yeni Paket
            </Button>
          </div>
        )}

        {query.isSuccess && packages.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4 w-14">Görsel</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>İçerik</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.map((servicePackage) => (
                    <TableRow key={servicePackage.id}>
                      <TableCell className="pl-4">
                        <PackageAvatar servicePackage={servicePackage} />
                      </TableCell>
                      <TableCell className="font-medium">
                        {servicePackage.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {servicePackage.category?.name || "—"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {servicePackage.slug || "—"}
                      </TableCell>
                      <TableCell>{formatPrice(servicePackage.price) ?? "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {servicePackage.services.length} hizmet ·{" "}
                        {packageTotalQuantity(servicePackage)} kullanım
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={servicePackage.is_active} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setDialogState({ servicePackage })
                            }
                            aria-label={`${servicePackage.name} düzenle`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(servicePackage)}
                            aria-label={`${servicePackage.name} sil`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {packages.map((servicePackage) => (
                <div className="rounded-xl border bg-card p-4" key={servicePackage.id}>
                  <div className="flex items-start gap-3">
                    <PackageAvatar servicePackage={servicePackage} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{servicePackage.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {servicePackage.category?.name || "—"}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {servicePackage.slug || "—"}
                      </p>
                    </div>
                    <StatusBadge active={servicePackage.is_active} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span>{formatPrice(servicePackage.price) ?? "—"}</span>
                    <span>
                      {servicePackage.services.length} hizmet ·{" "}
                      {packageTotalQuantity(servicePackage)} kullanım
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button
                      className="h-9"
                      onClick={() => setDialogState({ servicePackage })}
                      size="sm"
                      variant="outline"
                    >
                      <Pencil className="size-3.5" />
                      Düzenle
                    </Button>
                    <Button
                      className="h-9 text-destructive hover:text-destructive"
                      onClick={() => setDeleting(servicePackage)}
                      size="sm"
                      variant="outline"
                    >
                      <Trash2 className="size-3.5" />
                      Sil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <ServicePackageFormDialog
        key={dialogState ? (dialogState.servicePackage?.id ?? "new") : "closed"}
        open={Boolean(dialogState)}
        servicePackage={dialogState?.servicePackage ?? null}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        open={Boolean(deleting)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paketi sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.name ?? ""}&quot; silinecek. Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              className="h-10"
              disabled={deleteMutation.isPending}
              onClick={handleDelete}
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
