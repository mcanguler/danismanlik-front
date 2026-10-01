"use client";

import { useMemo, useState } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { isApiError } from "@/lib/query-errors";
import { usePublicPagesQuery } from "@/lib/pages";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** Sipariş sözleşmesini ayrı pencerede yazdırılabilir biçimde açar. */
export function printContract(contract) {
  const win = window.open("", "_blank", "width=860,height=960");
  if (!win) return;
  const title = escapeHtml(contract.title || "Satış Sözleşmesi");
  const content = escapeHtml(contract.content);
  win.document.write(
    `<!doctype html><html lang="tr"><head><meta charset="utf-8"><title>${title}</title></head><body style="font-family: Georgia, serif; font-size: 13px; line-height: 1.6; color: #111; padding: 32px; white-space: pre-wrap;"><h1 style="font-size:18px;">${title}</h1>${content}</body></html>`
  );
  win.document.close();
  win.focus();
  win.print();
}

const MESAFELI_MATCH = /mesafeli|mesafelİ/i;

/**
 * CMS'teki mesafeli satış sözleşmesi sayfasını bulur.
 * Metnin kendisi backend/CMS'ten gelir; frontend'de tutulmaz.
 * Yönetim panelinde slug ve/veya başlığında "mesafeli" geçen bir
 * sayfa yayına alındığında içerik otomatik görünür.
 */
export function useDistanceSalesContractPage(enabled) {
  const pagesQuery = usePublicPagesQuery({ enabled });

  const page = useMemo(() => {
    const pages = pagesQuery.data ?? [];
    return (
      pages.find((item) => item.is_active && MESAFELI_MATCH.test(item.slug)) ??
      pages.find((item) => item.is_active && MESAFELI_MATCH.test(item.title)) ??
      null
    );
  }, [pagesQuery.data]);

  return page;
}

/**
 * Checkout/randevu onay sözleşme onayı: checkbox + görüntüleme modalı.
 * İçerik CMS kaynağı yoksa hata gösterilmez; checkbox akışı çalışır,
 * sipariş sözleşmesi yine backend'in snapshot'ı ile sipariş detayında sunulur.
 */
export function ContractAcceptance({
  checked,
  onCheckedChange,
  label = "Satış sözleşmesini",
  trailing = "okudum ve kabul ediyorum.",
}) {
  const [open, setOpen] = useState(false);
  const page = useDistanceSalesContractPage(open);

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          checked={checked}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded accent-burgundy-light"
          onChange={(event) => onCheckedChange(event.target.checked)}
          type="checkbox"
        />
        <span className="text-sm leading-snug text-foreground">
          <button
            className={page ? "font-semibold text-primary underline underline-offset-2 hover:text-burgundy-light" : "cursor-default"}
            onClick={(event) => {
              event.preventDefault();
              if (page) setOpen(true);
            }}
            type="button"
          >
            {label}
          </button>{" "}
          {trailing}
        </span>
      </label>

      <Dialog onOpenChange={setOpen} open={open && Boolean(page)}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="pr-6 font-title-lg text-title-lg font-semibold text-primary">
            {page?.title || "Mesafeli Satış Sözleşmesi"}
          </DialogTitle>
          {page?.content ? (
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                {page.content}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
