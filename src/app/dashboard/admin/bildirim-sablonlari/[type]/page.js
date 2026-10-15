"use client";

import { useParams } from "next/navigation";
import { RequireRole } from "@/components/require-role";
import { NotificationTemplateEditPage } from "@/components/notification-templates/notification-template-edit-page";

export default function AdminNotificationTemplateDetailPage() {
  const params = useParams();
  const type = Array.isArray(params?.type) ? params.type[0] : params?.type;

  return (
    <RequireRole role="ADMIN">
      <NotificationTemplateEditPage type={type} />
    </RequireRole>
  );
}
