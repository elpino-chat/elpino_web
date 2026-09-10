import type { Metadata } from "next";
import { SecureSubmitClient } from "./secure-submit-client";

// Never indexed and never followed. A secure handover link is meant for one
// person; it has no business in a search result or a referrer chain.
export const metadata: Metadata = {
  title: "Secure information request",
  robots: { index: false, follow: false, nocache: true },
  referrer: "no-referrer",
};

export default async function SecureRequestPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <SecureSubmitClient token={token} />;
}
