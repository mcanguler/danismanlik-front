import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from "@tanstack/react-query";
import {
  Geist_Mono,
  Inter,
  Playfair_Display,
  Plus_Jakarta_Sans,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import {
  fetchPublicMenu,
  MENU_SETTING_SOURCES,
  publicMenusQueryKey,
  resolveMenuSlug,
} from "@/lib/menu-shared";
import {
  fetchSettingsMap,
  SETTINGS_STALE_TIME,
  settingsQueryKey,
} from "@/lib/settings";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Sümeyra Aydın | Akademi & Danışmanlık",
  description:
    "İlişki ve aile danışmanlığı, dönüşüm programları ve dişil enerji üzerine rehberlik",
};

export const dynamic = "force-dynamic";

export default async function RootLayout({ children }) {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: settingsQueryKey,
    queryFn: fetchSettingsMap,
    staleTime: SETTINGS_STALE_TIME,
    retry: 1,
  });

  const settings = queryClient.getQueryData(settingsQueryKey) ?? {};
  await Promise.all(
    Object.values(MENU_SETTING_SOURCES).map((source) => {
      const slug = resolveMenuSlug(settings, source);
      if (!slug) return Promise.resolve();
      return queryClient.prefetchQuery({
        queryKey: [...publicMenusQueryKey, "detail", String(slug)],
        queryFn: () => fetchPublicMenu(slug),
        staleTime: SETTINGS_STALE_TIME,
        retry: 1,
      });
    })
  );

  return (
    <html
      lang="tr"
      className={`${inter.variable} ${geistMono.variable} ${playfair.variable} ${jakarta.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <HydrationBoundary state={dehydrate(queryClient)}>
            {children}
          </HydrationBoundary>
        </Providers>
      </body>
    </html>
  );
}