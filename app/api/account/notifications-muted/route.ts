import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/** Saves the header's "Mute notifications" switch on the signed-in account, so it follows them to every browser and device. */
export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { muted?: unknown };
  if (typeof body.muted !== "boolean") return Response.json({ message: "muted must be true or false." }, { status: 400 });

  const result = await callGateway<{ notificationsMuted?: boolean; error?: string }>("/api/auth/account/notifications-muted", {
    email: session.email,
    muted: body.muted,
  });
  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
