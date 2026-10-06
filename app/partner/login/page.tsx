import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PartnerAuth } from "../_components/PartnerAuth";
import { currentPartnerId } from "../_lib/session";

export const metadata: Metadata = {
  title: "Partner login",
  description: "Log in to your Elpino partner dashboard.",
  robots: { index: false, follow: true },
};

export default async function PartnerLoginPage() {
  if (await currentPartnerId()) redirect("/partner/dashboard");
  return <PartnerAuth mode="login" />;
}
