import { createHmac, randomBytes } from "crypto";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

const base64url = (value: string | Buffer) => Buffer.from(value).toString("base64url");
const noStore = { "cache-control": "no-store" };

// Signs the short-lived identity token that elpino.chat's own chat widget
// uses to recognise a logged-in visitor (see components/SiteWidgetTag.tsx; the
// backend checks it in apps/workspace-service/src/widget/identity-token.ts).
// Anyone not logged in gets { token: null } and chats as an anonymous visitor.
export async function GET() {
  const secret = process.env.ELPINO_WIDGET_IDENTITY_SECRET;
  const session = await requireSession().catch(() => null);
  if (!secret || !session) return Response.json({ token: null }, { headers: noStore });

  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const claims = base64url(
    JSON.stringify({
      aud: "elpino-widget",
      jti: randomBytes(18).toString("base64url"),
      iat: now,
      // Under the backend's five-minute cap; the widget asks for a fresh one.
      exp: now + 240,
      sub: session.userId,
      email: session.email,
      // Logging in to Elpino requires a verified email (password accounts
      // verify by code at signup; Google accounts are verified by Google).
      email_verified: true,
      ...(session.name ? { name: session.name } : {}),
    }),
  );
  const signature = createHmac("sha256", secret).update(`${header}.${claims}`).digest("base64url");
  return Response.json({ token: `${header}.${claims}.${signature}` }, { headers: noStore });
}
