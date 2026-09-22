"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarPlus,
  ChevronDown,
  LogOut,
  MessageCircle,
  Search,
  ShoppingBag,
  Sparkles,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePublicServiceCategoriesQuery } from "@/lib/service-categories";

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida/AEtjO1WmgOiNUjaiKAyx9E7v0c1TiacEOf9Ez9UIoiWtd_wu5jvZxJQkt8tgqP_1af1X7-Dq0EwBfRcJN1dVN4feUAM4OLHX21QPzTrembPsErT974fcokn2vtB79K9-ykrYd6AqJJDHa0STeq52b_josAFx-YABLqEprjUcJFEgNZ7WPTHG_XrOPUggI1lMcTBFl29nh55qk4MnTXdlVybvkd-PPE97N01i9a5AgA7WLKsp_pYadDtSCgI8oJ4";

export function SiteHeader({
  links = [],
  accountHref = "/login",
  accountName,
  onAccountLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const needsCategoryDropdown = links.some(
    (link) => link.dropdown && link.dropdownSource === "service-categories"
  );
  const categoriesQuery = usePublicServiceCategoriesQuery(
    {},
    { enabled: needsCategoryDropdown }
  );

  const categories = useMemo(
    () =>
      (categoriesQuery.data ?? [])
        .filter((category) => category.is_active)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [categoriesQuery.data]
  );

  const categoryHref = (category) =>
    `/hizmetler/${category.slug || category.id}`;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="w-full bg-blush-surface text-on-secondary-container px-4 py-2 shadow-[0_1px_4px_rgba(92,29,36,0.04)]">
        <div className="max-w-[1320px] mx-auto flex items-center justify-between font-label-md text-label-md">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="size-4 shrink-0 text-accent-gold" />
            <span className="truncate">
              ✨ Yeni Çıkan E-Kitaplarda %50 Lansman İndirimi! Kod:{" "}
              <strong className="text-primary-container font-semibold tracking-wider">
                DISIL50
              </strong>
            </span>
          </div>
          <div className="hidden lg:flex items-center gap-6 shrink-0">
            <a
              className="flex items-center gap-1.5 text-on-secondary-container hover:text-primary-container transition-colors"
              href="#"
            >
              <MessageCircle className="size-4" />
              <span>WhatsApp Danışma Hattı</span>
            </a>
            <span className="text-outline-variant">|</span>
            <span className="text-on-surface-variant font-body-sm text-body-sm">
              Hafta İçi 09:30 - 18:30
            </span>
          </div>
        </div>
      </div>
      <header className="w-full bg-canvas-pure/90 backdrop-blur-md shadow-[0_4px_24px_rgba(92,29,36,0.04)]">
        <div className="h-20 max-w-[1320px] mx-auto px-4 sm:px-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 flex-shrink-0">
            <Link className="flex flex-col" href="/">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-semibold">
                Sümeyra Aydın
              </span>
              <span className="font-label-sm text-label-sm tracking-[0.18em] uppercase text-secondary font-medium">
                Akademi &amp; Danışmanlık
              </span>
            </Link>
          </div>
          <nav className="hidden xl:flex items-center gap-5">
            {links.map((link) => {
              const linkClassName = cn(
                "py-1 transition-colors font-label-lg text-label-lg inline-flex items-center gap-1",
                link.active
                  ? "text-primary-container font-semibold"
                  : "text-on-surface-variant hover:text-primary-container"
              );
              if (link.dropdown) {
                return (
                  <div key={link.href} className="relative group">
                    <a className={linkClassName} href={link.href}>
                      {link.label}
                      <ChevronDown className="size-4 transition-transform duration-200 group-hover:rotate-180" />
                    </a>
                    {link.dropdownSource === "service-categories" && (
                      <div className="invisible absolute left-0 top-full z-50 translate-y-1 pt-2 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                        <div className="min-w-[260px] rounded-2xl bg-canvas-pure py-2 shadow-[0_24px_48px_rgba(92,29,36,0.14)] ring-1 ring-border-delicate">
                          {categoriesQuery.isPending ? (
                            <p className="px-4 py-2.5 font-body-sm text-body-sm text-on-surface-variant">
                              Yükleniyor...
                            </p>
                          ) : categoriesQuery.isError ? (
                            <p className="px-4 py-2.5 font-body-sm text-body-sm text-on-surface-variant">
                              Kategoriler yüklenemedi
                            </p>
                          ) : categories.length === 0 ? (
                            <p className="px-4 py-2.5 font-body-sm text-body-sm text-on-surface-variant">
                              Henüz kategori bulunmuyor
                            </p>
                          ) : (
                            <>
                              {categories.map((category) => (
                                <Link
                                  key={category.id}
                                  className="block px-4 py-2.5 font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-blush-surface hover:text-primary-container"
                                  href={categoryHref(category)}
                                >
                                  {category.name}
                                </Link>
                              ))}
                              <Link
                                className="mt-1 block border-t border-border-delicate px-4 py-2.5 font-label-lg text-label-lg font-semibold text-primary-container transition-colors hover:bg-blush-surface"
                                href="/hizmetler"
                              >
                                Tüm 1e1 Seanslar
                              </Link>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              return (
                <a
                  key={link.href}
                  aria-current={link.active ? "page" : undefined}
                  className={linkClassName}
                  href={link.href}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button
              className="relative w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:text-primary-container hover:bg-blush-surface transition-colors"
              type="button"
              aria-label="Sepet"
            >
              <ShoppingBag className="size-5" />
              <span className="absolute -top-1 -right-1 bg-accent-gold text-tertiary font-label-sm text-label-sm font-bold w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-canvas-pure">
                2
              </span>
            </button>
            {accountName ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Link
                  className="hidden sm:flex h-9 items-center gap-2 rounded-full bg-blush-surface px-3 text-primary transition-colors hover:bg-blush-hover"
                  href={accountHref}
                >
                  <User className="size-4" />
                  <span className="max-w-[160px] truncate font-label-md text-label-md font-semibold">
                    {accountName}
                  </span>
                </Link>
                {onAccountLogout && (
                  <button
                    className="flex size-9 items-center justify-center rounded-full text-primary transition-colors hover:bg-blush-surface"
                    type="button"
                    aria-label="Çıkış Yap"
                    title="Çıkış Yap"
                    onClick={onAccountLogout}
                  >
                    <LogOut className="size-4" />
                  </button>
                )}
              </div>
            ) : (
              <Link
                className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center hover:bg-burgundy-light transition-colors"
                href={accountHref}
                aria-label="Giriş Yap"
              >
                <User className="size-4" />
              </Link>
            )}
            <button
              className="xl:hidden w-9 h-9 rounded-full flex items-center justify-center text-primary hover:bg-blush-surface transition-colors"
              type="button"
              aria-label="Menüyü aç"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? (
                <X className="size-5" />
              ) : (
                <svg
                  className="size-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="xl:hidden border-t border-border-delicate bg-canvas-pure px-4 pb-6 pt-2 shadow-[0_12px_32px_rgba(92,29,36,0.08)]">
            <nav className="flex flex-col">
              {links.map((link) => (
                <div
                  key={link.label}
                  className="border-b border-border-delicate"
                >
                  <a
                    className={cn(
                      "py-3 font-label-lg text-label-lg",
                      link.active
                        ? "text-primary-container font-semibold"
                        : "text-on-surface-variant hover:text-primary-container"
                    )}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </a>
                  {link.dropdownSource === "service-categories" &&
                    categories.length > 0 && (
                      <div className="flex flex-col pb-3 pl-4">
                        {categories.map((category) => (
                          <Link
                            key={category.id}
                            className="py-1.5 font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary-container"
                            href={categoryHref(category)}
                            onClick={() => setMobileOpen(false)}
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              <a
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-primary-container text-on-primary font-label-lg text-label-lg hover:bg-burgundy-light transition-all"
                href="#seanslar"
                onClick={() => setMobileOpen(false)}
              >
                <CalendarPlus className="size-4" />
                <span>Randevu Al</span>
              </a>
              {accountName ? (
                <>
                  <Link
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blush-surface text-primary-container font-label-lg text-label-lg hover:bg-blush-hover transition-colors"
                    href={accountHref}
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="size-4" />
                    <span>{accountName}</span>
                  </Link>
                  {onAccountLogout && (
                    <button
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border-delicate text-primary font-label-lg text-label-lg hover:bg-blush-surface transition-colors"
                      type="button"
                      onClick={() => {
                        setMobileOpen(false);
                        onAccountLogout();
                      }}
                    >
                      <LogOut className="size-4" />
                      <span>Çıkış Yap</span>
                    </button>
                  )}
                </>
              ) : (
                <Link
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-blush-surface text-primary-container font-label-lg text-label-lg hover:bg-blush-hover transition-colors"
                  href={accountHref}
                  onClick={() => setMobileOpen(false)}
                >
                  <User className="size-4" />
                  <span>Giriş Yap</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}