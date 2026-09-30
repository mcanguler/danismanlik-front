"use client";

import { useState } from "react";
import { FileText, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { isApiError } from "@/lib/query-errors";
import { usePublicPageQuery } from "@/lib/pages";

/**
 * Mesafeli satış sözleşmesinin CMS sayfası (site footeriyle aynı kaynak).
 * Metnin içeriği backend/CMS'ten gelir; frontend'de tutulmaz.
 */
export const DISTANCE_SALES_PAGE_SLUG = "mesafeli-satis-sozlesmesi";

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

/** Checkout'ta sözleşme onayı: checkbox + modal (scroll edilebilir içerik). */
export function ContractAcceptance({ checked, onCheckedChange }) {
  const [open, setOpen] = useState(false);
  const pageQuery = usePublicPageQuery(DISTANCE_SALES_PAGE_SLUG, {
    enabled: open,
  });

  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <label className="flex cursor-pointer items-start gap-3">
        <input
          checked={checked}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-burgundy-light rounded"
          onChange={(event) => onCheckedChange(event.target.checked)}
          type="checkbox"
        />
        <span className="text-sm leading-snug text-foreground">
          <button
            className="font-semibold text-primary underline underline-offset-2 hover:text-burgundy-light"
            onClick={() => setOpen(true)}
            type="button"
          >
            Satış sözleşmesini
          </button>{" "}
          okudum ve kabul ediyorum.
        </span>
      </label>

      <Dialog onOpenChange={setOpen} open={open}>
        <DialogContent className="max-w-2xl">
          <DialogTitle className="pr-6 font-title-lg text-title-lg font-semibold text-primary">
            Mesafeli Satış Sözleşmesi
          </DialogTitle>
          {pageQuery.isPending ? (
            <div className="flex justify-center py-10">
              <LoaderCircle className="size-5 animate-spin text-muted-foreground" />
            </div>
          ) : null}
          {pageQuery.isError ? (
            <div className="px-6 py-8 text-center">
              <FileText className="mx-auto size-6 text-muted-foreground" />
              <p className="mt-2 text-sm text-destructive">
                {isApiError(pageQuery.error)
                  ? pageQuery.error.message
                  : "Sözleşme metni yüklenemedi."}
              </p>
            </div>
          ) : null}
          {pageQuery.data?.content ? (
            <div className="max-h-[60vh] overflow-y-auto pr-2">
              <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-foreground">
                {pageQuery.data.content}
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
