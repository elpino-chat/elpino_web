import type { Metadata } from "next";
import { OrderLookupsClient } from "./OrderLookupsClient";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Order Lookups & WISMO Resolution | Elpino",
  description:
    "Deflect 68% of 'Where is my order?' tickets with real-time courier API sync (FedEx, UPS, DHL, USPS), pre-dispatch address changes, and self-service returns.",
  alternates: { canonical: `${SITE_URL}/solutions/order-lookups` },
  openGraph: {
    title: "Order Lookups & WISMO Automation | Elpino",
    description:
      "Instant carrier tracking, automated address changes, and frictionless returns right inside customer conversations.",
    url: `${SITE_URL}/solutions/order-lookups`,
    type: "website",
  },
};

export default function OrderLookupsPage() {
  return <OrderLookupsClient />;
}
