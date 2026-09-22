import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { HeroSection } from "@/components/marketing/hero-section";
import { EbooksSection } from "@/components/marketing/ebooks-section";
import { CoursesSection } from "@/components/marketing/courses-section";
import { SessionsSection } from "@/components/marketing/sessions-section";
import { AboutSection } from "@/components/marketing/about-section";
import { marketingNavLinks } from "@/lib/marketing-nav";

const EBOOKS = [
  {
    title: "Dişil Enerjinin Gücü & Uyanış Rehberi",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBI1DrHZgpZY6YZ-lP8OvH64XVN9lHaVUM29Tvq42w4sVeBT2uuMieEYkY9l0bC-f7VRPGm6JFbV4Fl9KgUJiirjBA6Li_sMG-xDIyKxEpuYJHzQDRijQ25KjnXxpeAULZRh1KqREZ6ZXSeaw0I_azVO4F1TSZ7u0oa0pQW8A81zHKs4erYoGBNt46vqqYW2yxTllGr8QRBz4dd3b9IZJ5jnBPI4hHs1WCcnzD6RFbw8EcnKh4gRBeb",
    discount: "%50 İndirim",
    oldPrice: "450 TL",
    price: "225 TL",
  },
  {
    title: "İlişkilerde Sınırlar ve Sağlıklı Bağlanma",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDwYrvmUZLXZxKKtfHkaWODvyXx7HuC4FD3zXj4DEOXro4Jdk1_pn5os3ge9Ztf8hyVVQWGZxJQkt8tgqP_1af1X7-Dq0EwBfRcJN1dVN4feUAM4OLHX21QPzTrembPsErT974fcokn2vtB79K9-ykrYd6AqJJDHa0STeq52b_josAFx-YABLqEprjUcJFEgNZ7WPTHG_XrOPUggI1lMcTBFl29nh55qk4MnTXdlVybvkd-PPE97N01i9a5AgA7WLKsp_pYadDtSCgI8oJ4",
    discount: "%40 İndirim",
    oldPrice: "380 TL",
    price: "228 TL",
  },
  {
    title: "Evliliği Canlandırma & İletişim Sanatı",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDDrbkc2-g_HN6ANzvAdBuYdpnZJSK-Rzcgfu9wSC2A2okIAiO6hR-lbtFKQP3_fy8WExkkNR0jcE9Oz-M2qN4GZjcC_0KPiRRzrE5uOVPo5bL7kktVIqjwss4rKsm38hlPbacfs6WSMIVeDEUnhMV4gQWBZgTEJWAxhH0yVfSj_VdfP_EoDok9DgxI9mtienYO_W6HhyjvjTjhuWc804D7m47ocO-z32fnxiMHK603Wiaz4hgQMDO3",
    discount: "%30 İndirim",
    oldPrice: "420 TL",
    price: "294 TL",
  },
  {
    title: "Öz Değer, Dişil Zarafet ve Çekim Yasası",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAtJ-xMznjeyzV6TljOFVfHUOegRIDnEKM97ytRFVbSld7wQAiW96vjtz_AiaA0diycri4I3QdZ4DuxcUU6KV3enBnh4zsrda-QWilpCl03Xspsf2KxirbWogSgwdLer7jcqHlykY520vlhnncspgdZADSx4pumRv7h1m4NCvDOVGDcW8uzSX0mIoclTDvSK4E4e-q0Zsz3J0mx4TE2x01bZLPEF5wfNVrjc_iCtQj9YeLN7z3IdV15",
    discount: "%50 İndirim",
    oldPrice: "490 TL",
    price: "245 TL",
  },
];

const COURSES = [
  {
    title: "Dişil Enerji ve Bilinçdışı Kodları Dönüşüm Kampı",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBl3ut8QI5Zgtp64TMJmlaARui_ZIU_N3dV14cj7bSWA7z3EeDFTDDwYzDk0CcgTcWGNYoD5Lrj_K6XvmytXeK_wj7wnd89o9xgg9Nybi-P_AjWMqxy1tBkP_cFd80E82vGNEwCCSpQiHUj2u0Sfm4x8Bv1wNLVBnVlvZOuWMHny9uS_0tjALQxfk3dIVl5YtRnu1UZ00faW6jWoBPoTmJgElTYX2M7-OgF-jUs2Yrm2qC_QmfVLSNJ",
    discount: "%45 Erken Kayıt İndirimi",
    oldPrice: "3.200 TL",
    price: "1.450 TL",
  },
  {
    title: "İlişkilerde İletişim Ustalığı ve Çatışma Çözümü",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBZSXggitMw6yGXgnozGkMaVw-N0r8nnik28MKONi8_Bc8_Bxgon075zZXcd3JVmZQyxMeld64xXKozHWD8buV8TA-k43S80fp_EUi1qWKxvNAl3bIKXUyELoaTCLUM0dOruPJmVkf0afW-yOocY7H2Eu-RLj8bXv2_KYaRxPEhxhUIsLogUEbsnq2P3W-ACYvJpEhyYBaPikKvH5n5L_tRhZgR4Mjjtb8QVkVHsSJpEk90_MbuZtrw",
    discount: "%35 İndirim",
    oldPrice: "1.950 TL",
    price: "1.250 TL",
  },
  {
    title: "Anne-Kız Bağı ve Dişil Köklerin İyileştirilmesi",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCqBqrvXA0BnWFH3nsM2ZvFi2DWT1EupY1Ap1BBno4NUw_GT1qqwqRHC84GLAXF9yjx4tsWgc1F20aVAXehJ1nhCEDVIkEEmyRuv1BhH2ZpxYcbJ4_OLivzmLr2Olkd9BRzoSPRmKVB8Aso8Q8iCkf76EDl6MClKLGAhosH8ghdTjI-EegVPAZJbm-XoeM8z8LTpSzbOyx2RNcCDsHSbDu-X9Ngs2JlPphT5nY93dhMrh4_76VmFR1d",
    discount: "%40 İndirim",
    oldPrice: "1.650 TL",
    price: "980 TL",
  },
];

export function HomePage() {
  return (
    <div className="theme-velvet bg-canvas-cream font-body-md text-on-surface">
      <SiteHeader links={marketingNavLinks("/")} />
      <main className="w-full pt-28 bg-canvas-cream">
        <EbooksSection ebooks={EBOOKS} />
        <CoursesSection courses={COURSES} />
        <SessionsSection />
        <AboutSection />
      </main>
      <SiteFooter />
    </div>
  );
}