"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseInfoForm } from "@/components/courses/course-info-form";

export function CourseCreatePage() {
  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <div className="mb-4">
        <Link
          className="text-sm text-muted-foreground hover:text-foreground"
          href="/dashboard/admin/kurslar"
        >
          ← Kurslar
        </Link>
        <h1 className="mt-2 text-xl font-semibold tracking-tight">Yeni Kurs</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Kursu oluşturduktan sonra müfredat, videolar ve erişimleri
          düzenleyebilirsiniz
        </p>
      </div>

      <Card>
        <CardHeader className="border-b [.border-b]:pb-4">
          <CardTitle>Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <CourseInfoForm
            onCreated={(created) =>
              router.replace(`/dashboard/admin/kurslar/${created.id}`)
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
