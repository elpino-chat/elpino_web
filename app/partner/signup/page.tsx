import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PartnerAuth } from "../_components/PartnerAuth";
import { currentPartnerId } from "../_lib/session";

export const metadata: Metadata = {
  title: "Become an Elpino partner",
  description: "Refer businesses to Elpino and earn 10% of every payment they make in their first 12 months.",
  alternates: { canonical: "https://elpino.chat/partner/signup" },
};

export default async function PartnerSignupPage() {
  if (await currentPartnerId()) redirect("/partner/dashboard");
  return <PartnerAuth mode="signup" />;
}
