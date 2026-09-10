import { callGateway } from "@/app/api/auth/_lib/gateway";

type InvitationResult = {
  invitation?: { email: string; organizationName: string; invitedByEmail: string | null };
  error?: string;
};

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await callGateway<InvitationResult>(`/api/auth/invitations/token/${encodeURIComponent(token)}`);
  if (!result.invitation) {
    return Response.json({ message: result.error ?? "This invitation link is invalid." }, { status: 404 });
  }
  return Response.json({ invitation: result.invitation });
}
