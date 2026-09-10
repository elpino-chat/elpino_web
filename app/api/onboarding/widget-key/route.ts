import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "../_lib/require-user";

export async function POST() {
  const session = await requireSession();
  if (!session) {
    return Response.json({ message: "Unauthenticated" }, { status: 401 });
  }

  const result = await callGateway<{ widgetApiKey?: string; error?: string }>(
    "/api/auth/onboarding/widget-key",
    { email: session.email },
  );
  if (result?.error) {
    return Response.json({ message: result.error }, { status: 400 });
  }
  return Response.json(result);
}
