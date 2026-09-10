import type { Metadata } from "next";
import { AboutContent } from "./AboutContent";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "About Elpino",
  description: "A small team building more helpful customer support. Discover the ideas, people, and principles behind Elpino.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "About Elpino",
    description: "A little more help. A lot more human. Meet the ideas behind Elpino.",
    url: `${SITE_URL}/about`,
    type: "website",
  },
};

export default function AboutPage() {
  return <AboutContent />;
}
