import { CategoryServicesPage } from "@/components/marketing/services-page";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  return {
    title: `1e1 Seanslar | Sümeyra Aydın Akademi & Danışmanlık`,
    description: `${slug} kategorisindeki birebir danışmanlık seansları.`,
  };
}

export default async function ServiceCategoryPage({ params }) {
  const { slug } = await params;
  return <CategoryServicesPage slug={slug} />;
}
