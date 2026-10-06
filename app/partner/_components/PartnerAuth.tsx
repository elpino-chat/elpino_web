"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Briefcase, Building2, Check, Newspaper, PlayCircle, Share2, Sparkles, Users } from "lucide-react";
import { OtpInput } from "@/app/components/auth/OtpInput";
import { Spinner } from "@/app/components/auth/AuthShared";

// The form side matches the workspace /login and /signup pages: the same fields and buttons.
// The form side uses the onboarding page's look: its labels, inputs, chips and button.
const label = "mb-2 block text-base font-normal";
const field = "h-12 w-full rounded-[11px] border-2 border-black/40 bg-white px-5 text-[15px] text-[#111214] outline-none transition placeholder:text-[15px] placeholder:text-[#9a9da3] hover:border-black focus:border-black focus:ring-4 focus:ring-black/[0.06]";
const primary = "flex h-14 w-fit min-w-[118px] cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#18191b] px-6 text-[16px] font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#d5d5d8] disabled:text-white";
const chip = (selected: boolean) =>
  `flex min-h-12 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border px-5 py-2.5 text-[14px] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10 ${
    selected ? "border-black bg-black/[0.04] text-[#111214]" : "border-black/10 bg-white text-[#111214] hover:border-black/30 hover:bg-black/[0.02]"
  }`;

async function post(path: string, body: unknown) {
  const res = await fetch(path, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { message?: string };
  if (!res.ok) throw new Error(data.message ?? "Something went wrong. Please try again.");
}

const COPY = {
  login: { title: "Log in to your partner account", subtitle: "Enter your email and we'll send you a code. No password needed.", submit: "Continue" },
  signup: { title: "Become a partner", subtitle: "Refer businesses to Elpino and earn 10% of everything they pay in their first year.", submit: "Continue" },
};

const PERKS = [
  "10% of every payment your customers make in their first 12 months",
  "Signups up to 60 days after someone clicks your link still count",
  "Live dashboard: visits, signups, paying customers and earnings",
  "Paid out to your UPI or bank account",
];

// Where partners usually share Elpino. Picked as chips; sent to the team as one line of text.
const CHANNELS = [
  { label: "My clients", icon: Briefcase },
  { label: "Social media", icon: Share2 },
  { label: "Newsletter or blog", icon: Newspaper },
  { label: "Community or group", icon: Users },
  { label: "YouTube", icon: PlayCircle },
  { label: "Agency work", icon: Building2 },
  { label: "Other", icon: Sparkles },
];

// Two steps for signup, counted the way the onboarding page counts its own.
function Steps({ current }: { current: 1 | 2 }) {
  return (
    <div className="mb-7 flex w-full justify-end" aria-label={`Step ${current} of 2`}>
      <p className="text-[16px] text-[#676b72]">{current}/2</p>
    </div>
  );
}

// Partner login and signup share one flow: details (or just an email) first, then the 6-digit code we email.
export function PartnerAuth({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const copy = COPY[mode];
  const [step, setStep] = useState<"details" | "code">("details");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [channels, setChannels] = useState<string[]>([]);
  const promotion = channels.join(", ");
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState<"send" | "verify" | "resend" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function run(kind: "send" | "verify" | "resend", action: () => Promise<void>) {
    setBusy(kind); setError(null);
    try { await action(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); } finally { setBusy(null); }
  }

  const requestCode = () => (mode === "signup" ? post("/api/partner/signup", { name, email, promotion }) : post("/api/partner/login", { email }));

  function submitDetails(event: FormEvent) {
    event.preventDefault();
    void run("send", async () => { await requestCode(); setOtp(""); setResent(false); setStep("code"); });
  }

  function submitCode(event: FormEvent) {
    event.preventDefault();
    void run("verify", async () => { await post("/api/partner/verify", { email, code: otp }); router.replace("/partner/dashboard"); router.refresh(); });
  }

  const errorBox = error && <p role="alert" className="mt-3 rounded-xl border-2 border-[#11120f] bg-[#ffe9ea] px-3 py-2.5 text-left text-[13px] leading-5 text-[#8a2b32]">{error}</p>;

  return (
    <main className="min-h-screen bg-white font-display text-[#11120f] antialiased md:grid md:h-screen md:grid-cols-[1fr_1.1fr] md:overflow-hidden">
      {/* The program. Side by side from tablet width up, where it stays put at the full window height while only
          the form side scrolls; stacked above the form on phones. */}
      <aside className="flex flex-col justify-between gap-8 bg-[#11120f] p-7 text-white sm:p-10 md:h-screen md:gap-0 lg:p-12">
        <Link href="https://elpino.chat" aria-label="Elpino home" className="flex w-fit items-center gap-2.5">
          <Image src="/elpino-white.png" alt="Elpino" width={906} height={275} priority className="h-8 w-auto" />
          <span className="rounded-full border border-white/25 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/60">Partners</span>
        </Link>
        <div>
          <p className="text-[13px] uppercase tracking-[0.14em] text-white/50">Elpino partner program</p>
          <h2 className="mt-4 max-w-md text-[28px] font-normal leading-[1.1] tracking-[-0.03em] lg:text-4xl">Earn from every customer you bring to Elpino.</h2>
          <ul className="mt-6 space-y-3 lg:mt-8 lg:space-y-3.5">
            {PERKS.map((perk) => <li key={perk} className="flex gap-3 text-[15px] leading-6 text-white/80"><Check size={18} className="mt-0.5 shrink-0 text-[#a6e05a]" />{perk}</li>)}
          </ul>
        </div>
        <p className="text-[12.5px] text-white/40">Refunded payments and your own workspace don&apos;t count towards commission.</p>
      </aside>

      {/* The form, laid out like the workspace /login page. */}
      <section className="md:h-screen md:overflow-y-auto">
        <div className="relative z-10 mx-auto flex w-full max-w-[560px] flex-col items-start justify-center px-6 py-12 text-left md:min-h-full md:py-16">

        <div className="w-full animate-[fadeIn_.55s_ease-out_both] text-left">
          {mode === "signup" && <Steps current={step === "details" ? 1 : 2} />}
          {step === "details" ? (
            <>
              <h1 className="text-balance text-xl font-normal leading-[1.12] tracking-[-0.03em]">{copy.title}</h1>
              {copy.subtitle && <p className="mt-2 text-lg text-black/55">{copy.subtitle}</p>}
              <form onSubmit={submitDetails} className="mt-9 w-full space-y-5">
                {mode === "signup" && (
                  <div>
                    <label htmlFor="partner-name" className={label}>Your name</label>
                    <input id="partner-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" autoComplete="name" required autoFocus maxLength={120} className={field} />
                  </div>
                )}
                <div>
                  <label htmlFor="partner-email" className={label}>Email</label>
                  <input id="partner-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" required autoFocus={mode === "login"} className={field} />
                </div>
                {mode === "signup" && (
                  <fieldset>
                    <legend className="text-base font-normal">Where will you share Elpino? <span className="text-black/40">(optional)</span></legend>
                    <div className="mt-3 flex flex-wrap justify-start gap-3">
                      {CHANNELS.map(({ label: channel, icon: Icon }) => {
                        const on = channels.includes(channel);
                        return (
                          <button key={channel} type="button" aria-pressed={on} onClick={() => setChannels((list) => (on ? list.filter((c) => c !== channel) : [...list, channel]))} className={chip(on)}>
                            <Icon className="size-4 shrink-0" aria-hidden="true" />{channel}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                )}
                <button type="submit" disabled={busy !== null} className={`!mt-8 ${primary}`}>
                  {busy === "send" && <Spinner />}{copy.submit}
                </button>
                {mode === "signup" && (
                  <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-[#11120f]/55">
                    {["Free to join", "Takes a minute", "Earn for a full year"].map((item) => (
                      <li key={item} className="flex items-center gap-1.5"><Check size={13} className="text-[#1aa37a]" />{item}</li>
                    ))}
                  </ul>
                )}
              </form>
              {errorBox}

              <p className="mt-7 w-full text-[14px] text-[#11120f]/50">
                {mode === "login" ? "Not a partner yet?" : "Already a partner?"}{" "}
                <Link href={mode === "login" ? "/partner/signup" : "/partner/login"} className="font-semibold text-[#11120f] underline decoration-[#11120f]/30 underline-offset-4 transition hover:decoration-[#11120f]">
                  {mode === "login" ? "Become a partner" : "Log in"}
                </Link>
              </p>
              <p className="mt-6 w-full text-[12px] leading-5 text-[#11120f]/35">
                By continuing you agree to Elpino&apos;s <Link href="/terms" className="text-[#11120f]/55 underline hover:text-[#11120f]/80">Terms of Service</Link> and <Link href="/privacy" className="text-[#11120f]/55 underline hover:text-[#11120f]/80">Privacy Policy</Link>.
              </p>
            </>
          ) : (
            <form onSubmit={submitCode} className="w-full">
              <h1 className="text-balance text-xl font-normal leading-[1.12] tracking-[-0.03em]">{mode === "signup" ? "Check your email" : "Enter your code"}</h1>
              <p className="mt-2 text-lg text-black/55">
                {email}{" "}
                <button type="button" onClick={() => { setStep("details"); setError(null); }} className="font-semibold text-[#0078f4] hover:underline">Change email</button>
              </p>
              <OtpInput value={otp} onChange={setOtp} disabled={busy !== null} />
              <button type="submit" disabled={busy !== null || otp.length !== 6} className={`mt-8 ${primary}`}>
                {busy === "verify" && <Spinner />}Continue
              </button>
              {errorBox}
              <button type="button" disabled={busy !== null} onClick={() => void run("resend", async () => { await requestCode(); setResent(true); })} className="mt-5 block text-[14px] font-semibold text-[#0078f4] hover:underline disabled:opacity-50">
                {resent ? "A new code is on its way" : busy === "resend" ? "Sending..." : "Send a new code"}
              </button>
            </form>
          )}
        </div>
        </div>
      </section>
    </main>
  );
}
