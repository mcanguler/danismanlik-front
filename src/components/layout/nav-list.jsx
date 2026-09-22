"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavList({ items, onNavigate, variant = "default" }) {
  const pathname = usePathname();
  const isPortal = variant === "portal";

  return (
    <nav className={cn("flex flex-col", isPortal ? "gap-1.5" : "gap-1")}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center transition-colors",
              isPortal
                ? "gap-3 rounded-xl px-3.5 py-3"
                : "h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium",
              isPortal
                ? active
                  ? "bg-primary-container font-semibold text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:bg-blush-surface hover:text-primary"
                : active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
            )}
          >
            <Icon className={cn("shrink-0", isPortal ? "size-5" : "size-4")} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav({ items, variant = "default" }) {
  const pathname = usePathname();
  const isPortal = variant === "portal";

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden",
        isPortal
          ? "border-border-delicate bg-canvas-pure/95"
          : "border-t bg-background/95"
      )}
    >
      <div className="flex h-16 items-stretch">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors",
                isPortal
                  ? active
                    ? "text-primary-container"
                    : "text-on-surface-variant"
                  : active
                    ? "text-primary"
                    : "text-muted-foreground"
              )}
            >
              <Icon className="size-5 shrink-0" />
              <span className="max-w-full truncate px-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
