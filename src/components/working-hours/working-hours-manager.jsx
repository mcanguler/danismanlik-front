"use client";

import { useState } from "react";
import { CircleAlert, LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import {
  dayLabel,
  useDeleteWorkingHour,
  useWorkingHoursQuery,
} from "@/lib/working-hours";
import { WorkingHourFormDialog } from "@/components/working-hours/working-hour-form-dialog";

function getErrorMessage(error) {
  if (error instanceof ApiError) return error.message;
  return "Beklenmeyen bir hata oluştu";
}

export function WorkingHoursManager() {
  const [dialogState, setDialogState] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const deleteMutation = useDeleteWorkingHour();

  const query = useWorkingHoursQuery();
  const workingHours = query.data ?? [];

  const handleDelete = () => {
    if (!deleting) return;
    deleteMutation.mutate(deleting.id, {
      onSuccess: () => {
        toast.add({ title: "Çalışma saati silindi", type: "success" });
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
            Çalışma Saatleri
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {workingHours.length} kayıt
          </p>
        </div>
        <Button
          size="lg"
          className="h-10"
          onClick={() => setDialogState({ workingHour: null })}
        >
          <Plus className="size-4" />
          Yeni Çalışma Saati
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

        {query.isSuccess && workingHours.length === 0 && (
          <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
            <p className="text-sm font-medium">Henüz çalışma saati yok</p>
            <p className="text-sm text-muted-foreground">
              İlk çalışma saatini ekleyerek başlayın
            </p>
            <Button
              variant="outline"
              onClick={() => setDialogState({ workingHour: null })}
            >
              <Plus className="size-4" />
              Yeni Çalışma Saati
            </Button>
          </div>
        )}

        {query.isSuccess && workingHours.length > 0 && (
          <>
            <div className="hidden overflow-hidden rounded-xl border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-4">Danışman</TableHead>
                    <TableHead>Gün</TableHead>
                    <TableHead>Başlangıç</TableHead>
                    <TableHead>Bitiş</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="pr-4 text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workingHours.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="pl-4 font-medium">
                        {item.consultantName}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {dayLabel(item.day_of_week)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.start_time}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.end_time}
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
                              setDialogState({ workingHour: item })
                            }
                            aria-label={`${item.consultantName} ${dayLabel(item.day_of_week)} düzenle`}
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => setDeleting(item)}
                            aria-label={`${item.consultantName} ${dayLabel(item.day_of_week)} sil`}
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
              {workingHours.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl border bg-card p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {item.consultantName}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {dayLabel(item.day_of_week)}
                      </p>
                    </div>
                    <StatusBadge active={item.is_active} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {item.start_time} - {item.end_time}
                  </p>
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 flex-1"
                      onClick={() => setDialogState({ workingHour: item })}
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

      <WorkingHourFormDialog
        key={dialogState ? (dialogState.workingHour?.id ?? "new") : "closed"}
        open={Boolean(dialogState)}
        workingHour={dialogState?.workingHour ?? null}
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
            <AlertDialogTitle>Çalışma saatini sil</AlertDialogTitle>
            <AlertDialogDescription>
              &quot;{deleting?.consultantName ?? ""} -{" "}
              {dayLabel(deleting?.day_of_week)} {deleting?.start_time ?? ""}-
              {deleting?.end_time ?? ""}
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