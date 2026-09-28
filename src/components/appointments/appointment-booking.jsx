"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, CircleAlert, LoaderCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ApiError } from "@/lib/api";
import { toast } from "@/components/ui/toast";
import { ROLES, useAuthStore } from "@/lib/auth";
import { useAuth } from "@/lib/auth-hooks";
import { useConsultantsQuery } from "@/lib/consultants";
import { useCustomersQuery } from "@/lib/customers";
import { useConsultantServiceOptionsQuery } from "@/lib/consultant-services";
import {
  CONFLICT_MESSAGE,
  getErrorMessage,
  isConflictError,
  todayIso,
  useAppointmentsQuery,
  useAvailabilityQuery,
  useCreateAppointment,
  useOpenAvailabilityQuery,
} from "@/lib/appointments";
import {
  packageIsUsable,
  remainingQuantityForService,
  useMyServicePackagesQuery,
} from "@/lib/service-packages";

const selectClassName =
  "h-10 w-full rounded-lg border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-input/30";

const FIELD_ERROR_KEYS = [
  "customer_id",
  "consultant_id",
  "consultant_service_id",
  "customer_service_package_id",
  "start_at",
  "end_at",
  "notes",
];

function fieldErrorsFromApiError(error) {
  if (!(error instanceof ApiError) || !error.errors) return {};
  const fieldErrors = {};
  for (const [field, messages] of Object.entries(error.errors)) {
    if (!FIELD_ERROR_KEYS.includes(field)) continue;
    fieldErrors[field] = Array.isArray(messages) ? messages[0] : messages;
  }
  return fieldErrors;
}

export function AppointmentBooking({ redirectTo = null }) {
  const router = useRouter();
  const { user } = useAuth();
  const endSession = useAuthStore((state) => state.endSession);
  const role = user?.role;

  const isCustomer = role === ROLES.CUSTOMER;
  const isConsultant = role === ROLES.CONSULTANT;
  const isAdmin = role === ROLES.ADMIN;

  const [customerId, setCustomerId] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [consultantId, setConsultantId] = useState("");
  const [consultantServiceId, setConsultantServiceId] = useState("");
  const [customerServicePackageId, setCustomerServicePackageId] = useState(null);
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState({});

  const create = useCreateAppointment();

  const consultantsQuery = useConsultantsQuery(
    {},
    { enabled: isCustomer || isAdmin }
  );
  const appointmentsQuery = useAppointmentsQuery({}, { enabled: isConsultant });
  const adminServiceOptionsQuery = useConsultantServiceOptionsQuery(
    isAdmin && consultantId ? consultantId : null
  );
  const myPackagesQuery = useMyServicePackagesQuery({ enabled: isCustomer });

  const selectedConsultant = (consultantsQuery.data ?? []).find(
    (item) =>
      String(item.slug) === String(consultantId) ||
      String(item.id) === String(consultantId)
  ) ?? null;

  const resolvedConsultantId = isConsultant
    ? user?.consultant_id
    : selectedConsultant
      ? Number(selectedConsultant.id)
      : null;

  const resolvedConsultantKey = isConsultant
    ? user?.consultant_id
    : consultantId || null;

  const serviceOptionsQuery = useConsultantServiceOptionsQuery(
    isCustomer && consultantId ? consultantId : null
  );
  const consultantServiceOptionsQuery = useConsultantServiceOptionsQuery(
    isConsultant && user?.consultant_id ? user.consultant_id : null
  );

  const consultantOptions = useMemo(
    () =>
      (consultantsQuery.data ?? []).map((item) => ({
        id: item.id,
        slug: item.slug ?? "",
        name: item.name,
        title: item.title ?? "",
      })),
    [consultantsQuery.data]
  );

  const customerOptions = useMemo(() => {
    if (!isConsultant) return [];
    const seen = new Map();
    for (const appointment of appointmentsQuery.data ?? []) {
      if (appointment.customerId != null && !seen.has(appointment.customerId)) {
        seen.set(appointment.customerId, {
          id: appointment.customerId,
          name: appointment.customerName,
        });
      }
    }
    return [...seen.values()];
  }, [isConsultant, appointmentsQuery.data]);

  const serviceOptions = useMemo(() => {
    const source = isAdmin
      ? adminServiceOptionsQuery.data
      : isConsultant
        ? consultantServiceOptionsQuery.data
        : serviceOptionsQuery.data;
    return (source ?? []).map((item) => ({
      id: item.id,
      serviceId: item.service_id,
      name: item.name,
      duration: item.duration,
      break_duration: item.break_duration ?? 0,
      price: item.price,
    }));
  }, [
    isAdmin,
    isConsultant,
    adminServiceOptionsQuery.data,
    consultantServiceOptionsQuery.data,
    serviceOptionsQuery.data,
  ]);

  const servicesLoading = isAdmin
    ? adminServiceOptionsQuery.isFetching
    : isConsultant
      ? consultantServiceOptionsQuery.isFetching
      : serviceOptionsQuery.isFetching;

  const selectedService =
    serviceOptions.find((item) => String(item.id) === String(consultantServiceId)) ??
    null;

  const usablePackages = useMemo(() => {
    if (!isCustomer || !selectedService?.serviceId) return [];
    return (myPackagesQuery.data ?? []).filter(
      (purchase) =>
        packageIsUsable(purchase) &&
        remainingQuantityForService(purchase, selectedService.serviceId) > 0
    );
  }, [isCustomer, selectedService, myPackagesQuery.data]);

  const selectedPackage = customerServicePackageId
    ? (usablePackages.find(
        (purchase) => purchase.id === customerServicePackageId
      ) ?? null)
    : null;

  const isPanelBooking = isAdmin || isConsultant;

  const openAvailabilityQuery = useOpenAvailabilityQuery(
    {
      consultantId: resolvedConsultantKey,
      serviceId: selectedService?.serviceId ?? null,
      date: date || null,
    },
    { enabled: isPanelBooking }
  );
  const scheduleAvailabilityQuery = useAvailabilityQuery(
    {
      consultantId: resolvedConsultantKey,
      serviceId: selectedService?.serviceId ?? null,
      date: date || null,
    },
    { enabled: isCustomer }
  );
  const availabilityQuery = isPanelBooking
    ? openAvailabilityQuery
    : scheduleAvailabilityQuery;
  const slots = availabilityQuery.data ?? [];

  useEffect(() => {
    const error =
      appointmentsQuery.error ??
      availabilityQuery.error ??
      myPackagesQuery.error;
    if (error instanceof ApiError && error.status === 401) endSession();
  }, [
    appointmentsQuery.error,
    availabilityQuery.error,
    myPackagesQuery.error,
    endSession,
  ]);

  const stepLabels = useMemo(() => {
    if (isAdmin) {
      return { customer: 1, consultant: 2, service: 3, date: 4, slot: 5 };
    }
    if (isConsultant) {
      return { customer: 1, service: 2, date: 3, slot: 4 };
    }
    return { consultant: 1, service: 2, date: 3, slot: 4 };
  }, [isAdmin, isConsultant]);

  const resetFrom = (fields) => {
    setErrors({});
    if (fields.service) setConsultantServiceId("");
    if (fields.date) setDate("");
    if (fields.slot) setSelectedSlot(null);
  };

  const handleCustomerChange = (event) => {
    setCustomerId(event.target.value);
    setErrors({});
  };

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    setCustomerId(customer ? String(customer.id) : "");
    setErrors({});
  };

  const handleConsultantChange = (event) => {
    setConsultantId(event.target.value);
    setCustomerServicePackageId(null);
    resetFrom({ service: true, date: true, slot: true });
  };

  const handleServiceChange = (event) => {
    setConsultantServiceId(event.target.value);
    setCustomerServicePackageId(null);
    setErrors({});
    resetFrom({ date: true, slot: true });
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
    resetFrom({ slot: true });
  };

  const validate = () => {
    const fieldErrors = {};
    if (isAdmin && !selectedCustomer) {
      fieldErrors.customer_id = "Müşteri seçin";
    }
    if (isConsultant && !customerId) {
      fieldErrors.customer_id = "Müşteri seçin";
    }
    if ((isCustomer || isAdmin) && !consultantId) {
      fieldErrors.consultant_id = "Danışman seçin";
    }
    if (isConsultant && !user?.consultant_id) {
      fieldErrors.consultant_id = "Danışman profiliniz bulunamadı";
    }
    if (!consultantServiceId) {
      fieldErrors.consultant_service_id = "Hizmet seçin";
    }
    if (!date) {
      fieldErrors.date = "Tarih seçin";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      fieldErrors.date = "Geçerli bir tarih seçin";
    } else if (date < todayIso()) {
      fieldErrors.date = "Geçmiş tarih seçilemez";
    }
    if (!selectedSlot) {
      fieldErrors.start_at = "Müsait bir saat seçin";
    } else if (!isPanelBooking && !selectedSlot.end) {
      fieldErrors.start_at = "Seçilen slot bilgisi eksik, lütfen yeniden deneyin";
    }
    setErrors(fieldErrors);
    return Object.keys(fieldErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!validate()) return;

    const resolvedCustomerId = isCustomer ? user?.id : Number(customerId);
    if (!resolvedConsultantId) {
      setErrors((current) => ({
        ...current,
        consultant_id: "Danışman seçin",
      }));
      return;
    }

    create.mutate(
      {
        customer_id: Number(resolvedCustomerId),
        consultant_id: Number(resolvedConsultantId),
        consultant_service_id: Number(consultantServiceId),
        start_at: `${date} ${selectedSlot.start}:00`,
        end_at: selectedSlot.end
          ? `${date} ${selectedSlot.end}:00`
          : `${date} ${selectedSlot.start}:00`,
        notes: notes.trim() ? notes.trim() : null,
        ...(isCustomer && selectedPackage
          ? { customer_service_package_id: Number(selectedPackage.id) }
          : {}),
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Randevu oluşturuldu",
            description: selectedPackage
              ? `Randevu için "${selectedPackage.package?.name ?? "paketiniz"}" kullanıldı.`
              : undefined,
            type: "success",
          });
          setCustomerServicePackageId(null);
          if (redirectTo) {
            router.push(redirectTo);
          }
 //       router.push("/appointments");
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 401) {
            endSession();
            return;
          }
          if (isConflictError(error)) {
            setErrors((current) => ({
              ...fieldErrorsFromApiError(error),
              start_at: CONFLICT_MESSAGE,
            }));
            setSelectedSlot(null);
            availabilityQuery.refetch();
            toast.add({
              title: "Randevu oluşturulamadı",
              description: CONFLICT_MESSAGE,
              type: "error",
            });
            return;
          }
          const fieldErrors = fieldErrorsFromApiError(error);
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          }
          toast.add({
            title: "Randevu oluşturulamadı",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  if (isConsultant && !user?.consultant_id) {
    return (
      <div className="w-full flex-1 px-4 py-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <CircleAlert className="size-6 text-destructive" />
            <p className="text-sm font-medium">Danışman profiliniz bulunamadı</p>
            <p className="text-sm text-muted-foreground">
              Randevu oluşturabilmek için hesabınızın bir danışman profiliyle
              ilişkilendirilmesi gerekir.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full flex-1 px-4 py-6">
      <div className="mb-4">
        <h1 className="text-xl font-semibold tracking-tight">
          {isCustomer ? "Randevu Al" : "Randevu Ekle"}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {isCustomer
            ? "Danışman, hizmet, tarih ve saat seçerek randevunuzu oluşturun"
            : "Müşteri, hizmet, tarih ve saat seçerek randevu oluşturun"}
        </p>
      </div>

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {(isAdmin || isConsultant) && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="customer_id">{stepLabels.customer}. Müşteri</Label>
                {isAdmin ? (
                  <CustomerSearchSelect
                    error={errors.customer_id}
                    onSelect={handleCustomerSelect}
                    selected={selectedCustomer}
                  />
                ) : appointmentsQuery.isFetching ? (
                  <LoadingSelect />
                ) : (
                  <select
                    id="customer_id"
                    className={selectClassName}
                    value={customerId}
                    onChange={handleCustomerChange}
                  >
                    <option value="">Müşteri seçin</option>
                    {customerOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                )}
                {isConsultant &&
                  !appointmentsQuery.isFetching &&
                  customerOptions.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      Randevu listenizde müşteri bulunmuyor. Yeni müşteriler
                      kendi hesaplarından randevu alabilir.
                    </p>
                  )}
                {errors.customer_id && (
                  <p className="text-xs text-destructive">{errors.customer_id}</p>
                )}
              </div>
            )}

            {(isCustomer || isAdmin) && (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="consultant_id">
                  {stepLabels.consultant}. Danışman
                </Label>
                {consultantsQuery.isFetching ? (
                  <LoadingSelect />
                ) : (
                  <select
                    id="consultant_id"
                    className={selectClassName}
                    value={consultantId}
                    onChange={handleConsultantChange}
                  >
                    <option value="">Danışman seçin</option>
                    {consultantOptions.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {option.name}
                        {option.title ? ` · ${option.title}` : ""}
                      </option>
                    ))}
                  </select>
                )}
                {errors.consultant_id && (
                  <p className="text-xs text-destructive">
                    {errors.consultant_id}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="consultant_service_id">
                {stepLabels.service}. Hizmet
              </Label>
              {servicesLoading ? (
                <LoadingSelect />
              ) : (
                <select
                  id="consultant_service_id"
                  className={selectClassName}
                  disabled={isCustomer || isAdmin ? !consultantId : false}
                  value={consultantServiceId}
                  onChange={handleServiceChange}
                >
                  <option value="">
                    {isCustomer || isAdmin
                      ? consultantId
                        ? "Hizmet seçin"
                        : "Önce danışman seçin"
                      : "Hizmet seçin"}
                  </option>
                  {serviceOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                      {option.duration ? ` · ${option.duration} dk` : ""}
                      {option.price ? ` · ${option.price}` : ""}
                    </option>
                  ))}
                </select>
              )}
              {(isCustomer || isAdmin) &&
                consultantId &&
                !servicesLoading &&
                serviceOptions.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Seçilen danışman için tanımlı hizmet bulunamadı
                  </p>
                )}
              {errors.consultant_service_id && (
                <p className="text-xs text-destructive">
                  {errors.consultant_service_id}
                </p>
              )}
            </div>

            {isCustomer && selectedService && usablePackages.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3">
                <div className="flex items-center gap-2">
                  <BadgeCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <p className="text-sm font-medium">Paketiniz var</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  {selectedService.name} için kullanılabilir paketiniz bulunuyor.
                </p>
                {usablePackages.map((purchase) => {
                  const isSelected = selectedPackage?.id === purchase.id;
                  return (
                    <div
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5",
                        isSelected &&
                          "border-emerald-500 ring-1 ring-emerald-500/40"
                      )}
                      key={purchase.id}
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {purchase.package?.name ?? `Paket #${purchase.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Kalan:{" "}
                          {remainingQuantityForService(
                            purchase,
                            selectedService.serviceId
                          )}
                        </p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className="h-9 shrink-0"
                        onClick={() =>
                          setCustomerServicePackageId(
                            isSelected ? null : purchase.id
                          )
                        }
                      >
                        {isSelected ? "Paket seçildi" : "Paketten Kullan"}
                      </Button>
                    </div>
                  );
                })}
                {selectedPackage ? (
                  <button
                    type="button"
                    className="self-start text-xs text-muted-foreground underline-offset-4 hover:underline"
                    onClick={() => setCustomerServicePackageId(null)}
                  >
                    Paket kullanma, normal randevu olarak oluştur
                  </button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Paket kullanmayı seçmezseniz randevu normal oluşturulur.
                  </p>
                )}
                {errors.customer_service_package_id && (
                  <p className="text-xs text-destructive">
                    {errors.customer_service_package_id}
                  </p>
                )}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">{stepLabels.date}. Tarih</Label>
              <Input
                id="date"
                type="date"
                min={todayIso()}
                disabled={!consultantServiceId}
                value={date}
                onChange={handleDateChange}
              />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label>{stepLabels.slot}. Müsait Saat</Label>
              {!date ? (
                <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
                  Müsait saatleri görmek için tarih seçin
                </p>
              ) : availabilityQuery.isFetching ? (
                <div className="flex justify-center rounded-lg border border-dashed py-6">
                  <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
                </div>
              ) : availabilityQuery.isError ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-4 text-center">
                  <CircleAlert className="size-5 text-destructive" />
                  <p className="text-xs text-muted-foreground">
                    {getErrorMessage(availabilityQuery.error)}
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => availabilityQuery.refetch()}
                  >
                    Tekrar Dene
                  </Button>
                </div>
              ) : slots.length === 0 ? (
                <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
                  Bu tarihte müsait saat yok
                </p>
              ) : (
                <div
                  className={cn(
                    "grid grid-cols-2 gap-2 sm:grid-cols-3",
                    isPanelBooking && "max-h-80 overflow-y-auto"
                  )}
                >
                  {slots.map((slot) => (
                    <button
                      key={slot.start}
                      type="button"
                      aria-pressed={selectedSlot?.start === slot.start}
                      onClick={() => {
                        setSelectedSlot(slot);
                        setErrors((current) => ({
                          ...current,
                          start_at: undefined,
                          end_at: undefined,
                        }));
                      }}
                      className={cn(
                        "h-10 rounded-lg border text-sm font-medium transition-colors",
                        selectedSlot?.start === slot.start
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-input text-foreground hover:bg-muted"
                      )}
                    >
                      {slot.label}
                    </button>
                  ))}
                </div>
              )}
              {(errors.start_at || errors.end_at) && (
                <p className="text-xs text-destructive">
                  {errors.start_at ?? errors.end_at}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="notes">Not (opsiyonel)</Label>
              <Textarea
                id="notes"
                rows={3}
                placeholder="Randevu ile ilgili paylaşmak istediğiniz notlar"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
              />
              {errors.notes && (
                <p className="text-xs text-destructive">{errors.notes}</p>
              )}
            </div>

            <Button
              type="submit"
              className="h-11 w-full"
              disabled={create.isPending}
            >
              {create.isPending && <LoaderCircle className="size-4 animate-spin" />}
              {create.isPending ? "Oluşturuluyor..." : "Randevuyu Oluştur"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingSelect() {
  return (
    <div className="flex h-10 items-center gap-2 rounded-lg border border-input px-3 text-sm text-muted-foreground">
      <LoaderCircle className="size-4 animate-spin" />
      Yükleniyor...
    </div>
  );
}

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

const CUSTOMER_PAGE_SIZE = 20;

function CustomerSearchSelect({ error, onSelect, selected }) {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebouncedValue(searchText.trim());

  const query = useCustomersQuery(
    { search: debouncedSearch || undefined, per_page: CUSTOMER_PAGE_SIZE },
    { enabled: !selected }
  );
  const customers = query.data ?? [];

  if (selected) {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2.5">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{selected.name}</p>
            {selected.phone ? (
              <p className="truncate text-xs text-muted-foreground">
                {selected.phone}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-9 shrink-0"
            onClick={() => onSelect(null)}
          >
            Değiştir
          </Button>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoComplete="off"
          className="pl-9"
          id="customer_id"
          placeholder="Müşteri ara (ad, soyad, telefon)"
          type="text"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
        />
      </div>
      {query.isFetching ? (
        <div className="flex items-center gap-2 rounded-lg border border-dashed px-3 py-3 text-sm text-muted-foreground">
          <LoaderCircle className="size-4 animate-spin" />
          Yükleniyor...
        </div>
      ) : query.isError ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-4 text-center">
          <CircleAlert className="size-5 text-destructive" />
          <p className="text-xs text-muted-foreground">
            {getErrorMessage(query.error)}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => query.refetch()}
          >
            Tekrar Dene
          </Button>
        </div>
      ) : customers.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
          {debouncedSearch ? "Müşteri bulunamadı" : "Henüz müşteri yok"}
        </p>
      ) : (
        <div className="flex max-h-56 flex-col gap-1 overflow-y-auto rounded-lg border p-1">
          {customers.map((customer) => (
            <button
              key={customer.id}
              type="button"
              onClick={() =>
                onSelect({
                  id: customer.id,
                  name: customer.name,
                  phone: customer.phone ?? "",
                })
              }
              className="flex flex-col rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="truncate text-sm font-medium">
                {customer.name}
              </span>
              {customer.phone ? (
                <span className="truncate text-xs text-muted-foreground">
                  {customer.phone}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
