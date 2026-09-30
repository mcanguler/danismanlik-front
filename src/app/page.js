import { HomePage } from "@/components/marketing/home-page";
import { buildMetadata, getSeoSettings } from "@/lib/seo";

export async function generateMetadata() {
  const seo = await getSeoSettings();
  return buildMetadata({
    title: seo.homeTitle || undefined,
    description: seo.homeDescription || undefined,
    path: "/",
  });
}

export default function Page() {
  return <HomePage />;
}
