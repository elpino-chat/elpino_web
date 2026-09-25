import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };
type OrganizationsResult = { organizations?: Organization[]; selectedOrganizationId?: string };
type CompanyResult = { company?: { aiAvatarUrl?: string | null } };

// Serves the workspace's uploaded AI avatar as a real image. The conversation
// list refers to it by this URL (see avatar-ref.ts in workspace-service) rather
// than embedding the 300 KB+ data URL in every conversation. The `v` query is a
// hash of the image, so a new upload gets a new URL and each one can be cached
// by the browser for good.
const DATA_URL = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/=]+)$/;

export async function GET() {
  const session = await requireSession();
  if (!session) return new Response("Unauthenticated", { status: 401 });

  const orgResult = await callGateway<OrganizationsResult>(`/api/auth/organizations?email=${encodeURIComponent(session.email)}`);
  const organizations = orgResult.organizations ?? [];
  const selected = organizations.find((organization) => organization.id === orgResult.selectedOrganizationId) ?? organizations[0];
  if (!selected) return new Response("Not found", { status: 404 });

  const { company } = await callGateway<CompanyResult>(`/api/workspace/companies/${encodeURIComponent(selected.id)}`);
  const match = company?.aiAvatarUrl ? DATA_URL.exec(company.aiAvatarUrl) : null;
  if (!match) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(match[2], "base64"), {
    headers: {
      "content-type": match[1],
      // Private: it sits behind the login. Immutable: the URL changes with the image.
      "cache-control": "private, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
    },
  });
}
