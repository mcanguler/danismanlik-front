"use client";

import { Suspense } from "react";
import { LoaderCircle } from "lucide-react";
import { RequireRole } from "@/components/require-role";
import { NotificationTemplatesManager } from "@/components/notification-templates/notification-templates-manager";

export default function AdminNotificationTemplatesPage() {
  return (
    <RequireRole role="ADMIN">
      <Suspense
        fallback={
          <div className="flex justify-center py-16">
            <LoaderCircle className="size-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <NotificationTemplatesManager />
      </Suspense>
    </RequireRole>
  );
}
