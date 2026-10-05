"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import {
  Briefcase,
  Check,
  Code2,
  Copy,
  GraduationCap,
  Landmark,
  Mail,
  Layers,
  Mic2,
  Sparkles,
  ShoppingBag,
  Stethoscope,
  Store,
  Users,
} from "lucide-react";
import { TrainingStep } from "./TrainingStep";
import { LanguageSwitcher } from "@/app/components/LanguageSwitcher";
import { setStoredLanguage, useStoredLanguage } from "@/app/hooks/useStoredLanguage";
import { PAGE_SNIPPET } from "@/lib/identity-snippets";
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
// "localhost" (and 127.0.0.1) deliberately pass alongside a real dotted
// domain — sites already have a real allowLocalhost concept server-side
// (see /api/workspace/sites), for exactly this: testing against a site
// that isn't reachable from the public internet yet.
function isLocalDevHostname(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function normalizeWebsiteUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(candidate);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!isLocalDevHostname(url.hostname) && !/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(url.hostname)) return null;
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

const TOTAL_STEPS = 3;
const CRAWL_LIMIT_OPTIONS = [10, 25, 50] as const;
const DEVELOPER_EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Step 3's platform picker. Only these two get shown, on purpose: WordPress
// has its own real, automated flow (the actual plugin — see
// plugins/wordpress/elpino-chat.php — connects with no code to paste), and
// HTML is the honest, working fallback for literally everything else. Every
// other platform (Shopify, WooCommerce, ...) would get that exact same
// generic snippet anyway, since we have no dedicated integration for them —
// listing them here would just be claiming breadth we don't have.
type PlatformId = "html" | "wordpress";
const PLATFORMS: { id: PlatformId; label: string }[] = [
  { id: "html", label: "HTML" },
  { id: "wordpress", label: "WordPress" },
];

function PlatformIcon({ id }: { id: PlatformId }) {
  const [logoFailed, setLogoFailed] = useState(false);
  if (id === "html") return <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#3b82f6] text-white"><Code2 className="size-[18px]" /></span>;
  if (logoFailed) return <span className="grid size-11 shrink-0 place-items-center rounded-xl text-[13px] font-bold text-white" style={{ backgroundColor: "#21759b" }}>W</span>;
  return (
    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white p-2 ring-1 ring-black/10">
      <img src="https://cdn.brandfetch.io/wordpress.org?c=1bxec69tls8qaj83i3hc2bbf373tgfgTpns" alt="" onError={() => setLogoFailed(true)} className="size-full object-contain" />
    </span>
  );
}

// A tiny HTML highlighter for the install snippet: tags, attribute names and quoted values get their own colours.
function HighlightedHtml({ code }: { code: string }) {
  const parts: { text: string; className?: string }[] = [];
  const tag = /(<\/?)([a-zA-Z][\w-]*)((?:\s+[^\s=>]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*)\s*(\/?>)/g;
  let last = 0;
  for (const match of code.matchAll(tag)) {
    if (match.index > last) parts.push({ text: code.slice(last, match.index) });
    parts.push({ text: match[1], className: "text-[#9399b2]" }, { text: match[2], className: "text-[#f38ba8]" });
    for (const attr of match[3].matchAll(/(\s+)([^\s=>]+)(?:(\s*=\s*)("[^"]*"|'[^']*'|[^\s>]+))?/g)) {
      parts.push({ text: attr[1] }, { text: attr[2], className: "text-[#fab387]" });
      if (attr[3]) parts.push({ text: attr[3], className: "text-[#9399b2]" }, { text: attr[4], className: "text-[#a6e3a1]" });
    }
    parts.push({ text: match[4], className: "text-[#9399b2]" });
    last = match.index + match[0].length;
  }
  if (last < code.length) parts.push({ text: code.slice(last) });
  return <>{parts.map((part, i) => (part.className ? <span key={i} className={part.className}>{part.text}</span> : part.text))}</>;
}

type PagePriority = "high" | "medium" | "low";
type CrawlPage = {
  url: string;
  title: string;
  priority: PagePriority;
  selected: boolean;
  state: "pending" | "saving" | "saved" | "failed";
  error?: string;
};

const PRIORITY_ORDER: Record<PagePriority, number> = { high: 0, medium: 1, low: 2 };
const PRIORITY_BADGE: Record<PagePriority, string> = {
  high: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  medium: "bg-amber-50 text-amber-700 ring-amber-600/20",
  low: "bg-black/[0.04] text-black/55 ring-black/10",
};

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

// A relative, same-site path only — mirrors AuthFlow.tsx's sanitizeReturnPath
// so a "next" carried through onboarding can't become an open redirect.
function sanitizeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return "";
  try {
    const parsed = new URL(value, "https://elpino.local");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "";
  }
}

// `next` for a WordPress-originated signup is /connect/wordpress's own URL,
// which already carries the WordPress site's address as its own `site_url`
// param — pulled out here so step 1 doesn't make the admin type a domain
// we've already been handed. Yields "" for any other `next` (or none).
function siteUrlFromNext(nextPath: string): string {
  const queryStart = nextPath.indexOf("?");
  if (queryStart === -1) return "";
  try {
    return new URLSearchParams(nextPath.slice(queryStart + 1)).get("site_url") ?? "";
  } catch {
    return "";
  }
}

export function OnboardingClient({ session }: { session: OnboardingSession }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Where to land after finishing (or if already finished) — e.g. back at
  // /connect/wordpress for a WordPress admin who had to sign up first.
  // Falls back to /dashboard, same as before this existed.
  const next = sanitizeNextPath(searchParams.get("next"));
  const language = useStoredLanguage();
  const [languageOpen, setLanguageOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profileName, setProfileName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState(() => siteUrlFromNext(next));
  const [profilePhone, setProfilePhone] = useState("");
  const [phoneCountry, setPhoneCountry] = useState("IN");
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [timezone, setTimezone] = useState<string>("UTC");
  const [connectedProviders, setConnectedProviders] = useState<Set<string>>(new Set());
  const [hearAboutUs, setHearAboutUs] = useState("");
  const [widgetKey, setWidgetKey] = useState<string | null>(null);
  const [siteId, setSiteId] = useState<string | null>(null);
  // Set the moment step 1 is submitted, so the site is created and its first
  // crawl starts while the profile saves — step 2 opens with pages already coming in.
  const [siteRequested, setSiteRequested] = useState(false);
  const crawlStartedFor = useRef<string | null>(null);
  const [siteVerified, setSiteVerified] = useState(false);
  const [verifiedInCurrentSession, setVerifiedInCurrentSession] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [widgetKeyError, setWidgetKeyError] = useState<string | null>(null);
  const [snippetCopied, setSnippetCopied] = useState(false);
  // Step 3's platform picker — null shows the grid, otherwise the matching
  // instructions open as a dialog on top of it.
  const [openPlatform, setOpenPlatform] = useState<PlatformId | null>(null);
  const [developerEmails, setDeveloperEmails] = useState<string[]>([]);
  const [developerEmailDraft, setDeveloperEmailDraft] = useState("");
  const [developerEmailDraftError, setDeveloperEmailDraftError] = useState(false);
  const [developerSending, setDeveloperSending] = useState(false);
  const [developerSendStatus, setDeveloperSendStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const developerEmailRef = useRef<HTMLInputElement>(null);
  const [crawlLimit, setCrawlLimit] = useState<number>(CRAWL_LIMIT_OPTIONS[0]);
  const [scannedLimit, setScannedLimit] = useState(0);
  const [crawlPages, setCrawlPages] = useState<CrawlPage[]>([]);
  const [crawlStatus, setCrawlStatus] = useState<"idle" | "discovering" | "ready" | "saving" | "done">("idle");
  const [crawlError, setCrawlError] = useState<string | null>(null);
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
      posthog.reset();
      window.ElpinoTag?.logout?.();
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

  function commitDeveloperEmail(raw: string): boolean {
    const value = raw.trim().replace(/,$/, "");
    if (!value) return true;
    if (!DEVELOPER_EMAIL_RE.test(value)) return false;
    setDeveloperEmails((current) => (current.includes(value) ? current : [...current, value]));
    return true;
  }

  function handleDeveloperEmailChange(value: string) {
    setDeveloperSendStatus(null);
    if (/[,\s]$/.test(value)) {
      const ok = commitDeveloperEmail(value);
      setDeveloperEmailDraft(ok ? "" : value);
      setDeveloperEmailDraftError(!ok);
      return;
    }
    setDeveloperEmailDraft(value);
    setDeveloperEmailDraftError(false);
  }

  function handleDeveloperEmailKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === "Tab" || event.key === ",") {
      if (developerEmailDraft.trim()) {
        event.preventDefault();
        const ok = commitDeveloperEmail(developerEmailDraft);
        setDeveloperEmailDraft(ok ? "" : developerEmailDraft);
        setDeveloperEmailDraftError(!ok);
      }
      return;
    }
    if (event.key === "Backspace" && !developerEmailDraft && developerEmails.length > 0) {
      setDeveloperEmails((current) => current.slice(0, -1));
    }
  }

  function removeDeveloperEmail(email: string) {
    setDeveloperEmails((current) => current.filter((item) => item !== email));
  }

  useEffect(() => {
    fetch("/api/onboarding/status")
      .then((r) => r.json())
      .then((data: { onboarding?: OnboardingState; name?: string; phone?: string; email?: string; organizationName?: string; websiteUrl?: string }) => {
        const onboarding = data.onboarding ?? {};
        if (onboarding.completedAt) {
          router.replace(next || "/dashboard");
          return;
        }

        // Prefill the About-you fields from what's already saved. OAuth signups
        // have a real name; email signups carry a placeholder derived from the
        // address, which we leave blank so the principal types their own.
        const placeholder = data.email?.split("@")[0];
        const nameFallback = data.name && data.name !== placeholder ? data.name : "";
        if (data.organizationName || nameFallback) {
          setProfileName((current) => current || data.organizationName || nameFallback);
        }
        // websiteUrl was already saved in step 1 on a previous visit — restore
        // it so a page refresh on step 3/4 doesn't lose the site the rest of
        // this flow (verification, crawling) needs.
        if (data.websiteUrl) {
          setWebsiteUrl((current) => current || data.websiteUrl || "");
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
          setStep(onboarding.hearAboutUs ? 2 : 1);
          void fetch("/api/onboarding/timezone", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ timezone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
          }).catch(() => null);
        } else if (onboarding.profileCompleted && onboarding.hearAboutUs) {
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
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3) : s));
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
    if ((step < 2 && !siteRequested) || widgetKey || widgetKeyError) return;
    const hostname = (() => {
      try { return new URL(normalizeWebsiteUrl(websiteUrl) ?? websiteUrl).hostname.toLowerCase().replace(/^www\./, ""); }
      catch { return null; }
    })();
    type SiteRow = { id: string; publicKey: string; domain: string; status?: string };

    async function ensureSite(): Promise<SiteRow> {
      const existing = await fetch("/api/workspace/sites")
        .then((r) => (r.ok ? r.json() : null))
        .then((data: { sites?: SiteRow[] } | null) => data?.sites ?? [])
        .catch(() => [] as SiteRow[]);
      const match = hostname ? existing.find((site) => site.domain === hostname) : undefined;
      if (match) return match;
      if (!hostname && existing.length > 0) return existing[0];

      const created = await fetch("/api/workspace/sites", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: profileName.trim() || hostname || "My website",
          domain: normalizeWebsiteUrl(websiteUrl) ?? websiteUrl,
          allowLocalhost: hostname !== null && isLocalDevHostname(hostname),
          permissions: { support: true, visitors: true, analytics: true },
        }),
      }).then((r) => r.json().catch(() => ({}))) as { site?: SiteRow; message?: string };
      if (!created.site) throw new Error(created.message ?? "Could not create a site tag");
      return created.site;
    }

    ensureSite()
      .then((site) => {
        setWidgetKey(site.publicKey);
        setSiteId(site.id);
        setSiteVerified(site.status === "verified");
      })
      .catch((err: unknown) => setWidgetKeyError(err instanceof Error ? err.message : "Could not create a site tag"));
  }, [step, siteRequested, widgetKey, widgetKeyError, websiteUrl, profileName]);

  // First crawl: begins as soon as the site exists, once per site, whichever step the admin is on.
  useEffect(() => {
    if (!siteId || crawlStartedFor.current === siteId) return;
    crawlStartedFor.current = siteId;
    void fetch("/api/workspace/knowledge/website", {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId, url: normalizeWebsiteUrl(websiteUrl) ?? websiteUrl }),
    }).catch(() => { crawlStartedFor.current = null; });
  }, [siteId, websiteUrl]);

  const siteHostname = (() => {
    try { return new URL(normalizeWebsiteUrl(websiteUrl) ?? websiteUrl).hostname; }
    catch { return "your site"; }
  })();

  // The tag marks its site verified the first time it loads on the site's own
  // domain, so checking is just re-reading that site's status.
  async function verifyInstall() {
    if (!widgetKey) return;
    setVerifying(true);
    setVerifyMessage(null);
    try {
      const data = (await fetch("/api/workspace/sites").then((r) => r.json())) as { sites?: { publicKey: string; status?: string }[] };
      if (data.sites?.find((site) => site.publicKey === widgetKey)?.status === "verified") {
        setSiteVerified(true);
        setVerifiedInCurrentSession(true);
      } else {
        setVerifiedInCurrentSession(false);
        setVerifyMessage(`We haven't seen the tag on ${siteHostname} yet. Publish the snippet, open your site in a browser, then check again.`);
      }
    } catch {
      setVerifiedInCurrentSession(false);
      setVerifyMessage("We couldn't check right now. Please try again.");
    } finally {
      setVerifying(false);
    }
  }

  async function discoverPages(limit: number) {
    const startUrl = normalizeWebsiteUrl(websiteUrl);
    if (!startUrl) {
      setCrawlError("Add your website URL in step 1 first.");
      return;
    }
    setCrawlStatus("discovering");
    setCrawlError(null);
    try {
      const [discovered, alreadySaved] = await Promise.all([
        fetch("/api/workspace/knowledge/discover", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ url: startUrl, limit }),
        }).then(async (res) => {
          const data = (await res.json().catch(() => ({}))) as { pages?: { url: string; title: string; priority: PagePriority }[]; message?: string };
          if (!res.ok || !data.pages) throw new Error(data.message ?? "We couldn't scan your website. Please try again.");
          return data.pages;
        }),
        fetch("/api/workspace/knowledge")
          .then((res) => (res.ok ? res.json() : { items: [] }))
          .then((data: { items?: { sourceUrl: string | null }[] }) => new Set((data.items ?? []).flatMap((item) => (item.sourceUrl ? [item.sourceUrl] : []))))
          .catch(() => new Set<string>()),
      ]);
      setCrawlPages((current) => {
        const known = new Map(current.map((page) => [page.url, page]));
        const merged: CrawlPage[] = discovered.map((page) => known.get(page.url) ?? {
          url: page.url,
          title: page.title,
          priority: page.priority,
          selected: page.priority !== "low" && !alreadySaved.has(page.url),
          state: alreadySaved.has(page.url) ? "saved" : "pending",
        });
        const mergedUrls = new Set(merged.map((page) => page.url));
        return [...merged, ...current.filter((page) => !mergedUrls.has(page.url))]
          .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
      });
      setScannedLimit(limit);
      setCrawlStatus("ready");
    } catch (err) {
      setCrawlError(err instanceof Error ? err.message : "We couldn't scan your website. Please try again.");
      setCrawlStatus(crawlPages.length ? "ready" : "idle");
    }
  }

  function togglePage(url: string) {
    setCrawlPages((pages) => pages.map((page) => (page.url === url ? { ...page, selected: !page.selected } : page)));
  }

  async function savePages() {
    const queue = crawlPages.filter((page) => page.selected && page.state !== "saved");
    if (queue.length === 0) return;
    setCrawlStatus("saving");
    const patch = (url: string, next: Partial<CrawlPage>) =>
      setCrawlPages((pages) => pages.map((page) => (page.url === url ? { ...page, ...next } : page)));
    for (let i = 0; i < queue.length; i += 3) {
      await Promise.all(
        queue.slice(i, i + 3).map(async (page) => {
          patch(page.url, { state: "saving", error: undefined });
          try {
            const res = await fetch("/api/workspace/knowledge/url", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ url: page.url, siteId: siteId ?? undefined }),
            });
            const data = (await res.json().catch(() => ({}))) as { message?: string };
            if (!res.ok) throw new Error(data.message ?? "Could not save this page");
            patch(page.url, { state: "saved" });
          } catch (err) {
            patch(page.url, { state: "failed", error: err instanceof Error ? err.message : "Could not save this page" });
          }
        }),
      );
    }
    setCrawlStatus("done");
    posthog.capture("onboarding_knowledge_sources_saved", {
      source_count: queue.length,
    });
  }

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
    if (!profileName.trim() || !hearAboutUs) return;
    const normalizedUrl = normalizeWebsiteUrl(websiteUrl);
    if (!normalizedUrl) {
      setProfileError("Enter a valid website URL, e.g. yourcompany.com");
      return;
    }
    setProfileError(null);
    setProfileLoading(true);
    setWidgetKey(null);
    setSiteId(null);
    setWidgetKeyError(null);
    setSiteRequested(true);
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
      const sourceResponse = await fetch("/api/onboarding/progress", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ hearAboutUs }),
      });
      if (!sourceResponse.ok) throw new Error("save_failed");
      posthog.capture("onboarding_profile_completed");
      setStep(2);
    } catch (err) {
      setSiteRequested(false);
      setProfileError(
        err instanceof Error && err.message !== "save_failed"
          ? err.message
          : "Something went wrong saving your details. Please try again.",
      );
    } finally {
      setProfileLoading(false);
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
      router.push(next || "/dashboard");
    } catch {
      setSkipError("Something went wrong finishing setup. Please try again.");
    } finally {
      setSkipLoading(false);
    }
  }

  async function finishOnboarding(destination = next || "/dashboard") {
    if (skipLoading) return;
    setSkipError(null);
    setSkipLoading(true);
    try {
      const res = await fetch("/api/onboarding/progress", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error("save_failed");
      router.push(destination);
    } catch {
      setSkipError("Something went wrong finishing setup. Please try again.");
    } finally {
      setSkipLoading(false);
    }
  }

  const primaryButtonClass =
    "mt-8 flex h-14 w-fit min-w-[118px] cursor-pointer items-center justify-center gap-2 rounded-[10px] bg-[#18191b] px-6 text-[16px] font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/15 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#d5d5d8] disabled:text-white";
  const inputClass =
    "h-12 w-full rounded-[11px] border-2 bg-white px-5 text-[15px] text-[#111214] outline-none transition placeholder:text-[15px] placeholder:text-[#9a9da3] hover:border-black focus:border-black focus:ring-4 focus:ring-black/[0.06]";
  const chipClass = (selected: boolean) =>
    `flex min-h-12 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[10px] border px-6 py-2.5 text-[14px] transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10 ${
      selected
        ? "border-black bg-black/[0.04] text-[#111214]"
        : "border-black/10 bg-white text-[#111214] hover:border-black/30 hover:bg-black/[0.02]"
    }`;
  const spinner = <span className="size-4 animate-spin rounded-full border-2 border-black/15 border-t-black/50" />;

  return (
    <main className="relative flex min-h-screen flex-col bg-[#fffefe] font-[family-name:var(--font-rethink-sans)] text-[#111214]">
      <header className="relative z-30 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-6 sm:px-10 lg:px-14">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" aria-label="Elpino home" className="inline-flex shrink-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20">
              <Image src="/elpino.png" alt="Elpino" width={906} height={275} priority className="h-8 w-auto object-contain" />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
        <div className="onboarding-language px-1">
          <LanguageSwitcher language={language} onChange={setStoredLanguage} light open={languageOpen} onOpenChange={(open) => { setLanguageOpen(open); if (open) setAvatarOpen(false); }} />
        </div>
        <span aria-hidden="true" className="hidden h-7 w-px bg-black/10 sm:block" />
        <div className="relative">
          <button type="button" onClick={() => { setAvatarOpen((open) => !open); setLanguageOpen(false); }} aria-label="Open account menu" aria-expanded={avatarOpen} className="flex items-center gap-2 rounded-full border border-transparent py-1 pl-1 pr-2 outline-none ring-offset-2 transition hover:border-black/10 hover:bg-[#fafafa] focus-visible:ring-2 focus-visible:ring-black/20 sm:gap-3 sm:pr-3">
            {session.image ? (
              <Image src={session.image} alt={session.name || "User"} width={38} height={38} className="size-[38px] rounded-full object-cover ring-1 ring-black/10" />
            ) : (
              <span className="onboarding-avatar flex size-[38px] items-center justify-center rounded-full bg-[#202124] text-xs font-semibold text-white ring-1 ring-black/10">{userInitials}</span>
            )}
            <span className="hidden max-w-36 text-left sm:block"><span className="block truncate text-[13px] font-semibold leading-4 text-[#202124]">{session.name || session.email.split("@")[0]}</span><span className="block truncate text-[11px] leading-4 text-black/45">Account</span></span>
            <svg className={`size-4 text-[#596273] transition-transform ${avatarOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </button>
          {avatarOpen && (
            <>
              <button type="button" aria-label="Close account menu" onClick={() => setAvatarOpen(false)} className="fixed inset-0 z-40 cursor-default" />
              <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl border border-black/10 bg-white p-2 shadow-[0_22px_60px_rgba(20,20,20,0.14)]">
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

        </div>
      </header>

      <div className="flex flex-1 flex-col items-center px-6 pb-16 pt-6 lg:pt-8">
        <div key={step} className={`onb-enter w-full text-left ${step >= 2 ? "max-w-[1080px]" : "max-w-[660px]"}`}>
        <div className="mb-7 flex justify-end" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
          <p className="mb-2 text-[16px] text-[#676b72]">{step}/{TOTAL_STEPS}</p>

        </div>
        {step === 1 && (
          <section>
            <h1 className="text-balance text-xl font-normal leading-[1.12] tracking-[-0.03em]">
              Let&rsquo;s set up your website
            </h1>
            <p className="mt-2 text-lg text-black/55">
              Share a few details so Elpino can personalize support for your business.
            </p>
            <div className="mt-9 w-full space-y-5 text-left">
              <div>
                <label htmlFor="onb-org" className="mb-2 block text-base font-normal">Site name</label>
                <input id="onb-org" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="E.g. Acme" autoFocus className={`${inputClass} border-black/40`} />
              </div>
              <div>
                <label htmlFor="onb-url" className="mb-2 block text-base font-normal">Website URL</label>
                <div className={`flex h-12 w-full items-center overflow-hidden rounded-[11px] border-2 bg-white transition hover:border-black focus-within:border-black focus-within:ring-4 focus-within:ring-black/[0.06] ${profileError ? "border-red-400" : "border-black/40"}`}>
                  <span className="flex h-full shrink-0 items-center border-r border-black/10 bg-black/[0.025] px-4 text-[15px] text-black/50" aria-hidden="true">https://</span>
                  <input
                    id="onb-url"
                    value={websiteUrl.replace(/^https?:\/\//i, "")}
                    onChange={(e) => {
                      const domain = e.target.value.replace(/^https?:\/\//i, "");
                      setWebsiteUrl(domain ? `https://${domain}` : "");
                      if (profileError) setProfileError(null);
                    }}
                    placeholder="yourcompany.com"
                    type="text"
                    inputMode="url"
                    autoComplete="url"
                    aria-label="Website URL, https prefix included"
                    className="h-full min-w-0 flex-1 border-0 bg-transparent px-4 text-[15px] text-[#111214] outline-none placeholder:text-[#9a9da3]"
                  />
                </div>
                {profileError && <p className="mt-2 text-sm text-red-600">{profileError}</p>}
              </div>
              <fieldset>
                <legend className="text-base font-normal">Where did you hear about us?</legend>
            <div className="mt-3 flex flex-wrap justify-start gap-3">
              {[
                { value: "google", label: "Google search", domain: "google.com" },
                { value: "twitter", label: "Twitter / X", domain: "x.com" },
                { value: "linkedin", label: "LinkedIn", domain: "linkedin.com" },
                { value: "friend", label: "Friend or colleague", icon: Users },
                { value: "blog", label: "Blog or podcast", icon: Mic2 },
                { value: "other", label: "Other", icon: Sparkles },
              ].map(({ value, label, domain, icon: SourceIcon }) => (
                <button key={value} type="button" onClick={() => setHearAboutUs(value)} aria-pressed={hearAboutUs === value} className={chipClass(hearAboutUs === value)}>
                  {domain ? (
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-white p-1">
                      <img src={`https://cdn.brandfetch.io/${domain}?c=1bxec69tls8qaj83i3hc2bbf373tgfgTpns`} alt="" className="size-full object-contain" />
                    </span>
                  ) : SourceIcon ? <SourceIcon className="size-4 shrink-0" aria-hidden="true" /> : null}
                  {label}
                </button>
              ))}
            </div>
              </fieldset>
            </div>
            <button type="button" disabled={!profileName.trim() || !websiteUrl.trim() || !hearAboutUs || profileLoading} onClick={() => void submitProfile()} className={primaryButtonClass}>
              {profileLoading ? <>{spinner}Saving…</> : "Continue"}
            </button>
          </section>
        )}


        {false && (
          <section>
            <h1 className="text-balance text-xl font-normal leading-[1.12] tracking-[-0.03em]">
              Add Elpino to your website
            </h1>
            <p className="mt-2 text-lg text-black/55">Install the tag on {siteHostname}, then verify it&rsquo;s live.</p>

            <div className="mt-9 w-full rounded-[12px] border-2 border-black/15 bg-[#fafafa] p-5 text-left">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-black/10 bg-white">
                  <Code2 className="size-5 text-[#2563eb]" />
                </span>
                <span className="mt-1 block text-sm leading-6 text-black/55">
                  Add it inside <code className="rounded bg-black/[0.06] px-1 py-0.5 text-xs">&lt;head&gt;</code> or right
                  before <code className="rounded bg-black/[0.06] px-1 py-0.5 text-xs">&lt;/body&gt;</code> — it loads
                  asynchronously, so either works.
                </span>
              </div>
              <div className="mt-4">
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
                <p className="mt-3 text-xs leading-5 text-black/45">
                  Paste this before the closing <code className="text-black/65">&lt;/body&gt;</code> tag on {siteHostname}. Manage or add more sites later from Settings → Tag Manager.
                </p>
                {widgetKeyError && (
                  <p className="mt-2 flex items-center gap-2 text-xs text-red-600">
                    {widgetKeyError}
                    <button type="button" onClick={() => setWidgetKeyError(null)} className="underline hover:text-red-800">Retry</button>
                  </p>
                )}
              </div>
            </div>

            <div className="mx-auto mt-6 max-w-[640px]" aria-live="polite">
              {siteVerified ? (
                <p className="flex items-center justify-center gap-2 text-[15px] text-emerald-700">
                  <Check className="size-4" />
                  Verified — Elpino is live on {siteHostname}
                </p>
              ) : verifyMessage ? (
                <p className="text-[14px] leading-6 text-amber-700">{verifyMessage}</p>
              ) : null}
            </div>

            {siteVerified ? (
              <button type="button" onClick={() => setStep(2)} className={primaryButtonClass}>
                Continue
              </button>
            ) : (
              <>
                <button type="button" disabled={!widgetKey || verifying} onClick={() => void verifyInstall()} className={primaryButtonClass}>
                  {verifying ? <>{spinner}Checking…</> : "Verify installation"}
                </button>
                <button type="button" onClick={() => setStep(2)} className="mx-auto mt-4 block cursor-pointer text-[14px] text-black/50 underline-offset-4 transition hover:text-black hover:underline">
                  Skip for now
                </button>
              </>
            )}
          </section>
        )}

        {step === 2 && <TrainingStep siteId={siteId} siteError={widgetKeyError} websiteUrl={websiteUrl} onContinue={() => setStep(3)} />}

        {step === 3 && (
          <section className="mx-auto w-full max-w-[660px]">
            <h1 className="text-balance text-xl font-normal leading-[1.12] tracking-[-0.03em]">
              Add Elpino to your website
            </h1>
            <p className="mt-2 max-w-xl text-lg leading-relaxed text-black/55">Choose how your site is built and we&rsquo;ll walk you through the last step.</p>

            <div className={`mt-7 flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${siteVerified ? "bg-emerald-50 text-emerald-800" : "bg-black/[0.03] text-black/60"}`} aria-live="polite">
              <span className={`flex size-7 shrink-0 items-center justify-center rounded-full ${siteVerified ? "bg-emerald-100 text-emerald-700" : "bg-black/5 text-black/40"}`}>{siteVerified ? <Check className="size-4" /> : <Code2 className="size-4" />}</span>
              <span className="min-w-0 flex-1">{siteVerified ? <>Elpino is live on <strong className="font-medium">{siteHostname}</strong>.</> : <>Not installed yet on <strong className="font-medium text-black/75">{siteHostname}</strong>. Takes about two minutes.</>}</span>
            </div>

            <div className="mt-5 grid gap-3">
              {([
                { id: "wordpress" as const, title: "WordPress", description: "Install our plugin and connect with one click. No code to paste.", badge: "Easiest" },
                { id: "html" as const, title: "HTML / any other site", description: "Paste one line of code before your closing head tag. Works on Shopify, Webflow, Wix and more.", badge: null },
              ]).map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setOpenPlatform(option.id)}
                  className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-black/10 bg-white p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition hover:border-black/25 hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/10"
                >
                  <PlatformIcon id={option.id} />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-medium text-[#111214]">{option.title}</span>
                      {option.badge && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">{option.badge}</span>}
                    </span>
                    <span className="mt-0.5 block text-sm leading-relaxed text-black/50">{option.description}</span>
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-black/10 text-black/55 transition group-hover:border-black group-hover:bg-black group-hover:text-white">
                    <svg className="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="m8 4 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </span>
                </button>
              ))}
            </div>

            <p className="mt-4 text-sm text-black/45">Someone else handles your site? You can send them the instructions from either option.</p>

            {skipError && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">{skipError}</p>}
            <div className="mt-8 flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center">
              {!siteVerified && <button type="button" disabled={skipLoading} onClick={() => void finishOnboarding()} className="h-12 cursor-pointer rounded-[10px] px-5 text-[15px] text-black/55 transition hover:bg-black/5 hover:text-black disabled:opacity-50">I&rsquo;ll do this later</button>}
              <button type="button" disabled={skipLoading} onClick={() => void finishOnboarding()} className="h-12 cursor-pointer rounded-[10px] bg-[#18191b] px-6 text-[16px] font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-black/15 active:scale-[0.99] disabled:opacity-50 sm:min-w-[200px]">{skipLoading ? "Finishing setup…" : siteVerified ? "Go to dashboard" : "Continue to dashboard"}</button>
            </div>
          </section>
        )}

        {/* Portalled to <body>: the step wrapper's onb-enter animation leaves a transform
            on it, which would make this fixed overlay relative to the wrapper and put it
            under the z-30 header. */}
        {step === 3 && openPlatform && createPortal(
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label={`Integrate Elpino with ${PLATFORMS.find((p) => p.id === openPlatform)?.label}`}>
            <button type="button" aria-label="Close" onClick={() => setOpenPlatform(null)} className="absolute inset-0 cursor-default" />
            <div className="relative min-h-80 max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl sm:p-6">
              <div className="mb-6 flex items-center gap-3">
                <button type="button" onClick={() => setOpenPlatform(null)} aria-label="Back" className="flex size-8 items-center justify-center rounded-full text-black/50 transition hover:bg-black/5 hover:text-black">
                  <svg className="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="m12 4-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <h2 className="flex-1 text-[17px] font-medium text-[#111214]">Integrate Elpino with {PLATFORMS.find((p) => p.id === openPlatform)?.label}</h2>
                <button type="button" onClick={() => setOpenPlatform(null)} aria-label="Close" className="flex size-8 items-center justify-center rounded-full text-black/50 transition hover:bg-black/5 hover:text-black">
                  <svg className="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" /></svg>
                </button>
              </div>

              <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
                <div className="min-w-0">
                  {openPlatform === "wordpress" ? (
                    <ol className="relative space-y-4">
                      <span className="absolute bottom-8 left-[21px] top-8 w-px bg-gradient-to-b from-blue-200 via-violet-200 to-emerald-200" aria-hidden="true" />
                      {[
                        { n: 1, title: "Get the plugin", tone: "bg-blue-600", soft: "border-blue-100 bg-blue-50/50", chip: "bg-blue-100 text-blue-700", tag: "2 min", body: (
                          <>
                            <p className="text-sm leading-6 text-black/60">Go to your WordPress dashboard. Click <strong className="text-black/80">Plugins → Add New</strong>, search <strong className="text-black/80">Elpino Chat</strong>, then install and activate it.</p>
                            <p className="mt-2 text-sm leading-6 text-black/60">Not listed yet? <a href="https://github.com/elpino-chat/wordpress-plugin/archive/refs/heads/plugin/elpino-chat.zip" className="font-medium text-blue-700 underline underline-offset-2">Download the plugin</a> and upload it under <code className="rounded bg-white px-1.5 py-0.5 text-[12px] ring-1 ring-black/10">Plugins → Add New → Upload Plugin</code>.</p>
                          </>
                        ) },
                        { n: 2, title: "Connect with Elpino", tone: "bg-violet-600", soft: "border-violet-100 bg-violet-50/50", chip: "bg-violet-100 text-violet-700", tag: "1 click", body: (
                          <p className="text-sm leading-6 text-black/60">Click <strong className="text-black/80">Elpino Chat</strong> in your WordPress admin menu, then <strong className="text-black/80">Connect to Elpino</strong>. Log in and it connects automatically — no code to paste.</p>
                        ) },
                        { n: 3, title: "Play with Elpino", tone: "bg-emerald-600", soft: "border-emerald-100 bg-emerald-50/50", chip: "bg-emerald-100 text-emerald-700", tag: "Done", body: (
                          <p className="text-sm leading-6 text-black/60">Go to your site — Elpino is live right after connecting. If you don&apos;t see it, clear your cache and check the plugin&apos;s own settings page.</p>
                        ) },
                      ].map((step) => (
                        <li key={step.n} className="relative flex gap-4">
                          <span className={`relative z-10 flex size-11 shrink-0 items-center justify-center rounded-full text-base font-semibold text-white shadow-sm ring-4 ring-white ${step.tone}`}>{step.n}</span>
                          <div className={`min-w-0 flex-1 rounded-2xl border p-4 ${step.soft}`}>
                            <div className="flex items-center justify-between gap-3">
                              <p className="text-[15px] font-medium text-[#111214]">{step.title}</p>
                              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${step.chip}`}>{step.tag}</span>
                            </div>
                            <div className="mt-2">{step.body}</div>
                          </div>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="space-y-3">
                      <details open className="group rounded-xl border border-black/10 bg-white">
                        <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden"><span className="flex size-7 items-center justify-center rounded-full bg-black text-xs text-white">1</span><span className="flex-1 text-[15px] font-normal">Paste the widget code and verify</span><span className="text-lg text-black/35 transition group-open:rotate-45">+</span></summary>
                        <div className="border-t border-black/[0.07] px-5 pb-5 pt-4">
                          <p className="text-sm leading-6 text-black/55">Place this before the closing <code className="rounded bg-black/[0.05] px-1">&lt;/head&gt;</code> tag on {siteHostname}.</p>
                          <div className="relative mt-3 overflow-hidden rounded-lg bg-[#17181a]">
                            <pre className="overflow-x-auto p-4 pr-16 font-mono text-[12.5px] leading-6 text-[#cdd6f4]"><code><HighlightedHtml code={`<script async src="https://cdn.elpino.chat/tag.js" data-site-key="${widgetKey ?? "YOUR_SITE_KEY"}"></script>`} /></code></pre>
                            <button type="button" disabled={!widgetKey} onClick={() => { if (!widgetKey) return; void navigator.clipboard.writeText(`<script async src="https://cdn.elpino.chat/tag.js" data-site-key="${widgetKey}"></script>`).then(() => { setSnippetCopied(true); setTimeout(() => setSnippetCopied(false), 2000); }); }} className="absolute right-2 top-2 rounded-md bg-white/10 px-2 py-1 text-[11px] text-white transition hover:bg-white/20 disabled:opacity-40">{snippetCopied ? "Copied" : "Copy"}</button>
                          </div>
                          <div className="mt-4 flex flex-wrap items-center gap-3">
                            <button type="button" disabled={!widgetKey || verifying} onClick={() => void verifyInstall()} className="inline-flex h-10 items-center rounded-lg bg-black px-4 text-sm text-white transition hover:bg-black/80 disabled:opacity-40">{verifying ? "Checking…" : "Verify installation"}</button>
                          </div>
                          {verifiedInCurrentSession && <p className="mt-3 text-sm text-emerald-700">Verified — Elpino is live on {siteHostname}.</p>}
                          {verifyMessage && !verifiedInCurrentSession && <p className="mt-3 text-sm text-amber-700">{verifyMessage}</p>}
                        </div>
                      </details>

                      <details className="group rounded-xl border border-black/10 bg-white">
                        <summary className="flex cursor-pointer list-none items-center gap-3 px-5 py-4 [&::-webkit-details-marker]:hidden"><span className="flex size-7 items-center justify-center rounded-full border border-black/15 text-xs">2</span><span className="flex-1 text-[15px] font-normal">Identify signed-in customers <span className="text-black/40">(optional)</span></span><span className="text-lg text-black/35 transition group-open:rotate-45">+</span></summary>
                        <div className="border-t border-black/[0.07] px-5 pb-5 pt-4">
                          <p className="text-sm leading-6 text-black/55">Your server signs a short-lived token; the browser receives only that token, never the identity secret. Add this before the Elpino tag.</p>
                          <pre className="mt-3 max-h-56 overflow-auto rounded-lg bg-[#17181a] p-4 text-xs leading-5 text-white/85"><code>{PAGE_SNIPPET}</code></pre>
                          <Link href="/docs/identity-verification" target="_blank" className="mt-3 inline-flex text-sm text-black/55 underline underline-offset-4 hover:text-black">Read the complete identity guide</Link>
                        </div>
                      </details>
                    </div>
                  )}
                </div>

                <aside>
                  <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 p-5 sm:p-6">
                    <span className="flex size-10 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm ring-1 ring-amber-100"><Mail className="size-5" /></span>
                    <p className="mt-3 text-[15px] font-medium text-black">Send to a developer</p>
                    <p className="mt-1.5 text-[13px] leading-5 text-black/50">Add one or more developer emails. We&rsquo;ll prepare the installation instructions and widget code for you.</p>
                    <form className="mt-5 space-y-4" onSubmit={async (event) => {
                      event.preventDefault();
                      if (!widgetKey || developerSending) return;
                      let emails = developerEmails;
                      const draft = developerEmailDraft.trim().replace(/,$/, "");
                      if (draft) {
                        if (!DEVELOPER_EMAIL_RE.test(draft)) {
                          setDeveloperEmailDraftError(true);
                          developerEmailRef.current?.focus();
                          return;
                        }
                        if (!emails.includes(draft)) emails = [...emails, draft];
                        setDeveloperEmails(emails);
                        setDeveloperEmailDraft("");
                      }
                      if (emails.length === 0) {
                        setDeveloperEmailDraftError(true);
                        developerEmailRef.current?.focus();
                        return;
                      }
                      setDeveloperSending(true);
                      setDeveloperSendStatus(null);
                      try {
                        const response = await fetch("/api/onboarding/send-widget-instructions", {
                          method: "POST",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ emails, siteKey: widgetKey }),
                        });
                        const result = await response.json().catch(() => ({})) as { message?: string; sent?: number };
                        if (!response.ok) throw new Error(result.message || "Could not send the instructions.");
                        setDeveloperSendStatus({ type: "success", message: `Instructions sent to you and ${result.sent ?? emails.length} developer${(result.sent ?? emails.length) === 1 ? "" : "s"}.` });
                        setDeveloperEmails([]);
                      } catch (error) {
                        setDeveloperSendStatus({ type: "error", message: error instanceof Error ? error.message : "Could not send the instructions." });
                      } finally {
                        setDeveloperSending(false);
                      }
                    }}>
                      <div>
                        <label htmlFor="developer-email" className="mb-1.5 block text-[12px] text-black/55">Developer emails</label>
                        <div
                          onClick={() => developerEmailRef.current?.focus()}
                          className={`flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-lg bg-white px-2.5 py-1.5 ring-1 transition focus-within:ring-black/35 ${developerEmailDraftError ? "ring-red-400" : "ring-black/10"}`}
                        >
                          {developerEmails.map((email) => (
                            <span key={email} className="flex items-center gap-1 rounded-full bg-black/[0.06] py-1 pl-2.5 pr-1.5 text-[12px] text-black/80">
                              {email}
                              <button
                                type="button"
                                disabled={developerSending}
                                onClick={() => removeDeveloperEmail(email)}
                                aria-label={`Remove ${email}`}
                                className="flex size-4 items-center justify-center rounded-full text-black/40 transition hover:bg-black/10 hover:text-black/70 disabled:opacity-50"
                              >
                                ×
                              </button>
                            </span>
                          ))}
                          <input
                            ref={developerEmailRef}
                            id="developer-email"
                            type="text"
                            inputMode="email"
                            disabled={developerSending}
                            value={developerEmailDraft}
                            onChange={(event) => handleDeveloperEmailChange(event.target.value)}
                            onKeyDown={handleDeveloperEmailKeyDown}
                            onBlur={() => { if (developerEmailDraft.trim()) { const ok = commitDeveloperEmail(developerEmailDraft); setDeveloperEmailDraft(ok ? "" : developerEmailDraft); setDeveloperEmailDraftError(!ok); } }}
                            onPaste={(event) => {
                              const text = event.clipboardData.getData("text");
                              if (!/[,\s]/.test(text)) return;
                              event.preventDefault();
                              text.split(/[,\s]+/).forEach((part) => { if (part.trim()) commitDeveloperEmail(part); });
                            }}
                            placeholder={developerEmails.length === 0 ? "dev@company.com, team@company.com" : "Add another…"}
                            className="h-7 min-w-[8rem] flex-1 bg-transparent text-[13px] outline-none placeholder:text-black/30 disabled:opacity-60"
                          />
                        </div>
                        <p className={`mt-1.5 text-[11px] leading-4 ${developerEmailDraftError ? "text-red-600" : "text-black/40"}`}>{developerEmailDraftError ? "Enter a valid email address." : "Press comma, space, or enter to add each address."}</p>
                      </div>
                      <button type="submit" disabled={!widgetKey || developerSending} className="flex h-11 w-full items-center justify-center rounded-lg bg-black px-4 text-[13px] text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50">{developerSending ? "Sending…" : "Send instructions"}</button>
                    </form>
                    {developerSendStatus && <p role="status" className={`mt-3 text-[12px] leading-5 ${developerSendStatus.type === "success" ? "text-emerald-700" : "text-red-600"}`}>{developerSendStatus.message}</p>}
                    <p className="mt-3 text-[11px] leading-4 text-black/40">Elpino sends the instructions directly and copies every address you enter.</p>
                  </div>
                </aside>
              </div>
            </div>
          </div>,
          document.body
        )}

        {false && (() => {
          const pendingCount = crawlPages.filter((page) => page.selected && page.state !== "saved").length;
          const savedCount = crawlPages.filter((page) => page.state === "saved").length;
          const busy = crawlStatus === "discovering" || crawlStatus === "saving";
          return (
            <section>
              <h1 className="text-balance text-xl font-normal leading-[1.12] tracking-[-0.03em]">
                Teach Elpino about your business
              </h1>
              <p className="mt-2 text-lg text-black/55">
                We&rsquo;ll scan {siteHostname} from the homepage outward, then save the pages you choose to your knowledge base.
              </p>

              <div className="mx-auto mt-8 flex flex-wrap items-center justify-center gap-2">
                <span className="mr-1 text-[14px] text-black/55">Pages to scan</span>
                {CRAWL_LIMIT_OPTIONS.map((limit) => (
                  <button
                    key={limit}
                    type="button"
                    disabled={busy}
                    onClick={() => setCrawlLimit(limit)}
                    aria-pressed={crawlLimit === limit}
                    className={`${chipClass(crawlLimit === limit)} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    {limit}
                  </button>
                ))}
              </div>

              {crawlError && <p className="mt-6 text-sm text-red-600">{crawlError}</p>}

              {crawlStatus === "discovering" && (
                <p className="mt-8 flex items-center justify-center gap-2 text-[15px] text-black/55">
                  {spinner}Scanning {siteHostname}… this can take a minute.
                </p>
              )}

              {crawlPages.length > 0 && (
                <div className="mx-auto mt-8 w-full max-w-[680px] overflow-hidden rounded-2xl border border-black/10 bg-white text-left">
                  <div className="flex items-center justify-between gap-3 border-b border-black/[0.06] bg-[#fafafa] px-4 py-3">
                    <p className="text-[13px] text-black/55">
                      {pendingCount + savedCount} of {crawlPages.length} pages selected
                    </p>
                    {crawlStatus === "ready" && crawlLimit > scannedLimit && (
                      <button type="button" onClick={() => void discoverPages(crawlLimit)} className="cursor-pointer text-[13px] font-medium text-[#2563eb] hover:underline">
                        Scan up to {crawlLimit} pages
                      </button>
                    )}
                  </div>
                  <ul className="max-h-[420px] divide-y divide-black/[0.06] overflow-y-auto">
                    {crawlPages.map((page) => (
                      <li key={page.url} className="flex items-center gap-3 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={page.selected || page.state === "saved"}
                          disabled={page.state === "saved" || page.state === "saving" || crawlStatus === "saving"}
                          onChange={() => togglePage(page.url)}
                          aria-label={`Include ${page.title}`}
                          className="size-4 shrink-0 cursor-pointer accent-[#2563eb] disabled:cursor-default"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[14px] font-medium text-[#1f2328]">{page.title}</p>
                          <p className="truncate text-[12px] text-black/45">{new URL(page.url).pathname}</p>
                          {page.error && <p className="mt-0.5 text-[12px] text-red-600">{page.error}</p>}
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset ${PRIORITY_BADGE[page.priority]}`}>
                          {page.priority}
                        </span>
                        <span className="flex w-5 shrink-0 justify-center">
                          {page.state === "saving" && spinner}
                          {page.state === "saved" && <Check className="size-4 text-emerald-600" aria-label="Saved" />}
                          {page.state === "failed" && <span className="text-[14px] font-semibold text-red-600" aria-label="Failed">!</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {crawlStatus === "idle" && (
                <button type="button" onClick={() => void discoverPages(crawlLimit)} className={primaryButtonClass}>
                  Scan website
                </button>
              )}
              {(crawlStatus === "ready" || crawlStatus === "saving") && (
                <button type="button" disabled={busy || pendingCount === 0} onClick={() => void savePages()} className={primaryButtonClass}>
                  {crawlStatus === "saving" ? <>{spinner}Saving pages…</> : `Save ${pendingCount} page${pendingCount === 1 ? "" : "s"} to knowledge`}
                </button>
              )}
              {crawlStatus === "done" && (
                <p className="mt-6 text-[15px] text-emerald-700">
                  {savedCount} page{savedCount === 1 ? "" : "s"} saved. You can add more anytime from Knowledge.
                </p>
              )}

              {skipError && <p className="mt-4 text-sm text-red-600">{skipError}</p>}
              {crawlStatus === "done" ? (
                <button type="button" disabled={skipLoading} onClick={() => void skipTelegram()} className={primaryButtonClass}>
                  {skipLoading ? <>{spinner}Saving…</> : "Go to dashboard"}
                </button>
              ) : (
                <button type="button" disabled={skipLoading || busy} onClick={() => void skipTelegram()} className="mx-auto mt-4 block cursor-pointer text-[14px] text-black/50 underline-offset-4 transition hover:text-black hover:underline disabled:cursor-not-allowed disabled:opacity-50">
                  Skip for now
                </button>
              )}
            </section>
          );
        })()}
        </div>
      </div>


    </main>
  );
}
