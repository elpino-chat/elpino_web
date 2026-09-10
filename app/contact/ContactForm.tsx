"use client";

import { useState, type FormEvent } from "react";
import { useTranslation } from "@/app/hooks/useTranslation";
import { useStoredLanguage } from "@/app/hooks/useStoredLanguage";

const SendIcon = () => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 24 24" height="18" width="18" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.5 1.34558C3.58425 1.34558 3.66714 1.36687 3.74096 1.40747L22.2034 11.5618C22.4454 11.6949 22.5337 11.9989 22.4006 12.2409C22.3549 12.324 22.2865 12.3924 22.2034 12.4381L3.74096 22.5924C3.499 22.7255 3.19497 22.6372 3.06189 22.3953C3.02129 22.3214 3 22.2386 3 22.1543V1.84558C3 1.56944 3.22386 1.34558 3.5 1.34558ZM5 4.38249V10.9999H10V12.9999H5V19.6174L18.8499 11.9999L5 4.38249Z"></path>
  </svg>
);

const inputClass =
  "w-full rounded-xl border border-[#0d0d0d]/15 bg-[#f8f8f6] px-4 py-4 text-[15px] text-[#0d0d0d] outline-none transition placeholder:text-black/30 hover:border-[#0d0d0d]/30 focus:border-[#0d0d0d] focus:bg-white focus:ring-2 focus:ring-[#ff584a]/15";

export function ContactForm() {
  const language = useStoredLanguage();
  const { t } = useTranslation(language as any);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = { name: formData.get("name"), email: formData.get("email"), company: formData.get("company"), inquiryType: formData.get("inquiryType"), message: formData.get("message") };
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!response.ok) throw new Error("submit_failed");
      setStatus("success");
      form.reset();
    } catch { setStatus("error"); }
  }

  if (status === "success") {
    return (
      <div className="flex min-h-[540px] flex-col items-center justify-center rounded-[2rem] bg-white p-10 text-center">
        <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#ff584a] text-xl text-white">✓</span>
        <h3 className="mb-4 font-instrument-serif text-4xl font-normal text-[#0d0d0d]">{t("contact.form.successTitle", "Message sent")}</h3>
        <p className="mb-6 leading-6 text-black/60">{t("contact.form.successBody", "Thanks for reaching out. We'll get back to you shortly.")}</p>
        <button onClick={() => setStatus("idle")} className="text-sm text-black/60 underline underline-offset-4 transition hover:text-black">{t("contact.form.sendAnother", "Send another message")}</button>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-[0_24px_70px_-45px_rgba(0,0,0,0.35)] md:p-10">
      <div className="mb-8 flex items-end justify-between border-b border-[#0d0d0d]/12 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff584a]">{t("contact.form.yourMessage", "Your message")}</span>
          <h3 className="mt-2 font-instrument-serif text-4xl font-normal tracking-[-0.035em] text-[#0d0d0d]">{t("contact.form.howCanWeHelp", "How can we help?")}</h3>
        </div>
        <span className="hidden text-xs text-black/40 sm:block">{t("contact.form.requiredNote", "All fields marked * are required")}</span>
      </div>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2"><label className="text-xs uppercase tracking-[0.1em] text-gray-500">{t("contact.form.fullName", "Full name *")}</label><input required name="name" type="text" className={inputClass} placeholder={t("contact.form.fullNamePlaceholder", "Jane Doe")} /></div>
          <div className="flex flex-col gap-2"><label className="text-xs uppercase tracking-[0.1em] text-gray-500">{t("contact.form.workEmail", "Work email *")}</label><input required name="email" type="email" className={inputClass} placeholder={t("contact.form.workEmailPlaceholder", "jane@company.com")} /></div>
        </div>
        <div className="flex flex-col gap-2"><label className="text-xs uppercase tracking-[0.1em] text-gray-500">{t("contact.form.company", "Company")}</label><input name="company" type="text" className={inputClass} placeholder={t("contact.form.companyPlaceholder", "Acme Corp")} /></div>
        <div className="flex flex-col gap-2"><label className="text-xs uppercase tracking-[0.1em] text-gray-500">{t("contact.form.inquiryType", "Inquiry type *")}</label><select required name="inquiryType" defaultValue="Sales & Enterprise" className={`${inputClass} appearance-none`}><option>{t("contact.form.inquirySales", "Sales & Enterprise")}</option><option>{t("contact.form.inquiryTechnical", "Technical Support")}</option><option>{t("contact.form.inquiryPartnerships", "Partnerships")}</option><option>{t("contact.form.inquiryOther", "Other")}</option></select></div>
        <div className="flex flex-col gap-2"><label className="text-xs uppercase tracking-[0.1em] text-gray-500">{t("contact.form.message", "Message *")}</label><textarea required name="message" rows={5} className={`${inputClass} resize-none`} placeholder={t("contact.form.messagePlaceholder", "How can we help you?")} /></div>
        {status === "error" && <p className="text-xs text-red-600">{t("contact.form.error", "Something went wrong. Please try again.")}</p>}
        <button type="submit" disabled={status === "submitting"} className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#0d0d0d] py-4 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-[#ff584a] disabled:pointer-events-none disabled:opacity-60">{status === "submitting" ? t("contact.form.sending", "Sending...") : t("contact.form.send", "Send message")}<SendIcon /></button>
        <p className="text-center text-xs text-gray-500">{t("contact.form.agreeText", "By sending this, you agree to our")} <a href="/privacy" className="text-[#11120f] underline underline-offset-4">{t("contact.form.privacy", "Privacy Policy")}</a>.</p>
      </form>
    </div>
  );
}
