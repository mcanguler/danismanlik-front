"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CalendarRange,
  CircleAlert,
  CircleCheck,
  ClipboardList,
  CloudSun,
  CreditCard,
  Info,
  LoaderCircle,
  Lock,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  User,
  Users,
  Video,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { api, ApiError } from "@/lib/api";
import { ROLES } from "@/lib/auth";
import { useAuth, useLogin, useRegister } from "@/lib/auth-hooks";
import { PhoneInput, normalizePhoneToE164 } from "@/components/phone-input";
import {
  CONFLICT_MESSAGE,
  getErrorMessage,
  isConflictError,
  todayIso,
  useAvailabilityQuery,
  useCreateAppointment,
} from "@/lib/appointments";
import {
  packageIsUsable,
  remainingQuantityForService,
  useMyServicePackagesQuery,
} from "@/lib/service-packages";
import { useCreateOrder } from "@/lib/orders";
import {
  formatDateTrLong,
  formatPrice,
  TR_MONTHS,
  TR_WEEKDAYS_SHORT,
} from "@/lib/format";
import { cn } from "@/lib/utils";

const BOOKING_MUTATION_FIELDS = [
  "customer_id",
  "consultant_id",
  "consultant_service_id",
  "customer_service_package_id",
  "start_at",
  "end_at",
  "notes",
];

function groupSlots(slots) {
  const groups = [
    { id: "morning", label: "Sabah", icon: Sun, slots: [] },
    { id: "afternoon", label: "Öğleden Sonra", icon: CloudSun, slots: [] },
    { id: "evening", label: "Akşam", icon: Moon, slots: [] },
  ];
  for (const slot of slots) {
    if (slot.start < "12:00") groups[0].slots.push(slot);
    else if (slot.start < "18:00") groups[1].slots.push(slot);
    else groups[2].slots.push(slot);
  }
  return groups.filter((group) => group.slots.length > 0);
}

function SlotPicker({ availabilityQuery, slots, selectedSlot, onSelectSlot }) {
  const groups = useMemo(() => groupSlots(slots), [slots]);

  if (availabilityQuery.isFetching) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10">
        <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Müsait saatler yükleniyor...
        </p>
      </div>
    );
  }

  if (availabilityQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-6 text-center">
        <Info className="size-5 text-destructive" />
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          {getErrorMessage(availabilityQuery.error)}
        </p>
        <button
          className="px-5 py-2 rounded-full bg-primary-container text-on-primary font-label-md text-label-md"
          onClick={() => availabilityQuery.refetch()}
          type="button"
        >
          Tekrar Dene
        </button>
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed px-3 py-8 text-center font-body-sm text-body-sm text-on-surface-variant">
        Bu tarihte müsait saat yok
      </div>
    );
  }

  return (
    <div className="space-y-6 max-h-[380px] overflow-y-auto pr-2">
      {groups.map((group) => (
        <div className="space-y-3" key={group.id}>
          <div className="flex items-center gap-2 font-label-lg text-label-lg text-primary font-medium">
            <group.icon className="size-4 text-accent-gold" />
            <span>{group.label}</span>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {group.slots.map((slot) => (
              <button
                className={cn(
                  "px-3.5 py-3 rounded-xl font-label-md text-label-md transition-all text-center",
                  selectedSlot?.start === slot.start
                    ? "bg-primary-container text-on-primary font-semibold shadow-sm"
                    : "bg-surface-container-low text-on-surface hover:bg-blush-hover"
                )}
                key={slot.start}
                onClick={() => onSelectSlot(slot)}
                type="button"
              >
                {slot.label}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function MonthCalendar({ selectedDate, onSelectDate }) {
  const now = new Date();
  const [month, setMonth] = useState({
    year: now.getFullYear(),
    monthIndex: now.getMonth(),
  });

  const goMonth = (delta) => {
    setMonth((current) => {
      const next = new Date(current.year, current.monthIndex + delta, 1);
      return { year: next.getFullYear(), monthIndex: next.getMonth() };
    });
  };

  const { year, monthIndex } = month;
  const todayIsoStr = todayIso();
  const offset = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();

  const cells = [];
  for (let i = offset; i > 0; i -= 1) {
    cells.push({ key: `prev-${i}`, label: prevMonthDays - i + 1, muted: true });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const iso = `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ key: iso, label: day, iso, disabled: iso < todayIsoStr });
  }
  let nextDay = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ key: `next-${nextDay}`, label: nextDay, muted: true });
    nextDay += 1;
  }

  const canGoPrev =
    year > now.getFullYear() ||
    (year === now.getFullYear() && monthIndex > now.getMonth());

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between py-2 mb-4">
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none"
          disabled={!canGoPrev}
          onClick={() => goMonth(-1)}
          type="button"
          aria-label="Önceki ay"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="font-title-md text-title-md text-primary font-semibold tracking-tight">
          {TR_MONTHS[monthIndex]} {year}
        </div>
        <button
          className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors"
          onClick={() => goMonth(1)}
          type="button"
          aria-label="Sonraki ay"
        >
          <ArrowRight className="size-5" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center py-2 text-on-surface-variant font-label-md text-label-md font-semibold">
        {TR_WEEKDAYS_SHORT.map((weekday) => (
          <span key={weekday}>{weekday}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center text-body-sm font-body-sm mt-1">
        {cells.map((cell) =>
          cell.muted ? (
            <span
              className="h-11 rounded-lg text-outline flex items-center justify-center"
              key={cell.key}
            >
              {cell.label}
            </span>
          ) : (
            <button
              className={cn(
                "h-11 rounded-lg flex items-center justify-center transition-colors",
                cell.disabled
                  ? "text-outline cursor-not-allowed bg-surface-container-low/40"
                  : cell.iso === selectedDate
                    ? "bg-primary-container text-on-primary font-bold shadow-md"
                    : "text-on-surface hover:bg-blush-surface"
              )}
              disabled={cell.disabled}
              key={cell.key}
              onClick={() => onSelectDate(cell.iso)}
              type="button"
            >
              {cell.label}
            </button>
          )
        )}
      </div>
      <div className="mt-6 p-3 rounded-xl bg-blush-surface/60 flex items-center justify-between text-body-sm font-body-sm">
        <span className="text-on-surface-variant">Seçilen Tarih:</span>
        <span className="font-semibold text-primary">
          {selectedDate ? formatDateTrLong(selectedDate) : "—"}
        </span>
      </div>
    </div>
  );
}

export function ServiceBookingWizard({ service, offerings, offeringsPending }) {
  const { status, user } = useAuth();
  const router = useRouter();
  const create = useCreateAppointment();

  const isGuest = status === "unauthenticated";
  const isCustomer = status === "authenticated" && user?.role === ROLES.CUSTOMER;
  const isStaff = status === "authenticated" && !isCustomer;
  const authResolved = status !== "loading";

  const [step, setStep] = useState(0);
  const [selectedConsultantId, setSelectedConsultantId] = useState(null);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState(null);
  const [slotError, setSlotError] = useState(null);
  const [guest, setGuest] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });
  const [guestErrors, setGuestErrors] = useState({});
  const [phoneCheck, setPhoneCheck] = useState({ status: "idle" });
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState(null);
  const [notes, setNotes] = useState("");
  const [customerServicePackageId, setCustomerServicePackageId] = useState(null);
  const [createdAppointment, setCreatedAppointment] = useState(null);
  const [success, setSuccess] = useState(false);

  const login = useLogin();
  const register = useRegister();
  const phoneCheckIdRef = useRef(0);

  const serviceId = service?.id ?? null;
  const myPackagesQuery = useMyServicePackagesQuery({ enabled: isCustomer });
  const createOrder = useCreateOrder();

  const phoneE164 = normalizePhoneToE164(guest.phone);
  const phoneValid = /^\+\d{10,15}$/.test(phoneE164);

  useEffect(() => {
    if (!phoneValid) return undefined;
    const checkId = (phoneCheckIdRef.current += 1);
    const timer = setTimeout(async () => {
      setPhoneCheck({ status: "checking" });
      try {
        const data = await api.phoneExists(phoneE164);
        if (checkId !== phoneCheckIdRef.current) return;
        setPhoneCheck({ status: data?.exists ? "exists" : "free" });
      } catch {
        if (checkId !== phoneCheckIdRef.current) return;
        setPhoneCheck({ status: "error" });
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [phoneE164, phoneValid]);

  const usablePackages = useMemo(() => {
    if (!isCustomer || !serviceId) return [];
    return (myPackagesQuery.data ?? []).filter(
      (purchase) =>
        packageIsUsable(purchase) &&
        remainingQuantityForService(purchase, serviceId) > 0
    );
  }, [isCustomer, serviceId, myPackagesQuery.data]);

  const selectedPackage = customerServicePackageId
    ? (usablePackages.find(
        (purchase) => purchase.id === customerServicePackageId
      ) ?? null)
    : null;

  const selectedOffering =
    offerings.find(
      (item) => String(item.consultant.id) === String(selectedConsultantId)
    ) ?? (offerings.length === 1 ? offerings[0] : null);

  const availabilityQuery = useAvailabilityQuery({
    consultantId: selectedOffering?.consultant.id ?? null,
    serviceId: service?.id ?? null,
    date: date || null,
  });
  const slots = availabilityQuery.data ?? [];

  const steps = useMemo(() => {
    const list = [];
    if (offerings.length > 1) {
      list.push({ id: "consultant", label: "Danışman", icon: Users });
    }
    list.push({ id: "datetime", label: "Tarih ve Saat", icon: CalendarDays });
    if (isGuest) {
      list.push({ id: "details", label: "Kişisel Bilgiler", icon: ClipboardList });
    }
    list.push({ id: "summary", label: "Özet ve Onay", icon: CircleCheck });
    return list;
  }, [offerings.length, isGuest]);

  const stepIndex = (id) => steps.findIndex((item) => item.id === id);
  const datetimeStep = stepIndex("datetime");

  const handleSelectDate = (iso) => {
    setDate(iso);
    setSlot(null);
    setSlotError(null);
    setCreatedAppointment(null);
  };

  const handleSelectConsultant = (id) => {
    setSelectedConsultantId(id);
    setSlot(null);
    setSlotError(null);
    setCreatedAppointment(null);
  };

  const handleDatetimeContinue = () => {
    if (!date) {
      setSlotError("Lütfen önce bir tarih seçin");
      return;
    }
    if (!slot) {
      setSlotError("Müsait bir saat seçin");
      return;
    }
    setSlotError(null);
    setStep(datetimeStep + 1);
  };

  const validateGuestDetails = () => {
    const errors = {};
    if (guest.name.trim().length < 3) {
      errors.name = "Adınızı ve soyadınızı girin";
    }
    if (!phoneValid) {
      errors.phone = "Geçerli bir telefon numarası girin";
    }
    if (!/^\S+@\S+\.\S+$/.test(guest.email.trim())) {
      errors.email = "Geçerli bir e-posta adresi girin";
    }
    if (phoneCheck.status === "free") {
      if (guest.password.length < 8) {
        errors.password = "Şifre en az 8 karakter olmalıdır";
      }
      if (guest.passwordConfirmation !== guest.password) {
        errors.passwordConfirmation = "Şifreler eşleşmiyor";
      }
    }
    setGuestErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGuestDetailsContinue = () => {
    if (!validateGuestDetails()) return;
    if (phoneCheck.status === "exists") {
      setLoginPassword("");
      setLoginError(null);
      setLoginOpen(true);
      return;
    }
    if (phoneCheck.status === "free") {
      handleGuestRegister();
      return;
    }
    setStep(step + 1);
  };

  const handleGuestRegister = () => {
    const [firstName, ...restName] = guest.name.trim().split(/\s+/);
    register.mutate(
      {
        first_name: firstName,
        last_name: restName.join(" ") || firstName,
        phone: phoneE164,
        email: guest.email.trim(),
        password: guest.password,
        password_confirmation: guest.passwordConfirmation,
      },
      {
        onSuccess: () => {
          toast.add({
            title: "Hesabınız oluşturuldu",
            description: "Randevunuza devam edebilirsiniz.",
            type: "success",
          });
          setGuest((current) => ({
            ...current,
            password: "",
            passwordConfirmation: "",
          }));
        },
        onError: (error) => {
          const errors = {};
          if (error instanceof ApiError && error.errors) {
            for (const [field, messages] of Object.entries(error.errors)) {
              const message = Array.isArray(messages) ? messages[0] : messages;
              if (field === "phone") errors.phone = message;
              else if (field === "email") errors.email = message;
              else if (field === "first_name" || field === "last_name") {
                errors.name = errors.name ?? message;
              } else if (field === "password") {
                errors.password = message;
              } else if (field === "password_confirmation") {
                errors.passwordConfirmation = message;
              }
            }
          }
          if (Object.keys(errors).length > 0) {
            setGuestErrors((current) => ({ ...current, ...errors }));
          }
          toast.add({
            title: "Kayıt tamamlanamadı",
            description: getErrorMessage(error),
            type: "error",
          });
        },
      }
    );
  };

  const handleQuickLogin = (event) => {
    event.preventDefault();
    if (!loginPassword) {
      setLoginError("Şifrenizi girin");
      return;
    }
    setLoginError(null);
    login.mutate(
      { phone: phoneE164, password: loginPassword },
      {
        onSuccess: () => {
          setLoginOpen(false);
          setLoginPassword("");
          setGuest((current) => ({
            ...current,
            password: "",
            passwordConfirmation: "",
          }));
          toast.add({
            title: "Giriş yapıldı",
            description: "Randevunuza kaldığınız yerden devam edebilirsiniz.",
            type: "success",
          });
        },
        onError: (error) => {
          setLoginError(getErrorMessage(error));
        },
      }
    );
  };

  const startAppointmentPayment = (appointmentId) => {
    createOrder.mutate(
      {
        items: [{ item_type: "APPOINTMENT", item_id: appointmentId }],
      },
      {
        onSuccess: (order) => {
          router.push(`/odeme/${order.id}`);
        },
        onError: (error) => {
          toast.add({
            title: "Ödeme başlatılamadı",
            description:
              error?.message ??
              "Sipariş oluşturulurken bir sorun oluştu, tekrar deneyin.",
            type: "error",
          });
        },
      }
    );
  };

  const handleBooking = () => {
    if (!selectedOffering) return;
    if (isGuest) {
      router.push("/login");
      return;
    }
    if (!isCustomer) return;

    if (createdAppointment && !selectedPackage) {
      startAppointmentPayment(createdAppointment.id);
      return;
    }

    create.mutate(
      {
        customer_id: user?.id,
        consultant_id: selectedOffering.consultant.id,
        consultant_service_id: selectedOffering.offering.id,
        start_at: `${date} ${slot.start}:00`,
        end_at: slot.end ? `${date} ${slot.end}:00` : `${date} ${slot.start}:00`,
        notes: notes.trim() ? notes.trim() : null,
        ...(selectedPackage
          ? { customer_service_package_id: selectedPackage.id }
          : {}),
      },
      {
        onSuccess: (appointment) => {
          if (selectedPackage) {
            toast.add({
              title: "Randevunuz oluşturuldu",
              description: `Seans için "${selectedPackage.package?.name ?? "paketiniz"}" kullanıldı.`,
              type: "success",
            });
            setCustomerServicePackageId(null);
            setSuccess(true);
            return;
          }
          toast.add({
            title: "Randevunuz oluşturuldu",
            description:
              "Ödemenin ardından randevunuz onaylanacak; ödeme ekranına yönlendiriliyorsunuz.",
            type: "info",
          });
          setCreatedAppointment(appointment ?? null);
          startAppointmentPayment(appointment.id);
        },
        onError: (error) => {
          if (error instanceof ApiError && error.status === 401) {
            toast.add({
              title: "Oturumunuz sona erdi, lütfen tekrar giriş yapın.",
              type: "error",
            });
            router.push("/login");
            return;
          }
          const fieldErrors = {};
          if (error instanceof ApiError && error.errors) {
            for (const [field, messages] of Object.entries(error.errors)) {
              if (BOOKING_MUTATION_FIELDS.includes(field)) {
                fieldErrors[field] = Array.isArray(messages)
                  ? messages[0]
                  : messages;
              }
            }
          }
          if (fieldErrors.customer_service_package_id) {
            setCustomerServicePackageId(null);
            setStep(datetimeStep);
            toast.add({
              title: "Randevu oluşturulamadı",
              description: fieldErrors.customer_service_package_id,
              type: "error",
            });
            return;
          }
          if (isConflictError(error) || fieldErrors.start_at || fieldErrors.end_at) {
            setSlot(null);
            setSlotError(
              isConflictError(error)
                ? CONFLICT_MESSAGE
                : (fieldErrors.start_at ?? fieldErrors.end_at)
            );
            setStep(datetimeStep);
            availabilityQuery.refetch();
            toast.add({
              title: "Randevu oluşturulamadı",
              description: isConflictError(error)
                ? CONFLICT_MESSAGE
                : (fieldErrors.start_at ?? fieldErrors.end_at),
              type: "error",
            });
            return;
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

  if (success) {
    return (
      <div className="bg-canvas-pure rounded-2xl shadow-[0_8px_30px_rgba(92,29,36,0.04)] p-10 flex flex-col items-center text-center gap-4">
        <CircleCheck className="size-14 text-emerald-600" />
        <h2 className="font-headline-md text-headline-md text-primary font-semibold">
          Tebrikler! Randevunuz oluşturuldu
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {service?.name} · {formatDateTrLong(date)} · {slot?.label}
        </p>
        <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
          Randevu detayları SMS ve WhatsApp üzerinden size iletilecek. Seans
          bağlantı linki randevu günü aktif hale gelecektir.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-burgundy-light transition-all"
            href="/appointments"
          >
            Randevularıma Git
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors"
            href="/hizmetler"
          >
            Başka Randevu Al
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {isStaff && (
        <div className="p-4 rounded-xl bg-surface-container-low flex items-start gap-3">
          <Info className="size-5 text-accent-gold flex-shrink-0 mt-0.5" />
          <p className="font-body-sm text-body-sm text-on-secondary-fixed-variant">
            Bu sayfa danışan randevuları içindir. {user?.role} hesabıyla giriş
            yaptınız; randevu oluşturmak için{" "}
            <Link
              className="font-semibold text-primary underline underline-offset-4"
              href="/dashboard/randevu-al"
            >
              paneldeki randevu ekranını
            </Link>{" "}
            kullanabilirsiniz.
          </p>
        </div>
      )}

      <section className="w-full bg-canvas-pure rounded-2xl shadow-[0_4px_20px_rgba(92,29,36,0.04)] p-3 sm:p-4">
        <div
          className={cn(
            "grid gap-2 sm:gap-4 max-w-[840px] mx-auto",
            steps.length === 3
              ? "grid-cols-1 sm:grid-cols-3"
              : "grid-cols-2 sm:grid-cols-4"
          )}
        >
          {steps.map((item, index) => (
            <button
              className={cn(
                "flex items-center justify-center gap-2 sm:gap-3 py-3 px-3 rounded-xl transition-all",
                index === step
                  ? "bg-blush-surface text-primary-container"
                  : index < step
                    ? "text-primary-container hover:bg-surface-container-low"
                    : "text-on-surface-variant/50 cursor-default"
              )}
              disabled={index > step}
              key={item.id}
              onClick={() => index < step && setStep(index)}
              type="button"
            >
              <item.icon className="size-5 shrink-0" />
              <span className="font-label-lg text-label-lg font-semibold tracking-tight">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {!authResolved ? (
        <div className="flex justify-center py-16">
          <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="w-full space-y-8">
          {steps[step]?.id === "consultant" && (
            <div className="bg-canvas-pure rounded-2xl shadow-[0_8px_30px_rgba(92,29,36,0.04)] overflow-hidden">
              <div className="px-6 py-5 bg-surface-container-low/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="size-5 text-primary-container" />
                  <h2 className="font-title-lg text-title-lg text-primary font-semibold">
                    Danışman Seçimi
                  </h2>
                </div>
                <span className="font-body-sm text-body-sm text-secondary">
                  {offerings.length} danışman bu hizmeti sunuyor
                </span>
              </div>
              <div className="p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                {offerings.map((item) => {
                  const selected =
                    selectedOffering?.consultant.id === item.consultant.id;
                  return (
                    <button
                      className={cn(
                        "flex items-center gap-4 p-5 rounded-2xl border text-left transition-all",
                        selected
                          ? "border-primary-container bg-blush-surface shadow-md"
                          : "border-border-delicate bg-canvas-cream hover:bg-blush-surface/40"
                      )}
                      key={item.consultant.id}
                      onClick={() => handleSelectConsultant(item.consultant.id)}
                      type="button"
                    >
                      <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-title-md text-title-md font-semibold overflow-hidden flex-shrink-0">
                        {item.consultant.profileImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            alt={item.consultant.name}
                            className="w-full h-full object-cover"
                            src={item.consultant.profileImage}
                          />
                        ) : (
                          item.consultant.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-title-md text-title-md text-primary font-semibold">
                          {item.consultant.name}
                        </p>
                        {item.consultant.title && (
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            {item.consultant.title}
                          </p>
                        )}
                        {formatPrice(item.offering.price) && (
                          <p className="font-label-md text-label-md text-primary-container font-semibold mt-1">
                            {formatPrice(item.offering.price)}
                            {item.offering.duration
                              ? ` · ${item.offering.duration} dk`
                              : ""}
                          </p>
                        )}
                      </div>
                      {selected && (
                        <CircleCheck className="size-6 text-primary-container shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
              <div className="px-6 lg:px-8 py-5 bg-surface-container-low/50 flex items-center justify-end gap-4">
                <button
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-burgundy-light transition-all disabled:opacity-50 disabled:pointer-events-none"
                  disabled={!selectedOffering}
                  onClick={() => setStep(step + 1)}
                  type="button"
                >
                  <span>Sonraki: Tarih ve Saat</span>
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}

          {steps[step]?.id === "datetime" && (
            <div className="space-y-8">
              <div className="bg-canvas-pure rounded-2xl shadow-[0_8px_30px_rgba(92,29,36,0.04)] overflow-hidden">
                <div className="px-6 py-5 bg-surface-container-low/60 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CalendarRange className="size-5 text-primary-container" />
                    <h2 className="font-title-lg text-title-lg text-primary font-semibold">
                      Tarih ve Saat Seçimi
                    </h2>
                  </div>
                  <span className="font-body-sm text-body-sm text-secondary">
                    Saat Dilimi: İstanbul (GMT+3)
                  </span>
                </div>
                <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                  <div className="lg:col-span-6">
                    <MonthCalendar
                      selectedDate={date}
                      onSelectDate={handleSelectDate}
                    />
                  </div>
                  <div className="lg:col-span-6 flex flex-col">
                    <div className="flex items-center justify-between pb-3">
                      <h3 className="font-title-md text-title-md text-primary font-semibold">
                        Zaman Aralığı
                      </h3>
                      {selectedOffering?.offering.duration && (
                        <span className="font-label-sm text-label-sm text-secondary font-medium">
                          {selectedOffering.offering.duration} Dakikalık
                          Aralıklar
                        </span>
                      )}
                    </div>
                    {!date ? (
                      <div className="rounded-xl border border-dashed px-3 py-8 text-center font-body-sm text-body-sm text-on-surface-variant">
                        Müsait saatleri görmek için sol taraftan bir tarih
                        seçin
                      </div>
                    ) : (
                      <SlotPicker
                        availabilityQuery={availabilityQuery}
                        onSelectSlot={(value) => {
                          setSlot(value);
                          setSlotError(null);
                        }}
                        selectedSlot={slot}
                        slots={slots}
                      />
                    )}
                    {slotError && (
                      <p className="mt-3 text-body-sm font-body-sm text-error">
                        {slotError}
                      </p>
                    )}
                    <div className="mt-6 p-3 rounded-xl bg-blush-surface/60 flex items-center justify-between text-body-sm font-body-sm">
                      <span className="text-on-surface-variant">
                        Seçilen Saat Dilimi:
                      </span>
                      <span className="font-semibold text-primary">
                        {slot?.label ?? "—"}
                      </span>
                    </div>
                    {isCustomer && usablePackages.length > 0 && (
                      <div className="mt-4 flex flex-col gap-2.5 rounded-xl border border-emerald-600/25 bg-emerald-600/5 p-4">
                        <div className="flex items-center gap-2">
                          <BadgeCheck className="size-4 shrink-0 text-emerald-600" />
                          <p className="font-label-md text-label-md text-primary font-semibold">
                            Paketiniz var
                          </p>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          {service?.name} için kullanılabilir paketiniz
                          bulunuyor.
                        </p>
                        {usablePackages.map((purchase) => {
                          const isSelected = selectedPackage?.id === purchase.id;
                          const remaining = remainingQuantityForService(
                            purchase,
                            serviceId
                          );
                          return (
                            <div
                              className={cn(
                                "flex items-center justify-between gap-3 rounded-xl border bg-canvas-pure px-4 py-3",
                                isSelected &&
                                  "border-emerald-600 shadow-sm ring-1 ring-emerald-600/30"
                              )}
                              key={purchase.id}
                            >
                              <div className="min-w-0">
                                <p className="truncate font-label-md text-label-md text-primary font-semibold">
                                  {purchase.package?.name ??
                                    `Paket #${purchase.id}`}
                                </p>
                                <p className="font-body-sm text-body-sm text-on-surface-variant">
                                  Kalan: {remaining}
                                </p>
                              </div>
                              <button
                                className={cn(
                                  "flex-shrink-0 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full font-label-md text-label-md font-semibold transition-all",
                                  isSelected
                                    ? "bg-emerald-600 text-canvas-pure shadow-md"
                                    : "bg-primary-container text-on-primary hover:bg-burgundy-light shadow-sm"
                                )}
                                onClick={() =>
                                  setCustomerServicePackageId(
                                    isSelected ? null : purchase.id
                                  )
                                }
                                type="button"
                              >
                                {isSelected ? "Paket seçildi" : "Paketten Kullan"}
                              </button>
                            </div>
                          );
                        })}
                        {selectedPackage ? (
                          <button
                            className="self-start font-label-sm text-label-sm text-on-surface-variant underline underline-offset-4 hover:text-primary-container transition-colors"
                            onClick={() => setCustomerServicePackageId(null)}
                            type="button"
                          >
                            Paket kullanma, normal randevu olarak oluştur
                          </button>
                        ) : (
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Paket kullanmayı seçmezseniz randevu normal
                            oluşturulur.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 lg:px-8 py-5 bg-surface-container-low/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
                    <ShieldCheck className="size-4 text-accent-gold shrink-0" />
                    <span>
                      Seçilen seans saati 15 dakika boyunca sizin adınıza
                      rezerve edilir.
                    </span>
                  </div>
                  <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-burgundy-light transition-all"
                    onClick={handleDatetimeContinue}
                    type="button"
                  >
                    <span>
                      Sonraki:{" "}
                      {isGuest ? "Kişisel Bilgiler" : "Özet ve Onay"}
                    </span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {steps[step]?.id === "details" && (
            <div className="bg-canvas-pure rounded-2xl shadow-[0_8px_30px_rgba(92,29,36,0.04)] overflow-hidden">
              <div className="px-6 py-5 bg-surface-container-low/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ClipboardList className="size-5 text-primary-container" />
                  <h2 className="font-title-lg text-title-lg text-primary font-semibold">
                    Kişisel Bilgiler ve Seans Notu
                  </h2>
                </div>
                <span className="font-body-sm font-body-sm text-secondary">
                  * Zorunlu Alanlar
                </span>
              </div>
              <form
                className="p-6 lg:p-10 space-y-6"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleGuestDetailsContinue();
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label
                      className="block font-label-md text-label-md text-primary font-semibold"
                      htmlFor="booking-guest-name"
                    >
                      Adınız Soyadınız <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3 size-5 text-outline" />
                      <input
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-canvas-cream text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-canvas-pure transition-all"
                        id="booking-guest-name"
                        onChange={(event) =>
                          setGuest((current) => ({
                            ...current,
                            name: event.target.value,
                          }))
                        }
                        placeholder="Örn: Ayşe Yılmaz"
                        required
                        type="text"
                        value={guest.name}
                      />
                    </div>
                    {guestErrors.name && (
                      <p className="font-body-sm text-body-sm text-error">
                        {guestErrors.name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label
                      className="block font-label-md text-label-md text-primary font-semibold"
                      htmlFor="booking-guest-phone"
                    >
                      Telefon Numaranız (WhatsApp){" "}
                      <span className="text-error">*</span>
                    </label>
                    <PhoneInput
                      autoComplete="tel"
                      id="booking-guest-phone"
                      inputClassName="h-auto rounded-xl border-0 bg-canvas-cream px-4 py-3 text-on-surface font-body-md text-body-md placeholder:text-outline transition-all focus-visible:bg-canvas-pure focus-visible:ring-2 focus-visible:ring-ring/40"
                      onChange={(value) => {
                        setPhoneCheck({ status: "idle" });
                        setGuest((current) => ({ ...current, phone: value }));
                      }}
                      selectClassName="h-auto w-auto self-stretch rounded-xl border-0 bg-canvas-cream px-3 text-on-surface font-body-md text-body-md transition-all focus-visible:ring-2 focus-visible:ring-ring/50"
                      value={guest.phone}
                    />
                    <p className="font-body-sm text-body-sm text-secondary">
                      Seans Zoom bağlantısı ve SMS teyidi bu numaraya
                      iletilecektir.
                    </p>
                    {guestErrors.phone && (
                      <p className="font-body-sm text-body-sm text-error">
                        {guestErrors.phone}
                      </p>
                    )}
                    {phoneCheck.status === "checking" && (
                      <p className="flex items-center gap-2 font-body-sm text-body-sm text-secondary">
                        <LoaderCircle className="size-4 animate-spin" />
                        Numara kontrol ediliyor...
                      </p>
                    )}
                    {phoneCheck.status === "exists" && (
                      <div className="flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                        <div className="flex items-start gap-2">
                          <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                          <span className="font-body-sm text-body-sm text-on-surface-variant">
                            Bu numara sistemde kayıtlı görünüyor. Randevunuza
                            devam etmek için üye girişi yapın.
                          </span>
                        </div>
                        <button
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-5 py-3 font-label-md text-label-md font-semibold text-on-primary transition-colors hover:bg-burgundy-light"
                          onClick={() => {
                            setLoginPassword("");
                            setLoginError(null);
                            setLoginOpen(true);
                          }}
                          type="button"
                        >
                          <Lock className="size-4" />
                          Üye Girişi Yap
                        </button>
                      </div>
                    )}
                    {phoneCheck.status === "free" && (
                      <div className="flex flex-col gap-4 rounded-xl border border-border-delicate bg-canvas-cream/60 p-4">
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Bu numara sistemde kayıtlı değil. Sisteme kayıt
                          olacaksınız; randevularınızı daha sonra hızlıca
                          takip edebilmeniz için bir şifre belirleyin.
                        </p>
                        <div className="space-y-2">
                          <label
                            className="block font-label-md text-label-md text-primary font-semibold"
                            htmlFor="booking-guest-password"
                          >
                            Şifre Belirleyin <span className="text-error">*</span>
                          </label>
                          <input
                            autoComplete="new-password"
                            className="w-full px-4 py-3 rounded-xl bg-canvas-pure text-on-surface placeholder:text-outline font-body-md text-body-md outline-none border border-border-delicate transition-all focus:border-primary-container/40"
                            id="booking-guest-password"
                            onChange={(event) =>
                              setGuest((current) => ({
                                ...current,
                                password: event.target.value,
                              }))
                            }
                            placeholder="En az 8 karakter"
                            type="password"
                            value={guest.password}
                          />
                          {guestErrors.password && (
                            <p className="font-body-sm text-body-sm text-error">
                              {guestErrors.password}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label
                            className="block font-label-md text-label-md text-primary font-semibold"
                            htmlFor="booking-guest-password-confirmation"
                          >
                            Şifre Tekrarı <span className="text-error">*</span>
                          </label>
                          <input
                            autoComplete="new-password"
                            className="w-full px-4 py-3 rounded-xl bg-canvas-pure text-on-surface placeholder:text-outline font-body-md text-body-md outline-none border border-border-delicate transition-all focus:border-primary-container/40"
                            id="booking-guest-password-confirmation"
                            onChange={(event) =>
                              setGuest((current) => ({
                                ...current,
                                passwordConfirmation: event.target.value,
                              }))
                            }
                            placeholder="Şifrenizi tekrar girin"
                            type="password"
                            value={guest.passwordConfirmation}
                          />
                          {guestErrors.passwordConfirmation && (
                            <p className="font-body-sm text-body-sm text-error">
                              {guestErrors.passwordConfirmation}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                    {phoneCheck.status === "error" && (
                      <p className="font-body-sm text-body-sm text-outline">
                        Numara kontrol edilemedi; devam etmek için özet
                        adımından giriş yapabilirsiniz.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label
                      className="block font-label-md text-label-md text-primary font-semibold"
                      htmlFor="booking-guest-email"
                    >
                      E-Posta Adresiniz <span className="text-error">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 size-5 text-outline" />
                      <input
                        className="w-full pl-11 pr-4 py-3 rounded-xl bg-canvas-cream text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-canvas-pure transition-all"
                        id="booking-guest-email"
                        onChange={(event) =>
                          setGuest((current) => ({
                            ...current,
                            email: event.target.value,
                          }))
                        }
                        placeholder="ornek@alanadi.com"
                        required
                        type="email"
                        value={guest.email}
                      />
                    </div>
                    {guestErrors.email && (
                      <p className="font-body-sm text-body-sm text-error">
                        {guestErrors.email}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label
                      className="block font-label-md text-label-md text-primary font-semibold"
                      htmlFor="booking-guest-notes"
                    >
                      Seans Konusu / Danışmak İstediğiniz Durum (İsteğe
                      Bağlı)
                    </label>
                    <textarea
                      className="w-full p-4 rounded-xl bg-canvas-cream text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-canvas-pure transition-all resize-none"
                      id="booking-guest-notes"
                      onChange={(event) => setNotes(event.target.value)}
                      placeholder="İlişki dinamiği, dişil enerji blokajı, evlilik veya üzerinde çalışmak istediğiniz özel konular..."
                      rows={3}
                      value={notes}
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      className="mt-1 w-4 h-4 rounded accent-burgundy-light cursor-pointer"
                      required
                      type="checkbox"
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      <a className="underline hover:text-primary-container" href="#">
                        KVKK Aydınlatma Metni
                      </a>
                      &apos;ni ve{" "}
                      <a className="underline hover:text-primary-container" href="#">
                        Kişisel Verilerin Korunması ve Gizlilik Sözleşmesi
                      </a>
                      &apos;ni okudum, kabul ediyorum.
                    </span>
                  </label>
                </div>
                <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-container text-on-surface font-label-lg text-label-lg hover:bg-surface-container-high transition-colors"
                    onClick={() => setStep(datetimeStep)}
                    type="button"
                  >
                    <ArrowLeft className="size-4" />
                    <span>Tarih Değiştir</span>
                  </button>
                  <button
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-md hover:bg-burgundy-light transition-all disabled:opacity-60 disabled:pointer-events-none"
                    disabled={
                      register.isPending ||
                      (phoneCheck.status === "free" && !phoneValid)
                    }
                    type="submit"
                  >
                    {register.isPending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : phoneCheck.status === "exists" ? (
                      <Lock className="size-4" />
                    ) : (
                      <ArrowRight className="size-4" />
                    )}
                    <span>
                      {register.isPending
                        ? "Kayıt oluşturuluyor..."
                        : phoneCheck.status === "exists"
                          ? "Üye Girişi Yap"
                          : phoneCheck.status === "free"
                            ? "Kayıt Ol ve Devam Et"
                            : "Sonraki: Özet ve Onay"}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {steps[step]?.id === "summary" && (
            <div className="bg-canvas-pure rounded-2xl shadow-[0_8px_30px_rgba(92,29,36,0.04)] overflow-hidden">
              <div className="px-6 py-5 bg-surface-container-low/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CircleCheck className="size-5 text-primary-container" />
                  <h2 className="font-title-lg text-title-lg text-primary font-semibold">
                    Randevu Özeti ve Onay
                  </h2>
                </div>
                <span className="px-3 py-1 rounded-full bg-blush-surface text-primary-container font-label-sm text-label-sm font-semibold">
                  Adım {step + 1} / {steps.length}
                </span>
              </div>
              <div className="p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-7 space-y-6">
                  <div className="p-6 rounded-2xl bg-canvas-cream space-y-5">
                    <div className="flex items-center justify-between pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
                          <Video className="size-6" />
                        </div>
                        <div>
                          <h4 className="font-title-md text-title-md text-primary font-semibold">
                            {service?.name}
                          </h4>
                          <p className="font-body-sm text-body-sm text-secondary">
                            Uzman: {selectedOffering?.consultant.name ?? "—"}
                          </p>
                        </div>
                      </div>
                      <button
                        className="font-label-md text-label-md text-primary-container hover:underline"
                        onClick={() => setStep(datetimeStep)}
                        type="button"
                      >
                        Değiştir
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-2 font-body-sm text-body-sm">
                      <div className="space-y-1">
                        <span className="text-on-surface-variant block">
                          Randevu Tarihi:
                        </span>
                        <strong className="text-primary font-semibold">
                          {date ? formatDateTrLong(date) : "—"}
                        </strong>
                      </div>
                      <div className="space-y-1">
                        <span className="text-on-surface-variant block">
                          Randevu Saati:
                        </span>
                        <strong className="text-primary font-semibold">
                          {slot?.label ?? "—"}
                        </strong>
                      </div>
                    </div>
                    <div className="pt-3 space-y-2 font-body-sm text-body-sm">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">
                          Danışan:
                        </span>
                        <span className="font-medium text-primary">
                          {isGuest
                            ? guest.name || "—"
                            : (user?.name ?? "—")}
                        </span>
                      </div>
                      {isGuest && (
                        <>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">
                              Telefon / WhatsApp:
                            </span>
                            <span className="font-medium text-primary">
                              {guest.phone || "—"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-on-surface-variant">
                              E-Posta:
                            </span>
                            <span className="font-medium text-primary">
                              {guest.email || "—"}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {isCustomer && (
                    <div className="space-y-2">
                      <label
                        className="block font-label-md text-label-md text-primary font-semibold"
                        htmlFor="booking-summary-notes"
                      >
                        Seans Notu (opsiyonel)
                      </label>
                      <textarea
                        className="w-full p-4 rounded-xl bg-canvas-cream text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-canvas-pure transition-all resize-none"
                        id="booking-summary-notes"
                        onChange={(event) => setNotes(event.target.value)}
                        placeholder="Seans konusu veya paylaşmak istediğiniz notlar..."
                        rows={3}
                        value={notes}
                      />
                    </div>
                  )}
                  <div className="p-4 rounded-xl bg-surface-container-low flex items-start gap-3">
                    <ShieldCheck className="size-5 text-accent-gold flex-shrink-0 mt-0.5" />
                    <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed">
                      Randevunuz onaylandıktan sonra telefonunuza anında SMS
                      ve WhatsApp onay bildirimi gönderilecek; görüşme günü
                      bağlantı davetiniz 15 dakika önce aktif hale
                      gelecektir.
                    </p>
                  </div>
                </div>
                <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl bg-canvas-cream space-y-6">
                  <div className="space-y-4">
                    <h4 className="font-title-md text-title-md text-primary font-semibold">
                      Ödeme Özeti
                    </h4>
                    <div className="space-y-3 font-body-sm text-body-sm">
                      <div className="flex justify-between text-on-surface-variant">
                        <span>
                          1e1 Seans Ücreti
                          {selectedOffering?.offering.duration
                            ? ` (${selectedOffering.offering.duration} dk)`
                            : ""}
                        </span>
                        <span className="text-on-surface font-medium">
                          {formatPrice(selectedOffering?.offering.price) ??
                            "—"}
                        </span>
                      </div>
                      <div className="flex justify-between text-on-surface-variant">
                        <span>Hizmet &amp; Güvenli Altyapı</span>
                        <span className="text-emerald-700 font-medium">
                          Dahil
                        </span>
                      </div>
                      <div className="flex justify-between text-on-surface-variant">
                        <span>KDV (%20)</span>
                        <span className="text-emerald-700 font-medium">
                          Fiyata Dahil
                        </span>
                      </div>
                      {selectedPackage && (
                        <div className="flex justify-between text-on-surface-variant">
                          <span>
                            Paketten Kullanım:{" "}
                            <span className="text-primary font-medium">
                              {selectedPackage.package?.name ??
                                `Paket #${selectedPackage.id}`}
                            </span>
                          </span>
                          <span className="text-emerald-700 font-medium">
                            Kalan:{" "}
                            {remainingQuantityForService(
                              selectedPackage,
                              serviceId
                            )}
                          </span>
                        </div>
                      )}
                      <div className="pt-4 flex justify-between items-center text-primary">
                        <span className="font-title-md text-title-md font-semibold">
                          Toplam Tutar:
                        </span>
                        <span className="font-headline-sm text-headline-sm font-bold text-primary-container">
                          {formatPrice(selectedOffering?.offering.price) ??
                            "—"}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-surface-container flex items-center justify-between font-label-sm text-label-sm text-secondary">
                      <span className="flex items-center gap-1.5">
                        <Lock className="size-4 text-accent-gold" />
                        256-Bit SSL Korumalı Ödeme
                      </span>
                      <span className="font-bold tracking-wider text-primary">
                        GÜVENLİ
                      </span>
                    </div>
                    {isGuest && (
                      <div className="p-3 rounded-xl bg-blush-surface text-on-secondary-fixed-variant font-body-sm text-body-sm flex items-start gap-2">
                        <Info className="size-4 text-primary-container flex-shrink-0 mt-0.5" />
                        <span>
                          Randevunuzu tamamlamak için üye girişi yapmanız
                          gerekiyor.
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3 pt-4">
                    {selectedPackage && (
                      <div className="p-3 rounded-xl bg-emerald-600/10 text-on-secondary-fixed-variant font-body-sm text-body-sm flex items-start gap-2">
                        <BadgeCheck className="size-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        <span>
                          Bu randevu için{" "}
                          <strong className="text-primary">
                            &quot;{selectedPackage.package?.name}&quot;
                          </strong>{" "}
                          paketinizden 1 kullanım düşülecek.
                        </span>
                      </div>
                    )}
                    {!selectedPackage && (
                      <div className="p-3 rounded-xl bg-blush-surface text-on-secondary-fixed-variant font-body-sm text-body-sm flex items-start gap-2">
                        <Info className="size-4 text-primary-container flex-shrink-0 mt-0.5" />
                        <span>
                          Onayladıktan sonra güvenli PayTR ödeme ekranına
                          yönlendirileceksiniz. Ödemeniz onaylandığında
                          randevunuz onaylanmış olacak.
                        </span>
                      </div>
                    )}
                    {createdAppointment && !selectedPackage && (
                      <div className="flex flex-col gap-2 rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 text-left">
                        <span className="font-body-sm text-body-sm text-primary font-semibold">
                          Randevunuz oluşturuldu ancak ödeme başlatılamadı.
                        </span>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Ödemeyi tekrar başlatmayı deneyin; sorun sürerse
                          siparişlerinizden ödemeye devam edebilirsiniz.
                        </span>
                        <button
                          className="self-start rounded-full bg-primary-container px-5 py-2 font-label-md text-label-md font-semibold text-on-primary hover:bg-burgundy-light transition-all"
                          disabled={createOrder.isPending}
                          onClick={() =>
                            startAppointmentPayment(createdAppointment.id)
                          }
                          type="button"
                        >
                          {createOrder.isPending
                            ? "Yönlendiriliyorsunuz..."
                            : "Ödemeyi Tekrar Dene"}
                        </button>
                      </div>
                    )}
                    {isCustomer && (
                      <button
                        className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-lg hover:bg-burgundy-light transition-all transform hover:-translate-y-0.5 disabled:opacity-60 disabled:pointer-events-none"
                        disabled={create.isPending || createOrder.isPending}
                        onClick={handleBooking}
                        type="button"
                      >
                        {create.isPending || createOrder.isPending ? (
                          <LoaderCircle className="size-5 animate-spin" />
                        ) : selectedPackage ? (
                          <CircleCheck className="size-5" />
                        ) : (
                          <CreditCard className="size-5" />
                        )}
                        <span>
                          {create.isPending || createOrder.isPending
                            ? selectedPackage
                              ? "Randevu oluşturuluyor..."
                              : "Ödeme ekranına geçiliyor..."
                            : selectedPackage
                              ? "Randevuyu Onayla"
                              : "Ödemeye Geç ve Randevuyu Oluştur"}
                        </span>
                      </button>
                    )}
                    {isGuest && (
                      <button
                        className="w-full inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-primary-container text-on-primary font-label-lg text-label-lg shadow-lg hover:bg-burgundy-light transition-all transform hover:-translate-y-0.5"
                        onClick={handleBooking}
                        type="button"
                      >
                        <Lock className="size-5" />
                        <span>Giriş Yap &amp; Randevuyu Tamamla</span>
                      </button>
                    )}
                    <button
                      className="w-full text-center py-2 font-label-md text-label-md text-on-surface-variant hover:text-primary-container transition-colors"
                      onClick={() => setStep(Math.max(0, step - 1))}
                      type="button"
                    >
                      Bilgileri Düzenle
                    </button>
                  </div>
                </div>
              </div>
            </div>
             )}
          </div>
        )}

        <Dialog onOpenChange={setLoginOpen} open={loginOpen}>
        <DialogContent className="max-w-md gap-5 rounded-2xl border-0 bg-canvas-pure p-6 shadow-[0_8px_30px_rgba(92,29,36,0.08)] sm:p-8">
          <DialogHeader className="gap-1.5">
            <DialogTitle className="font-title-lg text-title-lg font-semibold text-primary">
              Üye Girişi
            </DialogTitle>
            <DialogDescription className="font-body-sm text-body-sm text-on-surface-variant">
              <span className="font-semibold text-primary">{phoneE164}</span>{" "}
              numarası sistemde kayıtlı görünüyor. Şifrenizle giriş yapın,
              randevunuza kaldığınız yerden devam edin.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleQuickLogin} noValidate>
            <div className="space-y-2">
              <label
                className="block font-label-md text-label-md text-primary font-semibold"
                htmlFor="quick-login-password"
              >
                Şifreniz
              </label>
              <input
                autoComplete="current-password"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-border-delicate bg-canvas-cream text-on-surface placeholder:text-outline font-body-md text-body-md outline-none transition-all focus:border-primary-container/40 focus:bg-canvas-pure"
                id="quick-login-password"
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Şifrenizi girin"
                type="password"
                value={loginPassword}
              />
              {loginError && (
                <p className="font-body-sm text-body-sm text-error">
                  {loginError}
                </p>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <Link
                className="font-label-sm text-label-sm text-primary-container underline underline-offset-4 hover:text-primary transition-colors"
                href="/login"
              >
                Şifremi unuttum
              </Link>
            </div>
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-5 py-3.5 font-label-lg text-label-lg font-semibold text-on-primary shadow-md transition-colors hover:bg-burgundy-light disabled:opacity-60 disabled:pointer-events-none"
              disabled={login.isPending}
              type="submit"
            >
              {login.isPending ? (
                <LoaderCircle className="size-5 animate-spin" />
              ) : (
                <Lock className="size-5" />
              )}
              <span>{login.isPending ? "Giriş yapılıyor..." : "Giriş Yap ve Devam Et"}</span>
            </button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
