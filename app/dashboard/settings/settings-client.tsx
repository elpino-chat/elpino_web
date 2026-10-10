"use client";

import { GoogleIcon } from "@/app/components/auth/AuthShared";
import { UpgradeDialog, useUpgradeDialog } from "@/app/components/dashboard/UpgradeDialog";
import { normalizePath, type UrlRules } from "./url-rules";
import { HighlightedCode, HighlightedCsp } from "@/app/components/code-highlight";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import QRCode from "qrcode";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ANNUAL_SAVING_PERCENT,
  getAnnualTotal,
  getPlanPrice,
  plans as pricingPlans,
} from "@/app/components/PricingCards";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { Switch } from "@/components/ui/switch";
import { Bone } from "@/app/components/dashboard/DashboardSkeleton";
import { readDashboardTheme, saveDashboardTheme, type DashboardAppearance } from "@/app/components/dashboard/DashboardThemeProvider";
import { InvitePeopleDialog } from "@/app/components/dashboard/InvitePeopleDialog";
import { TeamsSection } from "@/app/dashboard/settings/TeamsSection";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { PreChatField } from "@/app/dashboard/components/prechat-form-editor";
import { ContactCollectionSwitch } from "@/app/dashboard/components/contact-collection-switch";
import { useMobileDrawer } from "@/app/components/dashboard/mobile-drawer-context";
import { SUPPORTED_LANGUAGES } from "@/app/dashboard/settings/languages";
import { IdentityVerificationSettingsPage } from "@/app/dashboard/settings/IdentityVerificationSettings";
import { ConnectPageContent } from "@/app/dashboard/connect/ConnectPageContent";
import { canOpenPage, pageNeedsOwner } from "@/app/dashboard/settings/member-access";
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
  ArrowLeft,
  FileArchive,
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
  MapPin,
  Monitor,
  Smartphone,
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
  Search,
  Send,
  Settings,
  ShieldCheck,
  Smile,
  Table2,
  Trash2,
  Upload,
  UserRound,
  UserCheck,
  UserPlus,
  X,
  UsersRound,
  Link2 as LinkIcon,
  Filter,
  ShieldOff,
  UserMinus,
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
/** Grey placeholder rows (avatar + two lines) shown while a settings section loads. */
function SkeletonRows({ rows = 4, className = "" }: { rows?: number; className?: string }) {
  return (
    <div role="status" aria-busy="true" aria-label="Loading" className={`space-y-4 ${className}`}>
      {Array.from({ length: rows }, (_, row) => (
        <div key={row} className="flex items-center gap-3">
          <Bone className="size-9 shrink-0" />
          <div className="flex-1 space-y-2"><Bone className="h-3.5 w-2/5" /><Bone className="h-3 w-3/5" /></div>
        </div>
      ))}
    </div>
  );
}

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
// Matches UNLIMITED_SEATS in workspace-service billing/plans.ts.
const UNLIMITED_SEATS = 1_000_000;

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
  { label: "Tag Manager", slug: "tags", icon: Code2 },
  { label: "Identity Verification", slug: "identity", icon: UserCheck },
  { label: "Restrictions", slug: "chatbot-restrictions", icon: ShieldCheck },
];

// Shared workspace configuration, visible the same way to every teammate.
const workspaceItems = [
  { label: "Information", slug: "information", icon: Info },
  { label: "Members", slug: "teams", icon: UserRound },
  { label: "Presence Log", slug: "presence-log", icon: Radio },
  { label: "Usage", slug: "ai-usage", icon: CircleGauge },
  { label: "Setup & Integration", slug: "setup-integration", icon: Puzzle },
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

type TimeSaved = {
  replies: number;
  humanSecondsPerReply: number;
  avgResponseSeconds: number;
  savedSeconds: number;
  daily: { date: string; replies: number; savedSeconds: number }[];
};

const HUMAN_MINUTES_KEY = "elpino.timeSaved.minutes";
const DEFAULT_HUMAN_MINUTES = 2;

function formatSaved(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${total}s`;
}

function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" });
}

/**
 * How much sooner the AI's replies arrived than a person's would have: for each
 * reply, (what a person would take) - (what the AI took). What a person would
 * take is an estimate the workspace can change, kept in this browser.
 */
function TimeSavedSection() {
  const [minutes, setMinutes] = useState(DEFAULT_HUMAN_MINUTES);
  const [data, setData] = useState<TimeSaved | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem(HUMAN_MINUTES_KEY));
      if (saved >= 0.5 && saved <= 30) setMinutes(saved);
    } catch { /* storage unavailable — keep the default */ }
  }, []);

  useEffect(() => {
    let cancelled = false;
    // Debounced so typing a new estimate doesn't fire a request per keystroke.
    const timer = window.setTimeout(() => {
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1); // the viewer's own month, in their own timezone
      const params = new URLSearchParams({
        from: monthStart.toISOString(),
        to: now.toISOString(),
        humanSeconds: String(Math.round(minutes * 60)),
        tzOffsetMinutes: String(-now.getTimezoneOffset()),
      });
      fetch(`/api/workspace/usage/time-saved?${params.toString()}`, { cache: "no-store" })
        .then((response) => (response.ok ? response.json() : null))
        .then((body: { timeSaved: TimeSaved | null } | null) => {
          if (cancelled) return;
          setData(body?.timeSaved ?? null);
          setFailed(!body?.timeSaved);
        })
        .catch(() => { if (!cancelled) setFailed(true); });
    }, 350);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [minutes]);

  const localToday = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
  const today = data?.daily.find((day) => day.date === localToday);
  const peak = Math.max(1, ...(data?.daily.map((day) => day.savedSeconds) ?? [0]));
  // How much sooner the AI answers than the assumed person: 100% would be instant, 0% no faster. Empty until there is a measured reply.
  const fasterPercent = data && data.avgResponseSeconds > 0 && data.humanSecondsPerReply > 0
    ? Math.round(Math.min(1, Math.max(0, 1 - data.avgResponseSeconds / data.humanSecondsPerReply)) * 100)
    : null;
  const replyWord = (count: number) => `${count.toLocaleString()} AI repl${count === 1 ? "y" : "ies"}`;

  return (
    <section className="mt-6 rounded-xl bg-white px-0 py-6">
      <div>
        <p className="text-[14px] font-medium">Time saved by AI</p>
        <p className="mt-0.5 text-[12px] text-[#8b9398]">How much sooner your customers got an answer than if a person had written every reply.</p>
      </div>

      {!data && !failed ? (
        <div role="status" aria-busy="true" aria-label="Loading time saved" className="mt-5 grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((tile) => <div key={tile} className="space-y-3"><Bone className="h-3 w-24" /><Bone className="h-8 w-28" /><Bone className="h-3 w-20" /></div>)}
        </div>
      ) : failed || !data ? (
        <p className="mt-5 text-[12.5px] text-[#667069]">Time saved could not be loaded right now.</p>
      ) : (
        <>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <p className="usage-heading text-[12px] text-[#8b9398]">Today</p>
              <p className="mt-1 text-[28px] font-medium leading-none tracking-[-0.03em] tabular-nums">{formatSaved(today?.savedSeconds ?? 0)}</p>
              <p className="mt-1.5 text-[12px] text-[#667069]">{replyWord(today?.replies ?? 0)}</p>
            </div>
            <div>
              <p className="usage-heading text-[12px] text-[#8b9398]">This month</p>
              <p className="mt-1 text-[28px] font-medium leading-none tracking-[-0.03em] tabular-nums">{formatSaved(data.savedSeconds)}</p>
              <p className="mt-1.5 text-[12px] text-[#667069]">{replyWord(data.replies)}</p>
            </div>
            <div>
              <p className="usage-heading text-[12px] text-[#8b9398]">Faster than a person</p>
              <p className="mt-1 text-[28px] font-medium leading-none tracking-[-0.03em] tabular-nums">{fasterPercent === null ? "—" : `${fasterPercent}%`}</p>
              <p className="mt-1.5 text-[12px] text-[#667069]">{fasterPercent === null ? "Appears after the AI's first reply" : `AI takes ${data.avgResponseSeconds}s on average, a person ${formatSaved(data.humanSecondsPerReply)}`}</p>
            </div>
          </div>

          {data.replies > 0 ? (
            <div className="mt-6">
              <div className="flex h-20 items-end gap-[3px]" role="img" aria-label="Time saved per day this month">
                {data.daily.map((day) => (
                  <span
                    key={day.date}
                    title={`${dayLabel(day.date)}: ${formatSaved(day.savedSeconds)} saved · ${replyWord(day.replies)}`}
                    className="flex-1 rounded-t-sm bg-[#428ce5]"
                    style={{ height: `${Math.max(day.savedSeconds ? 6 : 3, (day.savedSeconds / peak) * 100)}%`, opacity: day.savedSeconds ? 1 : 0.18 }}
                  />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between text-[11px] text-[#8b9398]">
                <span>{dayLabel(data.daily[0].date)}</span>
                <span>{dayLabel(data.daily[data.daily.length - 1].date)}</span>
              </div>
            </div>
          ) : (
            <p className="usage-paragraph mt-5 text-[12.5px] text-[#667069]">No AI replies yet this month. Time saved will appear here as the AI answers customers.</p>
          )}
        </>
      )}

    </section>
  );
}

function AIUsageSettingsPage() {
  const [creditsCents, setCreditsCents] = useState<number | null>(null);
  // Free is limited by AI messages, not dollars, so the credit balance, "Add
  // credits" and auto-recharge only make sense on credit-based (paid) plans.
  // null while loading, so they don't flash in and out for Free workspaces.
  const [billing, setBilling] = useState<BillingStatus | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useUpgradeDialog();
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

      <section className="mt-6 rounded-xl bg-white px-0 py-6">
        {!entitlement ? (
          <div role="status" aria-busy="true" aria-label="Loading plan" className="space-y-3 py-2"><Bone className="h-5 w-32" /><Bone className="h-3.5 w-3/5" /><Bone className="h-9 w-40" /></div>
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

            <div className="mt-2 flex gap-4 rounded-xl px-0 py-5">
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

      <TimeSavedSection />

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
          <div role="status" aria-busy="true" aria-label="Loading" className="space-y-2.5 py-1"><Bone className="h-4 w-1/3" /><Bone className="h-3.5 w-1/2" /></div>
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

type SeatMember = { id: string; email: string; name: string | null; avatarUrl: string | null; role?: string; presenceStatus?: string; joinedAt?: string; teams?: { id: string; name: string }[] };

function memberInitial(member: { name: string | null; email: string }) {
  return (member.name?.trim().charAt(0) || member.email.charAt(0)).toUpperCase();
}

const STATUS_DOT: Record<string, { label: string; dot: string }> = {
  online: { label: "Online", dot: "bg-[#30b978]" },
  away: { label: "Away", dot: "bg-[#9aa1a6]" },
  brb: { label: "Be right back", dot: "bg-[#d89831]" },
};

/**
 * Members and seats. A shareable join link and per-email invites both add
 * people; every row (member, pending invite, or empty seat) counts toward
 * the plan's seat limit, which is bought in the same packs as Billing.
 */
type MemberRoleOption = "owner" | "member";
type MemberStatusOption = "online" | "away" | "brb" | "pending";
const MEMBER_ROLE_OPTIONS: [MemberRoleOption, string][] = [["owner", "Owner"], ["member", "Member"]];
const MEMBER_STATUS_OPTIONS: [MemberStatusOption, string][] = [["online", "Online"], ["away", "Away"], ["brb", "Be right back"], ["pending", "Pending invite"]];

function TeamsSettingsPage() {
  const myRole = useMyRole();
  const isOwner = myRole === "owner";
  const [myId, setMyId] = useState<string | null>(null);
  const [members, setMembers] = useState<SeatMember[]>([]);
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [entitlement, setEntitlement] = useState<Entitlement | null>(null);
  const [loading, setLoading] = useState(true);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useUpgradeDialog();
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [rowBusy, setRowBusy] = useState<string | null>(null);
  const [manageOpenFor, setManageOpenFor] = useState<string | null>(null);
  // Phones show a row collapsed to its name; tapping it opens the rest. Desktop always shows the full table.
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  function toggleExpanded(id: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const [search, setSearch] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  // Each filter is the set of values the person ticked; an empty set means "don't filter by this".
  const [roleFilter, setRoleFilter] = useState<Set<MemberRoleOption>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Set<MemberStatusOption>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // The filter dropdown and the per-row menus close on a click anywhere outside them, and on Esc. Opening one closes the others.
  useEffect(() => {
    if (!filterOpen && manageOpenFor === null) return;
    function onPointerDown(event: MouseEvent) {
      const inside = (event.target as Element | null)?.closest("[data-members-menu]")?.getAttribute("data-members-menu");
      if (inside !== "filter") setFilterOpen(false);
      if (inside !== manageOpenFor) setManageOpenFor(null);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setFilterOpen(false);
      setManageOpenFor(null);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [filterOpen, manageOpenFor]);

  function load() {
    return Promise.all([
      fetch("/api/team-members", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/invitations", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/billing/status", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
      fetch("/api/account", { cache: "no-store" }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
    ]).then(([membersData, invitesData, statusData, accountData]: [{ members?: SeatMember[] } | null, { invitations?: PendingInvitation[] } | null, { entitlement?: Entitlement } | null, { account?: { id?: string } } | null]) => {
      setMembers(membersData?.members ?? []);
      setInvitations((invitesData?.invitations ?? []).filter((invite) => !invite.expired));
      setEntitlement(statusData?.entitlement ?? null);
      setMyId(accountData?.account?.id ?? null);
    });
  }
  useEffect(() => { void load().finally(() => setLoading(false)); }, []);

  // Seats are unlimited on every plan and are not sold, so there is no ceiling to count against.
  const seatsUsed = members.length + invitations.length;
  const ownerCount = members.filter((m) => m.role === "owner").length;

  async function revokeInvite(invite: PendingInvitation) {
    setRowBusy(invite.id);
    try {
      await fetch("/api/invitations/revoke", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: invite.id }) });
      await load();
    } finally {
      setRowBusy(null);
      setManageOpenFor(null);
    }
  }

  async function resendInvite(invite: PendingInvitation) {
    setRowBusy(invite.id);
    setNotice(null);
    try {
      const response = await fetch("/api/invitations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ emails: [invite.email] }) });
      const data = (await response.json().catch(() => ({}))) as { invited?: string[]; skipped?: { reason: string }[]; message?: string };
      setNotice(response.ok && data.invited?.length ? { ok: true, text: `Invite sent again to ${invite.email}.` } : { ok: false, text: data.skipped?.[0]?.reason ?? data.message ?? "Could not resend the invite." });
    } finally {
      setRowBusy(null);
      setManageOpenFor(null);
    }
  }

  async function changeRole(member: SeatMember, role: "owner" | "member") {
    setRowBusy(member.id);
    setNotice(null);
    try {
      const response = await fetch("/api/organizations/members/role", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: member.id, role }) });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) setNotice({ ok: false, text: data.message ?? "Could not change that member's role." });
      await load();
    } finally {
      setRowBusy(null);
      setManageOpenFor(null);
    }
  }

  async function removeMember(member: SeatMember) {
    setRowBusy(member.id);
    setNotice(null);
    try {
      const response = await fetch("/api/organizations/members/remove", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ userId: member.id }) });
      const data = (await response.json().catch(() => ({}))) as { message?: string };
      if (!response.ok) setNotice({ ok: false, text: data.message ?? "Could not remove that member." });
      setSelected((current) => { const next = new Set(current); next.delete(member.id); return next; });
      await load();
    } finally {
      setRowBusy(null);
      setManageOpenFor(null);
    }
  }

  async function removeSelected() {
    const ids = [...selected];
    for (const id of ids) {
      const member = members.find((m) => m.id === id);
      if (member) await removeMember(member);
    }
    setSelected(new Set());
  }

  const term = search.trim().toLowerCase();
  const filteredMembers = members.filter((member) => {
    if (roleFilter.size > 0 && !roleFilter.has((member.role ?? "member") as MemberRoleOption)) return false;
    if (statusFilter.size > 0 && !statusFilter.has((member.presenceStatus ?? "online") as MemberStatusOption)) return false;
    if (!term) return true;
    return member.email.toLowerCase().includes(term) || (member.name ?? "").toLowerCase().includes(term);
  });
  // A pending invite is a "member" who is "pending", so it only shows when both groups allow that.
  const invitesAllowed = (roleFilter.size === 0 || roleFilter.has("member")) && (statusFilter.size === 0 || statusFilter.has("pending"));
  const filteredInvites = invitesAllowed ? invitations.filter((invite) => !term || invite.email.toLowerCase().includes(term)) : [];
  const activeFilterCount = roleFilter.size + statusFilter.size;
  function toggleIn<T>(current: Set<T>, setter: (next: Set<T>) => void, value: T) {
    const next = new Set(current);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    setter(next);
  }
  function clearFilters() {
    setRoleFilter(new Set());
    setStatusFilter(new Set());
  }
  const totalShown = filteredMembers.length + filteredInvites.length;

  function toggleRow(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }
  function toggleAll() {
    setSelected((current) => (current.size === filteredMembers.length ? new Set() : new Set(filteredMembers.map((m) => m.id))));
  }

  const smallBtn = "inline-flex h-9 items-center gap-1.5 rounded-full border border-[var(--b-border)] px-4 text-[12.5px] font-medium transition hover:bg-[var(--b-surface-2)] disabled:opacity-50";
  const cellClass = "min-w-0 text-[13px]";
  // Phones get one card per person (checkbox | name and email | menu, then role, joined and status on a
  // line of their own); md and up get the full seven-column table.
  const gridCols = "grid-cols-[28px_minmax(0,1fr)_36px] md:grid-cols-[28px_1.7fr_1.6fr_1fr_1fr_0.9fr_36px]";

  return (
    <div className="billing-v2 members-v2 mx-auto w-full max-w-[1120px] px-6 pb-20 pt-4 sm:px-9 lg:px-10">
      {notice && (
        <p role={notice.ok ? "status" : "alert"} className={`mt-5 rounded-[10px] px-4 py-3 text-[13px] ${notice.ok ? "bg-[var(--b-good-bg)] text-[var(--b-good)]" : "bg-[var(--b-bad-bg)] text-[var(--b-bad)]"}`}>
          {notice.text}
          {!notice.ok && notice.text.includes("Upgrade") && <> <button type="button" onClick={() => setUpgradeOpen(true)} className="font-semibold underline underline-offset-2">See plans</button></>}
        </p>
      )}

      {/* -------------------------------------------------------- members table */}
      <section className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-[20px] font-normal tracking-[-0.03em]">Team members</h3>
            <p className="mt-0.5 text-[12.5px] text-[var(--b-muted)]">Manage your current team members and their access. {`${seatsUsed} ${seatsUsed === 1 ? "person" : "people"} so far, and seats are unlimited.`}</p>
          </div>
          <div className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-start">
            <div className="flex h-9 items-center gap-2 rounded-full border border-[var(--b-border)] px-3.5">
              <Search size={13} className="text-[var(--b-muted)]" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="w-32 bg-transparent text-[13px] outline-none placeholder:text-[var(--b-muted)] sm:w-44" />
            </div>
            <div className="relative" data-members-menu="filter">
              <button type="button" onClick={() => setFilterOpen((open) => !open)} aria-expanded={filterOpen} className={`${smallBtn} cursor-pointer`}>
                <Filter size={13} /> Filter
                {activeFilterCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-[var(--b-ink)] text-[11px] font-semibold leading-none text-[var(--b-ink-text)]">{activeFilterCount}</span>}
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-11 z-30 w-[230px] rounded-xl border border-[var(--b-border)] bg-[var(--b-surface)] p-3 shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--b-muted)]">Role</p>
                  <div className="mt-1.5 flex flex-col gap-0.5">
                    {MEMBER_ROLE_OPTIONS.map(([value, label]) => (
                      <button key={value} type="button" role="checkbox" aria-checked={roleFilter.has(value)} onClick={() => toggleIn(roleFilter, setRoleFilter, value)} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition hover:bg-[var(--b-surface-2)]">
                        <span className={`flex size-4 shrink-0 items-center justify-center rounded border ${roleFilter.has(value) ? "border-[var(--b-text)] bg-[var(--b-text)] text-[var(--b-surface)]" : "border-[var(--b-border)]"}`}>{roleFilter.has(value) && <Check size={11} strokeWidth={3} />}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--b-muted)]">Status</p>
                  <div className="mt-1.5 flex flex-col gap-0.5">
                    {MEMBER_STATUS_OPTIONS.map(([value, label]) => (
                      <button key={value} type="button" role="checkbox" aria-checked={statusFilter.has(value)} onClick={() => toggleIn(statusFilter, setStatusFilter, value)} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] transition hover:bg-[var(--b-surface-2)]">
                        <span className={`flex size-4 shrink-0 items-center justify-center rounded border ${statusFilter.has(value) ? "border-[var(--b-text)] bg-[var(--b-text)] text-[var(--b-surface)]" : "border-[var(--b-border)]"}`}>{statusFilter.has(value) && <Check size={11} strokeWidth={3} />}</span>
                        {label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-[var(--b-border)] pt-3">
                    <button type="button" onClick={clearFilters} disabled={activeFilterCount === 0} className="cursor-pointer text-[12.5px] font-medium text-[var(--b-muted)] transition hover:text-[var(--b-text)] disabled:cursor-not-allowed disabled:opacity-40">Clear all</button>
                    <button type="button" onClick={() => setFilterOpen(false)} className="inline-flex h-8 cursor-pointer items-center rounded-full border border-[var(--b-text)] px-4 text-[12.5px] font-medium transition hover:bg-[var(--b-surface-2)]">Done</button>
                  </div>
                </div>
              )}
            </div>
            {isOwner && selected.size > 0 && (
              <button type="button" onClick={() => void removeSelected()} className={`${smallBtn} text-[var(--b-bad)]`}><Trash2 size={13} /> Remove selected ({selected.size})</button>
            )}
            {isOwner && (
              <button type="button" onClick={() => setInviteOpen(true)} className="inline-flex h-9 items-center gap-2 rounded-full bg-[var(--b-ink)] px-4 text-[13px] font-medium text-[var(--b-ink-text)] transition hover:opacity-85">
                <UserPlus size={13} /> Invite member
              </button>
            )}
          </div>
        </div>

        {activeFilterCount > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {[...roleFilter].map((value) => (
              <span key={`role-${value}`} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--b-border)] py-1 pl-3 pr-1.5 text-[12.5px]">
                <span className="text-[var(--b-muted)]">Role:</span> {MEMBER_ROLE_OPTIONS.find(([key]) => key === value)?.[1]}
                <button type="button" onClick={() => toggleIn(roleFilter, setRoleFilter, value)} aria-label={`Remove ${value} filter`} className="flex size-5 cursor-pointer items-center justify-center rounded-full text-[var(--b-muted)] transition hover:bg-[var(--b-surface-2)] hover:text-[var(--b-text)]"><X size={12} /></button>
              </span>
            ))}
            {[...statusFilter].map((value) => (
              <span key={`status-${value}`} className="inline-flex items-center gap-1.5 rounded-full border border-[var(--b-border)] py-1 pl-3 pr-1.5 text-[12.5px]">
                <span className="text-[var(--b-muted)]">Status:</span> {MEMBER_STATUS_OPTIONS.find(([key]) => key === value)?.[1]}
                <button type="button" onClick={() => toggleIn(statusFilter, setStatusFilter, value)} aria-label={`Remove ${value} filter`} className="flex size-5 cursor-pointer items-center justify-center rounded-full text-[var(--b-muted)] transition hover:bg-[var(--b-surface-2)] hover:text-[var(--b-text)]"><X size={12} /></button>
              </span>
            ))}
            <button type="button" onClick={clearFilters} className="inline-flex cursor-pointer items-center gap-1 px-1 text-[12.5px] font-medium text-[var(--b-muted)] underline-offset-2 transition hover:text-[var(--b-text)] hover:underline"><X size={12} /> Clear filters</button>
          </div>
        )}

        <div className="mt-4 overflow-hidden rounded-[10px] border border-[var(--b-border)]">
          <div className="overflow-x-auto">
            <div className="md:min-w-[760px]">
              <div className={`hidden md:grid ${gridCols} items-center gap-3 border-b border-[var(--b-border)] px-5 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--b-muted)]`}>
                <input type="checkbox" checked={filteredMembers.length > 0 && selected.size === filteredMembers.length} onChange={toggleAll} disabled={!isOwner || filteredMembers.length === 0} className="h-4 w-4 rounded" aria-label="Select all" />
                <span>Team member</span>
                <span>Email</span>
                <span>Role</span>
                <span>Joined</span>
                <span>Status</span>
                <span />
              </div>

              {loading ? (
                <SkeletonRows rows={4} className="px-5 py-5" />
              ) : totalShown === 0 ? (
                <div className="px-5 py-10 text-center text-[13px] text-[var(--b-muted)]">No members match this search or filter.</div>
              ) : (
                <div>
                  {filteredMembers.map((member) => {
                    const status = STATUS_DOT[member.presenceStatus ?? "online"] ?? STATUS_DOT.online;
                    const isSelf = member.id === myId;
                    const open = expanded.has(member.id);
                    const details = open ? "" : "max-md:hidden";
                    return (
                      <div key={member.id} className={`grid ${gridCols} items-center gap-x-3 gap-y-1.5 border-b border-[var(--b-border)] px-5 py-3 transition-colors hover:bg-[var(--b-surface-2)]`}>
                        <input type="checkbox" checked={selected.has(member.id)} onChange={() => toggleRow(member.id)} disabled={!isOwner || isSelf} className="h-4 w-4 rounded max-md:col-start-1 max-md:row-start-1" aria-label={`Select ${member.email}`} />
                        <div
                          role="button"
                          tabIndex={0}
                          aria-expanded={open}
                          onClick={() => toggleExpanded(member.id)}
                          onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleExpanded(member.id); } }}
                          className={`flex items-center gap-2.5 ${cellClass} max-md:col-start-2 max-md:row-start-1 max-md:cursor-pointer`}
                        >
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--b-surface-2)] text-[12px] font-semibold">
                            {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" /> : memberInitial(member)}
                          </span>
                          <span className="truncate font-medium text-[var(--b-text)]">{member.name?.trim() || member.email}{isSelf ? " (you)" : ""}</span>
                          <span className={`h-2 w-2 shrink-0 rounded-full md:hidden ${status.dot}`} aria-hidden="true" />
                          <ChevronDown size={14} className={`ml-auto shrink-0 text-[var(--b-muted)] transition-transform md:hidden ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                        </div>
                        <span className={`${cellClass} truncate text-[var(--b-muted)] max-md:col-start-2 max-md:row-start-2 ${details}`}>{member.email}</span>
                        <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 max-md:col-start-2 max-md:col-end-4 max-md:row-start-3 md:contents ${details}`}>
                        <span className={cellClass}>
                          {member.role === "owner" ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[var(--b-good-bg)] px-2.5 py-0.5 text-[11px] font-medium text-[var(--b-good)]">Owner</span>
                          ) : (
                            <span className="text-[var(--b-muted)]">Member</span>
                          )}
                          {member.teams?.length ? <span className="ml-1.5 text-[12px] text-[var(--b-muted)]" title="Teams">· {member.teams.map((team) => team.name).join(", ")}</span> : null}
                        </span>
                        <span className={`${cellClass} text-[var(--b-muted)]`}>{member.joinedAt ? new Date(member.joinedAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "—"}</span>
                        <span className="flex items-center gap-1.5 text-[12.5px]"><span className={`h-2 w-2 rounded-full ${status.dot}`} />{status.label}</span>
                        </div>
                        <div data-members-menu={member.id} className="relative flex justify-end max-md:col-start-3 max-md:row-start-1">
                          {isOwner && !isSelf && (
                            <button type="button" onClick={() => setManageOpenFor(manageOpenFor === member.id ? null : member.id)} className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[var(--b-surface-2)]" aria-label={`Manage ${member.email}`}>
                              {rowBusy === member.id ? <LoaderCircle size={14} className="animate-spin" /> : <MoreHorizontal size={16} />}
                            </button>
                          )}
                          {manageOpenFor === member.id && (
                            <div className="absolute right-0 top-9 z-30 w-[200px] rounded-xl border border-[var(--b-border)] bg-[var(--b-surface)] p-1.5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                              {member.role === "owner" ? (
                                <button type="button" disabled={ownerCount <= 1} onClick={() => void changeRole(member, "member")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition hover:bg-[var(--b-surface-2)] disabled:opacity-40" title={ownerCount <= 1 ? "A workspace needs at least one owner" : undefined}>
                                  <ShieldOff size={14} /> Make member
                                </button>
                              ) : (
                                <button type="button" onClick={() => void changeRole(member, "owner")} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition hover:bg-[var(--b-surface-2)]">
                                  <ShieldCheck size={14} /> Make owner
                                </button>
                              )}
                              <button type="button" disabled={member.role === "owner" && ownerCount <= 1} onClick={() => void removeMember(member)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[var(--b-bad)] transition hover:bg-[var(--b-bad-bg)] disabled:opacity-40" title={member.role === "owner" && ownerCount <= 1 ? "The last owner can't be removed" : undefined}>
                                <UserMinus size={14} /> Remove from workspace
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredInvites.map((invite) => {
                    const open = expanded.has(invite.id);
                    const details = open ? "" : "max-md:hidden";
                    return (
                    <div key={invite.id} className={`grid ${gridCols} items-center gap-x-3 gap-y-1.5 border-b border-[var(--b-border)] px-5 py-3 opacity-90`}>
                      <span className="max-md:col-start-1 max-md:row-start-1" />
                      <div
                        role="button"
                        tabIndex={0}
                        aria-expanded={open}
                        onClick={() => toggleExpanded(invite.id)}
                        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggleExpanded(invite.id); } }}
                        className={`flex items-center gap-2.5 ${cellClass} max-md:col-start-2 max-md:row-start-1 max-md:cursor-pointer`}
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-dashed border-[var(--b-border)] text-[var(--b-muted)]"><Mail size={14} /></span>
                        <span className="truncate font-medium text-[var(--b-muted)]">Invited</span>
                        <ChevronDown size={14} className={`ml-auto shrink-0 text-[var(--b-muted)] transition-transform md:hidden ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                      </div>
                      <span className={`${cellClass} truncate text-[var(--b-muted)] max-md:col-start-2 max-md:row-start-2`}>{invite.email}</span>
                      <div className={`flex flex-wrap items-center gap-x-4 gap-y-1 max-md:col-start-2 max-md:col-end-4 max-md:row-start-3 md:contents ${details}`}>
                      <span className={`${cellClass} text-[var(--b-muted)]`}>Member</span>
                      <span className={`${cellClass} text-[var(--b-muted)]`}>—</span>
                      <span className="flex items-center gap-1.5 text-[12.5px] text-[var(--b-muted)]"><span className="h-2 w-2 rounded-full bg-[var(--b-track)]" />Pending</span>
                      </div>
                      <div data-members-menu={invite.id} className="relative flex justify-end max-md:col-start-3 max-md:row-start-1">
                        {isOwner && (
                          <button type="button" onClick={() => setManageOpenFor(manageOpenFor === invite.id ? null : invite.id)} className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[var(--b-surface-2)]" aria-label={`Manage invite to ${invite.email}`}>
                            {rowBusy === invite.id ? <LoaderCircle size={14} className="animate-spin" /> : <MoreHorizontal size={16} />}
                          </button>
                        )}
                        {manageOpenFor === invite.id && (
                          <div className="absolute right-0 top-9 z-30 w-[160px] rounded-xl border border-[var(--b-border)] bg-[var(--b-surface)] p-1.5 text-left shadow-[0_18px_45px_rgba(15,23,42,0.16)]">
                            <button type="button" onClick={() => void resendInvite(invite)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] transition hover:bg-[var(--b-surface-2)]"><RefreshCw size={14} /> Resend</button>
                            <button type="button" onClick={() => void revokeInvite(invite)} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-[var(--b-bad)] transition hover:bg-[var(--b-bad-bg)]"><X size={14} /> Revoke</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );})}

                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <TeamsSection members={members} isOwner={isOwner} onChanged={() => void load()} />

      <InvitePeopleDialog open={inviteOpen} onClose={() => setInviteOpen(false)} onInvited={() => void load()} />
      <UpgradeDialog open={upgradeOpen} onClose={() => { setUpgradeOpen(false); void load(); }} />
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
    <div className="billing-v2 plan-picker w-full px-7 pb-16 pt-4 sm:px-10">
      <header className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <h2 className="text-[30px] font-normal tracking-[-0.04em]">Choose your plan</h2>
          <p className="mt-1.5 max-w-xl text-[14px] leading-6 text-[var(--b-muted)]">Upgrade as your team grows. Change or cancel your plan anytime from Billing.</p>
        </div>
        <div className="flex rounded-full border border-[var(--b-border)] p-1" role="group" aria-label="Billing cadence">
          {(["monthly", "annual"] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setCadence(option)}
              aria-pressed={cadence === option}
              className={`plan-picker-cadence inline-flex h-9 cursor-pointer items-center gap-2 rounded-full px-4 text-[13px] font-medium capitalize transition ${cadence === option ? "plan-picker-cadence-on bg-[var(--b-ink)] text-[var(--b-ink-text)]" : "text-[var(--b-muted)] hover:text-[var(--b-text)]"}`}
            >
              {option}
              {option === "annual" && <span className="plan-picker-recommended rounded-full bg-gradient-to-r from-[#6466E9] via-[#CB548A] to-[#C25D08] px-2 py-0.5 text-[11px] font-semibold normal-case leading-none text-white">Save {ANNUAL_SAVING_PERCENT}%</span>}
            </button>
          ))}
        </div>
      </header>

      {checkoutError && <div role="alert" className="mt-5 rounded-[10px] bg-[var(--b-bad-bg)] px-4 py-3 text-[13px] text-[var(--b-bad)]">{checkoutError}</div>}

      {/* The /pricing page's layout: four joined, square-cornered cards on one shared grid. */}
      <div className="mt-8 grid grid-cols-1 border-l border-t border-[var(--plan-card-line)] sm:grid-cols-2 xl:grid-cols-4">
        {pricingPlans.map((plan) => {
          const isCurrent = plan.id === currentPlanId;
          const planRank = pricingPlans.findIndex((item) => item.id === plan.id);
          const isFree = plan.id === "free";
          const cta = "flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-none border px-4 text-[15px] font-medium transition disabled:cursor-not-allowed disabled:opacity-60";
          return (
            <article key={plan.id} className="relative isolate flex flex-col overflow-hidden border-b border-r border-[var(--plan-card-line)]">
              {plan.highlighted && (
                <div aria-hidden="true" className="plan-picker-glow pointer-events-none absolute inset-x-0 top-0 -z-10 h-[300px] bg-[radial-gradient(ellipse_85%_30%_at_50%_0%,#80A7FF_0%,transparent_100%),radial-gradient(ellipse_110%_24%_at_50%_65%,#FFCB57_0%,#FFB87A_45%,transparent_100%)]" />
              )}

              <div className="px-6 pb-6 pt-7">
                <div className="flex min-h-9 items-start justify-between gap-2">
                  <h3 className={`w-fit text-[28px] font-semibold leading-none tracking-[-0.04em] ${plan.highlighted ? "" : "plan-picker-name bg-gradient-to-r from-[#6466E9] via-[#CB548A] to-[#C25D08] bg-clip-text text-transparent"}`}>{plan.name}</h3>
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--b-good-bg)] px-2.5 py-1 text-[11px] font-semibold text-[var(--b-good)]">
                      <span className="size-1.5 rounded-full bg-[var(--b-good)]" aria-hidden="true" /> Current plan
                    </span>
                  ) : plan.highlighted ? (
                    <span className="plan-picker-recommended rounded-full bg-gradient-to-r from-[#6466E9] via-[#CB548A] to-[#C25D08] px-2.5 py-1 text-[11px] font-semibold text-white">Recommended</span>
                  ) : null}
                </div>

                <div className="mt-5 flex min-h-[64px] flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="text-[clamp(2.5rem,3.2vw,3.25rem)] font-semibold leading-none tracking-[-0.065em]">{getPlanPrice(plan, cadence === "annual" ? "yearly" : "monthly")}</span>
                  <div className="text-[13px] leading-5 text-[var(--b-muted)]">
                    <span className="block">{isFree ? "Free forever" : "per workspace / month"}</span>
                    <span className="block">{isFree ? "No card required" : `billed ${cadence === "annual" ? "annually" : "monthly"}`}</span>
                  </div>
                </div>
                <p className="mt-2 min-h-5 text-[13px] text-[var(--b-muted)]">
                  {isFree ? `${plan.resolutions} AI messages every month` : cadence === "annual" ? `${getAnnualTotal(plan)} per year · save ${ANNUAL_SAVING_PERCENT}%` : "Monthly billing, per workspace"}
                </p>

                <div className="mt-6">
                  {isCurrent ? (
                    <button type="button" disabled className={`${cta} border-[var(--b-border)] text-[var(--b-muted)]`}>Current plan</button>
                  ) : isFree ? (
                    // Moving back to Free is a cancellation, not a checkout: there is nothing to charge for, so it goes
                    // through the billing page's cancel flow rather than Razorpay.
                    <Link href="/dashboard/settings/billing" className={`${cta} border-[var(--plan-line)] hover:bg-[var(--b-surface-2)]`}>
                      Downgrade to Free <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={checkoutPlan !== null}
                      onClick={() => void startCheckout(plan.id)}
                      className={`plan-picker-cta ${cta} ${plan.highlighted ? "plan-picker-cta-primary border-transparent bg-[var(--b-ink)] text-[var(--b-ink-text)] hover:opacity-85" : "border-[var(--plan-line)] hover:bg-[var(--b-surface-2)]"}`}
                    >
                      {checkoutPlan === plan.id ? (
                        <><LoaderCircle size={15} className="animate-spin" /> Opening checkout</>
                      ) : (
                        <>{currentRank > -1 && planRank < currentRank ? "Switch to" : "Upgrade to"} {plan.name} <ArrowRight size={14} /></>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className={`flex flex-1 flex-col px-6 pb-7 pt-7 ${plan.highlighted ? "" : "border-t border-[var(--b-border)]"}`}>
                <ul className="space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-[15px] leading-6 tracking-[-0.015em]">
                      <Check size={16} strokeWidth={2.2} className="mt-1 shrink-0" /> <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/contact" className="mt-auto w-fit pt-8 text-[13px] text-[var(--b-muted)] transition hover:text-[var(--b-text)] hover:underline">Need higher limits?</Link>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[14px] border border-[var(--b-border)] px-6 py-5">
        <div>
          <p className="text-[15px] font-medium">Need a custom plan?</p>
          <p className="mt-1 text-[14px] text-[var(--b-muted)]">Talk to us about custom seats, security, and support.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/pricing" className="inline-flex h-10 items-center rounded-full px-4 text-[13px] font-medium text-[var(--b-muted)] transition hover:text-[var(--b-text)]">Compare details</Link>
          <Link href="/contact" className="inline-flex h-10 items-center rounded-full border border-[var(--b-text)] px-5 text-[13px] font-medium transition hover:bg-[var(--b-surface-2)]">Contact sales</Link>
        </div>
      </div>
    </div>
  );
}

type BillingInvoice = { id?: string; date?: string; amount?: string | number; status?: string; url?: string };

// Mirrors the entitlement shape returned by /api/billing/status. `resolutionsRemaining` moves only when the AI
// answers. Seats are unlimited on every plan and are not sold, so `seatsAllowed` is a ceiling nobody reaches.
type Entitlement = {
  planId: string;
  planName: string;
  status: string;
  /** The plan's own price per month, in the smallest currency unit. */
  effectiveMonthlyMinor?: number;
  seatsAllowed: number;
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
  /** Razorpay's payment id, for quoting in a support request. */
  providerPaymentId?: string;
  providerOrderId?: string | null;
  /** What was bought, taken from the checkout notes. */
  details?: { planId?: string; cadence?: string; seats?: string };
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

const PAYMENT_STATUS_LABEL: Record<string, string> = { captured: "Paid", failed: "Failed", refunded: "Refunded" };

// What a charge was for, in a few words.
function paymentTitle(payment: BillingPayment): string {
  if (payment.kind === "seats") {
    const seats = Number(payment.details?.seats);
    return seats > 0 ? `${seats} extra seats` : "Extra seats";
  }
  if (payment.kind === "overage") return "AI overage";
  const planName = pricingPlans.find((item) => item.id === payment.details?.planId)?.name;
  return planName ? `${planName} plan` : "Subscription";
}

// One label/value line in the payment detail panel, with an optional copy button for ids.
function PaymentDetailRow({ label, value, mono, copyable }: { label: string; value: string; mono?: boolean; copyable?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-start justify-between gap-6 border-b border-[var(--b-border)] py-3 text-[13px]">
      <dt className="shrink-0 text-[var(--b-muted)]">{label}</dt>
      <dd className="flex min-w-0 items-center justify-end gap-2 text-right">
        <span className={`min-w-0 break-all ${mono ? "font-mono text-[12px]" : ""}`}>{value}</span>
        {copyable && (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard?.writeText(value).then(() => {
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1500);
              });
            }}
            className="shrink-0 text-[11.5px] text-[var(--b-muted)] underline underline-offset-2 transition hover:text-[var(--b-text)]"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </dd>
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
  const [tab, setTab] = useState<"overview" | "method" | "history">("overview");
  const [selectedPayment, setSelectedPayment] = useState<BillingPayment | null>(null);
  // A seat is held by a member or by a pending invite, the same rule the backend applies when inviting.
  const [seatsInUse, setSeatsInUse] = useState<{ members: number; pending: number } | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelNotice, setCancelNotice] = useState<string | null>(null);
  const [upgradeOpen, setUpgradeOpen] = useUpgradeDialog();

  function loadStatus() {
    return fetch("/api/billing/status")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: BillingStatus) => setBilling(data))
      .catch(() => setLoadError(true));
  }

  useEffect(() => {
    void loadStatus().finally(() => setLoading(false));
    Promise.all([
      fetch("/api/team-members").then((response) => (response.ok ? response.json() : null)),
      fetch("/api/invitations").then((response) => (response.ok ? response.json() : null)),
    ])
      .then(([membersData, invitationsData]: [{ members?: unknown[] } | null, { invitations?: unknown[] } | null]) => {
        if (!membersData) return;
        setSeatsInUse({ members: membersData.members?.length ?? 0, pending: invitationsData?.invitations?.length ?? 0 });
      })
      .catch(() => undefined);
    fetch("/api/billing/payments?limit=100")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { payments?: BillingPayment[] } | null) => setPayments(data?.payments ?? []))
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedPayment) return;
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setSelectedPayment(null); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedPayment]);

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
  const renewAt = entitlement ? (periodEnd ? new Date(periodEnd) : nextAllowanceReset(entitlement)) : null;
  const messagesUsed = entitlement?.resolutionsUsed ?? 0;
  const messagesTotal = entitlement?.resolutionsIncluded ?? 0;
  const messagesPercent = messagesTotal > 0 ? Math.min(100, (messagesUsed / messagesTotal) * 100) : 0;
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
  const primaryBtn = "inline-flex h-10 items-center gap-2 rounded-full bg-[var(--b-ink)] px-5 text-[13px] font-medium text-[var(--b-ink-text)] transition hover:opacity-85";
  const ghostBtn = "inline-flex h-10 items-center gap-2 rounded-full border border-[var(--b-border)] px-4 text-[13px] font-medium text-[var(--b-text)] transition hover:bg-[var(--b-surface-2)]";

  const rowClass = "flex items-center justify-between gap-4 border-t border-[var(--b-border)] px-5 py-4 first:border-t-0";
  const linkClass = "inline-flex shrink-0 cursor-pointer items-center gap-1 text-[13px] font-medium underline-offset-2 hover:underline";
  const methodSummary = paymentMethod?.last4 ? `${paymentMethod.brand ?? "Card"} •••• ${paymentMethod.last4}` : "None saved";
  const nextLabel = cancelling ? "Plan ends" : isFree ? "AI messages reset" : "Next payment";
  const nextValue = entitlement?.pendingPlanId
    ? "Finishing your plan change"
    : renewLabel
      ? !isFree && !cancelling && planMinor > 0 ? `${renewLabel} · ${formatMoney(planMinor, currencyCode)}` : renewLabel
      : "Monthly";
  const tabs = [["overview", "Overview"], ["method", "Payment method"], ["history", "Payment history"]] as const;

  return (
    <div className="billing-v2 billing-page w-full px-4 pb-20 pt-6 sm:px-6">
      <header>
        <h2 className="text-[30px] font-normal tracking-[-0.04em]">Billing</h2>
        <p className="billing-lede mt-1.5 max-w-xl text-[14px] leading-6 text-[var(--b-muted)]">Your plan, what&apos;s included, and how you pay.</p>
      </header>

      <div role="tablist" aria-label="Billing sections" className="mt-5 flex gap-6 overflow-x-auto border-b border-[var(--b-border)] [scrollbar-width:none]">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`-mb-px inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 border-b-2 text-[14px] font-medium transition ${tab === id ? "border-[var(--b-ink)] text-[var(--b-text)]" : "border-transparent text-[var(--b-muted)] hover:text-[var(--b-text)]"}`}
          >
            {label}
            {id === "history" && payments.length > 0 && <span className="rounded-full bg-[var(--b-surface-2)] px-1.5 py-0.5 text-[10.5px] leading-none text-[var(--b-muted)]">{payments.length}</span>}
          </button>
        ))}
      </div>

      {loading && (
        <div role="status" aria-busy="true" aria-label="Loading billing" className="mt-6 space-y-4">
          <Bone className="h-9 w-48" />
          <div className="elpino-skel-card p-5"><SkeletonRows rows={4} /></div>
        </div>
      )}
      {loadError && !loading && (
        <div className="mt-6 rounded-[10px] bg-[var(--b-bad-bg)] px-5 py-4 text-[13px] text-[var(--b-bad)]">Billing information could not be loaded. You can still change your plan from the Overview tab.</div>
      )}
      {cancelNotice && <div role="status" className="mt-6 rounded-[10px] bg-[var(--b-good-bg)] px-5 py-4 text-[13px] text-[var(--b-good)]">{cancelNotice}</div>}
      {!loading && billedInOtherCurrency && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-[var(--b-info-bg)] px-5 py-4 text-[13px] text-[var(--b-info)]">
          <p>This subscription was started in {currencyCode}, so it is still charged as {formatMoney(planMinor, currencyCode)} a month. Plans and top-ups are now priced in dollars, and changing your plan moves you to dollar billing.</p>
          <button type="button" onClick={() => setUpgradeOpen(true)} className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-lg border border-current px-3 text-[12px] font-semibold">Switch to dollars <ArrowRight size={13} /></button>
        </div>
      )}

      {/* ------------------------------------------------------------------- overview */}
      {!loading && tab === "overview" && (
        <section className="mt-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-[28px] font-normal leading-none tracking-[-0.03em]">{plan.name}</h3>
                <span className={`rounded-full px-2.5 py-1 text-[11.5px] font-semibold ${tone[statusPill.tone]}`}>{statusPill.label}</span>
              </div>
              <p className="mt-2 text-[14px] text-[var(--b-muted)]">
                <span className="font-medium tabular-nums text-[var(--b-text)]">{priceMain}</span> {isFree ? "forever" : cadence === "annual" ? "/ month, billed yearly" : "/ month"}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={() => setUpgradeOpen(true)} className={primaryBtn}>{isFree ? <><Rocket size={14} /> Upgrade plan</> : <>Change plan <ArrowRight size={14} /></>}</button>
              {!isFree && !cancelling && <button type="button" onClick={() => setCancelOpen(true)} className="h-10 cursor-pointer rounded-full px-3 text-[13px] font-medium text-[var(--b-muted)] transition hover:bg-[var(--b-surface-2)] hover:text-[var(--b-text)]">Cancel plan</button>}
            </div>
          </div>

          {cancelling && (
            <p className="mt-5 rounded-[10px] bg-[var(--b-warn-bg)] px-4 py-3 text-[13px] text-[var(--b-warn)]">This plan is cancelled. It keeps working until {renewLabel ?? "the end of the period"}, then your workspace moves to Free.</p>
          )}

          <div className="mt-6 overflow-hidden rounded-[10px] border border-[var(--b-border)]">
            <div className={rowClass}>
              <span className="text-[14px] text-[var(--b-muted)]">{nextLabel}</span>
              <span className="text-right text-[14px] font-medium tabular-nums">{nextValue}</span>
            </div>
            <div className={rowClass}>
              <span className="text-[14px] text-[var(--b-muted)]">{isFree ? "AI messages" : "AI credit"}</span>
              <span className="flex min-w-0 items-center gap-4">
                {isFree && <span className="hidden h-1.5 w-28 overflow-hidden rounded-full bg-[var(--b-track)] sm:block"><span className="block h-full rounded-full bg-[var(--b-info)]" style={{ width: `${messagesPercent}%` }} /></span>}
                <span className="text-[14px] font-medium tabular-nums">{isFree ? `${messagesUsed.toLocaleString()} of ${messagesTotal.toLocaleString()} used` : `${formatCents(entitlement?.aiCreditGrantUsdCents ?? 0)} every month`}</span>
                <Link href="/dashboard/settings/ai-usage" className={linkClass}>Usage <ArrowRight size={12} /></Link>
              </span>
            </div>
            <div className={rowClass}>
              <span className="text-[14px] text-[var(--b-muted)]">Seats</span>
              <span className="flex min-w-0 items-center gap-4">
                <span className="text-[14px] font-medium">Unlimited{seatsInUse ? <span className="font-normal text-[var(--b-muted)]"> · {seatsInUse.members + seatsInUse.pending} {seatsInUse.members + seatsInUse.pending === 1 ? "person" : "people"}</span> : null}</span>
                <Link href="/dashboard/settings/teams" className={linkClass}>Members <ArrowRight size={12} /></Link>
              </span>
            </div>
            <div className={rowClass}>
              <span className="text-[14px] text-[var(--b-muted)]">Payment method</span>
              <span className="flex min-w-0 items-center gap-4">
                <span className="text-[14px] font-medium">{methodSummary}</span>
                <button type="button" onClick={() => setTab("method")} className={linkClass}>{paymentMethod?.last4 ? "View" : "Details"} <ArrowRight size={12} /></button>
              </span>
            </div>
          </div>

          {isFree && (
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-dashed border-[var(--b-border)] px-5 py-4">
              <p className="text-[14px] text-[var(--b-muted)]"><span className="font-medium text-[var(--b-text)]">Outgrowing Free?</span> Paid plans swap the message limit for a monthly AI credit.</p>
              <button type="button" onClick={() => setUpgradeOpen(true)} className={ghostBtn}>See plans <ArrowRight size={14} /></button>
            </div>
          )}
        </section>
      )}

      {/* --------------------------------------------------------------- payment method */}
      {!loading && tab === "method" && (
        <section className="billing-method mt-6 w-full">
          {paymentMethod?.last4 ? (
            <div className="w-full max-w-[460px] overflow-hidden rounded-xl bg-[var(--b-ink)] p-5 text-[var(--b-ink-text)]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[12px] font-semibold uppercase tracking-[0.16em]">{paymentMethod.brand ?? "Card"}</span>
                <CreditCard size={18} />
              </div>
              <p className="mt-8 font-mono text-[18px] tracking-[0.16em]">•••• •••• •••• {paymentMethod.last4}</p>
              <div className="mt-5 flex items-end justify-between text-[12.5px]">
                <span>{paymentMethod.expiryMonth && paymentMethod.expiryYear ? `Expires ${String(paymentMethod.expiryMonth).padStart(2, "0")}/${String(paymentMethod.expiryYear).slice(-2)}` : "Saved card"}</span>
                <span className="rounded-full border border-current px-2.5 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.1em] opacity-80">Default</span>
              </div>
            </div>
          ) : (
            <div className="billing-method-empty flex flex-col items-center px-5 py-10 text-center">
              <span className="grid size-12 place-items-center rounded-full"><CreditCard size={22} /></span>
              <p className="mt-3 text-[16px] font-medium tracking-[-0.02em]">No card saved yet</p>
              <p className="mt-1 max-w-[260px] text-[13px] leading-5 text-[var(--b-muted)]">When you pay for a plan, your card will show up here.</p>
            </div>
          )}
        </section>
      )}

      {/* ------------------------------------------------------------------- history */}
      {!loading && tab === "history" && (
        <>
            <section className="billing-history-list mt-5 overflow-hidden rounded-2xl">
              {payments.length ? (
                <div>
                  <div className="hidden grid-cols-[130px_minmax(0,1fr)_90px_110px_20px] gap-4 px-6 py-2.5 text-[11.5px] font-medium text-[var(--b-muted)] sm:grid">
                    <span>Date</span><span>Description</span><span>Status</span><span className="text-right">Amount</span><span />
                  </div>
                  <ul>
                    {payments.map((payment) => (
                      <li key={payment.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedPayment(payment)}
                          className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-0.5 px-6 py-3.5 text-left text-[13.5px] transition hover:bg-[var(--b-surface-2)] sm:grid-cols-[130px_minmax(0,1fr)_90px_110px_20px]"
                        >
                          <span className="order-2 text-[12.5px] text-[var(--b-muted)] sm:order-none sm:text-[13.5px]">{new Date(payment.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</span>
                          <span className="order-1 min-w-0 truncate font-medium sm:order-none">{paymentTitle(payment)}</span>
                          <span className="order-4 text-[12.5px] text-[var(--b-muted)] sm:order-none sm:text-[13.5px]">{PAYMENT_STATUS_LABEL[payment.status] ?? payment.status}</span>
                          <span className="order-3 text-right font-medium tabular-nums sm:order-none">{formatMoney(payment.amountMinor ?? payment.amountPaise, payment.currency)}</span>
                          <ChevronRight size={15} className="hidden text-[var(--b-muted)] sm:block" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-[14px] font-medium">No payments yet</p>
                  <p className="mt-1 text-[12.5px] text-[var(--b-muted)]">When you pay for a plan, each charge shows up here.</p>
                </div>
              )}
            </section>

            {selectedPayment && (
              <div className="fixed inset-0 z-[100]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedPayment(null); }}>
                <div aria-hidden className="absolute inset-0 bg-black/30" />
                <aside role="dialog" aria-modal="true" aria-label="Payment details" className="billing-drawer absolute right-0 top-0 flex h-full w-full max-w-[440px] flex-col border-l border-[var(--b-border)] bg-[var(--b-surface)] shadow-[0_0_60px_rgba(0,0,0,0.25)]">
                  <div className="flex items-center justify-between border-b border-[var(--b-border)] px-6 py-4">
                    <p className="text-[14px] font-semibold">Payment details</p>
                    <button type="button" onClick={() => setSelectedPayment(null)} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--b-muted)] transition hover:bg-[var(--b-surface-2)] hover:text-[var(--b-text)]"><X size={16} /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <p className="text-[13px] text-[var(--b-muted)]">{paymentTitle(selectedPayment)}</p>
                    <p className="mt-1 text-[38px] font-semibold leading-none tracking-[-0.045em] tabular-nums">{formatMoney(selectedPayment.amountMinor ?? selectedPayment.amountPaise, selectedPayment.currency)}</p>
                    <p className="mt-2 text-[13px] text-[var(--b-muted)]">{PAYMENT_STATUS_LABEL[selectedPayment.status] ?? selectedPayment.status} on {new Date(selectedPayment.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })}</p>

                    <dl className="mt-7 border-t border-[var(--b-border)]">
                      <PaymentDetailRow label="Type" value={selectedPayment.kind === "seats" ? "Extra seats" : selectedPayment.kind === "overage" ? "AI overage" : "Subscription"} />
                      {selectedPayment.details?.planId && <PaymentDetailRow label="Plan" value={pricingPlans.find((item) => item.id === selectedPayment.details?.planId)?.name ?? selectedPayment.details.planId} />}
                      {selectedPayment.details?.cadence && <PaymentDetailRow label="Billing" value={selectedPayment.details.cadence === "annual" ? "Yearly" : "Monthly"} />}
                      {selectedPayment.details?.seats && <PaymentDetailRow label="Seats" value={selectedPayment.details.seats} />}
                      <PaymentDetailRow label="Status" value={PAYMENT_STATUS_LABEL[selectedPayment.status] ?? selectedPayment.status} />
                      <PaymentDetailRow label="Amount" value={formatMoney(selectedPayment.amountMinor ?? selectedPayment.amountPaise, selectedPayment.currency)} />
                      <PaymentDetailRow label="Currency" value={selectedPayment.currency} />
                      <PaymentDetailRow label="Date" value={new Date(selectedPayment.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "long", year: "numeric" })} />
                      <PaymentDetailRow label="Time" value={new Date(selectedPayment.createdAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })} />
                      {selectedPayment.providerPaymentId && <PaymentDetailRow label="Payment ID" value={selectedPayment.providerPaymentId} mono copyable />}
                      {selectedPayment.providerOrderId && <PaymentDetailRow label="Order ID" value={selectedPayment.providerOrderId} mono copyable />}
                      <PaymentDetailRow label="Reference" value={selectedPayment.id} mono copyable />
                    </dl>

                    <p className="mt-6 text-[12.5px] leading-5 text-[var(--b-muted)]">Questions about this charge? <Link href="/contact" className="underline underline-offset-2 hover:text-[var(--b-text)]">Contact us</Link> and quote the payment ID.</p>
                  </div>
                </aside>
              </div>
            )}
        </>
      )}

      {/* The same full-screen plan picker the header opens. Closing it refreshes the plan in case a checkout just finished. */}
      <UpgradeDialog open={upgradeOpen} onClose={() => { setUpgradeOpen(false); void loadStatus(); }} />

      {plan.id !== "free" && !cancelling && cancelOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !cancelBusy) setCancelOpen(false); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="cancel-plan-title" className="w-full max-w-[440px] rounded-2xl border border-white/10 bg-[#2d2d2d] p-6 text-white/90 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
            <p id="cancel-plan-title" className="text-[18px] font-medium">Cancel {plan.name}?</p>
            <p className="mt-2 text-[13px] leading-6 text-white/60">Your plan stays active until the end of the paid period. Then the workspace moves to Free with {pricingPlans[0].resolutions} AI messages a month and unlimited seats.</p>
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

const DEFAULT_GREETING = "Hi there 👋 How can I help you today?";
const GREETING_MAX_LENGTH = 300;
type AiPersona = { id: string; name: string; aiName: string; aiAvatarUrl: string | null; aiPersona: string | null; chatbotAccent: string; chatbotTheme: "light" | "dark" | "auto"; chatbotReplyLanguage: string; greetingLines: string[] };

type Account = { email: string; name: string | null; avatarUrl: string | null; emailVerified: boolean; twoFactorEnabled: boolean; hasPassword?: boolean; googleLinked?: boolean };

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

  const sectionGrid = "grid grid-cols-[310px_minmax(0,1fr)] gap-10 max-xl:grid-cols-[270px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:gap-5";
  const deleteButton = "danger-action flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-lg border px-4 text-[13px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mx-auto mt-9 w-full max-w-[1120px] px-8 sm:px-10 lg:px-12">
      {!loadingWorkspace && workspace && (
        <>
          <div className={sectionGrid}>
            <div>
              <h3 className="dashboard-settings-heading text-[17px] font-semibold">{isOwner ? "Delete workspace" : "Remove workspace"}</h3>
              <p className="dashboard-settings-subdesc mt-1 max-w-[280px] text-[15px] leading-[1.55] text-[#858585]">
                {isOwner ? "Permanently delete this workspace and everything in it." : "Leave this workspace and lose access to it."}
              </p>
            </div>
            <div className="danger-card flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4">
              <div className="min-w-0 flex-1">
                <p className="danger-title text-[14px] font-medium">{workspace.name}</p>
                <p className="danger-text mt-1 max-w-md text-[13px] leading-5">
                  {isOwner
                    ? `Permanently deletes "${workspace.name}": every conversation, customer, knowledge base article, and its subscription. This cannot be undone.`
                    : `Removes you from "${workspace.name}". Your open conversations are handed to a teammate first. You can be re-invited later.`}
                </p>
              </div>
              {isOwner ? (
                <button type="button" onClick={() => { setOpen("workspace"); setError(null); setConfirmText(""); }} className={deleteButton}>
                  <Trash2 size={14} /> Delete workspace
                </button>
              ) : (
                <button type="button" disabled={busy} onClick={() => void removeWorkspace()} className={deleteButton}>
                  {busy ? <LoaderCircle size={14} className="animate-spin" /> : <LogOut size={14} />} Remove workspace
                </button>
              )}
            </div>
          </div>

          <div className="my-7 h-px bg-[#e7e7e7]" />
        </>
      )}

      <div className={sectionGrid}>
        <div>
          <h3 className="dashboard-settings-heading text-[17px] font-semibold">Delete account</h3>
          <p className="dashboard-settings-subdesc mt-1 max-w-[280px] text-[15px] leading-[1.55] text-[#858585]">Permanently delete your own account.</p>
        </div>
        <div className="danger-card flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4">
          <div className="min-w-0 flex-1">
            <p className="danger-title text-[14px] font-medium">Your account</p>
            <p className="danger-text mt-1 max-w-md text-[13px] leading-5">Permanently deletes your account and every workspace only you own. Workspaces you share with teammates are left, not destroyed.</p>
          </div>
          <button type="button" onClick={() => void openAccountDialog()} className={deleteButton}>
            <Trash2 size={14} /> Delete account
          </button>
        </div>
      </div>

      {/* The confirmation dialog keeps the old .dashboard-danger-zone wrapper so its existing styles still apply;
          display: contents means the wrapper itself draws no box. */}
      <div className="dashboard-danger-zone contents">
        {open && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
            <div role="dialog" aria-modal="true" className="w-full max-w-[420px] overflow-hidden rounded-[24px] border border-black/10 bg-white shadow-[0_28px_80px_rgba(15,23,42,0.24)]">
              <div className="flex items-start justify-between border-b border-[#E5E9EB] px-6 py-5">
                <div>
                  <h3 className="text-[17px] font-semibold tracking-[-0.02em] text-[#8f3d45]">
                    {open === "workspace" ? `Delete "${workspace?.name}"?` : "Delete your account?"}
                  </h3>
                  <p className="mt-1 text-[13px] text-[#667069]">This cannot be undone.</p>
                </div>
                <button type="button" onClick={closeDialog} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-[#F0F2F3]"><X size={16} /></button>
              </div>

              <div className="p-6">
                {open === "account" && loadingPlan && <p className="text-[13.5px] text-[#667069]">Checking your workspaces…</p>}

                {open === "account" && !loadingPlan && plan && !plan.canDelete && (
                  <div>
                    <p className="text-[13.5px] leading-5 text-[#667069]">
                      You're the only owner of workspaces that still have other people in them. Delete these, or remove the other members, before deleting your account:
                    </p>
                    <ul className="mt-3 space-y-1.5">
                      {plan.blocked.map((item) => (
                        <li key={item.id} className="rounded-lg bg-[#FAF9F6] px-3 py-2 text-[13.5px] font-medium">{item.name}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {open === "account" && !loadingPlan && plan?.canDelete && (
                  <div className="text-[13.5px] leading-5 text-[#667069]">
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
                    <label className="block text-[12.5px] font-semibold text-[#17233A]">
                      {open === "workspace" ? `Type "${requiredText}" to confirm` : 'Type "DELETE" to confirm'}
                    </label>
                    <input
                      value={confirmText}
                      onChange={(event) => setConfirmText(event.target.value)}
                      placeholder={requiredText}
                      className="mt-2 h-11 w-full rounded-xl border border-[#DDE4E8] px-3 text-[14px] outline-none focus:border-[#A64A53] focus:ring-2 focus:ring-[#A64A53]/10"
                    />
                  </div>
                )}

                {error && <p role="alert" className="mt-3 text-[12.5px] text-[#c63f4d]">{error}</p>}

                {(open === "workspace" || (open === "account" && plan?.canDelete)) && (
                  <button
                    type="button"
                    disabled={busy || !confirmReady}
                    onClick={() => void confirmDestroy()}
                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#A64A53] text-[14px] font-semibold text-white transition hover:bg-[#8f3d45] disabled:cursor-not-allowed disabled:opacity-50"
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

type ChatbotUrlRules = UrlRules;

function RuleSection({
  title,
  description,
  placeholder,
  paths,
  loading,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  placeholder: string;
  paths: string[];
  loading: boolean;
  onAdd: (path: string) => void;
  onRemove: (path: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const dialogId = useId();

  function close() {
    setAdding(false);
    setDraft("");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const path = normalizePath(draft);
    if (!path) return;
    onAdd(path);
    close();
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[17px] font-medium tracking-[-0.02em]">{title}</h3>
          <p className="mt-1 max-w-xl text-[14px] leading-6 text-[var(--b-muted)]">{description}</p>
        </div>
        {!adding && (
          <button type="button" onClick={() => setAdding(true)} className="inline-flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[var(--b-text)] px-4 text-[13px] font-medium transition hover:bg-[var(--b-surface-2)]">
            <Plus size={14} /> Add page
          </button>
        )}
      </div>

      {adding && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) close(); }}
        >
          <form
            onSubmit={submit}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            onKeyDown={(event) => { if (event.key === "Escape") close(); }}
            className="w-full max-w-[440px] rounded-[18px] border border-[var(--b-border)] bg-[var(--b-surface)] p-6 text-[var(--b-text)] shadow-[0_28px_80px_rgba(0,0,0,0.35)]"
          >
            <div className="flex items-start justify-between gap-4">
              <h3 id={`${dialogId}-title`} className="text-[18px] font-medium tracking-[-0.02em]">{title}</h3>
              <button type="button" onClick={close} aria-label="Close" className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--b-muted)] transition hover:bg-[var(--b-surface-2)] hover:text-[var(--b-text)]">
                <X size={16} />
              </button>
            </div>
            <p className="mt-2 text-[14px] leading-6 text-[var(--b-muted)]">
              Choose which pages show the chat widget. Use <code className="font-mono text-[13px] text-[var(--b-text)]">/docs/*</code> to match a page and everything under it.
            </p>
            <input
              autoFocus
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={placeholder}
              aria-label="Page path"
              className="rule-input mt-5 h-11 w-full rounded-full border border-[var(--b-border)] bg-transparent px-4 font-mono text-[13.5px] outline-none placeholder:font-sans placeholder:text-[var(--b-muted)] focus:border-[var(--b-text)]"
            />
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={close} className="inline-flex h-10 cursor-pointer items-center rounded-full px-4 text-[13px] text-[var(--b-muted)] transition hover:text-[var(--b-text)]">Cancel</button>
              <button type="submit" disabled={!draft.trim()} className="inline-flex h-10 cursor-pointer items-center rounded-full border border-[var(--b-text)] px-5 text-[13px] font-medium transition hover:bg-[var(--b-surface-2)] disabled:cursor-not-allowed disabled:opacity-40">Add page</button>
            </div>
          </form>
        </div>
      )}

      <div className="mt-4">
        {loading ? (
          <div className="h-12 animate-pulse rounded-[10px] bg-[var(--b-surface-2)]" />
        ) : paths.length ? (
          <ul className="overflow-hidden rounded-[10px] border border-[var(--b-border)]">
            {paths.map((path) => (
              <li key={path} className="flex items-center justify-between gap-3 border-t border-[var(--b-border)] px-4 py-2.5 first:border-t-0 hover:bg-[var(--b-surface-2)]">
                <span className="min-w-0 truncate font-mono text-[13.5px]">{path}</span>
                <button type="button" onClick={() => onRemove(path)} aria-label={`Remove ${path}`} title="Remove" className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-[var(--b-muted)] transition hover:bg-[var(--b-bad-bg)] hover:text-[var(--b-bad)]">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-[10px] border border-dashed border-[var(--b-border)] px-4 py-3.5 text-[14px] text-[var(--b-muted)]">No pages added.</p>
        )}
      </div>
    </section>
  );
}

function ChatbotUrlRestrictionsSettingsPage() {
  const [rules, setRules] = useState<ChatbotUrlRules>({ show: [], hide: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setSaved(false);
    setError(null);
    const response = await fetch("/api/workspace/chatbot-restrictions", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(next),
    }).catch(() => null);
    const data = response ? ((await response.json().catch(() => ({}))) as { rules?: ChatbotUrlRules; message?: string }) : {};
    if (!response?.ok) {
      setError(data.message ?? "Could not save. Try again.");
    } else {
      if (data.rules) setRules(data.rules);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  }

  const addPath = (list: "show" | "hide") => (path: string) => void save({ ...rules, [list]: Array.from(new Set([...rules[list], path])) });
  const removePath = (list: "show" | "hide") => (path: string) => void save({ ...rules, [list]: rules[list].filter((item) => item !== path) });

  return (
    <div className="billing-v2 members-v2 mx-auto w-full max-w-[1120px] px-6 pb-20 pt-6 sm:px-9 lg:px-10">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-[30px] font-normal tracking-[-0.04em]">Restrictions</h2>
        <p aria-live="polite" className="flex h-6 items-center gap-1.5 text-[13px] text-[var(--b-muted)]">
          {saving ? <><LoaderCircle size={13} className="animate-spin" /> Saving…</> : saved ? <span className="flex items-center gap-1.5 text-[var(--b-good)]"><Check size={14} /> Saved</span> : null}
        </p>
      </header>

      {error && <p role="alert" className="mt-5 rounded-[10px] bg-[var(--b-bad-bg)] px-4 py-3 text-[13.5px] font-medium text-[var(--b-bad)]">{error}</p>}

      <div className="mt-7">
        <RuleSection
          title="Show only on these pages"
          description="Leave empty to show the widget on every page."
          placeholder="/pricing"
          paths={rules.show}
          loading={loading}
          onAdd={addPath("show")}
          onRemove={removePath("show")}
        />

        <div className="my-8 h-px bg-[var(--b-border)]" />

        <RuleSection
          title="Hide on these pages"
          description="The widget never shows on these pages, even if a show rule also matches."
          placeholder="/checkout/*"
          paths={rules.hide}
          loading={loading}
          onAdd={addPath("hide")}
          onRemove={removePath("hide")}
        />
      </div>
    </div>
  );
}

type CompanyInfo = {
  domain: string | null;
  createdAt: string;
  logoUrl: string | null;
  workspaceType: string | null;
  industry: string | null;
  teamSize: string | null;
  about: string | null;
};
type ConnectedSite = { id: string; name: string | null; domain: string; status: "verified" | "unverified"; createdAt: string; lastUsedAt?: string };

// Mirrors companies/workspace-profile.ts in workspace-service, which refuses anything not on these lists.
const WORKSPACE_TYPES = ["Company", "Agency", "Freelancer", "Nonprofit", "Education", "Other"];
const WORKSPACE_INDUSTRIES = ["E-commerce", "Software / SaaS", "Education", "Healthcare", "Finance", "Travel & hospitality", "Media & entertainment", "Real estate", "Professional services", "Other"];
const WORKSPACE_TEAM_SIZES = ["Just me", "2-10", "11-50", "51-200", "201+"];
const ABOUT_MAX_CHARS = 1000;

type ProfileDraft = { workspaceType: string; industry: string; teamSize: string; about: string };
const profileFrom = (info: CompanyInfo | null): ProfileDraft => ({
  workspaceType: info?.workspaceType ?? "",
  industry: info?.industry ?? "",
  teamSize: info?.teamSize ?? "",
  about: info?.about ?? "",
});

const infoInputClass = "h-11 w-full rounded-xl border border-[#d3d3d3] bg-white px-3 text-[13px] outline-none transition focus:border-[#777] focus:ring-1 focus:ring-[#777]/10";

function WorkspaceInformationSettingsPage() {
  const { workspace, loading } = useCurrentWorkspace();
  const [info, setInfo] = useState<CompanyInfo | null>(null);
  const [sites, setSites] = useState<ConnectedSite[] | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProfileDraft>(profileFrom(null));
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/workspace/company-info", { cache: "no-store" }).then((response) => (response.ok ? (response.json() as Promise<CompanyInfo>) : null)).catch(() => null),
      fetch("/api/workspace/sites", { cache: "no-store" }).then((response) => (response.ok ? response.json() : null)).catch(() => null),
    ]).then(([company, siteData]: [CompanyInfo | null, { sites?: ConnectedSite[] } | null]) => {
      setInfo(company);
      setDraft(profileFrom(company));
      setSites(siteData?.sites ?? []);
      setInfoLoading(false);
    });
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

  function change(field: keyof ProfileDraft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  const saved_ = profileFrom(info);
  const dirty = (Object.keys(draft) as (keyof ProfileDraft)[]).some((key) => draft[key] !== saved_[key]);

  async function saveProfile() {
    setSaving(true);
    setError(null);
    const response = await fetch("/api/workspace/company-info", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ profile: draft }),
    }).catch(() => null);
    const data = response ? ((await response.json().catch(() => ({}))) as Partial<CompanyInfo> & { message?: string }) : {};
    if (!response?.ok) {
      setError(data.message ?? "Could not save. Try again.");
    } else {
      setInfo((current) => (current ? { ...current, workspaceType: data.workspaceType ?? null, industry: data.industry ?? null, teamSize: data.teamSize ?? null, about: data.about ?? null } : current));
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2200);
    }
    setSaving(false);
  }

  function copyId() {
    if (!workspace) return;
    void navigator.clipboard?.writeText(workspace.id).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  }

  const createdLabel = info?.createdAt ? new Date(info.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }) : "—";
  const sectionGrid = "grid grid-cols-[310px_minmax(0,1fr)] gap-10 max-xl:grid-cols-[270px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:gap-5";
  const canEdit = workspace?.role === "owner";

  return (
    <>
      <div className="mx-auto w-full max-w-[1120px] px-8 pb-6 pt-9 sm:px-10 lg:px-12">
        <h2 className="text-[26px] font-semibold tracking-[-0.025em] text-[#121315]">Workspace information</h2>

        {/* ------------------------------------------------------------ identity */}
        <div className={`mt-9 ${sectionGrid}`}>
          <div>
            <h3 className="dashboard-settings-heading text-base font-semibold">Workspace</h3>
            <p className="dashboard-settings-subdesc mt-1 max-w-[280px] text-sm leading-[1.55] text-[#858585]">Your workspace&apos;s name, logo and your role in it.</p>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-medium">Logo</p>
            <div className="mt-2 flex items-center gap-5">
              <div className="relative h-[82px] w-[82px] shrink-0">
                <span className="flex h-[82px] w-[82px] items-center justify-center overflow-hidden rounded-2xl border border-[#e7e8ea] bg-[#f7f8f8] text-[29px] font-medium text-[#687178]">
                  {uploading ? <LoaderCircle size={20} className="animate-spin opacity-60" /> : info?.logoUrl ? <img src={info.logoUrl} alt="Workspace logo" className="h-full w-full object-cover" /> : (workspace?.name || "W").charAt(0).toUpperCase()}
                </span>
                <label className="dashboard-avatar-upload absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-white bg-[#202225] text-white shadow-sm transition hover:bg-black" title="Upload logo">
                  <Upload size={13} />
                  <input type="file" accept="image/png,image/jpeg,image/webp" onChange={chooseLogo} className="sr-only" disabled={uploading} />
                </label>
              </div>
              <div>
                <p className="text-[11px] text-[#9a9a9a]">PNG, JPG, or WebP — up to 2 MB</p>
                {info?.logoUrl && (
                  <button type="button" onClick={() => void saveLogo(null)} disabled={uploading} className="mt-1.5 cursor-pointer text-[11.5px] font-medium text-[#a64a53] hover:underline disabled:cursor-not-allowed disabled:opacity-50">Remove logo</button>
                )}
              </div>
            </div>

            <label className="mt-5 block text-[12px] font-medium" htmlFor="workspace-name">Workspace name</label>
            <div className="relative mt-2">
              <UsersRound size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7073]" />
              <input id="workspace-name" value={loading ? "" : workspace?.name ?? ""} readOnly className="h-11 w-full rounded-xl border border-[#d3d3d3] bg-[#fcfcfc] pl-10 pr-20 text-[13px] text-[#333] outline-none" />
              {workspace && <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#EEF1F3] px-2 py-1 text-[10px] font-semibold capitalize text-[#4c5459]">{workspace.role}</span>}
            </div>
          </div>
        </div>

        <div className="my-7 h-px bg-[#e7e7e7]" />

        {/* ------------------------------------------------------------ profile */}
        <div className={sectionGrid}>
          <div>
            <h3 className="dashboard-settings-heading text-base font-semibold">About your workspace</h3>
            <p className="dashboard-settings-subdesc mt-1 max-w-[280px] text-sm leading-[1.55] text-[#858585]">What kind of workspace this is and what you do. Your team sees it here, and it tells us who we&apos;re helping.</p>
          </div>
          <div className="min-w-0">
            <label className="block text-[12px] font-medium" htmlFor="workspace-type">Workspace type</label>
            <select id="workspace-type" value={draft.workspaceType} onChange={(event) => change("workspaceType", event.target.value)} disabled={!canEdit} className={`${infoInputClass} mt-2`}>
              <option value="">Select a type</option>
              {WORKSPACE_TYPES.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-[12px] font-medium" htmlFor="workspace-industry">Industry</label>
                <select id="workspace-industry" value={draft.industry} onChange={(event) => change("industry", event.target.value)} disabled={!canEdit} className={`${infoInputClass} mt-2`}>
                  <option value="">Select an industry</option>
                  {WORKSPACE_INDUSTRIES.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-medium" htmlFor="workspace-team-size">Team size</label>
                <select id="workspace-team-size" value={draft.teamSize} onChange={(event) => change("teamSize", event.target.value)} disabled={!canEdit} className={`${infoInputClass} mt-2`}>
                  <option value="">Select a size</option>
                  {WORKSPACE_TEAM_SIZES.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
            </div>

            <label className="mt-5 block text-[12px] font-medium" htmlFor="workspace-about">What does your workspace do?</label>
            <textarea
              id="workspace-about"
              value={draft.about}
              onChange={(event) => change("about", event.target.value.slice(0, ABOUT_MAX_CHARS))}
              disabled={!canEdit}
              rows={5}
              placeholder="Describe your work: what you sell or offer, who your customers are, and what they usually ask about."
              className="mt-2 w-full resize-y rounded-xl border border-[#d3d3d3] bg-white px-3 py-3 text-[13px] leading-6 outline-none transition placeholder:text-[#898989] focus:border-[#777] focus:ring-1 focus:ring-[#777]/10"
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-[#9a9a9a]">
              <span>{canEdit ? "Visible to everyone in this workspace." : "Only the workspace owner can edit this."}</span>
              <span>{draft.about.length}/{ABOUT_MAX_CHARS}</span>
            </div>
            {error && <p role="alert" className="mt-2 text-[11px] text-[#b8444f]">{error}</p>}
          </div>
        </div>

        <div className="my-7 h-px bg-[#e7e7e7]" />

        {/* ------------------------------------------------------------ websites */}
        <div className={sectionGrid}>
          <div>
            <h3 className="dashboard-settings-heading text-base font-semibold">Connected websites</h3>
            <p className="dashboard-settings-subdesc mt-1 max-w-[280px] text-sm leading-[1.55] text-[#858585]">The websites where your chat widget is installed.</p>
          </div>
          <div className="min-w-0">
            {infoLoading ? (
              <SkeletonRows rows={2} className="py-2" />
            ) : sites && sites.length > 0 ? (
              <ul className="overflow-hidden rounded-xl border border-[#e7e8ea]">
                {sites.map((site) => (
                  <li key={site.id} className="flex items-center gap-3 border-t border-[#e7e8ea] px-4 py-3.5 first:border-t-0">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f3f4] text-[#687178]"><Globe2 size={16} /></span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium">{site.name?.trim() || site.domain}</p>
                      <p className="truncate text-[12px] text-[#687178]">{site.name?.trim() ? `${site.domain} · ` : ""}Added {new Date(site.createdAt).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    {site.status === "verified" ? (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EAF5EE] px-2.5 py-1 text-[11px] font-semibold text-[#257A4D]"><CheckCircle2 size={12} /> Verified</span>
                    ) : (
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#FFF4E0] px-2.5 py-1 text-[11px] font-semibold text-[#9A6410]">Not verified yet</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-[#d3d3d3] px-5 py-7 text-center">
                <Globe2 size={20} className="mx-auto text-[#a4acb1]" />
                <p className="mt-2 text-[13px] font-medium">No website connected yet</p>
                <p className="mt-1 text-[12px] text-[#687178]">Add your website to install the chat widget on it.</p>
              </div>
            )}
            <Link href="/dashboard/settings/tags" className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium hover:underline">
              {sites && sites.length > 0 ? "Manage websites" : "Connect a website"} <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="my-7 h-px bg-[#e7e7e7]" />

        {/* ------------------------------------------------------------ details */}
        <div className={sectionGrid}>
          <div>
            <h3 className="dashboard-settings-heading text-base font-semibold">Details</h3>
            <p className="dashboard-settings-subdesc mt-1 max-w-[280px] text-sm leading-[1.55] text-[#858585]">When it was created, and the ID support may ask for.</p>
          </div>
          <div className="min-w-0 overflow-hidden rounded-xl border border-[#e7e8ea]">
            <div className="flex items-center justify-between gap-4 px-5 py-4">
              <span className="info-key text-[12px] font-medium text-[#687178]">Created</span>
              <span className="info-value text-[13px] font-medium">{infoLoading ? "…" : createdLabel}</span>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-[#e7e8ea] px-5 py-4">
              <span className="info-key text-[12px] font-medium text-[#687178]">Workspace ID</span>
              <span className="flex min-w-0 items-center gap-2">
                <span className="info-value truncate font-mono text-[12px] text-[#687178]">{workspace?.id ?? "…"}</span>
                <button type="button" onClick={copyId} disabled={!workspace} aria-label="Copy workspace ID" className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md text-[#687178] transition hover:bg-[#f1f3f4] disabled:cursor-not-allowed disabled:opacity-40">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                </button>
              </span>
            </div>
          </div>
        </div>
      </div>

      {canEdit && (
        // Pinned to the bottom of the scrolling settings area so it is always in view while you edit.
        <div className="info-save-bar sticky bottom-[calc(88px+env(safe-area-inset-bottom))] z-10 border-t border-[#e5e5e5] md:bottom-0">
          <div className="mx-auto flex w-full max-w-[1120px] items-center justify-end gap-3 px-8 py-3 sm:px-10 lg:px-12">
            {saved ? (
              <span className="flex items-center gap-1.5 text-[12px] font-medium text-[#2e8a5c]"><Check size={14} /> Changes saved</span>
            ) : dirty ? (
              <span className="text-[12px] font-medium text-[#b9770e]">You have unsaved changes</span>
            ) : null}
            {dirty && !saving && (
              <button type="button" onClick={() => setDraft(profileFrom(info))} className="info-discard-button h-9 cursor-pointer rounded-lg border px-3.5 text-[12px] font-medium transition">Discard</button>
            )}
            <button type="button" onClick={() => void saveProfile()} disabled={saving || !dirty} className="info-save-button flex h-9 cursor-pointer items-center gap-2 rounded-lg border px-3.5 text-[12px] font-medium transition disabled:cursor-not-allowed disabled:opacity-50">
              {saving ? <><RefreshCw size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save changes</>}
            </button>
          </div>
        </div>
      )}
    </>
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
    <div className="billing-v2 members-v2 mx-auto w-full max-w-[1120px] px-6 pb-14 pt-8 sm:px-9 lg:px-10">
      <header className="border-b border-[var(--b-border)] pb-7">
        <h2 className="text-[30px] font-normal tracking-[-0.04em]">Setup &amp; Integration</h2>
        <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-[var(--b-muted)]">Configure the chat widget and connect the tools your team already uses.</p>
      </header>

      <div className="dashboard-connect-embedded mt-8">
        <ConnectPageContent />
      </div>
    </div>
  );
}

function WorkspaceDangerZoneSettingsPage() {
  return (
    <div className="pb-6 pt-9">
      <div className="mx-auto w-full max-w-[1120px] px-8 sm:px-10 lg:px-12">
        <h2 className="text-[26px] font-semibold tracking-[-0.025em] text-[#121315]">Danger zone</h2>
        <p className="mt-2 max-w-xl text-[15px] leading-6 text-[#667069]">Irreversible actions. Read the descriptions carefully before continuing.</p>
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
  // How this account signs in: Google, a password, or both.
  const [hasPassword, setHasPassword] = useState(true);
  const [googleLinked, setGoogleLinked] = useState(false);
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
        setHasPassword(data.account.hasPassword ?? true);
        setGoogleLinked(data.account.googleLinked ?? false);
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
      <div className="mx-auto w-full max-w-[1120px] px-4 pb-6 pt-6 sm:px-10 sm:pt-9 lg:px-12">
        <h2 className="text-[24px] font-semibold tracking-[-0.025em] text-[#121315] sm:text-[26px]">My Settings</h2>

        <div className="mt-6 grid sm:mt-9 grid-cols-[310px_minmax(0,1fr)] gap-10 max-xl:grid-cols-[270px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:gap-5">
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

            {/* How this account signs in. Shown as facts, not a form: there is no password to type for a Google account, and password
                changes go through the reset email. */}
            <p className="mt-6 text-[12px] font-medium">Sign-in methods</p>
            <ul className="mt-2 divide-y divide-[#e7e7e7] overflow-hidden rounded-xl border border-[#d3d3d3]">
              <li className="flex items-center gap-3 px-3.5 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.08)]">
                  <span className="flex size-[18px] items-center justify-center"><GoogleIcon /></span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium">Google</span>
                  <span className="dashboard-settings-subdesc block truncate text-[12px] text-[#858585]">{googleLinked ? user.email : "Not connected. Use Continue with Google on the login page to connect it."}</span>
                </span>
                {googleLinked ? (
                  <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#EAF5EE] px-2 py-1 text-[11px] font-semibold text-[#257A4D]"><CheckCircle2 size={12} /> Connected</span>
                ) : (
                  <span className="shrink-0 rounded-full bg-[#F2F3F3] px-2 py-1 text-[11px] font-medium text-[#6f7073]">Not connected</span>
                )}
              </li>
              <li className="flex items-center gap-3 px-3.5 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#F2F3F3] text-[#6f7073]"><LockKeyhole size={16} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-medium">Email and password</span>
                  <span className="dashboard-settings-subdesc block text-[12px] leading-5 text-[#858585]">
                    {hasPassword
                      ? <>Password sign-in is on. To change it, <a href="/forgot-password" className="font-medium underline underline-offset-2">send yourself a reset link</a>.</>
                      : "No password set. You sign in with Google, so you don't need one."}
                  </span>
                </span>
                <span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${hasPassword ? "bg-[#EAF5EE] text-[#257A4D]" : "bg-[#F2F3F3] font-medium text-[#6f7073]"}`}>{hasPassword ? "Set" : "Not set"}</span>
              </li>
            </ul>
            {error && <p className="mt-2 text-[11px] text-[#b8444f]">{error}</p>}
          </div>
        </div>

        <div className="my-7 h-px bg-[#e7e7e7]" />

        <div className="grid grid-cols-[310px_minmax(0,1fr)] gap-10 max-xl:grid-cols-[270px_minmax(0,1fr)] max-lg:grid-cols-1 max-lg:gap-5">
          <div><h3 className="dashboard-settings-heading text-base font-semibold">Dashboard appearance</h3><p className="dashboard-settings-subdesc mt-1 max-w-[285px] text-[12px] leading-[1.55] text-[#858585]">Personalize the dashboard canvas, navigation, buttons, and active states. These choices do not change your customer-facing chatbot.</p></div>
          <div className="min-w-0">
            <div><p className="dashboard-settings-heading text-base font-semibold">Appearance</p><p className="dashboard-settings-subdesc mt-1 text-sm text-[#858585]">Choose Light or Dark, or let System follow your device.</p><div className="mt-4 flex flex-wrap gap-4">{([['light','Light'],['dark','Dark'],['system','System']] as const).map(([value,label]) => { const swatchLight = value === 'light'; return <button key={value} type="button" onClick={() => updateDashboardAppearance(value)} className="text-left"><span className={`block h-[70px] w-[116px] overflow-hidden rounded-lg border-2 p-2 transition ${dashboardAppearance === value ? "border-[#11120f] [[data-dashboard-theme=dark]_&]:border-white/70" : "border-black/15 [[data-dashboard-theme=dark]_&]:border-white/10"} ${swatchLight ? "bg-[#f4f4f5]" : "bg-[#202327]"}`}><span className={`block h-2 w-8 rounded ${swatchLight ? "bg-black/30" : "bg-white/35"}`} /><span className={`mt-2 block h-2 w-16 rounded ${swatchLight ? "bg-black/15" : "bg-white/20"}`} /></span><span className={`mt-2 block text-[11px] ${dashboardAppearance === value ? "dashboard-settings-heading font-medium" : "dashboard-settings-subdesc font-normal text-[#858585]"}`}>{label}</span></button>; })}</div></div>
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

// What visitors see when no avatar is chosen: the stock blue chat mark, same as the widget launcher on customer sites.
const DEFAULT_BOT_AVATAR = "/api/stock-icons/widget_1.png";

function ChatbotInterfaceSettingsPage({ previewContainer }: { previewContainer: HTMLDivElement | null }) {
  const [loading, setLoading] = useState(true);
  const [aiName, setAiName] = useState("Elpino AI");
  const [aiAvatarUrl, setAiAvatarUrl] = useState("");
  // Read-only: customers can't pick a theme color. It is only loaded so the preview matches the live widget,
  // and is never sent back when saving.
  const [accent, setAccent] = useState("#202225");
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("light");
  const [replyLanguage, setReplyLanguage] = useState("auto");
  const [replyLanguageOpen, setReplyLanguageOpen] = useState(false);
  // Phones and tablets have no side preview panel, so the preview opens inline instead.
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  // One greeting message. Workspaces saved with several lines are shown joined into one. `greeting` is what the field shows: the greeting
  // as written (`baseGreeting`) on Auto, or the saved translation for the chosen reply language, which is made once and then reused.
  const [greeting, setGreeting] = useState(DEFAULT_GREETING);
  const [baseGreeting, setBaseGreeting] = useState(DEFAULT_GREETING);
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [translating, setTranslating] = useState(false);
  const savedTranslationsRef = useRef<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFields, setPreviewFields] = useState<PreChatField[]>([]);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  // The avatars this workspace has uploaded before, offered again in the picker.
  const [pastAvatars, setPastAvatars] = useState<Array<{ id: string; url: string }>>([]);
  const [pastLoading, setPastLoading] = useState(false);
  // What is saved right now, so autosave only fires for a real change (not once on every visit just because the page loaded).
  const savedSnapshot = useRef<string | null>(null);

  // Fetched each time the picker opens, so an avatar uploaded a moment ago is already in the list.
  useEffect(() => {
    if (!avatarPickerOpen) return;
    let cancelled = false;
    setPastLoading(true);
    fetch("/api/workspace/ai-persona/history")
      .then((response) => (response.ok ? response.json() : { avatars: [] }))
      .then((data: { avatars?: Array<{ id: string; url: string }> }) => { if (!cancelled) setPastAvatars(data.avatars ?? []); })
      .catch(() => { if (!cancelled) setPastAvatars([]); })
      .finally(() => { if (!cancelled) setPastLoading(false); });
    return () => { cancelled = true; };
  }, [avatarPickerOpen]);

  async function forgetPastAvatar(id: string) {
    setPastAvatars((current) => current.filter((avatar) => avatar.id !== id));
    await fetch(`/api/workspace/ai-persona/history/${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => undefined);
  }

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
        const saved = Array.isArray(data.persona.greetingLines) ? data.persona.greetingLines.map((line) => line.trim()).filter(Boolean).join(" ") : "";
        const savedBase = saved || DEFAULT_GREETING;
        const savedTranslated: Record<string, string> = {};
        for (const [code, lines] of Object.entries((data.persona as { greetingTranslations?: Record<string, string[]> }).greetingTranslations ?? {})) {
          const text = Array.isArray(lines) ? lines.map((line) => line.trim()).filter(Boolean).join(" ") : "";
          if (text) savedTranslated[code] = text;
        }
        const language = data.persona.chatbotReplyLanguage ?? "auto";
        const shown = language !== "auto" && savedTranslated[language] ? savedTranslated[language] : savedBase;
        setBaseGreeting(savedBase);
        setTranslations(savedTranslated);
        savedTranslationsRef.current = savedTranslated;
        setGreeting(shown);
        savedSnapshot.current = JSON.stringify([
          data.persona.aiName ?? "Elpino AI",
          data.persona.aiAvatarUrl ?? "",
          data.persona.chatbotTheme ?? "light",
          language,
          shown,
        ]);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const cleanGreetingLines = greeting.trim() ? [greeting.trim()] : [];

  const currentSnapshot = JSON.stringify([aiName, aiAvatarUrl, theme, replyLanguage, greeting]);

  // Typing changes the greeting for the language being shown: the written one on Auto, otherwise that language's saved translation.
  function editGreeting(value: string) {
    setGreeting(value);
    setSaved(false);
    if (replyLanguage === "auto") {
      setBaseGreeting(value);
      // Rewriting the greeting makes the saved translations out of date; the server drops them too, and they are remade on demand.
      setTranslations({});
      savedTranslationsRef.current = {};
    } else {
      setTranslations((current) => ({ ...current, [replyLanguage]: value }));
    }
  }

  // Picking a reply language shows the greeting in it. Translated once with a small model and saved; picking the language again, or
  // switching back and forth, uses the saved text. Auto goes back to the greeting as written.
  async function chooseReplyLanguage(code: string, force = false) {
    setReplyLanguage(code);
    setReplyLanguageOpen(false);
    setSaved(false);
    setError(null);
    if (code === "auto") { setGreeting(baseGreeting); return; }
    if (translations[code] && !force) { setGreeting(translations[code]); return; }
    setTranslating(true);
    try {
      // Translate what is written now, not what was last saved.
      if (savedSnapshot.current !== currentSnapshot) await save();
      const response = await fetch("/api/workspace/ai-persona/greeting-translate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: code, force }),
      });
      const data = (await response.json().catch(() => ({}))) as { lines?: string[]; message?: string };
      if (!response.ok || !data.lines) { setError(data.message ?? "Could not translate the greeting."); setGreeting(baseGreeting); return; }
      const text = data.lines.map((line) => line.trim()).filter(Boolean).join(" ");
      setTranslations((current) => ({ ...current, [code]: text }));
      savedTranslationsRef.current = { ...savedTranslationsRef.current, [code]: text };
      setGreeting(text);
    } finally {
      setTranslating(false);
    }
  }

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
          chatbotTheme: theme,
          chatbotReplyLanguage: replyLanguage,
          // Always the greeting as written; a translation travels separately, and only when it was edited here.
          greetingLines: [baseGreeting.trim() || DEFAULT_GREETING],
          // Only a translation that exists and was edited here: while one is still being made the field holds the written greeting,
          // which must never be saved as the translation.
          ...(replyLanguage !== "auto" && translations[replyLanguage] && translations[replyLanguage] === greeting.trim() && savedTranslationsRef.current[replyLanguage] !== greeting.trim()
            ? { greetingTranslations: { [replyLanguage]: [greeting.trim()] } }
            : {}),
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { persona?: AiPersona; message?: string };
      if (!response.ok) {
        setError(data.message ?? "Could not save changes");
        return;
      }
      savedSnapshot.current = currentSnapshot;
      if (replyLanguage !== "auto" && translations[replyLanguage]) savedTranslationsRef.current = { ...savedTranslationsRef.current, [replyLanguage]: translations[replyLanguage] };
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
    if (loading || translating || !aiName.trim() || cleanGreetingLines.length === 0) return;
    // Nothing to save until the person actually changes something.
    if (savedSnapshot.current === currentSnapshot) return;
    const timer = window.setTimeout(() => { void save(); }, 700);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, replyLanguage, aiName, aiAvatarUrl, greeting, loading, translating]);

  return (
    <div className="dashboard-chatbot-settings-page mx-auto w-full max-w-[1280px] px-4 pb-24 pt-5 text-white/90 sm:px-9 sm:pb-20 sm:pt-8 lg:px-10">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-[26px] font-medium tracking-[-0.04em] text-white/90 sm:text-[32px]">Chatbot Interface</h2>
          <p className="mt-1 text-[14px] leading-6 text-white/60 sm:hidden">How your chat looks and greets visitors. Changes save automatically.</p>
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
        <div role="status" aria-busy="true" aria-label="Loading chatbot settings" className="mt-7 divide-y divide-[var(--skel-line,rgb(128_128_128/0.18))]">
          {/* Same two-column shape as the real sections: label + hint on the left, controls on the right. */}
          <div className="grid gap-6 py-5 sm:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-2"><Bone className="h-4 w-36" /><Bone className="h-3 w-44" /><Bone className="h-3 w-32" /></div>
            <div>
              <Bone className="h-3 w-14" />
              <Bone className="mt-3 size-16 rounded-full" />
              <Bone className="mt-3 h-3 w-48" />
              <Bone className="mt-5 h-3 w-24" />
              <Bone className="mt-2 h-10 w-1/2 min-w-[220px]" />
            </div>
          </div>
          <div className="grid gap-6 py-5 sm:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-2"><Bone className="h-4 w-28" /><Bone className="h-3 w-40" /></div>
            <div className="space-y-2.5"><Bone className="h-10 w-full" /><Bone className="h-10 w-full" /><Bone className="h-9 w-32" /></div>
          </div>
          <div className="grid gap-6 py-5 sm:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-2"><Bone className="h-4 w-24" /><Bone className="h-3 w-36" /></div>
            <div className="flex flex-wrap gap-2">{Array.from({ length: 8 }, (_, i) => <Bone key={i} className="size-9" />)}</div>
          </div>
          <div className="grid gap-6 py-5 sm:grid-cols-[220px_minmax(0,1fr)]">
            <div className="space-y-2"><Bone className="h-4 w-32" /><Bone className="h-3 w-40" /></div>
            <Bone className="h-10 w-full max-w-sm" />
          </div>
        </div>
      ) : (
        <div className="mt-5 sm:mt-7">
          {/* No side panel below xl, so the live preview folds out here instead. */}
          <div className="xl:hidden">
            <button
              type="button"
              onClick={() => setMobilePreviewOpen((open) => !open)}
              aria-expanded={mobilePreviewOpen}
              className="flex h-12 w-full items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 text-[14px] font-medium"
            >
              <span className="flex items-center gap-2.5"><MessageCircle size={16} /> Preview your chat</span>
              <ChevronDown size={16} className={`transition-transform ${mobilePreviewOpen ? "rotate-180" : ""}`} />
            </button>
            {mobilePreviewOpen && (
              <div className="mt-3 flex h-[520px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#262626]">
                <WidgetPreviewCard accent={accent} aiName={aiName} aiAvatarUrl={aiAvatarUrl} greetingLines={cleanGreetingLines.length > 0 ? cleanGreetingLines : [DEFAULT_GREETING]} fields={previewFields} />
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div data-tour="widget-identity" className="overflow-hidden py-5 max-sm:mt-4 max-sm:rounded-2xl max-sm:border max-sm:border-white/10 max-sm:px-4">
              <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
                <div>
                  <h3 className="text-[16px] font-semibold">General information</h3>
                  <p className="mt-1 text-[12px] leading-5 text-[#667069] sm:max-w-[200px]">The name and avatar shown to customers in chat.</p>
                </div>
                <div className="w-full min-w-0">
                  <span className="block text-[12px] font-semibold text-[#17233A]">Avatar</span>
                  <div className="relative mt-2 inline-block">
                    <span className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-[22px] font-bold text-white" style={{ backgroundColor: accent }}>
                      <img src={aiAvatarUrl.trim() || DEFAULT_BOT_AVATAR} alt="AI avatar preview" className="h-full w-full object-cover" />
                    </span>
                    <button
                      type="button"
                      title="Change avatar"
                      onClick={() => setAvatarPickerOpen(true)}
                      className="dashboard-chatbot-avatar-button absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-2 border-[#1c1c1c] bg-[#202225] text-white shadow-sm transition hover:bg-black"
                    >
                      <Upload size={13} />
                    </button>
                  </div>
                  <p className="mt-2 text-[11px] text-[#8b8d90]">PNG, JPG, or WebP — up to 2 MB</p>

                  <label className="mt-5 block w-full sm:w-1/2">
                    <span className="text-[12px] font-semibold text-[#17233A]">Chatbot name</span>
                    <div className="relative mt-2">
                      <UserRound size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b8d90]" />
                      <input
                        value={aiName}
                        onChange={(event) => { setAiName(event.target.value); setSaved(false); }}
                        placeholder="Elpino AI"
                        className="h-12 w-full rounded-xl border border-[#DDE4E8] pl-9 pr-3 text-[16px] outline-none transition focus:border-[#11120f] focus:ring-2 focus:ring-[#11120f]/8 sm:h-11 sm:text-[13px]"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {error && <p className="mt-4 text-[12px] text-[#c63f4d]">{error}</p>}

            <div data-tour="widget-greeting" className="overflow-hidden border-t border-white/10 py-5 max-sm:mt-3 max-sm:rounded-2xl max-sm:border max-sm:px-4">
              <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
                <div>
                  <h3 className="text-[16px] font-semibold">Greeting message</h3>
                  <p className="mt-1 text-[12px] leading-5 text-[#667069] sm:max-w-[200px]">Shown before a visitor starts chatting, on the launcher and at the top of a new conversation.</p>
                </div>
                <div className="w-full min-w-0">
                  <div className="flex w-full items-center gap-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f1f1f1] text-[#666]"><MessageCircle size={15} /></span>
                    <input
                      aria-label="Greeting message"
                      value={greeting}
                      maxLength={GREETING_MAX_LENGTH}
                      disabled={translating}
                      onChange={(event) => editGreeting(event.target.value)}
                      placeholder={DEFAULT_GREETING}
                      className="h-11 w-full rounded-lg border border-[#DDE4E8] px-3 text-[16px] outline-none transition focus:border-[#11120f] focus:ring-2 focus:ring-[#11120f]/8 sm:h-9 sm:text-[13px]"
                    />
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[11px] text-[#8b8d90]">
                    <span>
                      {translating
                        ? <span className="inline-flex items-center gap-1.5"><LoaderCircle size={11} className="animate-spin" /> Translating to {SUPPORTED_LANGUAGES.find((item) => item.code === replyLanguage)?.name ?? "that language"}…</span>
                        : replyLanguage === "auto"
                          ? "On Auto, visitors from other countries are greeted in their own language."
                          : `Shown to visitors in ${SUPPORTED_LANGUAGES.find((item) => item.code === replyLanguage)?.name ?? "this language"}. Translated once and saved.`}
                    </span>
                    <span className="flex items-center gap-3">
                      {replyLanguage !== "auto" && !translating && (
                        <button type="button" onClick={() => void chooseReplyLanguage(replyLanguage, true)} className="font-medium underline underline-offset-2 hover:text-white/80">Translate again</button>
                      )}
                      <span>{greeting.length}/{GREETING_MAX_LENGTH}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 py-5 max-sm:mt-3 max-sm:rounded-2xl max-sm:border max-sm:px-4">
              <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
                <div>
                  <h3 className="text-[16px] font-semibold">Reply language</h3>
                  <p className="mt-1 text-[12px] leading-5 text-[#667069] sm:max-w-[200px]">Auto matches whatever language the customer writes in. Forcing one replies in it regardless of what they type.</p>
                </div>
                <div className="relative w-full min-w-0 sm:w-1/2">
                  <button
                    type="button"
                    onClick={() => setReplyLanguageOpen((open) => !open)}
                    aria-expanded={replyLanguageOpen}
                    aria-haspopup="listbox"
                    className="flex h-12 w-full items-center gap-2.5 rounded-xl border border-[#DDE4E8] px-3 text-[14px] outline-none transition focus:border-[#11120f] focus:ring-2 focus:ring-[#11120f]/8 sm:h-11 sm:text-[13px]"
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
                            onClick={() => void chooseReplyLanguage("auto")}
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
                              onClick={() => void chooseReplyLanguage(item.code)}
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

            <div className="border-t border-white/10 py-5 max-sm:mt-3 max-sm:rounded-2xl max-sm:border max-sm:px-4">
              <div className="grid gap-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:gap-6">
                <div>
                  <h3 className="text-[16px] font-semibold">Collect contact details</h3>
                  <p className="mt-1 text-[12px] leading-5 text-[#667069] sm:max-w-[200px]">Choose which contact details the chat widget asks visitors to share.</p>
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
        <WidgetPreviewCard accent={accent} aiName={aiName} aiAvatarUrl={aiAvatarUrl} greetingLines={cleanGreetingLines.length > 0 ? cleanGreetingLines : [DEFAULT_GREETING]} fields={previewFields} />,
        previewContainer
      )}

      {avatarPickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/35 backdrop-blur-[2px] sm:items-center sm:p-4"
          role="presentation"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setAvatarPickerOpen(false); }}
        >
          <div role="dialog" aria-modal="true" aria-label="Change avatar" className="dashboard-avatar-picker flex h-[88dvh] w-full max-w-none flex-col overflow-hidden rounded-t-[24px] sm:h-[80vh] sm:w-[60vw] sm:rounded-[24px] border border-white/10 bg-[#2d2d2d] text-white/90 shadow-[0_28px_80px_rgba(0,0,0,0.38)] max-lg:h-[85vh] max-lg:w-[92vw]">
            <div className="flex items-start justify-between gap-3 border-b border-[#E5E9EB] px-5 py-4 sm:px-7 sm:py-5">
              <div>
                <h3 className="text-[18px] font-semibold tracking-[-0.02em]">Change avatar</h3>
                <p className="mt-1 text-[12.5px] text-[#667069]">Upload your own image, or pick one you used before — this is what customers see in every conversation, and the icon they'll click to open the chat.</p>
              </div>
              <button type="button" onClick={() => setAvatarPickerOpen(false)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg hover:bg-[#F0F2F3]"><X size={18} /></button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-7">
              <div className="mx-auto max-w-3xl">
                <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2.5 rounded-2xl border-2 border-dashed border-[#c7cdd1] text-center text-[13px] text-[#667069] transition hover:bg-[#f7f8f8]">
                  <Upload size={26} />
                  <span>Click to upload a PNG, JPG, or WebP<br />up to 2MB</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => { chooseAvatar(event); setAvatarPickerOpen(false); }}
                    className="sr-only"
                  />
                </label>

                <h4 className="mt-7 text-[13px] font-semibold">Used before</h4>
                {pastLoading ? (
                  <div role="status" aria-busy="true" aria-label="Loading past avatars" className="mt-3 grid grid-cols-6 gap-4 max-lg:grid-cols-4 max-sm:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Bone key={i} className="aspect-square w-full" />)}</div>
                ) : pastAvatars.length === 0 ? (
                  <p className="mt-3 text-[12.5px] text-[#8a9298]">Images you upload will show up here, so you can switch back to them later.</p>
                ) : (
                  <div className="mt-3 grid grid-cols-6 gap-4 max-lg:grid-cols-4 max-sm:grid-cols-3">
                    {pastAvatars.map((avatar) => {
                      const active = aiAvatarUrl === avatar.url;
                      return (
                        <div key={avatar.id} className="group relative">
                          <button
                            type="button"
                            onClick={() => { setAiAvatarUrl(avatar.url); setSaved(false); setAvatarPickerOpen(false); }}
                            aria-label="Use this avatar"
                            aria-pressed={active}
                            className={`flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-[#eceeef] transition hover:scale-105 hover:shadow-md ${active ? "ring-2 ring-[#11120f] ring-offset-2" : ""}`}
                          >
                            <img src={avatar.url} alt="" className="h-full w-full object-cover" />
                          </button>
                          {!active && (
                            <button
                              type="button"
                              onClick={() => void forgetPastAvatar(avatar.id)}
                              aria-label="Remove from the list"
                              title="Remove from the list"
                              className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-[#202225] text-white opacity-0 shadow transition hover:bg-black focus:opacity-100 group-hover:opacity-100 max-sm:opacity-100"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {aiAvatarUrl.trim() && (
                  <button
                    type="button"
                    onClick={() => { setAiAvatarUrl(""); setSaved(false); setAvatarPickerOpen(false); }}
                    className="mt-6 w-full text-center text-[13px] font-medium text-[#a5414b] hover:underline"
                  >
                    Remove current avatar
                  </button>
                )}
              </div>
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
  const lines = greetingLines.length > 0 ? greetingLines : [DEFAULT_GREETING];
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
            {/* One popup, like the real launcher (tag.js). */}
            <div className="w-fit min-w-[170px] max-w-full rounded-xl border border-white/10 bg-[#111214] px-4 pb-3 pt-3.5 text-white shadow-2xl transition hover:brightness-110">
              <div className="text-[14px] font-normal leading-6 text-white">{lines.join(" ")}</div>
              <div className="mt-2 flex items-baseline gap-1.5 text-[12px] font-normal leading-[1.3] text-white/60">
                <span className="text-white/85">{displayName}</span>
                <span aria-hidden="true">·</span>
                <span>Just now</span>
              </div>
            </div>
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
                        <img src={aiAvatarUrl.trim() || DEFAULT_BOT_AVATAR} alt="" className="h-full w-full object-cover" />
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
                        <img src={aiAvatarUrl.trim() || DEFAULT_BOT_AVATAR} alt="" className="h-full w-full object-cover" />
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
          ) : (
            <img src={aiAvatarUrl.trim() || DEFAULT_BOT_AVATAR} alt="" className="h-full w-full object-cover" />
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
          <SkeletonRows rows={5} className="py-6" />
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
    <div className="dashboard-security-page mx-auto w-full max-w-[980px] px-4 pb-16 pt-5 text-white sm:px-9 sm:pt-8 lg:px-10">
      <header className="flex flex-col items-start gap-4 sm:flex-row sm:flex-wrap sm:justify-between sm:gap-5">
        <div>
          <p className="text-[11px] font-normal uppercase tracking-[0.16em] text-white/80 sm:text-xs">Workspace security</p>
          <h2 className="mt-1.5 text-[26px] font-normal leading-tight tracking-[-0.03em] text-white sm:mt-2 sm:text-3xl">Security & permissions</h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-6 text-white/80 sm:text-sm">Control how people sign in, what members can access, and how your workspace responds to security events.</p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-[#428ce5]/25 bg-[#428ce5]/10 px-3 py-2 text-xs font-medium text-[#b8d9ff]"><ShieldCheck size={15} /> Protected</div>
      </header>

      <ActiveSessionsSection />

      <SecuritySection title="Authentication policies" description="Set the minimum sign-in requirements for everyone in this workspace.">
        <SecurityRow icon={KeyRound} title="Require two-factor authentication" description="Members must configure an authenticator or SMS code before accessing workspace data." badge="Business">
          <Toggle checked={settings?.requireTwoFactor ?? false} onChange={() => void update({ requireTwoFactor: !settings?.requireTwoFactor })} label="Require two-factor authentication" disabled={toggleDisabled} />
        </SecurityRow>
        <SecurityRow icon={Eye} title="New sign-in alerts" description="Notify workspace admins when an account signs in from a new browser or location.">
          <Toggle checked={settings?.signInAlerts ?? false} onChange={() => void update({ signInAlerts: !settings?.signInAlerts })} label="New sign-in alerts" disabled={toggleDisabled} />
        </SecurityRow>
      </SecuritySection>

      <SecuritySection title="Member permissions" description="Define safe defaults for members joining your workspace.">
        <SecurityRow title="Only admins can invite members" description="Prevent members from inviting additional people without administrator approval.">
          <Toggle checked={settings ? !settings.membersCanInvite : true} onChange={() => void update({ membersCanInvite: !settings?.membersCanInvite })} label="Only admins can invite members" disabled={toggleDisabled} />
        </SecurityRow>
      </SecuritySection>

      {!loading && !isOwner && (
        <p className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-[11.5px] font-medium text-amber-200">Only the workspace owner can change these settings.</p>
      )}
      {error && <p role="alert" className="mt-4 text-[12px] font-medium text-[#e0707c]">{error}</p>}
    </div>
  );
}

type DeviceSession = { id: string; device: string; mobile: boolean; location: string | null; ipAddress: string | null; createdAt: string; lastSeenAt: string; current: boolean };

function relativeTime(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 5) return "Active now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

/** Every browser/device currently signed in to this account, with where it signed in from and a way to sign it out. */
function ActiveSessionsSection() {
  const [sessions, setSessions] = useState<DeviceSession[] | null>(null);
  const [currentKnown, setCurrentKnown] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/auth/sessions", { cache: "no-store" }).catch(() => null);
    if (!response?.ok) { setLoadError(true); return; }
    const data = (await response.json()) as { sessions: DeviceSession[]; currentKnown: boolean };
    setSessions(data.sessions);
    setCurrentKnown(data.currentKnown);
    setLoadError(false);
  }
  useEffect(() => { void load(); }, []);

  async function signOut(target: "others" | string) {
    if (busyId) return;
    setBusyId(target);
    setError(null);
    const response = await fetch(target === "others" ? "/api/auth/sessions/others" : `/api/auth/sessions/${encodeURIComponent(target)}`, { method: "DELETE" }).catch(() => null);
    if (!response?.ok) {
      const data = response ? ((await response.json().catch(() => ({}))) as { message?: string }) : {};
      setError(data.message ?? "Could not sign out. Try again.");
    } else {
      await load();
    }
    setBusyId(null);
  }

  const others = (sessions ?? []).filter((row) => !row.current);

  return (
    <section className="mt-6 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] sm:mt-7">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
        <div>
          <h3 className="text-base font-medium text-white">Where you&apos;re signed in</h3>
          <p className="mt-1 text-xs text-white/80">Browsers and devices signed in to your account. Sign out any you don&apos;t recognise.</p>
        </div>
        {others.length > 0 && (
          <button type="button" disabled={busyId !== null} onClick={() => void signOut("others")} className="flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-[13px] font-medium text-white transition hover:bg-white/[0.08] disabled:opacity-50 sm:h-9 sm:w-auto sm:text-xs">
            {busyId === "others" ? <LoaderCircle size={13} className="animate-spin" /> : <LogOut size={13} />} Sign out all other devices
          </button>
        )}
      </div>
      {sessions === null && !loadError ? (
        <SkeletonRows rows={3} className="px-5 py-5" />
      ) : loadError ? (
        <p className="px-5 py-5 text-xs text-white/80">Your sessions could not be loaded.</p>
      ) : (
        <ul className="divide-y divide-white/10">
          {sessions?.map((row) => {
            const Icon = row.mobile ? Smartphone : Monitor;
            return (
              <li key={row.id} className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-4 sm:flex-nowrap sm:gap-4 sm:px-5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-[#5ca5fa]"><Icon size={17} /></span>
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-white">
                    {row.device}
                    {row.current && <span className="rounded-md bg-[#2e8a5c]/15 px-2 py-0.5 text-[10px] font-medium text-[#3fb37b]">This device</span>}
                  </p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-white/80">
                    <span className="flex items-center gap-1"><MapPin size={12} />{row.location ?? "Unknown location"}{row.ipAddress ? ` · ${row.ipAddress}` : ""}</span>
                    <span>{row.current ? "Active now" : relativeTime(row.lastSeenAt)}</span>
                  </p>
                </div>
                {!row.current && (
                  <button type="button" disabled={busyId !== null} onClick={() => void signOut(row.id)} className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-[#e0707c] transition hover:bg-white/[0.06] disabled:opacity-50 max-sm:w-full max-sm:justify-center max-sm:border max-sm:border-white/10 sm:h-8">
                    {busyId === row.id ? <LoaderCircle size={12} className="animate-spin" /> : <LogOut size={12} />} Sign out
                  </button>
                )}
              </li>
            );
          })}
          {!currentKnown && (
            <li className="px-5 py-4 text-xs text-white/80">This browser signed in before device tracking was added, so it isn&apos;t listed. Sign out and back in once and it will appear here.</li>
          )}
        </ul>
      )}
      {error && <p role="alert" className="border-t border-white/10 px-5 py-3 text-xs font-medium text-[#e0707c]">{error}</p>}
    </section>
  );
}

function SecuritySection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return <section className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-white/[0.025] sm:mt-5">
    <div className="border-b border-white/10 px-4 py-4 sm:px-5"><h3 className="text-base font-medium text-white">{title}</h3><p className="mt-1 text-xs text-white/80">{description}</p></div>
    <div className="divide-y divide-white/10">{children}</div>
  </section>;
}

function SecurityRow({ icon: Icon, title, description, badge, children }: { icon?: typeof ShieldCheck; title: string; description: string; badge?: string; children: React.ReactNode }) {
  return <div className="flex items-center gap-3 px-4 py-4 sm:items-start sm:gap-4 sm:px-5">
    {Icon && <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-[#5ca5fa]"><Icon size={17} /></span>}
    <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-white">{title}</p>{badge && <span className="rounded-md bg-[#428ce5]/15 px-2 py-0.5 text-[10px] font-medium text-[#b8d9ff]">{badge}</span>}</div><p className="mt-1 text-[13px] leading-5 text-white/80 sm:text-xs">{description}</p></div>
    <div className="shrink-0 sm:pt-0.5">{children}</div>
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
        <div role="status" aria-busy="true" aria-label="Loading availability" className="mt-6 space-y-3">
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="flex items-center gap-4"><Bone className="h-5 w-9" /><Bone className="h-4 w-24" /><Bone className="h-9 w-32" /><Bone className="h-9 w-32" /></div>
          ))}
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
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");

  useEffect(() => {
    if (!canView) { setLoading(false); return; }
    fetch("/api/workspace/presence-events")
      .then((response) => (response.ok ? response.json() : { events: [] }))
      .then((data: { events?: PresenceEvent[] }) => setEvents(data.events ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, [canView]);

  const byNewest = (a: PresenceEvent, b: PresenceEvent) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime();
  const normalizedQuery = query.trim().toLowerCase();
  const visibleEvents = events
    .filter((event) => statusFilter === "all" || event.status === statusFilter)
    .filter((event) => !normalizedQuery || `${event.name ?? ""} ${event.email}`.toLowerCase().includes(normalizedQuery))
    .sort(byNewest);

  // Each teammate's latest event is their status right now: online ones first, then the most recently seen.
  const team = (() => {
    const latest = new Map<string, PresenceEvent>();
    for (const event of events) {
      const seen = latest.get(event.userId);
      if (!seen || new Date(event.occurredAt) > new Date(seen.occurredAt)) latest.set(event.userId, event);
    }
    return [...latest.values()].sort((a, b) => (a.status === b.status ? byNewest(a, b) : a.status === "online" ? -1 : 1));
  })();

  const timeAgo = (iso: string) => {
    const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (minutes < 1440) return `${Math.round(minutes / 60)}h ago`;
    return `${Math.round(minutes / 1440)}d ago`;
  };

  // Newest first, grouped under a heading per calendar day.
  const dayLabel = (iso: string) => {
    const day = new Date(iso);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (day.toDateString() === today.toDateString()) return "Today";
    if (day.toDateString() === yesterday.toDateString()) return "Yesterday";
    return day.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  };
  const groups: { label: string; items: PresenceEvent[] }[] = [];
  for (const event of visibleEvents) {
    const label = dayLabel(event.occurredAt);
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.items.push(event);
    else groups.push({ label, items: [event] });
  }

  const filtering = Boolean(normalizedQuery) || statusFilter !== "all";

  return (
    <div className="billing-v2 members-v2 mx-auto w-full max-w-[1120px] px-6 pb-20 pt-6 sm:px-9 lg:px-10">
      <header>
        <h2 className="text-[30px] font-normal tracking-[-0.04em]">Recent activity</h2>
        <p className="mt-1.5 max-w-xl text-[13px] leading-6 text-[var(--b-muted)]">See when your teammates come online and go offline, based on their real connection.</p>
      </header>

      {myRole !== null && !canView ? (
        <p className="mt-6 rounded-[10px] bg-[var(--b-warn-bg)] px-4 py-3 text-[13px] font-medium text-[var(--b-warn)]">Only the workspace owner can view the presence log.</p>
      ) : (
        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* ------------------------------------------------------------ team */}
          <section aria-label="Team" className="rounded-[10px] border border-[var(--b-border)] lg:sticky lg:top-6">
            <h3 className="presence-meta border-b border-[var(--b-border)] px-4 py-3 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--b-muted)]">Team</h3>
            {loading ? (
              <SkeletonRows rows={3} className="px-4 py-4" />
            ) : team.length ? (
              <ul>
                {team.map((member) => {
                  const online = member.status === "online";
                  return (
                    <li key={member.userId} className="flex items-center gap-3 border-t border-[var(--b-border)] px-4 py-3 first:border-t-0">
                      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--b-surface-2)] text-[12px] font-medium">
                        {(member.name || member.email).trim().charAt(0).toUpperCase()}
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--b-surface)] ${online ? "bg-[var(--b-good)]" : "bg-[var(--b-track)]"}`} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="presence-name truncate text-[13.5px] font-medium">{member.name || member.email}</p>
                        <p className="presence-meta mt-0.5 text-[12px] text-[var(--b-muted)]">{online ? "Online now" : `Offline · ${timeAgo(member.occurredAt)}`}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="presence-meta px-4 py-5 text-[12.5px] text-[var(--b-muted)]">Teammates appear here once they have been online.</p>
            )}
          </section>

          {/* ------------------------------------------------------------ timeline */}
          <section className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="flex h-9 items-center gap-2 rounded-full border border-[var(--b-border)] px-3.5">
                <Search size={13} className="shrink-0 text-[var(--b-muted)]" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search teammate" className="w-40 bg-transparent text-[13px] outline-none placeholder:text-[var(--b-muted)] sm:w-52" />
              </label>
              <div className="flex rounded-full border border-[var(--b-border)] p-0.5" role="group" aria-label="Filter by status">
                {(["all", "online", "offline"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={statusFilter === value}
                    onClick={() => setStatusFilter(value)}
                    className={`cursor-pointer rounded-full px-3 py-1.5 text-[12.5px] capitalize transition ${statusFilter === value ? "bg-[var(--b-surface-2)] font-medium text-[var(--b-text)]" : "text-[var(--b-muted)] hover:text-[var(--b-text)]"}`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <SkeletonRows rows={5} className="mt-5 py-2" />
            ) : groups.length ? (
              <div className="mt-5 space-y-6">
                {groups.map((group) => (
                  <div key={group.label}>
                    <p className="presence-meta px-1 pb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-[var(--b-muted)]">{group.label}</p>
                    <ul className="overflow-hidden rounded-[10px] border border-[var(--b-border)]">
                      {group.items.map((event) => {
                        const online = event.status === "online";
                        return (
                          <li key={event.id} className="flex items-center gap-3 border-t border-[var(--b-border)] px-4 py-3 transition-colors first:border-t-0 hover:bg-[var(--b-surface-2)]">
                            <span className={`h-2 w-2 shrink-0 rounded-full ${online ? "bg-[var(--b-good)]" : "bg-[var(--b-track)]"}`} aria-hidden="true" />
                            <p className="min-w-0 flex-1 truncate text-[14px]">
                              <span className="presence-name font-medium">{event.name || event.email}</span>
                              <span className="presence-meta text-[var(--b-muted)]"> {online ? "came online" : "went offline"}</span>
                            </p>
                            <time
                              dateTime={event.occurredAt}
                              title={new Date(event.occurredAt).toLocaleString()}
                              className="presence-meta shrink-0 text-[12.5px] tabular-nums text-[var(--b-muted)]"
                            >
                              {new Date(event.occurredAt).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
                            </time>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-5 flex flex-col items-center rounded-[10px] border border-dashed border-[var(--b-border)] px-6 py-14 text-center">
                <span className="grid size-11 place-items-center rounded-full bg-[var(--b-surface-2)] text-[var(--b-muted)]"><Search size={18} /></span>
                <p className="mt-3 text-[14px] font-medium">{filtering ? "No activity matches this search or filter" : "No presence activity yet"}</p>
                <p className="mt-1 text-[12.5px] text-[var(--b-muted)]">{filtering ? "Try a different name, or show all activity." : "Online and offline events will appear here as teammates come and go."}</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

type SiteTag = { id: string; name: string; domain: string; publicKey: string; allowLocalhost: boolean; status: "unverified" | "verified"; createdAt: string; lastUsedAt: string | null; permissions: { analytics: boolean; visitors: boolean; support: boolean } };

// A WordPress admin menu path shown as small chips: Plugins › Add New › Upload Plugin.
function PathChips({ items }: { items: string[] }) {
  return (
    <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
      {items.map((item, index) => (
        <span key={item} className="flex items-center gap-1.5">
          {index > 0 && <ChevronRight size={14} className="tg-t" aria-hidden="true" />}
          <span className="tg-chip rounded-md border px-2.5 py-1 text-[13px] font-medium">{item}</span>
        </span>
      ))}
    </span>
  );
}

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
  const [capabilities, setCapabilities] = useState({ chat: true, visitors: true, identify: true });
  // The connect dialog asks what the site is built with first: WordPress gets the plugin, anything else gets the code snippet.
  const [createStep, setCreateStep] = useState<"platform" | "details" | "wordpress">("platform");
  const [platform, setPlatform] = useState<"wordpress" | "html">("html");
  const [wpChecking, setWpChecking] = useState(false);
  const [wpMessage, setWpMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [creatingTag, setCreatingTag] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SiteTag | null>(null);
  const [deletingTagId, setDeletingTagId] = useState<string | null>(null);

  function openTagDialog(tag: SiteTag, nextDialog: "install" | "permissions") { setSelectedTag(tag); setDialog(nextDialog); setCopied(false); setVerificationMessage(null); }

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

  useEffect(() => {
    let active = true;
    fetch("/api/workspace/sites", { cache: "no-store" })
      .then(async (response) => ({ ok: response.ok, data: await response.json() as { sites?: SiteTag[]; message?: string } }))
      .then(({ ok, data }) => { if (active) { setTags(data.sites ?? []); if (!ok) setTagError(data.message ?? "Could not load site tags."); } })
      .catch(() => { if (active) setTagError("Could not connect to the tag service."); })
      .finally(() => { if (active) setLoadingTags(false); });
    return () => { active = false; };
  }, []);

  // The plugin links the site itself (sign in, then back), so there is no tag to create here: this only looks for a connected site.
  // Silent checks (the automatic ones) only ever report success, so they never flash an error while the person is still in WordPress.
  async function checkWordpressConnection(silent = false) {
    if (!silent) { setWpChecking(true); setWpMessage(null); }
    try {
      const response = await fetch("/api/workspace/sites", { cache: "no-store" });
      const result = (await response.json()) as { sites?: SiteTag[] };
      const sites = result.sites ?? [];
      const verified = sites.find((site) => site.status === "verified");
      if (verified) { setTags(sites); setWpMessage({ ok: true, text: verified.domain ? `Connected to ${verified.domain}` : "Connected" }); }
      else if (!silent) setWpMessage({ ok: false, text: "Not connected yet. Finish the steps in WordPress, open your site once, then check again." });
    } catch {
      if (!silent) setWpMessage({ ok: false, text: "Could not check right now. Try again." });
    } finally {
      if (!silent) setWpChecking(false);
    }
  }
  // While the plugin steps are open, look for the connection every few seconds so the dialog updates by itself.
  const wordpressWaiting = dialog === "create" && createStep === "wordpress" && !wpMessage?.ok;
  useEffect(() => {
    if (!wordpressWaiting) return;
    const timer = setInterval(() => { void checkWordpressConnection(true); }, 5000);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordpressWaiting]);
  function closeCreateDialog() { setDialog(null); setCreateStep("platform"); setPlatform("html"); setWpMessage(null); setSiteName(""); setSiteUrl(""); setAllowLocalhost(false); setCapabilities({ chat: true, visitors: true, identify: true }); setTagError(null); }
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
      setCreateStep("platform");
      setPlatform("html");
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

  async function verifyTag() {
    if (!selectedTag) return;
    setVerifying(true);
    setVerificationMessage(null);
    const response = await fetch("/api/workspace/sites", { cache: "no-store" });
    const result = (await response.json()) as { sites?: SiteTag[] };
    const refreshed = result.sites?.find((item) => item.id === selectedTag.id);
    if (refreshed) {
      setSelectedTag(refreshed);
      setTags(result.sites ?? []);
      setVerificationMessage(refreshed.status === "verified" ? "Tag connected successfully." : "No visit detected yet. Open the installed website, then try again.");
    } else {
      setVerificationMessage("Could not find this tag.");
    }
    setVerifying(false);
  }

  return (
    <div className="dashboard-tag-manager-page tag-page mx-auto w-full max-w-[1120px] px-7 pb-14 pt-8 sm:px-9 lg:px-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="tag-heading text-[29px] font-normal tracking-[-0.04em]">Website</h2>
          <p className="tag-paragraph mt-2 max-w-xl text-[15px] leading-7">Connect your website so the chat widget can appear on it.</p>
        </div>
        {/* One domain per workspace, enforced server-side (SitesController's SITE_LIMIT): once a website is connected there is
            nothing to add. A second domain means a second workspace instead. */}
        {tags.length === 0 && !loadingTags && (
          <button type="button" onClick={() => setDialog("create")} className="tag-btn tag-btn-primary flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-6 text-[14px] font-semibold transition">
            <Plus size={16} /> Connect website
          </button>
        )}
      </header>

      {tagError && !dialog && (
        <div role="alert" className="mt-6 flex items-center justify-between gap-3 rounded-xl bg-[#FFF2F2] px-4 py-3 text-[13px] font-medium text-[#A64A53]">
          <span>{tagError}</span>
          <button type="button" onClick={() => setTagError(null)} aria-label="Dismiss error" className="cursor-pointer"><X size={16} /></button>
        </div>
      )}

      {loadingTags ? (
        <SkeletonRows rows={3} className="mt-8 py-4" />
      ) : tags.length === 0 ? (
        <div className="tag-card mt-8 flex flex-col items-center rounded-2xl border border-dashed px-6 py-16 text-center">
          <span className="tag-card-icon flex size-14 items-center justify-center rounded-2xl"><Globe2 size={26} /></span>
          <h3 className="tag-heading mt-5 text-[21px] font-semibold tracking-[-0.02em]">No website connected yet</h3>
          <p className="tag-paragraph mt-2 max-w-md text-[15px] leading-7">Add your website to get a short snippet. Paste it into your site and the chat widget goes live.</p>
          <button type="button" onClick={() => setDialog("create")} className="tag-btn tag-btn-primary mt-6 flex h-11 cursor-pointer items-center gap-2 rounded-full border px-6 text-[14px] font-semibold transition">
            <Plus size={16} /> Connect website
          </button>
        </div>
      ) : (
        tags.map((tag) => {
          const permissionCount = Object.values(tag.permissions).filter(Boolean).length;
          const verified = tag.status === "verified";
          const facts: [string, string][] = [
            ["Access", permissionCount === 3 ? "Full access" : `${permissionCount} of 3 enabled`],
            ["Last activity", tag.lastUsedAt ? new Date(tag.lastUsedAt).toLocaleDateString() : "Never"],
            ["Added", new Date(tag.createdAt).toLocaleDateString()],
            ["Public key", `${tag.publicKey.slice(0, 12)}…`],
          ];
          return (
            <article key={tag.id} className="tag-card mt-7 rounded-2xl border p-6 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="tag-card-icon flex size-12 shrink-0 items-center justify-center rounded-xl"><Globe2 size={22} /></span>
                  <div className="min-w-0">
                    <p className="tag-heading truncate text-[19px] font-semibold tracking-[-0.02em]">{tag.name}</p>
                    <p className="tag-paragraph mt-0.5 truncate text-[15px]">{tag.domain}</p>
                  </div>
                </div>
                <span
                  className={`tag-badge ${verified ? "tag-badge-verified" : "tag-badge-pending"} inline-flex w-fit items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold`}
                  title={verified ? "The tag has reported in from your site." : "No visit detected yet. Install the tag, open your site, then verify."}
                >
                  {verified ? (
                    <CheckCircle2 size={15} aria-hidden="true" />
                  ) : (
                    <span className="relative flex size-2" aria-hidden="true">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-50" />
                      <span className="relative inline-flex size-2 rounded-full bg-current" />
                    </span>
                  )}
                  {verified ? "Verified" : "Pending"}
                </span>
              </div>

              {!verified && (
                <div className="tag-callout mt-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border px-5 py-4">
                  <p className="tag-heading text-[15px] leading-6"><strong className="font-semibold">One step left.</strong> <span className="tag-paragraph">Install the snippet on your website, then verify it.</span></p>
                  <button type="button" onClick={() => openTagDialog(tag, "install")} className="tag-btn tag-btn-primary flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-5 text-[14px] font-semibold transition">
                    Install and verify <ArrowRight size={15} />
                  </button>
                </div>
              )}

              <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
                {facts.map(([label, value]) => (
                  <div key={label} className="min-w-0">
                    <dt className="tag-paragraph text-[13px]">{label}</dt>
                    <dd className={`tag-heading mt-1 truncate text-[15px] font-medium ${label === "Public key" ? "font-mono text-[14px]" : ""}`}>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="tag-card-actions mt-7 flex flex-wrap items-center gap-2.5 border-t pt-5">
                <button type="button" onClick={() => openTagDialog(tag, "install")} className="tag-btn flex h-10 cursor-pointer items-center gap-2 rounded-full border px-5 text-[14px] font-medium transition"><Code2 size={16} /> Install snippet</button>
                <button type="button" onClick={() => openTagDialog(tag, "permissions")} className="tag-btn flex h-10 cursor-pointer items-center gap-2 rounded-full border px-5 text-[14px] font-medium transition"><ShieldCheck size={16} /> Permissions</button>
                <button type="button" onClick={() => setDeleteTarget(tag)} className="tag-btn tag-btn-danger ml-auto flex h-10 cursor-pointer items-center gap-2 rounded-full border px-5 text-[14px] font-medium transition"><Trash2 size={16} /> Delete</button>
              </div>
            </article>
          );
        })
      )}

      {tags.length > 0 && <p className="tag-paragraph mt-5 text-[14px] leading-6">A workspace can connect one website. To support another domain, create a separate workspace for it.</p>}

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
        <div className="tg-root fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !creatingTag) closeCreateDialog(); }}>
          <div role="dialog" aria-modal="true" aria-label="Connect a website" className="tg-dialog flex max-h-[min(760px,calc(100dvh-32px))] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl border shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
            <div className="tg-divide flex shrink-0 items-start justify-between gap-3 border-b px-5 py-4">
              <div className="flex min-w-0 items-center gap-3.5">
                {createStep !== "platform" ? (
                  <button type="button" onClick={() => { setCreateStep("platform"); setTagError(null); setWpMessage(null); }} aria-label="Back" className="tg-close flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl transition"><ArrowLeft size={19} /></button>
                ) : (
                  <span className="tg-icon flex size-10 shrink-0 items-center justify-center rounded-xl"><Globe2 size={20} /></span>
                )}
                <div className="min-w-0">
                  <h3 className="tg-h text-[19px] font-semibold tracking-[-0.02em]">Connect a website</h3>
                  <p className="tg-t text-[14px]">Step {createStep === "platform" ? 1 : 2} of 2</p>
                </div>
              </div>
              <button type="button" onClick={closeCreateDialog} disabled={creatingTag} aria-label="Close" className="tg-close flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition"><X size={18} /></button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {createStep === "platform" && (
                <>
                  <h4 className="tg-h text-[16px] font-semibold">What is your website built with?</h4>
                  <p className="tg-t mt-1 text-[13.5px] leading-6">We&apos;ll show you the easiest way to add the chat widget.</p>
                  <div role="radiogroup" aria-label="Website platform" className="mt-4 flex flex-col gap-2.5">
                    {([
                      { value: "wordpress" as const, title: "WordPress", description: "Install our plugin. No code needed.", logo: "/platform-logos/wordpress.svg" },
                      { value: "html" as const, title: "HTML or other", description: "Paste one line of code into your site. Works with Shopify, Wix and more.", logo: "/platform-logos/html5.svg" },
                    ]).map((option) => (
                      <button key={option.value} type="button" role="radio" aria-checked={platform === option.value} onClick={() => setPlatform(option.value)} className={`tg-option flex w-full cursor-pointer items-center gap-3.5 rounded-2xl border p-3 text-left transition ${platform === option.value ? "tg-option-on" : ""}`}>
                        <span className="tg-logo flex size-12 shrink-0 items-center justify-center rounded-xl bg-white p-2.5 shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={option.logo} alt="" aria-hidden="true" className="size-full object-contain" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="tg-h block text-[15.5px] font-semibold">{option.title}</span>
                          <span className="tg-t mt-0.5 block text-[13.5px] leading-5">{option.description}</span>
                        </span>
                        <span className="tg-radio flex size-6 shrink-0 items-center justify-center rounded-full border-2" aria-hidden="true">{platform === option.value && <span className="tg-radio-dot size-3 rounded-full" />}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}

              {createStep === "details" && (
                <>
                  <label className="block">
                    <span className="tg-h text-[15px] font-medium">Website URL</span>
                    <div className="tg-field mt-2 flex h-11 overflow-hidden rounded-xl border">
                      <span className="tg-line flex items-center border-r px-3.5 text-[14.5px]">https://</span>
                      <input value={siteUrl} onChange={(event) => setSiteUrl(event.target.value.replace(/^https?:\/\//i, ""))} placeholder="www.mywebsite.com" autoFocus className="tg-input min-w-0 flex-1 bg-transparent px-3.5 text-[15px] outline-none" />
                    </div>
                  </label>
                  <label className="mt-4 block">
                    <span className="tg-h text-[15px] font-medium">Display name</span>
                    <input value={siteName} onChange={(event) => setSiteName(event.target.value)} placeholder="My Website" className="tg-field tg-input mt-2 h-11 w-full rounded-xl border bg-transparent px-3.5 text-[15px] outline-none" />
                  </label>

                  <details className="tg-box group mt-5 rounded-xl border">
                    <summary className="tg-h flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 text-[15px] font-medium">
                      Advanced options
                      <ChevronDown size={16} className="transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="tg-divide border-t px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="tg-h text-[15px] font-medium">Allow localhost for development</p>
                          <p className="tg-t mt-0.5 text-[14px] leading-5">Off by default. When off, the tag only loads on <span className="tg-h font-medium">{siteUrl.trim().replace(/^https?:\/\//i, "").split("/")[0] || "your website"}</span>.</p>
                        </div>
                        <Switch checked={allowLocalhost} onCheckedChange={setAllowLocalhost} aria-label="Allow localhost for development" />
                      </div>
                      <p className="tg-h mb-1 mt-5 text-[15px] font-medium">What this tag can do</p>
                      {[
                        { key: "chat" as const, title: "Live chat widget", description: "Show the chat bubble so visitors can talk to your AI teammate." },
                        { key: "visitors" as const, title: "Visitor analytics", description: "See who's on your site right now and where they came from." },
                        { key: "identify" as const, title: "Customer identification", description: "Recognise signed-in visitors. Needs identity verification set up in Settings." },
                      ].map(({ key, title, description }) => (
                        <div key={key} className="tg-divide flex items-start gap-3 border-t py-3 first:border-t-0">
                          <div className="min-w-0 flex-1">
                            <p className="tg-h text-[14.5px] font-medium">{title}</p>
                            <p className="tg-t text-[13.5px] leading-5">{description}</p>
                          </div>
                          <Switch checked={capabilities[key]} onCheckedChange={(checked) => setCapabilities((current) => ({ ...current, [key]: checked }))} aria-label={title} />
                        </div>
                      ))}
                    </div>
                  </details>
                  {tagError && <p role="alert" className="tg-error mt-4 text-[14px] font-medium">{tagError}</p>}
                </>
              )}

              {createStep === "wordpress" && (
                <>
                  <p className="tg-t text-[14px] leading-6">Install the Elpino Chat plugin on your WordPress site. It takes about two minutes.</p>
                  <ol className="mt-4">
                    {[
                      { title: "Download the plugin", body: (
                        <>
                          <div className="tg-box mt-2 flex items-center gap-3 rounded-xl border p-3">
                            <span className="tg-icon flex size-10 shrink-0 items-center justify-center rounded-lg"><FileArchive size={19} /></span>
                            <span className="min-w-0 flex-1">
                              <span className="tg-h block truncate text-[14.5px] font-medium">elpino-chat.zip</span>
                              <span className="tg-t block text-[13px]">WordPress plugin · Keep it zipped</span>
                            </span>
                            <a href="/downloads/elpino-chat.zip" download className="tg-btn inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition"><Download size={15} /> Download</a>
                          </div>
                        </>
                      ) },
                      { title: "Upload it in WordPress", body: (
                        <>
                          <p className="tg-t mt-1 text-[14px] leading-6">In your WordPress admin, open</p>
                          <PathChips items={["Plugins", "Add New", "Upload Plugin"]} />
                          <p className="tg-t mt-2 text-[14px] leading-6">Choose the file, then click <span className="tg-h font-medium">Install Now</span> and <span className="tg-h font-medium">Activate</span>.</p>
                        </>
                      ) },
                      { title: "Connect to Elpino", body: (
                        <>
                          <p className="tg-t mt-1 text-[14px] leading-6">Open</p>
                          <PathChips items={["Settings", "Elpino Chat"]} />
                          <p className="tg-t mt-2 text-[14px] leading-6">Click <span className="tg-h font-medium">Connect to Elpino</span> and sign in. You&apos;ll come straight back with the widget live.</p>
                        </>
                      ) },
                      { title: "Confirm the connection", body: (
                        <div className={`tg-box mt-2 flex items-center gap-3 rounded-xl border p-3 ${wpMessage?.ok ? "tg-status-ok" : ""}`} role="status">
                          <span className="tg-icon flex size-10 shrink-0 items-center justify-center rounded-lg">
                            {wpMessage?.ok ? <CheckCircle2 size={19} /> : <LoaderCircle size={19} className="animate-spin" />}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="tg-h block text-[14.5px] font-medium">{wpMessage?.ok ? wpMessage.text : "Waiting for your site to connect"}</span>
                            <span className="tg-t block text-[13px]">{wpMessage?.ok ? "Your chat widget is live." : wpMessage?.text ?? "This updates by itself. Open your website once after connecting."}</span>
                          </span>
                          {!wpMessage?.ok && <button type="button" disabled={wpChecking} onClick={() => void checkWordpressConnection()} className="tg-btn inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-4 text-[14px] font-medium transition disabled:opacity-50">{wpChecking && <LoaderCircle size={14} className="animate-spin" />} Check now</button>}
                        </div>
                      ) },
                    ].map((step, index, all) => (
                      <li key={step.title} className="relative flex gap-3.5 pb-5 last:pb-0">
                        {index < all.length - 1 && <span className="tg-rail absolute left-4 top-9 -ml-px h-[calc(100%-2.25rem)] w-px" aria-hidden="true" />}
                        <span className="tg-num relative flex size-8 shrink-0 items-center justify-center rounded-full border text-[13.5px] font-semibold" aria-hidden="true">{index + 1}</span>
                        <div className="min-w-0 flex-1 pt-1">
                          <p className="tg-h text-[15px] font-semibold">{step.title}</p>
                          {step.body}
                        </div>
                      </li>
                    ))}
                  </ol>
                </>
              )}
            </div>

            <div className="tg-divide flex shrink-0 items-center justify-end gap-2.5 border-t px-5 py-3">
              {createStep === "platform" && (
                <>
                  <button type="button" onClick={closeCreateDialog} className="tg-btn h-11 cursor-pointer rounded-full border px-5 text-[15px] font-medium transition">Cancel</button>
                  <button type="button" onClick={() => setCreateStep(platform === "wordpress" ? "wordpress" : "details")} className="tg-primary flex h-11 cursor-pointer items-center gap-2 rounded-full border px-6 text-[15px] font-semibold transition">Next <ArrowRight size={15} /></button>
                </>
              )}
              {createStep === "details" && (
                <>
                  <button type="button" disabled={creatingTag} onClick={() => { setCreateStep("platform"); setTagError(null); }} className="tg-btn h-11 cursor-pointer rounded-full border px-5 text-[15px] font-medium transition disabled:opacity-50">Back</button>
                  <button type="button" disabled={!siteName.trim() || !siteUrl.trim() || creatingTag} onClick={() => void createTag()} className="tg-primary flex h-11 cursor-pointer items-center gap-2 rounded-full border px-6 text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50">
                    {creatingTag ? <><LoaderCircle size={15} className="animate-spin" /> Creating…</> : <>Create tag <ArrowRight size={15} /></>}
                  </button>
                </>
              )}
              {createStep === "wordpress" && (
                <button type="button" onClick={closeCreateDialog} className="tg-primary flex h-11 cursor-pointer items-center gap-2 rounded-full border px-6 text-[15px] font-semibold transition">Done</button>
              )}
            </div>
          </div>
        </div>
      )}

      <Link href="/dashboard/settings/identity" className="tag-verify-card group mt-8 flex flex-wrap items-center gap-x-5 gap-y-4 rounded-2xl border p-5 transition sm:flex-nowrap">
        <span className="tag-verify-icon flex size-12 shrink-0 items-center justify-center rounded-xl"><UserCheck size={22} /></span>
        <span className="min-w-0 flex-1">
          <span className="tag-verify-title block text-[15px] font-semibold tracking-[-0.01em]">Verify signed-in customers</span>
          <span className="tag-verify-text mt-1 block max-w-xl text-[13px] leading-6">Let the AI safely look up a logged-in customer&apos;s own payments and records.</span>
        </span>
        <span className="tag-verify-action inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-5 text-[13px] font-medium transition">
          Set up <ArrowRight size={15} className="transition group-hover:translate-x-0.5" />
        </span>
      </Link>

      {(dialog === "install" || dialog === "permissions") && selectedTag && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/35 p-4 backdrop-blur-[2px]" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDialog(null); }}><div role="dialog" aria-modal="true" className="dashboard-tag-install-panel w-full max-w-[660px] overflow-hidden rounded-[24px] border border-black/10 shadow-[0_28px_80px_rgba(15,23,42,0.24)]"><div className="dashboard-tag-install-header flex items-start justify-between border-b border-[#E5E9EB] px-6 py-5"><div><h3 className="text-[22px] font-semibold tracking-[-0.02em]">{dialog === "install" ? "Installation requirements" : `Permissions for ${selectedTag.name}`}</h3><p className="dashboard-tag-table-text mt-1 text-[14px] text-white/80">{dialog === "install" ? `What you need to get the chat widget live on ${selectedTag.domain}.` : "Choose what this site tag is allowed to collect."}</p></div><button type="button" onClick={() => setDialog(null)} className="dashboard-tag-install-close flex h-9 w-9 items-center justify-center rounded-lg"><X size={17} /></button></div>
        {dialog === "install" && (
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6 sm:p-7">
            <ol className="dashboard-tag-steps space-y-7">
              <li className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-current text-[14px] font-semibold" aria-hidden="true">1</span>
                <div className="min-w-0 flex-1">
                  <p className="tag-heading text-[16px] font-semibold">Copy the snippet</p>
                  <div className="mt-3 rounded-2xl bg-[#11120f] p-4 text-white">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/60">Install snippet</span>
                      <button type="button" onClick={async () => { await navigator.clipboard.writeText(snippet); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-white/25 px-3.5 text-[13px] font-semibold text-white/90 transition hover:bg-white/10">
                        {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                      </button>
                    </div>
                    <HighlightedCode code={snippet} lang="markup" className="text-[13.5px]" />
                  </div>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-current text-[14px] font-semibold" aria-hidden="true">2</span>
                <div className="min-w-0 flex-1">
                  <p className="tag-heading text-[16px] font-semibold">Paste it into your site</p>
                  <p className="tag-paragraph dashboard-tag-table-text mt-1 text-[14px] leading-6 text-[#667069]">Add it to every page, just before the closing <code className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-[13px]">&lt;/head&gt;</code> tag.</p>
                </div>
              </li>

              <li className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-current text-[14px] font-semibold" aria-hidden="true">3</span>
                <div className="min-w-0 flex-1">
                  <p className="tag-heading text-[16px] font-semibold">Publish, then verify</p>
                  <p className="tag-paragraph dashboard-tag-table-text mt-1 text-[14px] leading-6 text-[#667069]">Publish your website and open it once, then check that the tag reports in.</p>
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
                    {verificationMessage && <p role="status" className={`text-[14px] font-medium ${selectedTag.status === "verified" ? "text-[#257A4D]" : "text-[#A66A2C]"}`}>{verificationMessage}</p>}
                    <button type="button" disabled={verifying} onClick={() => void verifyTag()} className="tag-verify-button flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full bg-[#11120f] px-6 text-[14px] font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
                      {verifying ? <><LoaderCircle size={15} className="animate-spin" /> Verifying</> : <><CheckCircle2 size={15} /> Verify tag</>}
                    </button>
                  </div>
                </div>
              </li>
            </ol>

            <details className="dashboard-tag-csp group mt-7 rounded-xl border border-[#E2DFD8] bg-[#FAFBFB] p-4">
              <summary className="tag-heading flex cursor-pointer list-none items-center justify-between gap-3 text-[15px] font-semibold text-[#17181a]">
                Have a Content-Security-Policy?
                <ChevronDown size={16} className="shrink-0 transition-transform group-open:rotate-180" />
              </summary>
              <p className="tag-paragraph mt-3 text-[14px] leading-6 text-[#667069]">Add these to your existing policy. A strict policy is enforced by your own site, so this is the one thing we can&apos;t fix from our side. Without it the tag loads but the chat bubble silently never appears.</p>
              <div className="mt-3 rounded-lg bg-[#11120f] p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-white/60">script-src / connect-src / frame-src</span>
                  <button type="button" onClick={async () => { await navigator.clipboard.writeText(cspSnippet); setCspCopied(true); setTimeout(() => setCspCopied(false), 2000); }} className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-white/25 px-3 text-[12.5px] font-semibold text-white/90 transition hover:bg-white/10">
                    {cspCopied ? <><Check size={13} /> Copied</> : <><Copy size={13} /> Copy</>}
                  </button>
                </div>
                <HighlightedCsp code={cspSnippet} className="text-[13px]" />
              </div>
            </details>

          </div>
        )}
        {dialog === "permissions" && <div className="divide-y divide-[#E9ECEE]">{([{ key: "analytics", title: "Analytics", description: "Collect page views, referrers, and engagement events." }, { key: "visitors", title: "Visitor counts", description: "Count unique and returning visitors for reporting." }, { key: "support", title: "Support context", description: "Attach the current page and session context to support conversations." }] as const).map((permission) => <div key={permission.key} className="flex items-start gap-4 px-6 py-5"><div className="min-w-0 flex-1"><p className="tag-heading text-[16px] font-semibold">{permission.title}</p><p className="tag-paragraph mt-1 text-[14px] leading-6 text-[#667069]">{permission.description}</p></div><Toggle checked={selectedTag.permissions[permission.key]} onChange={() => updateSelectedTag({ ...selectedTag, permissions: { ...selectedTag.permissions, [permission.key]: !selectedTag.permissions[permission.key] } })} label={permission.title} /></div>)}<div className="flex items-start gap-4 px-6 py-5"><div className="min-w-0 flex-1"><p className="tag-heading text-[16px] font-semibold">Allow localhost</p><p className="tag-paragraph mt-1 text-[14px] leading-6 text-[#667069]">Let this tag run on localhost and 127.0.0.1 while you develop. Turn it off for a site that is only used in production.</p></div><Toggle checked={selectedTag.allowLocalhost} onChange={() => updateSelectedTag({ ...selectedTag, allowLocalhost: !selectedTag.allowLocalhost })} label="Allow localhost" /></div></div>}
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
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}
    >
      <div role="dialog" aria-modal="true" aria-label="Set up authenticator app" className="twofa-dialog flex max-h-[calc(100dvh-32px)] w-full max-w-[460px] flex-col overflow-hidden rounded-2xl border shadow-[0_28px_80px_rgba(0,0,0,0.4)]">
        <div className="twofa-divider flex shrink-0 items-start justify-between gap-3 border-b px-6 py-5">
          <div className="flex items-center gap-3.5">
            <span className="twofa-icon flex size-11 shrink-0 items-center justify-center rounded-xl"><ShieldCheck size={21} /></span>
            <div>
              <h3 className="twofa-heading text-[19px] font-semibold tracking-[-0.02em]">Set up authenticator app</h3>
              <p className="twofa-text mt-0.5 text-[14px]">Scan, then verify with a code</p>
            </div>
          </div>
          <button type="button" aria-label="Close" onClick={onClose} className="twofa-close flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-lg transition"><X size={18} /></button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
          <ol className="space-y-7">
            <li className="flex gap-4">
              <span className="twofa-heading flex size-8 shrink-0 items-center justify-center rounded-full border border-current text-[14px] font-semibold" aria-hidden="true">1</span>
              <div className="min-w-0 flex-1">
                <p className="twofa-heading text-[16px] font-semibold">Scan the QR code</p>
                <p className="twofa-text mt-1 text-[14.5px] leading-6">Use Google Authenticator, 1Password, or a similar app.</p>

                {/* The QR code sits on white in both themes: scanners need the contrast. */}
                <div className="mt-4 flex items-center justify-center rounded-2xl bg-white p-4">
                  {qrDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={qrDataUrl} alt="Scan this QR code with your authenticator app" width={176} height={176} className="h-44 w-44" />
                  ) : (
                    <div className="flex h-44 w-44 items-center justify-center"><LoaderCircle size={22} className="animate-spin text-[#9aa1a6]" /></div>
                  )}
                </div>

                <button type="button" onClick={() => setShowSecret(!showSecret)} aria-expanded={showSecret} className="twofa-link mt-3 cursor-pointer text-[14px] font-medium underline underline-offset-4">
                  {showSecret ? "Hide manual entry code" : "Can't scan it? Enter the code manually"}
                </button>
                {showSecret && (
                  <div className="twofa-field mt-3 flex items-center gap-3 rounded-xl border px-4 py-3">
                    <code className="twofa-heading min-w-0 flex-1 truncate font-mono text-[14.5px] tracking-wider">{secret}</code>
                    <button type="button" onClick={() => void copySecret()} className="twofa-link flex shrink-0 cursor-pointer items-center gap-1.5 text-[14px] font-semibold">
                      <Copy size={14} /> {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                )}
              </div>
            </li>

            <li className="flex gap-4">
              <span className="twofa-heading flex size-8 shrink-0 items-center justify-center rounded-full border border-current text-[14px] font-semibold" aria-hidden="true">2</span>
              <div className="min-w-0 flex-1">
                <p className="twofa-heading text-[16px] font-semibold">Enter the 6-digit code</p>
                <p className="twofa-text mt-1 text-[14.5px] leading-6">Type the code your app just generated.</p>
                <input
                  autoFocus
                  value={code}
                  onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(event) => { if (event.key === "Enter") onVerify(); }}
                  placeholder="123456"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label="6-digit code"
                  className="twofa-input mt-3 h-12 w-full rounded-xl border bg-transparent px-3 text-center text-[22px] font-medium tracking-[0.4em] outline-none"
                />
                {error && <p role="alert" className="mt-2 text-[14px] font-medium text-[#e5636f]">{error}</p>}
              </div>
            </li>
          </ol>
        </div>

        <div className="twofa-divider flex shrink-0 gap-3 border-t px-6 py-4">
          <button type="button" onClick={onClose} className="twofa-btn h-11 flex-1 cursor-pointer rounded-full border text-[15px] font-medium transition">Cancel</button>
          <button type="button" disabled={busy || code.length !== 6} onClick={onVerify} className="twofa-btn twofa-btn-primary flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full border text-[15px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? <LoaderCircle size={15} className="animate-spin" /> : null} Verify &amp; enable
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
              <Link key={label} href={slug ? `/dashboard/settings/${slug}` : "/dashboard/settings"} aria-current={currentPage === label ? "page" : undefined} className={`flex h-9 w-full items-center gap-3 rounded-md px-2.5 text-left text-[14px] font-normal text-black/90 transition ${currentPage === label ? "dashboard-secondary-nav-active bg-[#eeeeee]" : "hover:bg-[#f0f0f0]"}`}>
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

// Shown to a member who opens a configuration page by its address.
function OwnerOnlyNotice() {
  return (
    <div className="owner-only mx-auto flex min-h-[60vh] w-full max-w-[520px] flex-col items-center justify-center px-6 text-center">
      <span className="owner-only-icon flex size-12 items-center justify-center rounded-xl"><ShieldCheck size={22} /></span>
      <h2 className="owner-only-h mt-4 text-[20px] font-semibold tracking-[-0.02em]">Only the workspace owner can change this</h2>
      <p className="owner-only-t mt-1.5 text-[14.5px] leading-6">These settings control the AI, your website and your plan. Ask the workspace owner if something needs to change.</p>
      <Link href="/dashboard/settings" className="owner-only-btn mt-5 flex h-11 items-center rounded-full border px-6 text-[15px] font-medium transition">Back to settings</Link>
    </div>
  );
}

export function SettingsClient({ user, page = "General", auditView = "all" }: { user: SettingsUser; page?: string; auditView?: "all" | AuditStatus }) {
  const currentPage = page;
  const role = useMyRole();
  const { open: sidebarOpen, setOpen: setSidebarOpen } = useMobileDrawer();
  const visibleItems = <T extends { label: string }>(items: T[]) => items.filter((item) => canOpenPage(item.label, role));
  const [previewPanel, setPreviewPanel] = useState<HTMLDivElement | null>(null);
  const showPreviewPanel = currentPage === "Chatbot Interface";

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
          <SidebarNavGroup title="Account" items={visibleItems(accountItems)} currentPage={currentPage} spacingClassName="mt-1" />
          {visibleItems(chatbotItems).length > 0 && <SidebarNavGroup title="Chatbot" items={visibleItems(chatbotItems)} currentPage={currentPage} />}
          <SidebarNavGroup title="Workspace" items={visibleItems(workspaceItems)} currentPage={currentPage} />
        </div>
      </div>

      <section className="dashboard-page-surface dashboard-settings-surface relative h-full min-w-0 flex-1 overflow-y-auto bg-[#262626] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {pageNeedsOwner(currentPage) && role === null ? (
          <div role="status" aria-busy="true" aria-label="Loading" className="mx-auto w-full max-w-[1120px] space-y-4 px-8 pt-10"><Bone className="h-8 w-56" /><Bone className="h-4 w-80" /><Bone className="h-40 w-full" /></div>
        ) : !canOpenPage(currentPage, role) ? (
          <OwnerOnlyNotice />
        ) : currentPage === "General" ? (
          <GeneralSettingsPage user={user} />
        ) : currentPage === "Chatbot Interface" ? (
          <ChatbotInterfaceSettingsPage previewContainer={previewPanel} />
        ) : currentPage === "Restrictions" ? (
          <ChatbotUrlRestrictionsSettingsPage />
        ) : currentPage === "Behavior" ? (
          <ChatbotBehaviorSettingsPage />
        ) : currentPage === "People" ? (
          <PeopleSettingsPage />
        ) : currentPage === "Members" ? (
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
        ) : currentPage === "Danger Zone" ? (
          <WorkspaceDangerZoneSettingsPage />
        ) : currentPage === "Tag Manager" ? (
          <TagManagerSettingsPage />
        ) : currentPage === "Identity Verification" ? (
          <IdentityVerificationSettingsPage />
        ) : currentPage === "Translations" ? (
          <TranslationSettingsPage />
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
