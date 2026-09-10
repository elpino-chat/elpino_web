"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Check,
  Code2,
  Copy,
  GraduationCap,
  Landmark,
  Layers,
  Sparkles,
  ShoppingBag,
  Stethoscope,
  Store,
} from "lucide-react";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { setStoredLanguage, useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { ConnectorLogo } from "../components/ConnectorLogo";
import {
  AirtableIcon,
  BambooHrIcon,
  BetterStackIcon,
  BoxIcon,
  CalComIcon,
  CalendarIcon,
  CalendlyIcon,
  DeelIcon,
  DiscordIcon,
  DropboxIcon,
  FigmaIcon,
  GitHubIcon,
  GmailIcon,
  GoogleDriveIcon,
  GumroadIcon,
  JiraIcon,
  LemonSqueezyIcon,
  MongoDbIcon,
  MpesaIcon,
  NotionIcon,
  PagerDutyIcon,
  PostgresIcon,
  QuickBooksIcon,
  RazorpayIcon,
  StatuspageIcon,
  StripeIcon,
  TrelloIcon,
  TwilioIcon,
  TypeformIcon,
  UptimeRobotIcon,
  WiseIcon,
  XeroIcon,
} from "../components/ConnectorIcons";

type OnboardingState = {
  source?: string;
  hearAboutUs?: string;
  googleConnected?: boolean;
  telegramLinked?: boolean;
  slackLinked?: boolean;
  profileCompleted?: boolean;
  completedAt?: string;
};

type ConnectorSummary = { provider: string; status: string };

type ConnectorField = {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
};

type ConnectorItem = {
  provider: string;
  title: string;
  description: string;
  category: "Google" | "Scheduling" | "Payments" | "Databases" | "Team" | "APIs";
  authType: "oauth" | "manual";
  icon: React.ComponentType<{ className?: string }>;
  fields?: ConnectorField[];
  prompts: string[];
  website?: string;
  privacy?: string;
};

const CONNECTOR_CATALOG: ConnectorItem[] = [
  {
    provider: "gmail",
    title: "Gmail",
    description:
      "elpino watches your inbox, surfaces important emails, triages by priority, and drafts approved replies — all without you lifting a finger.",
    category: "Google",
    authType: "oauth",
    icon: GmailIcon,
    prompts: [
      "Find unread emails that need a reply and draft brief responses for each.",
      "Summarize investor and customer emails from this week.",
      "Which emails have payment or invoice details I should action?",
      "Flag any follow-ups I haven't replied to in the last 7 days.",
    ],
    website: "https://mail.google.com",
    privacy: "https://policies.google.com/privacy",
  },
  {
    provider: "calendar",
    title: "Google Calendar",
    description:
      "elpino checks your calendar for conflicts, creates and reschedules events with your approval, and sends reminders before meetings.",
    category: "Google",
    authType: "oauth",
    icon: CalendarIcon,
    prompts: [
      "What's on my calendar today and tomorrow?",
      "Find a free 1-hour slot this week for a team sync.",
      "Move my 3pm meeting to tomorrow morning and notify the attendee.",
      "Create a calendar event for Tuesday at 10am with Naman.",
    ],
    website: "https://calendar.google.com",
    privacy: "https://policies.google.com/privacy",
  },
  {
    provider: "google_workspace",
    title: "Google Drive, Sheets & Docs",
    description:
      "Upload files, append sheet rows, and create documents from an automation. A separate grant from Gmail/Calendar.",
    category: "Google",
    authType: "oauth",
    icon: GoogleDriveIcon,
    prompts: [
      "Create a new Google Doc summarizing this week's investor updates.",
      "Append today's signups to my tracking spreadsheet.",
      "Upload this report to my Drive folder.",
      "Find the sales spreadsheet and tell me the latest totals.",
    ],
    website: "https://drive.google.com",
    privacy: "https://policies.google.com/privacy",
  },
  {
    provider: "calcom",
    title: "Cal.com",
    description:
      "elpino views your bookings, creates meetings, and sends scheduling notifications through Cal.com.",
    category: "Scheduling",
    authType: "oauth",
    icon: CalComIcon,
    prompts: [
      "What meetings do I have booked through Cal.com this week?",
      "Create a 30-minute Cal.com booking link for tomorrow.",
      "Any new bookings I haven't confirmed yet?",
      "Cancel my 4pm Cal.com meeting and notify the attendee.",
    ],
    website: "https://cal.com",
    privacy: "https://cal.com/privacy",
  },
  {
    provider: "razorpay",
    title: "Razorpay",
    description:
      "Read-only revenue snapshots, failed payment alerts, and settlement checks — so you always know where your cash stands.",
    category: "Payments",
    authType: "manual",
    icon: RazorpayIcon,
    fields: [
      { name: "keyId", label: "Key ID", placeholder: "rzp_live_..." },
      { name: "keySecret", label: "Key Secret", type: "password" },
    ],
    prompts: [
      "What's my revenue this month vs last month?",
      "Show failed payments from the last 7 days.",
      "How much did we collect in settlements last week?",
      "List my top customers by payment amount.",
    ],
    website: "https://razorpay.com",
    privacy: "https://razorpay.com/privacy/",
  },
  {
    provider: "stripe",
    title: "Stripe",
    description:
      "Read-only subscription, MRR, invoices, and failed payment checks surfaced in your morning brief.",
    category: "Payments",
    authType: "oauth",
    icon: StripeIcon,
    // Manual fallback: a restricted secret key works for users who'd rather
    // not grant OAuth Connect access to their full account.
    fields: [
      { name: "secretKey", label: "Secret Key", type: "password", placeholder: "sk_live_..." },
      { name: "stripeAccountId", label: "Stripe Account ID (optional)", placeholder: "acct_...", required: false },
    ],
    prompts: [
      "What's our current MRR and how has it changed this month?",
      "Show subscriptions that churned this week.",
      "List overdue invoices and their amounts.",
      "How many new paying customers did we add today?",
    ],
    website: "https://stripe.com",
    privacy: "https://stripe.com/privacy",
  },
  {
    provider: "mpesa",
    title: "M-Pesa",
    description:
      "Safaricom Daraja business credentials — connection checks now, balance and transaction pulls coming next.",
    category: "Payments",
    authType: "manual",
    icon: MpesaIcon,
    fields: [
      { name: "consumerKey", label: "Consumer Key", type: "password" },
      { name: "consumerSecret", label: "Consumer Secret", type: "password" },
      { name: "shortcode", label: "Business Shortcode", placeholder: "e.g. 174379" },
      { name: "environment", label: "Environment", placeholder: "production or sandbox" },
    ],
    prompts: [
      "Did the M-Pesa connection check pass?",
      "What's our business shortcode set to?",
      "Confirm my Daraja credentials are still valid.",
      "Let me know when M-Pesa balance pulls are available.",
    ],
    website: "https://developer.safaricom.co.ke",
    privacy: "https://www.safaricom.co.ke/privacy-policy",
  },
  {
    provider: "github",
    title: "GitHub",
    description:
      "Open PRs, issues, and review requests involving you — briefed on demand so nothing sits waiting.",
    category: "Team",
    authType: "oauth",
    icon: GitHubIcon,
    prompts: [
      "What PRs are waiting on my review right now?",
      "Summarize open issues assigned to me.",
      "Any PRs I opened that have been sitting without comments?",
      "What merged into main today?",
    ],
    website: "https://github.com",
    privacy: "https://docs.github.com/en/site-policy/privacy-policies",
  },
  {
    provider: "jira",
    title: "Jira",
    description: "Search issues and create issues in a project from an automation.",
    category: "Team",
    authType: "oauth",
    icon: JiraIcon,
    // Manual fallback: an API token still works for users who'd rather not
    // grant OAuth access, or whose site isn't reachable via Atlassian OAuth.
    fields: [
      { name: "siteUrl", label: "Site URL (if OAuth doesn't work for your account)", placeholder: "https://yourteam.atlassian.net" },
      { name: "email", label: "Account Email", placeholder: "you@company.com" },
      { name: "apiToken", label: "API Token", type: "password", placeholder: "Create one at id.atlassian.com/manage-profile/security/api-tokens" },
    ],
    prompts: [
      "What Jira issues are still open and assigned to me?",
      "Create a Jira ticket for this bug report.",
      "Open an issue in the Engineering project for the deploy failure.",
      "Log a new task in Jira for the onboarding fix.",
    ],
    website: "https://www.atlassian.com/software/jira",
    privacy: "https://www.atlassian.com/legal/privacy-policy",
  },
  {
    provider: "trello",
    title: "Trello",
    description: "Create cards on a board from an automation.",
    category: "Team",
    authType: "manual",
    icon: TrelloIcon,
    fields: [
      { name: "apiKey", label: "API Key", placeholder: "From trello.com/app-key" },
      { name: "token", label: "Token", type: "password" },
    ],
    prompts: [
      "Add a card to my Trello board for this follow-up.",
      "Create a Trello card summarizing this request.",
      "Log this feedback as a card on the Bugs list.",
    ],
    website: "https://trello.com",
    privacy: "https://www.atlassian.com/legal/privacy-policy",
  },
  {
    provider: "pagerduty",
    title: "PagerDuty",
    description: "Open incidents on a service from an automation.",
    category: "APIs",
    authType: "manual",
    icon: PagerDutyIcon,
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "From PagerDuty's API Access Keys settings" },
      { name: "fromEmail", label: "From Email", placeholder: "A valid PagerDuty user's email — required by their API" },
    ],
    prompts: [
      "Open a PagerDuty incident for the API outage.",
      "Page the on-call engineer about this error spike.",
      "Create an incident for the failed deploy.",
    ],
    website: "https://www.pagerduty.com",
    privacy: "https://www.pagerduty.com/privacy-policy/",
  },
  {
    provider: "twilio",
    title: "Twilio",
    description: "Send SMS notifications from an automation.",
    category: "APIs",
    authType: "manual",
    icon: TwilioIcon,
    fields: [
      { name: "accountSid", label: "Account SID", placeholder: "AC..." },
      { name: "authToken", label: "Auth Token", type: "password" },
      { name: "fromNumber", label: "From Number", placeholder: "+15551234567" },
    ],
    prompts: [
      "Text me when a high-value payment fails.",
      "Send an SMS alert when a new lead comes in.",
      "Notify the team by text when the site goes down.",
    ],
    website: "https://www.twilio.com",
    privacy: "https://www.twilio.com/legal/privacy",
  },
  {
    provider: "airtable",
    title: "Airtable",
    description: "Create and poll records in a base from an automation.",
    category: "Databases",
    authType: "manual",
    icon: AirtableIcon,
    fields: [
      { name: "apiKey", label: "Personal Access Token", type: "password", placeholder: "pat..." },
    ],
    prompts: [
      "Add this lead to my Airtable CRM base.",
      "Check for new records added to my tracker today.",
      "Log this expense in my Airtable budget base.",
    ],
    website: "https://airtable.com",
    privacy: "https://www.airtable.com/privacy",
  },
  {
    provider: "postgres",
    title: "Postgres",
    description:
      "Read-only SQL queries for signups, errors, and business metrics. Permissions are verified before saving.",
    category: "Databases",
    authType: "manual",
    icon: PostgresIcon,
    fields: [
      {
        name: "connectionUrl",
        label: "Connection URL",
        type: "password",
        placeholder: "postgres://readonly:password@host:5432/db",
      },
    ],
    prompts: [
      "How many new users signed up today?",
      "Show error rates from the logs table over the last 24 hours.",
      "What's the daily active user count for the past 7 days?",
      "Find the top 10 users by session count this month.",
    ],
    website: "https://postgresql.org",
    privacy: "https://www.postgresql.org/about/policies/privacy/",
  },
  {
    provider: "mongodb",
    title: "MongoDB",
    description:
      "Restricted aggregate and find queries over your product database. Read-only access is verified before saving.",
    category: "Databases",
    authType: "manual",
    icon: MongoDbIcon,
    fields: [
      {
        name: "connectionUrl",
        label: "Connection URL",
        type: "password",
        placeholder: "mongodb+srv://readonly:password@cluster/db",
      },
    ],
    prompts: [
      "How many documents were created in the orders collection today?",
      "Show aggregate revenue by product category this month.",
      "Find users who haven't logged in for 30 days.",
      "What's the breakdown of users across plan types?",
    ],
    website: "https://mongodb.com",
    privacy: "https://www.mongodb.com/legal/privacy-policy",
  },
  {
    provider: "notion",
    title: "Notion",
    description: "Search pages, retrieve knowledge base content, and get context from your docs.",
    category: "Team",
    authType: "oauth",
    icon: NotionIcon,
    prompts: [
      "Find our onboarding doc in Notion and summarize it.",
      "Create a Notion page for today's meeting notes.",
      "What does our Notion say about the refund policy?",
    ],
    website: "https://www.notion.so",
    privacy: "https://www.notion.so/privacy",
  },
  {
    provider: "discord",
    title: "Discord",
    description: "Read a bot-accessible channel for updates and post approved messages through an optional webhook.",
    category: "Team",
    authType: "manual",
    icon: DiscordIcon,
    fields: [
      { name: "botToken", label: "Bot token", type: "password", placeholder: "Discord bot token" },
      { name: "channelId", label: "Channel ID", placeholder: "123456789012345678" },
      { name: "guildId", label: "Server ID (optional, enables message links)", placeholder: "123456789012345678", required: false },
      { name: "webhookUrl", label: "Channel webhook URL (optional, enables posting)", type: "password", placeholder: "https://discord.com/api/webhooks/...", required: false },
    ],
    prompts: [
      "Post a summary of today's standup to our Discord channel.",
      "What's been discussed in #general today?",
      "Notify the team on Discord when a new order comes in.",
    ],
    website: "https://discord.com",
    privacy: "https://discord.com/privacy",
  },
  {
    provider: "dropbox",
    title: "Dropbox",
    description: "Automations that fire when a file changes in your Dropbox.",
    category: "APIs",
    authType: "oauth",
    icon: DropboxIcon,
    prompts: [
      "Let me know when a new file lands in my shared folder.",
      "Notify me when the contract in Dropbox is updated.",
    ],
    website: "https://www.dropbox.com",
    privacy: "https://www.dropbox.com/privacy",
  },
  {
    provider: "figma",
    title: "Figma",
    description: "Automations that fire on a new file comment. Webhooks require a Figma Organization/Enterprise plan.",
    category: "Team",
    authType: "oauth",
    icon: FigmaIcon,
    prompts: [
      "Tell me when someone comments on the homepage design file.",
      "Notify the team when feedback lands on a Figma file.",
    ],
    website: "https://www.figma.com",
    privacy: "https://www.figma.com/privacy/",
  },
  {
    provider: "calendly",
    title: "Calendly",
    description: "Automations that fire when a booking is created or cancelled.",
    category: "Scheduling",
    authType: "oauth",
    icon: CalendlyIcon,
    fields: [
      { name: "apiToken", label: "Personal Access Token (if OAuth doesn't work for your account)", type: "password", placeholder: "From calendly.com/integrations/api_webhooks" },
    ],
    prompts: [
      "Let me know whenever someone books a call on my Calendly.",
      "Notify me if a Calendly meeting gets cancelled.",
    ],
    website: "https://calendly.com",
    privacy: "https://calendly.com/privacy",
  },
  {
    provider: "typeform",
    title: "Typeform",
    description: "Automations that fire on a new form submission.",
    category: "APIs",
    authType: "manual",
    icon: TypeformIcon,
    fields: [
      { name: "apiToken", label: "Personal Access Token", type: "password", placeholder: "From your Typeform account settings" },
      { name: "formId", label: "Form ID", placeholder: "The form to watch — required to register the webhook" },
    ],
    prompts: [
      "Notify me when someone submits my Typeform survey.",
      "Log new form responses to a spreadsheet.",
    ],
    website: "https://www.typeform.com",
    privacy: "https://www.typeform.com/legal/privacy/",
  },
  {
    provider: "gumroad",
    title: "Gumroad",
    description: "Automations that fire on a new sale. Add the ping URL manually — see setup note after connecting.",
    category: "Payments",
    authType: "manual",
    icon: GumroadIcon,
    fields: [
      { name: "accessToken", label: "Access Token", type: "password", placeholder: "From Gumroad Settings -> Advanced" },
    ],
    prompts: [
      "Let me know whenever I make a new sale on Gumroad.",
      "Notify the team when a product sells on Gumroad.",
    ],
    website: "https://gumroad.com",
    privacy: "https://gumroad.com/privacy",
  },
  {
    provider: "lemonsqueezy",
    title: "Lemon Squeezy",
    description: "Automations that fire on a new order.",
    category: "Payments",
    authType: "manual",
    icon: LemonSqueezyIcon,
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "From Settings -> API" },
      { name: "storeId", label: "Store ID", placeholder: "The store to watch — required to register the webhook" },
    ],
    prompts: [
      "Tell me when a new order comes in on Lemon Squeezy.",
      "Notify the team when someone subscribes.",
    ],
    website: "https://www.lemonsqueezy.com",
    privacy: "https://www.lemonsqueezy.com/privacy",
  },
  {
    provider: "uptimerobot",
    title: "UptimeRobot",
    description: "Automations that fire when a monitor goes up or down. Add a Web-Hook Alert Contact manually — see setup note after connecting.",
    category: "APIs",
    authType: "manual",
    icon: UptimeRobotIcon,
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "From My Settings -> API Settings" },
    ],
    prompts: [
      "Alert me the moment a monitor goes down.",
      "Let me know when my site comes back online.",
    ],
    website: "https://uptimerobot.com",
    privacy: "https://uptimerobot.com/privacy-policy/",
  },
  {
    provider: "quickbooks",
    title: "QuickBooks",
    description: "Automations that fire on a new invoice or a paid invoice. Requires a one-time app-level webhook subscription in the Intuit Developer dashboard.",
    category: "Payments",
    authType: "oauth",
    icon: QuickBooksIcon,
    prompts: [
      "Notify me when an invoice gets paid.",
      "Let me know when a new invoice is created in QuickBooks.",
    ],
    website: "https://quickbooks.intuit.com",
    privacy: "https://www.intuit.com/privacy/statement/",
  },
  {
    provider: "xero",
    title: "Xero",
    description: "Automations that fire when a new invoice is created.",
    category: "Payments",
    authType: "oauth",
    icon: XeroIcon,
    prompts: [
      "Tell me when a new invoice is created in Xero.",
      "Notify the team when a Xero invoice is overdue.",
    ],
    website: "https://www.xero.com",
    privacy: "https://www.xero.com/legal/privacy/",
  },
  {
    provider: "wise",
    title: "Wise",
    description: "Automations that fire when a new transaction credits your balance.",
    category: "Payments",
    authType: "manual",
    icon: WiseIcon,
    fields: [
      { name: "apiToken", label: "API Token", type: "password", placeholder: "From Wise Settings -> API tokens" },
      { name: "profileId", label: "Profile ID", placeholder: "The profile to watch — required to register the webhook" },
    ],
    prompts: [
      "Let me know when a payment lands in my Wise balance.",
      "Notify me of new Wise transactions over $500.",
    ],
    website: "https://wise.com",
    privacy: "https://wise.com/gb/privacy-policy/",
  },
  {
    provider: "bamboohr",
    title: "BambooHR",
    description: "Automations that fire on a new time-off request or a new hire. Polled — BambooHR has no webhook on standard API tiers.",
    category: "Team",
    authType: "manual",
    icon: BambooHrIcon,
    fields: [
      { name: "subdomain", label: "Subdomain", placeholder: "From https://<subdomain>.bamboohr.com" },
      { name: "apiKey", label: "API Key", type: "password", placeholder: "From your BambooHR account API keys" },
    ],
    prompts: [
      "Notify me when someone requests time off.",
      "Let me know when a new hire is added in BambooHR.",
    ],
    website: "https://www.bamboohr.com",
    privacy: "https://www.bamboohr.com/privacy-policy/",
  },
  {
    provider: "deel",
    title: "Deel",
    description: "Automations that fire on a new contract or a completed payment.",
    category: "Team",
    authType: "oauth",
    icon: DeelIcon,
    prompts: [
      "Tell me when a new contract is signed in Deel.",
      "Notify me when a contractor payment completes.",
    ],
    website: "https://www.deel.com",
    privacy: "https://www.deel.com/privacy-policy",
  },
  {
    provider: "box",
    title: "Box",
    description: "Automations that fire when a file is uploaded to a chosen Box folder.",
    category: "APIs",
    authType: "oauth",
    icon: BoxIcon,
    prompts: [
      "Let me know when a new file lands in our Box folder.",
      "Notify the team when a contract is uploaded to Box.",
    ],
    website: "https://www.box.com",
    privacy: "https://www.box.com/legal/privacypolicy",
  },
  {
    provider: "statuspage",
    title: "Statuspage",
    description: "Automations that fire on a new incident or an incident status update. Add the generated webhook URL as a subscriber on your page — see setup note after connecting.",
    category: "APIs",
    authType: "manual",
    icon: StatuspageIcon,
    fields: [
      { name: "pageId", label: "Page ID", placeholder: "From your Statuspage page settings" },
      { name: "apiKey", label: "API Key (optional, auto-subscribes the webhook)", type: "password", placeholder: "From Statuspage Account Settings -> API Info", required: false },
    ],
    prompts: [
      "Notify me when a new incident is posted on our status page.",
      "Alert the team when an incident is resolved.",
    ],
    website: "https://www.atlassian.com/software/statuspage",
    privacy: "https://www.atlassian.com/legal/privacy-policy",
  },
  {
    provider: "betterstack",
    title: "Better Stack",
    description: "Automations that fire when an incident starts or resolves. Add a webhook integration manually — see setup note after connecting.",
    category: "APIs",
    authType: "manual",
    icon: BetterStackIcon,
    fields: [
      { name: "apiKey", label: "API Key", type: "password", placeholder: "From Better Stack Settings -> API tokens" },
    ],
    prompts: [
      "Alert me the moment an incident starts.",
      "Let me know when a Better Stack incident resolves.",
    ],
    website: "https://betterstack.com",
    privacy: "https://betterstack.com/privacy",
  },
];

const CATEGORIES = ["Google", "Scheduling", "Payments", "Databases", "Team", "APIs"] as const;
const RECOMMENDED_CONNECTOR_PROVIDERS = new Set(["gmail", "calendar", "notion"]);
// Allow-list, mirroring ENABLED_CONNECTOR_PROVIDERS in
// dashboard/connectors/connectors-client.tsx — keep the two in sync, or a
// connector offered during onboarding won't exist on the connectors page.
// Slack/Telegram are deliberately absent here: they're linked as chat
// surfaces elsewhere in onboarding, not as connector cards.
const ENABLED_CONNECTOR_PROVIDERS = new Set([
  "gmail",
  "calendar",
  "google_workspace",
  "calcom",
  "razorpay",
  "github",
  "trello",
  "postgres",
  "mongodb",
  "notion",
  "discord",
  "figma",
  "calendly",
]);


const FALLBACK_TIMEZONES = [
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Guatemala",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Africa/Lagos",
  "Asia/Kolkata",
  "Asia/Dubai",
  "Asia/Bangkok",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
];

function getTimezoneOptions(current: string): string[] {
  const supported =
    typeof Intl.supportedValuesOf === "function"
      ? Intl.supportedValuesOf("timeZone")
      : FALLBACK_TIMEZONES;
  return supported.includes(current) ? supported : [current, ...supported];
}

// ── Validate + normalize a user-entered website URL (adds https:// if the
// protocol was omitted, rejects anything without a real domain). ───────────
function normalizeWebsiteUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

// ── Arrow-up-right icon for links ────────────────────────────────────────────
function ExternalIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0"
      aria-hidden="true"
    >
      <path d="M7 7h10v10" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

// ── Unified connector dialog (OAuth + manual) ────────────────────────────────
function ConnectorDialog({
  connector,
  error,
  submitting,
  onClose,
  onManualSubmit,
}: {
  connector: ConnectorItem;
  error: string | null;
  submitting: boolean;
  onClose: () => void;
  onManualSubmit: (e: FormEvent<HTMLFormElement>, c: ConnectorItem) => Promise<void>;
}) {
  const Icon = connector.icon;
  const isOAuth = connector.authType === "oauth";
  // Some OAuth connectors (e.g. Stripe) also carry a manual API-key fallback
  // for users who'd rather not grant OAuth access to their full account.
  const showManualFallback = Boolean(connector.fields?.length);
  const oauthHref = `/api/connectors/${connector.provider}/start?returnTo=/onboarding`;
  // Figma has no "list my teams" API and Box webhooks watch a single folder,
  // not the whole account — both need an id from the user before OAuth,
  // appended to the start URL (mirrors the dashboard connectors dialog).
  const isFigma = connector.provider === "figma";
  const [figmaTeamId, setFigmaTeamId] = useState("");
  const figmaOauthHref = `${oauthHref}&teamId=${encodeURIComponent(figmaTeamId.trim())}`;
  const isBox = connector.provider === "box";
  const [boxFolderId, setBoxFolderId] = useState("");
  const boxOauthHref = `${oauthHref}&folderId=${encodeURIComponent(boxFolderId.trim())}`;
  const requiresExtraField = isFigma || isBox;
  const extraFieldMissing = (isFigma && !figmaTeamId.trim()) || (isBox && !boxFolderId.trim());
  const resolvedOauthHref = isFigma ? figmaOauthHref : isBox ? boxOauthHref : oauthHref;
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = `connector-dialog-${connector.provider}-title`;
  const descriptionId = `connector-dialog-${connector.provider}-description`;
  const accessLabel = isOAuth
    ? "Secure OAuth"
    : connector.category === "Databases"
      ? "Read-only access"
      : "Encrypted credentials";

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const connectionDetails = (
    <>
      <div className="rounded-2xl bg-slate-50 px-4 py-4 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-950">
                {isOAuth
                  ? connector.provider === "stripe"
                    ? "OAuth coming soon"
                    : `Continue securely with ${connector.title}`
                  : accessLabel}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700 ring-1 ring-inset ring-emerald-200">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Secure
              </span>
            </div>
            <p className="mt-1 text-[13px] leading-5 text-slate-500">
              {isOAuth
                ? connector.provider === "stripe"
                  ? "Use the API key option below for now — one-click OAuth is on the way."
                  : `You’ll go to ${connector.title} to review and approve access before anything is connected.`
                : connector.category === "Databases"
                  ? "Use a read-only connection. Elpino verifies the permissions before saving it."
                  : "Your credentials are encrypted at rest and used only to connect this account."}
            </p>
          </div>
        </div>

        {isOAuth && (
          connector.provider === "stripe" ? (
            <span
              aria-disabled="true"
              className="mt-4 inline-flex h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 text-sm font-semibold text-slate-500"
            >
              Coming soon
            </span>
          ) : (
            <>
              {isFigma && (
                <div className="mt-4">
                  <label htmlFor="figma-team-id" className="mb-1.5 block text-xs font-medium text-slate-600">
                    Figma team ID
                  </label>
                  <input
                    id="figma-team-id"
                    type="text"
                    inputMode="numeric"
                    value={figmaTeamId}
                    onChange={(event) => setFigmaTeamId(event.target.value)}
                    placeholder="e.g. 123456789012345678"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-400"
                  />
                  <p className="mt-1.5 text-[11px] leading-4 text-slate-500">
                    Find this in your team&apos;s URL: figma.com/files/team/&lt;team id&gt;/... Webhooks (needed for
                    comment-triggered automations) only work on Organization/Enterprise Figma plans.
                  </p>
                </div>
              )}
              {isBox && (
                <div className="mt-4">
                  <label htmlFor="box-folder-id" className="mb-1.5 block text-xs font-medium text-slate-600">
                    Box folder ID
                  </label>
                  <input
                    id="box-folder-id"
                    type="text"
                    inputMode="numeric"
                    value={boxFolderId}
                    onChange={(event) => setBoxFolderId(event.target.value)}
                    placeholder="e.g. 123456789012"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-400"
                  />
                  <p className="mt-1.5 text-[11px] leading-4 text-slate-500">
                    Find this in the folder&apos;s URL: app.box.com/folder/&lt;folder id&gt;. Box webhooks watch one folder at a time, not your whole account.
                  </p>
                </div>
              )}
              <a
                href={resolvedOauthHref}
                aria-disabled={requiresExtraField && extraFieldMissing}
                onClick={(event) => {
                  if (requiresExtraField && extraFieldMissing) event.preventDefault();
                }}
                className={`mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9BEF4]/50 ${
                  requiresExtraField && extraFieldMissing ? "cursor-not-allowed opacity-50" : ""
                }`}
              >
                Continue to {connector.title}
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                </svg>
              </a>
            </>
          )
        )}
      </div>

      {(!isOAuth || showManualFallback) && connector.fields && (
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-950">
                {isOAuth ? `Or connect with an API key instead` : "Connection details"}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {isOAuth ? "Optional — skip this if you used the button above." : "All fields are required."}
              </p>
            </div>
            <span className="text-xs font-medium text-slate-400">Private</span>
          </div>

          {error && (
            <div role="alert" className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm font-medium leading-5 text-red-700">
              <svg className="mt-0.5 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4" /><path d="M12 16h.01" />
              </svg>
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            {connector.fields.map((field) => (
              <label key={field.name} className="flex flex-col gap-2 text-sm">
                <span className="font-medium text-slate-700">{field.label}</span>
                <input
                  name={field.name}
                  type={field.type ?? "text"}
                  placeholder={field.placeholder}
                  required={field.required !== false}
                  autoComplete="off"
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3.5 text-sm font-normal text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#D9BEF4] focus:ring-4 focus:ring-[#D9BEF4]/10"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="text-sm font-semibold text-slate-950">What you can do after connecting</p>
        <ul className="mt-3 space-y-2.5">
          {connector.prompts.slice(0, 3).map((prompt) => (
            <li key={prompt} className="flex items-start gap-2.5 text-[13px] leading-5 text-slate-600">
              <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-[#D9BEF4]/10 text-[#D96420]">
                <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m2.5 6 2.2 2.2 4.8-4.8" />
                </svg>
              </span>
              {prompt}
            </li>
          ))}
        </ul>
      </div>
    </>
  );

  const dialogFooter = (
    <div className="border-t border-slate-200 bg-slate-50/70 px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:px-6 sm:py-4">
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-center gap-3 sm:justify-start">
          {connector.website && (
            <a href={connector.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 underline-offset-4 transition hover:text-slate-950 hover:underline">
              Provider website <ExternalIcon />
            </a>
          )}
          {connector.privacy && (
            <a href={connector.privacy} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 underline-offset-4 transition hover:text-slate-950 hover:underline">
              Privacy <ExternalIcon />
            </a>
          )}
        </div>
        <div className="grid w-full grid-cols-[auto_minmax(0,1fr)] gap-2 sm:flex sm:w-auto">
          <button type="button" onClick={onClose} className="h-11 cursor-pointer rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-200/70 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9BEF4]/40">
            Cancel
          </button>
          {(!isOAuth || showManualFallback) && (
            <button type="submit" disabled={submitting} className="inline-flex h-11 min-w-0 cursor-pointer items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9BEF4]/50 sm:px-5">
              {submitting ? (
                <>
                  <span className="sm:hidden">Checking…</span>
                  <span className="hidden sm:inline">Checking connection…</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden">Connect</span>
                  <span className="hidden sm:inline">{isOAuth ? `Connect with API key` : `Connect ${connector.title}`}</span>
                </>
              )}
              {!submitting && (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" /><path d="m13 6 6 6-6 6" />
                </svg>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const dialogBody = (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      className="relative mb-0 mt-auto flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[28px] border border-b-0 border-slate-200 bg-white shadow-[0_-20px_60px_-24px_rgba(15,23,42,0.5)] sm:m-auto sm:max-h-[calc(100dvh-4rem)] sm:w-[620px] sm:rounded-[28px] sm:border-b sm:shadow-[0_28px_80px_-20px_rgba(15,23,42,0.45)]"
    >
      <div className="relative border-b border-slate-200 px-5 pb-5 pt-7 sm:px-6 sm:pb-6 sm:pt-6">
        <span className="absolute left-1/2 top-2.5 h-1 w-10 -translate-x-1/2 rounded-full bg-slate-300 sm:hidden" aria-hidden="true" />
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label={`Close ${connector.title} connection dialog`}
          className="absolute right-4 top-4 flex size-9 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9BEF4]/40"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M18 6 6 18" /><path d="m6 6 12 12" />
          </svg>
        </button>

        <p className="pr-12 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#D96420]">Connect an integration</p>
        <div className="mt-4 flex items-start gap-4 pr-10">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <ConnectorLogo
              provider={connector.provider}
              alt={connector.title}
              className="size-7 object-contain"
              fallback={<Icon className="size-7" />}
            />
          </span>
          <div>
            <h2 id={titleId} className="text-[22px] font-semibold leading-tight tracking-[-0.02em] text-slate-950">
              Connect {connector.title}
            </h2>
            <p id={descriptionId} className="mt-1.5 max-w-[29rem] text-[13px] leading-5 text-slate-500">
            {connector.description}
            </p>
          </div>
        </div>
      </div>

      <form className="flex min-h-0 flex-1 flex-col" onSubmit={(e) => void onManualSubmit(e, connector)}>
        <div className="flex flex-col gap-6 overflow-y-auto px-5 py-5 sm:px-6 sm:py-6">{connectionDetails}</div>
        {dialogFooter}
      </form>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 flex overflow-y-auto bg-slate-950/55 p-0 backdrop-blur-[6px] sm:px-4 sm:py-8"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {dialogBody}
    </div>
  );
}


// ── Phone country codes (About-you step) ─────────────────────────────────────
const PHONE_COUNTRIES = [
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "AE", name: "UAE", dial: "+971", flag: "🇦🇪" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dial: "+880", flag: "🇧🇩" },
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { code: "IL", name: "Israel", dial: "+972", flag: "🇮🇱" },
  { code: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { code: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { code: "PL", name: "Poland", dial: "+48", flag: "🇵🇱" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
] as const;

// ── Step metadata (drives the progress stepper + eyebrows) ──────────────────
const STEP_META = [
  { eyebrow: "About you" },
  { eyebrow: "Welcome" },
  { eyebrow: "How you found us" },
  { eyebrow: "Your website" },
] as const;

// ── Progress stepper: segmented bar + counter + back affordance ──────────────
function ProgressHeader({ step, onBack }: { step: number; onBack: () => void }) {
  const total = STEP_META.length;
  return (
    <div className="sticky top-0 z-20 mb-16 w-full bg-white pt-11">
      {step > 1 && (
        <button
          type="button"
          onClick={onBack}
          className="mb-4 flex cursor-pointer items-center gap-1.5 text-sm font-normal text-black/50 transition hover:text-black"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
      )}
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#e5e6e9]">
        <div className="h-full rounded-full bg-[#1447ff] transition-all duration-500" style={{ width: `${(step / total) * 100}%` }} />
      </div>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="shrink-0 text-white/40">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 ${className}`}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

// Extra search terms so a zone is findable by its modern/legacy name or country,
// regardless of which name the runtime's ICU lists (e.g. Calcutta vs Kolkata).
const TZ_SYNONYMS: Record<string, string> = {
  "asia/calcutta": "kolkata india mumbai delhi ist",
  "asia/kolkata": "calcutta india mumbai delhi ist",
  "asia/saigon": "ho chi minh vietnam",
  "asia/ho_chi_minh": "saigon vietnam",
  "asia/rangoon": "yangon myanmar",
  "asia/yangon": "rangoon myanmar",
  "asia/katmandu": "kathmandu nepal",
  "asia/kathmandu": "katmandu nepal",
  "europe/kiev": "kyiv ukraine",
  "europe/kyiv": "kiev ukraine",
  "america/godthab": "nuuk greenland",
  "america/nuuk": "godthab greenland",
};

function tzSearchString(tz: string): string {
  const extra = TZ_SYNONYMS[tz.toLowerCase()] ?? "";
  return `${tz.replace(/[_/]/g, " ")} ${extra}`.toLowerCase();
}

// ── Searchable timezone picker (type to filter the IANA list) ────────────────
function TimezoneCombobox({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (tz: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  const q = query.trim().toLowerCase();
  const filtered = (
    q ? options.filter((tz) => tzSearchString(tz).includes(q)) : options
  ).slice(0, 80);

  function pick(tz: string) {
    onChange(tz);
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative mt-6">
      <div className="flex h-[52px] items-center gap-2 rounded-full border border-white/30 bg-white/[0.04] px-5 transition focus-within:border-[#D9BEF4]">
        <SearchIcon />
        <input
          value={open ? query : value}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!open) setOpen(true);
          }}
          onFocus={() => {
            setQuery("");
            setOpen(true);
          }}
          placeholder={open ? `Search — current: ${value}` : "Search your timezone…"}
          className="h-full w-full cursor-text bg-transparent text-base font-normal text-white outline-none placeholder:text-white/40"
          aria-label="Timezone"
          autoComplete="off"
        />
      </div>

      {open && (
        <ul className="absolute z-20 mt-1.5 max-h-72 w-full overflow-y-auto rounded-2xl border border-white/30 bg-black shadow-xl">
          {filtered.length === 0 ? (
            <li className="px-4 py-3 text-sm text-white/50">No timezone matches “{query}”.</li>
          ) : (
            filtered.map((tz) => {
              const selected = tz === value;
              return (
                <li key={tz}>
                  <button
                    type="button"
                    onClick={() => pick(tz)}
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      selected ? "bg-white text-black" : "text-white hover:bg-[#D9BEF4]/10"
                    }`}
                  >
                    <span>{tz.replace(/_/g, " ")}</span>
                    {selected && <CheckIcon />}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
type OnboardingSession = { email: string; name?: string; userId: string; image?: string };

export function OnboardingClient({ session }: { session: OnboardingSession }) {
  const router = useRouter();
  const language = useStoredLanguage();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [profileName, setProfileName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [siteType, setSiteType] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("IN");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>("UTC");
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set());
  const [businessLoading, setBusinessLoading] = useState(false);
  const [businessError, setBusinessError] = useState<string | null>(null);
  const [hearAboutUs, setHearAboutUs] = useState("");
  const [hearAboutUsLoading, setHearAboutUsLoading] = useState(false);
  const [hearAboutUsError, setHearAboutUsError] = useState<string | null>(null);
  const [widgetKey, setWidgetKey] = useState<string | null>(null);
  const [widgetKeyError, setWidgetKeyError] = useState<string | null>(null);
  const [snippetCopied, setSnippetCopied] = useState(false);
  const [activeConnector, setActiveConnector] = useState<ConnectorItem | null>(null);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [setupSubmitting, setSetupSubmitting] = useState(false);
  const [skipLoading, setSkipLoading] = useState(false);
  const [skipError, setSkipError] = useState<string | null>(null);
  const [connectorQuery, setConnectorQuery] = useState("");
  const [connectorCategory, setConnectorCategory] = useState<"All" | (typeof CATEGORIES)[number]>("All");
  const [searchOpen, setSearchOpen] = useState(false);
  const timezoneOptions = getTimezoneOptions(timezone);
  const userInitials = (session.name?.trim() || session.email).split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");

  async function logout() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  }

  useEffect(() => {
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone);
    } catch {
      // keep UTC fallback
    }
  }, []);

  useEffect(() => {
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((data: { onboarding?: OnboardingState; name?: string; phone?: string; email?: string }) => {
        const onboarding = data.onboarding ?? {};
        if (onboarding.completedAt) {
          router.replace("/dashboard");
          return;
        }

        // Prefill the About-you fields from what's already saved. OAuth signups
        // have a real name; email signups carry a placeholder derived from the
        // address, which we leave blank so the principal types their own.
        const placeholder = data.email?.split("@")[0];
        if (data.name && data.name !== placeholder) {
          setProfileName((current) => current || data.name || "");
        }
        if (data.phone) {
          const match = [...PHONE_COUNTRIES]
            .sort((a, b) => b.dial.length - a.dial.length)
            .find((c) => data.phone?.startsWith(c.dial));
          if (match) {
            setPhoneCountry(match.code);
            setProfilePhone(data.phone.slice(match.dial.length).trim());
          } else {
            setProfilePhone(data.phone);
          }
        }

        // onboarding.source is a "this step was already completed" marker,
        // not a value the UI displays — the step-skip below is the only
        // thing that depends on it, so there's nothing to restore into state.
        if (onboarding.hearAboutUs) setHearAboutUs(onboarding.hearAboutUs);
        if (onboarding.googleConnected) setConnectedProviders(new Set(["gmail", "calendar"]));
        if (onboarding.source) {
          setStep(onboarding.hearAboutUs ? 4 : 3);
          void fetch("/api/onboarding/timezone", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
          }).catch(() => null);
        } else if (onboarding.profileCompleted) {
          // Name/phone already saved — resume at the source step after refresh.
          setStep(2);
        }
      })
      .catch(() => null);
  }, [router]);

  const anyConnected = connectedProviders.size > 0;

  const connectorQ = connectorQuery.trim().toLowerCase();
  const visibleConnectors = CONNECTOR_CATALOG.filter((c) => {
    if (!ENABLED_CONNECTOR_PROVIDERS.has(c.provider)) return false;
    const categoryOk = connectorCategory === "All" || c.category === connectorCategory;
    const queryOk =
      !connectorQ ||
      c.title.toLowerCase().includes(connectorQ) ||
      c.description.toLowerCase().includes(connectorQ) ||
      c.provider.toLowerCase().includes(connectorQ);
    return categoryOk && queryOk;
  });
  const showConnectorGroups = connectorCategory === "All" && !connectorQ;
  const recommendedConnectors = visibleConnectors.filter((connector) =>
    RECOMMENDED_CONNECTOR_PROVIDERS.has(connector.provider),
  );
  const moreConnectors = showConnectorGroups
    ? visibleConnectors.filter(
        (connector) => !RECOMMENDED_CONNECTOR_PROVIDERS.has(connector.provider),
      )
    : visibleConnectors;

  function goBack() {
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));
  }

  function isConnected(provider: string) {
    return connectedProviders.has(provider) || connectedProviders.has("google");
  }

  function renderConnectorCard(item: ConnectorItem, recommended = false) {
    const connected = isConnected(item.provider);
    const Icon = item.icon;
    const accessType =
      item.authType === "oauth"
        ? "OAuth"
        : item.category === "Databases"
          ? "Read-only"
          : "API credentials";

    return (
      <article
        key={item.provider}
        className={`group flex min-w-0 flex-col rounded-2xl border bg-white/[0.04] p-3.5 transition duration-200 sm:p-4 ${
          connected
            ? "border-emerald-500/30 bg-emerald-500/[0.06]"
            : "border-white/10 hover:-translate-y-0.5 hover:border-white/25 hover:shadow-[0_12px_30px_-20px_rgba(0,0,0,0.6)]"
        }`}
      >
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-white/10">
            <ConnectorLogo
              provider={item.provider}
              alt={item.title}
              className="size-6 object-contain"
              fallback={<Icon className="size-6" />}
            />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
              <h3 className="truncate text-base font-semibold leading-5 text-white">{item.title}</h3>
              {recommended && (
                <span className="rounded-md bg-[#D9BEF4]/10 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#C95618]">
                  Recommended
                </span>
              )}
            </div>
            <p className="mt-1 text-xs font-medium text-white/70">
              {item.category} · {accessType}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-white/70 sm:min-h-12">
          {item.description}
        </p>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
          {connected ? (
            <>
              <span className="inline-flex items-center gap-1.5 text-[13px] font-normal text-emerald-400">
                <span className="flex size-4 items-center justify-center rounded-full bg-emerald-500 text-black">
                  <svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="m2.5 6 2.2 2.2 4.8-4.8" />
                  </svg>
                </span>
                Connected
              </span>
              <button
                type="button"
                onClick={() => void unlinkConnector(item.provider)}
                className="cursor-pointer rounded-full px-3 py-1 text-[13px] font-normal text-white/70 transition hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9BEF4]/40"
              >
                Disconnect
              </button>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-white/70">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect width="18" height="11" x="3" y="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                Secure connection
              </span>
              <button
                type="button"
                onClick={() => {
                  setActiveConnector(item);
                  setSetupError(null);
                }}
                className="inline-flex h-10 min-w-24 cursor-pointer items-center justify-center rounded-full bg-white px-5 text-sm font-normal text-black transition hover:bg-white/90 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D9BEF4]/50"
              >
                {item.authType === "oauth" ? "Connect" : "Set up"}
              </button>
            </>
          )}
        </div>
      </article>
    );
  }

  // Reuse (or create) a real site tag for the domain entered in step 1, on
  // step 4 — this used to call a separate /api/onboarding/widget-key that
  // minted a key on the User row in auth-service, entirely disconnected
  // from the sites table Settings → Tag Manager actually reads. That key
  // never appeared there, and its snippet pointed at a script/attribute
  // pair (widget.js, data-api-key) that was never real either. Using the
  // same /api/workspace/sites endpoint Tag Manager itself uses means this
  // is the same row, visible in the same place, with a working snippet.
  useEffect(() => {
    if (step !== 4 || widgetKey || widgetKeyError) return;
    const hostname = (() => {
      try { return new URL(normalizeWebsiteUrl(websiteUrl) ?? websiteUrl).hostname.toLowerCase().replace(/^www\./, ""); }
      catch { return null; }
    })();

    async function ensureSite() {
      const existing = await fetch("/api/workspace/sites")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { sites?: { publicKey: string; domain: string }[] } | null) => data?.sites ?? [])
        .catch(() => []);
      const match = hostname ? existing.find((site) => site.domain === hostname) : undefined;
      if (match) return match.publicKey;
      if (existing.length > 0) return existing[0].publicKey; // resuming onboarding after a site was already made

      const created = await fetch("/api/workspace/sites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim() || hostname || "My website",
          domain: normalizeWebsiteUrl(websiteUrl) ?? websiteUrl,
          allowLocalhost: false,
          permissions: { support: true, visitors: true, analytics: true },
        }),
      }).then((r) => r.json().catch(() => ({}))) as { site?: { publicKey: string }; message?: string };
      if (!created.site) throw new Error(created.message ?? "Could not create a site tag");
      return created.site.publicKey;
    }

    ensureSite()
      .then((publicKey) => setWidgetKey(publicKey))
      .catch((err: unknown) => setWidgetKeyError(err instanceof Error ? err.message : "Could not create a site tag"));
  }, [step, widgetKey, widgetKeyError, websiteUrl, profileName]);

  async function unlinkConnector(provider: string) {
    await fetch(`/api/connectors/${provider}`, { method: "DELETE" });
    setConnectedProviders((prev) => {
      const next = new Set(prev);
      next.delete(provider);
      next.delete("google");
      return next;
    });
    if (provider === "gmail" || provider === "calendar" || provider === "google") {
      await fetch("/api/onboarding/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ googleConnected: false }),
      });
    }
  }

  async function saveManualConnector(event: FormEvent<HTMLFormElement>, connector: ConnectorItem) {
    event.preventDefault();
    if (!connector.fields) return;
    const form = event.currentTarget;
    const formData = new FormData(form);
    const secret = Object.fromEntries(
      connector.fields.map((f) => [f.name, String(formData.get(f.name) ?? "")]),
    );
    setSetupError(null);
    setSetupSubmitting(true);
    try {
      const res = await fetch("/api/connectors", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          provider: connector.provider,
          authType: "manual",
          label: connector.title,
          secret,
          metadata: { source: "onboarding" },
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null;
        setSetupError(err?.message ?? `Could not save ${connector.title}`);
        return;
      }
      form.reset();
      setActiveConnector(null);
      setConnectedProviders((prev) => new Set([...prev, connector.provider]));
    } catch {
      setSetupError(`Could not reach the connector service. ${connector.title} was not saved.`);
    } finally {
      setSetupSubmitting(false);
    }
  }

  async function submitProfile() {
    if (!profileName.trim()) return;
    const normalizedUrl = normalizeWebsiteUrl(websiteUrl);
    if (!normalizedUrl) {
      setProfileError("Enter a valid website URL, e.g. yourcompany.com");
      return;
    }
    setProfileError(null);
    setProfileLoading(true);
    try {
      const res = await fetch("/api/onboarding/profile", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          organizationName: profileName.trim(),
          websiteUrl: normalizedUrl,
        }),
      });
      if (!res.ok) {
        const err = (await res.json().catch(() => null)) as { message?: string } | null;
        throw new Error(err?.message ?? "save_failed");
      }
      setStep(2);
    } catch (err) {
      setProfileError(
        err instanceof Error && err.message !== "save_failed"
          ? err.message
          : "Something went wrong saving your details. Please try again.",
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function submitBusiness() {
    if (!siteDescription.trim() || !siteType) return;
    setBusinessError(null);
    setBusinessLoading(true);
    try {
      const res = await fetch("/api/onboarding/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ businessDescription: siteDescription.trim(), businessType: siteType }),
      });
      if (!res.ok) throw new Error("save_failed");
      setStep(3);
    } catch {
      setBusinessError("Something went wrong saving your organization. Please try again.");
    } finally {
      setBusinessLoading(false);
    }
  }

  async function submitHearAboutUs() {
    if (!hearAboutUs) return;
    setHearAboutUsError(null);
    setHearAboutUsLoading(true);
    try {
      const res = await fetch("/api/onboarding/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ hearAboutUs }),
      });
      if (!res.ok) throw new Error("save_failed");
      setStep(4);
    } catch {
      setHearAboutUsError("Something went wrong saving that. Please try again.");
    } finally {
      setHearAboutUsLoading(false);
    }
  }

  async function skipTelegram() {
    setSkipError(null);
    setSkipLoading(true);
    try {
      const res = await fetch("/api/onboarding/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("save_failed");
      router.push("/dashboard");
    } catch {
      setSkipError("Something went wrong finishing setup. Please try again.");
    } finally {
      setSkipLoading(false);
    }
  }

  return (
    <main
      className="onboarding-light onboarding-scene relative flex min-h-screen items-start justify-center bg-white px-6 pb-10 pt-16 text-[#222733]"
    >
      {/* Floating brand mark — matches the login page */}
      <Link
        href="/"
        className="fixed left-5 top-5 z-30 flex h-9 items-center sm:left-8 sm:top-7"
        aria-label="elpino home"
      >
        <Image
          src="/elpino.png"
          alt="elpino"
          width={906}
          height={275}
          className="h-8 w-auto object-contain brightness-0"
          priority
        />
      </Link>
      <div className="fixed right-6 top-5 z-30 flex items-center gap-3 sm:right-10 sm:top-7">
        <div className="onboarding-language">
          <LanguageSwitcher language={language} onChange={setStoredLanguage} light open={languageOpen} onOpenChange={(open) => { setLanguageOpen(open); if (open) setAvatarOpen(false); }} />
        </div>
        <div className="relative">
          <button type="button" onClick={() => { setAvatarOpen((open) => !open); setLanguageOpen(false); }} aria-label="Open account menu" aria-expanded={avatarOpen} className="flex items-center gap-1.5 rounded-full outline-none ring-offset-2 transition hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-[#7c3aed]">
            {session.image ? (
              <Image src={session.image} alt={session.name || "User"} width={42} height={42} className="size-[42px] rounded-full object-cover ring-2 ring-white shadow-[0_5px_18px_rgba(20,71,255,0.25)]" />
            ) : (
              <span className="onboarding-avatar flex size-[42px] items-center justify-center rounded-full bg-[linear-gradient(135deg,#7dd3fc_0%,#3b82f6_46%,#1237a8_100%)] text-sm font-medium text-white ring-2 ring-white shadow-[0_6px_20px_rgba(18,66,241,0.28)]">{userInitials}</span>
            )}
            <svg className={`size-4 text-[#596273] transition-transform ${avatarOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {avatarOpen && (
            <>
              <button type="button" aria-label="Close account menu" onClick={() => setAvatarOpen(false)} className="fixed inset-0 z-40 cursor-default" />
              <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-xl border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(35,45,80,0.18)]">
                <div className="border-b border-black/[0.07] px-3 py-3">
                  <p className="truncate text-sm font-normal text-[#20242d]">{session.name || session.email.split("@")[0]}</p>
                  <p className="mt-0.5 truncate text-xs text-black/50">{session.email}</p>
                </div>
                <button type="button" onClick={() => void logout()} disabled={signingOut} className="mt-1 flex h-10 w-full items-center rounded-lg px-3 text-left text-sm font-normal text-[#333842] transition hover:bg-[#f4f6fa] disabled:opacity-50">
                  {signingOut ? "Logging out..." : "Logout"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-106px)] w-full max-w-xl flex-col rounded-none bg-white px-8 pb-10 shadow-[0_24px_80px_rgba(76,88,140,0.14)] sm:px-12">
        <ProgressHeader step={step} onBack={goBack} />

        <div
          key={step}
          className="onb-enter mx-auto flex w-full flex-1 flex-col max-w-[880px]"
        >
        {/* Step 1 — about you (name + optional phone) */}
        {step === 1 && (
          <section>
            <h1 className="text-4xl font-normal leading-[1.12] tracking-[-0.035em] text-white text-balance">
              Let&rsquo;s set up your organization
            </h1>
            <p className="mt-3 text-[15px] leading-6 text-black/55">
              Share a few details so Elpino can personalize support for your business.
            </p>
            <div className="mx-auto mt-8 w-full max-w-[760px] space-y-5">
              <div>
                <label className="mb-2 block text-[15px] font-normal text-[#252932]">Organization name</label>
                <input value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Enter your organization name" autoFocus className="h-[52px] w-full rounded-lg border border-black/20 bg-white px-4 text-[16px] font-normal text-[#222733] outline-none transition placeholder:text-black/35 focus:border-[#1447ff]" />
              </div>
              <div>
                <label className="mb-2 block text-[15px] font-normal text-[#252932]">Website URL</label>
                <input
                  value={websiteUrl}
                  onChange={(e) => {
                    setWebsiteUrl(e.target.value);
                    if (profileError) setProfileError(null);
                  }}
                  placeholder="https://yourcompany.com"
                  type="url"
                  inputMode="url"
                  autoComplete="url"
                  className={`h-[52px] w-full rounded-lg border bg-white px-4 text-[16px] font-normal text-[#222733] outline-none transition placeholder:text-black/35 focus:border-[#1447ff] ${
                    profileError ? "border-red-400" : "border-black/20"
                  }`}
                />
                {profileError && (
                  <p className="mt-2 text-sm text-red-600">{profileError}</p>
                )}
              </div>
            </div>
            <div className="hidden">
              {["Online store", "Portfolio", "Offering services", "Blog", "Landing page", "Non-profit organization", "Tech company", "Restaurant", "Promoting an event"].map((option) => (
                <button key={option} type="button" onClick={() => setSiteType(option)} className={`rounded-lg border px-3.5 py-2 text-[15px] font-normal transition ${siteType === option ? "border-[#1447ff] bg-[#eef3ff] text-[#1447ff]" : "border-black/15 bg-white text-[#20232a] hover:border-black/35"}`}>
                  {option}
                </button>
              ))}
            </div>
            <div className="flex items-center justify-end pt-12">
              <div className="flex items-center gap-5">
                <button type="button" disabled={!profileName.trim() || !websiteUrl.trim() || profileLoading} onClick={() => void submitProfile()} className="onboarding-primary inline-flex h-10 min-w-32 items-center justify-center rounded-lg bg-[#1242f1] px-6 text-[15px] font-normal text-white transition hover:bg-[#0d35cc] disabled:bg-[#ececef] disabled:text-black/30">{profileLoading ? <><span className="onboarding-spinner mr-2 size-4 animate-spin rounded-full border-2" />Saving...</> : "Continue"}</button>
              </div>
            </div>
          </section>
        )}

        {/* Step 2 — source */}
        {step === 2 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D96420]">
              {STEP_META[1].eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.12] tracking-[-0.02em] text-white text-balance">
              What does your organization help customers with?
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-6 text-white/50">
              Tell Elpino what you offer so it can support your customers more accurately.
            </p>
            <input value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)} placeholder="Describe your products, services, and the customers you serve" className="mt-7 h-[52px] w-full rounded-lg border border-black/20 bg-white px-4 text-[16px] font-normal text-[#222733] outline-none transition placeholder:text-black/35 focus:border-[#1447ff]" />
            <div className="mt-6 flex flex-wrap gap-3">
              {[
                { label: "SaaS", icon: Layers },
                { label: "Online store", icon: ShoppingBag },
                { label: "Agency", icon: Briefcase },
                { label: "Marketplace", icon: Store },
                { label: "Education", icon: GraduationCap },
                { label: "Healthcare", icon: Stethoscope },
                { label: "Financial services", icon: Landmark },
                { label: "Other", icon: Sparkles },
              ].map(({ label: option, icon: OptionIcon }) => {
                const selected = siteType === option;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSiteType(option)}
                    className={`flex cursor-pointer items-center justify-between gap-2 rounded-full border px-4 py-2 text-left text-base font-normal whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1447ff]/30 ${
                      selected
                        ? "border-[#1447ff] bg-[#eef3ff] text-[#1447ff]"
                        : "border-black/15 bg-white text-[#20232a] hover:border-black/35"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <OptionIcon className="size-4 shrink-0" />
                      {option}
                    </span>
                    {selected && <CheckIcon className="text-[#1447ff]" />}
                  </button>
                );
              })}
            </div>
            {businessError && (
              <p className="mt-4 text-sm text-red-600">{businessError}</p>
            )}
            <button
              type="button"
              disabled={!siteDescription.trim() || !siteType || businessLoading}
              onClick={() => void submitBusiness()}
              className="mt-8 inline-flex h-[52px] w-full cursor-pointer items-center justify-center rounded-full bg-white text-base font-normal text-black transition hover:bg-white/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {businessLoading ? (
                <><span className="onboarding-spinner mr-2 size-4 animate-spin rounded-full border-2" />Saving...</>
              ) : "Continue"}
            </button>
          </section>
        )}

        {/* Step 3 — how they heard about us */}
        {step === 3 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D96420]">
              {STEP_META[2].eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.12] tracking-[-0.02em] text-white text-balance">
              Where did you hear about us?
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-6 text-white/50">
              This helps us understand how people find Elpino.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {[
                { value: "google", label: "Google search" },
                { value: "twitter", label: "Twitter / X" },
                { value: "linkedin", label: "LinkedIn" },
                { value: "friend", label: "Friend or colleague" },
                { value: "blog", label: "Blog or podcast" },
                { value: "other", label: "Other" },
              ].map(({ value, label }) => {
                const selected = hearAboutUs === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setHearAboutUs(value)}
                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-left text-base font-normal whitespace-nowrap transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1447ff]/30 ${
                      selected
                        ? "border-[#1447ff] bg-[#eef3ff] text-[#1447ff]"
                        : "border-black/15 bg-white text-[#20232a] hover:border-black/35"
                    }`}
                  >
                    {label}
                    {selected && <CheckIcon className="text-[#1447ff]" />}
                  </button>
                );
              })}
            </div>

            {hearAboutUsError && (
              <p className="mt-4 text-sm text-red-600">{hearAboutUsError}</p>
            )}
            <button
              type="button"
              disabled={!hearAboutUs || hearAboutUsLoading}
              onClick={() => void submitHearAboutUs()}
              className="mt-8 inline-flex h-[52px] w-full cursor-pointer items-center justify-center rounded-full bg-white text-base font-normal text-black transition hover:bg-white/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hearAboutUsLoading ? (
                <><span className="onboarding-spinner mr-2 size-4 animate-spin rounded-full border-2" />Saving...</>
              ) : "Continue"}
            </button>
          </section>
        )}

        {/* Step 4 — website widget snippet */}
        {step === 4 && (
          <section>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D96420]">
              {STEP_META[3].eyebrow}
            </p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.12] tracking-[-0.02em] text-white text-balance">
              Add Riz to your website
            </h1>
            <p className="mt-3 max-w-md text-[15px] leading-6 text-white/50">
              Paste this snippet on your site to embed the chat widget.
            </p>

            <div className="mt-7 rounded-2xl border border-white/30 bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white">
                  <Code2 className="size-5 text-white" />
                </span>
                <span className="mt-2.5 block text-sm leading-6 text-white/50">
                  Add it inside <code className="rounded bg-white/10 px-1 py-0.5 text-xs">&lt;head&gt;</code> or right
                  before <code className="rounded bg-white/10 px-1 py-0.5 text-xs">&lt;/body&gt;</code> — it loads
                  asynchronously, so either works.
                </span>
              </div>
              <div className="mt-4 border-t border-white/10 pt-4">
                <div className="relative overflow-hidden rounded-xl border border-black/10 bg-[#1e1e2e] shadow-inner">
                  <div className="flex items-center gap-1.5 border-b border-[#313244] px-3 py-2">
                    <span className="size-2.5 rounded-full bg-[#ff5f56]" />
                    <span className="size-2.5 rounded-full bg-[#ffbd2e]" />
                    <span className="size-2.5 rounded-full bg-[#27c93f]" />
                    <span className="ml-2 text-[11px] font-medium text-[#6c7086]">widget-embed.html</span>
                  </div>
                  <pre className="overflow-x-auto p-3 pr-12 text-xs leading-6">
                    <code>
                      <span className="text-[#6b7280]">&lt;</span>
                      <span className="text-[#f38ba8]">script</span>
                      {"\n  "}
                      <span className="text-[#94e2d5]">src</span>
                      <span className="text-[#6b7280]">=</span>
                      <span className="text-[#a6e3a1]">&quot;https://cdn.elpino.chat/tag.js&quot;</span>
                      {"\n  "}
                      <span className="text-[#94e2d5]">data-site-key</span>
                      <span className="text-[#6b7280]">=</span>
                      <span className="text-[#a6e3a1]">&quot;{widgetKey ?? "generating…"}&quot;</span>
                      {"\n  "}
                      <span className="text-[#fab387]">async</span>
                      {"\n"}
                      <span className="text-[#6b7280]">&gt;&lt;/</span>
                      <span className="text-[#f38ba8]">script</span>
                      <span className="text-[#6b7280]">&gt;</span>
                    </code>
                  </pre>
                  <button
                    type="button"
                    disabled={!widgetKey}
                    onClick={() => {
                      if (!widgetKey) return;
                      void navigator.clipboard
                        .writeText(
                          `<script\n  src="https://cdn.elpino.chat/tag.js"\n  data-site-key="${widgetKey}"\n  async\n></script>`,
                        )
                        .then(() => {
                          setSnippetCopied(true);
                          setTimeout(() => setSnippetCopied(false), 2000);
                        });
                    }}
                    aria-label="Copy snippet"
                    className="absolute right-2 top-2 flex size-8 cursor-pointer items-center justify-center rounded-lg border border-[#3b3d52] bg-[#292a3a] text-[#cdd6f4] transition hover:border-[#585b70] hover:bg-[#313244] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {snippetCopied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </button>
                </div>
                <p className="mt-2 text-xs text-white/40">
                  Paste this before the closing <code className="text-white/60">&lt;/body&gt;</code> tag on {(() => { try { return new URL(normalizeWebsiteUrl(websiteUrl) ?? websiteUrl).hostname; } catch { return "your site"; } })()}. Manage or add more sites later from Settings → Tag Manager.
                </p>
                {widgetKeyError && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-[#f38ba8]">
                    {widgetKeyError}
                    <button type="button" onClick={() => setWidgetKeyError(null)} className="underline hover:text-white">Retry</button>
                  </p>
                )}
              </div>
            </div>

            {skipError && (
              <p className="mt-4 text-sm text-red-600">{skipError}</p>
            )}
            <button
              type="button"
              disabled={skipLoading}
              onClick={() => void skipTelegram()}
              className="mt-8 inline-flex h-[52px] w-full cursor-pointer items-center justify-center rounded-full bg-white text-base font-normal text-black transition hover:bg-white/90 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {skipLoading ? (
                <><span className="onboarding-spinner mr-2 size-4 animate-spin rounded-full border-2" />Saving...</>
              ) : "Continue to dashboard"}
            </button>
          </section>
        )}
        </div>

      </div>
    </main>
  );
}
