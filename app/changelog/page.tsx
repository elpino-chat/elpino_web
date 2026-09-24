import type { Metadata } from "next";
import { ChangelogTimeline } from "./ChangelogTimeline";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Changelog",
  description: "The latest improvements to Elpino’s AI customer support workspace: new features, fixes and what is coming next.",
  alternates: { canonical: `${SITE_URL}/changelog` },
  openGraph: { title: "Changelog | Elpino", description: "Follow the latest improvements to Elpino’s AI customer support workspace.", url: `${SITE_URL}/changelog`, type: "website" },
};

export default function ChangelogPage() { return <ChangelogTimeline />; }
