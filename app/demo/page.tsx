import type { Metadata } from "next";
import { DemoClient } from "./DemoClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Try the demo",
  description: "Enter your website and chat with an Elpino AI agent that has read your own pages.",
  alternates: { canonical: `${SITE_URL}/demo` },
};

export default function DemoPage() {
  return <DemoClient />;
}
