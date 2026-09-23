"use client";

import { useState, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CircleAlert, CircleCheck, Paperclip, Upload } from "lucide-react";

const inputClass =
  "w-full rounded-xl border border-black/15 bg-[#faf9f6] px-4 py-3.5 text-[15px] text-black outline-none transition placeholder:text-black/35 hover:border-black/30 focus:border-[#2F8CF0] focus:bg-white focus:ring-2 focus:ring-[#2F8CF0]/20";

const labelClass = "text-xs font-semibold uppercase tracking-[0.1em] text-black/45";

export function ApplicationForm({ roleTitle }: { roleTitle: string }) {
  const reduce = useReducedMotion();
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [resumeName, setResumeName] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    const formData = new FormData(event.currentTarget);
    formData.set("role", roleTitle);

    try {
      const response = await fetch("/api/careers/apply", { method: "POST", body: formData });
      if (!response.ok) throw new Error("submit_failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="flex min-h-[540px] flex-col items-center justify-center rounded-2xl border border-black/10 bg-white p-10 text-center shadow-[0_24px_70px_-45px_rgba(23,24,28,0.4)]"
      >
        <motion.span
          initial={reduce ? false : { scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1, type: "spring", bounce: 0.4 }}
          className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#EAF2FE] text-[#2F8CF0]"
        >
          <CircleCheck size={28} strokeWidth={1.8} />
        </motion.span>
        <h3 className="mb-4 text-3xl font-medium tracking-[-0.04em] text-black">Application received</h3>
        <p className="mb-6 max-w-xs text-sm leading-6 text-black/60">Thanks for applying to {roleTitle}. A human reads every application, and we&apos;ll be in touch if there&apos;s a fit.</p>
        <button onClick={() => setStatus("idle")} className="text-sm text-black/60 underline underline-offset-4 transition hover:text-black">
          Apply for another role
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_24px_70px_-45px_rgba(23,24,28,0.4)] sm:p-8">
      <div className="mb-8 border-b border-black/10 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#2F8CF0]">Apply now</span>
        <h3 className="mt-2 text-3xl font-medium tracking-[-0.045em] text-black">{roleTitle}</h3>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className={labelClass} htmlFor="apply-name">Full name *</label>
          <input required id="apply-name" className={inputClass} placeholder="Jane Doe" type="text" name="name" autoComplete="name" />
        </div>
        <div className="space-y-2">
          <label className={labelClass} htmlFor="apply-email">Email address *</label>
          <input required id="apply-email" className={inputClass} placeholder="jane@company.com" type="email" name="email" autoComplete="email" />
        </div>
        <div className="space-y-2">
          <label className={labelClass} htmlFor="apply-phone">Phone number</label>
          <input id="apply-phone" className={inputClass} placeholder="+1 234 567 890" type="tel" name="phone" autoComplete="tel" />
        </div>
        <div className="space-y-2">
          <label className={labelClass} htmlFor="apply-resume">Resume / CV (PDF, max 5MB)</label>
          <label htmlFor="apply-resume" className="group flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-black/20 bg-[#faf9f6] px-4 py-6 text-center transition hover:border-[#2F8CF0]/60 hover:bg-[#EAF2FE]/40">
            {resumeName ? <Paperclip size={22} className="text-[#2F8CF0]" /> : <Upload size={22} className="text-black/40 transition-colors group-hover:text-[#2F8CF0]" />}
            <span className="text-sm font-medium text-black">{resumeName ?? "Upload your resume"}</span>
            <span className="text-xs text-black/50">{resumeName ? "Tap to choose a different file" : "PDF, up to 5MB"}</span>
            <input accept="application/pdf" className="hidden" type="file" name="resume" id="apply-resume" onChange={(event) => setResumeName(event.target.files?.[0]?.name ?? null)} />
          </label>
        </div>
        <div className="space-y-2">
          <label className={labelClass} htmlFor="apply-cover">Cover note (optional)</label>
          <textarea id="apply-cover" name="coverNote" rows={3} className={`${inputClass} resize-none`} placeholder="Anything you want us to know..." />
        </div>
        {status === "error" && (
          <p className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"><CircleAlert size={16} className="shrink-0" />Something went wrong. Please try again.</p>
        )}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="flex w-full items-center justify-center gap-2.5 rounded-full bg-black py-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#2F8CF0] disabled:pointer-events-none disabled:opacity-60"
        >
          {status === "submitting" ? "Submitting..." : "Submit application"}
        </button>
      </form>
    </div>
  );
}
