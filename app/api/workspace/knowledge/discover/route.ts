import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { url?: string; limit?: number };
  if (!body.url?.trim()) return Response.json({ message: "url is required" }, { status: 400 });

  const result = await callGateway<{
    ok?: boolean;
    pages?: { url: string; title: string; depth: number; priority: "high" | "medium" | "low" }[];
    blockedByRobots?: number;
    error?: string;
  }>("/api/workspace/knowledge/discover", { url: body.url.trim(), limit: body.limit });

  return Response.json(result.error ? { message: result.error } : result, { status: result.error ? 400 : 200 });
}
