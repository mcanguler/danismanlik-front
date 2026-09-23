"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LoaderCircle, LogOut, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {ROLE_LABELS, roleHomePath, ROLES} from "@/lib/auth";
import { getBottomNav, getNav } from "@/lib/nav";
import {marketingNavLinks, portalNavLinks} from "@/lib/marketing-nav";
import { useAuth, useLogout } from "@/lib/auth-hooks";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteHeader } from "@/components/marketing/site-header";
import { BottomNav, NavList } from "@/components/layout/nav-list";

export function AppShell({ children }) {
  const { user } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const role = user?.role;
  const isPortal = role === ROLES.CUSTOMER;
  const navItems = getNav(role);
  const bottomItems = getBottomNav(role);
  const navVariant = isPortal ? "portal" : "default";

  useEffect(() => {
    if (!drawerOpen) return;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => router.replace("/login"),
    });
  };

  if (isPortal) {
    return (
      <div className="theme-velvet bg-canvas-cream flex min-h-dvh flex-col">
        <SiteHeader
          accountHref="/dashboard/customer"
          accountName={user?.name}
          links={marketingNavLinks(pathname)}
          onAccountLogout={handleLogout}
        />
        <main className="w-full flex-1 pt-28">{children}</main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "min-h-dvh md:pl-64",
        isPortal && "theme-velvet bg-canvas-cream"
      )}
    >
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 hidden w-64 flex-col md:flex",
          isPortal
            ? "border-r border-border-delicate bg-canvas-pure"
            : "border-r bg-card"
        )}
      >
        {isPortal ? (
          <div className="flex flex-col gap-3 border-b border-border-delicate px-4 py-5">
            <Link className="flex items-center gap-2.5" href={roleHomePath(role)}>
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary-container font-serif text-sm font-semibold text-on-primary">
                SA
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="truncate font-title-md text-title-md text-primary">
                  Sümeyra Aydın
                </span>
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-accent-gold">
                  Danışan Portalı
                </span>
              </span>
            </Link>
            <div className="flex items-center gap-3 rounded-xl bg-blush-surface px-3 py-3">
              <span className="size-2 shrink-0 animate-pulse rounded-full bg-accent-gold" />
              <span className="font-body-sm text-body-sm font-medium text-secondary">
                Kişisel Gelişim &amp; Terapi Odası
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-14 items-center border-b px-5 md:h-16">
            <Link
              href={roleHomePath(role)}
              className="text-base font-semibold tracking-tight"
            >
              Danışmanlık
            </Link>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-3">
          <NavList items={navItems} variant={navVariant} />
        </div>
      </aside>

      <div className="flex min-h-dvh flex-col">
        <header
          className={cn(
            "sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur md:h-16",
            isPortal
              ? "border-border-delicate bg-canvas-pure/90"
              : "border-b bg-background/80"
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-10 w-10 md:hidden", isPortal && "text-primary")}
            onClick={() => setDrawerOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu className="size-5" />
          </Button>
          <Link
            href={roleHomePath(role)}
            className="text-base font-semibold tracking-tight md:hidden"
          >
            Danışmanlık
          </Link>
          <div className="ml-auto flex items-center gap-2 md:gap-3">
            <div className="hidden items-center gap-2 md:flex">
              <p className="text-sm font-medium">{user?.name}</p>
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs",
                  isPortal
                    ? "bg-blush-surface text-primary"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {ROLE_LABELS[role] ?? role}
              </span>
            </div>
            <Button
              variant={isPortal ? "outline" : "outline"}
              size="sm"
              onClick={handleLogout}
              disabled={logout.isPending}
              className={cn("h-10 md:h-8", isPortal && "border-border-delicate text-primary hover:bg-blush-surface")}
            >
              {logout.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <LogOut className="size-4" />
              )}
              <span className="hidden sm:inline">
                {logout.isPending ? "Çıkış yapılıyor..." : "Çıkış Yap"}
              </span>
            </Button>
          </div>
        </header>

        {drawerOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />
            <div
              className={cn(
                "absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col shadow-xl",
                isPortal ? "bg-canvas-pure" : "bg-background"
              )}
            >
              <div
                className={cn(
                  "flex h-14 items-center justify-between border-b px-4",
                  isPortal && "border-border-delicate"
                )}
              >
                <span className="text-base font-semibold tracking-tight">
                  Danışmanlık
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Menüyü kapat"
                >
                  <X className="size-5" />
                </Button>
              </div>
              <div
                className={cn(
                  "flex items-center gap-2 border-b px-4 py-3",
                  isPortal && "border-border-delicate"
                )}
              >
                <p className="min-w-0 flex-1 truncate text-sm font-medium">
                  {user?.name}
                </p>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs",
                    isPortal
                      ? "bg-blush-surface text-primary"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  {ROLE_LABELS[role] ?? role}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto p-3">
                <NavList
                  items={navItems}
                  onNavigate={() => setDrawerOpen(false)}
                  variant={navVariant}
                />
              </div>
            </div>
          </div>
        )}

        <main className="flex flex-1 flex-col pb-16 md:pb-0">{children}</main>
      </div>

      <BottomNav items={bottomItems} variant={navVariant} />
    </div>
  );
}
