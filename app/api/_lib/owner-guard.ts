import { requireWorkspaceOwner } from "@/app/api/_lib/workspace";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";

/**
 * Stops a request unless the signed-in user owns the selected workspace. Every teammate the owner
 * invites is a member, and members work the inbox, contacts and knowledge but must not change the
 * workspace itself: its AI, website tags, integrations or security settings.
 *
 * Returns the response to send back when blocked, or null when the caller may continue:
 *   const blocked = await ownerGuard("change the chatbot"); if (blocked) return blocked;
 */
export async function ownerGuard(action: string): Promise<Response | null> {
  const session = await requireSession();
  if (!session) return Response.json({ message: "Unauthenticated" }, { status: 401 });
  const owner = await requireWorkspaceOwner(session.email, action);
  return owner.ok ? null : Response.json({ message: owner.message }, { status: owner.status });
}
