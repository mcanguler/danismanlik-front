"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ChevronDown,
  GraduationCap,
  Home,
  LayoutDashboard,
  LoaderCircle,
  LogOut,
  MessageCircle,
  Package,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  User,
  X,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCartQuery } from "@/lib/products";
import { usePublicServiceCategoriesQuery } from "@/lib/service-categories";
import { useHeaderMenuLinks } from "@/lib/menus";
import { useSettingsQuery } from "@/lib/settings";
import { roleHomePath, ROLES, ROLE_LABELS } from "@/lib/auth";
import { getNav } from "@/lib/nav";
import { useAuth, useLogout } from "@/lib/auth-hooks";

const LOGO_URL =
  "https://lh3.googleusercontent.com/aida/AEtjO1WmgOiNUjaiKAyx9E7v0c1TiacEOf9Ez9UIoiWtd_wu5jvZxJQkt8tgqP_1af1X7-Dq0EwBfRcJN1dVN4feUAM4OLHX21QPzTrembPsErT974fcokn2vtB79K9-ykrYd6AqJJDHa0STeq52b_josAFx-YABLqEprjUcJFEgNZ7WPTHG_XrOPUggI1lMcTBFl29nh55qk4MnTXdlVybvkd-PPE97N01i9a5AgA7WLKsp_pYadDtSCgI8oJ4";

function isExternalHref(href) {
  return typeof href === "string" && /^(https?:)?\/\//i.test(href);
}

function MenuLink({ link, className, onNavigate, children }) {
  const content = children ?? link.label;
  if (isExternalHref(link.href)) {
    return (
      <a
        className={className}
        href={link.href}
        rel={link.target === "_blank" ? "noopener noreferrer" : undefined}
        target={link.target === "_blank" ? "_blank" : undefined}
        onClick={onNavigate}
      >
        {content}
      </a>
    );
  }
  return (
    <Link
      className={className}
      href={link.href || "/"}
      onClick={onNavigate}
    >
      {content}
    </Link>
  );
}

export function SiteHeader({
  links: fallbackLinks = [],
  accountHref = "/login",
  accountName,
  onAccountLogout,
}) {
const [mobileOpen, setMobileOpen] = useState(false);
const [accountOpen, setAccountOpen] = useState(false);
const accountMenuRef = useRef(null);
const router = useRouter();
const { status, user } = useAuth();
  const logout = useLogout();
  const isAuthenticated = status === "authenticated";
  const isCustomer = user?.role === ROLES.CUSTOMER;
  const dashboardLinks = isCustomer ? getNav(ROLES.CUSTOMER) : [];
  const cartQuery = useCartQuery({ enabled: status !== "loading" });
  const cartCount = Number(
    cartQuery.data?.meta?.count ??
      (cartQuery.data?.items ?? []).reduce(
        (sum, item) => sum + Number(item.quantity ?? 0),
        0
      )
  );

  const settingsQuery = useSettingsQuery();
  const settings = settingsQuery.data ?? {};
  const headerSiteName = settings["site_name"] || "Sümeyra Aydın";
  const headerSiteTagline = settings["site_tagline"] || "Akademi & Danışmanlık";

  const headerMenu = useHeaderMenuLinks(fallbackLinks);
  const links = headerMenu.links;

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

  const handleAccountLogout = () => {
    setMobileOpen(false);
    setAccountOpen(false);
    if (onAccountLogout) {
      onAccountLogout();
      return;
    }
    logout.mutate(undefined, {
      onSuccess: () => router.replace("/"),
    });
  };

  const logoutPending = !onAccountLogout && logout.isPending;

  useEffect(() => {
    if (!accountOpen) return;
    function handlePointerDown(event) {
      if (
        accountMenuRef.current &&
        !accountMenuRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") setAccountOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [accountOpen]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/*<div className="w-full bg-blush-surface text-on-secondary-container px-4 py-2 shadow-[0_1px_4px_rgba(92,29,36,0.04)]">*/}
      {/*  <div className="max-w-[1320px] mx-auto flex items-center justify-between font-label-md text-label-md">*/}
      {/*    <div className="flex items-center gap-2 min-w-0">*/}
      {/*      <Sparkles className="size-4 shrink-0 text-accent-gold" />*/}
      {/*      <span className="truncate">*/}
      {/*        ✨ Yeni Çıkan E-Kitaplarda %50 Lansman İndirimi! Kod:{" "}*/}
      {/*        <strong className="text-primary-container font-semibold tracking-wider">*/}
      {/*          DISIL50*/}
      {/*        </strong>*/}
      {/*      </span>*/}
      {/*    </div>*/}
      {/*    <div className="hidden lg:flex items-center gap-6 shrink-0">*/}
      {/*      <a*/}
      {/*        className="flex items-center gap-1.5 text-on-secondary-container hover:text-primary-container transition-colors"*/}
      {/*        href="#"*/}
      {/*      >*/}
      {/*        <MessageCircle className="size-4" />*/}
      {/*        <span>WhatsApp Danışma Hattı</span>*/}
      {/*      </a>*/}
      {/*      <span className="text-outline-variant">|</span>*/}
      {/*      <span className="text-on-surface-variant font-body-sm text-body-sm">*/}
      {/*        Hafta İçi 09:30 - 18:30*/}
      {/*      </span>*/}
      {/*    </div>*/}
      {/*  </div>*/}
      {/*</div>*/}
      <header className="w-full bg-canvas-pure/90 backdrop-blur-md shadow-[0_4px_24px_rgba(92,29,36,0.04)]">
        <div className="h-20 mx-auto px-4 sm:px-6 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <Link className="flex flex-col" href="/">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-semibold">
                {headerSiteName}
              </span>
              <span className="font-label-sm text-label-sm tracking-[0.18em] uppercase text-secondary font-medium">
                {headerSiteTagline}
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

              if (link.children?.length > 0) {
                return (
                  <div
                    className="relative group"
                    key={link.href || link.label}
                  >
                    <MenuLink className={linkClassName} link={link}>
                      {link.label}
                      <ChevronDown className="size-4 transition-transform duration-200 group-hover:rotate-180" />
                    </MenuLink>
                    <div className="invisible absolute left-0 top-full z-50 translate-y-1 pt-2 opacity-0 transition-all duration-200 group-focus-within:translate-y-0 group-focus-within:opacity-100 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                      <div className="min-w-65 rounded-2xl bg-canvas-pure py-2 shadow-[0_24px_48px_rgba(92,29,36,0.14)] ring-1 ring-border-delicate">
                        {link.children.map((child) => (
                          <div key={`${child.href}-${child.label}`}>
                            <MenuLink
                              className="block px-4 py-2.5 font-label-lg text-label-lg text-on-surface-variant transition-colors hover:bg-blush-surface hover:text-primary-container"
                              link={child}
                            />
                            {child.children?.length > 0 && (
                              <div className="pb-2 pl-6">
                                {child.children.map((grandChild) => (
                                  <MenuLink
                                    className="block px-4 py-1.5 font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary-container"
                                    key={`${grandChild.href}-${grandChild.label}`}
                                    link={grandChild}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

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
                <MenuLink
                  aria-current={link.active ? "page" : undefined}
                  className={linkClassName}
                  key={link.href}
                  link={link}
                />
              );
            })}
          </nav>
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
      <Link
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-blush-surface hover:text-primary-container"
        href="/sepet"
        aria-label="Sepet"
      >
        <ShoppingBag className="size-5" />
        {cartCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-accent-gold font-label-sm text-label-sm font-bold text-tertiary ring-2 ring-canvas-pure">
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </Link>
            {isAuthenticated ? (
              <div className="relative" ref={accountMenuRef}>
                <button
                  aria-expanded={accountOpen}
                  aria-label="Hesabım"
                  className="flex size-9 items-center justify-center rounded-full bg-primary text-on-primary transition-colors hover:bg-burgundy-light"
                  onClick={() => setAccountOpen((open) => !open)}
                  type="button"
                >
                  <User className="size-4" />
                </button>
                {accountOpen && (
                  <div className="absolute right-0 top-11 z-50 w-64 overflow-hidden rounded-2xl bg-canvas-pure shadow-[0_24px_48px_rgba(92,29,36,0.14)] ring-1 ring-border-delicate">
                    <div className="border-b border-border-delicate px-4 py-3">
                      <p className="truncate font-label-md text-label-md font-semibold text-primary">
                        {accountName || user?.name || "Hesabım"}
                      </p>
                      {user?.role ? (
                        <p className="font-label-sm text-label-sm uppercase tracking-wider text-accent-gold">
                          {ROLE_LABELS[user.role] ?? user.role}
                        </p>
                      ) : null}
                    </div>
                    <nav className="p-2">
                      {isCustomer ? (
                        dashboardLinks.map((item) => (
                          <Link
                            className="flex items-center gap-2.5 rounded-xl px-3 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-blush-surface hover:text-primary-container"
                            href={item.href}
                            key={item.href}
                            onClick={() => setAccountOpen(false)}
                          >
                            <item.icon className="size-4" />
                            {item.label}
                          </Link>
                        ))
                      ) : (
                        <Link
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-label-md text-label-md font-semibold text-primary-container transition-colors hover:bg-blush-surface"
                          href={roleHomePath(user?.role)}
                          onClick={() => setAccountOpen(false)}
                        >
                          <LayoutDashboard className="size-4" />
                          Yönetim Paneli
                        </Link>
                      )}
                      <div className="my-1 h-px bg-border-delicate" />
                      <button
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-blush-surface hover:text-primary-container disabled:pointer-events-none disabled:opacity-60"
                        disabled={logoutPending}
                        onClick={handleAccountLogout}
                        type="button"
                      >
                        {logoutPending ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <LogOut className="size-4" />
                        )}
                        {logoutPending
                          ? "Çıkış yapılıyor..."
                          : "Çıkış Yap"}
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <Link
                  className="rounded-full border border-border-delicate px-4 py-2 font-label-md text-label-md text-primary transition-colors hover:bg-blush-surface"
                  href="/login"
                >
                  Giriş Yap
                </Link>
                <Link
                  className="rounded-full bg-primary px-4 py-2 font-label-md text-label-md font-semibold text-on-primary transition-colors hover:bg-burgundy-light"
                  href="/register"
                >
                  Kayıt Ol
                </Link>
              </div>
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
              {links.map((link) => {
                if (link.children?.length > 0) {
                  return (
                    <div
                      className="border-b border-border-delicate"
                      key={`${link.href}-${link.label}`}
                    >
                      <MenuLink
                        className="block py-3 font-label-lg text-label-lg text-on-surface-variant"
                        link={link}
                      />
                      <div className="flex flex-col pb-3 pl-4">
                        {link.children.map((child) => (
                          <div key={`${child.href}-${child.label}`}>
                            <MenuLink
                              className="py-1.5 font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary-container"
                              link={child}
                              onNavigate={() => setMobileOpen(false)}
                            />
                            {child.children?.length > 0 && (
                              <div className="flex flex-col pl-4">
                                {child.children.map((grandChild) => (
                                  <MenuLink
                                    className="py-1 font-body-sm text-body-sm text-muted-foreground transition-colors hover:text-primary-container"
                                    key={`${grandChild.href}-${grandChild.label}`}
                                    link={grandChild}
                                    onNavigate={() => setMobileOpen(false)}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    className="border-b border-border-delicate"
                    key={link.label}
                  >
                    <MenuLink
                      className={cn(
                        "block py-3 font-label-lg text-label-lg",
                        link.active
                          ? "text-primary-container font-semibold"
                          : "text-on-surface-variant hover:text-primary-container"
                      )}
                      link={link}
                      onNavigate={() => setMobileOpen(false)}
                    />
                    {link.dropdownSource === "service-categories" &&
                      categories.length > 0 && (
                        <div className="flex flex-col pb-3 pl-4">
                          {categories.map((category) => (
                            <Link
                              className="py-1.5 font-body-md text-body-md text-on-surface-variant transition-colors hover:text-primary-container"
                              href={categoryHref(category)}
                              key={category.id}
                              onClick={() => setMobileOpen(false)}
                            >
                              {category.name}
                            </Link>
                          ))}
                        </div>
                      )}
                  </div>
                );
              })}
            </nav>
            <div className="mt-4 flex flex-col gap-2">
              {isAuthenticated ? (
                isCustomer ? (
                  <>
                    <div className="flex flex-col rounded-2xl border border-border-delicate p-2">
                      {dashboardLinks.map((item) => (
                        <Link
                          className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-blush-surface hover:text-primary-container"
                          href={item.href}
                          key={item.href}
                          onClick={() => setMobileOpen(false)}
                        >
                          <item.icon className="size-4" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-blush-surface px-5 py-3 font-label-lg text-label-lg text-primary-container transition-colors hover:bg-blush-hover disabled:pointer-events-none disabled:opacity-60"
                      disabled={logoutPending}
                      onClick={handleAccountLogout}
                      type="button"
                    >
                      {logoutPending ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <LogOut className="size-4" />
                      )}
                      <span>
                        {logoutPending ? "Çıkış yapılıyor..." : "Çıkış Yap"}
                      </span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-label-lg text-label-lg font-semibold text-on-primary transition-colors hover:bg-burgundy-light"
                      href={roleHomePath(user?.role)}
                      onClick={() => setMobileOpen(false)}
                    >
                      <LayoutDashboard className="size-4" />
                      <span>Yönetim Paneli</span>
                    </Link>
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-blush-surface px-5 py-3 font-label-lg text-label-lg text-primary-container transition-colors hover:bg-blush-hover disabled:pointer-events-none disabled:opacity-60"
                      disabled={logoutPending}
                      onClick={handleAccountLogout}
                      type="button"
                    >
                      {logoutPending ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        <LogOut className="size-4" />
                      )}
                      <span>
                        {logoutPending ? "Çıkış yapılıyor..." : "Çıkış Yap"}
                      </span>
                    </button>
                  </>
                )
              ) : (
                <>
                  <Link
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-border-delicate px-5 py-3 font-label-lg text-label-lg text-primary transition-colors hover:bg-blush-surface"
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                  >
                    <User className="size-4" />
                    <span>Giriş Yap</span>
                  </Link>
                  <Link
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 font-label-lg text-label-lg font-semibold text-on-primary transition-colors hover:bg-burgundy-light"
                    href="/register"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span>Kayıt Ol</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>
    </div>
  );
}