import type { Metadata } from "next";
import { BrandKitView } from "./BrandKitView";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Brand Kit",
  description: "Download Elpino's logos and explore our colours, type, mascot, voice and visual style.",
  alternates: { canonical: `${SITE_URL}/brand-kit` },
  openGraph: {
    title: "Brand Kit",
    description: "Elpino's logos, colours, type, mascot and voice, ready to use.",
    url: `${SITE_URL}/brand-kit`,
    type: "website",
  },
};

export default function BrandKitPage() {
  return <BrandKitView />;
}
