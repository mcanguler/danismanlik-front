"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { isApiError } from "@/lib/query-errors";
import { usePublicPageQuery } from "@/lib/pages";
import { useSettingsQuery } from "@/lib/settings";

export const KVKK_PAGE_SETTING_KEY = "kvkk-modal-page";

function useKvkkPageSlug() {
  const settingsQuery = useSettingsQuery();
  return String(settingsQuery.data?.[KVKK_PAGE_SETTING_KEY] ?? "").trim();
}

/** Ayarlardaki "kvkk-modal-page" değerindeki sayfayı CMS'ten çekip modalda gösterir. */
export function KvkkPageModal({ open, onOpenChange }) {
  const slug = useKvkkPageSlug();
  const pageQuery = usePublicPageQuery(slug, {
    enabled: open && Boolean(slug),
  });
  const page = pageQuery.data ?? null;

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="max-w-2xl">
        <DialogTitle className="pr-6 font-title-lg text-title-lg font-semibold text-primary">
          {page?.title || "KVKK Aydınlatma Metni"}
        </DialogTitle>
        {open && !slug ? (
          <p className="text-sm text-muted-foreground">
            KVKK metni henüz yapılandırılmadı. Yönetim panelinde
            &quot;kvkk-modal-page&quot; ayarına sayfa adresi (slug) girilmelidir.
          </p>
        ) : null}
        {open && slug && pageQuery.isPending ? (
          <div className="flex justify-center py-10">
            <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : null}
        {open && slug && pageQuery.isError ? (
          <p className="text-sm text-destructive">
            {isApiError(pageQuery.error)
              ? pageQuery.error.message
              : "KVKK metni yüklenemedi."}
          </p>
        ) : null}
        {page?.content ? (
          <div
            className="max-h-[60vh] overflow-y-auto pr-1 text-sm leading-relaxed text-on-surface-variant [&_a]:font-medium [&_a]:text-primary [&_a]:underline [&_h1]:mb-3 [&_h1]:font-semibold [&_h1]:text-primary [&_h2]:mb-3 [&_h2]:mt-5 [&_h2]:font-semibold [&_h2]:text-primary [&_h3]:mb-2 [&_h3]:mt-4 [&_h3]:font-semibold [&_h3]:text-primary [&_li]:mb-1 [&_li]:ml-5 [&_li]:list-disc [&_p]:mb-3 [&_strong]:text-on-surface [&_ul]:mb-3 [&_ul]:mt-1"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/** Formlardaki KVKK bağlantısı: linke gitmez, ayarlardaki sayfayı modalda açar. */
export function KvkkModalLink({ className, children = "KVKK Aydınlatma Metni" }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button className={className} onClick={() => setOpen(true)} type="button">
        {children}
      </button>
      <KvkkPageModal onOpenChange={setOpen} open={open} />
    </>
  );
}
