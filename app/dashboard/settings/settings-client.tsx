"use client";

import { UpgradeDialog } from "@/app/components/dashboard/UpgradeDialog";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import posthog from "posthog-js";
import Link from "next/link";
import {
  ANNUAL_SAVING_PERCENT,
  getAnnualTotal,
  getPlanPrice,
  plans as pricingPlans,
} from "@/app/components/PricingCards";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { Switch } from "@/components/ui/switch";
import { readDashboardTheme, saveDashboardTheme, type DashboardAppearance } from "@/app/components/dashboard/DashboardThemeProvider";
import { InvitePeopleDialog } from "@/app/components/dashboard/InvitePeopleDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { PreChatField } from "@/app/dashboard/components/prechat-form-editor";
import { ContactCollectionSwitch } from "@/app/dashboard/components/contact-collection-switch";
import { useMobileDrawer } from "@/app/components/dashboard/mobile-drawer-context";
import { SUPPORTED_LANGUAGES } from "@/app/dashboard/settings/languages";
import { IdentityVerificationSettingsPage } from "@/app/dashboard/settings/IdentityVerificationSettings";
import { ConnectPageContent } from "@/app/dashboard/connect/ConnectPageContent";
import {
  defaultAvailability,
  describeWindow,
  guessTimezone,
  normalizeAvailability,
  ownWeeklyMinutes,
  DAY_KEYS,
  DAY_LABELS,
  type Availability,
  type DayKey,
  type DayWindow,
} from "@/lib/availability";
import {
  ArrowRight,
  Bot,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleGauge,
  CircleAlert,
  CircleHelp,
  Code2,
  Copy,
  Clock3,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  BookOpen,
  Globe2,
  HeartPulse,
  Home,
  Info,
  Languages,
  LockKeyhole,
  LoaderCircle,
  KeyRound,
  LogOut,
  Mail,
  Mic,
  MessageCircle,
  MessagesSquare,
  MessageSquarePlus,
  Monitor,
  MoreHorizontal,
  Paperclip,
  Pencil,
  Plus,
  Rocket,
  Hourglass,
  Puzzle,
  Radio,
  RefreshCw,
  ReceiptText,
  Save,
  Scale,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smile,
  Table2,
  Trash2,
  Upload,
  UserRound,
  UserCog,
  UserCheck,
  UserPlus,
  X,
  UsersRound,
} from "lucide-react";

type SettingsUser = { email: string; name?: string };

// Only the workspace owner can invite people or change security policy —
// there is no separate "admin" role yet, so gating checks role === "owner".
function useMyRole() {
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    fetch("/api/organizations")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { organizations?: { id: string; role: string }[]; selectedOrganizationId?: string } | null) => {
        const organizations = data?.organizations ?? [];
        const selected = organizations.find((org) => org.id === data?.selectedOrganizationId) ?? organizations[0];
        setRole(selected?.role ?? null);
      })
      .catch(() => setRole(null));
  }, []);
  return role;
}

/**
 * The workspace the signed-in user is currently in, with its name and their
 * role — what the Danger Zone needs to decide between "Delete workspace"
 * (owner) and "Remove workspace" (everyone else) and to name the workspace
 * in the confirmation copy.
 */
function useCurrentWorkspace() {
  const [workspace, setWorkspace] = useState<{ id: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/organizations")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { organizations?: { id: string; name: string; role: string }[]; selectedOrganizationId?: string } | null) => {
        const organizations = data?.organizations ?? [];
        const selected = organizations.find((org) => org.id === data?.selectedOrganizationId) ?? organizations[0];
        setWorkspace(selected ?? null);
      })
      .catch(() => setWorkspace(null))
      .finally(() => setLoading(false));
  }, []);
  return { workspace, loading };
}

// Personal to the signed-in user, independent of which workspace they're in.
const accountItems = [
  { label: "General", slug: "", icon: Settings },
  { label: "Billing", slug: "billing", icon: CreditCard },
  { label: "Availability", slug: "availability", icon: CalendarDays },
  { label: "Security & Permissions", slug: "security-permissions", icon: ShieldCheck },
];

// A representative flag per supported language, for the reply-language
// picker — same flagsapi.com country-code convention as AuthFlow's
// language switcher (English maps to "gb" there too).
const LANGUAGE_COUNTRY_CODES: Record<string, string> = {
  en: "gb", es: "es", fr: "fr", de: "de", pt: "pt", it: "it", nl: "nl",
  ja: "jp", ko: "kr", zh: "cn", ar: "sa", hi: "in", ru: "ru", tr: "tr",
  pl: "pl", sv: "se", vi: "vn", th: "th", id: "id",
};

function LanguageFlag({ countryCode }: { countryCode: string }) {
  return <img src={`https://flagsapi.com/${countryCode.toUpperCase()}/flat/32.png`} alt="" className="h-4 w-5 shrink-0 rounded-sm object-cover" />;
}

const chatbotItems = [
  { label: "Chatbot Interface", slug: "chatbot", icon: Bot },
  { label: "Identity Verification", slug: "identity", icon: UserCheck },
  { label: "Restrictions", slug: "chatbot-restrictions", icon: ShieldCheck },
];

// Shared workspace configuration, visible the same way to every teammate.
const workspaceItems = [
  { label: "Information", slug: "information", icon: Info },
  { label: "Teams", slug: "teams", icon: UserRound },
  { label: "Presence Log", slug: "presence-log", icon: Radio },
  { label: "Usage", slug: "ai-usage", icon: CircleGauge },
  { label: "Setup & Integration", slug: "setup-integration", icon: Puzzle },
  { label: "Data Limits & Legal", slug: "data-legal", icon: Scale },
  { label: "Danger Zone", slug: "danger-zone", icon: CircleAlert },
];

const pageDetails: Record<string, { description: string; action?: string; sections: Array<{ title: string; description: string; value?: string }> }> = {
  Upgrade: { description: "Choose a plan that grows with your support operation.", action: "Compare plans", sections: [{ title: "Current plan", description: "Core workspace tools for getting started.", value: "Free" }, { title: "Business features", description: "Unlock advanced security, automation, and reporting.", value: "Available" }] },
  Billing: { description: "Manage subscription, payment details, and invoices.", action: "Add payment method", sections: [{ title: "Subscription", description: "Your workspace is currently on the Free plan.", value: "$0 / month" }, { title: "Billing history", description: "Invoices and payment receipts will appear here.", value: "No invoices" }] },
  "Security & Permissions": { description: "Control access, authentication, and workspace permissions.", sections: [{ title: "Authentication", description: "Require secure sign-in methods for workspace members.", value: "Standard" }, { title: "Default member role", description: "Access granted to newly invited teammates.", value: "Member" }, { title: "Two-factor authentication", description: "Add an extra layer of security to team accounts.", value: "Optional" }] },
  "Audit Logs": { description: "Review important workspace activity and security events.", action: "Export logs", sections: [{ title: "Recent activity", description: "Profile and workspace events from the last 30 days.", value: "Up to date" }, { title: "Data retention", description: "Audit events are retained according to your plan.", value: "30 days" }] },
  Trash: { description: "Review and restore recently deleted workspace content.", sections: [{ title: "Trash is empty", description: "Deleted conversations, templates, and automations will appear here.", value: "0 items" }] },
  "Tag Manager": { description: "Create and organize labels used throughout your workspace.", action: "Create tag", sections: [{ title: "Workspace tags", description: "Group, filter, and route conversations with shared labels.", value: "0 tags" }] },
};

function FeatureSettingsPage({ title }: { title: string }) {
  const details = pageDetails[title];
  return (
    <div className="mx-auto w-full max-w-[960px] px-8 pb-16 pt-9 sm:px-10 lg:px-12">
      <div className="flex items-start justify-between gap-5">
        <div><h2 className="text-[26px] font-semibold tracking-[-0.025em] text-black">{title}</h2><p className="mt-2 text-[13px] text-[#737373]">{details.description}</p></div>
        {details.action && <button type="button" className="shrink-0 rounded-xl bg-[#202020] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-black">{details.action}</button>}
      </div>
      <div className="mt-9 overflow-hidden rounded-xl border border-[#dedede] bg-white">
        {details.sections.map((section, index) => (
          <button key={section.title} type="button" className={`group flex w-full items-center gap-5 px-5 py-5 text-left transition hover:bg-[#fafafa] ${index ? "border-t border-[#e7e7e7]" : ""}`}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1f1f1] text-black"><CircleGauge size={18} /></span>
            <span className="min-w-0 flex-1"><span className="block text-[13px] font-medium text-black">{section.title}</span><span className="mt-1 block text-[11px] leading-4 text-[#808080]">{section.description}</span></span>
            {section.value && <span className="shrink-0 text-[11px] font-medium text-[#666]">{section.value}</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

function formatCents(cents: number) {
  return (cents / 100).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function addMonthsClamped(date: Date, months: number) {
  const result = new Date(date);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, lastDay));
  return result;
}

// When the monthly allowance next resets. A monthly paid plan resets when it
// renews; Free and annual plans reset on a monthly step from the period start
// (the backend rolls them lazily the same way).
function nextAllowanceReset(entitlement: { creditBased?: boolean; cadence?: "monthly" | "annual"; currentPeriodStart: string; currentPeriodEnd: string | null }) {
  const now = new Date();
  if (entitlement.creditBased && entitlement.cadence !== "annual" && entitlement.currentPeriodEnd) {
    const end = new Date(entitlement.currentPeriodEnd);
    if (!Number.isNaN(end.getTime()) && end > now) return end;
  }
  const start = new Date(entitlement.currentPeriodStart);
  if (Number.isNaN(start.getTime())) return null;
  for (let step = 1; step < 600; step += 1) {
    const next = addMonthsClamped(start, step);
    if (next > now) return next;
  }
  return null;
}

function formatResetDate(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function AIUsageSettingsPage() {
  const [creditsCents, setCreditsCents] = useState<number | null>(null);
  // Free is limited by AI messages, not dollars, so the credit balance, "Add
  // credits" and auto-recharge only make sense on credit-based (paid) plans.
  // null while loading, so they don't flash in and out for Free workspaces.
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  useEffect(() => {
    fetch("/api/billing/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((status: BillingStatus | null) => setBilling(status))
      .catch(() => setBilling(null));
  }, []);
  const entitlement = billing?.entitlement;
  const creditBased: boolean | null = entitlement ? Boolean(entitlement.creditBased) : null;
  const isFreePlan = creditBased === false;
  const resetAt = entitlement ? nextAllowanceReset(entitlement) : null;
  const daysToReset = resetAt ? Math.max(0, Math.ceil((resetAt.getTime() - Date.now()) / 86_400_000)) : 0;
  const messagesUsed = entitlement?.resolutionsUsed ?? 0;
  const messagesTotal = entitlement?.resolutionsIncluded ?? 0;
  const grantCents = entitlement?.aiCreditGrantUsdCents ?? 0;
  // Where the balance came from. The grant resets every period; purchased
  // credit does not, and the split is the whole reason buying credit is worth
  // doing, so the UI says which is which rather than showing one number.
  const [grantedCents, setGrantedCents] = useState(0);
  const [purchasedCents, setPurchasedCents] = useState(0);
  const [autoRecharge, setAutoRecharge] = useState<AutoRechargeSettings | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loadingCredits, setLoadingCredits] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [addAmount, setAddAmount] = useState("");
  const [saveCard, setSaveCard] = useState(true);
  const [savePhone, setSavePhone] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const [addNotice, setAddNotice] = useState<string | null>(null);
  const [autoBusy, setAutoBusy] = useState(false);

  function loadCredits() {
    setLoadingCredits(true);
    fetch("/api/workspace/usage/credits")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: CreditsResponse | null) => {
        setCreditsCents(data?.balanceCents ?? null);
        setGrantedCents(data?.grantedCents ?? 0);
        setPurchasedCents(data?.purchasedCents ?? 0);
        setAutoRecharge(data?.autoRecharge ?? null);
        setIsOwner(Boolean(data?.isOwner));
      })
      .catch(() => setCreditsCents(null))
      .finally(() => setLoadingCredits(false));
  }
  useEffect(loadCredits, []);

  /**
   * Buys AI credit through Razorpay.
   *
   * The balance does not move here. This opens an order, the customer pays in
   * Razorpay's modal, and the signed webhook credits the workspace — the same
   * contract as a plan upgrade. Before this, the dialog called an endpoint
   * that incremented the balance straight from the number in the input, with
   * no payment behind it at all.
   */
  async function submitAddCredits() {
    const dollars = Number(addAmount);
    if (!dollars || dollars <= 0 || adding) {
      setAddError("Enter a positive dollar amount.");
      return;
    }
    // Razorpay rejects a saved-card order for a customer with no phone number
    // on file — checked here so the customer sees it before a round trip.
    if (saveCard && !savePhone.trim()) {
      setAddError("Enter a phone number to save this card.");
      return;
    }
    setAdding(true);
    setAddError(null);
    setAddNotice(null);
    try {
      const response = await fetch("/api/workspace/usage/credits/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amountCents: Math.round(dollars * 100), saveCard, phone: saveCard ? savePhone.trim() : undefined }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        orderId?: string;
        keyId?: string;
        amountMinor?: number;
        currency?: string;
        message?: string;
      };
      if (!response.ok || !data.orderId || !data.keyId) {
        setAddError(data.message ?? "Could not start the top-up");
        return;
      }

      await openRazorpayCheckout({
        keyId: data.keyId,
        orderId: data.orderId,
        amountPaise: data.amountMinor,
        description: `$${dollars.toFixed(2)} of AI credit`,
      });

      setAddOpen(false);
      setAddAmount("");
      setSavePhone("");
      setAddNotice("Payment received — your credit will appear in a moment.");
      // Razorpay has taken the money, but the webhook decides the balance.
      // Re-read rather than adding the amount optimistically.
      loadCredits();
    } catch (issue) {
      setAddError(issue instanceof Error ? issue.message : "Could not add credits");
    } finally {
      setAdding(false);
    }
  }

  /** Turns auto-recharge on or off, or adjusts what it charges. */
  async function saveAutoRecharge(patch: {
    enabled?: boolean;
    amountCents?: number | null;
    monthlyCapCents?: number | null;
  }) {
    setAutoBusy(true);
    setAddError(null);
    try {
      const response = await fetch("/api/workspace/usage/credits/auto-recharge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setAddError(data.message ?? "Could not update auto-recharge");
        return;
      }
      loadCredits();
    } finally {
      setAutoBusy(false);
    }
  }

  const [manageOpen, setManageOpen] = useState(false);
  // "Add credits to continue" only reads right when the balance is nearly gone.
  const creditLow = creditsCents !== null && creditsCents <= Math.max(0, grantCents * 0.15);
  // How much of this month's allowance is gone, against how much of the month
  // has passed — that comparison is what the headline is built from.
  const usedPercent = !entitlement
    ? 0
    : isFreePlan
      ? messagesTotal > 0 ? Math.min(100, (messagesUsed / messagesTotal) * 100) : 0
      : grantCents > 0 ? Math.min(100, Math.max(0, ((grantCents - grantedCents) / grantCents) * 100)) : 0;
  return (
    <div className="dashboard-ai-usage-page mx-auto w-full max-w-[1280px] px-6 pb-16 pt-8 text-white/90 sm:px-9">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
            <h2 className="text-[30px] font-medium tracking-[-0.04em] text-white/90">Usage</h2>
            <p className="mt-2 text-[13px] text-white/60">Your plan allowance and credits. Dates are shown in UTC.</p>
        </div>
        {entitlement && (
          <button type="button" onClick={() => (isFreePlan ? setUpgradeOpen(true) : setAddOpen(true))} className="flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-transparent px-4 text-[13px] font-semibold text-white/90 transition hover:bg-white/[0.06]">
            {isFreePlan ? <><Rocket size={14} /> Upgrade plan</> : <><Plus size={14} /> {creditLow ? "Add credits to continue" : "Add credits"}</>}
          </button>
        )}
      </header>

      <section className="mt-6 rounded-xl bg-white p-6">
        {!entitlement ? (
          <div className="flex h-[140px] items-center justify-center text-[13px] text-[#8b9398]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading plan</div>
        ) : (
          <>
            <div>
              <div className="grid items-center gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_84px] sm:gap-6">
                <div>
                  <p className="text-[14px] font-medium">AI usage</p>
                  <p className="mt-0.5 text-[12px] text-[#8b9398]">
                    {isFreePlan ? `${messagesUsed.toLocaleString()} of ${messagesTotal.toLocaleString()} messages used` : `${formatCents(Math.max(0, grantCents - grantedCents))} of ${formatCents(grantCents)} used`}
                  </p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e8ecef]"><div className="h-full rounded-full bg-[#428ce5] transition-all" style={{ width: `${usedPercent}%` }} /></div>
                <p className="text-[13px] text-[#5f686d] sm:text-right">{Math.round(usedPercent)}% used</p>
              </div>
            </div>

            <div className="mt-2 flex gap-4 rounded-xl p-5">
              <Hourglass size={32} strokeWidth={1.2} className="mt-0.5 shrink-0 text-[#9aa2a7]" />
              <div className="min-w-0">
                <p className="text-[14px] font-semibold">Resets</p>
                <p className="mt-0.5 text-[12.5px] leading-5 text-[#667069]">
                  {resetAt
                    ? isFreePlan
                      ? `Your ${messagesTotal.toLocaleString()} AI messages refill on ${formatResetDate(resetAt)}, in ${daysToReset} day${daysToReset === 1 ? "" : "s"}. Unused messages don't roll over.`
                      : `Your plan credit refills on ${formatResetDate(resetAt)}, in ${daysToReset} day${daysToReset === 1 ? "" : "s"}. Unused plan credit doesn't roll over.`
                    : "Your allowance refills every month."}
                </p>
                {!isFreePlan && (
                  <>
                    <p className="mt-4 text-[14px] font-semibold">Purchased credit</p>
                    <p className="mt-0.5 text-[12.5px] leading-5 text-[#667069]">
                      {purchasedCents > 0
                        ? `${formatCents(purchasedCents)} of purchased credit is on top of your plan credit, and it never expires.`
                        : "No purchased credit right now. Anything you buy never expires."}
                    </p>
                  </>
                )}
              </div>
            </div>

          </>
        )}
      </section>

      {creditBased && (
      <section className="mt-4 rounded-xl border border-[#dfe3e6] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[15px] font-semibold">Usage credits</h3>
            <p className="mt-1 text-[12.5px] text-[#667069]">Available for any task. Plan credit is used before purchased credit.</p>
          </div>
          <p className="text-[15px] font-semibold tabular-nums">{creditBased ? (loadingCredits ? "…" : formatCents(creditsCents ?? 0)) : "$0"}</p>
        </div>

        {creditBased ? (
          <>
            {isOwner && (
              <div className="mt-5 flex items-center justify-between gap-4">
                <p className="max-w-xl text-[13px] leading-5 text-[#5f686d]">
                  {autoRecharge?.cardOnFile
                    ? "Turn on auto-recharge to keep the AI answering if you run out of credit."
                    : "Buy credit once with “Save this card” ticked, and you can turn on auto-recharge."}
                </p>
                <Switch
                  checked={Boolean(autoRecharge?.enabled)}
                  disabled={autoBusy || !autoRecharge?.cardOnFile}
                  onCheckedChange={(next) =>
                    void saveAutoRecharge({
                      enabled: next,
                      // Top up by $10 unless a different amount was chosen,
                      // and never more than $50 a month by default.
                      amountCents: autoRecharge?.amountCents ?? 1000,
                      monthlyCapCents: autoRecharge?.monthlyCapCents ?? 5000,
                    })
                  }
                />
              </div>
            )}

            {autoRecharge?.lastError && (
              <p role="alert" className="mt-3 rounded-xl border border-[#E9C8CC] bg-[#FFF7F7] px-3 py-2 text-[11.5px] text-[#A5414B]">{autoRecharge.lastError}</p>
            )}

            {isOwner && (
              <div className="mt-6 border-t border-[#eef0f1] pt-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-semibold">Monthly auto-recharge limit</p>
                    <p className="mt-1 text-[12.5px] text-[#667069]">
                      {autoRecharge?.enabled
                        ? `Up to ${formatCents(autoRecharge.monthlyCapCents ?? 5000)} a month · Auto-recharge on`
                        : "Auto-recharge off"}
                    </p>
                  </div>
                  <button type="button" onClick={() => setManageOpen((open) => !open)} className="h-9 rounded-lg px-3 text-[13px] font-medium text-[#33383c] transition hover:bg-[#f0f2f3]">
                    {manageOpen ? "Close" : "Manage"}
                  </button>
                </div>

                {manageOpen && (
                  autoRecharge?.cardOnFile ? (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <label className="block">
                        <span className="block text-[11.5px] font-semibold text-[#17233A]">Recharge by</span>
                        <select
                          value={String(autoRecharge.amountCents ?? 1000)}
                          disabled={autoBusy}
                          onChange={(event) => void saveAutoRecharge({ amountCents: Number(event.target.value) })}
                          className="mt-1.5 h-10 w-full rounded-xl border border-[#DDE4E8] bg-white px-3 text-[12.5px]"
                        >
                          {[500, 1000, 2500, 5000, 10000].map((cents) => (
                            <option key={cents} value={cents}>{formatCents(cents)}</option>
                          ))}
                        </select>
                      </label>
                      <label className="block">
                        <span className="block text-[11.5px] font-semibold text-[#17233A]">Never more than, per month</span>
                        <select
                          value={String(autoRecharge.monthlyCapCents ?? 5000)}
                          disabled={autoBusy}
                          onChange={(event) => void saveAutoRecharge({ monthlyCapCents: Number(event.target.value) })}
                          className="mt-1.5 h-10 w-full rounded-xl border border-[#DDE4E8] bg-white px-3 text-[12.5px]"
                        >
                          {[2500, 5000, 10000, 25000, 50000].map((cents) => (
                            <option key={cents} value={cents}>{formatCents(cents)}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                  ) : (
                    <p className="mt-4 text-[12.5px] text-[#667069]">Buy credit once with {"“"}Save this card{"”"} ticked, and you can set how much to top up and the monthly limit here.</p>
                  )
                )}
              </div>
            )}
          </>
        ) : (
          <div className="flex h-[72px] items-center justify-center text-[13px] text-[#8b9398]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading</div>
        )}
      </section>
      )}

      {addNotice && (
        <div role="status" className="mt-4 rounded-2xl border border-[#CBD9D0] bg-[#F5FAF7] px-5 py-3 text-[12.5px] text-[#33684C]">{addNotice}</div>
      )}

      <UpgradeDialog open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      {addOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setAddOpen(false); }}>
          <div role="dialog" aria-modal="true" className="dashboard-add-credits-dialog w-full max-w-[380px] overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between border-b border-[#E5E9EB] px-6 py-5">
              <div>
                <h3 className="text-[16px] font-semibold tracking-[-0.02em]">Add AI credits</h3>
                <p className="mt-1 text-[12px] text-[#667069]">Paid through Razorpay. Credit lands once the payment clears and never expires.</p>
              </div>
              <button type="button" onClick={() => setAddOpen(false)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-[#F0F2F3]"><X size={16} /></button>
            </div>
            <div className="p-6">
              <label className="block text-[12.5px] font-semibold text-[#17233A]">Amount (USD)</label>
              <div className="mt-2 flex h-11 items-center rounded-xl border border-[#DDE4E8] px-3 focus-within:border-[#11120f] focus-within:ring-2 focus-within:ring-[#11120f]/8">
                <span className="text-[13px] text-[#7B858A]">$</span>
                <input value={addAmount} onChange={(event) => { setAddAmount(event.target.value.replace(/[^0-9.]/g, "")); setAddError(null); }} placeholder="25.00" inputMode="decimal" className="ml-1.5 h-full flex-1 bg-transparent text-[13px] outline-none" />
              </div>
              <div className="mt-3 flex gap-2">
                {[10, 25, 50, 100].map((amount) => (
                  <button key={amount} type="button" onClick={() => setAddAmount(String(amount))} className="h-8 rounded-full border border-[#DDE4E8] px-3 text-[11.5px] font-semibold text-[#17233A] transition hover:bg-[#F7F8FA]">${amount}</button>
                ))}
              </div>
              <label className="mt-4 flex cursor-pointer items-start gap-2.5 rounded-xl border border-[#DDE4E8] p-3">
                <input type="checkbox" checked={saveCard} onChange={(event) => setSaveCard(event.target.checked)} className="mt-0.5 h-4 w-4 accent-[#11120f]" />
                <span>
                  <span className="block text-[12px] font-semibold">Save this card</span>
                  <span className="mt-0.5 block text-[11px] leading-4 text-[#667069]">Needed if you want auto-recharge later. You can turn it off any time.</span>
                </span>
              </label>
              {saveCard && (
                <div className="mt-3">
                  <label className="block text-[12.5px] font-semibold text-[#17233A]">Phone number</label>
                  <input
                    value={savePhone}
                    onChange={(event) => setSavePhone(event.target.value.replace(/[^0-9+ ]/g, ""))}
                    placeholder="+1 555 000 1234"
                    inputMode="tel"
                    className="mt-2 h-11 w-full rounded-xl border border-[#DDE4E8] px-3 text-[13px] outline-none focus:border-[#11120f] focus:ring-2 focus:ring-[#11120f]/8"
                  />
                  <p className="mt-1.5 text-[11px] leading-4 text-[#667069]">Required by Razorpay to save a card for auto-recharge.</p>
                </div>
              )}
              {addError && <p className="mt-3 text-[11.5px] text-[#c63f4d]">{addError}</p>}
              <button type="button" disabled={adding || (saveCard && !savePhone.trim())} onClick={() => void submitAddCredits()} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#11120f] text-[13px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
                {adding ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />} Continue to payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type AutoRechargeSettings = {
  enabled: boolean;
  amountCents: number | null;
  thresholdPercent: number;
  monthlyCapCents: number | null;
  /** Whether a reusable card token is saved. Auto-recharge needs one. */
  cardOnFile: boolean;
  /** Why it last stopped, if it did. Cleared by the next successful charge. */
  lastError: string | null;
};

type CreditsResponse = {
  balanceCents?: number | null;
  grantedCents?: number;
  purchasedCents?: number;
  autoRecharge?: AutoRechargeSettings | null;
  isOwner?: boolean;
};

type TeamMemberRow = { id: string; email: string; name: string | null; avatarUrl: string | null };
type TeamRow = { id: string; name: string; description: string | null; createdAt: string; members: TeamMemberRow[] };

function memberInitial(member: TeamMemberRow) {
  return (member.name?.trim().charAt(0) || member.email.charAt(0)).toUpperCase();
}

function TeamsSettingsPage() {
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [members, setMembers] = useState<TeamMemberRow[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<TeamRow | null>(null);
  const [formName, setFormName] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMemberIds, setFormMemberIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [revokingInvite, setRevokingInvite] = useState<string | null>(null);
  const [resendingInvite, setResendingInvite] = useState<string | null>(null);
  const [inviteNotice, setInviteNotice] = useState<{ id: string; ok: boolean; text: string } | null>(null);

  // Re-inviting the same address renews the link for another 7 days and
  // emails it again — see AuthService.inviteMembers.
  async function resendInvite(invite: PendingInvitation) {
    setResendingInvite(invite.id);
    setInviteNotice(null);
    try {
      const response = await fetch("/api/invitations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ emails: [invite.email] }),
      });
      const data = (await response.json().catch(() => ({}))) as { invited?: string[]; skipped?: { reason: string }[]; message?: string };
      if (response.ok && data.invited?.length) {
        setInviteNotice({ id: invite.id, ok: true, text: "Invite sent again" });
        loadInvitations();
      } else {
        setInviteNotice({ id: invite.id, ok: false, text: data.skipped?.[0]?.reason ?? data.message ?? "Could not resend the invite" });
      }
    } catch {
      setInviteNotice({ id: invite.id, ok: false, text: "Could not resend the invite" });
    } finally {
      setResendingInvite(null);
    }
  }

  function loadInvitations() {
    setLoadingInvitations(true);
    fetch("/api/invitations")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { invitations?: PendingInvitation[] } | null) => setInvitations(data?.invitations ?? []))
      .catch(() => undefined)
      .finally(() => setLoadingInvitations(false));
  }
  useEffect(loadInvitations, []);

  async function revokeInvite(id: string) {
    setRevokingInvite(id);
    try {
      const response = await fetch("/api/invitations/revoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) setInvitations((current) => current.filter((item) => item.id !== id));
    } finally {
      setRevokingInvite(null);
    }
  }

  function loadTeams() {
    setLoadingTeams(true);
    fetch("/api/teams")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { teams?: TeamRow[] } | null) => setTeams(data?.teams ?? []))
      .catch(() => undefined)
      .finally(() => setLoadingTeams(false));
  }
  useEffect(loadTeams, []);

  function loadMembers() {
    setLoadingMembers(true);
    return fetch("/api/team-members")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { members?: TeamMemberRow[] } | null) => setMembers(data?.members ?? []))
      .catch(() => undefined)
      .finally(() => setLoadingMembers(false));
  }
  useEffect(() => { void loadMembers(); }, []);

  function openCreate() {
    setEditingTeam(null);
    setFormName("");
    setFormDescription("");
    setFormMemberIds([]);
    setFormError(null);
    setFormOpen(true);
  }

  function openEdit(team: TeamRow) {
    setEditingTeam(team);
    setFormName(team.name);
    setFormDescription(team.description ?? "");
    setFormMemberIds(team.members.map((m) => m.id));
    setFormError(null);
    setFormOpen(true);
  }

  function toggleFormMember(id: string) {
    setFormMemberIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  }

  async function submitForm() {
    const name = formName.trim();
    if (!name || saving) {
      setFormError("Team name is required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingTeam) {
        const patchResponse = await fetch(`/api/teams/${editingTeam.id}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, description: formDescription.trim() }),
        });
        if (!patchResponse.ok) {
          const data = (await patchResponse.json().catch(() => ({}))) as { message?: string };
          setFormError(data.message ?? "Could not update team");
          return;
        }
        const before = new Set(editingTeam.members.map((m) => m.id));
        const after = new Set(formMemberIds);
        const toAdd = formMemberIds.filter((id) => !before.has(id));
        const toRemove = editingTeam.members.map((m) => m.id).filter((id) => !after.has(id));
        await Promise.all([
          ...toAdd.map((userId) => fetch(`/api/teams/${editingTeam.id}/members`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId }) })),
          ...toRemove.map((userId) => fetch(`/api/teams/${editingTeam.id}/members?userId=${encodeURIComponent(userId)}`, { method: "DELETE" })),
        ]);
      } else {
        const response = await fetch("/api/teams", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ name, description: formDescription.trim(), memberUserIds: formMemberIds }),
        });
        if (!response.ok) {
          const data = (await response.json().catch(() => ({}))) as { message?: string };
          setFormError(data.message ?? "Could not create team");
          return;
        }
      }
      setFormOpen(false);
      loadTeams();
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    setDeleting(true);
    try {
      const response = await fetch(`/api/teams/${id}`, { method: "DELETE" });
      if (response.ok) setTeams((current) => current.filter((team) => team.id !== id));
    } finally {
      setDeleting(false);
      setConfirmDeleteId(null);
    }
  }

  const assignedMemberIds = new Set(teams.flatMap((team) => team.members.map((m) => m.id)));
  const unassignedCount = Math.max(0, members.length - assignedMemberIds.size);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-6 pb-16 pt-8 text-[#17191b] sm:px-9">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <h2 className="text-[30px] font-medium tracking-[-0.04em]">Teams</h2>
          <p className="mt-2 text-[13px] text-[#707980]">Organize workspace members into focused groups for conversation routing.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <button type="button" onClick={() => setInviteOpen(true)} className="flex h-10 items-center gap-2 rounded-lg border border-[#D8DDE1] px-4 text-[12px] font-semibold transition hover:bg-[#F7F8FA]">
            <UserPlus size={14} /> Invite team
          </button>
          <button type="button" onClick={openCreate} className="flex h-10 items-center gap-2 rounded-lg bg-[#11120f] px-4 text-[12px] font-semibold text-white transition hover:bg-black">
            <Plus size={14} /> Create team
          </button>
        </div>
      </header>

      <section className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-[#DDE4E8] bg-[#FAFBFB] p-5">
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#11120f] text-white"><UsersRound size={18} /></span>
        <div>
          <p className="text-[11px] font-medium text-[#6D7D85]">Teams</p>
          <p className="mt-0.5 text-[20px] font-semibold tracking-[-0.02em]">{loadingTeams ? "…" : teams.length}</p>
        </div>
        <div className="ml-4 border-l border-[#E1E5E8] pl-4">
          <p className="text-[11px] font-medium text-[#6D7D85]">Workspace members</p>
          <p className="mt-0.5 text-[16px] font-semibold">{loadingMembers ? "…" : members.length}</p>
        </div>
        <div className="ml-4 border-l border-[#E1E5E8] pl-4">
          <p className="text-[11px] font-medium text-[#6D7D85]">Unassigned</p>
          <p className="mt-0.5 text-[16px] font-semibold">{loadingTeams || loadingMembers ? "…" : unassignedCount}</p>
        </div>
      </section>

      <section className="mt-5">
        {loadingTeams ? (
          <div className="flex min-h-[200px] items-center justify-center rounded-xl border border-[#dfe3e6] bg-white text-[13px] text-[#8b9398]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading teams</div>
        ) : teams.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-xl border border-[#dfe3e6] bg-white px-6 text-center">
            <UsersRound size={24} className="text-[#a5acb0]" />
            <p className="mt-3 text-[14px] font-semibold">No teams yet</p>
            <p className="mt-1 max-w-sm text-[12.5px] leading-5 text-[#8b9398]">Create a team to group teammates for conversation routing and assignment.</p>
            <button type="button" onClick={openCreate} className="mt-4 h-9 rounded-lg border border-[#D8DDE1] px-4 text-[12px] font-semibold transition hover:bg-[#F7F8FA]">Create your first team</button>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {teams.map((team) => (
              <article key={team.id} className="rounded-xl border border-[#dfe3e6] bg-white p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-[15px] font-semibold">{team.name}</h3>
                    <p className="mt-1 line-clamp-2 text-[12.5px] leading-5 text-[#7b848a]">{team.description || "No description"}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => openEdit(team)} aria-label="Edit team" className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7b848a] hover:bg-[#f7f8f8] hover:text-black"><Pencil size={14} /></button>
                    <button
                      type="button"
                      onClick={() => confirmDelete(team.id)}
                      disabled={deleting && confirmDeleteId === team.id}
                      aria-label="Delete team"
                      className={`flex h-8 items-center justify-center rounded-lg px-2 text-[11px] font-semibold transition ${confirmDeleteId === team.id ? "bg-[#FFF1F1] text-[#c63f4d]" : "text-[#7b848a] hover:bg-[#f7f8f8] hover:text-black"}`}
                    >
                      {confirmDeleteId === team.id ? (deleting ? <LoaderCircle size={13} className="animate-spin" /> : "Confirm?") : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {team.members.slice(0, 5).map((member) => (
                      <span key={member.id} title={member.name ?? member.email} className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#eef0f1] text-[10.5px] font-bold text-[#4a5666]">{memberInitial(member)}</span>
                    ))}
                    {team.members.length > 5 && <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#eef0f1] text-[10px] font-bold text-[#4a5666]">+{team.members.length - 5}</span>}
                    {team.members.length === 0 && <span className="text-[11.5px] text-[#a5acb0]">No members yet</span>}
                  </div>
                  <span className="text-[11px] font-medium text-[#92999e]">{team.members.length} {team.members.length === 1 ? "member" : "members"}</span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-semibold">Pending invitations</h3>
            <p className="mt-1 text-[12.5px] text-[#7b848a]">People you&apos;ve invited who haven&apos;t joined yet.</p>
          </div>
          {invitations.length > 0 && <span className="text-[11px] font-medium text-[#92999e]">{invitations.length} {invitations.length === 1 ? "invite" : "invites"}</span>}
        </div>
        <div className="mt-3 overflow-hidden rounded-xl border border-[#dfe3e6] bg-white">
          {loadingInvitations ? (
            <div className="flex items-center justify-center py-10 text-[13px] text-[#8b9398]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading invitations</div>
          ) : invitations.length === 0 ? (
            <div className="flex flex-col items-center px-6 py-10 text-center">
              <Mail size={20} className="text-[#a5acb0]" />
              <p className="mt-2 text-[13px] font-medium text-[#5b6368]">No pending invitations</p>
              <p className="mt-1 max-w-sm text-[11.5px] leading-5 text-[#8b9398]">Invited teammates show up here until they accept.</p>
            </div>
          ) : (
            invitations.map((invite, index) => (
              <div key={invite.id} className={`flex flex-wrap items-center gap-3 px-4 py-3 ${index ? "border-t border-[#eceeef]" : ""}`}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef0f1] text-[12px] font-bold text-[#4a5666]">{invite.email.charAt(0).toUpperCase()}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold">{invite.email}</p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#8b9398]">
                    <span className={`inline-flex w-fit items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold ${invite.expired ? "bg-[#FFF1F1] text-[#A64A53]" : "bg-[#FFF4E5] text-[#93651D]"}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${invite.expired ? "bg-[#C6555F]" : "bg-[#D89831]"}`} />
                      {invite.expired ? "Expired" : "Pending"}
                    </span>
                    {invite.expired
                      ? `Link expired ${new Date(invite.expiresAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`
                      : `Expires ${new Date(invite.expiresAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}`}
                  </p>
                  {inviteNotice?.id === invite.id && (
                    <p className={`mt-1 text-[11px] ${inviteNotice.ok ? "text-[#2f855a]" : "text-[#c63f4d]"}`}>{inviteNotice.text}</p>
                  )}
                </div>
                <button
                  type="button"
                  disabled={resendingInvite === invite.id}
                  onClick={() => void resendInvite(invite)}
                  className="shrink-0 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-[#3578C8] transition hover:bg-[#EEF3F5] disabled:opacity-50"
                >
                  {resendingInvite === invite.id ? "Sending…" : "Resend"}
                </button>
                <button
                  type="button"
                  disabled={revokingInvite === invite.id}
                  onClick={() => void revokeInvite(invite.id)}
                  className="shrink-0 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-[#c63f4d] transition hover:bg-[#FFF1F1] disabled:opacity-50"
                >
                  {revokingInvite === invite.id ? "…" : "Revoke"}
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setFormOpen(false); }}>
          <div role="dialog" aria-modal="true" className="flex max-h-[85vh] w-full max-w-[440px] flex-col overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
            <div className="flex items-start justify-between border-b border-[#E5E9EB] px-6 py-5">
              <div>
                <h3 className="text-[16px] font-semibold tracking-[-0.02em]">{editingTeam ? "Edit team" : "Create team"}</h3>
                <p className="mt-1 text-[12px] text-[#667069]">Group teammates for conversation routing and assignment.</p>
              </div>
              <button type="button" onClick={() => setFormOpen(false)} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-[#F0F2F3]"><X size={16} /></button>
            </div>
            <div className="overflow-y-auto p-6">
              <label className="block text-[12.5px] font-semibold text-[#17233A]">Team name</label>
              <input value={formName} onChange={(event) => { setFormName(event.target.value); setFormError(null); }} placeholder="Customer Support" className="mt-2 h-11 w-full rounded-xl border border-[#DDE4E8] px-3 text-[13px] outline-none focus:border-[#11120f] focus:ring-2 focus:ring-[#11120f]/8" />

              <label className="mt-4 block text-[12.5px] font-semibold text-[#17233A]">Description <span className="font-normal text-[#8a9298]">(optional)</span></label>
              <textarea value={formDescription} onChange={(event) => setFormDescription(event.target.value)} placeholder="Default team for incoming customer conversations." rows={2} className="mt-2 w-full resize-none rounded-xl border border-[#DDE4E8] px-3 py-2.5 text-[13px] outline-none focus:border-[#11120f] focus:ring-2 focus:ring-[#11120f]/8" />

              <label className="mt-4 block text-[12.5px] font-semibold text-[#17233A]">Members</label>
              <div className="mt-2 max-h-[180px] overflow-y-auto rounded-xl border border-[#DDE4E8]">
                {loadingMembers ? (
                  <div className="flex items-center justify-center py-6 text-[12px] text-[#8a9298]"><LoaderCircle size={14} className="mr-2 animate-spin" /> Loading members</div>
                ) : members.length === 0 ? (
                  <p className="px-3 py-4 text-center text-[12px] text-[#8a9298]">No workspace members yet.</p>
                ) : (
                  members.map((member) => {
                    const checked = formMemberIds.includes(member.id);
                    return (
                      <button key={member.id} type="button" onClick={() => toggleFormMember(member.id)} className={`flex h-11 w-full items-center justify-between gap-2.5 border-b border-[#eceeef] px-3 text-left text-[13px] font-medium last:border-b-0 ${checked ? "bg-[#f0f2f3]" : "hover:bg-[#f7f8f8]"}`}>
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#eef0f1] text-[10.5px] font-bold text-[#4a5666]">{memberInitial(member)}</span>
                          <span className="min-w-0 truncate">{member.name || member.email}</span>
                        </span>
                        {checked && <Check size={14} className="shrink-0 text-[#11120f]" />}
                      </button>
                    );
                  })
                )}
              </div>

              {formError && <p className="mt-3 text-[11.5px] text-[#c63f4d]">{formError}</p>}
              <button type="button" disabled={saving} onClick={() => void submitForm()} className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#11120f] text-[13px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60">
                {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />} {editingTeam ? "Save changes" : "Create team"}
              </button>
            </div>
          </div>
        </div>
      )}

      <InvitePeopleDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={() => { void loadMembers(); loadInvitations(); }} />
    </div>
  );
}

export function UpgradeSettingsPage() {
  const [checkoutPlan, setCheckoutPlan] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [cadence, setCadence] = useState<"monthly" | "annual">("monthly");
  // Which plan the workspace is actually on. Without this the grid hard-coded
  // Free as "Current plan", so a paying customer was shown their own tier as
  // an upgrade and Free as what they were already on.
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { entitlement?: Entitlement } | null) => setEntitlement(data?.entitlement ?? null))
      .catch(() => undefined);
  }, []);

  const currentPlanId = entitlement?.planId ?? "free";
  const currentRank = pricingPlans.findIndex((item) => item.id === currentPlanId);

  async function startCheckout(planId: string) {
    setCheckoutPlan(planId);
    setCheckoutError(null);
    try {
      const response = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ planId, cadence }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        subscriptionId?: string;
        keyId?: string;
        amountInrPaise?: number;
        message?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(data.message ?? data.error ?? "Checkout could not be started.");
      if (!data.subscriptionId || !data.keyId) throw new Error("The billing service did not return a checkout session.");

      const plan = pricingPlans.find((item) => item.id === planId);
      await openRazorpayCheckout({
        keyId: data.keyId,
        subscriptionId: data.subscriptionId,
        description: `${plan?.name ?? "Elpino"} plan — ${cadence === "annual" ? "annual" : "monthly"}`,
      });

      // Razorpay has taken the payment, but the plan only changes once their
      // signed webhook reaches us. Reload so the page reads the new
      // entitlement rather than optimistically showing an upgrade that the
      // backend has not confirmed.
      window.location.assign("/dashboard/settings/billing");
    } catch (checkoutIssue) {
      setCheckoutError(checkoutIssue instanceof Error ? checkoutIssue.message : "Checkout could not be started.");
      setCheckoutPlan(null);
    }
  }

  return (
    <div className="dashboard-upgrade-page mx-auto w-full max-w-[1240px] bg-[#262626] px-7 pb-16 pt-8 text-white/90 sm:px-9 lg:px-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs font-normal uppercase tracking-[0.16em] text-white/40">Plans</p>
          <h2 className="mt-2 text-3xl font-normal tracking-[-0.03em] text-white/95">Choose the right plan</h2>
          <p className="mt-2 max-w-2xl text-[13px] leading-6 text-white/60">Upgrade as your team grows. Change or cancel your plan anytime from Billing.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="dashboard-pricing-pill flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.035] p-1" role="group" aria-label="Billing cadence">
            {(["monthly", "annual"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setCadence(option)}
                aria-pressed={cadence === option}
                className={`dashboard-pricing-option rounded-lg px-3.5 py-2 text-[12px] font-medium capitalize transition ${cadence === option ? "dashboard-pricing-option-active bg-[#428ce5] text-white" : "text-white/55 hover:bg-white/[0.05] hover:text-white/90"}`}
              >
                {option}
                {option === "annual" && <span className="ml-1.5 text-[10px] font-bold uppercase tracking-[0.08em]">save {ANNUAL_SAVING_PERCENT}%</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {checkoutError && <div role="alert" className="dashboard-checkout-error mt-5 rounded-xl border border-[#ecc9cd] bg-[#fff6f7] px-4 py-3 text-[12px] text-[#a33f49]">{checkoutError}</div>}

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pricingPlans.map((plan) => (
          <article key={plan.id} className={`dashboard-plan-card ${plan.highlighted ? "dashboard-plan-highlighted" : ""} relative flex min-h-[480px] flex-col overflow-hidden rounded-xl border p-5 transition ${plan.highlighted ? "border-[#428ce5]/35 bg-[#428ce5]/[0.07]" : "border-white/10 bg-white/[0.035]"}`}>
            <div className="flex min-h-6 items-center justify-between gap-2">{plan.id === currentPlanId ? <span className="dashboard-plan-current-badge rounded-full bg-[#428ce5]/15 px-2.5 py-1 text-[10px] font-medium text-[#91c4ff]">Current plan</span> : <span />}{plan.highlighted && <span className="dashboard-plan-badge rounded-full bg-[#428ce5]/15 px-2.5 py-1 text-[10px] font-medium text-[#b8d9ff]">Recommended</span>}</div>
            <div className="pt-5">
              <h3 className="text-[24px] font-medium tracking-[-0.04em] text-white/90">{plan.name}</h3>
              <p className="mt-2 min-h-[60px] text-[13px] leading-5 text-white/60">{plan.description}</p>
              <div className="dashboard-plan-price mt-5 flex items-end gap-1 border-b border-white/10 pb-4"><span className="text-[38px] font-medium tracking-[-0.06em] text-white/90">{getPlanPrice(plan, cadence === "annual" ? "yearly" : "monthly")}</span>{plan.id !== "free" && <span className="pb-1.5 text-[13px] text-white/60">/mo</span>}</div>
              {plan.id !== "free" && <p className="mt-2 text-[12px] text-white/45">{cadence === "annual" ? `${getAnnualTotal(plan)} billed yearly` : "Billed monthly"}</p>}
            </div>
            <ul className="mt-5 space-y-3">
              {plan.features.map((feature) => <li key={feature} className="flex gap-2.5 text-[12.5px] leading-5 text-white/70"><Check size={15} strokeWidth={2.2} className="mt-0.5 shrink-0 text-[#5ca5fa]" /> {feature}</li>)}
            </ul>
            <div className="mt-auto pt-6">
              {plan.id === currentPlanId ? (
                <button type="button" disabled className="dashboard-current-plan h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] text-[12px] font-medium text-white/50">Current plan</button>
              ) : plan.id === "free" ? (
                // Moving back to Free is a cancellation, not a checkout —
                // there is nothing to charge for, so it goes through the
                // billing page's cancel flow rather than Razorpay.
                <Link href="/dashboard/settings/billing" className="dashboard-plan-cta flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 text-[12px] font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white/90">
                  Downgrade to Free <ArrowRight size={13} />
                </Link>
              ) : (
                <button type="button" disabled={checkoutPlan !== null} onClick={() => void startCheckout(plan.id)} className={`dashboard-plan-cta flex h-10 w-full items-center justify-center gap-2 rounded-lg text-[12px] font-medium transition disabled:opacity-60 ${plan.highlighted ? "dashboard-plan-cta-primary bg-[#428ce5] text-white hover:bg-[#347dce]" : "border border-white/10 bg-white/[0.05] text-white/90 hover:bg-white/[0.1]"}`}>
                  {checkoutPlan === plan.id ? (
                    <><LoaderCircle size={14} className="animate-spin" /> Opening checkout</>
                  ) : (
                    <>{currentRank > -1 && pricingPlans.findIndex((item) => item.id === plan.id) < currentRank ? "Switch to" : "Upgrade to"} {plan.name} <ArrowRight size={13} /></>
                  )}
                </button>
              )}
            </div>
          </article>
        ))}
      </div>

      <div className="dashboard-tailored-plan mt-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.035] px-5 py-4">
        <div><p className="text-[14px] font-medium text-white/90">Need a custom plan?</p><p className="mt-1 text-[12px] text-white/60">Talk to us about custom seats, security, and support.</p></div>
        <div className="flex items-center gap-2"><Link href="/pricing" className="flex h-9 items-center px-3 text-[12px] font-medium text-white/60 hover:text-white/90">Compare details</Link><Link href="/contact" className="dashboard-contact-sales flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3.5 text-[12px] font-medium text-white/90 transition hover:bg-white/[0.06]">Contact sales <ArrowRight size={13} /></Link></div>
      </div>
    </div>
  );
}

type BillingInvoice = { id?: string; date?: string; amount?: string | number; status?: string; url?: string };

// Mirrors the entitlement shape returned by /api/billing/status. The two
// meters are independent by design: `resolutionsRemaining` moves only when
// the AI answers, `seatsAllowed` only when someone buys a seat.
type Entitlement = {
  planId: string;
  planName: string;
  status: string;
  seatsIncluded: number;
  seatsPurchased: number;
  /** Seats the owner removed; they stop being billed at the next renewal. */
  seatsPendingRelease?: number;
  /** What the extra seats add to each monthly bill, in the smallest currency unit. */
  seatsMonthlyMinor?: number;
  /** The plan's own price per month, in the smallest currency unit. */
  effectiveMonthlyMinor?: number;
  seatsAllowed: number;
  seatsMax: number | null;
  /** Cheapest per-seat rate across the bundles, for the "from" price. */
  seatFromUsdCents?: number;
  seatBundles?: { seats: number; usdCents: number; inrPaise: number }[];
  /** AI credit this plan grants each period, in USD cents. */
  aiCreditGrantUsdCents?: number;
  /** Paid plans: metered by credit alone. Free: capped at a plain conversation count. */
  creditBased?: boolean;
  /** "About N conversations" the monthly credit covers; null on Free. */
  estimatedConversations?: number | null;
  resolutionsIncluded: number;
  resolutionsUsed: number;
  resolutionsRemaining: number;
  overageResolutions: number;
  overageUsdCents: number | null;
  knowledgeStorageMb: number;
  knowledgeBytesUsed: number;
  knowledgeBytesAllowed: number;
  knowledgeBytesRemaining: number;
  canResolve: boolean;
  cadence?: "monthly" | "annual";
  currency?: string;
  removeBranding?: boolean;
  /** A plan change started but not yet confirmed by Razorpay's webhook. */
  pendingPlanId?: string | null;
  /** Cancellation requested; the plan runs to the end of the paid period. */
  cancelling?: boolean;
  currentPeriodStart: string;
  currentPeriodEnd: string | null;
};

/** A real payment from /api/billing/payments, as opposed to the placeholder
 *  invoice shape the history tab used to render from a field nothing set. */
type BillingPayment = {
  id: string;
  kind: string;
  amountMinor?: number;
  amountPaise: number;
  currency: string;
  status: string;
  createdAt: string;
};

/** Formats a Razorpay amount, which is always in the smallest currency unit. */
function formatMoney(amountMinor: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amountMinor / 100);
  } catch {
    return `${(amountMinor / 100).toFixed(2)} ${currency}`;
  }
}

type BillingStatus = {
  entitlement?: Entitlement;
  paymentMethod?: { brand?: string; last4?: string; expiryMonth?: number; expiryYear?: number };
  invoices?: BillingInvoice[];
};

// Plan-tinted glow behind the plan card on the Billing page.
const BILLING_HERO_TINT: Record<string, string> = {
  free: "from-[#94a3b8]/30 via-[#428ce5]/20 to-transparent",
  starter: "from-[#7c3aed]/35 via-[#428ce5]/25 to-transparent",
  growth: "from-[#2aa876]/35 via-[#428ce5]/25 to-transparent",
  scale: "from-[#f59e0b]/35 via-[#ec4899]/25 to-transparent",
};

// A circular gauge: how far through the billing period you are (paid) or how
// much of the Free message allowance is used. The label goes in the middle.
function BillingRing({ percent, children }: { percent: number; children: React.ReactNode }) {
  const size = 152;
  const stroke = 11;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const value = Math.max(0, Math.min(100, percent));
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id="billing-ring-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#428ce5" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--b-track)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="url(#billing-ring-gradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (value / 100) * circumference}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">{children}</div>
    </div>
  );
}

function BillingSettingsPage() {
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  // Billing history came from `billing.invoices`, which /api/billing/status
  // has never returned — so the tab was permanently empty even for workspaces
  // with real charges behind them. The payments endpoint is the actual
  // source, and it has existed all along with nothing calling it.
  const [payments, setPayments] = useState<BillingPayment[]>([]);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelNotice, setCancelNotice] = useState<string | null>(null);
  const [removeSeatsOpen, setRemoveSeatsOpen] = useState(false);
  const [removeSeatsCount, setRemoveSeatsCount] = useState("1");
  const [seatBusy, setSeatBusy] = useState(false);
  const [seatError, setSeatError] = useState<string | null>(null);
  const [addingSeats, setAddingSeats] = useState<number | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [addSeatsNotice, setAddSeatsNotice] = useState<string | null>(null);
  const [addSeatsError, setAddSeatsError] = useState<string | null>(null);

  // Removing seats takes effect at the next renewal: they were paid for
  // through the end of this period, so they stay usable until then.
  async function removeSeats() {
    setSeatBusy(true);
    setSeatError(null);
    try {
      const response = await fetch(`/api/billing/seats?quantity=${encodeURIComponent(removeSeatsCount)}`, { method: "DELETE" });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Could not remove seats.");
      setRemoveSeatsOpen(false);
      await loadStatus();
    } catch (issue) {
      setSeatError(issue instanceof Error ? issue.message : "Could not remove seats.");
    } finally {
      setSeatBusy(false);
    }
  }

  // Buys a seat pack. On a paid plan the seats are added to the subscription
  // straight away and billed on its next invoice, then on every renewal until
  // removed. On Free there is no invoice, so Razorpay Checkout takes a one-off
  // payment first and the webhook grants the seats.
  async function addSeats(quantity: number) {
    if (addingSeats !== null) return;
    setAddingSeats(quantity);
    setAddSeatsError(null);
    setAddSeatsNotice(null);
    try {
      const response = await fetch("/api/billing/seats", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ quantity }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        message?: string;
        upgradeRequired?: boolean;
        orderId?: string;
        keyId?: string;
        amountPaise?: number;
        seatsGranted?: number;
        billedOnNextInvoice?: boolean;
      };
      if (!response.ok) {
        setAddSeatsError(data.upgradeRequired ? `${data.message ?? "This plan can't add more seats."} Upgrade to add more teammates.` : data.message ?? "Could not add seats.");
        return;
      }
      if (data.orderId && data.keyId) {
        await openRazorpayCheckout({ keyId: data.keyId, orderId: data.orderId, amountPaise: data.amountPaise, description: "Extra seats" });
        setAddSeatsNotice("Payment received. Your seats will be ready in a moment.");
        // The grant lands when Razorpay's webhook confirms the payment.
        window.setTimeout(() => void loadStatus(), 2500);
      } else {
        setAddSeatsNotice(`${data.seatsGranted ?? quantity} seats added. They're billed with your subscription, starting on your next invoice.`);
      }
      await loadStatus();
    } catch (issue) {
      setAddSeatsError(issue instanceof Error ? issue.message : "Could not add seats.");
    } finally {
      setAddingSeats(null);
    }
  }

  function loadStatus() {
    return fetch("/api/billing/status")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: BillingStatus) => setBilling(data))
      .catch(() => setLoadError(true));
  }

  useEffect(() => {
    void loadStatus().finally(() => setLoading(false));
    fetch("/api/billing/payments")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { payments?: BillingPayment[] } | null) => setPayments(data?.payments ?? []))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const entitlement = billing?.entitlement;
  const rawPlanId = entitlement?.planId ?? "free";
  const plan = pricingPlans.find((item) => item.id === rawPlanId) ?? pricingPlans[0];
  const status = entitlement?.status ?? "active";
  const periodEnd = entitlement?.currentPeriodEnd ?? undefined;
  const paymentMethod = billing?.paymentMethod;
  const cadence = entitlement?.cadence ?? "monthly";
  const cancelling = Boolean(entitlement?.cancelling) || status === "cancelling";

  async function cancelSubscription() {
    setCancelBusy(true);
    setCancelError(null);
    try {
      const response = await fetch("/api/billing/subscription/cancel", { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { message?: string; effectiveAt?: string | null };
      if (!response.ok) throw new Error(data.message ?? "Could not cancel your subscription.");
      setCancelNotice(
        data.effectiveAt
          ? `Your plan stays active until ${new Date(data.effectiveAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}, then moves to Free.`
          : "Your plan will move to Free at the end of the current period.",
      );
      setCancelOpen(false);
      await loadStatus();
    } catch (issue) {
      setCancelError(issue instanceof Error ? issue.message : "Could not cancel your subscription.");
    } finally {
      setCancelBusy(false);
    }
  }

  const isFree = plan.id === "free";
  const currencyCode = entitlement?.currency ?? "USD";
  const planMinor = entitlement?.effectiveMonthlyMinor ?? 0;
  const seatsMinor = entitlement?.seatsMonthlyMinor ?? 0;
  const seatBundles = entitlement?.seatBundles ?? [];
  const keptSeats = Math.max(0, (entitlement?.seatsPurchased ?? 0) - (entitlement?.seatsPendingRelease ?? 0));
  const renewAt = entitlement ? (periodEnd ? new Date(periodEnd) : nextAllowanceReset(entitlement)) : null;
  const periodStartMs = entitlement ? new Date(entitlement.currentPeriodStart).getTime() : NaN;
  const daysLeft = renewAt ? Math.max(0, Math.ceil((renewAt.getTime() - Date.now()) / 86_400_000)) : 0;
  const elapsedPercent =
    renewAt && Number.isFinite(periodStartMs) && renewAt.getTime() > periodStartMs
      ? Math.min(100, Math.max(0, ((Date.now() - periodStartMs) / (renewAt.getTime() - periodStartMs)) * 100))
      : 0;
  const messagesUsed = entitlement?.resolutionsUsed ?? 0;
  const messagesTotal = entitlement?.resolutionsIncluded ?? 0;
  const messagesPercent = messagesTotal > 0 ? Math.min(100, (messagesUsed / messagesTotal) * 100) : 0;
  const ringPercent = isFree ? messagesPercent : elapsedPercent;
  const billedInOtherCurrency = !isFree && currencyCode !== "USD";
  const priceMain = isFree ? "$0" : billedInOtherCurrency ? getPlanPrice(plan, cadence === "annual" ? "yearly" : "monthly") : planMinor > 0 ? formatMoney(planMinor, currencyCode) : plan.price;
  const renewLabel = renewAt ? renewAt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : null;
  const statusPill =
    status === "past_due"
      ? { label: "Payment issue", tone: "bad" as const }
      : cancelling
        ? { label: "Cancelling", tone: "warn" as const }
        : entitlement?.pendingPlanId
          ? { label: "Confirming payment", tone: "info" as const }
          : { label: "Active", tone: "good" as const };
  const tone = {
    good: "bg-[var(--b-good-bg)] text-[var(--b-good)]",
    warn: "bg-[var(--b-warn-bg)] text-[var(--b-warn)]",
    bad: "bg-[var(--b-bad-bg)] text-[var(--b-bad)]",
    info: "bg-[var(--b-info-bg)] text-[var(--b-info)]",
  };
  const card = "rounded-2xl border border-[var(--b-border)] bg-[var(--b-surface)]";
  const primaryBtn = "inline-flex h-10 items-center gap-2 rounded-xl bg-[var(--b-ink)] px-4 text-[13px] font-semibold text-[var(--b-ink-text)] transition hover:opacity-85";
  const ghostBtn = "inline-flex h-10 items-center gap-2 rounded-xl border border-[var(--b-border)] px-4 text-[13px] font-medium text-[var(--b-text)] transition hover:bg-[var(--b-surface-2)]";
  // The homepage's language: ink outlines, flat sticker fills, mono "stamp" labels.
  const sticker = "rounded-[22px] border-2 border-[var(--s-line)]";
  const stamp = "inline-flex items-center gap-1.5 rounded-full border-2 border-[var(--s-line)] px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em]";
  const chipBtn = "inline-flex h-9 items-center gap-1.5 rounded-full border-2 border-[var(--s-line)] bg-[var(--s-paper)] px-3.5 text-[12.5px] font-semibold transition hover:-translate-y-0.5";
  const pillBtn = "inline-flex h-11 items-center gap-2 rounded-full border-2 border-[var(--s-line)] bg-[var(--s-ink)] px-6 text-[13.5px] font-semibold text-[var(--s-ink-text)] transition hover:-translate-y-0.5";

  return (
    <div className="billing-v2 mx-auto w-full max-w-[1080px] px-6 pb-20 pt-8 sm:px-9">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[32px] font-semibold tracking-[-0.04em]">Billing</h2>
          <p className="mt-1.5 text-[13px] text-[var(--b-muted)]">Your plan, what&apos;s included, and how you pay.</p>
        </div>
        <button type="button" onClick={() => setUpgradeOpen(true)} className={ghostBtn}>View plans <ArrowRight size={14} /></button>
      </header>

      {loading && (
        <div className="mt-7 space-y-4">
          <div className="h-64 animate-pulse rounded-3xl bg-[var(--b-surface-2)]" />
          <div className="grid gap-4 md:grid-cols-3"><div className="h-28 animate-pulse rounded-2xl bg-[var(--b-surface-2)]" /><div className="h-28 animate-pulse rounded-2xl bg-[var(--b-surface-2)]" /><div className="h-28 animate-pulse rounded-2xl bg-[var(--b-surface-2)]" /></div>
        </div>
      )}
      {loadError && !loading && (
        <div className="mt-7 rounded-2xl bg-[var(--b-bad-bg)] px-5 py-4 text-[13px] text-[var(--b-bad)]">Billing information could not be loaded. You can still change your plan from View plans.</div>
      )}
      {cancelNotice && <div role="status" className="mt-7 rounded-2xl bg-[var(--b-good-bg)] px-5 py-4 text-[13px] text-[var(--b-good)]">{cancelNotice}</div>}
      {!loading && billedInOtherCurrency && (
        <div className="mt-7 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[var(--b-info-bg)] px-5 py-4 text-[13px] text-[var(--b-info)]">
          <p>This subscription was started in {currencyCode}, so it is still charged as {formatMoney(planMinor + seatsMinor, currencyCode)} a month. Plans and top-ups are now priced in dollars, and changing your plan moves you to dollar billing.</p>
          <button type="button" onClick={() => setUpgradeOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-current px-3 text-[12px] font-semibold">Switch to dollars <ArrowRight size={13} /></button>
        </div>
      )}

      {!loading && (
        <>
          {/* ------------------------------------------------------------- plan hero */}
          <section className="relative mt-7 overflow-hidden rounded-3xl border border-[var(--b-border)] bg-[var(--b-surface)] p-7 md:p-9">
            <div aria-hidden className={`pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-gradient-to-br ${BILLING_HERO_TINT[plan.id] ?? BILLING_HERO_TINT.free} blur-3xl`} />
            <div aria-hidden className="pointer-events-none absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-gradient-to-tr from-[#428ce5]/15 to-transparent blur-3xl" />
            <div className="relative grid items-center gap-8 md:grid-cols-[minmax(0,1fr)_auto]">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[var(--b-border)] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--b-muted)]">Current plan</span>
                  <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${tone[statusPill.tone]}`}>{statusPill.label}</span>
                </div>
                <h3 className="mt-5 text-[46px] font-semibold leading-none tracking-[-0.05em]">{plan.name}</h3>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-[24px] font-semibold tabular-nums tracking-[-0.03em]">{priceMain}</span>
                  <span className="text-[13px] text-[var(--b-muted)]">{isFree ? "forever" : cadence === "annual" ? "/ month · billed yearly" : "/ month"}</span>
                </p>
                <p className="mt-3 max-w-md text-[13px] leading-6 text-[var(--b-muted)]">{plan.description}</p>
                <div className="mt-6 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setUpgradeOpen(true)} className={primaryBtn}>{isFree ? <><Rocket size={14} /> Upgrade plan</> : <>Change plan <ArrowRight size={14} /></>}</button>
                  {!isFree && !cancelling && <button type="button" onClick={() => setCancelOpen(true)} className="h-10 rounded-xl px-3 text-[13px] font-medium text-[var(--b-muted)] transition hover:bg-[var(--b-surface-2)] hover:text-[var(--b-text)]">Cancel plan</button>}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <BillingRing percent={ringPercent}>
                  {isFree ? (
                    <>
                      <span className="text-[30px] font-semibold leading-none tabular-nums tracking-[-0.04em]">{messagesUsed.toLocaleString()}</span>
                      <span className="mt-1 text-[11px] text-[var(--b-muted)]">of {messagesTotal.toLocaleString()} messages</span>
                    </>
                  ) : (
                    <>
                      <span className="text-[34px] font-semibold leading-none tabular-nums tracking-[-0.04em]">{daysLeft}</span>
                      <span className="mt-1 text-[11px] text-[var(--b-muted)]">{daysLeft === 1 ? "day left" : "days left"}</span>
                    </>
                  )}
                </BillingRing>
                <p className="mt-3 max-w-[170px] text-center text-[12px] leading-5 text-[var(--b-muted)]">
                  {isFree
                    ? renewLabel ? `AI messages reset ${renewLabel}` : "AI messages reset monthly"
                    : cancelling
                      ? `Plan ends ${renewLabel ?? "at the end of the period"}`
                      : entitlement?.pendingPlanId
                        ? "Finishing your plan change"
                        : renewLabel ? `Renews ${renewLabel}` : "Renews monthly"}
                </p>
              </div>
            </div>
            {cancelling && (
              <p className="relative mt-6 rounded-xl bg-[var(--b-warn-bg)] px-4 py-3 text-[12.5px] text-[var(--b-warn)]">This plan is cancelled. It keeps working until {renewLabel ?? "the end of the period"}, then your workspace moves to Free.</p>
            )}
          </section>

          {/* ------------------------------------------------------------ what's included */}
          <section className="mt-9">
            <span className={`${stamp} bg-[var(--s-yellow)]`}>Included</span>
            <div className={`${sticker} mt-3 divide-y-2 divide-[var(--s-line)] overflow-hidden bg-[var(--s-paper)]`}>
              <div className="grid items-center gap-4 px-6 py-5 md:grid-cols-[210px_minmax(0,1fr)_auto]">
                <div className="flex items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-[var(--s-line)] bg-[var(--s-blue-solid)] text-white"><CircleGauge size={18} /></span>
                  <p className="text-[15px] font-semibold">{isFree ? "AI messages" : "AI credit"}</p>
                </div>
                {isFree ? (
                  <div className="flex items-center gap-4">
                    <div className="h-3 min-w-0 flex-1 overflow-hidden rounded-full border-2 border-[var(--s-line)] bg-[var(--s-paper)]"><div className="h-full bg-[var(--s-blue-solid)] transition-all" style={{ width: `${messagesPercent}%` }} /></div>
                    <p className="shrink-0 text-[26px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{messagesUsed.toLocaleString()}<span className="text-[16px] font-medium tracking-normal text-[var(--b-muted)]"> / {messagesTotal.toLocaleString()}</span></p>
                  </div>
                ) : (
                  <p className="text-[26px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{formatCents(entitlement?.aiCreditGrantUsdCents ?? 0)}<span className="text-[16px] font-medium tracking-normal text-[var(--b-muted)]"> of AI credit every month</span></p>
                )}
                <Link href="/dashboard/settings/ai-usage" className={`${chipBtn} hover:bg-[var(--s-yellow)]`}>View usage <ArrowRight size={13} /></Link>
              </div>

              <div className="px-6 py-5">
                <div className="grid items-center gap-4 md:grid-cols-[210px_minmax(0,1fr)_auto]">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-[var(--s-line)] bg-[var(--s-purple)] text-white"><UsersRound size={18} /></span>
                    <p className="text-[15px] font-semibold">Seats</p>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[26px] font-semibold leading-none tracking-[-0.04em] tabular-nums">{(entitlement?.seatsAllowed ?? 0).toLocaleString()}<span className="text-[16px] font-medium tracking-normal text-[var(--b-muted)]"> {entitlement?.seatsMax ? `of ${entitlement.seatsMax} max` : "seats"}</span></p>
                    <p className="mt-1.5 text-[12.5px] text-[var(--b-muted)]">{entitlement?.seatsIncluded ?? 0} included{(entitlement?.seatsPurchased ?? 0) > 0 ? ` · ${entitlement?.seatsPurchased} extra` : ""}. Adding seats never changes your AI allowance.</p>
                  </div>
                  {seatBundles.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 md:justify-end">
                      {seatBundles.map((bundle) => {
                        const minor = currencyCode === "INR" ? bundle.inrPaise : bundle.usdCents;
                        const overCap = entitlement?.seatsMax != null && (entitlement?.seatsAllowed ?? 0) + bundle.seats > entitlement.seatsMax;
                        const busy = addingSeats === bundle.seats;
                        return (
                          <button
                            key={bundle.seats}
                            type="button"
                            disabled={addingSeats !== null || overCap}
                            onClick={() => void addSeats(bundle.seats)}
                            title={overCap ? `${plan.name} allows up to ${entitlement?.seatsMax} seats` : undefined}
                            className={`${chipBtn} hover:bg-[var(--s-yellow)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:bg-[var(--s-paper)]`}
                          >
                            {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Plus size={13} strokeWidth={3} />}
                            {bundle.seats} seats
                            <span className="font-mono text-[11px] font-semibold opacity-70">{formatMoney(minor, currencyCode)}{isFree ? "" : "/mo"}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {seatBundles.length > 0 && (
                  <p className="mt-3 text-[12px] leading-5 text-[var(--b-muted)] md:pl-[226px]">
                    {isFree ? "One-time payment, and the seats stay on your workspace." : "Added to your subscription and billed with it from the next invoice, every period until you remove them."}
                  </p>
                )}
                {addSeatsNotice && <p role="status" className="mt-2 text-[12.5px] font-semibold text-[var(--b-good)] md:pl-[226px]">{addSeatsNotice}</p>}
                {addSeatsError && <p role="alert" className="mt-2 text-[12.5px] font-semibold text-[var(--b-bad)] md:pl-[226px]">{addSeatsError}</p>}
              </div>
            </div>
          </section>

          {/* ------------------------------------------- bill (or upgrade pitch) + card */}
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            {!isFree && entitlement ? (
              <article className={`${sticker} bg-[var(--s-paper)] p-7`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`${stamp} bg-[var(--s-yellow)]`}>Monthly bill</span>
                  <span className={`${stamp} bg-[var(--s-paper)]`}>{cadence === "annual" ? "Billed yearly" : "Billed monthly"}</span>
                </div>
                <div className="mt-6 space-y-3.5 text-[14px]">
                  <div className="flex items-center justify-between"><span className="text-[var(--b-muted)]">{plan.name} plan</span><span className="font-semibold tabular-nums">{formatMoney(planMinor, currencyCode)}</span></div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--b-muted)]">Extra seats ({keptSeats})</span>
                    <span className="flex items-center gap-3">
                      {keptSeats > 0 && !removeSeatsOpen && <button type="button" onClick={() => { setRemoveSeatsOpen(true); setRemoveSeatsCount("1"); }} className="text-[12px] font-semibold underline underline-offset-2 transition hover:opacity-70">Remove</button>}
                      <span className="font-semibold tabular-nums">{formatMoney(seatsMinor, currencyCode)}</span>
                    </span>
                  </div>
                  {removeSeatsOpen && (
                    <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-[var(--s-line)] bg-[var(--s-cream)] px-3.5 py-3 text-[13px]">
                      <span>Remove</span>
                      <input type="number" min={1} max={keptSeats} value={removeSeatsCount} onChange={(event) => setRemoveSeatsCount(event.target.value)} className="h-8 w-14 rounded-lg border-2 border-[var(--s-line)] bg-transparent px-2 text-[13px] outline-none" aria-label="Seats to remove" />
                      <span>at the next renewal</span>
                      <button type="button" disabled={seatBusy} onClick={() => void removeSeats()} className="h-8 rounded-full border-2 border-[var(--s-line)] bg-[var(--s-ink)] px-3.5 text-[12px] font-semibold text-[var(--s-ink-text)] disabled:opacity-60">{seatBusy ? "Saving…" : "Confirm"}</button>
                      <button type="button" onClick={() => setRemoveSeatsOpen(false)} className="h-8 px-2 text-[12px] font-semibold text-[var(--b-muted)]">Cancel</button>
                    </div>
                  )}
                  <div className="flex items-end justify-between border-t-2 border-dashed border-[var(--s-line)] pt-4">
                    <span className="font-semibold">Total per month</span>
                    <span className="text-[30px] font-semibold leading-none tracking-[-0.045em] tabular-nums">{formatMoney(planMinor + seatsMinor, currencyCode)}</span>
                  </div>
                </div>
                {(entitlement.seatsPendingRelease ?? 0) > 0 && <p className="mt-3 text-[12px] text-[var(--b-muted)]">{entitlement.seatsPendingRelease} seat(s) will be removed at the next renewal and stay usable until then.</p>}
                {seatError && <p role="alert" className="mt-3 text-[12.5px] font-semibold text-[var(--b-bad)]">{seatError}</p>}
                <p className="mt-5 flex items-center gap-2 text-[12.5px] text-[var(--b-muted)]"><CalendarDays size={14} />{cancelling ? `No further charges. Plan ends ${renewLabel ?? "at the end of the period"}.` : renewLabel ? `Next payment on ${renewLabel}` : "Charged every period"}</p>
              </article>
            ) : (
              <article className={`${sticker} relative overflow-hidden bg-[var(--s-yellow)] p-7`}>
                <div aria-hidden className="pointer-events-none absolute -right-8 -top-8 size-44 opacity-25" style={{ backgroundImage: "radial-gradient(var(--s-line) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
                <div className="relative">
                  <span className={`${stamp} bg-[var(--s-paper)]`}><Rocket size={11} /> Upgrade</span>
                  <h3 className="mt-5 text-[32px] font-semibold leading-[1.03] tracking-[-0.045em]">Outgrowing Free?</h3>
                  <p className="mt-2 text-[14px] text-[var(--b-muted)]">Paid plans swap the message limit for a monthly AI credit.</p>
                  <ul className="mt-5 space-y-2.5 text-[14.5px]">
                    {(pricingPlans[1]?.features ?? []).slice(0, 5).map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5"><Check size={16} strokeWidth={3} className="shrink-0 text-[var(--s-green)]" />{feature}</li>
                    ))}
                  </ul>
                  <button type="button" onClick={() => setUpgradeOpen(true)} className={`${pillBtn} mt-7`}>See plans <ArrowRight size={14} /></button>
                </div>
              </article>
            )}

            <article className={`${sticker} bg-[var(--s-blue)] p-7`}>
              <span className={`${stamp} bg-[var(--s-paper)]`}><CreditCard size={11} /> Payment method</span>
              {paymentMethod?.last4 ? (
                <div className="relative mt-6 -rotate-1 overflow-hidden rounded-[18px] border-2 border-[var(--s-line)] bg-[var(--s-purple)] p-5 text-white">
                  <div aria-hidden className="pointer-events-none absolute -right-6 -top-6 size-32 opacity-25" style={{ backgroundImage: "radial-gradient(#fff 1.2px, transparent 1.2px)", backgroundSize: "12px 12px" }} />
                  <div className="relative flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em]">{paymentMethod.brand ?? "Card"}</span>
                    <CreditCard size={18} />
                  </div>
                  <p className="relative mt-8 font-mono text-[18px] tracking-[0.16em]">•••• •••• •••• {paymentMethod.last4}</p>
                  <div className="relative mt-5 flex items-end justify-between text-[11.5px]">
                    <span>{paymentMethod.expiryMonth && paymentMethod.expiryYear ? `Expires ${String(paymentMethod.expiryMonth).padStart(2, "0")}/${String(paymentMethod.expiryYear).slice(-2)}` : "Saved card"}</span>
                    <span className="rounded-full border-2 border-white/80 px-2.5 py-0.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.12em]">Default</span>
                  </div>
                </div>
              ) : (
                <div className="mt-6 flex flex-col items-center rounded-[18px] border-2 border-dashed border-[var(--s-line)] bg-[var(--s-paper)] px-5 py-9 text-center">
                  <span className="grid size-12 place-items-center rounded-full border-2 border-[var(--s-line)] bg-[var(--s-yellow)]"><CreditCard size={20} /></span>
                  <p className="mt-3 text-[16px] font-semibold tracking-[-0.02em]">No card saved yet</p>
                  <p className="mt-1 max-w-[250px] text-[12.5px] leading-5 text-[var(--b-muted)]">Your card is saved securely by our payment provider when you pay for a plan.</p>
                </div>
              )}
            </article>
          </div>

          {/* ------------------------------------------------------------------- history */}
          <section className={`${sticker} mt-5 overflow-hidden bg-[var(--s-paper)]`}>
            <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-5">
              <div className="flex items-center gap-3">
                <span className={`${stamp} bg-[var(--s-pink)] text-white`}><ReceiptText size={11} /> History</span>
                <p className="text-[13px] text-[var(--b-muted)]">Every charge on this workspace.</p>
              </div>
              {payments.length > 0 && <span className={`${stamp} bg-[var(--s-paper)]`}>{payments.length} payment{payments.length === 1 ? "" : "s"}</span>}
            </div>
            {payments.length ? (
              <ol className="border-t-2 border-[var(--s-line)]">
                {payments.map((payment, index) => (
                  <li key={payment.id} className={`flex items-center gap-4 px-6 py-4 ${index ? "border-t-2 border-[var(--s-line)]" : ""}`}>
                    <span className={`grid size-10 shrink-0 place-items-center rounded-xl border-2 border-[var(--s-line)] text-white ${payment.status === "failed" ? "bg-[var(--s-pink)]" : "bg-[var(--s-green)]"}`}>
                      {payment.status === "failed" ? <CircleAlert size={17} /> : <ReceiptText size={17} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14.5px] font-semibold">{payment.kind === "seats" ? "Extra seats" : payment.kind === "overage" ? "AI overage" : "Subscription"}</p>
                      <p className="mt-0.5 text-[12px] text-[var(--b-muted)]">{new Date(payment.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <span className="text-[16px] font-semibold tracking-[-0.02em] tabular-nums">{formatMoney(payment.amountMinor ?? payment.amountPaise, payment.currency)}</span>
                    <span className={`${stamp} w-[88px] justify-center text-white ${payment.status === "failed" ? "bg-[var(--s-pink)]" : "bg-[var(--s-green)]"}`}>{payment.status}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="relative flex flex-col items-center border-t-2 border-[var(--s-line)] bg-[var(--s-cream)] px-5 py-14 text-center">
                <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(var(--s-line) 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
                <span className="relative grid size-14 place-items-center rounded-full border-2 border-[var(--s-line)] bg-[var(--s-pink)] text-white"><ReceiptText size={22} /></span>
                <p className="relative mt-4 text-[18px] font-semibold tracking-[-0.03em]">No charges yet</p>
                <p className="relative mt-1 max-w-xs text-[13px] leading-5 text-[var(--b-muted)]">When you pay for a plan or extra seats, each charge shows up here.</p>
              </div>
            )}
          </section>
        </>
      )}

      {/* The same full-screen plan picker the header opens. Closing it refreshes the plan in case a checkout just finished. */}
      <UpgradeDialog open={upgradeOpen} onClose={() => { setUpgradeOpen(false); void loadStatus(); }} />

      {plan.id !== "free" && !cancelling && cancelOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !cancelBusy) setCancelOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="cancel-plan-title" className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#2d2d2d] p-6 text-white/90 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <p id="cancel-plan-title" className="text-[18px] font-medium">Cancel {plan.name}?</p>
            <p className="mt-2 text-[13px] leading-6 text-white/60">Your plan stays active until the end of the paid period. Then the workspace moves to Free with {pricingPlans[0].resolutions} AI messages a month and {pricingPlans[0].seatsIncluded} included seats.</p>
            {cancelError && <p role="alert" className="mt-3 text-[12px] text-red-300">{cancelError}</p>}
            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button type="button" disabled={cancelBusy} onClick={() => void cancelSubscription()} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#a5414b] px-4 text-[12px] font-medium text-white transition hover:bg-[#b44d58] disabled:opacity-60">{cancelBusy && <LoaderCircle size={13} className="animate-spin" />} Cancel at period end</button>
              <button type="button" disabled={cancelBusy} onClick={() => { setCancelOpen(false); setCancelError(null); }} className="h-10 flex-1 rounded-lg border border-white/10 px-4 text-[12px] font-medium text-white/80 transition hover:bg-white/[0.06]">Keep my plan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

type AiPersona = { id: string; name: string; aiName: string; aiAvatarUrl: string | null; aiPersona: string | null; chatbotAccent: string; chatbotTheme: "light" | "dark" | "auto"; chatbotReplyLanguage: string; greetingLines: string[] };

type Account = { email: string; name: string | null; avatarUrl: string | null; emailVerified: boolean; twoFactorEnabled: boolean };

type WorkspaceRef = { id: string; name: string };
type DeletionPlan = { canDelete: boolean; blocked: WorkspaceRef[]; soloOwned: WorkspaceRef[]; memberOf: WorkspaceRef[] };

/**
 * Delete workspace / Remove workspace / Delete account, gated behind
 * type-to-confirm for the two truly irreversible ones. "Remove workspace"
 * (leaving one you don't own) only asks for a click — you can always be
 * re-invited, so it doesn't carry the same weight as destroying data.
 */
function DangerZoneSection() {
  const { workspace, loading: loadingWorkspace } = useCurrentWorkspace();
  const isOwner = workspace?.role === "owner";

  const [open, setOpen] = useState<"workspace" | "account" | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plan, setPlan] = useState<DeletionPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(false);

  async function openAccountDialog() {
    setOpen("account");
    setError(null);
    setConfirmText("");
    setLoadingPlan(true);
    try {
      const response = await fetch("/api/account/delete-plan");
      const data = (await response.json().catch(() => ({}))) as DeletionPlan & { message?: string };
      if (!response.ok) {
        setError(data.message ?? "Could not check your account");
        setPlan(null);
      } else {
        setPlan(data);
      }
    } catch {
      setError("Could not check your account");
      setPlan(null);
    } finally {
      setLoadingPlan(false);
    }
  }

  function closeDialog() {
    setOpen(null);
    setConfirmText("");
    setError(null);
    setPlan(null);
  }

  async function removeWorkspace() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/workspace/danger/leave-workspace", { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "Could not remove this workspace");
        return;
      }
      window.location.assign("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDestroy() {
    if (!open) return;
    setBusy(true);
    setError(null);
    try {
      const endpoint = open === "workspace" ? "/api/workspace/danger/delete-workspace" : "/api/account/delete";
      const response = await fetch(endpoint, { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "Something went wrong");
        return;
      }
      window.location.assign(open === "account" ? "/login" : "/dashboard");
    } finally {
      setBusy(false);
    }
  }

  const requiredText = open === "workspace" ? workspace?.name ?? "" : "DELETE";
  const confirmReady = open === "account" ? confirmText === "DELETE" : confirmText.trim() === requiredText.trim() && requiredText.trim() !== "";

  return (
    <div className="mx-auto mt-8 w-full max-w-[1120px] px-8 sm:px-10 lg:px-12">
      <div className="dashboard-danger-zone rounded-xl border border-red-400/25 bg-[#262626] p-6">
        <div className="flex items-center gap-2 text-[#8f3d45]">
          <CircleAlert size={16} />
          <h3 className="text-[14px] font-semibold">Danger zone</h3>
        </div>

        {!loadingWorkspace && workspace && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f2dede] pt-4">
            <div>
              <p className="text-[13px] font-medium text-[#17181a]">{isOwner ? "Delete this workspace" : "Remove this workspace"}</p>
              <p className="mt-1 max-w-md text-[12px] text-[#8a7373]">
                {isOwner
                  ? `Permanently deletes "${workspace.name}" — every conversation, customer, knowledge base article, and its subscription. This cannot be undone.`
                  : `Removes you from "${workspace.name}". Your open conversations are handed to a teammate first. You can be re-invited later.`}
              </p>
            </div>
            {isOwner ? (
              <button type="button" onClick={() => { setOpen("workspace"); setError(null); setConfirmText(""); }} className="dashboard-danger-action flex h-10 shrink-0 items-center gap-2 rounded-md border border-red-400/30 bg-transparent px-4 text-[12px] font-normal text-red-300 transition hover:bg-red-400/10">
                <Trash2 size={13} /> Delete workspace
              </button>
            ) : (
              <button type="button" disabled={busy} onClick={() => void removeWorkspace()} className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-[#e5b3b3] bg-white px-4 text-[12px] font-semibold text-[#A64A53] transition hover:bg-[#fff3f3] disabled:cursor-not-allowed disabled:opacity-60">
                {busy ? <LoaderCircle size={13} className="animate-spin" /> : <LogOut size={13} />} Remove workspace
              </button>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f2dede] pt-4">
          <div>
            <p className="text-[13px] font-medium text-[#17181a]">Delete your account</p>
            <p className="mt-1 max-w-md text-[12px] text-[#8a7373]">Permanently deletes your account and every workspace only you own. Workspaces you share with teammates are left, not destroyed.</p>
          </div>
          <button type="button" onClick={() => void openAccountDialog()} className="dashboard-danger-action flex h-10 shrink-0 items-center gap-2 rounded-md border border-red-400/30 bg-transparent px-4 text-[12px] font-normal text-red-300 transition hover:bg-red-400/10">
            <Trash2 size={13} /> Delete account
          </button>
        </div>

        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
            <div role="dialog" aria-modal="true" className="w-full max-w-[420px] overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
              <div className="flex items-start justify-between border-b border-[#E5E9EB] px-6 py-5">
                <div>
                  <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[#8f3d45]">
                    {open === "workspace" ? `Delete "${workspace?.name}"?` : "Delete your account?"}
                  </h3>
                  <p className="mt-1 text-[12px] text-[#667069]">This cannot be undone.</p>
                </div>
                <button type="button" onClick={closeDialog} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-[#F0F2F3]"><X size={16} /></button>
              </div>

              <div className="p-6">
                {open === "account" && loadingPlan && <p className="text-[12.5px] text-[#667069]">Checking your workspaces…</p>}

                {open === "account" && !loadingPlan && plan && !plan.canDelete && (
                  <div>
                    <p className="text-[12.5px] leading-5 text-[#667069]">
                      You're the only owner of workspaces that still have other people in them. Delete these, or remove the other members, before deleting your account:
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {plan.blocked.map((item) => (
                        <li key={item.id} className="rounded-lg bg-[#FAF9F6] px-3 py-2 text-[12.5px] font-medium">{item.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {open === "account" && !loadingPlan && plan?.canDelete && (
                  <div className="text-[12.5px] leading-5 text-[#667069]">
                    {plan.soloOwned.length > 0 && (
                      <p>
                        Deletes {plan.soloOwned.length === 1 ? "the workspace" : `all ${plan.soloOwned.length} workspaces`} you solely own: {plan.soloOwned.map((w) => `"${w.name}"`).join(", ")}.
                      </p>
                    )}
                    {plan.memberOf.length > 0 && (
                      <p className="mt-2">You'll be removed from {plan.memberOf.map((w) => `"${w.name}"`).join(", ")} — those workspaces are left as they are.</p>
                    )}
                  </div>
                )}

                {(open === "workspace" || (open === "account" && plan?.canDelete)) && (
                  <div className="mt-4">
                    <label className="block text-[11.5px] font-semibold text-[#17233A]">
                      {open === "workspace" ? `Type "${requiredText}" to confirm` : 'Type "DELETE" to confirm'}
                    </label>
                    <input
                      value={confirmText}
                      onChange={(event) => setConfirmText(event.target.value)}
                      placeholder={requiredText}
                      className="mt-2 h-11 w-full rounded-xl border border-[#DDE4E8] px-3 text-[13px] outline-none focus:border-[#A64A53] focus:ring-2 focus:ring-[#A64A53]/10"
                    />
                  </div>
                )}

                {error && <p role="alert" className="mt-3 text-[11.5px] text-[#c63f4d]">{error}</p>}

                {(open === "workspace" || (open === "account" && plan?.canDelete)) && (
                  <button
                    type="button"
                    disabled={busy || !confirmReady}
                    onClick={() => void confirmDestroy()}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#A64A53] text-[13px] font-semibold text-white transition hover:bg-[#8f3d45] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    {open === "workspace" ? "Delete workspace" : "Delete account"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatbotComingSoonPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-7 pb-14 pt-8 text-[#17181a] sm:px-9 lg:px-10">
      <div className="border-b border-[#E5E8EA] pb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Chatbot</p>
        <h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-[#17181a]">{title}</h2>
        <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#667069]">{description}</p>
      </div>
      <div className="mt-6 rounded-xl border border-dashed border-[#e7e8ea] px-5 py-8 text-center">
        <p className="text-[13px] font-medium text-[#17181a]">Not yet available</p>
        <p className="mx-auto mt-1 max-w-sm text-[12px] leading-5 text-[#687178]">This is on the roadmap. There's nothing to configure here yet.</p>
      </div>
    </div>
  );
}

function BehaviorCard({ icon: Icon, title, accent, children }: { icon: typeof Settings; title: string; accent: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-[22px] border border-[#ECEEF0] bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${accent}17`, color: accent }}>
          <Icon size={18} />
        </span>
        <h3 className="text-[14px] font-semibold text-[#17181a]">{title}</h3>
      </div>
      <div className="mt-4 space-y-1">{children}</div>
    </div>
  );
}

function BehaviorToggleRow({
  label,
  checked,
  onCheckedChange,
  disabled,
  comingSoon,
}: {
  label: string;
  checked: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl px-2 py-2.5 transition hover:bg-[#fafbfc]">
      <span className="min-w-0 flex-1 text-[12.5px] leading-5 text-[#3c4245]">
        {label}
        {comingSoon && <span className="ml-2 inline-block rounded-full bg-[#f1f1f1] px-2 py-0.5 align-middle text-[9.5px] font-semibold uppercase tracking-wide text-[#a4acb1]">Soon</span>}
      </span>
      <Switch checked={checked} disabled={disabled ?? comingSoon} onCheckedChange={onCheckedChange ?? (() => {})} aria-label={label} />
    </div>
  );
}

function BehaviorLinkRow({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="group flex items-center justify-between gap-4 rounded-xl px-2 py-2.5 transition hover:bg-[#fafbfc]">
      <span className="min-w-0 flex-1 text-[12.5px] leading-5 text-[#3c4245]">{label}</span>
      <span className="flex shrink-0 items-center gap-1 text-[12px] font-semibold text-[#428ce5]">
        Restrictions <ArrowRight size={13} className="transition group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

function ChatbotBehaviorSettingsPage() {
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [namePhoneEnabled, setNamePhoneEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/workspace/contact-collection", { cache: "no-store" }).then((response) => (response.ok ? response.json() : { contactCollection: "chat" })),
      fetch("/api/workspace/prechat-fields", { cache: "no-store" }).then((response) => (response.ok ? response.json() : { fields: [] })),
    ])
      .then(([contactData, fieldData]: [{ contactCollection?: string }, { fields?: { id: string }[] }]) => {
        setEmailEnabled(contactData.contactCollection !== "off");
        setNamePhoneEnabled((fieldData.fields ?? []).some((field) => field.id === "name" || field.id === "phone"));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function toggleEmail(enabled: boolean) {
    setEmailEnabled(enabled);
    setSaving(true);
    await fetch("/api/workspace/contact-collection", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contactCollection: enabled ? "chat" : "off" }),
    }).catch(() => undefined);
    setSaving(false);
  }

  async function toggleNamePhone(enabled: boolean) {
    setNamePhoneEnabled(enabled);
    setSaving(true);
    const fields = enabled
      ? [
          { id: "name", label: "Name", type: "text", required: true },
          { id: "phone", label: "Phone number", type: "phone", required: true },
        ]
      : [];
    await fetch("/api/workspace/prechat-fields", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fields }),
    }).catch(() => undefined);
    setSaving(false);
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-7 pb-14 pt-8 text-[#17181a] sm:px-9 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E8EA] pb-7">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Chatbot</p>
          <h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-[#17181a]">Behavior</h2>
          <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#667069]">Enable or disable features on your chat widget.</p>
        </div>
        {(saving || !loading) && (
          <span className="mt-2 flex shrink-0 items-center gap-1.5 text-[12px] font-medium text-[#687178]">
            {saving ? <><LoaderCircle size={13} className="animate-spin" /> Saving…</> : <><CheckCircle2 size={14} className="text-[#2e8a5c]" /> Automatically saved</>}
          </span>
        )}
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <BehaviorCard icon={Home} title="Chatbot Home" accent="#7467E8">
          <BehaviorToggleRow label="Show a home section when the chat opens (helps guide visitors)" checked={false} comingSoon />
        </BehaviorCard>

        <BehaviorCard icon={UsersRound} title="Visitors" accent="#1596D6">
          <BehaviorToggleRow label="Ask visitors for their email address" checked={emailEnabled} onCheckedChange={(value) => void toggleEmail(value)} disabled={loading} />
          <BehaviorToggleRow label="Ask visitors for their name and phone number" checked={namePhoneEnabled} onCheckedChange={(value) => void toggleNamePhone(value)} disabled={loading} />
          <BehaviorToggleRow label="Force visitors to identify themselves before chatting" checked={false} comingSoon />
        </BehaviorCard>

        <BehaviorCard icon={Paperclip} title="Files" accent="#E56812">
          <BehaviorToggleRow label="Allow files to be sent from the chat widget" checked={false} comingSoon />
          <BehaviorToggleRow label="Allow voice recordings to be sent from the chat widget" checked={false} comingSoon />
        </BehaviorCard>

        <BehaviorCard icon={BookOpen} title="Knowledge Base" accent="#39B487">
          <BehaviorToggleRow label="Show a Knowledge Base tab in the chat widget" checked={false} comingSoon />
          <BehaviorToggleRow label="Knowledge-Base-only mode (AI answers are skipped)" checked={false} comingSoon />
        </BehaviorCard>

        <BehaviorCard icon={HeartPulse} title="Status" accent="#E6538D">
          <BehaviorToggleRow label="Show an alert in the widget when your status page reports an outage" checked={false} comingSoon />
        </BehaviorCard>

        <BehaviorCard icon={EyeOff} title="Hide Chatbot" accent="#5878E8">
          <BehaviorToggleRow label="Hide the chat widget if no teammate is available" checked={false} comingSoon />
          <BehaviorToggleRow label="Hide the chat widget on mobile devices" checked={false} comingSoon />
          <BehaviorLinkRow label="Show or hide the widget on specific pages" href="/dashboard/settings/chatbot-restrictions" />
        </BehaviorCard>

        <BehaviorCard icon={LockKeyhole} title="Privacy" accent="#A953D6">
          <BehaviorToggleRow label="Operator privacy mode (disables read receipts)" checked={false} comingSoon />
          <BehaviorToggleRow label="Show your team what a visitor is typing in real time" checked={false} comingSoon />
        </BehaviorCard>

        <BehaviorCard icon={MessagesSquare} title="Other" accent="#11999D">
          <BehaviorToggleRow label="Allow visitors to start a new conversation" checked={false} comingSoon />
        </BehaviorCard>
      </div>
    </div>
  );
}

type ChatbotUrlRules = { show: string[]; hide: string[] };

function UrlRuleSection({
  title,
  description,
  paths,
  loading,
  open,
  onOpenChange,
  draft,
  setDraft,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  paths: string[];
  loading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: string;
  setDraft: (value: string) => void;
  onAdd: () => void;
  onRemove: (path: string) => void;
}) {
  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[15px] font-semibold">{title}</h3>
          <p className="mt-1 max-w-md text-[12px] leading-5 text-[#687178]">{description}</p>
        </div>
        <button type="button" onClick={() => onOpenChange(true)} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-[#202020] px-3.5 text-[12px] font-medium text-white hover:bg-black">
          <Plus size={14} /> Add URL
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-[#e7e8ea]">
        {loading ? (
          <p className="px-4 py-5 text-[12px] text-[#687178]">Loading…</p>
        ) : paths.length === 0 ? (
          <p className="px-4 py-5 text-[12px] text-[#687178]">No URL added</p>
        ) : (
          paths.map((path, index) => (
            <div key={path} className={`flex items-center justify-between gap-3 px-4 py-3 ${index ? "border-t border-[#e7e8ea]" : ""}`}>
              <code className="min-w-0 truncate font-mono text-[12.5px]">{path}</code>
              <button type="button" aria-label={`Remove ${path}`} onClick={() => onRemove(path)} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-[#8b8d90] hover:bg-[#f7f8f8] hover:text-black">
                <X size={14} />
              </button>
            </div>
          ))
        )}
      </div>

      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0b0f14]/40 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onOpenChange(false); }}>
          <div role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-[480px] rounded-2xl bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
            <label className="block text-[14px] font-semibold text-[#17181a]">
              Allow a page by path (use <code className="font-mono text-[13px]">/*</code> for its sub-pages) <span className="text-[#e5484d]">*</span>
            </label>
            <input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") { event.preventDefault(); onAdd(); }
              }}
              placeholder="/docs/*"
              className="mt-3 h-12 w-full rounded-xl border border-[#DDE4E8] bg-[#f7f8f8] px-3.5 text-[14px] outline-none focus:border-[#428ce5] focus:bg-white focus:ring-2 focus:ring-[#428ce5]/15"
            />
            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={() => onOpenChange(false)} className="h-10 rounded-xl border border-[#17181a] px-4 text-[13px] font-semibold text-[#17181a] hover:bg-[#f7f8f8]">
                Cancel
              </button>
              <button
                type="button"
                onClick={onAdd}
                disabled={!draft.trim()}
                className="flex h-10 items-center gap-1.5 rounded-xl bg-[#428ce5] px-4 text-[13px] font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-[#428ce5]/40"
              >
                <Plus size={15} /> Add Allowed Page
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ChatbotUrlRestrictionsSettingsPage() {
  const [rules, setRules] = useState<ChatbotUrlRules>({ show: [], hide: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState<"show" | "hide" | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    fetch("/api/workspace/chatbot-restrictions", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { rules?: ChatbotUrlRules } | null) => setRules(data?.rules ?? { show: [], hide: [] }))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function save(next: ChatbotUrlRules) {
    setRules(next);
    setSaving(true);
    setError(null);
    const response = await fetch("/api/workspace/chatbot-restrictions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => null);
    const data = response ? ((await response.json().catch(() => ({}))) as { rules?: ChatbotUrlRules; message?: string }) : {};
    if (!response?.ok) setError(data.message ?? "Could not save. Try again.");
    else if (data.rules) setRules(data.rules);
    setSaving(false);
  }

  function addPath(list: "show" | "hide") {
    const path = draft.trim();
    if (!path) return;
    if (!path.startsWith("/")) {
      setError("A path must start with /, e.g. /docs or /docs/*");
      return;
    }
    const next = { ...rules, [list]: Array.from(new Set([...rules[list], path])) };
    setDraft("");
    setAddOpen(null);
    void save(next);
  }

  function removePath(list: "show" | "hide", path: string) {
    void save({ ...rules, [list]: rules[list].filter((item) => item !== path) });
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-7 pb-14 pt-8 text-[#17181a] sm:px-9 lg:px-10">
      <div className="border-b border-[#E5E8EA] pb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Chatbot</p>
        <h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-[#17181a]">Restrictions</h2>
        <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#667069]">
          Control which pages of your site show the chat widget. Use <code className="rounded bg-[#f1f1f1] px-1 py-0.5 font-mono text-[12px]">/docs/*</code> to match every page under a path.
        </p>
      </div>

      {error && <p role="alert" className="mt-4 rounded-lg bg-[#FFF2F2] px-3 py-2 text-[12px] font-medium text-[#A64A53]">{error}</p>}

      <UrlRuleSection
        title="Show only on these pages"
        description="Leave empty to show the widget everywhere. Add a path to limit it to just these pages."
        paths={rules.show}
        loading={loading}
        open={addOpen === "show"}
        onOpenChange={(open) => setAddOpen(open ? "show" : null)}
        draft={draft}
        setDraft={setDraft}
        onAdd={() => addPath("show")}
        onRemove={(path) => removePath("show", path)}
      />

      <UrlRuleSection
        title="Hide on these pages"
        description="The widget never shows on a matching page, even if it's also covered by a show rule above."
        paths={rules.hide}
        loading={loading}
        open={addOpen === "hide"}
        onOpenChange={(open) => setAddOpen(open ? "hide" : null)}
        draft={draft}
        setDraft={setDraft}
        onAdd={() => addPath("hide")}
        onRemove={(path) => removePath("hide", path)}
      />

      {saving && (
        <p className="mt-4 flex items-center gap-1.5 text-[12px] text-[#687178]">
          <LoaderCircle size={13} className="animate-spin" /> Saving…
        </p>
      )}
    </div>
  );
}

type CompanyInfo = { domain: string | null; createdAt: string; logoUrl: string | null };

function WorkspaceInformationSettingsPage() {
  const { workspace, loading } = useCurrentWorkspace();
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workspace/company-info", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: CompanyInfo | null) => setInfo(data))
      .catch(() => undefined)
      .finally(() => setInfoLoading(false));
  }, []);

  async function saveLogo(logoUrl: string | null) {
    setUploading(true);
    setError(null);
    const response = await fetch("/api/workspace/company-info", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ logoUrl }),
    }).catch(() => null);
    const data = response ? ((await response.json().catch(() => ({}))) as Partial<CompanyInfo> & { message?: string }) : {};
    if (!response?.ok) setError(data.message ?? "Could not save the logo. Try again.");
    else setInfo((current) => (current ? { ...current, logoUrl: data.logoUrl ?? null } : current));
    setUploading(false);
  }

  function chooseLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setError("Choose a PNG, JPG, or WebP image up to 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") void saveLogo(reader.result); };
    reader.readAsDataURL(file);
  }

  const createdLabel = info?.createdAt ? new Date(info.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : null;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-7 pb-14 pt-8 text-[#17181a] sm:px-9 lg:px-10">
      <div className="border-b border-[#E5E8EA] pb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Workspace</p>
        <h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-[#17181a]">Information</h2>
        <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#667069]">The basics of this workspace, and your role in it.</p>
      </div>

      <div className="mt-6 flex items-center gap-5">
        <div className="relative shrink-0">
          <span className="flex size-16 items-center justify-center overflow-hidden rounded-2xl border border-[#e7e8ea] bg-[#f7f8f8] text-[20px] font-bold text-[#687178]">
            {info?.logoUrl ? <img src={info.logoUrl} alt="Workspace logo" className="h-full w-full object-cover" /> : (workspace?.name || "W").charAt(0).toUpperCase()}
          </span>
          <label className="absolute -bottom-2 -right-2 flex size-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#202020] text-white shadow-sm transition hover:bg-black">
            {uploading ? <LoaderCircle size={12} className="animate-spin" /> : <Upload size={12} />}
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseLogo} className="sr-only" disabled={uploading} />
          </label>
        </div>
        <div>
          <p className="text-[13px] font-semibold">Workspace logo</p>
          <p className="mt-0.5 text-[12px] text-[#687178]">PNG, JPG, or WebP — up to 2 MB.</p>
          {info?.logoUrl && (
            <button type="button" onClick={() => void saveLogo(null)} disabled={uploading} className="mt-1 text-[12px] font-medium text-[#A64A53] hover:underline disabled:opacity-50">
              Remove logo
            </button>
          )}
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-[12px] font-medium text-[#A64A53]">{error}</p>}

      <div className="mt-6 overflow-hidden rounded-xl border border-[#e7e8ea]">
        {loading && <p className="px-5 py-5 text-[12px] text-[#687178]">Loading…</p>}
        {!loading && workspace && (
          <>
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="text-[12px] font-medium text-[#687178]">Workspace name</span>
              <span className="text-[13px] font-medium">{workspace.name}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#e7e8ea] px-5 py-4">
              <span className="text-[12px] font-medium text-[#687178]">Your role</span>
              <span className="text-[13px] font-medium capitalize">{workspace.role}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#e7e8ea] px-5 py-4">
              <span className="text-[12px] font-medium text-[#687178]">Connected domain</span>
              <span className="text-[13px] font-medium">{infoLoading ? "…" : info?.domain ?? "Not connected yet"}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#e7e8ea] px-5 py-4">
              <span className="text-[12px] font-medium text-[#687178]">Created</span>
              <span className="text-[13px] font-medium">{infoLoading ? "…" : createdLabel ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#e7e8ea] px-5 py-4">
              <span className="text-[12px] font-medium text-[#687178]">Workspace ID</span>
              <span className="font-mono text-[12px] text-[#687178]">{workspace.id}</span>
            </div>
          </>
        )}
        {!loading && !workspace && <p className="px-5 py-5 text-[12px] text-[#687178]">Could not load workspace details.</p>}
      </div>
    </div>
  );
}

function SettingsHubCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Link href={href} className="group flex items-center justify-between gap-4 border-t border-[#e7e8ea] px-5 py-5 text-left transition first:border-t-0 hover:bg-[#fafafa]">
      <span className="min-w-0 flex-1">
        <span className="block text-[13px] font-medium text-[#17181a]">{title}</span>
        <span className="mt-1 block text-[12px] leading-5 text-[#687178]">{description}</span>
      </span>
      <ArrowRight size={15} className="shrink-0 text-[#a4acb1] transition group-hover:translate-x-0.5 group-hover:text-[#687178]" />
    </Link>
  );
}

function SetupIntegrationSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-7 pb-14 pt-8 text-[#17181a] sm:px-9 lg:px-10">
      <div className="border-b border-[#E5E8EA] pb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Workspace</p>
        <h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-[#17181a]">Setup & Integration</h2>
        <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#667069]">Configure the chat widget and connect the tools your team already uses.</p>
      </div>

      <Link
        href="/dashboard/settings/identity"
        className="group mt-6 flex items-center justify-between gap-4 rounded-xl border border-[#e7e8ea] bg-[#fafbfc] px-5 py-4 transition hover:border-[#c9d0d4] hover:bg-[#ffffff]"
      >
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#428ce5]/10 text-[#428ce5]"><UserCheck size={17} /></span>
          <div>
            <p className="text-[13px] font-semibold">Enable verification</p>
            <p className="mt-0.5 text-[12px] text-[#687178]">Verify logged-in customers before they chat, so no one can pretend to be someone else.</p>
          </div>
        </div>
        <ArrowRight size={15} className="shrink-0 text-[#a4acb1] transition group-hover:translate-x-0.5 group-hover:text-[#687178]" />
      </Link>

      <div className="dashboard-connect-embedded mt-8 border-t border-[#E5E8EA] pt-8">
        <ConnectPageContent />
      </div>
    </div>
  );
}

function DataLimitsLegalSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-7 pb-14 pt-8 text-[#17181a] sm:px-9 lg:px-10">
      <div className="border-b border-[#E5E8EA] pb-7">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Workspace</p>
        <h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-[#17181a]">Data Limits & Legal</h2>
        <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#667069]">Usage limits, activity records, and the policies your workspace runs under.</p>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-[#e7e8ea]">
        <SettingsHubCard title="Audit Logs" description="Review workspace activity and security events." href="/dashboard/settings/audit-logs" />
        <SettingsHubCard title="Trash" description="Restore recently deleted workspace content." href="/dashboard/settings/trash" />
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-[#e7e8ea]">
        <SettingsHubCard title="Terms of Service" description="The agreement covering use of Elpino." href="/terms" />
        <SettingsHubCard title="Privacy Policy" description="How we handle your data and your customers' data." href="/privacy" />
      </div>
    </div>
  );
}

function WorkspaceDangerZoneSettingsPage() {
  return (
    <div className="pb-14 pt-8">
      <div className="mx-auto w-full max-w-[1120px] px-8 text-[#17181a] sm:px-10 lg:px-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Workspace</p>
        <h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-[#17181a]">Danger Zone</h2>
        <p className="mt-2 max-w-xl text-[14px] leading-6 text-[#667069]">Irreversible actions. Read the descriptions carefully before continuing.</p>
      </div>
      <DangerZoneSection />
    </div>
  );
}

function GeneralSettingsPage({ user }: { user: SettingsUser }) {
  const router = useRouter();
  const originalName = user.name?.trim() || user.email.split("@")[0];

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState(originalName);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardAppearance, setDashboardAppearance] = useState<DashboardAppearance>("light");

  const [twoFaBusy, setTwoFaBusy] = useState(false);
  const [twoFaSetup, setTwoFaSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [twoFaQr, setTwoFaQr] = useState<string | null>(null);
  const [twoFaCode, setTwoFaCode] = useState("");
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [twoFaDisabling, setTwoFaDisabling] = useState(false);
  const [twoFaShowSecret, setTwoFaShowSecret] = useState(false);

  // Generated entirely client-side so the TOTP secret never has to leave the
  // browser to reach a third-party QR rendering service.
  useEffect(() => {
    if (!twoFaSetup?.otpauthUrl) { setTwoFaQr(null); return; }
    let cancelled = false;
    QRCode.toDataURL(twoFaSetup.otpauthUrl, { margin: 1, width: 208 })
      .then((url) => { if (!cancelled) setTwoFaQr(url); })
      .catch(() => { if (!cancelled) setTwoFaQr(null); });
    return () => { cancelled = true; };
  }, [twoFaSetup?.otpauthUrl]);

  useEffect(() => {
    const dashboardTheme = readDashboardTheme();
    setDashboardAppearance(dashboardTheme.appearance);
    if (dashboardTheme.accent !== "#262626") saveDashboardTheme({ accent: "#262626", appearance: dashboardTheme.appearance });
    fetch("/api/account")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { account?: Account } | null) => {
        if (!data?.account) return;
        setName(data.account.name?.trim() || originalName);
        setAvatarUrl(data.account.avatarUrl ?? "");
        setEmailVerified(data.account.emailVerified);
        setTwoFactorEnabled(data.account.twoFactorEnabled);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateDashboardAppearance(appearance: DashboardAppearance) {
    setDashboardAppearance(appearance);
    saveDashboardTheme({ accent: "#262626", appearance });
  }

  const initial = (name.trim() || originalName).charAt(0).toUpperCase();

  const [avatarSaving, setAvatarSaving] = useState(false);

  async function saveAvatar(nextAvatarUrl: string | null) {
    setAvatarSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: name.trim() || originalName, avatarUrl: nextAvatarUrl }),
      });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) {
        setError(data.message ?? "Could not update your photo");
        return;
      }
      setAvatarUrl(nextAvatarUrl ?? "");
      router.refresh();
    } finally {
      setAvatarSaving(false);
    }
  }

  function chooseAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) {
      setError("Choose a PNG, JPG, or WebP image up to 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = typeof reader.result === "string" ? reader.result : "";
      if (dataUrl) void saveAvatar(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    void saveAvatar(null);
  }

  async function saveChanges() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const response = await fetch("/api/account", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: trimmed, avatarUrl }),
      });
      const data = (await response.json().catch(() => ({}))) as { name?: string; message?: string };
      if (!response.ok) {
        setError(data.message ?? "Could not update your profile");
        return;
      }
      setName(data.name ?? trimmed);
      setSaved(true);
      router.refresh();
      window.setTimeout(() => setSaved(false), 2200);
    } finally {
      setSaving(false);
    }
  }

  async function startTwoFactor() {
    setTwoFaBusy(true);
    setTwoFaError(null);
    try {
      const response = await fetch("/api/account/2fa/start", { method: "POST" });
      const data = (await response.json().catch(() => ({}))) as { secret?: string; otpauthUrl?: string; message?: string };
      if (!response.ok || !data.secret) {
        setTwoFaError(data.message ?? "Could not start setup");
        return;
      }
      setTwoFaSetup({ secret: data.secret, otpauthUrl: data.otpauthUrl ?? "" });
      setTwoFaCode("");
    } finally {
      setTwoFaBusy(false);
    }
  }

  async function verifyTwoFactor() {
    if (twoFaCode.trim().length !== 6 || twoFaBusy) return;
    setTwoFaBusy(true);
    setTwoFaError(null);
    try {
      const response = await fetch("/api/account/2fa/verify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: twoFaCode.trim() }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setTwoFaError(data.message ?? "Invalid code");
        return;
      }
      setTwoFactorEnabled(true);
      setTwoFaSetup(null);
      setTwoFaCode("");
    } finally {
      setTwoFaBusy(false);
    }
  }

  async function disableTwoFactor() {
    if (twoFaCode.trim().length !== 6 || twoFaBusy) return;
    setTwoFaBusy(true);
    setTwoFaError(null);
    try {
      const response = await fetch("/api/account/2fa/disable", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code: twoFaCode.trim() }),
      });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; message?: string };
      if (!response.ok || !data.ok) {
        setTwoFaError(data.message ?? "Invalid code");
        return;
      }
      setTwoFactorEnabled(false);
      setTwoFaDisabling(false);
      setTwoFaCode("");
    } finally {
      setTwoFaBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1120px] animate-pulse px-8 pb-6 pt-9 sm:px-10 lg:px-12">
        <div className="h-[26px] w-40 rounded bg-[#F2F3F3]" />

        <div className="mt-9 grid grid-cols-[310px_minmax(0,1fr)] gap-10 max-xl:grid-cols-[270px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:gap-5">
          <div>
            <div className="h-4 w-20 rounded bg-[#F2F3F3]" />
            <div className="mt-2 h-3 w-56 rounded bg-[#F2F3F3]" />
            <div className="mt-1.5 h-3 w-40 rounded bg-[#F2F3F3]" />
          </div>
          <div className="min-w-0">
            <div className="h-[82px] w-[82px] rounded-full bg-[#F2F3F3]" />
            <div className="mt-5 h-3 w-16 rounded bg-[#F2F3F3]" />
            <div className="mt-2 h-11 w-full rounded-xl bg-[#F2F3F3]" />
            <div className="mt-5 h-3 w-10 rounded bg-[#F2F3F3]" />
            <div className="mt-2 h-11 w-full rounded-xl bg-[#F2F3F3]" />
            <div className="mt-5 h-3 w-16 rounded bg-[#F2F3F3]" />
            <div className="mt-2 h-11 w-full rounded-xl bg-[#F2F3F3]" />
          </div>
        </div>

        <div className="my-7 h-px bg-[#e7e7e7]" />

        <div className="grid grid-cols-[310px_minmax(0,1fr)] gap-10 max-xl:grid-cols-[270px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:gap-5">
          <div>
            <div className="h-4 w-36 rounded bg-[#F2F3F3]" />
            <div className="mt-2 h-3 w-64 rounded bg-[#F2F3F3]" />
            <div className="mt-1.5 h-3 w-48 rounded bg-[#F2F3F3]" />
          </div>
          <div className="min-w-0">
            <div className="h-4 w-20 rounded bg-[#F2F3F3]" />
            <div className="mt-2 h-3 w-52 rounded bg-[#F2F3F3]" />
            <div className="mt-4 flex flex-wrap gap-4">
              <div className="h-[70px] w-[116px] rounded-lg bg-[#F2F3F3]" />
              <div className="h-[70px] w-[116px] rounded-lg bg-[#F2F3F3]" />
              <div className="h-[70px] w-[116px] rounded-lg bg-[#F2F3F3]" />
            </div>
          </div>
        </div>

        <div className="my-7 h-px bg-[#e7e7e7]" />

        <div className="grid grid-cols-[310px_minmax(0,1fr)] gap-10 max-xl:grid-cols-[270px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:gap-5">
          <div>
            <div className="h-4 w-52 rounded bg-[#F2F3F3]" />
            <div className="mt-2 h-3 w-64 rounded bg-[#F2F3F3]" />
            <div className="mt-1.5 h-3 w-44 rounded bg-[#F2F3F3]" />
          </div>
          <div className="min-w-0 py-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="h-4 w-44 rounded bg-[#F2F3F3]" />
                <div className="mt-2 h-3 w-56 rounded bg-[#F2F3F3]" />
              </div>
              <div className="h-8 w-20 shrink-0 rounded-lg bg-[#F2F3F3]" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mx-auto w-full max-w-[1120px] px-8 pb-6 pt-9 sm:px-10 lg:px-12">
        <h2 className="text-[26px] font-semibold tracking-[-0.025em] text-[#121315]">My Settings</h2>

        <div className="mt-9 grid grid-cols-[310px_minmax(0,1fr)] gap-10 max-xl:grid-cols-[270px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:gap-5">
          <div>
            <h3 className="dashboard-settings-heading text-base font-semibold">Profile</h3>
            <p className="dashboard-settings-subdesc mt-1 max-w-[280px] text-sm leading-[1.55] text-[#858585]">Your personal information and account security settings.</p>
          </div>

          <div className="min-w-0">
            <p className="text-[12px] font-medium">Avatar</p>
            <div className="relative mt-2 h-[82px] w-[82px]">
              <div className="dashboard-account-avatar flex h-[82px] w-[82px] items-center justify-center overflow-hidden rounded-full text-[29px] font-medium">
                {avatarSaving ? (
                  <LoaderCircle size={20} className="animate-spin opacity-60" />
                ) : avatarUrl.trim() ? (
                  <img src={avatarUrl} alt="Avatar preview" className="h-full w-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <label className="dashboard-avatar-upload absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#202225] text-white shadow-sm transition hover:bg-black" title="Upload avatar">
                <Upload size={13} />
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseAvatar} disabled={avatarSaving} className="sr-only" />
              </label>
            </div>
            <p className="mt-2 text-[11px] text-[#9a9a9a]">PNG, JPG, or WebP — up to 2 MB</p>
            {avatarUrl.trim() && (
              <button type="button" onClick={removeAvatar} disabled={avatarSaving} className="mt-1.5 text-[11.5px] font-medium text-[#a64a53] hover:underline disabled:opacity-50">
                Remove photo
              </button>
            )}
            <p className="mt-4 text-[12px] font-medium">{name.trim() || originalName}</p>

            <label className="mt-5 block text-[12px] font-medium" htmlFor="settings-full-name">Full Name</label>
            <div className="relative mt-2">
              <UserRound size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7073]" />
              <input id="settings-full-name" value={name} onChange={(event) => { setName(event.target.value); setSaved(false); }} className="h-11 w-full rounded-xl border border-[#d3d3d3] bg-white pl-10 pr-3 text-[13px] outline-none transition focus:border-[#777] focus:ring-1 focus:ring-[#777]/10" />
            </div>

            <label className="mt-5 block text-[12px] font-medium" htmlFor="settings-email">Email</label>
            <div className="relative mt-2">
              <Mail size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7073]" />
              <input id="settings-email" value={user.email} readOnly className="h-11 w-full rounded-xl border border-[#d3d3d3] bg-[#fcfcfc] pl-10 pr-20 text-[13px] text-[#333] outline-none" />
              {emailVerified && (
                <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-full bg-[#EAF5EE] px-2 py-1 text-[10px] font-semibold text-[#257A4D]">
                  <CheckCircle2 size={11} /> Verified
                </span>
              )}
            </div>

            <label className="mt-5 block text-[12px] font-medium" htmlFor="settings-password">Password</label>
            <div className="relative mt-2">
              <LockKeyhole size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7073]" />
              <input id="settings-password" type="password" disabled placeholder="Enter New Password" title="Password updates are not available yet" className="h-11 w-full cursor-not-allowed rounded-xl border border-[#d3d3d3] bg-[#fcfcfc] pl-10 pr-3 text-[13px] outline-none placeholder:text-[#898989] disabled:opacity-100" />
            </div>
            {error && <p className="mt-2 text-[11px] text-[#b8444f]">{error}</p>}
          </div>
        </div>

        <div className="my-7 h-px bg-[#e7e7e7]" />

        <div className="grid grid-cols-[310px_minmax(0,1fr)] gap-10 max-xl:grid-cols-[270px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:gap-5">
          <div><h3 className="dashboard-settings-heading text-base font-semibold">Dashboard appearance</h3><p className="dashboard-settings-subdesc mt-1 max-w-[285px] text-[12px] leading-[1.55] text-[#858585]">Personalize the dashboard canvas, navigation, buttons, and active states. These choices do not change your customer-facing chatbot.</p></div>
          <div className="min-w-0">
            <div><p className="dashboard-settings-heading text-base font-semibold">Appearance</p><p className="dashboard-settings-subdesc mt-1 text-sm text-[#858585]">Choose Light or Dark, or let System follow your device.</p><div className="mt-4 flex flex-wrap gap-4">{([['light','Light'],['dark','Dark'],['system','System']] as const).map(([value,label]) => { const swatchLight = value === 'light'; return <button key={value} type="button" onClick={() => updateDashboardAppearance(value)} className="text-left"><span className={`block h-[70px] w-[116px] overflow-hidden rounded-lg border-2 p-2 transition ${dashboardAppearance === value ? (swatchLight ? "border-black/70" : "border-white/70") : "border-white/10"} ${swatchLight ? "bg-[#f4f4f5]" : "bg-[#202327]"}`}><span className={`block h-2 w-8 rounded ${swatchLight ? "bg-black/30" : "bg-white/35"}`} /><span className={`mt-2 block h-2 w-16 rounded ${swatchLight ? "bg-black/15" : "bg-white/20"}`} /></span><span className={`mt-2 block text-[11px] font-normal ${dashboardAppearance === value ? "text-white/90" : "text-white/55"}`}>{label}</span></button>; })}</div></div>
          </div>
        </div>

        <div className="my-7 h-px bg-[#e7e7e7]" />

        <div className="grid grid-cols-[310px_minmax(0,1fr)] gap-10 max-xl:grid-cols-[270px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:gap-5">
          <div>
            <h3 className="dashboard-settings-heading text-base font-semibold">Two-factor authentication (2FA)</h3>
            <p className="dashboard-settings-subdesc mt-1 max-w-[285px] text-[12px] leading-[1.55] text-[#858585]">Keep your account secure by enabling 2FA via SMS or using a temporary one-time passcode from an authenticator app.</p>
          </div>
          <div className="divide-y divide-[#e7e7e7]">
            <div className="py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="dashboard-settings-heading text-base font-semibold">Authenticator App (TOTP)</p>
                  <p className="dashboard-settings-subdesc mt-1 text-sm leading-5 text-[#858585]">Use an authentication app to generate secure login codes.</p>
                </div>
                {twoFactorEnabled ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#EAF5EE] px-2.5 py-1 text-[11px] font-semibold text-[#257A4D]"><Check size={12} /> Enabled</span>
                ) : (
                  <button type="button" disabled={twoFaBusy} onClick={() => void startTwoFactor()} className="dashboard-settings-outline-action flex h-8 shrink-0 items-center gap-1.5 rounded-lg border border-[#d3d3d3] px-3 text-[11px] font-semibold text-[#333] transition hover:bg-[#f5f5f5] disabled:opacity-50">
                    {twoFaBusy ? <LoaderCircle size={12} className="animate-spin" /> : null} Set up
                  </button>
                )}
              </div>

              {twoFaSetup && (
                <TwoFactorSetupDialog
                  secret={twoFaSetup.secret}
                  qrDataUrl={twoFaQr}
                  code={twoFaCode}
                  setCode={setTwoFaCode}
                  showSecret={twoFaShowSecret}
                  setShowSecret={setTwoFaShowSecret}
                  busy={twoFaBusy}
                  error={twoFaError}
                  onVerify={() => void verifyTwoFactor()}
                  onClose={() => { setTwoFaSetup(null); setTwoFaCode(""); setTwoFaError(null); setTwoFaShowSecret(false); }}
                />
              )}

              {twoFactorEnabled && (
                twoFaDisabling ? (
                  <div className="mt-4 rounded-xl border border-[#f2c7c7] bg-[#fff7f7] p-4">
                    <p className="text-[12px] text-[#6f2929]">Enter a current code from your authenticator app to disable two-factor authentication.</p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <input
                        value={twoFaCode}
                        onChange={(event) => setTwoFaCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                        onKeyDown={(event) => { if (event.key === "Enter") void disableTwoFactor(); }}
                        placeholder="123456"
                        inputMode="numeric"
                        className="h-10 w-32 rounded-lg border border-[#d3d3d3] px-3 text-[13px] tracking-[0.2em] outline-none focus:border-[#777]"
                      />
                      <button type="button" disabled={twoFaBusy || twoFaCode.length !== 6} onClick={() => void disableTwoFactor()} className="flex h-10 items-center gap-1.5 rounded-lg bg-[#A64A53] px-3.5 text-[12px] font-semibold text-white transition hover:bg-[#8f3d45] disabled:cursor-not-allowed disabled:opacity-50">
                        {twoFaBusy ? <LoaderCircle size={13} className="animate-spin" /> : null} Disable
                      </button>
                      <button type="button" onClick={() => { setTwoFaDisabling(false); setTwoFaCode(""); setTwoFaError(null); }} className="text-[12px] font-medium text-[#858585] hover:text-black">Cancel</button>
                    </div>
                    {twoFaError && <p className="mt-2 text-[11px] text-[#b8444f]">{twoFaError}</p>}
                  </div>
                ) : (
                  <button type="button" onClick={() => setTwoFaDisabling(true)} className="mt-3 text-[11px] font-medium text-[#A64A53] hover:underline">Disable two-factor authentication</button>
                )
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1120px] items-center justify-end border-t border-[#e5e5e5] px-8 py-6 sm:px-10 lg:px-12">
        {saved && <span className="mr-3 flex items-center gap-1.5 text-[11px] font-medium text-[#2e8a5c]"><Check size={14} /> Changes saved</span>}
        <button type="button" onClick={() => void saveChanges()} disabled={saving || !name.trim()} className="flex h-11 items-center gap-2 rounded-xl bg-[#202020] px-5 text-[12px] font-medium text-white shadow-sm transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save changes</>}
        </button>
      </div>
    </>
  );
}

// The stock icon gallery is served from the backend (see
// /api/stock-icons and /api/stock-icons/[name]) rather than baked in here,
// so adding or swapping a PNG in shared/icons/ shows up without a frontend
// change. Built as an absolute URL (this app's own origin, not a relative
// path) because it also has to load correctly from the launcher button
// tag.js injects directly into a customer's website, not just from inside
// this dashboard.
function stockIconUrl(id: string) {
  return `${window.location.origin}/api/stock-icons/${id}.png`;
}

function ChatbotInterfaceSettingsPage({ previewContainer }: { previewContainer: HTMLDivElement | null }) {
  const [loading, setLoading] = useState(true);
  const [aiName, setAiName] = useState("Elpino AI");
  const [aiAvatarUrl, setAiAvatarUrl] = useState("");
  const [accent, setAccent] = useState("#202225");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const [replyLanguage, setReplyLanguage] = useState("auto");
  const [replyLanguageOpen, setReplyLanguageOpen] = useState(false);
  const [greetingLines, setGreetingLines] = useState<string[]>(["Hi there 👋", "How can I help you today?"]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFields, setPreviewFields] = useState<PreChatField[]>([]);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [avatarTab, setAvatarTab] = useState<"stock" | "upload">("stock");
  const [stockIconIds, setStockIconIds] = useState<string[]>([]);
  const [stockIconsLoading, setStockIconsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stock-icons")
      .then((response) => (response.ok ? response.json() : { icons: [] }))
      .then((data: { icons?: string[] }) => setStockIconIds(data.icons ?? []))
      .catch(() => setStockIconIds([]))
      .finally(() => setStockIconsLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/workspace/ai-persona")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { persona?: AiPersona | null } | null) => {
        if (!data?.persona) return;
        setAiName(data.persona.aiName ?? "Elpino AI");
        setAiAvatarUrl(data.persona.aiAvatarUrl ?? "");
        setAccent(data.persona.chatbotAccent ?? "#202225");
        setTheme(data.persona.chatbotTheme ?? "light");
        setReplyLanguage(data.persona.chatbotReplyLanguage ?? "auto");
        setGreetingLines(Array.isArray(data.persona.greetingLines) && data.persona.greetingLines.length > 0 ? data.persona.greetingLines : ["Hi there 👋", "How can I help you today?"]);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const cleanGreetingLines = greetingLines.map((line) => line.trim()).filter(Boolean);

  async function save() {
    if (!aiName.trim() || cleanGreetingLines.length === 0 || saving) return;
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const response = await fetch("/api/workspace/ai-persona", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          aiName: aiName.trim(),
          aiAvatarUrl: aiAvatarUrl.trim(),
          chatbotAccent: accent,
          chatbotTheme: theme,
          chatbotReplyLanguage: replyLanguage,
          greetingLines: cleanGreetingLines,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { persona?: AiPersona; message?: string };
      if (!response.ok) {
        setError(data.message ?? "Could not save changes");
        return;
      }
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    } finally {
      setSaving(false);
    }
  }

  function chooseAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || file.size > 2 * 1024 * 1024) { setError("Choose a PNG, JPG, or WebP image up to 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { setAiAvatarUrl(typeof reader.result === "string" ? reader.result : ""); setSaved(false); };
    reader.readAsDataURL(file);
  }

  useEffect(() => {
    if (loading || !aiName.trim() || cleanGreetingLines.length === 0) return;
    const timer = window.setTimeout(() => { void save(); }, 700);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent, theme, replyLanguage, aiName, aiAvatarUrl, greetingLines, loading]);

  function updateGreetingLine(index: number, value: string) {
    setGreetingLines((current) => current.map((line, i) => (i === index ? value : line)));
    setSaved(false);
  }

  function addGreetingLine() {
    setGreetingLines((current) => [...current, ""]);
    setSaved(false);
  }

  function removeGreetingLine(index: number) {
    setGreetingLines((current) => (current.length > 1 ? current.filter((_, i) => i !== index) : current));
    setSaved(false);
  }

  return (
    <div className="dashboard-chatbot-settings-page mx-auto w-full max-w-[1280px] px-7 pb-20 pt-8 text-white/90 sm:px-9 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[32px] font-medium tracking-[-0.04em] text-white/90">Chatbot Interface</h2>
        </div>
        {/* Every field here autosaves 700ms after the last edit (see the
            debounced effect above) — there's no Save button, so without this
            a successful save was completely silent and looked identical to a
            failed one. */}
        {(saving || saved) && (
          <span className={`mt-2 flex shrink-0 items-center gap-1.5 text-[12px] font-medium ${saved ? "text-[#2e8a5c]" : "text-[#667069]"}`}>
            {saving ? <><LoaderCircle size={13} className="animate-spin" /> Saving…</> : <><Check size={14} /> Changes saved</>}
          </span>
        )}
      </div>

      {loading ? (
        <div className="mt-7 h-72 animate-pulse rounded-[20px] border border-white/10 bg-white/[0.035]" />
      ) : (
        <div className="mt-7">
          <div className="min-w-0">
            <div data-tour="widget-identity" className="overflow-hidden py-5">
              <div className="grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  <h3 className="text-[16px] font-semibold">General information</h3>
                  <p className="mt-1 max-w-[200px] text-[12px] leading-5 text-[#667069]">The name and avatar shown to customers in chat.</p>
                </div>
                <div className="w-full min-w-0">
                  <span className="block text-[12px] font-semibold text-[#17233A]">Avatar</span>
                  <div className="relative mt-2 inline-block">
                    <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-[22px] font-bold text-white" style={{ backgroundColor: accent }}>
                      {aiAvatarUrl.trim() ? (
                        <img src={aiAvatarUrl} alt="AI avatar preview" className="h-full w-full object-cover" />
                      ) : (
                        (aiName.trim() || "R").charAt(0).toUpperCase()
                      )}
                    </span>
                    <button
                      type="button"
                      title="Change avatar"
                      onClick={() => setAvatarPickerOpen(true)}
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-[#1c1c1c] bg-[#202225] text-white shadow-sm transition hover:bg-black"
                    >
                      <Upload size={13} />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-[#8b8d90]">PNG, JPG, or WebP — up to 2 MB</p>

                  <label className="mt-5 block w-1/2">
                    <span className="text-[12px] font-semibold text-[#17233A]">Chatbot name</span>
                    <div className="relative mt-2">
                      <UserRound size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d90]" />
                      <input
                        value={aiName}
                        onChange={(event) => { setAiName(event.target.value); setSaved(false); }}
                        placeholder="Elpino AI"
                        className="h-11 w-full rounded-xl border border-[#DDE4E8] pl-9 pr-3 text-[13px] outline-none transition focus:border-[#11120f] focus:ring-2 focus:ring-[#11120f]/8"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {error && <p className="mt-4 text-[12px] text-[#c63f4d]">{error}</p>}

            <div data-tour="widget-greeting" className="overflow-hidden border-t border-white/10 py-5">
              <div className="grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  <h3 className="text-[16px] font-semibold">Greeting message</h3>
                  <p className="mt-1 max-w-[200px] text-[12px] leading-5 text-[#667069]">Shown before a visitor starts chatting, on the launcher and at the top of a new conversation.</p>
                </div>
                <div className="w-full min-w-0">
                  <div className="w-full space-y-2">
                    {greetingLines.map((line, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f1f1] text-[#666]"><MessageCircle size={15} /></span>
                        <input
                          value={line}
                          onChange={(event) => updateGreetingLine(index, event.target.value)}
                          placeholder={index === 0 ? "Hi there 👋" : "How can I help you today?"}
                          className="h-9 w-full rounded-lg border border-[#DDE4E8] px-3 text-[13px] outline-none transition focus:border-[#11120f] focus:ring-2 focus:ring-[#11120f]/8"
                        />
                        {greetingLines.length > 1 && (
                          <button type="button" aria-label="Remove line" onClick={() => removeGreetingLine(index)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-[#8b8d90] hover:bg-[#f7f8f8] hover:text-black">
                            <X size={15} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button type="button" onClick={addGreetingLine} className="dashboard-greeting-add-button flex h-9 items-center gap-2 rounded-lg border border-dashed border-[#DDE4E8] px-3 text-[12px] font-semibold text-[#666] transition hover:border-[#b9c0c5] hover:text-black">
                      <Plus size={14} /> Add message
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden border-t border-white/10 py-5">
              <div className="grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  <h3 className="text-[16px] font-semibold">Theme color</h3>
                  <p className="mt-1 max-w-[200px] text-[12px] leading-5 text-[#667069]">Choose the accent used by the chat launcher, buttons, and active states.</p>
                </div>
                <div className="w-full min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    {["#202225", "#7467E8", "#1596D6", "#E6538D", "#A953D6", "#5878E8", "#E56812", "#11999D", "#A98E82", "#39B487"].map((color) => (
                      <button key={color} type="button" aria-label={`Use ${color} theme`} onClick={() => { setAccent(color); setSaved(false); }} className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${accent === color ? "ring-2 ring-white/80 ring-offset-2 ring-offset-[#2f2f2f]" : "hover:scale-105"}`} style={{ backgroundColor: color }}>
                        {accent === color && <Check size={15} className="text-white" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 py-5">
              <div className="grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  <h3 className="text-[16px] font-semibold">Reply language</h3>
                  <p className="mt-1 max-w-[200px] text-[12px] leading-5 text-[#667069]">Auto matches whatever language the customer writes in. Forcing one replies in it regardless of what they type.</p>
                </div>
                <div className="relative w-full min-w-0 sm:w-1/2">
                  <button
                    type="button"
                    onClick={() => setReplyLanguageOpen((open) => !open)}
                    aria-expanded={replyLanguageOpen}
                    aria-haspopup="listbox"
                    className="flex h-11 w-full items-center gap-2.5 rounded-xl border border-[#DDE4E8] px-3 text-[13px] outline-none transition focus:border-[#11120f] focus:ring-2 focus:ring-[#11120f]/8"
                  >
                    {replyLanguage === "auto" ? (
                      <span className="flex h-4 w-5 shrink-0 items-center justify-center text-[13px]">🌐</span>
                    ) : (
                      <LanguageFlag countryCode={LANGUAGE_COUNTRY_CODES[replyLanguage] ?? "gb"} />
                    )}
                    <span className="min-w-0 flex-1 truncate text-left">
                      {replyLanguage === "auto" ? "Auto (match the customer)" : `Always reply in ${SUPPORTED_LANGUAGES.find((item) => item.code === replyLanguage)?.name ?? replyLanguage}`}
                    </span>
                    <ChevronDown size={15} className={`shrink-0 text-[#8b8d90] transition-transform ${replyLanguageOpen ? "rotate-180" : ""}`} />
                  </button>

                  {replyLanguageOpen && (
                    <>
                      <button type="button" className="fixed inset-0 z-40 cursor-default" aria-label="Close language menu" onClick={() => setReplyLanguageOpen(false)} />
                      <div role="listbox" className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-[14px] border border-[#e0e2e7] bg-[#ffffff] p-2 text-left shadow-[0_18px_50px_rgba(26,32,44,0.14)]">
                        <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#89909f]">Choose language</div>
                        <div className="max-h-[280px] overflow-y-auto overscroll-contain">
                          <button
                            type="button"
                            role="option"
                            aria-selected={replyLanguage === "auto"}
                            onClick={() => { setReplyLanguage("auto"); setReplyLanguageOpen(false); setSaved(false); }}
                            className={`flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-left text-[13px] transition ${replyLanguage === "auto" ? "bg-[#eff6ff] font-semibold text-[#1d4ed8]" : "text-[#404653] hover:bg-[#f5f6f7]"}`}
                          >
                            <span className="flex h-4 w-5 shrink-0 items-center justify-center text-[13px]">🌐</span>
                            <span>Auto (match the customer)</span>
                            {replyLanguage === "auto" && <span className="ml-auto text-[#2563eb]">✓</span>}
                          </button>
                          {SUPPORTED_LANGUAGES.map((item) => (
                            <button
                              key={item.code}
                              type="button"
                              role="option"
                              aria-selected={replyLanguage === item.code}
                              onClick={() => { setReplyLanguage(item.code); setReplyLanguageOpen(false); setSaved(false); }}
                              className={`flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-left text-[13px] transition ${replyLanguage === item.code ? "bg-[#eff6ff] font-semibold text-[#1d4ed8]" : "text-[#404653] hover:bg-[#f5f6f7]"}`}
                            >
                              <LanguageFlag countryCode={LANGUAGE_COUNTRY_CODES[item.code] ?? "gb"} />
                              <span>{item.name}</span>
                              {replyLanguage === item.code && <span className="ml-auto text-[#2563eb]">✓</span>}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 py-5">
              <div className="grid gap-6 sm:grid-cols-[220px_minmax(0,1fr)]">
                <div>
                  <h3 className="text-[16px] font-semibold">Collect contact details</h3>
                  <p className="mt-1 max-w-[200px] text-[12px] leading-5 text-[#667069]">Choose which contact details the chat widget asks visitors to share.</p>
                </div>
                <div className="w-full min-w-0">
                  <ContactCollectionSwitch onFieldsChange={setPreviewFields} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {!loading && previewContainer && createPortal(
        <WidgetPreviewCard accent={accent} aiName={aiName} aiAvatarUrl={aiAvatarUrl} greetingLines={cleanGreetingLines.length > 0 ? cleanGreetingLines : ["Hi there 👋", "How can I help you today?"]} fields={previewFields} />,
        previewContainer
      )}

      {avatarPickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setAvatarPickerOpen(false); }}
        >
          <div role="dialog" aria-modal="true" aria-label="Change avatar" className="dashboard-avatar-picker flex h-[80vh] w-[60vw] max-w-none flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#2d2d2d] text-white/90 shadow-[0_28px_80px_rgba(0,0,0,0.38)] max-lg:h-[85vh] max-lg:w-[92vw]">
            <div className="flex items-start justify-between border-b border-[#E5E9EB] px-7 py-5">
              <div>
                <h3 className="text-[18px] font-semibold tracking-[-0.02em]">Change avatar</h3>
                <p className="mt-1 text-[12.5px] text-[#667069]">Pick a stock icon or upload your own — this is what customers see in every conversation, and the icon they'll click to open the chat.</p>
              </div>
              <button type="button" onClick={() => setAvatarPickerOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-[#F0F2F3]"><X size={18} /></button>
            </div>

            <div className="flex shrink-0 gap-2 border-b border-[#E5E9EB] px-7 pt-4">
              <button
                type="button"
                onClick={() => setAvatarTab("stock")}
                className={`rounded-t-lg px-4 py-2.5 text-[13px] font-semibold transition ${avatarTab === "stock" ? "border-b-2 border-[#11120f] text-black" : "text-[#8a9298] hover:text-black"}`}
              >
                Stock icons
              </button>
              <button
                type="button"
                onClick={() => setAvatarTab("upload")}
                className={`rounded-t-lg px-4 py-2.5 text-[13px] font-semibold transition ${avatarTab === "upload" ? "border-b-2 border-[#11120f] text-black" : "text-[#8a9298] hover:text-black"}`}
              >
                Upload
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-7">
              {avatarTab === "stock" ? (
                stockIconsLoading ? (
                  <div className="flex items-center justify-center py-16 text-[12px] text-[#8a9298]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading icons</div>
                ) : stockIconIds.length === 0 ? (
                  <p className="py-16 text-center text-[12.5px] text-[#8a9298]">No stock icons available yet.</p>
                ) : (
                  <div className="grid grid-cols-6 gap-4 max-lg:grid-cols-4 max-sm:grid-cols-3">
                    {stockIconIds.map((id) => {
                      const url = stockIconUrl(id);
                      const active = aiAvatarUrl === url;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => { setAiAvatarUrl(url); setSaved(false); setAvatarPickerOpen(false); }}
                          aria-label={`Use ${id} avatar`}
                          className={`flex aspect-square items-center justify-center overflow-hidden rounded-2xl border border-[#eceeef] transition hover:scale-105 hover:shadow-md ${active ? "ring-2 ring-[#11120f] ring-offset-2" : ""}`}
                        >
                          <img src={url} alt="" className="h-full w-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="mx-auto max-w-md">
                  <label className="flex h-56 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#c7cdd1] text-center text-[13px] text-[#667069] transition hover:bg-[#f7f8f8]">
                    <Upload size={28} />
                    <span>Click to upload a PNG, JPG, or WebP<br />up to 2MB</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(event) => { chooseAvatar(event); setAvatarPickerOpen(false); }}
                      className="sr-only"
                    />
                  </label>
                  {aiAvatarUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => { setAiAvatarUrl(""); setSaved(false); setAvatarPickerOpen(false); }}
                      className="mt-4 w-full text-center text-[13px] font-medium text-[#a5414b] hover:underline"
                    >
                      Remove current avatar
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Mirrors the color tokens in app/widget/page.tsx — the live widget's chrome
// is dark regardless of the workspace's Appearance setting, so the preview
// matches what visitors actually see rather than the theme picker above it.
const PREVIEW_BG = "#18181b";
const PREVIEW_BUBBLE = "#2a2a2e";
const PREVIEW_BORDER = "#2c2c30";
const PREVIEW_MUTED = "rgba(255,255,255,.55)";
const PREVIEW_ICON_MUTED = "rgba(255,255,255,.85)";
const PREVIEW_EMOJI = ["😀", "😂", "🥰", "😍", "😊", "🙂", "👍", "🙌", "🎉", "❤️", "🔥", "✨"];
const PREVIEW_COUNTRIES = [
  { flag: "🇮🇳", code: "+91", name: "India" },
  { flag: "🇺🇸", code: "+1", name: "United States" },
  { flag: "🇬🇧", code: "+44", name: "United Kingdom" },
  { flag: "🇦🇺", code: "+61", name: "Australia" },
];

type PreviewScreen = "home" | "list" | "form" | "thread";
type PreviewMessage = { id: string; fromVisitor: boolean; body: string };

function WidgetPreviewCard({
  accent,
  aiName,
  aiAvatarUrl,
  greetingLines,
  fields,
}: {
  accent: string;
  aiName: string;
  aiAvatarUrl: string;
  greetingLines: string[];
  fields: PreChatField[];
}) {
  const [open, setOpen] = useState(false);
  const [greetingVisible, setGreetingVisible] = useState(false);
  const [screen, setScreen] = useState<PreviewScreen>("home");
  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [formCountry, setFormCountry] = useState(0);
  const [messages, setMessages] = useState<PreviewMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    setGreetingVisible(false);
    setScreen("home");
    setStarted(false);
    setAnswers({});
    setMessages([]);
  }, [fields]);

  // Mirrors tag.js: the launcher shows a greeting bubble a couple seconds
  // after the widget mounts, as long as the visitor hasn't opened it yet.
  useEffect(() => {
    if (open) { setGreetingVisible(false); return; }
    const timer = window.setTimeout(() => setGreetingVisible(true), 2500);
    return () => window.clearTimeout(timer);
  }, [open]);

  const displayName = aiName.trim() || "Elpino AI";
  const initial = displayName.charAt(0).toUpperCase();
  const lines = greetingLines.length > 0 ? greetingLines : ["Hi there 👋", "How can I help you today?"];
  const showTabBar = screen === "home" || screen === "list";

  function openWidget() {
    setGreetingVisible(false);
    setOpen(true);
  }

  function closeWidget() {
    setOpen(false);
  }

  function beginConversation() {
    setScreen(!started && fields.length > 0 ? "form" : "thread");
  }

  // The greeting popup is a shortcut straight into a conversation — mirrors
  // tag.js, where clicking it opens the widget with "&new=1" instead of
  // landing on the Home screen like the plain launcher button does.
  function openWidgetToConversation() {
    setGreetingVisible(false);
    setOpen(true);
    beginConversation();
  }

  function canSubmitForm() {
    return fields.every((field) => {
      if (!field.required) return true;
      const value = answers[field.id];
      return field.type === "checkbox" && !field.multiple ? value === "true" : Boolean(value?.trim());
    });
  }

  function submitForm() {
    if (!canSubmitForm()) return;
    setStarted(true);
    setScreen("thread");
  }

  function sendPreviewMessage() {
    const body = draft.trim();
    if (!body) return;
    setDraft("");
    setMessages((current) => [...current, { id: `${Date.now()}`, fromVisitor: true, body }]);
  }

  return (
    <>
      <div className="shrink-0 border-b border-[#E5E9EB] px-4 py-3">
        <p className="text-[12px] font-semibold text-[#17181a]">Preview</p>
        <p className="mt-0.5 text-[11px] text-[#858585]">Try it like a visitor would — click the launcher, just like on your site.</p>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden bg-[#eef0f1]">
        {greetingVisible && !open && (
          <div
            role="button"
            tabIndex={0}
            onClick={openWidgetToConversation}
            onKeyDown={(event) => { if (event.key === "Enter") openWidgetToConversation(); }}
            className="absolute bottom-20 right-4 flex w-[248px] cursor-pointer flex-col items-end gap-1.5"
          >
            <button
              type="button"
              aria-label="Dismiss"
              onClick={(event) => { event.stopPropagation(); setGreetingVisible(false); }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white/60 shadow-lg transition hover:text-white"
              style={{ backgroundColor: "rgba(23,25,27,0.9)" }}
            >
              <X size={12} />
            </button>
            {lines.map((line, index) => (
              <div key={index} className="w-fit max-w-full rounded-md border border-black/40 bg-white px-3.5 py-2.5 text-[12.5px] leading-5 text-[#18181b] shadow-2xl transition hover:brightness-95">
                {line}
              </div>
            ))}
          </div>
        )}

        {open && (
          <div
            className="absolute bottom-20 right-4 left-4 flex flex-col overflow-hidden rounded-2xl text-white shadow-2xl sm:left-auto sm:w-[300px]"
            style={{ backgroundColor: PREVIEW_BG, top: "12px" }}
          >
            {screen === "form" ? (
            <div className="flex h-full flex-col">
              <div className="shrink-0 px-5 pb-6 pt-5">
                <button type="button" aria-label="Back to home" onClick={() => setScreen("home")} className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10">
                  <ChevronLeft size={18} />
                </button>
                <p className="mt-3 text-[14px] font-semibold leading-5">Please share a few details here so {displayName} can connect you with the right person.</p>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto rounded-t-[24px] bg-white px-4 pb-5 pt-5 text-[#1c1c1e]">
                <form className="space-y-3" onSubmit={(event) => { event.preventDefault(); submitForm(); }}>
                  {fields.map((field) => (
                    <PreviewPreChatField
                      key={field.id}
                      field={field}
                      value={answers[field.id] ?? ""}
                      onChange={(value) => setAnswers((current) => ({ ...current, [field.id]: value }))}
                      formCountry={formCountry}
                      setFormCountry={setFormCountry}
                      accent={accent}
                    />
                  ))}
                  <button
                    type="submit"
                    disabled={!canSubmitForm()}
                    className="flex w-full items-center justify-center rounded-full py-2.5 text-[12.5px] font-semibold text-white transition disabled:opacity-40"
                    style={{ backgroundColor: accent }}
                  >
                    Start conversation
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <>
              <div className="min-h-0 flex-1 overflow-hidden">
                {screen === "home" ? (
                  <div className="flex h-full flex-col">
                    <div className="px-4 pb-4 pt-6">
                      <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-[14px] font-bold" style={{ backgroundColor: accent }}>
                        {aiAvatarUrl.trim() ? <img src={aiAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
                      </span>
                      <h3 className="mt-3 text-[16px] font-semibold leading-6">{lines[0]}</h3>
                      {lines.length > 1 && (
                        <p className="mt-1 text-[12px] leading-5" style={{ color: PREVIEW_MUTED }}>{lines.slice(1).join(" ")}</p>
                      )}
                    </div>
                    <div className="flex-1 space-y-2 overflow-y-auto p-3.5 pt-0">
                      <button
                        type="button"
                        onClick={beginConversation}
                        className="flex w-full items-center gap-2.5 rounded-xl border p-3 text-left transition hover:border-white/20"
                        style={{ backgroundColor: PREVIEW_BUBBLE, borderColor: PREVIEW_BORDER }}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white" style={{ backgroundColor: accent }}><MessageSquarePlus size={14} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[12px] font-semibold text-white">Start a new conversation</span>
                          <span className="block text-[10.5px]" style={{ color: PREVIEW_MUTED }}>We typically reply in a few minutes</span>
                        </span>
                      </button>
                      <button type="button" onClick={() => setScreen("list")} className="w-full py-1 text-center text-[11px] font-semibold" style={{ color: accent }}>
                        View past conversations
                      </button>
                    </div>
                  </div>
                ) : screen === "list" ? (
                  <div className="flex h-full flex-col">
                    <div className="relative flex items-center justify-center border-b px-4 py-3" style={{ borderColor: PREVIEW_BORDER }}>
                      <p className="text-[13px] font-semibold">Messages</p>
                      <button type="button" aria-label="Close" onClick={closeWidget} className="absolute right-3 flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10">
                        <X size={14} />
                      </button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto">
                      <p className="px-4 py-5 text-[11px]" style={{ color: PREVIEW_MUTED }}>No past conversations yet.</p>
                    </div>
                    <div className="flex shrink-0 justify-center px-4 pb-4 pt-2">
                      <button type="button" onClick={beginConversation} className="flex items-center gap-2 rounded-full bg-white px-3.5 py-2 text-[11.5px] font-semibold text-[#18181b] shadow-lg transition hover:bg-white/90">
                        Ask a question
                        <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#18181b] text-white"><CircleHelp size={9} /></span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col">
                    <div className="flex items-center gap-2 border-b px-3 py-2.5" style={{ borderColor: PREVIEW_BORDER }}>
                      <button type="button" aria-label="Back to chats" onClick={() => setScreen("home")} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-white/10"><ChevronLeft size={15} /></button>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full text-[11px] font-bold" style={{ backgroundColor: accent }}>
                        {aiAvatarUrl.trim() ? <img src={aiAvatarUrl} alt="" className="h-full w-full object-cover" /> : initial}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[12px] font-semibold">{displayName}</p>
                        <p className="truncate text-[9.5px]" style={{ color: PREVIEW_MUTED }}>The team can also help</p>
                      </div>
                      <button type="button" aria-label="Close" onClick={closeWidget} className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full hover:bg-white/10"><X size={14} /></button>
                    </div>
                    <div className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3.5">
                      {lines.map((line, index) => (
                        <div key={index} className="w-fit max-w-[85%] rounded-md border border-black/40 bg-white px-3 py-2 text-[11.5px] leading-5 text-[#18181b]">
                          {line}
                        </div>
                      ))}
                      {messages.map((message) => (
                        <div key={message.id} className={message.fromVisitor ? "flex justify-end" : ""}>
                          <div className="w-fit max-w-[85%] rounded-2xl px-3 py-2 text-[11.5px] leading-5" style={{ backgroundColor: message.fromVisitor ? accent : PREVIEW_BUBBLE, color: "#fff" }}>
                            {message.body}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="relative p-2.5">
                      {emojiOpen && (
                        <div className="absolute bottom-full left-2.5 right-2.5 mb-2 rounded-2xl border p-2 shadow-2xl" style={{ borderColor: PREVIEW_BORDER, backgroundColor: "#1f1f22" }}>
                          <div className="grid grid-cols-6 gap-0.5">
                            {PREVIEW_EMOJI.map((emoji) => (
                              <button key={emoji} type="button" onClick={() => { setDraft((current) => current + emoji); setEmojiOpen(false); }} className="rounded-lg p-1 text-[15px] leading-none hover:bg-white/10">
                                {emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="rounded-xl border" style={{ borderColor: PREVIEW_BORDER, backgroundColor: "#1f1f22" }}>
                        <textarea
                          value={draft}
                          onChange={(event) => setDraft(event.target.value)}
                          onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); sendPreviewMessage(); } }}
                          placeholder="Write a message…"
                          rows={1}
                          className="h-9 w-full resize-none bg-transparent px-3 pb-0.5 pt-2 text-[12px] text-white outline-none placeholder:text-white/60"
                        />
                        <div className="flex h-9 items-center gap-0.5 px-1.5 pb-1">
                          <button type="button" aria-label="Attach file" className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10" style={{ color: PREVIEW_ICON_MUTED }}>
                            <Paperclip size={13} />
                          </button>
                          <button type="button" aria-label="Send a GIF" className="flex h-6 w-8 items-center justify-center rounded-full text-[8.5px] font-bold hover:bg-white/10" style={{ color: PREVIEW_ICON_MUTED }}>
                            GIF
                          </button>
                          <button type="button" aria-label="Emoji" onClick={() => setEmojiOpen((current) => !current)} className="flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10" style={{ color: emojiOpen ? accent : PREVIEW_ICON_MUTED }}>
                            <Smile size={13} />
                          </button>
                          <button type="button" aria-label="Voice input" className="ml-auto flex h-6 w-6 items-center justify-center rounded-full hover:bg-white/10" style={{ color: PREVIEW_ICON_MUTED }}>
                            <Mic size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={sendPreviewMessage}
                            disabled={!draft.trim()}
                            aria-label="Send"
                            className="ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-white transition disabled:opacity-40"
                            style={{ backgroundColor: draft.trim() ? accent : "rgba(255,255,255,.12)" }}
                          >
                            <Send size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {showTabBar && (
                <div className="flex shrink-0 items-center border-t" style={{ borderColor: PREVIEW_BORDER }}>
                  <button type="button" onClick={() => setScreen("home")} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-medium" style={{ color: screen === "home" ? "#fff" : PREVIEW_MUTED }}>
                    <Home size={15} strokeWidth={screen === "home" ? 2.4 : 2} /> Home
                  </button>
                  <button type="button" onClick={() => setScreen("list")} className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-medium" style={{ color: screen === "list" ? "#fff" : PREVIEW_MUTED }}>
                    <MessageCircle size={15} strokeWidth={screen === "list" ? 2.4 : 2} /> Messages
                  </button>
                  <button type="button" disabled className="flex flex-1 flex-col items-center gap-0.5 py-2 text-[9px] font-medium opacity-50" style={{ color: PREVIEW_MUTED }}>
                    <CircleHelp size={15} /> Help
                  </button>
                </div>
              )}
              <p className="shrink-0 border-t py-1 text-center text-[8.5px] font-medium" style={{ borderColor: PREVIEW_BORDER, color: PREVIEW_MUTED }}>
                Powered by Elpino
              </p>
            </>
          )}
          </div>
        )}

        <button
          type="button"
          aria-label={open ? "Close chat" : "Open chat"}
          onClick={() => (open ? closeWidget() : openWidget())}
          className="absolute bottom-4 right-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-full text-white shadow-lg transition hover:scale-105"
          style={{ backgroundColor: accent }}
        >
          {open ? (
            <X size={20} />
          ) : aiAvatarUrl.trim() ? (
            <img src={aiAvatarUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <MessageCircle size={20} />
          )}
        </button>
      </div>
    </>
  );
}

function PreviewPreChatField({
  field,
  value,
  onChange,
  formCountry,
  setFormCountry,
  accent,
}: {
  field: PreChatField;
  value: string;
  onChange: (value: string) => void;
  formCountry: number;
  setFormCountry: (index: number) => void;
  accent: string;
}) {
  if (field.type === "phone") {
    return (
      <label className="block">
        <span className="mb-1 block px-1 text-[10.5px] font-semibold text-[#4a4f57]">{field.label}</span>
        <div className="flex items-stretch overflow-hidden rounded-full border border-[#e1e3e6] focus-within:border-[#18181b]">
          <div className="relative shrink-0 border-r border-[#e1e3e6]">
            <select value={formCountry} onChange={(event) => setFormCountry(Number(event.target.value))} className="h-full appearance-none bg-transparent py-2.5 pl-3 pr-6 text-[12px] text-[#1c1c1e] outline-none">
              {PREVIEW_COUNTRIES.map((country, index) => (
                <option key={country.name} value={index}>{country.flag} {country.code}</option>
              ))}
            </select>
            <ChevronDown size={11} className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
          </div>
          <input
            type="tel"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={field.placeholder || "555 000 0000"}
            required={field.required}
            className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-[12px] text-[#1c1c1e] outline-none placeholder:text-[#9aa0a6]"
          />
        </div>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <label className="block">
        <span className="mb-1 block px-1 text-[10.5px] font-semibold text-[#4a4f57]">{field.label}</span>
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
          required={field.required}
          rows={2}
          className="w-full resize-none rounded-2xl border border-[#e1e3e6] px-3.5 py-2.5 text-[12px] text-[#1c1c1e] outline-none placeholder:text-[#9aa0a6] focus:border-[#18181b]"
        />
      </label>
    );
  }

  if (field.type === "select") {
    const options = field.options ?? [];
    return (
      <label className="block">
        <span className="mb-1 block px-1 text-[10.5px] font-semibold text-[#4a4f57]">{field.label}</span>
        <div className="relative">
          <select
            value={value}
            onChange={(event) => onChange(event.target.value)}
            required={field.required}
            className="w-full appearance-none rounded-full border border-[#e1e3e6] bg-transparent px-3.5 py-2.5 pr-8 text-[12px] text-[#1c1c1e] outline-none focus:border-[#18181b]"
          >
            <option value="" disabled>{field.placeholder || "Choose an option"}</option>
            {options.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
        </div>
      </label>
    );
  }

  if (field.type === "radio") {
    const options = field.options ?? [];
    return (
      <div>
        <p className="mb-1.5 text-[12px] font-bold">{field.label}</p>
        <div className="space-y-0.5">
          {options.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 hover:bg-[#f7f8f9]">
              <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border-2" style={{ borderColor: value === option ? accent : "#c7cbd1" }}>
                {value === option && <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} />}
              </span>
              <input type="radio" name={field.id} value={option} checked={value === option} onChange={() => onChange(option)} className="sr-only" />
              <span className="text-[12px]">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox" && field.multiple) {
    const options = field.options ?? [];
    const selected = value ? value.split(",") : [];
    const toggleOption = (option: string) => {
      const next = selected.includes(option) ? selected.filter((item) => item !== option) : [...selected, option];
      onChange(next.join(","));
    };
    return (
      <div>
        <p className="mb-1.5 text-[12px] font-bold">{field.label}</p>
        <div className="space-y-0.5">
          {options.map((option) => (
            <label key={option} className="flex cursor-pointer items-center gap-2 rounded-lg px-1 py-1.5 hover:bg-[#f7f8f9]">
              <input type="checkbox" checked={selected.includes(option)} onChange={() => toggleOption(option)} className="h-3.5 w-3.5 shrink-0 rounded border-[#c7cbd1]" />
              <span className="text-[12px]">{option}</span>
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (field.type === "checkbox") {
    return (
      <label className="flex cursor-pointer items-start gap-2 rounded-lg px-1 py-1">
        <input
          type="checkbox"
          checked={value === "true"}
          onChange={(event) => onChange(event.target.checked ? "true" : "")}
          required={field.required}
          className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-[#c7cbd1]"
        />
        <span className="text-[12px] text-[#1c1c1e]">{field.label}</span>
      </label>
    );
  }

  return (
    <label className="block">
      <span className="mb-1 block px-1 text-[10.5px] font-semibold text-[#4a4f57]">{field.label}</span>
      <input
        type={field.type === "email" ? "email" : "text"}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={field.placeholder}
        required={field.required}
        className="w-full rounded-full border border-[#e1e3e6] px-3.5 py-2.5 text-[12px] text-[#1c1c1e] outline-none placeholder:text-[#9aa0a6] focus:border-[#18181b]"
      />
    </label>
  );
}

type PendingInvitation = { id: string; email: string; invitedByEmail: string | null; createdAt: string; expiresAt: string; expired: boolean };

const INVITES_PER_PAGE = 8;

function PeopleSettingsPage() {
  const myRole = useMyRole();
  const canInvite = myRole === "owner";
  const [dialogOpen, setDialogOpen] = useState(false);

  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [loadingInvitations, setLoadingInvitations] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [invitePage, setInvitePage] = useState(1);

  function loadInvitations() {
    setLoadingInvitations(true);
    fetch("/api/invitations")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { invitations?: PendingInvitation[] } | null) => setInvitations(data?.invitations ?? []))
      .catch(() => undefined)
      .finally(() => setLoadingInvitations(false));
  }

  useEffect(() => { loadInvitations(); }, []);

  async function revoke(id: string) {
    setRevoking(id);
    try {
      const response = await fetch("/api/invitations/revoke", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (response.ok) setInvitations((current) => current.filter((item) => item.id !== id));
    } finally {
      setRevoking(null);
    }
  }

  return (
    <div className="dashboard-people-page mx-auto w-full max-w-[1120px] px-7 pb-14 pt-8 text-white sm:px-9 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-7">
        <div>
          <p className="text-xs font-normal uppercase tracking-[0.16em] text-white/80">Workspace access</p>
          <h2 className="mt-2 text-3xl font-normal tracking-[-0.03em] text-white">People</h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-white/80">Invite teammates by email. They&apos;ll get a link to accept and join this workspace.</p>
        </div>
        {canInvite && (
          <button type="button" onClick={() => setDialogOpen(true)} className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#428ce5] px-4 text-[12px] font-semibold text-white transition hover:bg-[#347dce]">
            <Plus size={14} /> Invite people
          </button>
        )}
      </div>

      {myRole !== null && !canInvite && (
        <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[11.5px] font-medium text-amber-200">Only the workspace owner can invite people or manage pending invitations.</p>
      )}

      <div className="dashboard-people-table-surface mt-5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
        {loadingInvitations ? (
          <div className="flex items-center justify-center py-16 text-[12px] text-white/80"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading people</div>
        ) : invitations.length === 0 ? (
          <div className="dashboard-people-empty flex flex-col items-center px-6 py-16 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#428ce5]/10 text-[#5ca5fa]"><Mail size={19} /></span>
            <h4 className="mt-3 text-[14px] font-semibold text-white">No pending invitations</h4>
            <p className="mt-1 max-w-sm text-[11px] leading-5 text-[#687178]">Invite teammates to this workspace — they'll show up here until they accept.</p>
            {canInvite && <button type="button" onClick={() => setDialogOpen(true)} className="mt-4 h-9 rounded-lg border border-white/10 bg-white/[0.04] px-4 text-[12px] font-semibold text-white transition hover:bg-white/[0.08]">Invite your first person</button>}
          </div>
        ) : (
          (() => {
            const totalPages = Math.max(1, Math.ceil(invitations.length / INVITES_PER_PAGE));
            const page = Math.min(invitePage, totalPages);
            const pageInvites = invitations.slice((page - 1) * INVITES_PER_PAGE, page * INVITES_PER_PAGE);
            const pager = (
              <div className="flex items-center justify-between border-t border-white/10 px-4 py-3 text-[10px] text-white/80">
                <span>{invitations.length} {invitations.length === 1 ? "invitation" : "invitations"}</span>
                {totalPages > 1 ? (
                  <div className="flex items-center gap-3">
                    <button type="button" disabled={page <= 1} onClick={() => setInvitePage(page - 1)} className="rounded-md border border-white/10 px-2.5 py-1 font-medium text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                    <span>Page {page} of {totalPages}</span>
                    <button type="button" disabled={page >= totalPages} onClick={() => setInvitePage(page + 1)} className="rounded-md border border-white/10 px-2.5 py-1 font-medium text-white transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                  </div>
                ) : (
                  <span>Page 1 of 1</span>
                )}
              </div>
            );
            return (
              <>
                {/* A 5-column grid has no honest way to fit a phone screen —
                    below md this becomes a stacked card list instead. */}
                <div className="md:hidden">
                  {pageInvites.map((invite) => (
                    <div key={invite.id} className="dashboard-person-row flex items-center gap-3 border-b border-white/10 px-4 py-3 transition last:border-b-0 hover:bg-white/[0.04]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#428ce5]/15 text-[12px] font-bold text-[#b8d9ff]">{invite.email.charAt(0).toUpperCase()}</span>
                      <div className="min-w-0 flex-1">
                        <span className="dashboard-person-email block truncate text-[13px] font-semibold text-white">{invite.email}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-white/50">
                          <span className={`inline-flex w-fit items-center gap-1 rounded-full px-1.5 py-0.5 font-semibold ${invite.expired ? "bg-[#FFF1F1] text-[#A64A53]" : "bg-[#FFF4E5] text-[#93651D]"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${invite.expired ? "bg-[#C6555F]" : "bg-[#D89831]"}`} />
                            {invite.expired ? "Expired" : "Pending"}
                          </span>
                          {new Date(invite.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {canInvite && (
                        <button
                          type="button"
                          disabled={revoking === invite.id}
                          onClick={() => void revoke(invite.id)}
                          className="shrink-0 rounded-md px-2.5 py-1.5 text-[12px] font-medium text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                        >
                          {revoking === invite.id ? "…" : "Revoke"}
                        </button>
                      )}
                    </div>
                  ))}
                  {pager}
                </div>
                <div className="hidden md:block">
                  <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    <div className="min-w-[720px]">
                      <div className="dashboard-people-table-header grid grid-cols-[1.6fr_0.8fr_1.1fr_1fr_90px] gap-3 border-b border-white/10 bg-white/[0.035] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/80"><span>Person</span><span>Status</span><span>Invited by</span><span>Created</span><span /></div>
                      {pageInvites.map((invite) => (
                        <div key={invite.id} className="dashboard-person-row grid grid-cols-[1.6fr_0.8fr_1.1fr_1fr_90px] items-center gap-3 border-b border-white/10 px-4 py-3 transition last:border-b-0 hover:bg-white/[0.04]">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#428ce5]/15 text-[12px] font-bold text-[#b8d9ff]">{invite.email.charAt(0).toUpperCase()}</span>
                            <span className="dashboard-person-email min-w-0 truncate text-[13px] font-semibold text-white">{invite.email}</span>
                          </div>
                          <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold ${invite.expired ? "bg-[#FFF1F1] text-[#A64A53]" : "bg-[#FFF4E5] text-[#93651D]"}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${invite.expired ? "bg-[#C6555F]" : "bg-[#D89831]"}`} />
                            {invite.expired ? "Expired" : "Pending"}
                          </span>
                          <span className="truncate text-[12px] text-[#5F686D]">{invite.invitedByEmail ?? "—"}</span>
                          <span className="text-[12px] text-white/80">{new Date(invite.createdAt).toLocaleDateString()}</span>
                          {canInvite && (
                            <button
                              type="button"
                              disabled={revoking === invite.id}
                              onClick={() => void revoke(invite.id)}
                              className="rounded-md px-2.5 py-1.5 text-[12px] font-medium text-red-300 transition hover:bg-red-400/10 disabled:opacity-50"
                            >
                              {revoking === invite.id ? "…" : "Revoke"}
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  {pager}
                </div>
              </>
            );
          })()
        )}
      </div>

      <InvitePeopleDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onInvited={loadInvitations} />
    </div>
  );
}

/**
 * The dashboard language: what agents read customer messages in. Customer
 * messages written in another language get an on-demand "See translation"
 * button in the inbox that translates into whatever is picked here.
 *
 * Separate from the AI's own reply language, which it infers per-conversation
 * from the customer rather than following a workspace-wide setting — this
 * page is purely about what a human teammate sees.
 */
function TranslationSettingsPage() {
  const { workspace } = useCurrentWorkspace();
  const isOwner = workspace?.role === "owner";

  const [language, setLanguage] = useState("en");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workspace/dashboard-language")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { dashboardLanguage?: string } | null) => setLanguage(data?.dashboardLanguage ?? "en"))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function changeLanguage(code: string) {
    const previous = language;
    setLanguage(code);
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const response = await fetch("/api/workspace/dashboard-language", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = (await response.json().catch(() => ({}))) as { dashboardLanguage?: string; message?: string };
      if (!response.ok) {
        setLanguage(previous);
        setError(data.message ?? "Could not update the workspace language");
        return;
      }
      setSaved(true);
    } catch {
      setLanguage(previous);
      setError("Could not update the workspace language");
    } finally {
      setSaving(false);
    }
  }

  const currentName = SUPPORTED_LANGUAGES.find((item) => item.code === language)?.name ?? "English";

  return (
    <div className="mx-auto w-full max-w-[980px] px-7 pb-16 pt-9 text-[#11120f] sm:px-9 lg:px-10">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Workspace</p>
        <h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-white/90">Translations</h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#667069]">
          Pick the language your team reads the dashboard in. When a customer writes in a different language, their message gets a &quot;See translation&quot; button in the inbox — nothing is translated automatically or shown to the customer.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-[24px] border border-[#DDE4E8] bg-white">
        <div className="border-b border-[#E5E9EB] px-6 py-5">
          <h3 className="text-[18px] font-medium">Workspace language</h3>
          <p className="mt-1 text-[12px] text-[#667069]">The default language used across this workspace.</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="min-w-0">
            <p className="text-[14px] font-semibold">{loading ? "Loading…" : currentName}</p>
            {!isOwner && <p className="mt-1 text-[12px] text-[#8a7373]">Only the workspace owner can change this.</p>}
          </div>
          <select
            value={language}
            disabled={loading || saving || !isOwner}
            onChange={(event) => void changeLanguage(event.target.value)}
            className="h-11 min-w-[220px] rounded-xl border border-[#DDE4E8] bg-white px-3 text-[13px] outline-none focus:border-[#11120f] focus:ring-2 focus:ring-[#11120f]/8 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {SUPPORTED_LANGUAGES.map((item) => (
              <option key={item.code} value={item.code}>{item.name}</option>
            ))}
          </select>
        </div>
        {(saving || saved || error) && (
          <div className="border-t border-[#E9ECEE] px-6 py-3 text-[12px]">
            {saving && <span className="flex items-center gap-1.5 text-[#667069]"><LoaderCircle size={13} className="animate-spin" /> Saving…</span>}
            {!saving && saved && <span className="flex items-center gap-1.5 text-[#2e8a5c]"><Check size={13} /> Saved</span>}
            {!saving && error && <span className="text-[#c63f4d]">{error}</span>}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-[24px] border border-[#DDE4E8] bg-[#FAF9F6] p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white"><Languages size={18} /></span>
          <div>
            <p className="text-[14px] font-semibold">How translation works in the inbox</p>
            <p className="mt-1.5 max-w-xl text-[12.5px] leading-5 text-[#667069]">
              Customer messages always show in the language they were written in. If a message isn&apos;t in {currentName}, a small &quot;See translation&quot; link appears under it — click it to translate that one message into {currentName}, or click again to switch back to the original. Translating is on demand and per message, so it only runs for messages someone actually asks about.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type OrgSecuritySettings = { requireTwoFactor: boolean; signInAlerts: boolean; membersCanInvite: boolean };

function SecuritySettingsPage() {
  const [settings, setSettings] = useState<OrgSecuritySettings | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isOwner = role === "owner";

  useEffect(() => {
    fetch("/api/organizations/security", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { settings?: OrgSecuritySettings | null; role?: string } | null) => {
        setSettings(data?.settings ?? null);
        setRole(data?.role ?? null);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  async function update(patch: Partial<OrgSecuritySettings>) {
    if (!settings || saving) return;
    const previous = settings;
    setSettings({ ...settings, ...patch });
    setSaving(true);
    setError(null);
    const response = await fetch("/api/organizations/security", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    }).catch(() => null);
    const data = response ? ((await response.json().catch(() => ({}))) as { settings?: OrgSecuritySettings; message?: string }) : {};
    if (!response?.ok || !data.settings) {
      setSettings(previous);
      setError(data.message ?? "Could not save. Try again.");
    } else {
      setSettings(data.settings);
    }
    setSaving(false);
  }

  const toggleDisabled = loading || saving || !isOwner || !settings;

  return (
    <div className="dashboard-security-page mx-auto w-full max-w-[980px] px-7 pb-16 pt-8 text-white sm:px-9 lg:px-10">
      <header className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="text-xs font-normal uppercase tracking-[0.16em] text-white/80">Workspace security</p>
          <h2 className="mt-2 text-3xl font-normal tracking-[-0.03em] text-white">Security & permissions</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">Control how people sign in, what members can access, and how your workspace responds to security events.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#428ce5]/25 bg-[#428ce5]/10 px-3 py-2 text-xs font-medium text-[#b8d9ff]"><ShieldCheck size={15} /> Protected</div>
      </header>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        {[{ icon: ShieldCheck, label: "Security status", value: "Good" }, { icon: UserCog, label: "Default role", value: "Member" }, { icon: Monitor, label: "Active sessions", value: "1 device" }].map(({ icon: Icon, label, value }) => (
          <article key={label} className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-[#428ce5]/10 text-[#5ca5fa]"><Icon size={17} /></span>
            <p className="mt-4 text-[11px] font-medium text-white/80">{label}</p>
            <p className="mt-1 text-lg font-semibold tracking-[-0.02em] text-white">{value}</p>
          </article>
        ))}
      </div>

      <SecuritySection title="Authentication policies" description="Set the minimum sign-in requirements for everyone in this workspace.">
        <SecurityRow icon={KeyRound} title="Require two-factor authentication" description="Members must configure an authenticator or SMS code before accessing workspace data." badge="Business">
          <Toggle checked={settings?.requireTwoFactor ?? false} onChange={() => void update({ requireTwoFactor: !settings?.requireTwoFactor })} label="Require two-factor authentication" disabled={toggleDisabled} />
        </SecurityRow>
        <SecurityRow icon={Eye} title="New sign-in alerts" description="Notify workspace admins when an account signs in from a new browser or location.">
          <Toggle checked={settings?.signInAlerts ?? false} onChange={() => void update({ signInAlerts: !settings?.signInAlerts })} label="New sign-in alerts" disabled={toggleDisabled} />
        </SecurityRow>
      </SecuritySection>

      <SecuritySection title="Member permissions" description="Define safe defaults for members joining your workspace.">
        <SecurityRow title="Default member role" description="Applied automatically to newly invited teammates.">
          <button type="button" className="flex h-9 items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-xs font-medium text-white transition hover:bg-white/[0.08]">Member <ChevronRight size={13} className="text-white/60" /></button>
        </SecurityRow>
        <SecurityRow title="Only admins can invite members" description="Prevent members from inviting additional people without administrator approval.">
          <Toggle checked={settings ? !settings.membersCanInvite : true} onChange={() => void update({ membersCanInvite: !settings?.membersCanInvite })} label="Only admins can invite members" disabled={toggleDisabled} />
        </SecurityRow>
      </SecuritySection>

      {!loading && !isOwner && (
        <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[11.5px] font-medium text-amber-200">Only the workspace owner can change these settings.</p>
      )}
      {error && <p role="alert" className="mt-4 text-[12px] font-medium text-[#e0707c]">{error}</p>}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.025] px-5 py-4">
        <div><p className="text-sm font-semibold text-white">Review account-level security</p><p className="mt-1 text-xs text-white/80">Manage your personal password and two-factor authentication in General settings.</p></div>
        <Link href="/dashboard/settings" className="flex h-9 items-center gap-2 rounded-lg bg-[#428ce5] px-4 text-xs font-medium text-white transition hover:bg-[#347dce]">Open personal settings <ArrowRight size={13} /></Link>
      </div>
    </div>
  );
}

function SecuritySection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="mt-5 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
    <div className="border-b border-white/10 px-5 py-4"><h3 className="text-base font-medium text-white">{title}</h3><p className="mt-1 text-xs text-white/80">{description}</p></div>
    <div className="divide-y divide-white/10">{children}</div>
  </section>;
}

function SecurityRow({ icon: Icon, title, description, badge, children }: { icon?: typeof ShieldCheck; title: string; description: string; badge?: string; children: React.ReactNode }) {
  return <div className="flex items-start gap-4 px-5 py-4">
    {Icon && <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-[#5ca5fa]"><Icon size={17} /></span>}
    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-white">{title}</p>{badge && <span className="rounded-md bg-[#428ce5]/15 px-2 py-0.5 text-[10px] font-medium text-[#b8d9ff]">{badge}</span>}</div><p className="mt-1 text-xs leading-5 text-white/80">{description}</p></div>
    <div className="shrink-0 pt-0.5">{children}</div>
  </div>;
}

type AuditStatus = "assigned" | "solved" | "unresolved";
type AuditItem = { id: string; conversationId: string; customer: string; email: string; problem: string; status: AuditStatus; assignee: string; updatedAt: string };
type AuditConversation = { id: string; name: string; email?: string | null; topic?: string | null; preview: string; time: string; status: string; assignedUserId?: string | null; handledBy?: string; escalationReason?: string | null; aiName?: string };

function auditRelativeTime(iso: string) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  return days === 1 ? "Yesterday" : `${days} days ago`;
}

// Real records: every conversation handed to the team or resolved. Threads the
// AI is still handling are not audit entries yet.
function toAuditItems(conversations: AuditConversation[], names: Map<string, string>): AuditItem[] {
  return conversations
    .filter((conversation) => conversation.status === "resolved" || conversation.handledBy === "human")
    .map((conversation) => ({
      id: `#${conversation.id.slice(0, 8)}`,
      conversationId: conversation.id,
      customer: conversation.name,
      email: conversation.email ?? "",
      problem: conversation.escalationReason || conversation.topic || conversation.preview || "No details recorded",
      status: conversation.status === "resolved" ? "solved" : conversation.assignedUserId ? "assigned" : "unresolved",
      assignee: conversation.assignedUserId
        ? names.get(conversation.assignedUserId) ?? "Teammate"
        : conversation.handledBy === "human" ? "Unassigned" : conversation.aiName || "AI agent",
      updatedAt: conversation.time,
    }));
}

function auditCsvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function AuditLogsSettingsPage({ view = "all" }: { view?: "all" | AuditStatus }) {
  const filter = view;
  const [query, setQuery] = useState("");
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const conversationsResponse = await fetch("/api/workspace/conversations");
        if (!conversationsResponse.ok) throw new Error("Could not load conversations");
        const conversationData = (await conversationsResponse.json()) as { conversations?: AuditConversation[] };
        // Names are a nicety: a failed team lookup still shows every record.
        const teamData = (await fetch("/api/account/availability/team").then((response) => (response.ok ? response.json() : {})).catch(() => ({}))) as { members?: { id: string; name: string | null; email: string }[] };
        if (cancelled) return;
        const names = new Map((teamData.members ?? []).map((member) => [member.id, member.name || member.email]));
        setAuditItems(toAuditItems(conversationData.conversations ?? [], names));
        setLoadedAt(new Date());
        setLoadState("ready");
      } catch {
        if (!cancelled) setLoadState("error");
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleItems = auditItems.filter((item) => (filter === "all" || item.status === filter) && (!normalizedQuery || `${item.id} ${item.customer} ${item.email} ${item.problem} ${item.assignee}`.toLowerCase().includes(normalizedQuery)));
  const counts = { assigned: auditItems.filter((item) => item.status === "assigned").length, solved: auditItems.filter((item) => item.status === "solved").length, unresolved: auditItems.filter((item) => item.status === "unresolved").length };

  const statusStyle: Record<AuditStatus, string> = { assigned: "bg-[#EEF3FF] text-[#4268A8]", solved: "bg-[#EEF8F2] text-[#34845C]", unresolved: "bg-[#FFF1F1] text-[#B24752]" };

  const exportCsv = () => {
    const rows = [["Conversation", "Customer", "Email", "Problem", "Status", "Assigned to", "Updated"], ...visibleItems.map((item) => [item.conversationId, item.customer, item.email, item.problem, item.status, item.assignee, item.updatedAt])];
    const url = URL.createObjectURL(new Blob([rows.map((row) => row.map(auditCsvCell).join(",")).join("\n")], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const emptyState = loadState === "loading"
    ? { title: "Loading records…", detail: "Fetching conversations handed to the team or resolved." }
    : loadState === "error"
      ? { title: "Could not load audit records", detail: "Refresh the page to try again." }
      : auditItems.length === 0
        ? { title: "No records yet", detail: "Conversations appear here once they are handed to the team or resolved." }
        : { title: "No matching activity", detail: "Try a different search or status filter." };

  return (
    <div className="mx-auto w-full max-w-[1120px] px-7 pb-16 pt-9 text-[#11120f] sm:px-9 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Support operations</p><h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-white/90">Audit logs</h2><p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#667069]">Every conversation handed to your team or resolved, from first report to assignment and resolution.</p></div><button type="button" onClick={exportCsv} disabled={visibleItems.length === 0} className="flex h-11 items-center gap-2 rounded-full border border-[#CBD7DC] bg-white px-5 text-[12px] font-semibold hover:border-[#11120f] disabled:cursor-not-allowed disabled:opacity-50"><Download size={15} /> Export logs</button></div>

      <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link href="/dashboard/settings/audit-logs/assigned" className="flex items-center gap-3 rounded-2xl border border-[#DDE4E8] bg-white p-4 text-left hover:bg-[#FAFBFB]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#4268A8]"><UserCheck size={18} /></span><span><span className="block text-[20px] font-semibold">{counts.assigned}</span><span className="text-[11px] text-[#667069]">Assigned</span></span></Link>
        <Link href="/dashboard/settings/audit-logs/solved" className="flex items-center gap-3 rounded-2xl border border-[#DDE4E8] bg-white p-4 text-left hover:bg-[#FAFBFB]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF8F2] text-[#34845C]"><CheckCircle2 size={18} /></span><span><span className="block text-[20px] font-semibold">{counts.solved}</span><span className="text-[11px] text-[#667069]">Solved</span></span></Link>
        <Link href="/dashboard/settings/audit-logs/unresolved" className="flex items-center gap-3 rounded-2xl border border-[#DDE4E8] bg-white p-4 text-left hover:bg-[#FAFBFB]"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF1F1] text-[#B24752]"><CircleAlert size={18} /></span><span><span className="block text-[20px] font-semibold">{counts.unresolved}</span><span className="text-[11px] text-[#667069]">Unresolved</span></span></Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-[24px] border border-[#DDE4E8] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#E5E9EB] px-5 py-4 sm:flex-row sm:items-center sm:flex-wrap">
          <div className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="navigation" aria-label="Audit log views">{([['all', 'All activity'], ['assigned', 'Assigned'], ['solved', 'Solved'], ['unresolved', 'Unresolved']] as const).map(([id, label]) => <Link key={id} href={id === "all" ? "/dashboard/settings/audit-logs" : `/dashboard/settings/audit-logs/${id}`} aria-current={filter === id ? "page" : undefined} className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-[11px] font-semibold transition ${filter === id ? "bg-[#11120f] text-white" : "text-[#667069] hover:bg-[#F0F2F3] hover:text-black"}`}>{label}</Link>)}</div>
          <label className="flex h-9 w-full items-center gap-2 rounded-xl border border-[#D9DEE1] bg-[#FAFBFB] px-3 focus-within:border-[#9AA5AB] sm:ml-auto sm:w-auto sm:min-w-[230px]"><Search size={15} className="text-[#7B858A]" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search user or problem" className="min-w-0 flex-1 bg-transparent text-[12px] outline-none placeholder:text-[#92999D]" /></label>
        </div>

        {/* A 7-column grid has no honest way to fit a phone screen — below md
            this becomes a stacked card list instead. */}
        <div className="md:hidden">
          {visibleItems.map((item) => (
            <div key={item.id} className="flex flex-col gap-2 border-t border-[#EDF0F1] px-4 py-3.5 transition first:border-t-0 hover:bg-[#FCFCFB]">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-[12px] font-semibold">{item.customer}</p>
                  <p className="mt-0.5 truncate text-[10.5px] text-[#7A858B]">{item.email}</p>
                </div>
              </div>
              <p className="text-[12px] text-[#3E484D]">{item.problem}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px]">
                <span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusStyle[item.status]}`}>{item.status}</span>
                <span className="text-[#4F5A60]">{item.assignee}</span>
                <span className="ml-auto text-[10px] text-[#8A9397]">{item.id} · {auditRelativeTime(item.updatedAt)}</span>
              </div>
            </div>
          ))}
          {visibleItems.length === 0 && <div className="flex flex-col items-center px-6 py-14 text-center"><Search size={22} className="text-[#9AA3A7]" /><p className="mt-3 text-[13px] font-semibold">{emptyState.title}</p><p className="mt-1 text-[11px] text-[#7A858B]">{emptyState.detail}</p></div>}
        </div>
        <div className="hidden md:block">
          <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-[110px_minmax(170px,0.8fr)_minmax(270px,1.5fr)_110px_150px] gap-3 bg-[#FAFBFB] px-5 py-3 text-[9px] font-bold uppercase tracking-[0.1em] text-[#818B90]"><span>Ticket</span><span>Customer</span><span>Problem</span><span>Status</span><span>Assigned to</span></div>
              {visibleItems.map((item) => <div key={item.id} className="grid grid-cols-[110px_minmax(170px,0.8fr)_minmax(270px,1.5fr)_110px_150px] items-center gap-3 border-t border-[#EDF0F1] px-5 py-4 transition hover:bg-[#FCFCFB]"><div><p className="text-[11px] font-semibold">{item.id}</p><p className="mt-1 text-[10px] text-[#8A9397]">{auditRelativeTime(item.updatedAt)}</p></div><div className="min-w-0"><p className="truncate text-[12px] font-semibold">{item.customer}</p><p className="mt-1 truncate text-[10px] text-[#7A858B]">{item.email}</p></div><p className="truncate text-[12px] text-[#3E484D]">{item.problem}</p><span className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${statusStyle[item.status]}`}>{item.status}</span><span className="truncate text-[11px] font-medium text-[#4F5A60]">{item.assignee}</span></div>)}
              {visibleItems.length === 0 && <div className="flex flex-col items-center px-6 py-14 text-center"><Search size={22} className="text-[#9AA3A7]" /><p className="mt-3 text-[13px] font-semibold">{emptyState.title}</p><p className="mt-1 text-[11px] text-[#7A858B]">{emptyState.detail}</p></div>}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-[#E5E9EB] px-5 py-3 text-[11px] text-[#7A858B]"><span>Showing {visibleItems.length} of {auditItems.length} records</span><span>{loadedAt ? `Updated ${loadedAt.toLocaleTimeString()}` : ""}</span></div>
      </div>
    </div>
  );
}

// The full IANA list where the browser exposes it; a short practical set
// otherwise, so the picker is never empty on an older engine.
function timezoneOptions(): string[] {
  try {
    const supported = (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf;
    const zones = supported?.("timeZone");
    if (zones?.length) return zones;
  } catch {
    /* fall through to the short list */
  }
  return ["UTC", "Asia/Kolkata", "Asia/Singapore", "Asia/Dubai", "Europe/London", "Europe/Berlin", "America/New_York", "America/Chicago", "America/Los_Angeles", "Australia/Sydney"];
}

function AvailabilitySettingsPage() {
  const [schedule, setSchedule] = useState<Availability | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [now] = useState(() => new Date());

  const viewerTimezone = useMemo(() => guessTimezone(), []);
  const zones = useMemo(() => timezoneOptions(), []);

  useEffect(() => {
    fetch("/api/account/availability")
      .then((response) => (response.ok ? response.json() : null))
      .then((mine: { availability?: unknown } | null) => {
        setSchedule(normalizeAvailability(mine?.availability) ?? defaultAvailability());
      })
      .catch(() => setSchedule(defaultAvailability()))
      .finally(() => setLoading(false));
  }, []);

  function updateDay(key: DayKey, patch: Partial<DayWindow>) {
    setSchedule((current) =>
      current ? { ...current, days: { ...current.days, [key]: { ...current.days[key], ...patch } } } : current,
    );
    setNotice(null);
  }

  async function save() {
    if (!schedule) return;
    setSaving(true);
    setNotice(null);
    try {
      const response = await fetch("/api/account/availability", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ availability: schedule }),
      });
      const data = (await response.json().catch(() => ({}))) as { availability?: unknown; message?: string };
      if (!response.ok) {
        setNotice({ tone: "error", text: data.message ?? "Could not save your hours." });
        return;
      }
      setSchedule(normalizeAvailability(data.availability) ?? schedule);
      setNotice({ tone: "ok", text: "Hours saved." });
    } catch {
      setNotice({ tone: "error", text: "Could not save your hours." });
    } finally {
      setSaving(false);
    }
  }

  const myWeeklyHours = schedule ? ownWeeklyMinutes(schedule, now) / 60 : 0;

  return (
    <div className="dashboard-availability-page mx-auto w-full max-w-[1120px] px-7 pb-16 pt-8 text-white sm:px-9 lg:px-10">
      <p className="text-xs font-normal uppercase tracking-[0.16em] text-white/80">Support operations</p>
      <h2 className="mt-2 text-3xl font-normal tracking-[-0.03em] text-white">Availability</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
        Set the hours you&apos;re reachable in your own timezone. Everyone&apos;s hours are added together below to show
        how much of the week the team actually covers — and where nobody is on.
      </p>

      {loading ? (
        <div className="mt-6 flex min-h-[220px] items-center justify-center text-[13px] text-white/80">
          <LoaderCircle size={15} className="mr-2 animate-spin" /> Loading availability
        </div>
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025]">
            <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-4">
              <Clock3 size={16} className="text-white/80" />
              <h3 className="text-[14px] font-semibold text-white">Your hours</h3>
              <span className="ml-auto text-[12px] text-white/80">{myWeeklyHours.toFixed(myWeeklyHours % 1 ? 1 : 0)}h a week</span>
            </div>

            <div className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-4">
              <Globe2 size={15} className="text-white/80" />
              <label htmlFor="availability-timezone" className="text-[13px] font-medium text-white">Timezone</label>
              <select
                id="availability-timezone"
                value={schedule?.timezone ?? "UTC"}
                onChange={(event) => { setSchedule((current) => (current ? { ...current, timezone: event.target.value } : current)); setNotice(null); }}
                className="ml-auto h-9 min-w-[240px] rounded-lg border border-white/10 bg-white/[0.05] px-3 text-[13px] text-white outline-none focus:border-[#428ce5]/60"
              >
                {zones.map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
            </div>

            <div>
              {DAY_KEYS.map((key) => {
                const day = schedule?.days[key];
                if (!day) return null;
                return (
                  <div key={key} className="flex flex-wrap items-center gap-3 border-b border-white/10 px-5 py-3 last:border-b-0">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={day.enabled}
                      aria-label={`Available on ${DAY_LABELS[key]}`}
                      onClick={() => updateDay(key, { enabled: !day.enabled })}
                      className={`dashboard-availability-toggle relative h-5 w-9 shrink-0 rounded-full transition ${day.enabled ? "bg-[#428ce5]" : "bg-white/20"}`}
                    >
                      <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${day.enabled ? "left-[18px]" : "left-0.5"}`} />
                    </button>
                    <span className="w-[86px] shrink-0 text-[14px] font-medium text-white">{DAY_LABELS[key]}</span>

                    {day.enabled ? (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="time"
                          value={day.start}
                          onChange={(event) => updateDay(key, { start: event.target.value })}
                          className="h-9 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 text-[13px] text-white outline-none focus:border-[#428ce5]/60"
                        />
                        <span className="text-[13px] text-white/80">to</span>
                        <input
                          type="time"
                          value={day.end}
                          onChange={(event) => updateDay(key, { end: event.target.value })}
                          className="h-9 rounded-lg border border-white/10 bg-white/[0.05] px-2.5 text-[13px] text-white outline-none focus:border-[#428ce5]/60"
                        />
                      </div>
                    ) : (
                      <span className="text-[13px] text-white/80">Unavailable</span>
                    )}

                    <span className="ml-auto text-[12px] text-white/80">{describeWindow(day)}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 px-5 py-4">
              <p className="dashboard-settings-subdesc text-[12px] leading-4 text-white/80">
                An end time earlier than the start means an overnight shift — 20:00 to 05:00 runs into the next morning.
              </p>
              {notice && (
                <span className={`text-[12.5px] font-medium ${notice.tone === "ok" ? "text-[#34845C]" : "text-[#b8444f]"}`}>{notice.text}</span>
              )}
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving}
                className="ml-auto flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#428ce5] px-4 text-[13px] font-semibold text-white transition hover:bg-[#347dce] disabled:opacity-50"
              >
                {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Check size={14} />} Save hours
              </button>
            </div>
          </div>

        </>
      )}
    </div>
  );
}

type PresenceEvent = { id: string; userId: string; name: string | null; email: string; status: "online" | "offline"; occurredAt: string };

function PresenceLogSettingsPage() {
  const myRole = useMyRole();
  const canView = myRole === "owner";
  const [events, setEvents] = useState<PresenceEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!canView) { setLoading(false); return; }
    fetch("/api/workspace/presence-events")
      .then((response) => (response.ok ? response.json() : { events: [] }))
      .then((data: { events?: PresenceEvent[] }) => setEvents(data.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [canView]);

  const normalizedQuery = query.trim().toLowerCase();
  const visibleEvents = events.filter((event) => !normalizedQuery || `${event.name ?? ""} ${event.email}`.toLowerCase().includes(normalizedQuery));

  return (
    <div className="mx-auto w-full max-w-[1120px] px-7 pb-16 pt-9 text-[#11120f] sm:px-9 lg:px-10">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Support operations</p>
      <h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-white/90">Presence log</h2>
      <p className="mt-2 max-w-2xl text-[14px] leading-6 text-[#667069]">Every time a teammate comes online or goes offline, driven by their actual connection — not a status they set themselves.</p>

      {myRole !== null && !canView ? (
        <p className="mt-6 rounded-lg bg-[#FFF4E5] px-3 py-2 text-[11.5px] font-medium text-[#93651D]">Only the workspace owner can view the presence log.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-[24px] border border-black/20 bg-white">
          <div className="flex flex-wrap items-center gap-3 border-b border-black/20 px-5 py-4">
            <h3 className="text-[13px] font-semibold">Recent activity</h3>
            <label className="dashboard-search-box ml-auto flex h-9 min-w-[230px] items-center gap-2 rounded-xl border px-3"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search teammate" className="min-w-0 flex-1 bg-transparent text-[12px] outline-none" /></label>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center text-[12px] text-[#7B858A]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading presence log</div>
          ) : visibleEvents.length ? (
            <div>
              {visibleEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-4 border-t border-black/20 px-5 py-4 first:border-t-0">
                  <span className={`h-2 w-2 shrink-0 rounded-full ${event.status === "online" ? "bg-[#32a880]" : "bg-[#9aa1a6]"}`} />
                  <div className="min-w-0 flex-1">
                    <p className="dashboard-presence-name truncate text-[14px] font-semibold">{event.name || event.email}</p>
                    <p className="mt-0.5 truncate text-[10.5px] text-[#8A9397]">{event.email}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${event.status === "online" ? "bg-[#EEF8F2] text-[#34845C]" : "bg-[#F1F3F4] text-[#5F686D]"}`}>{event.status}</span>
                  <time className="w-[150px] shrink-0 text-right text-[11px] text-[#7A858B]">{new Date(event.occurredAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center px-6 py-14 text-center"><Search size={22} className="text-[#9AA3A7]" /><p className="mt-3 text-[13px] font-semibold">No presence activity yet</p><p className="mt-1 text-[11px] text-[#7A858B]">Online/offline events will appear here as teammates connect.</p></div>
          )}
        </div>
      )}
    </div>
  );
}

type SiteTag = { id: string; name: string; domain: string; publicKey: string; allowLocalhost: boolean; status: "unverified" | "verified"; createdAt: string; lastUsedAt: string | null; permissions: { analytics: boolean; visitors: boolean; support: boolean } };

function TagManagerSettingsPage() {
  const [tags, setTags] = useState<SiteTag[]>([]);
  const [dialog, setDialog] = useState<"create" | "install" | "permissions" | null>(null);
  const [selectedTag, setSelectedTag] = useState<SiteTag | null>(null);
  const [siteName, setSiteName] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [allowLocalhost, setAllowLocalhost] = useState(false);
  const [loadingTags, setLoadingTags] = useState(true);
  const [tagError, setTagError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [cspCopied, setCspCopied] = useState(false);
  const [actionMenu, setActionMenu] = useState<string | null>(null);
  const [actionMenuPos, setActionMenuPos] = useState<{ top: number; left: number } | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [capabilities, setCapabilities] = useState({ chat: true, visitors: true, identify: true });
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagPage, setTagPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<SiteTag | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);
  const TAGS_PER_PAGE = 8;

  function openTagDialog(tag: SiteTag, nextDialog: "install" | "permissions") { setSelectedTag(tag); setDialog(nextDialog); setCopied(false); setVerificationMessage(null); }

  function toggleActionMenu(event: React.MouseEvent<HTMLButtonElement>, tagId: string) {
    if (actionMenu === tagId) { setActionMenu(null); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    setActionMenuPos({ top: rect.bottom + 6, left: Math.max(8, rect.right - 160) });
    setActionMenu(tagId);
  }

  async function deleteTag(tag: SiteTag) {
    setDeletingTagId(tag.id);
    try {
      const response = await fetch(`/api/workspace/sites/${encodeURIComponent(tag.id)}`, { method: "DELETE" });
      if (response.ok) { setTags((current) => current.filter((item) => item.id !== tag.id)); setDeleteTarget(null); }
      else setTagError("Could not delete this tag.");
    } finally {
      setDeletingTagId(null);
    }
  }

  // The menu is portaled to <body> with position:fixed (see render below), so
  // it isn't clipped by the table's overflow-x-auto or the page's
  // overflow-y-auto ancestors. Close it on outside click or on any scroll —
  // a fixed-position menu would otherwise drift away from its anchor.
  useEffect(() => {
    if (!actionMenu) return;
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.closest("[data-tag-menu-trigger]")) return;
      if (actionMenuRef.current && !actionMenuRef.current.contains(target)) setActionMenu(null);
    }
    function handleClose() { setActionMenu(null); }
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("scroll", handleClose, true);
    window.addEventListener("resize", handleClose);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("scroll", handleClose, true);
      window.removeEventListener("resize", handleClose);
    };
  }, [actionMenu]);
  useEffect(() => {
    let active = true;
    fetch("/api/workspace/sites", { cache: "no-store" })
      .then(async (response) => ({ ok: response.ok, data: await response.json() as { sites?: SiteTag[]; message?: string } }))
      .then(({ ok, data }) => { if (active) { setTags(data.sites ?? []); if (!ok) setTagError(data.message ?? "Could not load site tags."); } })
      .catch(() => { if (active) setTagError("Could not connect to the tag service."); })
      .finally(() => { if (active) setLoadingTags(false); });
    return () => { active = false; };
  }, []);

  function closeCreateDialog() { setDialog(null); setSiteName(""); setSiteUrl(""); setAllowLocalhost(false); setCapabilities({ chat: true, visitors: true, identify: true }); setTagError(null); }
  async function createTag() {
    const name = siteName.trim();
    const url = /^https?:\/\//i.test(siteUrl.trim()) ? siteUrl.trim() : `https://${siteUrl.trim()}`;
    if (!name || !url || creatingTag) return;
    setTagError(null);
    setCreatingTag(true);
    try {
      const response = await fetch("/api/workspace/sites", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ name, domain: url, allowLocalhost, permissions: { support: capabilities.chat, visitors: capabilities.visitors, analytics: capabilities.identify } }) });
      const result = await response.json() as { site?: SiteTag; message?: string };
      if (!response.ok || !result.site) { setTagError(result.message ?? "Could not create this site tag."); return; }
      const tag = result.site;
      setTags((current) => [...current, tag]);
      setSelectedTag(tag);
      setSiteName("");
      setSiteUrl("");
      setAllowLocalhost(false);
      setCapabilities({ chat: true, visitors: true, identify: true });
      setDialog("install");
    } finally {
      setCreatingTag(false);
    }
  }
  async function updateSelectedTag(tag: SiteTag) {
    const previous = selectedTag;
    setSelectedTag(tag); setTags((current) => current.map((item) => item.id === tag.id ? tag : item));
    const response = await fetch(`/api/workspace/sites/${encodeURIComponent(tag.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ allowLocalhost: tag.allowLocalhost, permissions: tag.permissions }) });
    if (!response.ok && previous) { setSelectedTag(previous); setTags((current) => current.map((item) => item.id === previous.id ? previous : item)); setTagError("Could not save tag permissions."); }
  }
  // tag.js is served from the CDN rather than wherever this dashboard
  // happens to be deployed (window.location.origin) — the CDN proxies it
  // through to the app, so the script content is identical either way, but
  // customers get a stable embed URL that survives the dashboard moving
  // hosts (a redeploy, a new Cloud Run revision, a future custom domain).
  // Local dev keeps the old behavior: cdn.elpino.chat proxies to the
  // production app, not to whatever's running on localhost.
  const isLocalDev = typeof window !== "undefined" && /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
  const tagHost = isLocalDev ? window.location.origin : "https://cdn.elpino.chat";
  const snippet = selectedTag ? `<script async src="${tagHost}/tag.js" data-site-key="${selectedTag.publicKey}"></script>` : "";

  // A strict Content-Security-Policy is the one class of install failure we
  // cannot fix from our side, in code, for any customer's site — script-src
  // is enforced by the browser against whatever the *visiting* page sends,
  // and we have no access to edit that page. The only real fix is telling
  // every customer with a CSP exactly what to add, before they hit a
  // silent, unexplained "the chat bubble never appeared". WIDGET_APP_ORIGIN
  // is wherever tag.js resolves ORIGIN to today (see externalOrigin() in
  // app/tag.js/route.ts) — update this if that ever moves to a stable
  // custom domain instead of the current Cloud Run URL.
  const WIDGET_APP_ORIGIN = "https://elpino-web-927489744703.europe-west1.run.app";
  // The config fetch used to hit wherever the dashboard app is actually
  // deployed (a Cloud Run URL that changes on redeploy), forcing that exact
  // host into connect-src alongside api.elpino.chat — two moving-target
  // origins for one customer to track. tag.js now calls cdn.elpino.chat for
  // that instead (proxied server-side to the app either way), so only
  // WIDGET_APP_ORIGIN's iframe (frame-src) still needs the real app host.
  const cspSnippet = [
    `script-src ${tagHost};`,
    `connect-src ${tagHost} https://api.elpino.chat wss://api.elpino.chat;`,
    `frame-src ${WIDGET_APP_ORIGIN};`,
  ].join("\n");

  return (
    <div className="dashboard-tag-manager-page mx-auto w-full max-w-[1120px] px-7 pb-14 pt-8 text-[#17181a] sm:px-9 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#E5E8EA] pb-7"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#6D7D85]">Website data</p><h2 className="mt-2 text-[34px] font-medium tracking-[-0.04em] text-white/90">Website tags</h2><p className="mt-2 max-w-xl text-[14px] leading-6 text-[#667069]">Install and manage the secure connection between Elpino and your website.</p></div>{tags.length === 0 && <button type="button" onClick={() => setDialog("create")} className="flex h-9 shrink-0 items-center gap-2 rounded-lg bg-[#202225] px-4 text-[12px] font-semibold text-white transition hover:bg-black"><Plus size={14} /> New tag</button>}</div>
      {/* One domain per workspace, enforced server-side (SitesController's
          SITE_LIMIT) — once a tag exists, don't offer a control that the
          backend will just reject after a full form fill-out. A second
          domain means a second workspace instead. */}
      {tags.length > 0 && <p className="mt-4 rounded-lg border border-[#DFE3E6] bg-[#FAFBFB] px-3.5 py-2.5 text-[12px] leading-5 text-[#667069]">A workspace can only connect one website. To support another domain, create a separate workspace for it.</p>}

      <div className="dashboard-tag-table-surface mt-5 bg-transparent">
        {tagError && !dialog && <div role="alert" className="mb-4 flex items-center justify-between rounded-lg bg-[#FFF2F2] px-3.5 py-2.5 text-[11px] font-medium text-[#A64A53]"><span>{tagError}</span><button type="button" onClick={() => setTagError(null)} aria-label="Dismiss error"><X size={14} /></button></div>}
        {loadingTags ? <div className="flex items-center justify-center py-16 text-[12px] text-[#687178]"><LoaderCircle size={15} className="mr-2 animate-spin" /> Loading tags</div> : tags.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-16 text-center"><span className="dashboard-tag-empty-icon flex h-11 w-11 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.05)] text-[#667078]"><Code2 size={19} /></span><h4 className="mt-3 text-[14px] font-semibold">No website tags</h4><p className="mt-1 max-w-sm text-[11px] leading-5 text-[#687178]">Create a tag and install it on your website to begin receiving visitor activity.</p><button type="button" onClick={() => setDialog("create")} className="mt-4 h-9 rounded-lg border border-[#D8DDE1] px-4 text-[12px] font-semibold transition hover:bg-[#F7F8FA]">Create first tag</button></div>
        ) : (
          <div className="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="min-w-[900px] pb-2">
              <div className="dashboard-tag-table-header grid grid-cols-[1.35fr_0.72fr_1fr_0.8fr_0.85fr_0.75fr_40px] gap-3 rounded-lg border border-[#DFE3E6] bg-transparent px-4 py-2.5 text-[12px] font-semibold text-white"><span>Website</span><span>Status</span><span>Public key</span><span>Access</span><span>Last activity</span><span>Created</span><span /></div>
              {(() => {
                const totalPages = Math.max(1, Math.ceil(tags.length / TAGS_PER_PAGE));
                const page = Math.min(tagPage, totalPages);
                const pageTags = tags.slice((page - 1) * TAGS_PER_PAGE, page * TAGS_PER_PAGE);
                return (
                  <>
                    {pageTags.map((tag) => {
                      const permissionCount = Object.values(tag.permissions).filter(Boolean).length;
                      return <div key={tag.id} className="dashboard-tag-table-row grid grid-cols-[1.35fr_0.72fr_1fr_0.8fr_0.85fr_0.75fr_40px] items-center gap-3 border-b border-[#E8ECEE] px-4 py-3 transition hover:bg-[rgba(255,255,255,0.05)]">
                        <div className="flex min-w-0 items-center gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#257A4D]"><KeyRound size={14} /></span><span className="min-w-0"><span className="dashboard-tag-table-text block truncate text-[14px] font-semibold text-white/80">{tag.name}</span><span className="mt-0.5 block truncate text-[12px] text-[#7B858A]">{tag.domain}</span></span></div>
                        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold ${tag.status === "verified" ? "text-[#257A4D]" : "text-[#93651D]"}`}><span className={`h-1.5 w-1.5 rounded-full ${tag.status === "verified" ? "bg-[#2FA266]" : "bg-[#D89831]"}`} />{tag.status === "verified" ? "Verified" : "Pending"}</span>
                        <code className="dashboard-tag-table-text w-fit max-w-full truncate rounded-md px-2 py-1 text-[12px] text-white/80">{tag.publicKey.slice(0, 12)}…</code>
                        <span className="dashboard-tag-table-text text-[13px] font-medium text-white/80">{permissionCount === 3 ? "Full access" : `${permissionCount} enabled`}</span>
                        <span className="dashboard-tag-table-text text-[13px] text-white/80">{tag.lastUsedAt ? new Date(tag.lastUsedAt).toLocaleDateString() : "Never"}</span>
                        <span className="dashboard-tag-table-text text-[13px] text-white/80">{new Date(tag.createdAt).toLocaleDateString()}</span>
                        <div className="relative"><button type="button" data-tag-menu-trigger aria-label={`Actions for ${tag.name}`} onClick={(event) => toggleActionMenu(event, tag.id)} className="dashboard-tag-table-text dashboard-tag-action-trigger flex h-8 w-8 items-center justify-center rounded-md text-white/80 hover:bg-[rgba(255,255,255,0.1)]"><MoreHorizontal size={16} /></button></div>
                      </div>;
                    })}
                    <div className="flex items-center justify-between px-1 py-3 text-[10px] text-[#768087]">
                      <span>{tags.length} {tags.length === 1 ? "tag" : "tags"}</span>
                      {totalPages > 1 ? (
                        <div className="flex items-center gap-3">
                          <button type="button" disabled={page <= 1} onClick={() => setTagPage(page - 1)} className="rounded-md border border-[#DDE4E8] px-2.5 py-1 font-medium text-[#3F474C] transition hover:bg-[#F3F4F5] disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                          <span>Page {page} of {totalPages}</span>
                          <button type="button" disabled={page >= totalPages} onClick={() => setTagPage(page + 1)} className="rounded-md border border-[#DDE4E8] px-2.5 py-1 font-medium text-[#3F474C] transition hover:bg-[#F3F4F5] disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                        </div>
                      ) : (
                        <span>Page 1 of 1</span>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {actionMenu && actionMenuPos && typeof document !== "undefined" && (() => {
        const tag = tags.find((item) => item.id === actionMenu);
        if (!tag) return null;
        return createPortal(
          <div
            ref={actionMenuRef}
            style={{ position: "fixed", top: actionMenuPos.top, left: actionMenuPos.left }}
            className="dashboard-tag-action-menu z-[110] w-40 rounded-lg border border-black/10 p-1 shadow-[0_12px_30px_rgba(15,23,42,0.14)]"
          >
            <button type="button" onClick={() => { openTagDialog(tag, "install"); setActionMenu(null); }} className="dashboard-tag-menu-item flex h-8 w-full items-center rounded-md px-2.5 text-[11px] font-medium">Installation</button>
            <button type="button" onClick={() => { openTagDialog(tag, "permissions"); setActionMenu(null); }} className="dashboard-tag-menu-item flex h-8 w-full items-center rounded-md px-2.5 text-[11px] font-medium">Permissions</button>
            <button
              type="button"
              onClick={() => { setDeleteTarget(tag); setActionMenu(null); }}
              className="dashboard-tag-menu-delete flex h-8 w-full items-center rounded-md px-2.5 text-[11px] font-medium text-[#A64A53]"
            >
              Delete
            </button>
          </div>,
          // Portaling to document.body would escape the dashboard-shell
          // subtree that every dark-mode override is scoped to (the
          // data-dashboard-theme attribute lives on an ancestor div, not
          // <body>), so the menu would always render light regardless of
          // theme. Portal inside .dashboard-shell instead so it inherits
          // the same dark/light cascade as everything else.
          document.querySelector(".dashboard-shell") ?? document.body,
        );
      })()}

      {deleteTarget && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0b0f14]/40 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && deletingTagId !== deleteTarget.id) setDeleteTarget(null); }}>
          <div role="dialog" aria-modal="true" aria-label="Delete website tag" className="w-full max-w-[420px] rounded-2xl border border-black/10 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.24)]">
            <h3 className="text-[17px] font-semibold text-[#17181a]">Delete {deleteTarget.name}?</h3>
            <p className="mt-2 text-[13px] leading-6 text-[#667069]">
              The chat widget on {deleteTarget.domain} will stop working immediately, and this cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={deletingTagId === deleteTarget.id}
                onClick={() => setDeleteTarget(null)}
                className="flex h-10 items-center rounded-lg border border-[#DFE3E6] px-4 text-[13px] font-semibold text-[#17181a] transition hover:bg-[#F7F8FA] disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingTagId === deleteTarget.id}
                onClick={() => void deleteTag(deleteTarget)}
                className="flex h-10 items-center gap-2 rounded-lg bg-[#c63f4d] px-4 text-[13px] font-semibold text-white transition hover:bg-[#b23644] disabled:opacity-60"
              >
                {deletingTagId === deleteTarget.id ? <LoaderCircle size={14} className="animate-spin" /> : null}
                {deletingTagId === deleteTarget.id ? "Deleting…" : "Delete tag"}
              </button>
            </div>
          </div>
        </div>
      )}

      {dialog === "create" && (
        <div className="fixed inset-0 z-[100] bg-[#0b0f14]/40 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeCreateDialog(); }}>
          <aside role="dialog" aria-modal="true" aria-label="Connect a website" className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col border-l border-[#dfe3e6] bg-white shadow-[-16px_0_48px_rgba(15,23,42,0.14)]">
            <div className="relative shrink-0 border-b border-[#e5e8eb] bg-[#f7f8fa] px-7 pb-6 pt-6">
              <div className="relative flex items-start justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#dfe3e6] bg-white text-[#428ce5] shadow-sm"><Globe2 size={18} /></span>
                <button type="button" onClick={closeCreateDialog} aria-label="Close" className="flex h-9 w-9 items-center justify-center rounded-lg text-[#687178] transition hover:bg-[#e9edf0] hover:text-black"><X size={18} /></button>
              </div>
              <h3 className="relative mt-4 text-[20px] font-semibold tracking-[-0.02em] text-[#17181a]">Connect a website</h3>
              <p className="relative mt-1.5 max-w-[360px] text-[12.5px] leading-5 text-[#687178]">Add a site tag so Elpino can recognize visitors and bring the AI teammate to your pages.</p>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-7 py-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <label className="block">
                <span className="text-[12.5px] font-semibold text-[#17233A]">Website URL</span>
                <div className="mt-2 flex h-11 overflow-hidden rounded-xl border border-[#DDE4E8] bg-white transition focus-within:border-[#11120f] focus-within:ring-2 focus-within:ring-[#11120f]/8">
                  <span className="flex items-center border-r border-[#DDE4E8] bg-[#FAFBFB] px-3 text-[12.5px] font-medium text-[#7B858A]">https://</span>
                  <input value={siteUrl} onChange={(event) => setSiteUrl(event.target.value.replace(/^https?:\/\//i, ""))} placeholder="www.mywebsite.com" className="min-w-0 flex-1 px-3 text-[13px] outline-none" />
                </div>
              </label>

              <label className="mt-4 block">
                <span className="text-[12.5px] font-semibold text-[#17233A]">Display name</span>
                <input value={siteName} onChange={(event) => setSiteName(event.target.value)} placeholder="My Website" className="mt-2 h-11 w-full rounded-xl border border-[#DDE4E8] px-3 text-[13px] outline-none transition focus:border-[#11120f] focus:ring-2 focus:ring-[#11120f]/8" />
              </label>

              <div className="mt-7 flex items-start gap-3 rounded-xl border border-[#DCE5EF] bg-[#F5F9FE] p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#17233A]">Allow localhost for development</p>
                  <p className="mt-1 text-[11px] leading-4 text-[#66798B]">Off by default. When off, this tag only loads on <span className="font-semibold text-[#35485A]">{siteUrl.trim().replace(/^https?:\/\//i, "").split("/")[0] || "the domain above"}</span>. Turn it on to also use the same tag on localhost or 127.0.0.1.</p>
                </div>
                <Switch checked={allowLocalhost} onCheckedChange={setAllowLocalhost} aria-label="Allow localhost for development" />
              </div>

              <p className="mb-2 mt-7 text-[11px] font-bold uppercase tracking-[0.12em] text-[#8A929C]">What this tag can do</p>
              <div className="overflow-hidden rounded-xl border border-[#E1E5E8]">
                {[
                  { key: "chat" as const, icon: MessageSquarePlus, tone: "bg-[#EAF1FF] text-[#2878ce]", title: "Live chat widget", description: "Show the Elpino chat bubble so visitors can talk to your AI teammate." },
                  { key: "visitors" as const, icon: Eye, tone: "bg-[#EAF8F0] text-[#238753]", title: "Visitor analytics", description: "See who's on your site right now and where they came from." },
                  { key: "identify" as const, icon: UserCheck, tone: "bg-[#F3EEFF] text-[#6246DF]", title: "Customer identification", description: "Recognise signed-in visitors on this site. Needs identity verification set up in Settings." },
                ].map(({ key, icon: Icon, tone, title, description }, index) => (
                  <div key={key} className={`flex items-start gap-3.5 bg-white px-4 py-4 ${index ? "border-t border-[#EEF0F2]" : ""}`}>
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${tone}`}><Icon size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-[#17233A]">{title}</p>
                      <p className="mt-0.5 text-[11px] leading-4 text-[#7B858A]">{description}</p>
                    </div>
                    <Switch checked={capabilities[key]} onCheckedChange={(checked) => setCapabilities((current) => ({ ...current, [key]: checked }))} aria-label={title} />
                  </div>
                ))}
              </div>
              {tagError && <p role="alert" className="mt-4 rounded-lg bg-[#FFF1F1] px-3 py-2 text-[11px] font-medium text-[#A64A53]">{tagError}</p>}
            </div>

            <div className="flex shrink-0 items-center gap-3 border-t border-[#EEF0F2] px-7 py-5">
              <button type="button" disabled={creatingTag} onClick={closeCreateDialog} className="h-10 flex-1 rounded-lg border border-[#DDE4E8] text-[13px] font-semibold text-[#17233A] transition hover:bg-[#F7F8FA] disabled:cursor-not-allowed disabled:opacity-50">Cancel</button>
              <button type="button" disabled={!siteName.trim() || !siteUrl.trim() || creatingTag} onClick={() => void createTag()} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#428ce5] text-[13px] font-semibold text-white transition hover:bg-[#347dce] disabled:cursor-not-allowed disabled:bg-[#E0E2E4] disabled:text-[#A3A9AE]">
                {creatingTag ? <><LoaderCircle size={15} className="animate-spin" /> Creating…</> : <><Plus size={15} /> Create tag</>}
              </button>
            </div>
          </aside>
        </div>
      )}

      <Link href="/dashboard/settings/identity" className="mt-8 flex items-center gap-3 rounded-xl border border-[#e7e8ea] p-4 transition hover:bg-black/[0.03]">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F3EEFF] text-[#6246DF]"><UserCheck size={16} /></span>
        <span className="min-w-0 flex-1"><span className="block text-[13px] font-semibold">Verify signed-in customers</span><span className="mt-0.5 block text-[12px] leading-5 text-[#687178]">Let the AI safely look up a logged-in customer&apos;s own payments and records.</span></span>
        <span className="text-[12px] font-medium text-[#428ce5]">Set up</span>
      </Link>

      {(dialog === "install" || dialog === "permissions") && selectedTag && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}><div role="dialog" aria-modal="true" className="dashboard-tag-install-panel w-full max-w-[580px] overflow-hidden rounded-[24px] border border-black/10 shadow-[0_28px_80px_rgba(15,23,42,0.24)]"><div className="dashboard-tag-install-header flex items-start justify-between border-b border-[#E5E9EB] px-6 py-5"><div><h3 className="text-[19px] font-semibold tracking-[-0.02em]">{dialog === "install" ? `Install ${selectedTag.name}` : `Permissions for ${selectedTag.name}`}</h3><p className="dashboard-tag-table-text mt-1 text-[12px] text-white/80">{dialog === "install" ? "Add the public snippet before the closing head tag." : "Choose what this site tag is allowed to collect."}</p></div><button type="button" onClick={() => setDialog(null)} className="dashboard-tag-install-close flex h-9 w-9 items-center justify-center rounded-lg"><X size={17} /></button></div>
        {dialog === "install" && <div className="p-6"><div className="rounded-2xl bg-[#11120f] p-4 text-white"><div className="mb-3 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Install snippet</span><button type="button" onClick={async () => { await navigator.clipboard.writeText(snippet); setCopied(true); }} className="flex items-center gap-1.5 text-[10px] font-semibold text-white/75 hover:text-white"><Copy size={13} /> {copied ? "Copied" : "Copy"}</button></div><code className="block break-all text-[11px] leading-5 text-[#D8E2E7]">{snippet}</code></div><div className="dashboard-tag-steps mt-4 rounded-xl border border-[#E2DFD8] bg-[rgba(255,255,255,0.05)] p-4"><p className="text-[12px] font-semibold">Installation steps</p><ol className="mt-2 space-y-2 text-[11px] leading-5 text-[#667069]"><li>1. Copy the snippet above.</li><li>2. Paste it into every page before <code>&lt;/head&gt;</code>.</li><li>3. Publish your website, then verify the tag.</li></ol></div><div className="dashboard-tag-csp mt-4 rounded-xl border border-[#E2DFD8] bg-[#FAFBFB] p-4"><p className="text-[12px] font-semibold text-[#17181a]">Have a Content-Security-Policy?</p><p className="mt-1 text-[11px] leading-5 text-[#667069]">Add these to your existing policy — a strict CSP is enforced by your site, so this is the one thing we can’t fix from our side. Without it the tag loads but the chat bubble silently never appears.</p><div className="mt-3 rounded-lg bg-[#11120f] p-3"><div className="mb-2 flex items-center justify-between"><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">Add to script-src / connect-src / frame-src</span><button type="button" onClick={async () => { await navigator.clipboard.writeText(cspSnippet); setCspCopied(true); setTimeout(() => setCspCopied(false), 2000); }} className="flex items-center gap-1.5 text-[10px] font-semibold text-white/75 hover:text-white"><Copy size={12} /> {cspCopied ? "Copied" : "Copy"}</button></div><pre className="whitespace-pre-wrap break-all text-[11px] leading-5 text-[#D8E2E7]">{cspSnippet}</pre></div></div>{verificationMessage && <p className={`mt-4 text-[11px] font-medium ${selectedTag.status === "verified" ? "text-[#257A4D]" : "text-[#A66A2C]"}`}>{verificationMessage}</p>}<div className="mt-5 flex items-center justify-between gap-4"><span className="text-[11px] text-[#667069]">{selectedTag.allowLocalhost ? `Allowed on ${selectedTag.domain} and localhost.` : `Restricted to ${selectedTag.domain}.`}</span><button type="button" disabled={verifying} onClick={async () => { setVerifying(true); setVerificationMessage(null); const response = await fetch("/api/workspace/sites", { cache: "no-store" }); const result = await response.json() as { sites?: SiteTag[] }; const refreshed = result.sites?.find((item) => item.id === selectedTag.id); if (refreshed) { setSelectedTag(refreshed); setTags(result.sites ?? []); setVerificationMessage(refreshed.status === "verified" ? "Tag connected successfully." : "No visit detected yet. Open the installed website, then try again."); } else setVerificationMessage("Could not find this tag."); setVerifying(false); }} className="flex h-10 shrink-0 items-center gap-2 rounded-full bg-[#11120f] px-5 text-[12px] font-semibold text-white disabled:opacity-60">{verifying ? <><LoaderCircle size={14} className="animate-spin" /> Verifying</> : <><CheckCircle2 size={14} /> Verify tag</>}</button></div></div>}
        {dialog === "permissions" && <div className="divide-y divide-[#E9ECEE]">{([{ key: "analytics", title: "Analytics", description: "Collect page views, referrers, and engagement events." }, { key: "visitors", title: "Visitor counts", description: "Count unique and returning visitors for reporting." }, { key: "support", title: "Support context", description: "Attach the current page and session context to support conversations." }] as const).map((permission) => <div key={permission.key} className="flex items-start gap-4 px-6 py-5"><div className="min-w-0 flex-1"><p className="text-[13px] font-semibold">{permission.title}</p><p className="mt-1 text-[11px] leading-5 text-[#667069]">{permission.description}</p></div><Toggle checked={selectedTag.permissions[permission.key]} onChange={() => updateSelectedTag({ ...selectedTag, permissions: { ...selectedTag.permissions, [permission.key]: !selectedTag.permissions[permission.key] } })} label={permission.title} /></div>)}</div>}
      </div></div>}
    </div>
  );
}

function TwoFactorSetupDialog({
  secret, qrDataUrl, code, setCode, showSecret, setShowSecret, busy, error, onVerify, onClose,
}: {
  secret: string;
  qrDataUrl: string | null;
  code: string;
  setCode: (value: string) => void;
  showSecret: boolean;
  setShowSecret: (value: boolean) => void;
  busy: boolean;
  error: string | null;
  onVerify: () => void;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-label="Set up authenticator app" className="w-full max-w-[400px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
        <div className="flex items-start justify-between border-b border-[#eceeef] px-5 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF5EE] text-[#257A4D]"><ShieldCheck size={17} /></span>
            <div>
              <h3 className="text-[14px] font-semibold text-black">Set up authenticator app</h3>
              <p className="text-[11px] text-[#858585]">Scan, then verify with a code</p>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#858585] hover:bg-[#f5f5f5] hover:text-black"><X size={16} /></button>
        </div>

        <div className="px-5 py-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#9aa1a6]">Step 1</p>
          <p className="mt-1 text-[12.5px] text-[#333]">Scan this QR code with Google Authenticator, 1Password, or a similar app.</p>

          <div className="mt-3 flex items-center justify-center rounded-xl border border-[#e1e5e8] bg-[#FAFBFB] py-5">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={qrDataUrl} alt="Scan this QR code with your authenticator app" width={176} height={176} className="h-44 w-44 rounded-lg bg-white p-1.5" />
            ) : (
              <div className="flex h-44 w-44 items-center justify-center"><LoaderCircle size={20} className="animate-spin text-[#9aa1a6]" /></div>
            )}
          </div>

          <button type="button" onClick={() => setShowSecret(!showSecret)} className="mt-3 text-[11.5px] font-medium text-[#337bc9] hover:underline">
            {showSecret ? "Hide manual entry code" : "Can't scan it? Enter the code manually"}
          </button>
          {showSecret && (
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-[#e1e5e8] bg-[#FAFBFB] px-3 py-2">
              <code className="min-w-0 flex-1 truncate text-[12px] tracking-wider text-[#333]">{secret}</code>
              <button type="button" onClick={() => void copySecret()} className="flex shrink-0 items-center gap-1 text-[11px] font-semibold text-[#5f696f] hover:text-black">
                <Copy size={12} /> {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}

          <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.1em] text-[#9aa1a6]">Step 2</p>
          <p className="mt-1 text-[12.5px] text-[#333]">Enter the 6-digit code your app just generated.</p>
          <input
            autoFocus
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
            onKeyDown={(event) => { if (event.key === "Enter") onVerify(); }}
            placeholder="123456"
            inputMode="numeric"
            className="mt-2 h-11 w-full rounded-lg border border-[#d3d3d3] px-3 text-center text-[16px] tracking-[0.35em] outline-none focus:border-[#777]"
          />
          {error && <p className="mt-2 text-[11px] text-[#b8444f]">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-[#eceeef] px-5 py-4">
          <button type="button" onClick={onClose} className="h-10 flex-1 rounded-lg border border-[#d3d3d3] text-[12.5px] font-semibold text-[#333] hover:bg-[#f5f5f5]">Cancel</button>
          <button type="button" disabled={busy || code.length !== 6} onClick={onVerify} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[#202225] text-[12.5px] font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : null} Verify &amp; enable
          </button>
        </div>
      </div>
    </div>
  );
}

function Toggle({ checked, onChange, label, disabled }: { checked: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return (
    <Switch checked={checked} onCheckedChange={onChange} aria-label={label} disabled={disabled} />
  );
}

type NavItem = { label: string; slug: string; icon: typeof Settings };

function SidebarNavGroup({ title, items, currentPage, spacingClassName = "mt-3" }: { title: string; items: NavItem[]; currentPage: string; spacingClassName?: string }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={spacingClassName}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-md px-1 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#74787c] transition hover:text-[#4c4f52]"
      >
        <span>{title}</span>
        <ChevronDown size={13} className={`transition-transform duration-200 ease-in-out ${open ? "rotate-0" : "-rotate-90"}`} />
      </button>
      <div className={`grid transition-all duration-200 ease-in-out ${open ? "mt-1 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">
          <nav className="space-y-0.5">
            {items.map(({ label, slug, icon: Icon }) => (
              <Link key={label} href={slug ? `/dashboard/settings/${slug}` : "/dashboard/settings"} aria-current={currentPage === label ? "page" : undefined} className={`flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-left text-[13px] font-normal text-black/90 transition ${currentPage === label ? "dashboard-secondary-nav-active bg-[#eeeeee]" : "hover:bg-[#f0f0f0]"}`}>
                <Icon size={16} strokeWidth={1.8} className={currentPage === label ? "text-[#55585c]" : "text-[#8b8d90]"} />
                <span className="truncate">{label}</span>
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}

export function SettingsClient({ user, page = "General", auditView = "all" }: { user: SettingsUser; page?: string; auditView?: "all" | AuditStatus }) {
  const router = useRouter();
  const currentPage = page;
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useMobileDrawer();
  const [signingOut, setSigningOut] = useState(false);
  const [previewPanel, setPreviewPanel] = useState<HTMLDivElement | null>(null);
  const showPreviewPanel = currentPage === "Chatbot Interface";

  async function signOut() {
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      posthog.reset();
      window.ElpinoTag?.logout?.();
      router.push("/login");
      router.refresh();
    }
  }

  return (
    <div id="dashboard-settings-page" className="flex h-full min-h-0 overflow-hidden bg-[#262626] text-white">
      {/* Kept mounted (not `hidden`) below md so the slide has something to
          animate — see SpacePanel.tsx for the same trick and why. */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 md:hidden ${sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() => setSidebarOpen(false)}
      />
      <div
        id="dashboard-settings-sidebar"
        className={`dashboard-secondary-sidebar fixed inset-y-0 left-0 z-50 flex h-full min-h-0 w-72 shrink-0 flex-col overflow-hidden border-r border-white/10 bg-[#262626] shadow-[8px_0_30px_rgba(0,0,0,0.35)] transition-transform duration-300 ease-in-out md:static md:z-auto md:w-[230px] md:translate-x-0 md:shadow-none lg:w-[272px] ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4 pt-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <SidebarNavGroup title="Account" items={accountItems} currentPage={currentPage} spacingClassName="mt-1" />
          <SidebarNavGroup title="Chatbot" items={chatbotItems} currentPage={currentPage} />
          <SidebarNavGroup title="Workspace" items={workspaceItems} currentPage={currentPage} />
        </div>
        <div className="border-t border-[#e4e4e4] p-3">
          <button type="button" disabled={signingOut} onClick={() => void signOut()} className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-[13px] text-black hover:bg-[#eeeeee] disabled:opacity-50">
            <LogOut size={16} strokeWidth={1.8} /> {signingOut ? "Signing out..." : "Log out"}
          </button>
        </div>
      </div>

      <section className="dashboard-page-surface dashboard-settings-surface relative h-full min-w-0 flex-1 overflow-y-auto bg-[#262626] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {currentPage === "General" ? (
          <GeneralSettingsPage user={user} />
        ) : currentPage === "Chatbot Interface" ? (
          <ChatbotInterfaceSettingsPage previewContainer={previewPanel} />
        ) : currentPage === "Restrictions" ? (
          <ChatbotUrlRestrictionsSettingsPage />
        ) : currentPage === "Behavior" ? (
          <ChatbotBehaviorSettingsPage />
        ) : currentPage === "People" ? (
          <PeopleSettingsPage />
        ) : currentPage === "Teams" ? (
          <TeamsSettingsPage />
        ) : currentPage === "Billing" ? (
          <BillingSettingsPage />
        ) : currentPage === "Usage" ? (
          <AIUsageSettingsPage />
        ) : currentPage === "Security & Permissions" ? (
          <SecuritySettingsPage />
        ) : currentPage === "Audit Logs" ? (
          <AuditLogsSettingsPage view={auditView} />
        ) : currentPage === "Availability" ? (
          <AvailabilitySettingsPage />
        ) : currentPage === "Presence Log" ? (
          <PresenceLogSettingsPage />
        ) : currentPage === "Information" ? (
          <WorkspaceInformationSettingsPage />
        ) : currentPage === "Setup & Integration" ? (
          <SetupIntegrationSettingsPage />
        ) : currentPage === "Data Limits & Legal" ? (
          <DataLimitsLegalSettingsPage />
        ) : currentPage === "Danger Zone" ? (
          <WorkspaceDangerZoneSettingsPage />
        ) : currentPage === "Tag Manager" ? (
          <TagManagerSettingsPage />
        ) : currentPage === "Identity Verification" ? (
          <IdentityVerificationSettingsPage />
        ) : currentPage === "Translations" ? (
          <TranslationSettingsPage />
        ) : currentPage === "Plugins" ? (
          <ConnectPageContent />
        ) : (
          <FeatureSettingsPage title={currentPage} />
        )}
      </section>

      {showPreviewPanel && (
        <div
          ref={setPreviewPanel}
          data-tour="widget-preview"
          className="dashboard-widget-preview-panel flex h-full min-h-0 w-[380px] shrink-0 flex-col overflow-hidden border-l border-white/10 bg-[#262626] max-xl:hidden"
        />
      )}
    </div>
  );
}
