import Image from "next/image";
import {
  Phone,
  ChevronRight,
  FileText,
  Gavel,
  Camera,
  Mail,
  MessageCircle,
  Podcast,
  RotateCcw,
  Clock,
  ShieldCheck,
  CirclePlay,
} from "lucide-react";

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida/AEtjO1WmgOiNUjaiKAyx9E7v0c1TiacEOf9Ez9UIoiWtd_wu5jvZxJQkt8tgqP_1af1X7-Dq0EwBfRcJN1dVN4feUAM4OLHX21QPzTrembPsErT974fcokn2vtB79K9-ykrYd6AqJJDHa0STeq52b_josAFx-YABLqEprjUcJFEgNZ7WPTHG_XrOPUggI1lMcTBFl29nh55qk4MnTXdlVybvkd-PPE97N01i9a5AgA7WLKsp_pYadDtSCgI8oJ4";

const QUICK_LINKS = [
  { label: "1e1 Seanslar", href: "#seanslar" },
  { label: "Soru Danışmanlığı", href: "#soru-danismanligi" },
  { label: "E-Kitaplar", href: "#e-kitaplar" },
  { label: "Online Eğitimler", href: "#egitimler" },
  { label: "Sümeyra Aydın Kimdir?", href: "#hakkimda" },
];

const LEGAL_LINKS = [
  {
    label: "KVKK Aydınlatma Metni",
    slug: "kvkk-aydinlatma-metni",
    icon: Gavel,
  },
  {
    label: "Mesafeli Satış Sözleşmesi",
    slug: "mesafeli-satis-sozlesmesi",
    icon: FileText,
  },
  {
    label: "Gizlilik & Çerez Politikası",
    slug: "gizlilik-cerez-politikasi",
    icon: ShieldCheck,
  },
  {
    label: "İptal ve İade Koşulları",
    slug: "iptal-ve-iade-kosullari",
    icon: RotateCcw,
  },
];

const SOCIAL_LINKS = [
  { label: "Instagram", icon: Camera },
  { label: "YouTube", icon: CirclePlay },
  { label: "Podcast", icon: Podcast },
  { label: "Telefon", icon: Phone },
];

export function SiteFooter() {
  return (
    <footer className="w-full bg-canvas-pure text-on-surface shadow-[0_-4px_24px_rgba(92,29,36,0.03)]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-4">
              <span className="font-headline-sm text-headline-sm text-primary font-semibold">
                Sümeyra Aydın
              </span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant leading-relaxed mb-6">
              Bireysel dönüşüm, dişil enerji farkındalığı ve ilişkilerde kalıcı
              uyum üzerine bilimsel ve sezgisel rehberlik sunan seçkin gelişim
              akademisi.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label }) => (
                <a
                  key={label}
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-blush-surface text-primary-container flex items-center justify-center hover:bg-blush-hover hover:text-burgundy-light transition-colors"
                  href="#"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          <div className="flex flex-col">
            <h3 className="font-title-md text-title-md text-primary font-semibold mb-4 tracking-tight">
              Hızlı Erişim
            </h3>
            <ul className="flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
              {QUICK_LINKS.map((link) => (
                <li key={link.label} className="flex items-center gap-2">
                  <ChevronRight className="text-accent-gold size-4 shrink-0" />
                  <a className="hover:text-primary-container transition-colors" href={link.href}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col">
            <h3 className="font-title-md text-title-md text-primary font-semibold mb-4 tracking-tight">
              Kurumsal &amp; Yasal
            </h3>
            <ul className="flex flex-col gap-2.5 font-body-sm text-body-sm text-on-surface-variant">
              {LEGAL_LINKS.map(({ icon: Icon, label, slug }) => (
                <li key={label} className="flex items-center gap-2">
                  <Icon className="text-accent-gold size-4 shrink-0" />
                  <a
                    className="hover:text-primary-container transition-colors"
                    href={`/${slug}`}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col">
            <h3 className="font-title-md text-title-md text-primary font-semibold mb-4 tracking-tight">
              İletişim &amp; Destek
            </h3>
            <div className="flex flex-col gap-3 font-body-sm text-body-sm text-on-surface-variant mb-5">
              <div className="flex items-start gap-2">
                <Phone className="text-primary-container size-[18px] shrink-0" />
                <span>+90 (506) 115 10 10</span>
              </div>
              <div className="flex items-start gap-2">
                <Mail className="text-primary-container size-[18px] shrink-0" />
                <span>iletisim@sumeyraaydin.com</span>
              </div>
              <div className="flex items-start gap-2">
                <Clock className="text-primary-container size-[18px] shrink-0" />
                <span>Hafta İçi: 09:30 - 18:30</span>
              </div>
            </div>
            <a
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-blush-surface text-primary-container font-label-md text-label-md hover:bg-blush-hover hover:text-burgundy-light transition-colors"
              href="#"
            >
              <MessageCircle className="size-[18px]" />
              <span>WhatsApp Destek Hattı</span>
            </a>
          </div>
        </div>
        <div className="mt-12 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-on-surface-variant font-body-sm text-body-sm">
          <p className="text-center md:text-left">
            © 2026 Sümeyra Aydın Danışmanlık &amp; Akademi. Tüm Hakları
            Saklıdır.
          </p>
          <div className="flex items-center gap-3 font-label-sm text-label-sm text-secondary">
            <span className="px-2 py-1 rounded bg-canvas-cream">Mastercard</span>
            <span className="px-2 py-1 rounded bg-canvas-cream">Visa</span>
            <span className="px-2 py-1 rounded bg-canvas-cream">Troy</span>
            <span className="px-2 py-1 rounded bg-canvas-cream">İyziCo 256-Bit SSL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}