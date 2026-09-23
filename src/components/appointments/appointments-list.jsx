"use client";

import {useEffect, useState} from "react";
import Link from "next/link";
import {CircleAlert, LoaderCircle, Pencil, Plus, X} from "lucide-react";
import {Button} from "@/components/ui/button";
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
import {toast} from "@/components/ui/toast";
import {ApiError} from "@/lib/api";
import {useAuthStore} from "@/lib/auth";
import {useAuth} from "@/lib/auth-hooks";
import {
    APPOINTMENT_STATUSES,
    formatDateLabel,
    formatTimeLabel,
    getErrorMessage,
    useAppointmentsQuery,
    useCancelAppointment,
} from "@/lib/appointments";
import {AppointmentStatusBadge} from "@/components/appointments/appointment-status-badge";

const CANCELLABLE_STATUSES = [
    APPOINTMENT_STATUSES.PENDING,
    APPOINTMENT_STATUSES.CONFIRMED,
];

function canCancel(status) {
    return CANCELLABLE_STATUSES.includes(status);
}

function AppointmentRowCells({appointment, role}) {
    return (
        <>
            {role === "ADMIN" && (
                <TableCell className="pl-4 font-medium">
                    {appointment.consultantName}
                </TableCell>
            )}
            {role === "CUSTOMER" && (
                <TableCell className="pl-4 font-medium">
                    {appointment.consultantName}
                </TableCell>
            )}
            {(role === "ADMIN" || role === "CONSULTANT") && (
                <TableCell className={role === "CONSULTANT" ? "pl-4 font-medium" : ""}>
                    {appointment.customerName}
                </TableCell>
            )}
            <TableCell className="text-muted-foreground">
                {appointment.serviceName ?? "—"}
            </TableCell>
            <TableCell className="whitespace-nowrap">
        <span className="font-medium">
          {formatDateLabel(appointment.startAt)}
        </span>
                <span className="ml-1.5 text-muted-foreground">
          {formatTimeLabel(appointment.startAt)}
        </span>
                {appointment.endAt && (
                    <span className="text-muted-foreground">
            {" "}
                        - {formatTimeLabel(appointment.endAt)}
          </span>
                )}
            </TableCell>
            <TableCell>
                <AppointmentStatusBadge status={appointment.status}/>
            </TableCell>
        </>
    );
}

export function AppointmentsList() {
    const {user} = useAuth();
    const role = user?.role;
    const endSession = useAuthStore((state) => state.endSession);
    const [cancelling, setCancelling] = useState(null);
    const cancelMutation = useCancelAppointment();

    const query = useAppointmentsQuery();
    const appointments = query.data ?? [];

    useEffect(() => {
        if (query.isError && query.error instanceof ApiError && query.error.status === 401) {
            endSession();
        }
    }, [query.isError, query.error, endSession]);

    const handleCancel = () => {
        if (!cancelling) return;
        cancelMutation.mutate(cancelling.id, {
            onSuccess: () => {
                toast.add({title: "Randevu iptal edildi", type: "success"});
                setCancelling(null);
            },
            onError: (error) => {
                if (error instanceof ApiError && error.status === 401) {
                    endSession();
                    setCancelling(null);
                    return;
                }
                if (error instanceof ApiError && error.status === 422) {
                    toast.add({title: "Bu randevu iptal edilemez.", type: "error"});
                } else {
                    toast.add({
                        title: "Randevu iptal edilemedi",
                        description: getErrorMessage(error),
                        type: "error",
                    });
                }
                setCancelling(null);
            },
        });
    };

    const showConsultantColumn = role === "ADMIN" || role === "CUSTOMER";
    const showCustomerColumn = role === "ADMIN" || role === "CONSULTANT";

    return (
        <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold tracking-tight">Randevular</h1>
                    {query.isSuccess && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {appointments.length} randevu
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-4">
                {query.isPending && (
                    <div className="flex justify-center py-16">
                        <LoaderCircle className="size-6 animate-spin text-muted-foreground"/>
                    </div>
                )}

                {query.isError && (
                    <div
                        className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-10 text-center">
                        <CircleAlert className="size-6 text-destructive"/>
                        <p className="text-sm text-muted-foreground">
                            {getErrorMessage(query.error)}
                        </p>
                        <Button variant="outline" onClick={() => query.refetch()}>
                            Tekrar Dene
                        </Button>
                    </div>
                )}

                {query.isSuccess && appointments.length === 0 && (
                    <div className="flex flex-col items-center gap-3 rounded-xl border px-4 py-14 text-center">
                        <p className="text-sm font-medium">Randevunuz bulunmuyor</p>
                        <p className="text-sm text-muted-foreground">
                            Geçerli bir randevunuz bulunmamaktadır. Yeni bir randevu almak için lütfen randevu alma sayfasını ziyaret edin.
                        </p>
                    </div>
                )}

                {query.isSuccess && appointments.length > 0 && (
                    <>
                        <div className="hidden overflow-hidden rounded-xl border md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {showConsultantColumn && <TableHead className="pl-4">Danışman</TableHead>}
                                        {showCustomerColumn && <TableHead
                                            className={showConsultantColumn ? "" : "pl-4"}>Müşteri</TableHead>}
                                        <TableHead>Hizmet</TableHead>
                                        <TableHead>Tarih / Saat</TableHead>
                                        <TableHead>Durum</TableHead>
                                        <TableHead className="pr-4 text-right">İşlemler</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appointments.map((appointment) => (
                                        <TableRow key={appointment.id}>
                                            <AppointmentRowCells appointment={appointment} role={role}/>
                                            <TableCell className="pr-4">
                                                <div className="flex items-center justify-end gap-1">
                                                    {(role === "ADMIN" || role === "CONSULTANT") && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            render={
                                                                <Link href={`/appointments/${appointment.id}/edit`}/>
                                                            }
                                                            aria-label="Randevuyu düzenle"
                                                        >
                                                            <Pencil className="size-4"/>
                                                        </Button>
                                                    )}
                                                    {canCancel(appointment.status) && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => setCancelling(appointment)}
                                                            aria-label="Randevuyu iptal et"
                                                        >
                                                            <X className="size-4"/>
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="flex flex-col gap-3 md:hidden">
                            {appointments.map((appointment) => (
                                <div key={appointment.id} className="rounded-xl border bg-card p-4">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-medium">
                                                {role === "CUSTOMER"
                                                    ? appointment.consultantName
                                                    : appointment.customerName}
                                            </p>
                                            <p className="mt-0.5 truncate text-sm text-muted-foreground">
                                                {appointment.serviceName ?? "—"}
                                            </p>
                                        </div>
                                        <AppointmentStatusBadge status={appointment.status}/>
                                    </div>
                                    <div className="mt-2 flex flex-col gap-0.5 text-xs text-muted-foreground">
                                        {role === "ADMIN" && (
                                            <p>
                                                Danışman: {appointment.consultantName} · Müşteri:{" "}
                                                {appointment.customerName}
                                            </p>
                                        )}
                                        <p>
                                            {formatDateLabel(appointment.startAt)} ·{" "}
                                            {formatTimeLabel(appointment.startAt)}
                                            {appointment.endAt
                                                ? ` - ${formatTimeLabel(appointment.endAt)}`
                                                : ""}
                                        </p>
                                    </div>
                                    {(canCancel(appointment.status) ||
                                        role === "ADMIN" ||
                                        role === "CONSULTANT") && (
                                        <div className="mt-3 flex items-center gap-2">
                                            {(role === "ADMIN" || role === "CONSULTANT") && (
                                                <Link href={`/appointments/${appointment.id}/edit`}
                                                      className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg border bg-card px-3 text-sm font-medium transition-colors hover:bg-accent/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                                    <Pencil className="size-3.5"/>
                                                    Düzenle
                                                </Link>

                                            )}
                                            {canCancel(appointment.status) && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 flex-1 text-destructive hover:text-destructive"
                                                    onClick={() => setCancelling(appointment)}
                                                >
                                                    <X className="size-3.5"/>
                                                    İptal Et
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <AlertDialog
                open={Boolean(cancelling)}
                onOpenChange={(open) => {
                    if (!open) setCancelling(null);
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Randevuyu iptal et</AlertDialogTitle>
                        <AlertDialogDescription>
                            {cancelling
                                ? `${formatDateLabel(cancelling.startAt)} ${formatTimeLabel(cancelling.startAt)} tarihli randevu iptal edilecek. Bu işlem geri alınamaz.`
                                : "Randevu iptal edilecek."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="h-10">Vazgeç</AlertDialogCancel>
                        <AlertDialogAction
                            variant="destructive"
                            className="h-10"
                            onClick={handleCancel}
                            disabled={cancelMutation.isPending}
                        >
                            {cancelMutation.isPending && (
                                <LoaderCircle className="size-4 animate-spin"/>
                            )}
                            {cancelMutation.isPending ? "İptal ediliyor..." : "İptal Et"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
