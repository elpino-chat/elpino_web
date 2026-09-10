import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

type Organization = { id: string; name: string };
type AccountResult = { account?: { id: string } };
type Message = {
  id: string;
  senderType: string;
  senderId: string | null;
  body: string;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
  attachmentName?: string | null;
  createdAt: string;
};
// Same shape the widget sends: the file travels as a data URI, which is why
// the services raise the body-parser limit to 8 MB.
type Attachment = { url: string; type: string; name?: string | null };

async function selectedWorkspace(email: string) {
  const result = await callGateway<{ organizations?: Organization[]; selectedOrganizationId?: string }>(
    `/api/auth/organizations?email=${encodeURIComponent(email)}`,
  );
  const organizations = result.organizations ?? [];
  return organizations.find((item) => item.id === result.selectedOrganizationId) ?? organizations[0] ?? null;
}

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const workspace = await selectedWorkspace(session.email);
  if (!workspace) return Response.json({ messages: [] });

  const result = await callGateway<{ messages?: Message[]; customerTyping?: boolean; error?: string }>(
    `/api/workspace/conversations/${encodeURIComponent(id)}/messages?companyId=${encodeURIComponent(workspace.id)}`,
  );
  return Response.json({ messages: result.messages ?? [], customerTyping: result.customerTyping ?? false });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });

  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { body?: string; attachment?: Attachment };
  // A screenshot with no caption is a perfectly ordinary agent message.
  if (!body.body?.trim() && !body.attachment?.url) {
    return Response.json({ message: "Send some text or an attachment" }, { status: 400 });
  }

  const [workspace, accountResult] = await Promise.all([
    selectedWorkspace(session.email),
    callGateway<AccountResult>(`/api/auth/account?email=${encodeURIComponent(session.email)}`),
  ]);
  if (!workspace || !accountResult.account) {
    return Response.json({ message: "No workspace selected" }, { status: 400 });
  }

  const result = await callGateway<{ message?: Message; error?: string }>(
    `/api/workspace/conversations/${encodeURIComponent(id)}/messages`,
    {
      companyId: workspace.id,
      userId: accountResult.account.id,
      body: body.body?.trim() ?? "",
      attachment: body.attachment,
    },
  );
  if (!result.message) return Response.json({ message: result.error ?? "Could not send message" }, { status: 400 });
  return Response.json({ message: result.message });
}
