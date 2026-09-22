import type { Metadata } from "next";
import { ProductFeatureLayout } from "../../components/product/ProductFeatureLayout";
import { ShoppingBag, Truck, RotateCcw, PackageCheck, MessageSquareText, ShieldAlert, Sparkles, Clock } from "lucide-react";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "E-Commerce AI Support Solutions",
  description: "Resolve order tracking, returns, shipping inquiries, and pre-purchase sizing questions 24/7.",
  alternates: { canonical: `${SITE_URL}/solutions/ecommerce` },
  openGraph: {
    title: "E-Commerce AI Support Solutions | Elpino",
    description: "Resolve order tracking, returns, shipping inquiries, and pre-purchase sizing questions 24/7.",
    url: `${SITE_URL}/solutions/ecommerce`,
    type: "website",
  },
};

export default function EcommerceSolutionPage() {
  return (
    <ProductFeatureLayout
      category="Solutions / Industry"
      title="Instant WISMO & returns for"
      highlightedTitle="modern online brands."
      description="Resolve order tracking, exchanges, sizing questions, and checkout doubts instantly across Shopify, WooCommerce, and custom stores."
      primaryCtaText="Start free for E-Commerce"
      features={[
        {
          title: "Where Is My Order (WISMO)",
          description: "Look up real-time courier tracking, estimated delivery dates, and package status in under two seconds.",
          icon: Truck,
          badge: "Highest ROI",
        },
        {
          title: "Returns & Exchanges Automation",
          description: "Enforce store return policies, generate return labels, and process exchanges automatically.",
          icon: RotateCcw,
        },
        {
          title: "Pre-Purchase Product Advice",
          description: "Recommend complementary products, clarify sizing charts, and answer ingredient questions to boost conversion.",
          icon: ShoppingBag,
        },
        {
          title: "Inventory & Stock Checks",
          description: "Check product variant availability and alert shoppers when out-of-stock items are replenished.",
          icon: PackageCheck,
        },
        {
          title: "Abandoned Cart Recovery",
          description: "Engage hesitant shoppers on checkout pages to answer shipping or discount code questions.",
          icon: MessageSquareText,
        },
        {
          title: "Fraud & Chargeback Prevention",
          description: "Flag suspicious address changes and route high-risk refund disputes to store managers.",
          icon: ShieldAlert,
        },
      ]}
      deepDiveTitle="Turn customer support into high-margin repeat revenue"
      deepDiveDescription="Shoppers expect answers in seconds. Elpino delivers immediate, verified answers so you never lose a sale to slow response times."
      deepDiveItems={[
        {
          title: "Shopify & ERP Sync",
          description: "Connect your storefront to query customer orders, fulfillment statuses, and discount codes securely.",
          icon: Sparkles,
          accentColor: "#ff6038",
        },
        {
          title: "Black Friday & Holiday Surge Ready",
          description: "Scale seamlessly during peak traffic without hiring temporary support contractors.",
          icon: Clock,
          accentColor: "#168cff",
        },
        {
          title: "Multi-Language Shopper Support",
          description: "Communicate fluently with international shoppers in 95+ languages with accurate localized terminology.",
          icon: ShoppingBag,
          accentColor: "#8557e8",
        },
      ]}
      stats={[
        { value: "85%", label: "WISMO inquiries automated" },
        { value: "< 1.2s", label: "Average order status response" },
        { value: "+24%", label: "Shopper conversion lift" },
        { value: "0", label: "Holiday queue backlog" },
      ]}
      faqItems={[
        {
          q: "How does Elpino check order status?",
          a: "Elpino securely queries your e-commerce platform (e.g. Shopify, BigCommerce, or custom API) using customer email and order numbers.",
        },
        {
          q: "Can Elpino issue refunds automatically?",
          a: "You can configure strict policy rules: allow automatic store credit or return label generation, while requiring human approval for cash refunds over set limits.",
        },
        {
          q: "Does Elpino work on mobile web stores?",
          a: "Yes. The Elpino widget is ultra-lightweight (<20KB), mobile-optimized, and loads instantly without hurting your Google Core Web Vitals.",
        },
      ]}
    />
  );
}
