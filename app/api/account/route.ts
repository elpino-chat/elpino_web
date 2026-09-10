import { cookies } from "next/headers";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { invalidateTokenVersion, currentTokenVersion } from "@/app/api/auth/_lib/session-version";
import { setAuthCookie, signAuthToken } from "@/app/api/auth/_lib/auth-store";

type ProfileResult = {
  identity?: { email: string; name?: string; needsOnboarding?: boolean; tokenVersion?: number };
  error?: string;
};

type AccountResult = {
  account?: { id: string; email: string; name: string | null; avatarUrl: string | null; emailVerified: boolean; twoFactorEnabled: boolean; presenceStatus: string };
  error?: string;
};

export async function GET() {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const result = await callGateway<AccountResult>(`/api/auth/account?email=${encodeURIComponent(session.email)}`);
  if (!result.account) {
    return Response.json({ message: result.error ?? "Could not load account" }, { status: 404 });
  }
  return Response.json({ account: result.account });
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { name?: string; avatarUrl?: string | null };
  const name = body.name?.trim() ?? "";
  if (!name) {
    return Response.json({ message: "Name is required" }, { status: 400 });
  }

  const result = await callGateway<ProfileResult>("/api/auth/account/profile", {
    email: session.email,
    name,
    ...(body.avatarUrl !== undefined ? { avatarUrl: body.avatarUrl } : {}),
  });
  if (!result.identity) {
    return Response.json({ message: result.error ?? "Could not update profile" }, { status: 400 });
  }

  // The display name is embedded in the auth cookie, so re-sign it here —
  // otherwise the change wouldn't show up anywhere until the next login.
  const tokenVersion = await currentTokenVersion(session.email);
  const jwt = signAuthToken({
    email: result.identity.email,
    name: result.identity.name,
    tokenVersion: tokenVersion ?? 0,
  });
  await setAuthCookie(jwt);

  return Response.json({ name: result.identity.name });
}

export async function DELETE(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as { confirmation?: string };
  if (body.confirmation?.trim().toLowerCase() !== session.email.trim().toLowerCase()) {
    return Response.json({ message: "Type your account email exactly to confirm deletion." }, { status: 400 });
  }

  const result = await callGateway<{ ok?: boolean; error?: string }>("/api/auth/account/delete", {
    email: session.email,
    confirmation: body.confirmation,
  });
  if (!result.ok) {
    return Response.json({ message: result.error ?? "Account deletion failed" }, { status: 502 });
  }

  invalidateTokenVersion(session.userId);
  (await cookies()).delete("auth_token");
  return Response.json({ ok: true });
}
