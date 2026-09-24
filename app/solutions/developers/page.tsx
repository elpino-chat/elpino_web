import type { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/app/components/BreadcrumbJsonLd";
import { DevelopersClient } from "./DevelopersClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";
const description =
  "Wire support into your product: one widget script tag, signed-token identity from your backend, and MCP servers that give the AI only the tools you approve.";

export const metadata: Metadata = {
  title: "For Developers",
  description,
  alternates: { canonical: `${SITE_URL}/solutions/developers` },
  openGraph: { title: "For Developers | Elpino", description, url: `${SITE_URL}/solutions/developers`, type: "website" },
};

export default function DevelopersPage() {
  return (
    <>
      <BreadcrumbJsonLd trail={[{ name: "For Developers", path: "/solutions/developers" }]} />
      <DevelopersClient />
    </>
  );
}
