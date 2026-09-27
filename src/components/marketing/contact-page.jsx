"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarClock,
  CalendarRange,
  Camera,
  Check,
  ChevronDown,
  CircleAlert,
  CircleCheck,
  Clock,
  CreditCard,
  Info,
  LoaderCircle,
  Lock,
  MailCheck,
  MapPin,
  MessageCircle,
  Music2,
  Navigation,
  PenLine,
  PlayCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Timer,
  Video,
} from "lucide-react";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { cn } from "@/lib/utils";
import { marketingNavLinks } from "@/lib/marketing-nav";
import {
  CONTACT_PREFERENCE_LABELS,
  CONTACT_SUBJECT_OPTIONS,
  useSubmitContactMessage,
} from "@/lib/contact";

const WHATSAPP_URL = "https://wa.me/905061151010";
const WHATSAPP_DISPLAY = "+90 (506) 115 10 10";
const EMAILS = [
  { label: "Seans & Randevu Talebi", address: "randevu@sumeyraaydin.com" },
  { label: "Genel Destek & Akademi", address: "iletisim@sumeyraaydin.com" },
];
const SOCIALS = [
  { icon: Camera, label: "Instagram" },
  { icon: PlayCircle, label: "YouTube" },
  { icon: Music2, label: "Spotify" },
];

function ContactPageShell({ children }) {
  return (
    <div className="theme-velvet bg-canvas-cream font-body-md text-on-surface">
      <SiteHeader links={marketingNavLinks("/iletisim")} />
      <main className="w-full pt-28 bg-canvas-cream">{children}</main>
      <SiteFooter />
    </div>
  );
}

function ContactHero() {
  const trustPills = [
    {
      color: "bg-accent-gold",
      label: "Ortalama 15 Dakika İçinde WhatsApp Dönüşü",
    },
    { color: "bg-primary-container", label: "%100 Gizlilik ve Etik Standartlar" },
    { color: "bg-burgundy-light", label: "Online & Yüz Yüze Görüşme" },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-blush-surface/60 via-canvas-cream to-canvas-cream py-14 lg:py-20 px-4 sm:px-6">
      <div className="absolute -top-24 right-10 w-96 h-96 rounded-full bg-secondary-container/20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-80 h-80 rounded-full bg-accent-gold/10 blur-3xl pointer-events-none" />
      <div className="max-w-[1320px] mx-auto relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-blush-surface text-primary-container font-label-sm text-label-sm uppercase tracking-[0.14em] shadow-sm mb-6">
          <Sparkles className="size-4 text-accent-gold" />
          <span>Bize Ulaşın &amp; İletişim</span>
        </div>
        <h1 className="font-headline-lg text-headline-lg lg:text-display text-primary max-w-4xl tracking-tight mb-6">
          İçsel Dönüşüm Yolculuğunuz İçin Buradayız
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Seans paketleri, online eğitimler, kurumsal atölyeler veya randevu
          süreçleri hakkında her türlü soru ve danışma talebiniz için ekibimizle
          iletişime geçebilirsiniz.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-on-surface-variant font-label-md text-label-md">
          {trustPills.map((pill) => (
            <div className="flex items-center gap-2" key={pill.label}>
              <span className={cn("w-2 h-2 rounded-full", pill.color)} />
              <span>{pill.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function WhatsAppCard() {
  return (
    <div className="rounded-xl bg-primary text-on-primary p-7 lg:p-9 shadow-xl relative overflow-hidden group">
      <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-burgundy-light/40 blur-2xl pointer-events-none" />
      <div className="relative z-10 flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-on-primary/10 text-on-primary font-label-sm text-label-sm">
            <span className="w-2 h-2 rounded-full bg-accent-gold animate-pulse" />
            <span>Canlı Asistan Aktif</span>
          </span>
          <ShieldCheck className="size-7 text-accent-gold" />
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-primary mb-2">
          Doğrudan Danışan WhatsApp Hattı
        </h3>
        <p className="font-body-sm text-body-sm text-outline-variant mb-6 leading-relaxed">
          Özel sorularınız, acil randevu koordinasyonu ve e-kitap erişim
          destekleri için asistanımıza anında bağlanın.
        </p>
        <div className="flex flex-col gap-2.5 p-4 rounded-lg bg-burgundy-light/60 backdrop-blur-sm mb-6">
          <div className="flex items-center justify-between font-label-md text-label-md text-canvas-cream">
            <span className="flex items-center gap-2">
              <Clock className="size-4 text-accent-gold" />
              <span>Çalışma Saatleri:</span>
            </span>
            <span className="font-semibold">09:30 - 18:30</span>
          </div>
          <div className="flex items-center justify-between font-label-md text-label-md text-canvas-cream">
            <span className="flex items-center gap-2">
              <Timer className="size-4 text-accent-gold" />
              <span>Yanıt Hızı:</span>
            </span>
            <span className="text-secondary-fixed">~15 dk içinde</span>
          </div>
        </div>
        <a
          className="inline-flex items-center justify-center gap-3 w-full py-3.5 px-6 rounded-full bg-accent-gold text-tertiary font-label-lg text-label-lg font-bold shadow-md hover:bg-tertiary-fixed transition-all group-hover:shadow-lg"
          href={WHATSAPP_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          <MessageCircle className="size-5" />
          <span>{WHATSAPP_DISPLAY}</span>
          <ArrowRight />
        </a>
      </div>
    </div>
  );
}

function EmailCard() {
  return (
    <div className="rounded-xl bg-canvas-pure p-7 lg:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-blush-surface text-primary-container flex items-center justify-center">
          <MailCheck className="size-5" />
        </div>
        <div>
          <h4 className="font-title-lg text-title-lg text-primary">
            E-Posta İletişimi
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Detaylı sorularınız ve resmi başvurularınız için
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        {EMAILS.map((email) => (
          <a
            className="p-4 rounded-lg bg-surface-container-low hover:bg-blush-surface/50 transition-colors flex items-center justify-between group"
            href={`mailto:${email.address}`}
            key={email.address}
          >
            <div className="flex flex-col min-w-0">
              <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                {email.label}
              </span>
              <span className="font-title-md text-title-md text-primary font-semibold truncate">
                {email.address}
              </span>
            </div>
            <ArrowRight className="size-4 text-on-surface-variant group-hover:text-primary-container shrink-0 transition-transform group-hover:translate-x-1" />
          </a>
        ))}
      </div>
    </div>
  );
}

function OfficeCard() {
  return (
    <div className="rounded-xl bg-canvas-pure p-7 lg:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blush-surface text-primary-container flex items-center justify-center">
          <Building2 className="size-5" />
        </div>
        <div>
          <h4 className="font-title-lg text-title-lg text-primary">
            Ofis &amp; Danışmanlık Merkezi
          </h4>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Yüz Yüze Görüşmeler Randevu İle
          </p>
        </div>
      </div>
      <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed mb-4">
        Levent Loft &amp; Danışmanlık Ofisi, Büyükdere Cad. No: 195, Levent /
        Beşiktaş, İstanbul
      </p>
      <div className="p-3.5 rounded-lg bg-blush-surface text-on-secondary-container font-body-sm text-body-sm flex items-start gap-2.5">
        <Info className="size-4.5 text-primary-container flex-shrink-0 mt-0.5" />
        <span>
          Önemli: Bireysel seanslarımız öncelikli olarak Zoom ve Google Meet
          üzerinden online gerçekleşmektedir. Yüz yüze seanslar kontenjanla
          sınırlı olup ön onay gerektirir.
        </span>
      </div>
      <div className="mt-6 pt-6 flex flex-col gap-3">
        <span className="font-label-sm text-label-sm text-secondary uppercase tracking-widest">
          İlham Kanalları &amp; Sosyal Medya
        </span>
        <div className="grid grid-cols-3 gap-3">
          {SOCIALS.map((social) => (
            <a
              className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-surface-container-low text-primary-container hover:bg-blush-surface font-label-md text-label-md transition-colors"
              href="#"
              key={social.label}
            >
              <social.icon className="size-4" />
              <span>{social.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrivacyCard() {
  return (
    <div className="rounded-xl bg-surface-container-low p-5 flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-accent-gold/20 text-tertiary flex items-center justify-center flex-shrink-0">
        <ShieldCheck className="size-5" />
      </div>
      <div className="flex flex-col">
        <span className="font-title-md text-title-md text-primary font-semibold">
          Gizlilik &amp; KVKK Taahhüdü
        </span>
        <span className="font-body-sm text-body-sm text-on-surface-variant">
          Tüm mesajlarınız ve seans notlarınız 256-Bit SSL şifrelemeyle kesinlikle
          3. şahıslarla paylaşılmaz.
        </span>
      </div>
    </div>
  );
}

const INPUT_CLASS =
  "w-full h-12 px-4 rounded-lg bg-canvas-cream text-on-surface font-body-md text-body-md focus:outline-none focus:bg-canvas-pure shadow-inner transition-colors";

function ContactForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [contactPref, setContactPref] = useState("whatsapp");
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const mutation = useSubmitContactMessage();

  const handleSubmit = (event) => {
    event.preventDefault();
    setFieldErrors({});
    setError("");

    const nextErrors = {};
    if (!name.trim()) nextErrors.name = "Adınız ve soyadınız zorunludur";
    if (!phone.trim()) nextErrors.phone = "Telefon numarası zorunludur";
    if (!email.trim()) nextErrors.email = "E-posta adresi zorunludur";
    if (!subject) nextErrors.subject = "Lütfen bir konu seçiniz";
    if (!message.trim()) nextErrors.message = "Mesajınız zorunludur";
    if (email.trim() && !/^\S+@\S+\.\S+$/.test(email.trim())) {
      nextErrors.email = "Geçerli bir e-posta adresi girin";
    }
    if (!kvkkAccepted) {
      nextErrors.kvkk = "KVKK aydınlatma metnini onaylamanız gerekiyor";
    }
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    const subjectLabel =
      CONTACT_SUBJECT_OPTIONS.find((option) => option.value === subject)?.label ??
      subject;

    mutation.mutate(
      {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
        subject: `${subjectLabel} • Dönüş tercihi: ${CONTACT_PREFERENCE_LABELS[contactPref]}`,
        message: message.trim(),
      },
      {
        onSuccess: () => {
          setName("");
          setPhone("");
          setEmail("");
          setSubject("");
          setMessage("");
          setContactPref("whatsapp");
          setKvkkAccepted(false);
          setSuccess(true);
        },
        onError: (mutationError) => {
          const mapped = {};
          for (const [field, messages] of Object.entries(
            mutationError.errors ?? {}
          )) {
            mapped[field] = Array.isArray(messages) ? messages[0] : messages;
          }
          setFieldErrors(mapped);
          if (
            !mutationError.errors ||
            Object.keys(mutationError.errors).length === 0
          ) {
            setError(mutationError.message ?? "Mesaj gönderilemedi");
          }
        },
      }
    );
  };

  return (
    <div className="rounded-xl bg-canvas-pure p-8 lg:p-12 shadow-xl relative">
      <div className="flex flex-col mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-headline-md text-headline-md text-primary">
            Bize Mesaj Bırakın
          </h2>
          <PenLine className="size-6 text-accent-gold" />
        </div>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Formu doldurduktan sonra danışan koordinatörümüz 2 saat içerisinde
          sizinle doğrudan iletişime geçecektir.
        </p>
      </div>
      <form className="flex flex-col gap-6" noValidate onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-label-lg text-label-lg text-on-surface font-medium" htmlFor="contact_name">
              Adınız &amp; Soyadınız *
            </label>
            <input
              className="w-full h-12 px-4 rounded-lg bg-canvas-cream text-on-surface font-body-md text-body-md focus:outline-none focus:bg-canvas-pure shadow-inner transition-colors"
              id="contact_name"
              onChange={(event) => setName(event.target.value)}
              placeholder="Örn: Ayşe Yılmaz"
              type="text"
              value={name}
            />
            {fieldErrors.name && (
              <p className="text-xs text-error">{fieldErrors.name}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-lg text-label-lg text-on-surface font-medium" htmlFor="contact_phone">
              Telefon / WhatsApp Numarası *
            </label>
            <input
              className="w-full h-12 px-4 rounded-lg bg-canvas-cream text-on-surface font-body-md text-body-md focus:outline-none focus:bg-canvas-pure shadow-inner transition-colors"
              id="contact_phone"
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+90 (5XX) XXX XX XX"
              type="tel"
              value={phone}
            />
            {fieldErrors.phone && (
              <p className="text-xs text-error">{fieldErrors.phone}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="font-label-lg text-label-lg text-on-surface font-medium" htmlFor="contact_email">
              E-Posta Adresiniz *
            </label>
            <input
              className="w-full h-12 px-4 rounded-lg bg-canvas-cream text-on-surface font-body-md text-body-md focus:outline-none focus:bg-canvas-pure shadow-inner transition-colors"
              id="contact_email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="isim@domain.com"
              type="email"
              value={email}
            />
            {fieldErrors.email && (
              <p className="text-xs text-error">{fieldErrors.email}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-label-lg text-label-lg text-on-surface font-medium" htmlFor="contact_subject">
              İlgilendiğiniz Alan / Konu *
            </label>
            <div className="relative">
              <select
                className="w-full h-12 px-4 rounded-lg bg-canvas-cream text-on-surface font-body-md text-body-md focus:outline-none focus:bg-canvas-pure shadow-inner appearance-none transition-colors"
                id="contact_subject"
                onChange={(event) => setSubject(event.target.value)}
                value={subject}
              >
                <option disabled value="">
                  Lütfen bir konu seçiniz
                </option>
                {CONTACT_SUBJECT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-3.5 pointer-events-none text-on-surface-variant size-5" />
            </div>
            {fieldErrors.subject && (
              <p className="text-xs text-error">{fieldErrors.subject}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-label-lg text-label-lg text-on-surface font-medium" htmlFor="contact_message">
            Mesajınız &amp; Sorunuz *
          </label>
          <textarea
            className="w-full p-4 rounded-lg bg-canvas-cream text-on-surface font-body-md text-body-md focus:outline-none focus:bg-canvas-pure shadow-inner resize-y transition-colors"
            id="contact_message"
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Hangi konuda rehberliğe ihtiyaç duyduğunuzu, varsa daha önceki deneyimlerinizi veya sormak istediğiniz soruları kısaca özetleyebilirsiniz..."
            rows={4}
            value={message}
          />
          {fieldErrors.message && (
            <p className="text-xs text-error">{fieldErrors.message}</p>
          )}
        </div>
        <div className="flex flex-col gap-3">
          <span className="font-label-lg text-label-lg text-on-surface font-medium">
            Size Hangi Kanaldan Dönüş Yapmamızı İstersiniz?
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(CONTACT_PREFERENCE_LABELS).map(([value, label]) => (
              <label
                className="flex items-center gap-3 p-3.5 rounded-lg bg-surface-container-low cursor-pointer hover:bg-blush-surface/50 transition-colors"
                key={value}
              >
                <input
                  checked={contactPref === value}
                  className="w-4 h-4 text-primary-container focus:ring-0 accent-primary-container"
                  name="contact_pref"
                  onChange={(event) => setContactPref(event.target.value)}
                  type="radio"
                  value={value}
                />
                <span className="font-body-sm text-body-sm text-on-surface font-medium">
                  {label}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-3 mt-2">
          <input
            checked={kvkkAccepted}
            className="mt-1 w-4 h-4 text-primary-container rounded focus:ring-0 accent-primary-container cursor-pointer"
            id="contact_kvkk"
            onChange={(event) => setKvkkAccepted(event.target.checked)}
            type="checkbox"
          />
          <label className="font-body-sm text-body-sm text-on-surface-variant cursor-pointer" htmlFor="contact_kvkk">
            <span>Kişisel verilerimin işlenmesine ilişkin </span>
            <Link
              className="text-primary-container font-semibold underline underline-offset-2 hover:text-burgundy-light"
              href="/kvkk-aydinlatma-metni"
            >
              KVKK Aydınlatma Metni
            </Link>
            <span>
              &apos;ni okudum, iletişim talebimin yerine getirilmesi amacıyla
              kaydedilmesini onaylıyorum.
            </span>
          </label>
        </div>
        {fieldErrors.kvkk && (
          <p className="text-xs text-error">{fieldErrors.kvkk}</p>
        )}
        {error && <p className="text-sm text-error">{error}</p>}
        {success && (
          <div className="p-4 rounded-lg bg-blush-surface text-primary-container font-body-md text-body-md flex items-center gap-3">
            <CircleCheck className="size-5 text-accent-gold" />
            <span>
              Mesajınız başarıyla iletildi. Koordinatörümüz en geç 2 saat içinde
              belirttiğiniz kanaldan size ulaşacaktır.
            </span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-2">
          <button
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg shadow-lg hover:bg-burgundy-light transition-all disabled:opacity-60"
            disabled={mutation.isPending}
            type="submit"
          >
            {mutation.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}
            <span>{mutation.isPending ? "Gönderiliyor..." : "Mesajı Gönder"}</span>
            <Send className="size-4" />
          </button>
          <div className="flex items-center gap-2 text-on-surface-variant font-label-sm text-label-sm">
            <Lock className="size-4 text-accent-gold" />
            <span>256-Bit SSL Korumalı Form</span>
          </div>
        </div>
      </form>
      <div className="mt-8 rounded-xl bg-blush-surface/70 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary flex items-center justify-center flex-shrink-0">
            <CalendarClock className="size-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-title-md text-primary font-semibold">
              Doğrudan Takvimden Gün ve Saat Seçmek İster misiniz?
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Form doldurmadan doğrudan uygun seans aralıklarını
              listeleyebilirsiniz.
            </span>
          </div>
        </div>
        <Link
          className="whitespace-nowrap px-6 py-2.5 rounded-full bg-canvas-pure text-primary-container font-label-md text-label-md font-semibold shadow-sm hover:bg-blush-hover transition-colors"
          href="/dashboard/randevu-al"
        >
          Online Takvim
        </Link>
      </div>
    </div>
  );
}

function FaqSection() {
  const faqs = [
    {
      icon: Video,
      title: "Seanslar nasıl gerçekleşiyor?",
      description:
        "Bireysel ve çift seanslarımız şifreli ve yüksek çözünürlüklü Zoom platformu üzerinden canlı olarak yürütülür. Dünyanın veya Türkiye'nin neresinde olursanız olun rahatlığınız bozulmadan katılabilirsiniz.",
      note: "Uluslararası Katılıma Açık",
    },
    {
      icon: CalendarRange,
      title: "Randevumu erteleyebilir miyim?",
      description:
        "Planlarınız değiştiğinde, seans saatinden en az 24 saat önce asistanımıza bilgi vererek seansınızı dilediğiniz bir sonraki uygun takvim tarihine herhangi bir ek ücret olmaksızın erteleyebilirsiniz.",
      note: "24 Saat Öncesine Kadar Ücretsiz",
    },
    {
      icon: CreditCard,
      title: "Yurt dışından ödeme yapabilir miyim?",
      description:
        "Evet. İyziCo 256-Bit SSL güvencesiyle Visa, Mastercard, AMEX ve Troy logolu tüm yerli ve yabancı kredi/banka kartlarıyla döviz veya TL cinsinden tek çekim veya taksitli ödeme yapabilirsiniz.",
      note: "Tüm Dünya Kartları Geçerli",
    },
  ];

  return (
    <div className="w-full bg-canvas-pure py-16 px-4 sm:px-6 shadow-sm">
      <div className="max-w-[1320px] mx-auto">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="font-label-sm text-label-sm text-accent-gold uppercase tracking-[0.2em] mb-2 font-bold">
            MERAK EDİLENLER
          </span>
          <h3 className="font-headline-md text-headline-md text-primary">
            Sıkça Sorulan Sorular
          </h3>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-xl mt-2">
            Danışmanlık ve eğitim süreçlerine başlamadan önce danışanlarımızın
            en çok merak ettiği ayrıntılar.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {faqs.map((faq) => (
            <div
              className="p-8 rounded-xl bg-canvas-cream flex flex-col justify-between"
              key={faq.title}
            >
              <div>
                <div className="w-10 h-10 rounded-full bg-blush-surface text-primary-container flex items-center justify-center mb-5">
                  <faq.icon className="size-5" />
                </div>
                <h4 className="font-title-lg text-title-lg text-primary font-semibold mb-3">
                  {faq.title}
                </h4>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {faq.description}
                </p>
              </div>
              <div className="mt-6 pt-4 flex items-center gap-2 font-label-md text-label-md text-secondary">
                <Check className="size-4 text-accent-gold" />
                <span>{faq.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapBanner() {
  return (
    <div className="max-w-[1320px] mx-auto px-4 sm:px-6 py-16 w-full">
      <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gradient-to-br from-primary via-burgundy-light/70 to-primary h-[320px] sm:h-[420px]">
        <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 right-6 lg:left-10 lg:right-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
          <div className="flex flex-col text-on-primary max-w-xl">
            <div className="flex items-center gap-2 mb-1.5 font-label-sm text-label-sm uppercase tracking-wider text-accent-gold">
              <MapPin className="size-4" />
              <span>İstanbul Merkez Ofis</span>
            </div>
            <h4 className="font-headline-sm text-headline-sm text-on-primary mb-1">
              Levent Danışmanlık ve Yönetim Ofisi
            </h4>
            <p className="font-body-sm text-body-sm text-surface-container-high">
              Büyükdere Caddesi No: 195, Levent Loft Residence, Kat: 8, Levent
              / Beşiktaş, İstanbul
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-canvas-pure text-primary-container font-label-md text-label-md font-bold shadow-md hover:bg-blush-surface transition-colors"
              href="https://maps.google.com/?q=Levent+Loft+Istanbul"
              rel="noopener noreferrer"
              target="_blank"
            >
              <Navigation className="size-4" />
              <span>Yol Tarifi Al</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContactPage() {
  return (
    <ContactPageShell>
      <ContactHero />
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 -mt-4 mb-20 w-full relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <WhatsAppCard />
            <EmailCard />
            <OfficeCard />
            <PrivacyCard />
          </div>
          <div className="lg:col-span-7">
            <ContactForm />
          </div>
        </div>
      </div>
      <FaqSection />
      <MapBanner />
    </ContactPageShell>
  );
}
