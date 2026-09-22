import { callGateway } from "@/app/api/auth/_lib/gateway";
import { rateLimit } from "@/app/api/_lib/rate-limit";
import { requireSession } from "../_lib/require-user";

type Organization = { id: string; name: string };
type Site = { publicKey: string; domain: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const limited = await rateLimit(request, `widget-install:${session.userId}`, { limit: 5, windowMs: 10 * 60_000 });
  if (limited) return limited;

  const body = await request.json().catch(() => ({})) as { emails?: unknown; siteKey?: unknown };
  const emails = Array.isArray(body.emails)
    ? [...new Set(body.emails.map((value) => String(value).trim().toLowerCase()).filter(Boolean))]
    : [];
  const siteKey = typeof body.siteKey === "string" ? body.siteKey.trim() : "";
  if (!siteKey || emails.length < 1 || emails.length > 10 || emails.some((email) => !EMAIL_RE.test(email))) {
    return Response.json({ message: "Enter up to 10 valid developer email addresses." }, { status: 400 });
  }

  const organizationResult = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(session.email)}`,
  );
  const organizations = organizationResult.organizations ?? [];
  const workspace = organizations.find((item) => item.id === organizationResult.selectedOrganizationId) ?? organizations[0];
  if (!workspace) return Response.json({ message: "Workspace not found." }, { status: 404 });

  const siteResult = await callGateway<{ sites?: Site[] }>(`/api/workspace/sites?companyId=${encodeURIComponent(workspace.id)}`);
  const site = siteResult.sites?.find((item) => item.publicKey === siteKey);
  if (!site) return Response.json({ message: "Site tag not found in this workspace." }, { status: 404 });

  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM;
  if (!resendKey || !from) {
    return Response.json({ message: "Email delivery is not configured." }, { status: 503 });
  }

  const snippet = `<script async src="https://cdn.elpino.chat/tag.js" data-site-key="${site.publicKey}"></script>`;
  const subject = `Install Elpino on ${site.domain}`;
  const text = [
    `Hi,`,
    ``,
    `${session.name || session.email} asked you to install the Elpino chat widget on ${site.domain}.`,
    ``,
    `Add this before the closing </head> tag:`,
    ``,
    snippet,
    ``,
    `Once it is deployed, let them know so they can verify the installation.`,
  ].join("\n");
  const html = `<p>Hi,</p><p>${escapeHtml(session.name || session.email)} asked you to install the Elpino chat widget on <strong>${escapeHtml(site.domain)}</strong>.</p><p>Add this before the closing <code>&lt;/head&gt;</code> tag:</p><pre style="overflow:auto;padding:16px;border-radius:10px;background:#17181a;color:#fff"><code>${escapeHtml(snippet)}</code></pre><p>Once it is deployed, let them know so they can verify the installation.</p>`;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${resendKey}`, "content-type": "application/json" },
    body: JSON.stringify({ from, to: session.email, cc: emails, reply_to: session.email, subject, text, html }),
  });
  if (!response.ok) {
    console.error("[Onboarding] Failed to send widget instructions", await response.text().catch(() => ""));
    return Response.json({ message: "Could not send the instructions. Please try again." }, { status: 502 });
  }

  return Response.json({ ok: true, sent: emails.length });
}
