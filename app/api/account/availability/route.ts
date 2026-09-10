import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { DAY_KEYS, isValidTimezone, normalizeAvailability, parseTime, type Availability } from "@/lib/availability";

type AvailabilityResult = { availability?: unknown; error?: string };

export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const result = await callGateway<AvailabilityResult>(
    `/api/auth/account/availability?email=${encodeURIComponent(session.email)}`,
  );
  if (result.error) return Response.json({ message: result.error }, { status: 400 });
  return Response.json({ availability: normalizeAvailability(result.availability) });
}

export async function PUT(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { availability?: unknown };

  // Validate here rather than in auth-service: this is the only writer, and
  // the schedule shape belongs to the same module that does the coverage
  // math, so the two can never drift apart.
  const incoming = body.availability as Partial<Availability> | undefined;
  if (!incoming || typeof incoming !== "object") {
    return Response.json({ message: "availability is required" }, { status: 400 });
  }
  if (typeof incoming.timezone !== "string" || !isValidTimezone(incoming.timezone)) {
    return Response.json({ message: "A valid IANA timezone is required." }, { status: 400 });
  }
  for (const key of DAY_KEYS) {
    const day = incoming.days?.[key];
    if (!day) continue;
    if (parseTime(String(day.start)) === null || parseTime(String(day.end)) === null) {
      return Response.json({ message: `Enter ${key} hours as HH:MM.` }, { status: 400 });
    }
  }

  const availability = normalizeAvailability(incoming);
  const result = await callGateway<AvailabilityResult>("/api/auth/account/availability", {
    email: session.email,
    availability,
  });
  if (result.error) return Response.json({ message: result.error }, { status: 400 });
  return Response.json({ availability: normalizeAvailability(result.availability) });
}
