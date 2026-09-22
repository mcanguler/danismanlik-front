"use client";

import { cn } from "@/lib/utils";

export function StatusBadge({ active }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        active
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "bg-destructive/10 text-destructive"
      )}
    >
      {active ? "Aktif" : "Pasif"}
    </span>
  );
}