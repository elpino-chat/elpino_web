import { callGateway } from "../_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { describeUserAgent } from "@/lib/user-agent";

type GatewaySession = { id: string; userAgent: string | null; ipAddress: string | null; location: string | null; createdAt: string; lastSeenAt: string };

// The signed-in user's active devices, newest activity first. `current` marks
// the one making this request; `currentKnown` is false for a sign-in that
// predates device sessions (it has no row until the next login).
export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const result = await callGateway<{ sessions?: GatewaySession[]; error?: string }>(
    `/api/auth/sessions?email=${encodeURIComponent(session.email)}`,
  ).catch(() => null);
  if (!result?.sessions) return Response.json({ message: result?.error ?? "Sessions could not be loaded." }, { status: 502 });

  const sessions = result.sessions.map((row) => {
    const device = describeUserAgent(row.userAgent);
    return {
      id: row.id,
      device: device.label,
      browser: device.browser,
      os: device.os,
      mobile: device.mobile,
      location: row.location,
      ipAddress: row.ipAddress,
      createdAt: row.createdAt,
      lastSeenAt: row.lastSeenAt,
      current: row.id === session.sid,
    };
  });
  return Response.json({ sessions, currentKnown: Boolean(session.sid) && sessions.some((row) => row.current) });
}
