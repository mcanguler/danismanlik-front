"use client";

import { RequireRole } from "@/components/require-role";
import { ContactMessagesManager } from "@/components/contact-messages/contact-messages-manager";

export default function AdminContactMessagesPage() {
  return (
    <RequireRole role="ADMIN">
      <ContactMessagesManager />
    </RequireRole>
  );
}
