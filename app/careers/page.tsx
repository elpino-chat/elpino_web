import type { Metadata } from "next";
import { CareersHero } from "./components/CareersHero";
import { CareersMarquee } from "./components/CareersMarquee";
import { CareersWhoWeAre } from "./components/CareersWhoWeAre";
import { CareersCeoVideo } from "./components/CareersCeoVideo";
import { CareersValues } from "./components/CareersValues";
import { CareersAmbitionBento } from "./components/CareersAmbitionBento";
import { CareersLeaders } from "./components/CareersLeaders";
import { CareersBenefits } from "./components/CareersBenefits";
import { CareersOffices } from "./components/CareersOffices";
import { CareersJobBoard } from "./components/CareersJobBoard";
import { CareersPayGapNotice } from "./components/CareersPayGapNotice";
import { CareersBottomCta } from "./components/CareersBottomCta";
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
    <main className="relative min-h-screen w-full bg-white font-[family-name:var(--font-rethink-sans)] text-[#111] antialiased selection:bg-black selection:text-white">
      {/* 01. Hero Section */}
      <CareersHero />

      {/* 02. Infinite Moving Culture Marquee */}
      <CareersMarquee />

      {/* 03. Who We Are: A Company Built for Extraordinary Success */}
      <CareersWhoWeAre />

      {/* 04. CEO & Co-founder Leadership Reflection */}
      <CareersCeoVideo />

      {/* 05. The Values That Make Great Work Possible */}
      <CareersValues />

      {/* 06. The Ambition That Sets Us Apart (Bento Grid) */}
      <CareersAmbitionBento />

      {/* 07. Work With Industry Leaders Rewriting The Rules */}
      <CareersLeaders />

      {/* 08. Benefits to Support Your Best Work */}
      <CareersBenefits />

      {/* 09. Six International Offices. One Global Team. */}
      <CareersOffices />

      {/* 10. Live Filterable Job Board */}
      <CareersJobBoard />

      {/* 11. Equal Pay & Diversity Transparency */}
      <CareersPayGapNotice />

      {/* 12. Final Bottom CTA Banner */}
      <CareersBottomCta />

      {/* 13. Interactive Floating Sloth Companion */}
      <CareersSlothGuide />
    </main>
  );
}
