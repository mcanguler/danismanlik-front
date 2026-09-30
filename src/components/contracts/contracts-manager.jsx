"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  FileSignature,
  LoaderCircle,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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
import { formatDateTr } from "@/lib/format";
import { getQueryErrorMessage } from "@/lib/query-errors";
import {
  CONTRACT_TYPE_LABELS,
  useAdminContractTemplatesQuery,
  useContractTemplatePreviewQuery,
  useDeleteContractTemplate,
} from "@/lib/contracts";

export function ContractsManager() {
  const router = useRouter();
  const [deleting, setDeleting] = useState(null);
  const [previewId, setPreviewId] = useState(null);

  const query = useAdminContractTemplatesQuery();
  const deleteMutation = useDeleteContractTemplate();
  const previewQuery = useContractTemplatePreviewQuery(previewId, {
    enabled: Boolean(previewId),
  });

  const templates = query.data ?? [];
  const activeDistanceSales = templates.filter(
    (item) => item.type === "DISTANCE_SALES" && item.is_active
  );

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Sözleşme silindi", type: "success" });
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
    <div className="w-full flex-1 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Sözleşmeler</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {`${templates.length} sözleşme şablonu`}
          </p>
        </div>
        <Button
          className="h-10"
          onClick={() => router.push("/dashboard/admin/sozlesmeler/yeni")}
        >
          <Plus className="size-4" />
          Yeni Sözleşme
        </Button>
      </div>

      <p className="mt-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2.5 text-xs text-muted-foreground">
        Mesafeli satış sözleşmesi tipinde aynı anda yalnızca bir aktif şablon
        olabilir; aktif şablon checkout&apos;ta onay zorunluluğu doğurur.
      </p>

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

        {query.isSuccess && templates.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <FileSignature className="size-8 text-muted-foreground" />
            <p className="text-sm font-medium">Henüz sözleşme şablonu yok</p>
            <p className="text-sm text-muted-foreground">
              Mesafeli satış sözleşmesi oluşturarak başlayın
            </p>
            <Button
              onClick={() => router.push("/dashboard/admin/sozlesmeler/yeni")}
              variant="outline"
            >
              <Plus className="size-4" />
              Yeni Sözleşme
            </Button>
          </div>
        )}

        {query.isSuccess && templates.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Başlık</TableHead>
                    <TableHead>Tip</TableHead>
                    <TableHead>Versiyon</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Güncelleme</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="pl-4 font-medium">
                        {template.title}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {CONTRACT_TYPE_LABELS[template.type] ?? template.type}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {template.version}
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={template.is_active} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDateTr(template.updated_at)}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            aria-label={`${template.title} önizle`}
                            onClick={() => setPreviewId(template.id)}
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            <FileSignature className="size-4" />
                          </Button>
                          <Button
                            aria-label={`${template.title} düzenle`}
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/sozlesmeler/${template.id}`
                              )
                            }
                            size="icon-sm"
                            type="button"
                            variant="ghost"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            aria-label={`${template.title} sil`}
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(template)}
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
              {templates.map((template) => (
                <div className="rounded-xl border bg-card p-4" key={template.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{template.title}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {CONTRACT_TYPE_LABELS[template.type] ?? template.type}{" "}
                        · v{template.version}
                      </p>
                    </div>
                    <StatusBadge active={template.is_active} />
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                    <Button
                      onClick={() => setPreviewId(template.id)}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Önizle
                    </Button>
                    <Button
                      onClick={() =>
                        router.push(`/dashboard/admin/sozlesmeler/${template.id}`)
                      }
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <Pencil className="size-3.5" />
                      Düzenle
                    </Button>
                    <Button
                      className="text-destructive hover:text-destructive"
                      onClick={() => setDeleting(template)}
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
      </div>

      <Dialog
        onOpenChange={(open) => {
          if (!open) setPreviewId(null);
        }}
        open={Boolean(previewId)}
      >
        <DialogContent className="max-w-2xl">
          <DialogTitle className="pr-6 font-title-lg text-title-lg font-semibold text-primary">
            {previewQuery.data?.title || "Önizleme"}
            {previewQuery.data?.version
              ? ` (v${previewQuery.data.version})`
              : ""}
          </DialogTitle>
          {previewQuery.isPending ? (
            <div className="flex justify-center py-10">
              <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          {previewQuery.isError ? (
            <p className="text-sm text-destructive">
              {getQueryErrorMessage(previewQuery.error)}
            </p>
          ) : null}
          {previewQuery.data?.content ? (
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                {previewQuery.data.content}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
        open={Boolean(deleting)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sözleşmeyi sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.title ?? ""}&quot; (v{deleting?.version ?? ""})
              şablonu kalıcı olarak silinecek. Bu işlem geri alınamaz.
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
