import { redirect } from "next/navigation";
import { currentPartnerId } from "./_lib/session";

export default async function PartnerHome() {
  redirect((await currentPartnerId()) ? "/partner/dashboard" : "/partner/login");
}
