import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import DevWidgetClient from "./dev-widget-client";

export const metadata = {
  title: "Test the widget on localhost",
  robots: { index: false, follow: false },
};

// A stand-in for a customer's website, for trying the widget and the dashboard together while `npm run dev` is
// running. Development only: in a production build this page does not exist.
export default async function DevWidgetPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  const session = await requireSession();
  if (!session) redirect("/login?next=/dev/widget");
  return <DevWidgetClient />;
}
