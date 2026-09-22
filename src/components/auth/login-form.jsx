"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CircleAlert,
  CircleCheck,
  Eye,
  EyeOff,
  Heart,
  KeyRound,
  LoaderCircle,
  Lock,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "@/components/ui/toast";
import { api, ApiError } from "@/lib/api";
import { roleHomePath } from "@/lib/auth";
import { useAuth, useLogin } from "@/lib/auth-hooks";
import { PhoneInput } from "@/components/phone-input";

const phoneRegex = /^\+\d{8,15}$/;

const phoneField = z
  .string()
  .min(1, "Telefon numarası zorunludur")
  .regex(phoneRegex, "Geçerli bir telefon numarası girin");

const loginSchema = z.object({
  phone: phoneField,
  password: z.string().min(1, "Şifre zorunludur"),
});

const forgotSchema = z.object({ phone: phoneField });

const resetSchema = z
  .object({
    code: z.string().regex(/^\d{6}$/, "6 haneli sıfırlama kodunu girin"),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
    password_confirmation: z.string().min(1, "Şifre tekrarı zorunludur"),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler eşleşmiyor",
    path: ["password_confirmation"],
  });

const PORTRAIT_URL =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAmhUX4D0ZKlLXTwaOBoJvIpAqpNXKLzAMPb5fupufSz96wqrjhh98HZWhV5oYocn1TQ6x1NK0xT-ErdiTC54PK9LmMrRKpv83_9f6eq7Y2qiRr_jdmFaNk6ZD4kC15b8fLQ3ZCxWwAfM_hsQ9t9lkk9oNAh5ZAWOtd9WblJicPkKOcRSUKJVVIZjuIjTWPAzhSv-5OPwsl6lwqPhqiNWoS1O0yzUDq0foZmQ96LVvk4f0nfd7jjDoZ";

const HERO_FEATURES = [
  {
    icon: Users,
    title: "15.000+ Danışan & Katılımcı",
    description: "Kişiye özel rehberlik ve akademi seminerleri",
  },
  {
    icon: ShieldCheck,
    title: "Uçtan Uca Şifreli & Mahrem Seans Alanı",
    description: "Türk Psikologlar Derneği etik standartları",
    icon_alt: true,
  },
  {
    icon: BookOpen,
    title: "Takvim & E-Kitap Kütüphanesi",
    description: "Tek tıkla randevu katılımı ve dijital rehberler",
  },
];

const PHONE_INPUT_PROPS = {
  selectClassName:
    "h-12 w-auto rounded-xl border-0 bg-surface-container-low px-2.5 text-sm font-medium text-on-surface outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
  inputClassName:
    "h-12 rounded-xl border-0 bg-surface-container-low px-4 font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring/50",
};

function PhoneField({ control, name, errors, id }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <PhoneInput
          autoComplete="tel"
          id={id}
          value={field.value}
          onChange={field.onChange}
          aria-invalid={Boolean(errors[name])}
          {...PHONE_INPUT_PROPS}
        />
      )}
    />
  );
}

export function LoginForm() {
  const login = useLogin();
  const router = useRouter();
  const { user } = useAuth();
  const [view, setView] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState("phone");
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotNote, setForgotNote] = useState(null);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { phone: "", password: "" },
  });

  const forgotForm = useForm({
    resolver: zodResolver(forgotSchema),
    defaultValues: { phone: "" },
  });

  const resetForm = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: { code: "", password: "", password_confirmation: "" },
  });

  const forgot = useMutation({
    mutationFn: (phone) => api.forgotPassword(phone),
  });

  const reset = useMutation({
    mutationFn: (payload) => api.resetPassword(payload),
    onSuccess: () => {
      setForgotStep("done");
      toast.add({
        title: "Şifreniz güncellendi",
        description: "Yeni şifrenizle giriş yapabilirsiniz.",
        type: "success",
      });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.errors) {
        for (const [field, messages] of Object.entries(error.errors)) {
          if (
            field === "code" ||
            field === "password" ||
            field === "password_confirmation"
          ) {
            const message = Array.isArray(messages) ? messages[0] : messages;
            resetForm.setError(field, { message });
          }
        }
      }
      resetForm.setError("root", {
        message:
          error instanceof ApiError
            ? error.message
            : "Şifre sıfırlanamadı. Lütfen tekrar deneyin.",
      });
    },
  });

  useEffect(() => {
    if (!login.isSuccess) return;
    if (user) {
      router.replace(roleHomePath(user.role));
    }
  }, [login.isSuccess, user, router]);

  useEffect(() => {
    if (!login.isError || !(login.error instanceof ApiError)) return;
    const error = login.error;
    if (error.errors) {
      for (const [field, messages] of Object.entries(error.errors)) {
        if (field === "phone" || field === "password") {
          const message = Array.isArray(messages) ? messages[0] : messages;
          form.setError(field, { message });
        }
      }
    }
    form.setError("root", { message: error.message });
  }, [login.isError, login.error, form]);

  const onSubmitLogin = form.handleSubmit((values) => {
    login.mutate(values);
  });

  const onSubmitForgot = forgotForm.handleSubmit(({ phone }) => {
    setForgotNote(null);
    api
      .phoneExists(phone)
      .then((data) => {
        if (!data?.exists) {
          setForgotNote(
            "Bu numara sistemde kayıtlı görünmüyor. Yeni hesap oluşturmak için kayıt olabilirsiniz."
          );
          return;
        }
        setForgotPhone(phone);
        forgot.mutate(phone, {
          onSuccess: () => {
            resetForm.reset();
            setForgotStep("reset");
          },
          onError: () => {
            setForgotNote(
              "Kod gönderilemedi. Lütfen bir süre sonra tekrar deneyin."
            );
          },
        });
      })
      .catch(() => {
        setForgotPhone(phone);
        forgot.mutate(phone, {
          onSuccess: () => {
            resetForm.reset();
            setForgotStep("reset");
          },
          onError: () => {
            setForgotNote(
              "Kod gönderilemedi. Lütfen bir süre sonra tekrar deneyin."
            );
          },
        });
      });
  });

  const onSubmitReset = resetForm.handleSubmit((values) => {
    reset.mutate({ phone: forgotPhone, ...values });
  });

  const backToLogin = () => {
    if (forgotPhone) {
      form.setValue("phone", forgotPhone);
    }
    setView("login");
    setForgotStep("phone");
    setForgotPhone("");
    setForgotNote(null);
    forgotForm.reset();
    resetForm.reset();
  };

  return (
    <div className="relative w-full rounded-2xl bg-canvas-pure shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
      {/* Left Hero Showcase Panel */}
      <div className="lg:col-span-5 relative bg-primary-container text-on-primary flex flex-col justify-between p-8 md:p-12 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-burgundy-light/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-accent-gold/15 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-canvas-pure/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
            <span className="font-label-sm text-label-sm text-tertiary-fixed tracking-widest uppercase">
              Güvenli Danışan Alanı
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-accent-gold">
            <BadgeCheck className="size-4" />
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary">
              Lisanslı Danışmanlık
            </span>
          </div>
        </div>
        <div className="relative z-10 my-auto py-8 flex flex-col items-center text-center">
          <div className="relative mb-6">
            <div className="w-32 h-32 md:w-36 md:h-36 rounded-full p-1 bg-gradient-to-tr from-accent-gold via-blush-surface to-accent-gold shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Sümeyra Aydın"
                className="w-full h-full rounded-full object-cover"
                src={PORTRAIT_URL}
              />
            </div>
            <div className="absolute -bottom-2 -right-1 bg-canvas-pure text-primary px-2.5 py-1 rounded-full shadow-md flex items-center gap-1">
              <Lock className="size-3.5 text-accent-gold" />
              <span className="font-label-sm text-label-sm font-semibold">
                Gizlilik
              </span>
            </div>
          </div>
          <blockquote className="font-headline-md text-headline-md text-canvas-pure font-serif leading-snug tracking-tight max-w-sm mb-4">
            “Kendinize ve içsel dönüşümünüze attığınız her adım,
            ilişkilerinizde zarafet ve güven olarak yankılanır.”
          </blockquote>
          <p className="font-label-md text-label-md text-accent-gold uppercase tracking-widest font-sans">
            Sümeyra Aydın • Kurucu Danışman
          </p>
        </div>
        <div className="relative z-10 flex flex-col gap-2.5 pt-4">
          {HERO_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex items-center gap-3 p-3 rounded-xl bg-canvas-pure/10 backdrop-blur-md transition-all hover:bg-canvas-pure/15"
            >
              <div className="w-9 h-9 rounded-lg bg-accent-gold/20 flex items-center justify-center shrink-0 text-accent-gold">
                <feature.icon className="size-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-title-md text-title-md font-semibold text-canvas-pure">
                  {feature.title}
                </span>
                <span className="font-body-sm text-body-sm text-primary-fixed-dim">
                  {feature.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Authentication Form Panel */}
      <div className="lg:col-span-7 bg-canvas-pure flex flex-col justify-between p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-xl mx-auto flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blush-surface text-primary w-fit">
              <KeyRound className="size-4 text-accent-gold" />
              <span className="font-label-sm text-label-sm tracking-widest uppercase">
                Danışan Portalı
              </span>
            </div>
            <div className="flex items-center p-1 rounded-full bg-surface-container-low">
              <span className="px-5 py-1.5 rounded-full bg-primary text-on-primary font-label-md text-label-md shadow-sm">
                Giriş Yap
              </span>
              <Link
                className="px-5 py-1.5 rounded-full text-on-surface-variant hover:text-primary font-label-md text-label-md transition-colors"
                href="/register"
              >
                Kayıt Ol
              </Link>
            </div>
          </div>

          {view === "login" ? (
            <>
              <div className="mb-8">
                <h1 className="font-headline-lg text-headline-lg text-primary font-serif tracking-tight mb-2">
                  Yeniden Hoş Geldiniz
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Seanslarınıza katılmak, randevu takviminizi yönetmek ve
                  kayıtlı olduğunuz akademi e-kitaplarına erişmek için lütfen
                  giriş yapınız.
                </p>
              </div>
              <form
                className="flex flex-col gap-5"
                noValidate
                onSubmit={onSubmitLogin}
              >
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between"
                    htmlFor="phone"
                  >
                    <span>Telefon Numarası *</span>
                    <span className="text-secondary font-normal font-body-sm text-body-sm">
                      Kayıtlı telefonunuz
                    </span>
                  </label>
                  <PhoneField
                    control={form.control}
                    errors={form.formState.errors}
                    id="phone"
                    name="phone"
                  />
                  {form.formState.errors.phone && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="font-label-md text-label-md text-on-surface font-semibold"
                      htmlFor="password"
                    >
                      Şifre *
                    </label>
                    <button
                      className="font-label-md text-label-md text-burgundy-light hover:text-primary transition-colors underline underline-offset-2"
                      onClick={() => {
                        const currentPhone = form.getValues("phone");
                        if (currentPhone) {
                          forgotForm.setValue("phone", currentPhone);
                        }
                        setForgotStep("phone");
                        setForgotNote(null);
                        setView("forgot");
                      }}
                      type="button"
                    >
                      Şifremi Unuttum?
                    </button>
                  </div>
                  <div className="relative flex items-center">
                    <Lock className="absolute left-3.5 size-4 text-outline pointer-events-none" />
                    <input
                      autoComplete="current-password"
                      className="w-full h-12 pl-11 pr-11 rounded-xl border-0 bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline outline-none transition-colors focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                      id="password"
                      placeholder="••••••••••••"
                      type={showPassword ? "text" : "password"}
                      aria-invalid={Boolean(form.formState.errors.password)}
                      {...form.register("password")}
                    />
                    <button
                      aria-label="Şifreyi Göster/Gizle"
                      className="absolute right-3.5 text-outline hover:text-primary transition-colors flex items-center justify-center p-1 rounded-full outline-none"
                      onClick={() => setShowPassword((current) => !current)}
                      type="button"
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>
                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}
                <button
                  className="w-full py-3.5 mt-2 rounded-xl bg-primary text-on-primary hover:bg-burgundy-light font-label-lg text-label-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                  disabled={login.isPending}
                  type="submit"
                >
                  {login.isPending && (
                    <LoaderCircle className="size-4 animate-spin" />
                  )}
                  <span>Danışan Portalı&apos;na Giriş Yap</span>
                  {!login.isPending && <ArrowRight className="size-4" />}
                </button>
              </form>
              <div className="mt-8 p-4 rounded-xl bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blush-surface text-primary flex items-center justify-center shrink-0">
                    <Heart className="size-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-label-md text-label-md text-on-surface font-semibold">
                      Henüz bir danışan hesabınız yok mu?
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      İlk seansınızı planlayın ya da akademimize katılın.
                    </span>
                  </div>
                </div>
                <Link
                  className="px-4 py-2 rounded-lg bg-canvas-pure text-primary font-label-md text-label-md hover:bg-blush-surface transition-colors shadow-sm shrink-0"
                  href="/register"
                >
                  Hemen Kayıt Olun
                </Link>
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-primary font-serif tracking-tight mb-2">
                  Şifremi Unuttum
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Kayıtlı telefon numaranızı girin; şifrenizi sıfırlamanız
                  için 6 haneli kod gönderelim.
                </p>
              </div>
              {forgotStep === "phone" && (
                <form
                  className="flex flex-col gap-5"
                  noValidate
                  onSubmit={onSubmitForgot}
                >
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md text-on-surface font-semibold"
                      htmlFor="forgot-phone"
                    >
                      Telefon Numarası *
                    </label>
                    <PhoneField
                      control={forgotForm.control}
                      errors={forgotForm.formState.errors}
                      id="forgot-phone"
                      name="phone"
                    />
                    {forgotForm.formState.errors.phone && (
                      <p className="text-xs text-destructive">
                        {forgotForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>
                  {forgotNote && (
                    <div className="p-4 rounded-xl bg-surface-container-low flex items-start gap-3">
                      <CircleAlert className="size-4 text-secondary shrink-0 mt-0.5" />
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {forgotNote}
                      </span>
                      {forgotNote.includes("kayıtlı görünmüyor") && (
                        <Link
                          className="ml-auto shrink-0 px-3 py-1.5 rounded-lg bg-canvas-pure text-primary font-label-sm text-label-sm hover:bg-blush-surface transition-colors shadow-sm"
                          href="/register"
                        >
                          Kayıt Ol
                        </Link>
                      )}
                    </div>
                  )}
                  <button
                    className="w-full py-3.5 rounded-xl bg-primary text-on-primary hover:bg-burgundy-light font-label-lg text-label-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                    disabled={forgot.isPending}
                    type="submit"
                  >
                    {forgot.isPending && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}
                    <span>
                      {forgot.isPending ? "Gönderiliyor..." : "Sıfırlama Kodu Gönder"}
                    </span>
                    {!forgot.isPending && <ArrowRight className="size-4" />}
                  </button>
                </form>
              )}
              {forgotStep === "reset" && (
                <form
                  className="flex flex-col gap-5"
                  noValidate
                  onSubmit={onSubmitReset}
                >
                  <div className="flex items-start justify-between gap-3 p-4 rounded-xl bg-blush-surface/60">
                    <div className="flex items-start gap-3">
                      <CircleCheck className="size-4 text-primary shrink-0 mt-0.5" />
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        Sıfırlama kodu{" "}
                        <strong className="text-primary">{forgotPhone}</strong>{" "}
                        numarasına gönderildi. Kod 10 dakika geçerlidir.
                      </span>
                    </div>
                    <button
                      className="shrink-0 font-label-sm text-label-sm font-semibold text-burgundy-light hover:text-primary transition-colors underline underline-offset-2 disabled:opacity-60"
                      disabled={forgot.isPending}
                      onClick={() => forgot.mutate(forgotPhone)}
                      type="button"
                    >
                      {forgot.isPending ? "Gönderiliyor..." : "Yeniden Gönder"}
                    </button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md text-on-surface font-semibold"
                      htmlFor="reset-code"
                    >
                      Sıfırlama Kodu *
                    </label>
                    <Controller
                      control={resetForm.control}
                      name="code"
                      render={({ field }) => (
                        <input
                          autoComplete="one-time-code"
                          className="w-full h-14 text-center text-xl font-semibold tracking-[0.5em] rounded-xl border-0 bg-surface-container-low text-on-surface placeholder:text-outline outline-none transition-colors focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                          id="reset-code"
                          inputMode="numeric"
                          maxLength={6}
                          placeholder="••••••"
                          type="text"
                          value={field.value}
                          onChange={(event) =>
                            field.onChange(
                              event.target.value.replace(/\D/g, "").slice(0, 6)
                            )
                          }
                        />
                      )}
                    />
                    {resetForm.formState.errors.code && (
                      <p className="text-xs text-destructive">
                        {resetForm.formState.errors.code.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md text-on-surface font-semibold"
                      htmlFor="reset-password"
                    >
                      Yeni Şifre *
                    </label>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-3.5 size-4 text-outline pointer-events-none" />
                      <input
                        autoComplete="new-password"
                        className="w-full h-12 pl-11 pr-4 rounded-xl border-0 bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline outline-none transition-colors focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                        id="reset-password"
                        placeholder="En az 8 karakter"
                        type="password"
                        aria-invalid={Boolean(resetForm.formState.errors.password)}
                        {...resetForm.register("password")}
                      />
                    </div>
                    {resetForm.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {resetForm.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-md text-label-md text-on-surface font-semibold"
                      htmlFor="reset-password-confirmation"
                    >
                      Yeni Şifre (Tekrar) *
                    </label>
                    <input
                      autoComplete="new-password"
                      className="w-full h-12 px-4 rounded-xl border-0 bg-surface-container-low text-on-surface font-body-md text-body-md placeholder:text-outline outline-none transition-colors focus-visible:bg-surface-container focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                      id="reset-password-confirmation"
                      placeholder="••••••••••••"
                      type="password"
                      aria-invalid={Boolean(
                        resetForm.formState.errors.password_confirmation
                      )}
                      {...resetForm.register("password_confirmation")}
                    />
                    {resetForm.formState.errors.password_confirmation && (
                      <p className="text-xs text-destructive">
                        {resetForm.formState.errors.password_confirmation.message}
                      </p>
                    )}
                  </div>
                  {resetForm.formState.errors.root && (
                    <p className="text-sm text-destructive">
                      {resetForm.formState.errors.root.message}
                    </p>
                  )}
                  <button
                    className="w-full py-3.5 rounded-xl bg-primary text-on-primary hover:bg-burgundy-light font-label-lg text-label-lg font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
                    disabled={reset.isPending}
                    type="submit"
                  >
                    {reset.isPending && (
                      <LoaderCircle className="size-4 animate-spin" />
                    )}
                    <span>{reset.isPending ? "Sıfırlanıyor..." : "Şifreyi Sıfırla"}</span>
                    {!reset.isPending && <ArrowRight className="size-4" />}
                  </button>
                </form>
              )}
              {forgotStep === "done" && (
                <div className="flex flex-col items-center gap-4 p-6 rounded-xl bg-blush-surface/60 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <CircleCheck className="size-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-title-md text-title-md text-primary font-semibold">
                      Şifreniz güncellendi
                    </span>
                    <span className="font-body-md text-body-md text-on-surface-variant">
                      Artık yeni şifrenizle giriş yapabilirsiniz.
                    </span>
                  </div>
                </div>
              )}
              <button
                className="inline-flex items-center justify-center gap-1.5 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
                onClick={backToLogin}
                type="button"
              >
                <ArrowLeft className="size-4" />
                {forgotStep === "reset" ? "Numarayı Değiştir" : "Girişe Dön"}
              </button>
            </div>
          )}
        </div>

        <div className="w-full max-w-xl mx-auto pt-8 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-on-surface-variant">
            <ShieldCheck className="size-4 text-accent-gold" />
            <span className="font-label-sm text-label-sm">
              256-Bit SSL Şifreleme
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm text-center sm:text-right">
            <span>KVKK &amp; TPD Etik İlkeleri Uyumlu</span>
            <CircleCheck className="size-4 text-accent-gold" />
          </div>
        </div>
      </div>
    </div>
  );
}
