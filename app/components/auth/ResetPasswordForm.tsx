"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { getErrorMessage, Spinner } from "@/app/components/auth/AuthShared";

const dots = { backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" };

export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/password/reset", { token, password });
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError(getErrorMessage(err, "This reset link is invalid or has expired."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff8ec] font-display text-[#11120f] antialiased">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]" style={dots} />
      <span aria-hidden className="pointer-events-none absolute left-[8%] top-[16%] hidden -rotate-6 rounded-2xl border-2 border-[#11120f] bg-[#ffd84d] px-4 py-2 text-[14px] font-semibold sm:block">Almost there</span>
      <span aria-hidden className="pointer-events-none absolute right-[9%] top-[22%] hidden rotate-3 rounded-2xl border-2 border-[#11120f] bg-white px-4 py-2 text-[14px] font-semibold sm:block">Signs you out everywhere else</span>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[500px] flex-col items-center justify-center px-6 py-16 text-center">
        <Link href="/" aria-label="Elpino home" className="mb-6 flex w-fit items-center">
          <Image src="/elpino.png" alt="Elpino" width={906} height={275} priority className="h-8 w-auto object-contain" />
        </Link>

        <div className="w-full animate-[fadeIn_.55s_ease-out_both] rounded-[22px] border-2 border-[#11120f] bg-white p-8 text-left shadow-[6px_6px_0_0_#11120f]">
          {!token ? (
            <div className="text-center">
              <p className="mx-auto w-fit rounded-full border-2 border-[#11120f] bg-[#ffe9ea] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#8a2b32]">Invalid link</p>
              <h1 className="mt-4 text-[22px] font-semibold leading-[1.1] tracking-[-0.03em]">This link isn&apos;t working</h1>
              <p className="mt-2 text-[13.5px] leading-6 text-[#11120f]/55">This reset link is missing its token. Request a new one from the sign-in page.</p>
            </div>
          ) : done ? (
            <div className="text-center">
              <p className="mx-auto w-fit rounded-full border-2 border-[#11120f] bg-[#d9f2e6] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-[#1a7a4f]">Password updated</p>
              <h1 className="mt-4 text-[22px] font-semibold leading-[1.1] tracking-[-0.03em]">You&apos;re all set</h1>
              <p className="mt-2 text-[13.5px] leading-6 text-[#11120f]/55">Redirecting you to sign in with your new password…</p>
            </div>
          ) : (
            <div className="text-center">
              <p className="mx-auto w-fit rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em]">Reset password</p>
              <h1 className="mt-4 text-[22px] font-semibold leading-[1.1] tracking-[-0.03em]">Choose a new password</h1>
              <p className="mt-2 text-[13.5px] leading-6 text-[#11120f]/55">This will sign you out everywhere else, for safety.</p>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4 text-left">
                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#11120f]/70">New password</label>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 8 characters"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    autoFocus
                    className="h-12 w-full rounded-xl border-2 border-[#11120f] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#11120f]/30 focus:ring-4 focus:ring-[#3784ff]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#11120f]/70">Confirm password</label>
                  <input
                    value={confirm}
                    onChange={(event) => setConfirm(event.target.value)}
                    placeholder="Re-enter your new password"
                    type="password"
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="h-12 w-full rounded-xl border-2 border-[#11120f] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#11120f]/30 focus:ring-4 focus:ring-[#3784ff]/20"
                  />
                </div>

                {error && <p className="rounded-xl border-2 border-[#11120f] bg-[#ffe9ea] px-3 py-2 text-[13px] font-medium text-[#8a2b32]">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#11120f] bg-[#3784ff] text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2f77ea] disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading && <Spinner />}
                  Update password
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
