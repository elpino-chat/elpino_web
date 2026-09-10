"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Lock, ShieldAlert } from "lucide-react";

type Status = "loading" | "ready" | "sending" | "done" | "invalid";

/**
 * The page a customer lands on to hand over something sensitive.
 *
 * Deliberately plain: no chat, no branding chrome, no analytics tag, nothing
 * that would make a person hesitate before typing a credential. It states what
 * was asked for, what happens to the value, and nothing else.
 */
export function SecureSubmitClient({ token }: { token: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [label, setLabel] = useState("");
  const [secret, setSecret] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/secure/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then(async (response) => {
        const data = (await response.json().catch(() => ({}))) as { label?: string; message?: string };
        if (cancelled) return;
        if (!response.ok || !data.label) {
          setError(data.message ?? "This link is not valid.");
          setStatus("invalid");
          return;
        }
        setLabel(data.label);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setError("This link could not be checked. Try again in a moment.");
        setStatus("invalid");
      });
    return () => { cancelled = true; };
  }, [token]);

  async function submit() {
    if (!secret.trim() || status === "sending") return;
    setStatus("sending");
    setError(null);
    try {
      const response = await fetch(`/api/secure/${encodeURIComponent(token)}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ secret }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Could not submit this.");
      // Clear it from the form the instant it is accepted, so it is not left
      // sitting in a field on a screen someone might walk away from.
      setSecret("");
      setStatus("done");
    } catch (issue) {
      setError(issue instanceof Error ? issue.message : "Could not submit this.");
      setStatus("ready");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f5f7] px-5 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-[#e2e5e9] bg-white p-8 shadow-[0_20px_60px_-45px_rgba(20,24,28,0.5)]">
        {status === "loading" && (
          <p className="flex items-center gap-2 text-[13px] text-[#6f7883]">
            <LoaderCircle size={15} className="animate-spin" /> Checking this link…
          </p>
        )}

        {status === "invalid" && (
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#fdeeee] text-[#b4453f]">
              <ShieldAlert size={22} />
            </span>
            <h1 className="mt-4 text-[19px] font-semibold text-[#14181c]">This link can&apos;t be used</h1>
            <p className="mt-2 text-[13px] leading-6 text-[#5c656e]">{error}</p>
            <p className="mt-4 text-[12px] leading-5 text-[#8a929b]">
              Secure links work once and expire after 24 hours. Ask the support team for a new one.
            </p>
          </div>
        )}

        {status === "done" && (
          <div className="text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf6ee] text-[#2e7d4f]">
              <CheckCircle2 size={22} />
            </span>
            <h1 className="mt-4 text-[19px] font-semibold text-[#14181c]">Sent securely</h1>
            <p className="mt-2 text-[13px] leading-6 text-[#5c656e]">
              Your information is encrypted and waiting for the support agent. It will be destroyed the
              moment they open it, and this link no longer works.
            </p>
            <p className="mt-4 text-[12px] leading-5 text-[#8a929b]">You can close this page.</p>
          </div>
        )}

        {(status === "ready" || status === "sending") && (
          <>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f0f2f4] text-[#14181c]">
              <Lock size={19} />
            </span>
            <h1 className="mt-4 text-[20px] font-semibold tracking-[-0.01em] text-[#14181c]">
              Support has asked for something private
            </h1>
            <p className="mt-2 text-[13.5px] leading-6 text-[#5c656e]">
              Send it here rather than in the chat. Anything typed into a chat stays in the conversation
              history; this does not.
            </p>

            <div className="mt-6 rounded-xl border border-[#e2e5e9] bg-[#fafbfc] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#8a929b]">Requested</p>
              <p className="mt-1 text-[14px] font-medium text-[#14181c]">{label}</p>
            </div>

            <label htmlFor="secret" className="mt-5 block text-[12.5px] font-semibold text-[#14181c]">
              Your information
            </label>
            <textarea
              id="secret"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              rows={7}
              autoComplete="off"
              spellCheck={false}
              placeholder="Paste it here…"
              className="mt-2 w-full resize-y rounded-xl border border-[#d9dde2] bg-white px-3.5 py-3 font-mono text-[12.5px] leading-5 outline-none focus:border-[#14181c]"
            />

            {error && <p className="mt-2 text-[12px] text-[#b4453f]">{error}</p>}

            <button
              type="button"
              onClick={() => void submit()}
              disabled={!secret.trim() || status === "sending"}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#14181c] text-[13.5px] font-semibold text-white transition hover:bg-black disabled:opacity-40"
            >
              {status === "sending" ? <><LoaderCircle size={15} className="animate-spin" /> Sending securely</> : "Send securely"}
            </button>

            <ul className="mt-5 space-y-1.5 text-[12px] leading-5 text-[#8a929b]">
              <li>· Encrypted before it is stored, and never shown in the chat.</li>
              <li>· Destroyed as soon as the agent opens it — they get one look.</li>
              <li>· This link works once and expires after 24 hours.</li>
            </ul>
          </>
        )}
      </div>
    </main>
  );
}
