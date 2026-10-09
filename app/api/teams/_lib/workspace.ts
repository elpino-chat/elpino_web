import { callGateway } from "@/app/api/auth/_lib/gateway";

type Organization = { id: string; name: string; role?: string };

/** The signed-in person's selected workspace, with their role in it. */
export async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

// Teams decide who is alerted about which chats, so only an owner shapes them.
export const ownersOnly = () => Response.json({ message: "Only a workspace owner can change teams." }, { status: 403 });
