"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Badge,
  BadgeCheck,
  CalendarDays,
  Eye,
  EyeOff,
  Heart,
  Library,
  LoaderCircle,
  Lock,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sparkles,
  SquareCheckBig,
  Star,
  User,
} from "lucide-react";
import { PhoneInput } from "@/components/phone-input";
import { ApiError } from "@/lib/api";
import { roleHomePath } from "@/lib/auth";
import { useAuth, useRegister } from "@/lib/auth-hooks";

const phoneRegex = /^\+\d{8,15}$/;

const registerSchema = z
  .object({
    first_name: z.string().min(1, "Ad zorunludur"),
    last_name: z.string().min(1, "Soyad zorunludur"),
    phone: z
      .string()
      .min(1, "Telefon numarası zorunludur")
      .regex(phoneRegex, "Geçerli bir telefon numarası girin"),
    email: z.union([
      z.literal(""),
      z.string().trim().email("Geçerli bir e-posta girin"),
    ]),
    password: z.string().min(8, "Şifre en az 8 karakter olmalıdır"),
    password_confirmation: z.string().min(1, "Şifre tekrarı zorunludur"),
    consent: z.literal(true, {
      message: "Devam etmek için KVKK metnini onaylamanız gerekir",
    }),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: "Şifreler eşleşmiyor",
    path: ["password_confirmation"],
  });

const PORTRAIT_URL =
  "https://lh3.googleusercontent.com/aida/AEtjO1XIlVc064reFLGQVp5YzWGYgejh3Szlol-WsR0dPKzCgqPdNzynsbZbKNRZmoHcYO3yaZBy-JHEPWmrUIowT_xuMmLyHrxJf-PSzorG6kjxi8W0EHyDO-VUpdYDTjEDDr16Nn_FS1s0I98uIJZTezecoRyWuSk2Sd1BI6QNWjrOqXUv7KgJu1m1e58kLWGkaBBaCCjdnaq3jPPbcdTkVTUzzTvl41PPu4rXToddGlQBanjasYVgy_gb5g";

const PRIVILEGES = [
  {
    icon: CalendarDays,
    title: "Kişiselleştirilmiş Seans Takvimi",
    description:
      "Randevularınızı dilediğiniz an takvim üzerinden planlayın, 24 saat öncesine kadar erteleyin.",
  },
  {
    icon: Library,
    title: "E-Kitap & Materyal Kütüphanesi",
    description:
      "Kayıtlı olduğunuz rehberlere, sesli farkındalık meditasyonlarına ömür boyu erişin.",
  },
  {
    icon: SquareCheckBig,
    title: "Paket Kullanım & Ödev Takibi",
    description:
      "Çoklu seans haklarınızı, danışman geri bildirim notlarını ve çalışma kağıtlarınızı izleyin.",
  },
  {
    icon: BadgeCheck,
    title: "Öncelikli Erken Kayıt",
    description:
      "Yeni açılan online kamplar ve kapalı grup masterclass programlarında indirimli kontenjan hakkı.",
  },
];

const INPUT_CLASS =
  "w-full py-3 rounded-xl border-0 bg-canvas-cream text-on-surface font-body-md text-body-md outline-none transition-all focus-visible:bg-canvas-pure focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:ring-3 aria-invalid:ring-destructive/20";

function getPasswordStrength(value) {
  let strength = 0;
  if (value.length >= 8) strength += 1;
  if (/[A-Z]/.test(value)) strength += 1;
  if (/[0-9]/.test(value)) strength += 1;
  if (/[^A-Za-z0-9]/.test(value)) strength += 1;
  return strength;
}

const STRENGTH_LABELS = {
  0: { text: "En az 8 karakter, harf ve rakam içermelidir.", className: "text-on-surface-variant" },
  1: { text: "Zayıf şifre", className: "text-destructive" },
  2: { text: "Orta seviye şifre", className: "text-on-surface-variant" },
  3: { text: "Güçlü şifre", className: "text-primary font-medium" },
  4: { text: "Çok güçlü & güvenli şifre", className: "text-primary font-bold" },
};

const STRENGTH_BAR_COLORS = ["bg-error", "bg-tertiary-fixed-dim", "bg-accent-gold", "bg-primary"];

export function RegisterForm() {
  const register = useRegister();
  const router = useRouter();
  const { user } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      email: "",
      password: "",
      password_confirmation: "",
      consent: false,
    },
  });

  useEffect(() => {
    if (!register.isSuccess) return;
    if (user) {
      router.replace(roleHomePath(user.role));
    } else {
      router.replace("/login");
    }
  }, [register.isSuccess, user, router]);

  useEffect(() => {
    if (!register.isError || !(register.error instanceof ApiError)) return;
    const error = register.error;
    if (error.errors) {
      for (const [field, messages] of Object.entries(error.errors)) {
        if (
          [
            "first_name",
            "last_name",
            "phone",
            "email",
            "password",
          ].includes(field)
        ) {
          const message = Array.isArray(messages) ? messages[0] : messages;
          form.setError(field, { message });
        }
      }
    }
    form.setError("root", { message: error.message });
  }, [register.isError, register.error, form]);

  const onSubmit = form.handleSubmit(({ email, ...values }) => {
    register.mutate(email ? { ...values, email } : values);
  });

  const password = useWatch({ control: form.control, name: "password" }) ?? "";
  const strength = getPasswordStrength(password);
  const strengthInfo = STRENGTH_LABELS[strength];

  return (
    <div className="w-full flex flex-col gap-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Privilege & Authority Showcase Panel */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-canvas-pure rounded-xl p-6 md:p-8 shadow-md relative overflow-hidden flex flex-col gap-6">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-blush-surface/50 blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-canvas-cream text-primary text-label-sm font-label-sm uppercase tracking-widest shadow-sm">
                  <Sparkles className="size-3.5 text-accent-gold" />
                  Özel Danışan Ağı
                </span>
                <span className="h-1.5 w-1.5 rounded-full bg-accent-gold" />
                <span className="text-on-surface-variant font-label-sm text-label-sm">
                  Akademi 2024
                </span>
              </div>
              <div className="flex items-center gap-4 bg-surface-container-low p-4 rounded-xl">
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0 shadow-sm ring-2 ring-accent-gold/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Sümeyra Aydın Portresi"
                    className="w-full h-full object-cover"
                    src={PORTRAIT_URL}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <h3 className="font-headline-sm text-headline-sm text-primary truncate">
                    Sümeyra Aydın
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Aile, Çift &amp; Bireysel İlişkiler Danışmanı
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star className="size-3.5 fill-accent-gold text-accent-gold" />
                    <span className="font-label-sm text-label-sm text-secondary font-medium tracking-wide">
                      12+ Yıl Klinik &amp; Akademi Deneyimi
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="font-headline-md text-headline-md text-primary leading-tight font-serif">
                  İçsel Zarafet &amp; Bilinçli İlişkiler Topluluğuna Katılın
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Kendinize, partnerinize ve yaşama dair derin bir farkındalık
                  yolculuğuna güvenli, gizlilik odaklı bir alanda adım atın.
                </p>
              </div>
              <div className="flex flex-col gap-3.5">
                <span className="font-label-md text-label-md text-primary uppercase tracking-wider font-semibold">
                  Danışan Ayrıcalıkları
                </span>
                {PRIVILEGES.map((privilege) => (
                  <div
                    key={privilege.title}
                    className="flex items-start gap-3 bg-canvas-cream/80 p-3 rounded-lg hover:bg-canvas-cream transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <privilege.icon className="size-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-title-md text-title-md text-primary font-medium">
                        {privilege.title}
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        {privilege.description}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 rounded-xl bg-blush-surface/70 relative">
                <span className="font-serif text-primary/20 text-3xl absolute top-2 right-3 pointer-events-none select-none">
                  ”
                </span>
                <p className="font-body-md text-body-md text-primary italic leading-relaxed">
                  “Sümeyra Hanım ile başladığım bu yolculuk hayatımın en
                  berrak aynası oldu. İlişkilerime ve kendime bakışım kökten
                  şifalandı.”
                </p>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-label-sm text-label-sm text-burgundy-light font-semibold tracking-wide">
                    — Zeynep K., Danışan
                  </span>
                  <div className="flex text-accent-gold">
                    {[0, 1, 2, 3, 4].map((index) => (
                      <Star key={index} className="size-4 fill-accent-gold" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-canvas-cream p-4 rounded-xl flex items-center gap-3 shadow-sm">
            <div className="w-10 h-10 rounded-full bg-accent-gold/20 flex items-center justify-center text-accent-gold flex-shrink-0">
              <Lock className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-primary font-medium">
                Gizlilik &amp; Etik Taahhüdü
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Tüm kişisel verileriniz ve görüşme kayıtlarınız KVKK
                standartlarında 256-Bit SSL ile korunur.
              </span>
            </div>
          </div>
        </section>

        {/* Right Registration Form Panel */}
        <section className="lg:col-span-7">
          <div className="bg-canvas-pure rounded-xl p-6 md:p-8 shadow-xl relative overflow-hidden">
            <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-accent-gold/10 blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blush-surface text-burgundy-light font-label-sm text-label-sm uppercase tracking-widest font-bold">
                    Yeni Hesap Oluşturma
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-primary font-serif">
                  Danışan Hesabınızı Oluşturun
                </h2>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Bireysel dönüşüm ve rehberlik yolculuğunuza hemen başlayın.
                  Seanslarınızı saniyeler içinde planlayın.
                </p>
              </div>
              <form className="flex flex-col gap-5" noValidate onSubmit={onSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-lg text-label-lg text-primary font-medium"
                      htmlFor="first_name"
                    >
                      Adınız <span className="text-burgundy-light">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
                      <input
                        autoComplete="given-name"
                        className={`${INPUT_CLASS} pl-11 pr-4`}
                        id="first_name"
                        placeholder="Adınız"
                        aria-invalid={Boolean(form.formState.errors.first_name)}
                        {...form.register("first_name")}
                      />
                    </div>
                    {form.formState.errors.first_name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.first_name.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-lg text-label-lg text-primary font-medium"
                      htmlFor="last_name"
                    >
                      Soyadınız <span className="text-burgundy-light">*</span>
                    </label>
                    <div className="relative">
                      <Badge className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
                      <input
                        autoComplete="family-name"
                        className={`${INPUT_CLASS} pl-11 pr-4`}
                        id="last_name"
                        placeholder="Soyadınız"
                        aria-invalid={Boolean(form.formState.errors.last_name)}
                        {...form.register("last_name")}
                      />
                    </div>
                    {form.formState.errors.last_name && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-lg text-label-lg text-primary font-medium"
                    htmlFor="phone"
                  >
                    Telefon / WhatsApp Numarası{" "}
                    <span className="text-burgundy-light">*</span>
                  </label>
                  <Controller
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <PhoneInput
                        autoComplete="tel"
                        id="phone"
                        value={field.value}
                        onChange={field.onChange}
                        aria-invalid={Boolean(form.formState.errors.phone)}
                        selectClassName="w-auto self-stretch rounded-xl border-0 bg-canvas-cream px-3 text-sm font-medium text-primary outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/40"
                        inputClassName="h-auto rounded-xl border-0 bg-canvas-cream px-4 py-3 font-body-md text-body-md text-on-surface outline-none transition-all focus-visible:bg-canvas-pure focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:ring-3 aria-invalid:ring-destructive/20"
                      />
                    )}
                  />
                  <p className="flex items-center gap-1.5">
                    <Phone className="size-3.5 text-accent-gold" />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      Seans Zoom bağlantı linkleri ve acil bildirimler bu
                      numaraya iletilir.
                    </span>
                  </p>
                  {form.formState.errors.phone && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.phone.message}
                    </p>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label
                    className="font-label-lg text-label-lg text-primary font-medium"
                    htmlFor="email"
                  >
                    E-Posta Adresi{" "}
                    <span className="font-normal font-body-sm text-body-sm text-on-surface-variant">
                      (opsiyonel)
                    </span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
                    <input
                      autoComplete="email"
                      className={`${INPUT_CLASS} pl-11 pr-4`}
                      id="email"
                      placeholder="ornek@alanadi.com"
                      type="email"
                      aria-invalid={Boolean(form.formState.errors.email)}
                      {...form.register("email")}
                    />
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Randevu onay ve fatura detayları bu adrese iletilecektir.
                  </span>
                  {form.formState.errors.email && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-lg text-label-lg text-primary font-medium"
                      htmlFor="password"
                    >
                      Şifre Oluşturun <span className="text-burgundy-light">*</span>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
                      <input
                        autoComplete="new-password"
                        className={`${INPUT_CLASS} pl-11 pr-10`}
                        id="password"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        aria-invalid={Boolean(form.formState.errors.password)}
                        {...form.register("password")}
                      />
                      <button
                        aria-label="Şifreyi Göster/Gizle"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors outline-none"
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
                    <div className="flex items-center gap-1 mt-1">
                      {[0, 1, 2, 3].map((index) => (
                        <div
                          key={index}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            password && index < strength
                              ? STRENGTH_BAR_COLORS[strength - 1]
                              : "bg-surface-container"
                          }`}
                        />
                      ))}
                    </div>
                    <span
                      className={`font-body-sm text-body-sm ${strengthInfo.className}`}
                    >
                      {strengthInfo.text}
                    </span>
                    {form.formState.errors.password && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.password.message}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      className="font-label-lg text-label-lg text-primary font-medium"
                      htmlFor="password_confirmation"
                    >
                      Şifre Tekrarı <span className="text-burgundy-light">*</span>
                    </label>
                    <div className="relative">
                      <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
                      <input
                        autoComplete="new-password"
                        className={`${INPUT_CLASS} pl-11 pr-10`}
                        id="password_confirmation"
                        placeholder="••••••••"
                        type={showConfirm ? "text" : "password"}
                        aria-invalid={Boolean(
                          form.formState.errors.password_confirmation
                        )}
                        {...form.register("password_confirmation")}
                      />
                      <button
                        aria-label="Şifreyi Göster/Gizle"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors outline-none"
                        onClick={() => setShowConfirm((current) => !current)}
                        type="button"
                      >
                        {showConfirm ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>
                    {form.formState.errors.password_confirmation && (
                      <p className="text-xs text-destructive">
                        {form.formState.errors.password_confirmation.message}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-3 pt-1">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      className="mt-1 w-4 h-4 rounded accent-primary cursor-pointer"
                      type="checkbox"
                      {...form.register("consent")}
                    />
                    <span className="font-body-sm text-body-sm text-on-surface leading-normal select-none">
                      <Link
                        className="text-primary font-semibold underline underline-offset-2 hover:text-burgundy-light"
                        href="/"
                      >
                        KVKK Aydınlatma Metni
                      </Link>
                      &apos;ni ve Danışan Gizlilik Sözleşmesi&apos;ni okudum,
                      danışan kayıt şartlarını onaylıyorum.{" "}
                      <span className="text-burgundy-light">*</span>
                    </span>
                  </label>
                  {form.formState.errors.consent && (
                    <p className="text-xs text-destructive">
                      {form.formState.errors.consent.message}
                    </p>
                  )}
                </div>
                {form.formState.errors.root && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.root.message}
                  </p>
                )}
                <button
                  className="w-full py-4 px-6 rounded-full bg-primary-container hover:bg-burgundy-light text-on-primary transition-all shadow-md hover:shadow-xl flex items-center justify-center gap-3 font-label-lg text-label-lg uppercase tracking-wider mt-1 disabled:opacity-60 disabled:pointer-events-none"
                  disabled={register.isPending}
                  type="submit"
                >
                  {register.isPending && (
                    <LoaderCircle className="size-4 animate-spin" />
                  )}
                  <span>Danışan Hesabı Oluştur ve Başla</span>
                </button>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="font-body-md text-body-md text-on-surface-variant">
                    Zaten bir hesabınız var mı?
                  </span>
                  <Link
                    className="font-label-lg text-label-lg text-primary hover:text-burgundy-light font-bold underline underline-offset-4"
                    href="/login"
                  >
                    Giriş Yapın
                  </Link>
                </div>
              </form>
              <div className="bg-surface-container-low p-3.5 rounded-lg flex items-center justify-center gap-3 text-center">
                <BadgeCheck className="size-4 text-accent-gold shrink-0" />
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Tüm görüşmeler Türk Psikologlar Derneği ve Uluslararası
                  Danışmanlık Etik Kodları kapsamında mutlak gizlilik
                  altındadır.
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Assurance Highlights Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: Phone,
            title: "Kişisel Asistan Desteği",
            description:
              "Randevu ve planlama süreçlerinizde concierge danışan desteği.",
          },
          {
            icon: Badge,
            title: "Kesintisiz Hibrit Erişim",
            description:
              "Tüm cihazlarınızdan portalınıza ve Zoom seanslarınıza tek tıkla bağlanın.",
          },
          {
            icon: Heart,
            title: "Bütüncül Yaklaşım",
            description:
              "Bilişsel, duygusal ve ilişkisel sağlığınızı destekleyen özel metotlar.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="p-5 bg-canvas-pure rounded-xl shadow-sm flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-full bg-blush-surface flex items-center justify-center text-primary flex-shrink-0">
              <item.icon className="size-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-primary font-serif">
                {item.title}
              </span>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {item.description}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
