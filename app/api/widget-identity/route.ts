import { createIdentityToken } from "@/public/sdk/elpino-server.mjs";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

const noStore = { "cache-control": "no-store" };

// Signs the short-lived identity token that elpino.chat's own chat widget
// uses to recognise a logged-in visitor (see components/SiteWidgetTag.tsx; the
// backend checks it in apps/workspace-service/src/widget/identity-token.ts).
// Anyone not logged in gets { token: null } and chats as an anonymous visitor.
export async function GET() {
  const secret = process.env.ELPINO_WIDGET_IDENTITY_SECRET;
  const session = await requireSession().catch(() => null);
  if (!secret || !session) return Response.json({ token: null }, { headers: noStore });

  const token = createIdentityToken(secret, {
      id: session.userId,
      email: session.email,
      // Logging in to Elpino requires a verified email (password accounts
      // verify by code at signup; Google accounts are verified by Google).
      emailVerified: true,
      ...(session.name ? { name: session.name } : {}),
  });
  return Response.json({ token }, { headers: noStore });
}

export const POST = GET;
