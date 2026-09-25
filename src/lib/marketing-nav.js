export const MARKETING_NAV_LINKS = [
  { label: "Anasayfa", href: "/" },
  { label: "Hakkımda", href: "#hakkimda" },
  { label: "Eğitimler", href: "/egitimler" },
  { label: "E-Kitaplar", href: "#e-kitaplar", dropdown: true },
  { label: "Atölyeler", href: "#" },
  {
    label: "1e1 Seanslar",
    href: "/hizmetler",
    dropdown: true,
    dropdownSource: "service-categories",
  },
  { label: "Paketler", href: "/paketler" },
  { label: "Soru Danışmanlığı", href: "#soru-danismanligi" },
  { label: "İletişim", href: "#" },
];

export function marketingNavLinks(activeHref) {
  return MARKETING_NAV_LINKS.map((link) => ({
    ...link,
    active: activeHref !== undefined && link.href === activeHref,
  }));
}

export const PORTAL_NAV_LINKS = [
  { label: "Anasayfa", href: "/" },
  {
    label: "1e1 Seanslar",
    href: "/hizmetler",
    dropdown: true,
    dropdownSource: "service-categories",
  },
  { label: "Paketler", href: "/paketler" },
  { label: "Danışan Portalı", href: "/dashboard/customer" },
];

export function portalNavLinks(activeHref) {
  return PORTAL_NAV_LINKS.map((link) => ({
    ...link,
    active:
      activeHref === link.href ||
      (link.href !== "/" && activeHref?.startsWith(link.href)),
  }));
}
