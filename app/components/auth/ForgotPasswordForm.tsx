"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { getErrorMessage, Spinner } from "@/app/components/auth/AuthShared";

const dots = { backgroundImage: "radial-gradient(#000 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" };

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post("/auth/password/forgot", { email });
      setSent(true);
    } catch (err) {
      setError(getErrorMessage(err, "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#fff8ec] font-display text-[#11120f] antialiased">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35]" style={dots} />
      <span aria-hidden className="pointer-events-none absolute left-[8%] top-[16%] hidden -rotate-6 rounded-2xl border-2 border-[#11120f] bg-[#ffd84d] px-4 py-2 text-[14px] font-semibold sm:block">We&apos;ll get you back in</span>
      <span aria-hidden className="pointer-events-none absolute right-[9%] top-[22%] hidden rotate-3 rounded-2xl border-2 border-[#11120f] bg-white px-4 py-2 text-[14px] font-semibold sm:block">Link expires in 30 min</span>

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[500px] flex-col items-center justify-center px-6 py-16 text-center">
        <Link href="/" aria-label="Elpino home" className="mb-6 flex w-fit items-center">
          <Image src="/elpino.png" alt="Elpino" width={906} height={275} priority className="h-8 w-auto object-contain" />
        </Link>

        <div className="w-full animate-[fadeIn_.55s_ease-out_both] rounded-[22px] border-2 border-[#11120f] bg-white p-8 text-left shadow-[6px_6px_0_0_#11120f]">
          {sent ? (
            <div className="text-center">
              <p className="mx-auto w-fit rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em]">Check your email</p>
              <h1 className="mt-4 text-[22px] font-semibold leading-[1.1] tracking-[-0.03em]">A link is on its way</h1>
              <p className="mt-2 text-[13.5px] leading-6 text-[#11120f]/55">
                If an account exists for <span className="font-semibold text-[#11120f]">{email}</span>, a password reset link is on its way. It expires in 30 minutes.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="mx-auto w-fit rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-3.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.12em]">Reset password</p>
              <h1 className="mt-4 text-[22px] font-semibold leading-[1.1] tracking-[-0.03em]">Forgot your password?</h1>
              <p className="mt-2 text-[13.5px] leading-6 text-[#11120f]/55">Enter the email on your account and we&apos;ll send you a reset link.</p>

              <form onSubmit={handleSubmit} className="mt-6 text-left">
                <label className="mb-2 block text-[13px] font-semibold text-[#11120f]/70">Email</label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  className="h-12 w-full rounded-xl border-2 border-[#11120f] bg-white px-4 text-[15px] outline-none transition placeholder:text-[#11120f]/30 focus:ring-4 focus:ring-[#3784ff]/20"
                />

                {error && <p className="mt-3 rounded-xl border-2 border-[#11120f] bg-[#ffe9ea] px-3 py-2 text-[13px] font-medium text-[#8a2b32]">{error}</p>}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full border-2 border-[#11120f] bg-[#3784ff] text-[15px] font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#2f77ea] disabled:pointer-events-none disabled:opacity-50"
                >
                  {loading && <Spinner />}
                  Send reset link
                </button>
              </form>
            </div>
          )}

          <p className="mt-6 text-center text-[13px] font-medium text-[#11120f]/55">
            <Link href="/login" className="font-semibold text-[#11120f] underline decoration-[#11120f]/30 underline-offset-4 transition hover:decoration-[#11120f]">
              Back to sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
