"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminFormPage({
  backHref,
  backLabel,
  title,
  description,
  maxWidth = "max-w-3xl",
  cardTitle,
  children,
}) {
  return (
    <div className={cn("mx-auto w-full flex-1 px-4 py-6", maxWidth)}>
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href={backHref}
        >
          ← {backLabel}
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>

      <Card>
        {cardTitle ? (
          <CardHeader className="border-b [.border-b]:pb-4">
            <CardTitle>{cardTitle}</CardTitle>
          </CardHeader>
        ) : null}
        <CardContent className={cn(cardTitle ? "pt-4" : "pt-6")}>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
