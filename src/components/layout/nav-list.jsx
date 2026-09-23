"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

function isActive(pathname, href) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, active, onNavigate, variant = "default", compact = false }) {
  const isPortal = variant === "portal";
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center transition-colors",
        compact
          ? "h-9 gap-2.5 rounded-md px-2.5 text-[13px] font-medium"
          : isPortal
            ? "gap-3 rounded-xl px-3.5 py-3"
            : "h-10 gap-3 rounded-lg px-3 text-sm font-medium",
        isPortal
          ? active
            ? "bg-primary-container font-semibold text-on-primary shadow-sm"
            : "text-on-surface-variant hover:bg-blush-surface hover:text-primary"
          : active
            ? "bg-muted text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
      )}
    >
      <Icon className={cn("shrink-0", compact ? "size-3.5" : isPortal ? "size-5" : "size-4")} />
      <span className="truncate">{item.label}</span>
    </Link>
  );
}

function NavGroup({ item, onNavigate, pathname }) {
  const activeInGroup = item.children.some((child) =>
    isActive(pathname, child.href)
  );
  const [toggle, setToggle] = useState({ path: pathname, open: null });
  const open = toggle.path === pathname ? (toggle.open ?? activeInGroup) : activeInGroup;

  return (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setToggle({ path: pathname, open: !open })}
        className={cn(
          "flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
          activeInGroup
            ? "text-foreground"
            : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
        )}
      >
        <item.icon className="size-4 shrink-0" />
        <span className="truncate">{item.label}</span>
        <ChevronDown
          className={cn(
            "ml-auto size-4 shrink-0 transition-transform",
            !open && "-rotate-90"
          )}
        />
      </button>
      {open && (
        <div className="ml-[26px] flex flex-col gap-0.5 border-l border-border/70 pl-2">
          {item.children.map((child) => (
            <NavLink
              compact
              active={isActive(pathname, child.href)}
              item={child}
              key={child.href}
              onNavigate={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function NavList({ items, onNavigate, variant = "default" }) {
  const pathname = usePathname();
  const isPortal = variant === "portal";

  return (
    <nav className={cn("flex flex-col", isPortal ? "gap-1.5" : "gap-1")}>
      {items.map((item) =>
        item.children ? (
          <NavGroup
            item={item}
            key={item.label}
            onNavigate={onNavigate}
            pathname={pathname}
          />
        ) : (
          <NavLink
            active={isActive(pathname, item.href)}
            item={item}
            key={item.href}
            onNavigate={onNavigate}
            variant={variant}
          />
        )
      )}
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
