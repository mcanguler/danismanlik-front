"use client";

import { useState } from "react";
import { CircleAlert, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  useBlockedTimesQuery,
  useDeleteBlockedTime,
} from "@/lib/blocked-times";
import { BlockedTimeFormDialog } from "@/components/blocked-times/blocked-time-form-dialog";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function BlockedTimesManager() {
  const [dialogState, setDialogState] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteBlockedTime();

  const query = useBlockedTimesQuery();
  const blockedTimes = query.data ?? [];

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Bloklu zaman silindi", type: "success" });
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
          <h1 className="text-xl font-semibold tracking-tight">
            Bloklu Zamanlar
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {blockedTimes.length} kayıt
          </p>
        </div>
        <Button
          size="lg"
          className="h-10"
          onClick={() => setDialogState({ blockedTime: null })}
        >
          <Plus className="size-4" />
          Yeni Bloklu Zaman
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

        {query.isSuccess && blockedTimes.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <p className="text-sm font-medium">Henüz bloklu zaman yok</p>
            <p className="text-sm text-muted-foreground">
              İlk bloklu zamanı ekleyerek başlayın
            </p>
            <Button
              variant="outline"
              onClick={() => setDialogState({ blockedTime: null })}
            >
              <Plus className="size-4" />
              Yeni Bloklu Zaman
            </Button>
          </div>
        )}

        {query.isSuccess && blockedTimes.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Danışman</TableHead>
                    <TableHead>Başlangıç</TableHead>
                    <TableHead>Bitiş</TableHead>
                    <TableHead>Sebep</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {blockedTimes.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4 font-medium">
                        {item.consultantName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.startAtLabel}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.endAtLabel}
                      </TableCell>
                      <TableCell className="max-w-[14rem] truncate text-muted-foreground">
                        {item.reason || "—"}
                      </TableCell>
                      <TableCell className="pr-4">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() =>
                              setDialogState({ blockedTime: item })
                            }
                            aria-label={`${item.consultantName} bloklu zamanını düzenle`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(item)}
                            aria-label={`${item.consultantName} bloklu zamanını sil`}
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
              {blockedTimes.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {item.consultantName}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {item.startAtLabel} - {item.endAtLabel}
                    </p>
                    {item.reason && (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.reason}
                      </p>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 flex-1"
                      onClick={() => setDialogState({ blockedTime: item })}
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
                      Sil
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BlockedTimeFormDialog
        key={dialogState ? (dialogState.blockedTime?.id ?? "new") : "closed"}
        open={Boolean(dialogState)}
        blockedTime={dialogState?.blockedTime ?? null}
        onOpenChange={(open) => {
          if (!open) setDialogState(null);
        }}
      />

      <AlertDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bloklu zamanı sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.consultantName ?? ""} ·{" "}
              {deleting?.startAtLabel ?? ""} - {deleting?.endAtLabel ?? ""}
              &quot; kaydı silinecek. Bu işlem geri alınamaz.
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
              {deleteMutation.isPending ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}