import Link from "next/link";
import { callGateway } from "@/app/api/auth/_lib/gateway";
import { requireSession } from "@/app/api/onboarding/_lib/require-user";
import { AcceptJoinClient } from "./accept-join-client";

export const metadata = {
  title: "Join workspace",
  robots: { index: false, follow: false },
};

type JoinLinkPreview = { organization?: { id: string; name: string }; error?: string };

const dots = { backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" };

// Same bold-outline, hand-stamped language as the marketing pages (home,
// pricing, contact) — a standalone page rather than a dashboard one, so it
// carries its own small header instead of the site nav.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#fff8ec] px-5 py-16 text-[#11120f] sm:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]" style={dots} />
      <span aria-hidden className="pointer-events-none absolute left-[8%] top-[14%] hidden -rotate-6 rounded-2xl border-2 border-[#11120f] bg-[#ffd84d] px-4 py-2 text-[14px] font-semibold sm:block">One shared inbox</span>
      <span aria-hidden className="pointer-events-none absolute right-[9%] top-[20%] hidden rotate-3 rounded-2xl border-2 border-[#11120f] bg-white px-4 py-2 text-[14px] font-semibold sm:block">No setup needed</span>
      <img aria-hidden src="/icon.png" alt="" className="pointer-events-none absolute bottom-[12%] left-[12%] hidden h-14 w-14 origin-bottom rounded-full border-2 border-[#11120f] bg-white object-contain p-1.5 md:block" />

      <div className="relative w-full max-w-md">
        <Link href="/" aria-label="Elpino home" className="mx-auto mb-6 flex w-fit items-center">
          <img src="/elpino.png" alt="Elpino" className="h-8 w-auto object-contain" />
        </Link>
        <div className="rounded-[22px] border-2 border-[#11120f] bg-white p-8 text-center shadow-[6px_6px_0_0_#11120f]">
          {children}
        </div>
      </div>
    </main>
  );
}

function OrgBadge({ name }: { name: string }) {
  return (
    <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#11120f] bg-[#3784ff] text-[26px] font-bold text-white">
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

// A join link is not addressed to one email — anyone who opens it and signs
// in can join (up to the workspace's seat limit), unlike /invite/[token]
// which only that one address can accept.
export default async function JoinLinkPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const result = await callGateway<JoinLinkPreview>(`/api/auth/join-link/${encodeURIComponent(token)}`);

  if (!result.organization) {
    return (
      <Shell>
        <p className="mx-auto w-fit rounded-full border-2 border-[#11120f] bg-[#ffe9ea] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#8a2b32]">Join link</p>
        <h1 className="mt-4 text-[26px] font-semibold leading-[1.1] tracking-[-0.03em]">This link isn&apos;t working</h1>
        <p className="mt-2 text-[13.5px] leading-6 text-[#11120f]/60">{result.error ?? "This join link is invalid."}</p>
        <Link href="/" className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#11120f] bg-[#11120f] px-7 text-[14px] font-semibold text-white transition hover:-translate-y-0.5">
          Go home
        </Link>
      </Shell>
    );
  }

  const { name: organizationName } = result.organization;
  const session = await requireSession();

  if (!session) {
    const next = encodeURIComponent(`/join/${token}`);
    return (
      <Shell>
        <OrgBadge name={organizationName} />
        <p className="mx-auto mt-4 w-fit rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em]">Join link</p>
        <h1 className="mt-4 text-[26px] font-semibold leading-[1.1] tracking-[-0.03em]">Join {organizationName} on Elpino</h1>
        <p className="mt-2 text-[13.5px] leading-6 text-[#11120f]/60">Sign in or create an account to join this workspace.</p>
        <div className="mt-6 flex flex-col gap-2.5">
          <Link href={`/signup?next=${next}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#11120f] bg-[#3784ff] text-[14px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2f77ea]">
            Create an account
          </Link>
          <Link href={`/login?next=${next}`} className="inline-flex h-12 items-center justify-center gap-2 rounded-full border-2 border-[#11120f] bg-white text-[14px] font-semibold text-[#11120f] transition hover:-translate-y-0.5 hover:bg-[#f7f8fa]">
            Sign in
          </Link>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <OrgBadge name={organizationName} />
      <p className="mx-auto mt-4 w-fit rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em]">Join link</p>
      <h1 className="mt-4 text-[26px] font-semibold leading-[1.1] tracking-[-0.03em]">Join {organizationName} on Elpino</h1>
      <p className="mt-2 text-[13.5px] leading-6 text-[#11120f]/60">Join this workspace as <span className="font-semibold text-[#11120f]">{session.email}</span>.</p>
      <AcceptJoinClient token={token} />
    </Shell>
  );
}
