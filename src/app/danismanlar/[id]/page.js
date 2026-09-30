import { cache } from "react";
import { notFound } from "next/navigation";
import { ConsultantDetailPage } from "@/components/marketing/consultants-page";
import { fetchPublicConsultants } from "@/lib/consultants";
import { buildMetadata, getSeoSettings } from "@/lib/seo";

function excerpt(text, maxLength = 160) {
  const value = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trimEnd()}...`;
}

// generateMetadata ve sayfa aynı isteği paylaşır (istek başına tek fetch).
const loadConsultantPage = cache(async (id) => {
  const consultants = await fetchPublicConsultants().catch(() => []);
  const value = String(id ?? "");
  const consultant =
    consultants.find((item) => item.slug === value) ??
    consultants.find((item) => String(item.id) === value) ??
    null;
  if (!consultant) return null;
  return { consultant, consultants };
});

export async function generateMetadata({ params }) {
  const { id } = await params;
  const [data, seo] = await Promise.all([loadConsultantPage(id), getSeoSettings()]);
  const consultant = data?.consultant;
  if (!consultant) {
    return buildMetadata({
      title: "Danışman Detayı",
      path: `/danismanlar/${id}`,
    });
  }

  const name = consultant.name || "Danışman";
  const title = consultant.title ? `${name} — ${consultant.title}` : name;
  const description =
    excerpt(consultant.biography) ||
    consultant.title ||
    seo.siteDescription ||
    undefined;

  return buildMetadata({
    title,
    description,
    image: consultant.profile_image || undefined,
    path: `/danismanlar/${consultant.slug || consultant.id}`,
  });
}

export default async function ConsultantDetailRoute({ params }) {
  const { id } = await params;
  const data = await loadConsultantPage(id);
  if (!data) notFound();

  return (
    <ConsultantDetailPage
      id={id}
      initialConsultant={data.consultant}
    />
  );
}
