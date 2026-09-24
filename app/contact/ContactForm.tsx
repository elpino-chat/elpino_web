"use client";

import { useState, type FormEvent } from "react";
import { CircleAlert, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";

// The contact form, as a postcard. Left: the message on ruled paper. Right: who
// it's from, and which desk it should land on. Sending it mails the postcard:
// an envelope flies off and a SENT stamp slams down. Same endpoint and same
// fields as before, nothing else about what gets submitted has changed.

export type Desk = "sales" | "technical" | "partnerships" | "other";

const airmail = "repeating-linear-gradient(-45deg, #3784ff 0 14px, #ffffff 14px 28px, #fc7b33 28px 42px, #ffffff 42px 56px)";

const fieldClass =
  "w-full border-0 border-b-2 border-[#11120f] bg-transparent px-0 py-2 text-[16px] text-[#11120f] outline-none transition placeholder:text-black/30 focus:border-[#3784ff] focus:shadow-[0_2px_0_0_#3784ff]";
const labelClass = "font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-black/50";

export function Envelope({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 84" className={className} aria-hidden="true">
      <rect x="3" y="3" width="114" height="78" rx="8" fill="#fff8ec" stroke="#11120f" strokeWidth="4" />
      <path d="M6 10 60 50 114 10" fill="none" stroke="#11120f" strokeWidth="4" strokeLinejoin="round" />
      <path d="M6 76 46 40M114 76 74 40" fill="none" stroke="#11120f" strokeWidth="4" strokeLinecap="round" />
      <circle cx="60" cy="50" r="10" fill="#fc7b33" stroke="#11120f" strokeWidth="4" />
    </svg>
  );
}

export function ContactForm({ desk, onDeskChange }: { desk: Desk; onDeskChange: (desk: Desk) => void }) {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const desks: { key: Desk; label: string; color: string; ink: boolean }[] = [
    { key: "sales", label: t("contact.form.inquirySales", "Sales & Enterprise"), color: "#3784ff", ink: false },
    { key: "technical", label: t("contact.form.inquiryTechnical", "Technical Support"), color: "#ffd84d", ink: true },
    { key: "partnerships", label: t("contact.form.inquiryPartnerships", "Partnerships"), color: "#7060bd", ink: false },
    { key: "other", label: t("contact.form.inquiryOther", "Other"), color: "#fc7b33", ink: false },
  ];
  const chosen = desks.find((item) => item.key === desk) ?? desks[0];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = { name: formData.get("name"), email: formData.get("email"), company: formData.get("company"), inquiryType: chosen.label, message: formData.get("message") };
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("submit_failed");
      setStatus("success");
      form.reset();
    } catch {
      setStatus("error");
    }
  }

  const today = new Date().toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();

  if (status === "success") {
    return (
      <div className="relative flex min-h-[560px] flex-col items-center justify-center overflow-hidden rounded-[28px] border-2 border-[#11120f] bg-[#fffdf5] p-10 text-center" role="status">
        <span aria-hidden="true" className="absolute inset-x-0 top-0 h-3" style={{ background: airmail }} />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3" style={{ background: airmail }} />
        {/* the envelope appears, then is mailed away */}
        <div className="relative h-32 w-44" aria-hidden="true">
          <Envelope className="absolute inset-0 h-full w-full animate-[elpino-mail_2.6s_cubic-bezier(0.5,0,0.3,1)_both]" />
        </div>
        <span aria-hidden="true" className="elpino-stamp mt-6 rotate-[-8deg] rounded-lg border-[3px] border-[#1aa37a] px-4 py-1 font-mono text-[18px] font-bold uppercase tracking-[0.2em] text-[#1aa37a]" style={{ animationDelay: "1.9s" }}>Sent ✓</span>
        <h3 className="mt-6 animate-[elpino-focus_0.7s_ease-out_1.9s_both] text-4xl font-normal tracking-[-0.04em]">{t("contact.form.successTitle", "Message sent")}</h3>
        <p className="mt-3 max-w-sm animate-[elpino-focus_0.7s_ease-out_2.1s_both] leading-6 text-black/60">{t("contact.form.successBody", "Thanks for reaching out. We'll get back to you shortly.")}</p>
        <button type="button" onClick={() => setStatus("idle")} className="mt-6 animate-[elpino-focus_0.7s_ease-out_2.3s_both] rounded-full border-2 border-[#11120f] bg-[#ffd84d] px-6 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5">{t("contact.form.sendAnother", "Send another message")}</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-[28px] border-2 border-[#11120f] bg-[#fffdf5]">
      <span aria-hidden="true" className="absolute inset-x-0 top-0 h-3" style={{ background: airmail }} />
      <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3" style={{ background: airmail }} />

      <div className="grid gap-0 px-6 pb-9 pt-9 md:grid-cols-[1.15fr_0.85fr] md:px-10 md:pb-12 md:pt-12">
        {/* Message side */}
        <div className="md:pr-10">
          <span className={labelClass}>{t("contact.form.yourMessage", "Your message")}</span>
          <h3 className="mt-2 text-4xl font-normal tracking-[-0.045em]">{t("contact.form.howCanWeHelp", "How can we help?")}</h3>
          <label htmlFor="contact-message" className="sr-only">{t("contact.form.message", "Message *")}</label>
          <textarea
            required
            name="message"
            id="contact-message"
            rows={8}
            placeholder={t("contact.form.messagePlaceholder", "How can we help you?")}
            className="mt-6 block w-full resize-none border-0 bg-transparent px-0 py-0 text-[17px] text-[#11120f] outline-none placeholder:text-black/30"
            style={{ lineHeight: "32px", backgroundImage: "repeating-linear-gradient(transparent 0 31px, rgba(55,132,255,0.28) 31px 32px)", backgroundAttachment: "local" }}
          />
          <p className="mt-3 text-xs text-black/40">{t("contact.form.requiredNote", "All fields marked * are required")}</p>
        </div>

        {/* Address side */}
        <div className="relative mt-10 border-t-2 border-dashed border-[#11120f]/40 pt-8 md:mt-0 md:border-l-2 md:border-t-0 md:pl-10 md:pt-0">
          {/* stamp and postmark */}
          <div aria-hidden="true" className="absolute right-0 top-0 hidden h-24 w-20 rotate-3 items-center justify-center rounded-sm border-2 border-[#11120f] bg-white outline-2 outline-offset-[3px] outline-[#11120f]/50 [outline-style:dashed] md:flex md:right-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.png" alt="" className="h-14 w-14 object-contain" />
          </div>
          <div aria-hidden="true" className="absolute right-[64px] top-2 hidden h-20 w-20 -rotate-12 items-center justify-center rounded-full border-2 border-dashed border-[#11120f]/45 text-center font-mono text-[8.5px] font-bold uppercase leading-tight tracking-[0.06em] text-[#11120f]/55 md:flex">
            Elpino<br />mail<br />{today}
          </div>

          <div className="space-y-5 md:pt-24">
            <div>
              <label className={labelClass} htmlFor="contact-name">{t("contact.form.fullName", "Full name *")}</label>
              <input required name="name" id="contact-name" type="text" autoComplete="name" className={fieldClass} placeholder={t("contact.form.fullNamePlaceholder", "Jane Doe")} />
            </div>
            <div>
              <label className={labelClass} htmlFor="contact-email">{t("contact.form.workEmail", "Work email *")}</label>
              <input required name="email" id="contact-email" type="email" autoComplete="email" className={fieldClass} placeholder={t("contact.form.workEmailPlaceholder", "jane@company.com")} />
            </div>
            <div>
              <label className={labelClass} htmlFor="contact-company">{t("contact.form.company", "Company")}</label>
              <input name="company" id="contact-company" type="text" autoComplete="organization" className={fieldClass} placeholder={t("contact.form.companyPlaceholder", "Acme Corp")} />
            </div>
            <fieldset>
              <legend className={labelClass}>{t("contact.form.inquiryType", "Inquiry type *")}</legend>
              <div className="mt-2.5 flex flex-wrap gap-2">
                {desks.map((item) => {
                  const on = item.key === desk;
                  return (
                    <label key={item.key} className={`cursor-pointer rounded-full border-2 border-[#11120f] px-3.5 py-1.5 text-[13.5px] font-semibold transition hover:-translate-y-0.5 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#3784ff] ${on ? "" : "bg-white"}`} style={on ? { background: item.color, color: item.ink ? "#11120f" : "#fff" } : undefined}>
                      <input type="radio" name="desk" value={item.key} checked={on} onChange={() => onDeskChange(item.key)} className="sr-only" />
                      {item.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-[#11120f] bg-white px-6 py-5 md:px-10">
        {status === "error" && (
          <p role="alert" className="mb-4 flex items-center gap-2 rounded-xl border-2 border-[#11120f] bg-[#ffe3e0] px-4 py-3 text-sm"><CircleAlert size={16} className="shrink-0" />{t("contact.form.error", "Something went wrong. Please try again.")}</p>
        )}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 text-xs text-black/50">
            <p className="inline-flex items-center gap-1.5"><ShieldCheck size={14} className="text-[#3784ff]" />Sent securely — never used for training</p>
            <p>{t("contact.form.agreeText", "By sending this, you agree to our")} <a href="/privacy" className="font-semibold text-[#11120f] underline decoration-[#3784ff] decoration-2 underline-offset-4">{t("contact.form.privacy", "Privacy Policy")}</a>.</p>
          </div>
          <button type="submit" disabled={status === "submitting"} className="group inline-flex h-13 items-center justify-center gap-2.5 rounded-full border-2 border-[#11120f] bg-[#3784ff] px-9 text-[15px] font-semibold text-white transition duration-200 hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-70">
            {status === "submitting" ? t("contact.form.sending", "Sending...") : <>{t("contact.form.send", "Send message")} <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span></>}
          </button>
        </div>
      </div>
    </form>
  );
}
