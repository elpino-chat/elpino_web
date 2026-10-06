import { callGateway } from "@/app/api/auth/_lib/gateway";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string };
  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/workspace/referrals/login", { email: body.email })
    .catch(() => ({ error: "Something went wrong. Please try again." }));
  return result.error ? Response.json({ message: result.error }, { status: 400 }) : Response.json({ ok: true });
}
