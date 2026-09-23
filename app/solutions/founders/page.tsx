import type { Metadata } from "next";
import { FoundersClient } from "./FoundersClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "For Founders | Elpino",
  description:
    "Autonomous AI customer service engineered for founders who would rather build product than drown in frontline support tickets.",
  alternates: { canonical: `${SITE_URL}/solutions/founders` },
  openGraph: {
    title: "For Founders | Elpino",
    description:
      "Autonomous AI customer service engineered for founders who would rather build product than drown in frontline support tickets.",
    url: `${SITE_URL}/solutions/founders`,
    type: "website",
  },
};

export default function FoundersPage() {
  return <FoundersClient />;
}
