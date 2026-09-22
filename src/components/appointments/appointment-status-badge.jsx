"use client";

import { cn } from "@/lib/utils";
import {
  APPOINTMENT_STATUS_BADGE_CLASSES,
  APPOINTMENT_STATUS_LABELS,
} from "@/lib/appointments";

export function AppointmentStatusBadge({ status, className }) {
  const label = APPOINTMENT_STATUS_LABELS[status] ?? status;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        APPOINTMENT_STATUS_BADGE_CLASSES[status] ??
          "bg-muted text-muted-foreground",
        className
      )}
    >
      {label}
    </span>
  );
}
