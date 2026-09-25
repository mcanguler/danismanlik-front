import {
  Briefcase,
  Calendar,
  CalendarClock,
  CalendarDays,
  CalendarOff,
  CalendarPlus,
  CalendarX,
  Clock,
  Coffee,
  CreditCard,
  FolderTree,
  GraduationCap,
  HeartHandshake,
  Home,
  LayoutDashboard,
  ListTree,
  Mail,
  Package,
  PackageOpen,
  ReceiptText,
  Settings, ShoppingBag,
  ShoppingCart,
  Store,
  Tags,
  User,
  UserCog,
  Users,
  FileText,
} from "lucide-react";
import { ROLES, ROLE_HOME } from "./auth";

export const ROLE_SLUGS = {
  admin: ROLES.ADMIN,
  consultant: ROLES.CONSULTANT,
  customer: ROLES.CUSTOMER,
};

export const NAV = {
  [ROLES.ADMIN]: [
    { label: "Dashboard", href: "/dashboard/admin", icon: LayoutDashboard, bottom: true },
    { label: "Randevular", href: "/appointments", icon: CalendarDays, bottom: true },
    {
      label: "Danışmanlık Sistemleri",
      icon: HeartHandshake,
      children: [
        {
          label: "Danışmanlar",
          href: "/dashboard/admin/danismanlar",
          icon: UserCog,
        },
        {
          label: "Müşteriler",
          href: "/dashboard/admin/musteriler",
          icon: Users,
          bottom: true,
        },
        { label: "Hizmetler", href: "/dashboard/admin/hizmetler", icon: Briefcase },
        {
          label: "Hizmet Kategorileri",
          href: "/dashboard/admin/hizmet-kategorileri",
          icon: Tags,
        },
        {
          label: "Danışman Hizmetleri",
          href: "/dashboard/admin/danisman-hizmetleri",
          icon: CalendarClock,
        },
      ],
    },
    {
      label: "Takvim & Zaman",
      icon: Calendar,
      children: [
        { label: "Takvim", href: "/takvim", icon: CalendarDays },
        {
          label: "Çalışma Saatleri",
          href: "/dashboard/admin/calisma-saatleri",
          icon: Clock,
        },
        { label: "Molalar", href: "/dashboard/admin/molalar", icon: Coffee },
        {
          label: "Bloklu Zamanlar",
          href: "/dashboard/admin/bloklu-zamanlar",
          icon: CalendarX,
        },
      ],
    },
    {
      label: "Paketler & Satış",
      icon: Package,
      children: [
        { label: "Paketler", href: "/dashboard/admin/paketler", icon: PackageOpen },
        {
          label: "Paket Kategorileri",
          href: "/dashboard/admin/paket-kategorileri",
          icon: FolderTree,
        },
        {
          label: "Paket Satın Alımları",
          href: "/dashboard/admin/paket-satin-alimlari",
          icon: ReceiptText,
        },
      ],
    },
    {
      label: "Mağaza & Eğitim",
      icon: Store,
      children: [
        { label: "Ürünler", href: "/dashboard/admin/urunler", icon: ShoppingBag },
        {
          label: "Ürün Kategorileri",
          href: "/dashboard/admin/urun-kategorileri",
          icon: Tags,
        },
        {
          label: "Siparişler",
          href: "/dashboard/admin/siparisler",
          icon: ShoppingCart,
        },
        { label: "Kurslar", href: "/dashboard/admin/kurslar", icon: GraduationCap },
      ],
    },
    { label: "Ödemeler", href: "/dashboard/admin/odemeler", icon: CreditCard },
    {
      label: "İletişim Formları",
      href: "/dashboard/admin/iletisim-formlari",
      icon: Mail,
      bottom: true,
    },
    {
      label: "İçerik",
      icon: FileText,
      children: [
        { label: "Sayfalar", href: "/dashboard/admin/sayfalar", icon: FileText },
        { label: "Menüler", href: "/dashboard/admin/menuler", icon: ListTree },
      ],
    },
    { label: "Ayarlar", href: "/dashboard/admin/ayarlar", icon: Settings, bottom: true },
  ],
  [ROLES.CONSULTANT]: [
    { label: "Dashboard", href: "/dashboard/consultant", icon: LayoutDashboard, bottom: true },
    { label: "Takvim", href: "/takvim", icon: Calendar, bottom: true },
    { label: "Randevular", href: "/appointments", icon: CalendarDays, bottom: true },
    { label: "Çalışma Saatleri", href: "/dashboard/consultant/calisma-saatleri", icon: Clock },
    { label: "Molalar", href: "/dashboard/consultant/molalar", icon: Coffee },
    { label: "Kapalı Zamanlar", href: "/dashboard/consultant/kapali-zamanlar", icon: CalendarOff },
    { label: "Hizmetlerim", href: "/dashboard/consultant/hizmetlerim", icon: Briefcase },
    { label: "Profil", href: "/dashboard/consultant/profil", icon: User, bottom: true },
  ],
  [ROLES.CUSTOMER]: [
    { label: "Ana Sayfa", href: "/dashboard/customer", icon: Home, bottom: true },
    {
      label: "Randevu Al",
      href: "/hizmetler",
      icon: CalendarPlus,
      bottom: true,
    },
    {
      label: "Randevular & Takvim",
      href: "/appointments",
      icon: CalendarDays,
      bottom: true,
    },
    {
      label: "Seans Paketlerim",
      href: "/dashboard/customer/paketlerim",
      icon: Package,
    },
    { label: "Mağaza", href: "/urunler", icon: Store, bottom: true },
    { label: "Siparişlerim", href: "/dashboard/customer/siparislerim", icon: ShoppingCart },
    { label: "Eğitimlerim", href: "/dashboard/egitimlerim", icon: GraduationCap },
    {
      label: "Profilim & Bilgilerim",
      href: "/dashboard/customer/profil",
      icon: User,
      bottom: true,
    },
  ],
};

export function flattenNavItems(items) {
  return items.flatMap((item) => (item.children ? item.children : [item]));
}

export function getNav(role) {
  return NAV[role] ?? [];
}

export function getBottomNav(role) {
  return flattenNavItems(getNav(role)).filter((item) => item.bottom);
}

export function findModule(role, moduleSlug) {
  const base = ROLE_HOME[role];
  if (!base) return null;
  return (
    flattenNavItems(getNav(role)).find(
      (item) => item.href === `${base}/${moduleSlug}`
    ) ?? null
  );
}
