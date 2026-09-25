"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CircleAlert,
  FileText,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { StatusBadge } from "@/components/ui/status-badge";
import { ContentEditor } from "@/components/ui/content-editor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { formatDateTr } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import {
  useAdminPagesQuery,
  useCreatePage,
  useDeletePage,
  useUpdatePage,
} from "@/lib/pages";

const pageFormSchema = z.object({
  title: z
    .string()
    .min(1, "Başlık zorunludur")
    .max(255, "En fazla 255 karakter olabilir"),
  content: z.string(),
  seo_title: z.string().max(255, "En fazla 255 karakter olabilir"),
  seo_description: z.string(),
  is_active: z.boolean(),
});

const PAGE_SIZE = 15;

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

function PageFormDialog({ open, page, onOpenChange }) {
  const isEdit = Boolean(page);
  const create = useCreatePage();
  const update = useUpdatePage();
  const mutation = isEdit ? update : create;
  const fieldNames = Object.keys(pageFormSchema.shape);

  const form = useForm({
    resolver: zodResolver(pageFormSchema),
    defaultValues: {
      title: page?.title ?? "",
      content: page?.content ?? "",
      seo_title: page?.seo_title ?? "",
      seo_description: page?.seo_description ?? "",
      is_active: page ? Boolean(page.is_active) : true,
    },
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
      title: values.title,
      content: values.content ?? "",
      seo_title: values.seo_title ?? "",
      seo_description: values.seo_description ?? "",
      is_active: values.is_active,
    };

    if (isEdit) {
      update.mutate(
        { id: page.id, payload },
        {
          onSuccess: (updated) => {
            toast.add({ title: "Sayfa güncellendi", type: "success" });
            form.reset({
              title: updated.title ?? "",
              content: updated.content ?? "",
              seo_title: updated.seo_title ?? "",
              seo_description: updated.seo_description ?? "",
              is_active: Boolean(updated.is_active),
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
        toast.add({ title: "Sayfa oluşturuldu", type: "success" });
        onOpenChange(false);
      },
      onError: handleError,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Sayfayı Düzenle" : "Yeni Sayfa"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? page.slug
                ? `Public adres: /${page.slug}`
                : "Sayfa bilgilerini güncelleyin"
              : "Public sayfa içeriği oluşturun; slug başlıktan otomatik üretilir"}
          </DialogDescription>
        </DialogHeader>
        <form className="flex flex-col gap-4" noValidate onSubmit={onSubmit}>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page_title">Başlık</Label>
            <Input
              id="page_title"
              placeholder="Örn. KVKK Aydınlatma Metni"
              type="text"
              {...form.register("title")}
            />
            {form.formState.errors.title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.title.message}
              </p>
            )}
          </div>
          {isEdit && page.slug && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="page_slug">Slug</Label>
              <Input
                disabled
                id="page_slug"
                readOnly
                type="text"
                value={page.slug}
              />
              <p className="text-xs text-muted-foreground">
                Başlık değişirse otomatik güncellenir
              </p>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label>Content</Label>
            <Controller
              control={form.control}
              name="content"
              render={({ field }) => (
                <ContentEditor
                  disabled={mutation.isPending}
                  error={form.formState.errors.content?.message}
                  id="page_content"
                  minHeight="12rem"
                  onChange={field.onChange}
                  placeholder="Sayfa içeriğini yazın..."
                  value={field.value ?? ""}
                />
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page_seo_title">SEO Title</Label>
            <Input
              id="page_seo_title"
              placeholder="Boş bırakılırsa başlık kullanılır"
              type="text"
              {...form.register("seo_title")}
            />
            {form.formState.errors.seo_title && (
              <p className="text-xs text-destructive">
                {form.formState.errors.seo_title.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page_seo_description">SEO Description</Label>
            <Textarea
              id="page_seo_description"
              placeholder="Boş bırakılırsa content özeti kullanılır"
              rows={3}
              {...form.register("seo_description")}
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="page_is_active">Aktif</Label>
              <p className="text-xs text-muted-foreground">
                Aktif sayfalar public tarafta yayınlanır
              </p>
            </div>
            <Controller
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  id="page_is_active"
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

export function PagesManager() {
  const [page, setPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isActive, setIsActive] = useState("");
  const [dialogState, setDialogState] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const searching = Boolean(search.trim());

  // Arama modunda backend'in per_page desteğiyle geniş liste çekilir ve
  // title + slug (case-insensitive) client-side filtrelenir; arama yokken
  // sayfalama backend'de çalışır.
  const query = useAdminPagesQuery(
    searching
      ? { per_page: 100, ...(isActive ? { is_active: isActive } : {}) }
      : {
          page,
          ...(isActive ? { is_active: isActive } : {}),
        }
  );

  const filteredItems = useMemo(() => {
    const items = query.data?.items ?? [];
    if (!searching) return items;
    const q = search.trim().toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.slug.toLowerCase().includes(q)
    );
  }, [query.data, searching, search]);

  const clientTotalPages = Math.max(
    1,
    Math.ceil(filteredItems.length / PAGE_SIZE)
  );
  const clientCurrentPage = Math.min(clientPage, clientTotalPages);
  const clientPageItems = filteredItems.slice(
    (clientCurrentPage - 1) * PAGE_SIZE,
    clientCurrentPage * PAGE_SIZE
  );

  const pages = searching ? clientPageItems : filteredItems;
  const meta = searching ? null : query.data?.meta;
  const total = searching ? filteredItems.length : (query.data?.meta?.total ?? 0);
  const deleteMutation = useDeletePage();

  const updateSearch = (value) => {
    setSearch(value);
    setPage(1);
    setClientPage(1);
  };

  const updateIsActive = (value) => {
    setIsActive(value);
    setPage(1);
    setClientPage(1);
  };

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Sayfa silindi", type: "success" });
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
    <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sayfalar</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {`${total} sayfa`}
          </p>
        </div>
        <Button
          className="h-10"
          onClick={() => setDialogState({ page: null })}
        >
          <Plus className="size-4" />
          Yeni Sayfa
        </Button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="w-56 pl-8"
            onChange={(event) => updateSearch(event.target.value)}
            placeholder="Başlık veya slug ara"
            type="text"
            value={search}
          />
        </div>
        <select
          aria-label="Aktiflik filtresi"
          className="h-9 rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
          onChange={(event) => updateIsActive(event.target.value)}
          value={isActive}
        >
          <option value="">Tüm durumlar</option>
          <option value="true">Aktif</option>
          <option value="false">Pasif</option>
        </select>
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

        {query.isSuccess && pages.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <FileText className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">
              {search || isActive ? "Sayfa bulunamadı" : "Henüz sayfa yok"}
            </p>
            <p className="text-sm text-muted-foreground">
              {search || isActive
                ? "Filtreleri değiştirerek tekrar arayın"
                : "CMS sayfası oluşturarak başlayın"}
            </p>
            {!search && !isActive && (
              <Button
                onClick={() => setDialogState({ page: null })}
                variant="outline"
              >
                <Plus className="size-4" />
                Yeni Sayfa
              </Button>
            )}
          </div>
        )}

        {query.isSuccess && pages.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Başlık</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>SEO Title</TableHead>
                    <TableHead>Güncelleme</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="pl-4">
                        <Link
                          className="font-medium underline-offset-4 hover:underline"
                          href={`/${page.slug}`}
                        >
                          {page.title}
                        </Link>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {page.slug}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={page.is_active} />
                      </TableCell>
                      <TableCell className="max-w-48 truncate text-sm text-muted-foreground">
                        {page.seo_title || "—"}
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDateTr(page.updated_at)}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            aria-label={`${page.title} düzenle`}
                            onClick={() => setDialogState({ page })}
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            aria-label={`${page.title} sil`}
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(page)}
                            size="icon-sm"
                            type="button"
                            variant="ghost"
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
              {pages.map((page) => (
                <div className="rounded-xl border bg-card p-4" key={page.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        className="truncate font-medium underline-offset-4 hover:underline"
                        href={`/${page.slug}`}
                      >
                        {page.title}
                      </Link>
                      <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                        /{page.slug}
                      </p>
                    </div>
                    <StatusBadge active={page.is_active} />
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                    <span className="max-w-48 truncate">
                      SEO: {page.seo_title || "—"}
                    </span>
                    <span>Güncelleme: {formatDateTr(page.updated_at)}</span>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Button
                      onClick={() => setDialogState({ page })}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Pencil className="size-3.5" />
                      Düzenle
                    </Button>
                    <Button
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleting(page)}
                      size="sm"
                      type="button"
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

        {meta && meta.lastPage > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              disabled={meta.currentPage <= 1}
              onClick={() => setPage((current) => current - 1)}
              size="sm"
              variant="outline"
            >
              Önceki
            </Button>
            <span className="text-sm text-muted-foreground">
              Sayfa {meta.currentPage} / {meta.lastPage}
            </span>
            <Button
              disabled={meta.currentPage >= meta.lastPage}
              onClick={() => setPage((current) => current + 1)}
              size="sm"
              variant="outline"
            >
              Sonraki
            </Button>
          </div>
        )}

        {searching && clientTotalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              disabled={clientCurrentPage <= 1}
              onClick={() => setClientPage((current) => current - 1)}
              size="sm"
              variant="outline"
            >
              Önceki
            </Button>
            <span className="text-sm text-muted-foreground">
              Sayfa {clientCurrentPage} / {clientTotalPages}
            </span>
            <Button
              disabled={clientCurrentPage >= clientTotalPages}
              onClick={() => setClientPage((current) => current + 1)}
              size="sm"
              variant="outline"
            >
              Sonraki
            </Button>
          </div>
        )}
      </div>

      <PageFormDialog
        key={dialogState ? (dialogState.page?.id ?? "new") : "closed"}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
        open={Boolean(dialogState)}
        page={dialogState?.page ?? null}
      />

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        open={Boolean(deleting)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sayfayı sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.title ?? ""}&quot; sayfası kalıcı olarak
              silinecek ve public adresi yayından kalkacak. Bu işlem geri
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
