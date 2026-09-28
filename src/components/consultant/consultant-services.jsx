"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CircleAlert,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { useMyConsultant } from "@/lib/consultant-scope";
import { useServicesQuery } from "@/lib/services";
import {
  useConsultantServicesQuery,
  useCreateConsultantService,
  useDeleteConsultantService,
  useUpdateConsultantService,
} from "@/lib/consultant-services";
import { AdminFormPage } from "@/components/admin/admin-form-page";

const LIST_PATH = "/dashboard/consultant/hizmetlerim";

const selectClassName =
  "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

const consultantServiceSchema = z.object({
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

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function formatPrice(price) {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(Number(price ?? 0));
}

function NoConsultantNotice() {
  return (
    <div className="w-full flex-1 px-4 py-6">
      <h1 className="text-xl font-semibold tracking-tight">Hizmetlerim</h1>
      <div className="mt-4 flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
        <CircleAlert className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium">Danışman profiliniz bulunamadı</p>
        <p className="text-sm text-muted-foreground">
          Hizmetlerinizi yönetebilmeniz için hesabınızın bir danışman profiliyle
          ilişkilendirilmesi gerekiyor. Lütfen yöneticinizle iletişime geçin.
        </p>
      </div>
    </div>
  );
}

export function ConsultantServicesManager() {
  const { consultantId, hasConsultant } = useMyConsultant();
  const router = useRouter();
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteConsultantService();

  const query = useConsultantServicesQuery(
    { consultant_id: consultantId ?? "" },
    { enabled: hasConsultant }
  );
  const services = (query.data ?? []).filter(
    (item) => String(item.consultant_id) === String(consultantId)
  );

  if (!hasConsultant) return <NoConsultantNotice />;

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Hizmet kaldırıldı", type: "success" });
        setDeleting(null);
      },
      onError: (error) => {
        toast.add({
          title: "Silme başarısız",
          description: getErrorMessage(error),
          type: "error",
        });
        setDeleting(null);
      },
    });
  };

  return (
    <div className="w-full flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Hizmetlerim
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {services.length} hizmet · yalnızca kendi hizmetleriniz
          </p>
        </div>
        <Button
          size="lg"
          className="h-10"
          onClick={() => router.push(`${LIST_PATH}/yeni`)}
        >
          <Plus className="size-4" />
          Hizmet Ekle
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
              {getErrorMessage(query.error)}
            </p>
            <Button variant="outline" onClick={() => query.refetch()}>
              Tekrar Dene
            </Button>
          </div>
        )}

        {query.isSuccess && services.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <p className="text-sm font-medium">Henüz hizmetiniz yok</p>
            <p className="text-sm text-muted-foreground">
              Danışanların randevu alabilmesi için ilk hizmetinizi ekleyin
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`${LIST_PATH}/yeni`)}
            >
              <Plus className="size-4" />
              Hizmet Ekle
            </Button>
          </div>
        )}

        {query.isSuccess && services.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Hizmet</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Süre</TableHead>
                    <TableHead>Mola</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4 font-medium">
                        {item.serviceName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatPrice(item.price)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.duration} dk
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.break_duration} dk
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={item.is_active} />
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              router.push(`${LIST_PATH}/${item.id}`)
                            }
                            aria-label={`${item.serviceName} hizmetini düzenle`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(item)}
                            aria-label={`${item.serviceName} hizmetini sil`}
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
              {services.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="truncate font-medium">
                      {item.serviceName}
                    </p>
                    <StatusBadge active={item.is_active} />
                  </div>
                  <div className="mt-2 flex flex-col gap-0.5 text-xs text-muted-foreground">
                    <p>Fiyat: {formatPrice(item.price)}</p>
                    <p>
                      Süre: {item.duration} dk · Mola: {item.break_duration} dk
                    </p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 flex-1"
                      onClick={() => router.push(`${LIST_PATH}/${item.id}`)}
                    >
                      <Pencil className="size-3.5" />
                      Düzenle
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 flex-1 text-destructive hover:text-destructive"
                      onClick={() => setDeleting(item)}
                    >
                      <Trash2 className="size-3.5" />
                      Kaldır
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hizmeti kaldır</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.serviceName ?? ""}
              &quot; hizmeti profilinizden kaldırılacak. Bu işlem geri
              alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              className="h-10"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              {deleteMutation.isPending ? "Kaldırılıyor..." : "Kaldır"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function toFormValues(consultantService) {
  return {
    service_id: consultantService?.service_id ?? "",
    price: consultantService?.price ?? "",
    duration: consultantService?.duration ?? "",
    break_duration: consultantService?.break_duration ?? 0,
    is_active: consultantService ? Boolean(consultantService.is_active) : true,
  };
}

function ConsultantServiceForm({ isEdit, item }) {
  const { user, consultantId } = useMyConsultant();
  const router = useRouter();
  const create = useCreateConsultantService();
  const update = useUpdateConsultantService();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(consultantServiceSchema.shape);

  const servicesQuery = useServicesQuery();
  const services = servicesQuery.data ?? [];

  const form = useForm({
    resolver: zodResolver(consultantServiceSchema),
    defaultValues: toFormValues(item),
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
      consultant_id: consultantId,
      service_id: Number(values.service_id),
      price: Number(values.price),
      duration: Number(values.duration),
      break_duration: Number(values.break_duration),
      is_active: values.is_active,
    };
    if (isEdit) {
      update.mutate(
        { id: item.id, payload },
        {
          onSuccess: () => {
            toast.add({ title: "Hizmet güncellendi", type: "success" });
            router.push(LIST_PATH);
          },
          onError: handleError,
        }
      );
      return;
    }
    create.mutate(payload, {
      onSuccess: () => {
        toast.add({ title: "Hizmet eklendi", type: "success" });
        router.push(LIST_PATH);
      },
      onError: handleError,
    });
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label>Danışman</Label>
        <p className="text-sm text-muted-foreground">
          {user?.name ?? user?.first_name ?? "Kendi hesabınız"} (kendi
          kayıtlarınız)
        </p>
      </div>
      <Controller
        control={form.control}
        name="service_id"
        render={({ field }) => (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="service_id">Hizmet</Label>
            {servicesQuery.isPending ? (
              <div className="flex h-8 items-center gap-2 rounded-lg border border-input px-2.5 text-sm text-muted-foreground">
                <LoaderCircle className="size-4 animate-spin" />
                Yükleniyor...
              </div>
            ) : (
              <select
                id="service_id"
                className={selectClassName}
                aria-invalid={Boolean(form.formState.errors.service_id)}
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
              </select>
            )}
            {form.formState.errors.service_id && (
              <p className="text-xs text-destructive">
                {form.formState.errors.service_id.message}
              </p>
            )}
          </div>
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
            Hizmetin randevuya açık/kapalı durumu
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

export function ConsultantServiceCreatePage() {
  const { hasConsultant } = useMyConsultant();

  if (!hasConsultant) return <NoConsultantNotice />;

  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Hizmetlerim"
      title="Yeni Hizmet"
      description="Kendinize hizmet ekleyin ve fiyat/süre bilgilerinizi belirleyin"
      cardTitle="Hizmet Bilgileri"
    >
      <ConsultantServiceForm isEdit={false} item={null} />
    </AdminFormPage>
  );
}

export function ConsultantServiceEditPage({ id }) {
  const { consultantId, hasConsultant } = useMyConsultant();
  const query = useConsultantServicesQuery(
    { consultant_id: consultantId ?? "" },
    { enabled: hasConsultant }
  );
  const items = (query.data ?? []).filter(
    (item) => String(item.consultant_id) === String(consultantId)
  );
  const item = items.find((x) => String(x.id) === String(id));

  if (!hasConsultant) return <NoConsultantNotice />;

  if (query.isPending) {
    return (
      <AdminFormPage
        backHref={LIST_PATH}
        backLabel="Hizmetlerim"
        title="Hizmeti Düzenle"
      >
        <div className="flex justify-center py-10">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      </AdminFormPage>
    );
  }

  if (query.isError) {
    return (
      <AdminFormPage
        backHref={LIST_PATH}
        backLabel="Hizmetlerim"
        title="Hizmeti Düzenle"
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-destructive">
            {getErrorMessage(query.error)}
          </p>
          <Button variant="outline" size="sm" onClick={() => query.refetch()}>
            Tekrar Dene
          </Button>
        </div>
      </AdminFormPage>
    );
  }

  if (!item) {
    return (
      <AdminFormPage
        backHref={LIST_PATH}
        backLabel="Hizmetlerim"
        title="Hizmeti Düzenle"
      >
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">Kayıt bulunamadı.</p>
          <Link
            className="text-sm text-muted-foreground hover:text-foreground"
            href={LIST_PATH}
          >
            ← Listeye Dön
          </Link>
        </div>
      </AdminFormPage>
    );
  }

  return (
    <AdminFormPage
      backHref={LIST_PATH}
      backLabel="Hizmetlerim"
      title="Hizmeti Düzenle"
      description={item.serviceName}
      cardTitle="Hizmet Bilgileri"
    >
      <ConsultantServiceForm key={item.id} isEdit item={item} />
    </AdminFormPage>
  );
}
