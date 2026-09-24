import type { Metadata } from "next";
import { CareersView } from "./CareersView";
import { CareersSlothGuide } from "./components/CareersSlothGuide";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Careers at Elpino | Defining the AI Era of Customer Experience",
  description:
    "Join the team building autonomous customer agents that resolve complex support queries with superhuman craft, unyielding trust, and calm precision.",
  alternates: { canonical: `${SITE_URL}/careers` },
  openGraph: {
    title: "Careers at Elpino | Defining the AI Era of Customer Experience",
    description:
      "Join the team building autonomous customer agents that resolve complex support queries with superhuman craft, unyielding trust, and calm precision.",
    url: `${SITE_URL}/careers`,
    type: "website",
    images: [
      {
        url: `${SITE_URL}/images/about-sloth-crew.png`,
        width: 1200,
        height: 630,
        alt: "Careers at Elpino",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Careers at Elpino | Defining the AI Era of Customer Experience",
    description:
      "Join the team building autonomous customer agents that resolve complex support queries with superhuman craft, unyielding trust, and calm precision.",
    images: [`${SITE_URL}/images/about-sloth-crew.png`],
  },
};

export default function CareersPage() {
  return (
    <main className="relative min-h-screen w-full bg-white text-[#111] antialiased selection:bg-black selection:text-white">
      <CareersView />
      {/* Interactive floating sloth companion (unchanged) */}
      <CareersSlothGuide />
    </main>
  );
}
