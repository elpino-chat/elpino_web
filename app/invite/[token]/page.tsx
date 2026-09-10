import Link from "next/link";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { AcceptInviteClient } from "./accept-invite-client";

export const metadata = {
  title: "Accept invitation",
  robots: { index: false, follow: false },
};

type InvitationResult = {
  invitation?: { email: string; organizationName: string; invitedByEmail: string | null };
  error?: string;
};

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6 py-12">
      <div className="w-full max-w-md rounded-2xl border border-[#e2e5e8] bg-white p-8 text-center shadow-[0_1px_2px_rgba(15,23,42,0.04)]">
        {children}
      </div>
    </main>
  );
}

export default async function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await callGateway<InvitationResult>(`/api/auth/invitations/token/${encodeURIComponent(token)}`);

  if (!result.invitation) {
    return (
      <Shell>
        <h1 className="text-[18px] font-semibold text-[#17233a]">Invitation not available</h1>
        <p className="mt-2 text-[13px] text-[#667069]">{result.error ?? "This invitation link is invalid."}</p>
        <Link href="/" className="mt-5 inline-flex h-10 items-center rounded-full bg-[#11120f] px-5 text-[13px] font-semibold text-white hover:bg-black">
          Go home
        </Link>
      </Shell>
    );
  }

  const { email, organizationName, invitedByEmail } = result.invitation;
  const session = await requireSession();

  if (!session) {
    const next = encodeURIComponent(`/invite/${token}`);
    const emailParam = encodeURIComponent(email);
    return (
      <Shell>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] font-bold text-[#2878ce]">
          {organizationName.charAt(0).toUpperCase()}
        </span>
        <h1 className="mt-4 text-[19px] font-semibold text-[#17233a]">
          {invitedByEmail ? `${invitedByEmail} invited you` : "You've been invited"} to join {organizationName}
        </h1>
        <p className="mt-2 text-[13px] text-[#667069]">Sign in or create an account with <span className="font-medium text-[#17233a]">{email}</span> to accept.</p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link href={`/signup?next=${next}&email=${emailParam}`} className="flex h-11 items-center justify-center rounded-full bg-[#11120f] text-[13px] font-semibold text-white hover:bg-black">
            Create an account
          </Link>
          <Link href={`/login?next=${next}&email=${emailParam}`} className="flex h-11 items-center justify-center rounded-full border border-[#dde4e8] text-[13px] font-semibold text-[#17233a] hover:bg-[#f7f8fa]">
            Sign in
          </Link>
        </div>
      </Shell>
    );
  }

  if (session.email.trim().toLowerCase() !== email.trim().toLowerCase()) {
    const next = encodeURIComponent(`/invite/${token}`);
    return (
      <Shell>
        <h1 className="text-[18px] font-semibold text-[#17233a]">Wrong account</h1>
        <p className="mt-2 text-[13px] text-[#667069]">
          This invitation was sent to <span className="font-medium text-[#17233a]">{email}</span>, but you&apos;re signed in as {session.email}.
        </p>
        <Link href={`/login?next=${next}&email=${encodeURIComponent(email)}`} className="mt-5 inline-flex h-10 items-center rounded-full bg-[#11120f] px-5 text-[13px] font-semibold text-white hover:bg-black">
          Sign in with {email}
        </Link>
      </Shell>
    );
  }

  return (
    <Shell>
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff] text-[20px] font-bold text-[#2878ce]">
        {organizationName.charAt(0).toUpperCase()}
      </span>
      <h1 className="mt-4 text-[19px] font-semibold text-[#17233a]">
        {invitedByEmail ? `${invitedByEmail} invited you` : "You've been invited"} to join {organizationName}
      </h1>
      <p className="mt-2 text-[13px] text-[#667069]">Accept to join this workspace as {session.email}.</p>
      <AcceptInviteClient token={token} />
    </Shell>
  );
}
