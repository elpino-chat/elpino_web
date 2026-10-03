// Content for the /compare pages.
//
// Rules for editing this file:
//  - Competitor facts come from their own public pricing pages (linked on each page and dated by `verified`).
//    If a fact cannot be verified, use `null` for the competitor's cell: the page then says "Not verified",
//    which is honest. Never guess, and never imply a competitor lacks something we simply did not check.
//  - Elpino facts must match what the site already claims (features, pricing and FAQ pages, plans.ts).
//    Omnichannel is NOT live: it is "coming in November" everywhere else on the site and is described that way here.
//  - `edge` marks who is ahead on that row. Use "even" when it is a difference of approach rather than a win,
//    and give the competitor the edge wherever it is genuinely stronger.
//  - Re-check the numbers and bump `verified` whenever a page is edited.

export type Edge = "elpino" | "them" | "even";

export type Row = {
  feature: string;
  elpino: string;
  /** null = not verified; rendered as "Not verified". */
  them: string | null;
  edge: Edge;
};

export type Category = { id: string; title: string; intro: string; rows: Row[] };

export type Glance = { label: string; elpino: string; them: string };

export type CostRow = { scenario: string; elpino: string; them: string };

export type Faq = { q: string; a: string };

export type Competitor = {
  slug: string;
  name: string;
  /** One line on the /compare index card. */
  oneLiner: string;
  /** <meta description>. */
  description: string;
  /** Month the facts were last checked, shown on the page. */
  verified: string;
  /** ISO date for the sitemap. */
  verifiedIso: string;
  website: string;
  pricingUrl: string;
  tldr: string;
  chooseElpino: string[];
  chooseThem: string[];
  glance: Glance[];
  categories: Category[];
  cost: { title: string; intro: string; rows: CostRow[]; note: string };
  switching: string[];
  faqs: Faq[];
};

// ---------------------------------------------------------------- shared Elpino facts

const ELPINO_START = "Free, then Starter $12, Growth $59 and Scale $299 a month";
const ELPINO_SEATS = "Unlimited teammates on every plan";
const ELPINO_AI_COST = "A monthly AI credit is included ($7, $40 or $240 on paid plans). Free has 100 AI messages a month";
const ELPINO_CHANNELS = "Website chat today, plus email replies to verified visitors. Omnichannel is coming in November";
const ELPINO_SETUP = "About five minutes: add your site, import your knowledge, paste one snippet";

const ELPINO_FREE = "Yes: 100 AI messages a month, unlimited seats, no card";

// The Elpino-side rows that do not depend on who we are compared with. Competitor cells are null where the
// competitor's own public pages did not give us a fact we can stand behind.
const commonAnswerRows = (): Row[] => [
  {
    feature: "Answers stay inside approved knowledge",
    elpino: "Replies come only from knowledge you approved. If it is not there, the AI says so and hands over instead of guessing",
    them: null,
    edge: "even",
  },
  {
    feature: "Fact review before sending",
    elpino: "Drafts are checked against what the tools actually returned before the customer sees them",
    them: null,
    edge: "even",
  },
  {
    feature: "Audit trail",
    elpino: "Every AI run is logged: what it searched, what it found and what it replied",
    them: null,
    edge: "even",
  },
  {
    feature: "Reply language",
    elpino: "Matches the customer's language by default, or you fix one reply language in Settings",
    them: null,
    edge: "even",
  },
];

const commonKnowledgeRows: Row[] = [
  {
    feature: "Sources the AI learns from",
    elpino:
      "Website crawl (JavaScript pages are rendered in a real browser), sitemap import up to 20 pages, link discovery up to 50 pages, PDF, Word, text and Markdown uploads, and pages you write yourself",
    them: null,
    edge: "even",
  },
  {
    feature: "Public and private sources",
    elpino: "Each source has a visibility switch, so internal notes stay internal",
    them: null,
    edge: "even",
  },
];

const commonActionRows: Row[] = [
  {
    feature: "Payments in chat",
    elpino:
      "Looks up real payments in Stripe or Razorpay, creates a fresh secure payment link, checks or cancels a subscription and finds receipts. Refunds are off by default and the owner decides",
    them: null,
    edge: "even",
  },
  {
    feature: "Shopify and WooCommerce orders",
    elpino: "Finds a verified customer's order with status and tracking. For unshipped orders it can cancel or fix the address when the owner switches that on",
    them: null,
    edge: "even",
  },
  {
    feature: "Sales leads",
    elpino: "A qualified sales chat becomes a HubSpot contact with a note on what they want",
    them: null,
    edge: "even",
  },
  {
    feature: "Your own tools (MCP)",
    elpino: "Connect up to five MCP servers and switch on exactly the tools the agent may use",
    them: null,
    edge: "even",
  },
];

const commonPrivacyRows: Row[] = [
  {
    feature: "Private-data filter",
    elpino: "Names and emails are swapped for reference codes before the AI reads a conversation, and secrets are stripped out",
    them: null,
    edge: "even",
  },
  {
    feature: "Identity check",
    elpino: "A one-time email code or a signed token from your own app confirms who the customer is before account details are shared",
    them: null,
    edge: "even",
  },
  {
    feature: "Sensitive details",
    elpino: "Ask for passwords or server details through a one-time private form instead of the chat",
    them: null,
    edge: "even",
  },
  {
    feature: "Stored credentials",
    elpino: "Connected credentials are stored encrypted and deleted the moment you disconnect",
    them: null,
    edge: "even",
  },
];

const commonInboxRows: Row[] = [
  {
    feature: "Who has each conversation",
    elpino: "A badge shows whether the AI, a teammate or nobody has it. Take over and hand back to the AI in one tap",
    them: null,
    edge: "even",
  },
  {
    feature: "Join alerts",
    elpino: "When a customer asks for a person every teammate gets an alert. The first to join takes it and it clears for everyone",
    them: null,
    edge: "even",
  },
  {
    feature: "When nobody joins",
    elpino: "After 90 seconds the customer is told and a ticket is created automatically, with an email follow-up",
    them: null,
    edge: "even",
  },
];

const migrationSteps = (from: string): string[] => [
  "Sign up free. There is no card and no trial clock.",
  `Add your website. Elpino crawls your help centre pages and reads sitemaps, or you can export your ${from} articles and upload them as PDF, Word, text or Markdown files.`,
  "Paste the one-line snippet on your site, or use the WordPress plugin. The widget is answering within minutes.",
  "Invite your team. Seats are unlimited, so nobody has to be left out to save money.",
  `Run both side by side for a week. Ticket history does not transfer automatically, so keep ${from} available for old conversations until you are ready to switch.`,
];

// ---------------------------------------------------------------- competitors

export const competitors: Competitor[] = [
  // ------------------------------------------------------------ Zendesk
  {
    slug: "zendesk",
    name: "Zendesk",
    oneLiner: "A full enterprise support suite, priced per agent, against an AI-first helpdesk with unlimited seats.",
    description:
      "Elpino vs Zendesk: pricing, AI agent, inbox, channels and security compared side by side. See which fits a small or growing support team, with honest notes on where Zendesk is stronger.",
    verified: "October 2026",
    verifiedIso: "2026-10-03",
    website: "https://www.zendesk.com",
    pricingUrl: "https://www.zendesk.com/pricing/",
    tldr:
      "Zendesk is a very complete suite: email, chat, messaging and voice, with deep routing and an enormous app ecosystem. It is priced per agent, and its AI agent is billed per automated resolution on top. Elpino is narrower and faster to start: an AI agent and a shared inbox for website chat, with unlimited seats and AI paid from a monthly credit. If you need phone support or enterprise workflows today, Zendesk is the safer pick. If you want customers answered by AI from your own content, with your whole team on board, Elpino is lighter and cheaper to run.",
    chooseElpino: [
      "You have a small or growing team and do not want to pay for every extra seat.",
      "Website chat is where most of your customers write to you.",
      "You want the AI to take real actions, such as checking a payment or an order, within limits you set.",
      "You want to be live this afternoon, not after a rollout project.",
      "You want names, emails and secrets kept away from the AI model.",
    ],
    chooseThem: [
      "You need phone or voice support today.",
      "You need messaging apps and email handled in one suite right now.",
      "You rely on skills-based routing, IVR, approval workflows or a sandbox.",
      "You want the widest app marketplace and a large admin team to run it.",
    ],
    glance: [
      { label: "Best for", elpino: "Small and growing teams that want an AI agent plus a shared inbox, live in minutes", them: "Larger support organisations that need voice, complex routing and a big ecosystem" },
      { label: "Pricing model", elpino: "Flat plans with unlimited seats. AI runs on a monthly credit", them: "Per agent per month, plus per-resolution fees for the AI agent" },
      { label: "Starting price", elpino: ELPINO_START, them: "Support Team US$19 per agent a month billed annually (US$25 monthly). AI agents start on Suite Team at US$55 per agent annually (US$69 monthly)" },
      { label: "Free plan", elpino: ELPINO_FREE, them: "No free plan is listed on the pricing page" },
      { label: "Seats", elpino: ELPINO_SEATS, them: "Priced per agent" },
      { label: "AI agent cost", elpino: ELPINO_AI_COST, them: "Billed per automated resolution. Pay-as-you-go is listed at US$2.00 per resolution" },
      { label: "Channels", elpino: ELPINO_CHANNELS, them: "Email, live chat, messaging and voice on Suite plans" },
      { label: "Time to start", elpino: ELPINO_SETUP, them: "A full suite with many options to configure" },
    ],
    categories: [
      {
        id: "ai",
        title: "AI agent",
        intro: "How the AI answers, how much you can trust it, and what it costs to run.",
        rows: [
          { feature: "How the AI is priced", elpino: ELPINO_AI_COST, them: "Per automated resolution, with a small monthly allowance per agent and pay-as-you-go listed at US$2.00 each", edge: "even" },
          ...commonAnswerRows(),
        ],
      },
      {
        id: "knowledge",
        title: "Knowledge and training",
        intro: "Where the AI gets its answers from.",
        rows: [
          ...commonKnowledgeRows.slice(0, 1),
          { feature: "Built-in knowledge base", elpino: "Knowledge Hub that the AI answers from, with public and private sources", them: "Knowledge base included from Suite Team", edge: "even" },
          ...commonKnowledgeRows.slice(1),
        ],
      },
      {
        id: "inbox",
        title: "Inbox and teamwork",
        intro: "How your team picks up conversations the AI hands over.",
        rows: [
          { feature: "Seats", elpino: ELPINO_SEATS, them: "Priced per agent, so every added teammate adds to the bill", edge: "elpino" },
          ...commonInboxRows,
          { feature: "Routing and workflows", elpino: "Assignments with notifications, and join alerts", them: "Skills-based routing and IVR on Suite Professional, and approval workflows and a sandbox on Enterprise", edge: "them" },
        ],
      },
      {
        id: "channels",
        title: "Channels",
        intro: "Where customers can reach you. This is the biggest gap today, and we would rather say so plainly.",
        rows: [
          { feature: "Website chat", elpino: "Live today, with your logo and colours on a widget you embed with one snippet", them: "Live chat on Suite plans", edge: "even" },
          { feature: "Email", elpino: "Verified visitors who left the chat can still get your reply by email, and unanswered chats become tickets with an email follow-up", them: "Email and ticketing from the Support Team plan", edge: "them" },
          { feature: "Messaging apps and voice", elpino: "Omnichannel is coming in November. There is no phone or voice support", them: "Messaging and voice on Suite plans", edge: "them" },
        ],
      },
      {
        id: "integrations",
        title: "Integrations and actions",
        intro: "What the AI can actually do for a customer, and what it connects to.",
        rows: [
          ...commonActionRows,
          { feature: "Ecosystem", elpino: "Stripe, Razorpay, Shopify, WooCommerce, HubSpot, Trello and Asana, plus any MCP server you connect", them: "A large app marketplace, and an app builder on Suite Professional", edge: "them" },
        ],
      },
      {
        id: "security",
        title: "Privacy and control",
        intro: "What reaches the AI model, and who is allowed to do what.",
        rows: [
          ...commonPrivacyRows,
          { feature: "Admin controls for large teams", elpino: "Workspace owner decides which tools and actions the AI may use", them: "Sandbox, approval workflows and intelligent triage on Enterprise", edge: "them" },
        ],
      },
      {
        id: "pricing",
        title: "Pricing and billing",
        intro: "What you pay, and how it grows.",
        rows: [
          { feature: "Plan structure", elpino: "Flat monthly plans. Seats are never part of the price", them: "Per agent per month, in tiers from Support Team to Enterprise", edge: "even" },
          { feature: "Entry price", elpino: "Free, then $12 a month", them: "US$19 per agent a month billed annually for email and ticketing only. AI agents and live chat start at US$55 per agent annually", edge: "elpino" },
          { feature: "Free plan", elpino: ELPINO_FREE, them: "None listed on the pricing page", edge: "elpino" },
          { feature: "Running out of AI budget", elpino: "The AI hands new conversations to your team instead of answering. Top up any time or turn on automatic recharge. Top-ups never expire", them: "Charged per resolution, so cost rises with volume", edge: "even" },
        ],
      },
    ],
    cost: {
      title: "What seats alone cost",
      intro: "Zendesk charges per agent, so the number of teammates drives the bill. This table counts seats only, at the list price of the first Zendesk plan that includes AI agents and live chat (Suite Team, billed annually). AI resolutions are billed on top.",
      rows: [
        { scenario: "3 teammates", elpino: "$59 a month on Growth ($49 on annual billing)", them: "3 × US$55 = US$165 a month" },
        { scenario: "10 teammates", elpino: "$59 a month, unchanged", them: "10 × US$55 = US$550 a month" },
        { scenario: "25 teammates", elpino: "$59 a month, unchanged", them: "25 × US$55 = US$1,375 a month" },
      ],
      note: "These are list prices for one tier, not like-for-like. Zendesk Suite includes voice and messaging that Elpino does not have yet. Taxes, regional pricing and add-ons are excluded.",
    },
    switching: migrationSteps("Zendesk Guide"),
    faqs: [
      { q: "Is Elpino a Zendesk replacement?", a: "For a team whose customers mostly write through your website, yes: Elpino gives you an AI agent and a shared inbox without the per-agent cost. If you rely on phone support, messaging apps or enterprise routing and approval workflows, Zendesk is the better fit today." },
      { q: "How does pricing compare?", a: "Zendesk charges per agent and bills its AI agent per automated resolution. Elpino has flat plans with unlimited seats, and the AI runs on a monthly credit. The seat table on this page shows the difference for teams of 3, 10 and 25." },
      { q: "Does Elpino support WhatsApp, Instagram or voice?", a: "Website chat is live today. Omnichannel is coming in November. There is no voice or phone support." },
      { q: "Can a human take over from the AI?", a: "Yes. When a customer asks for a person, every teammate gets a join alert and the first to join takes the conversation. You can hand it back to the AI in one tap. If nobody joins within 90 seconds, a ticket is created automatically." },
      { q: "Is customer data sent to the AI?", a: "Names and emails are replaced with reference codes before the AI reads a conversation, and secrets are stripped out. Connected credentials are stored encrypted." },
      { q: "Can I try Elpino without leaving Zendesk?", a: "Yes. The free plan has no card and no time limit, so you can put Elpino chat on your site alongside your current setup and compare." },
    ],
  },

  // ------------------------------------------------------------ Crisp
  {
    slug: "crisp",
    name: "Crisp",
    oneLiner: "A channel-rich messaging inbox with workspace pricing, against an AI-first helpdesk with unlimited seats.",
    description:
      "Elpino vs Crisp: plans, seats, AI credits, channels and features compared side by side. See how an AI-first helpdesk with unlimited seats stacks up against Crisp's flat workspace plans.",
    verified: "October 2026",
    verifiedIso: "2026-10-03",
    website: "https://crisp.chat",
    pricingUrl: "https://crisp.chat/en/pricing/",
    tldr:
      "Crisp prices per workspace rather than per agent, which already makes it friendlier than most helpdesks, and it reaches customers on many channels: WhatsApp, Instagram, SMS, Telegram, Messenger and more on its higher plans. Its seats are capped by plan, and its AI agent only arrives on Essentials. Elpino puts AI on every plan, including Free, and never limits seats, but it is website chat only until omnichannel arrives in November. If you need messaging apps now, Crisp is stronger. If you want an AI agent from day one and a team of any size, Elpino fits better.",
    chooseElpino: [
      "You want an AI agent on a free or very cheap plan.",
      "Your team is growing and you do not want seat limits or per-seat extras.",
      "You want the AI to take real actions, such as checking a payment or an order.",
      "Website chat is where your customers are.",
      "You want names and secrets kept away from the AI model.",
    ],
    chooseThem: [
      "You need WhatsApp, Instagram, SMS, Telegram or Messenger in the same inbox today.",
      "You want phone support as a channel.",
      "You value a chatbot builder for scripted flows alongside the AI agent.",
    ],
    glance: [
      { label: "Best for", elpino: "Teams that want an AI agent from the first day and a team of any size", them: "Small teams that want many messaging channels at a flat workspace price" },
      { label: "Pricing model", elpino: "Flat plans with unlimited seats. AI runs on a monthly credit", them: "Per workspace, with seats included by plan. Extra agents are US$10 a month each" },
      { label: "Starting price", elpino: ELPINO_START, them: "Free, then Mini US$45, Essentials US$95 and Plus US$295 a month" },
      { label: "Free plan", elpino: ELPINO_FREE, them: "Yes: 2 seats, no AI agent" },
      { label: "Seats", elpino: ELPINO_SEATS, them: "2 on Free, 4 on Mini, 10 on Essentials and 20 or more on Plus" },
      { label: "AI agent", elpino: "On every plan, including Free. Paid plans include $7, $40 or $240 of AI credit a month", them: "From the Essentials plan. Free and Mini have no AI agent" },
      { label: "Channels", elpino: ELPINO_CHANNELS, them: "Chat widget, email and contact form, plus WhatsApp, Instagram, SMS, Telegram, Messenger, X, Viber, Line and phone on Essentials and above" },
      { label: "Time to start", elpino: ELPINO_SETUP, them: "A free plan to start, then a plan upgrade to unlock the AI agent" },
    ],
    categories: [
      {
        id: "ai",
        title: "AI agent",
        intro: "How the AI answers, how much you can trust it, and which plan you need.",
        rows: [
          { feature: "Which plans include the AI agent", elpino: "Every plan, including Free (100 AI messages a month)", them: "Essentials and above. Free and Mini do not include an AI agent", edge: "elpino" },
          { feature: "AI budget", elpino: ELPINO_AI_COST, them: "AI credits bundled by plan: about US$5 on Mini, US$25 on Essentials and US$75 on Plus, described as roughly 90, 450 and 1,350 automated conversations", edge: "even" },
          ...commonAnswerRows(),
          { feature: "Chatbot builder", elpino: "The AI answers from your knowledge. There is no separate scripted-flow builder", them: "AI chatbot builder on Essentials and above", edge: "them" },
        ],
      },
      {
        id: "knowledge",
        title: "Knowledge and training",
        intro: "Where the AI gets its answers from.",
        rows: commonKnowledgeRows,
      },
      {
        id: "inbox",
        title: "Inbox and teamwork",
        intro: "How your team picks up conversations the AI hands over.",
        rows: [
          { feature: "Seats", elpino: ELPINO_SEATS, them: "Included seats rise with the plan (2, 4, 10, 20 or more). Additional agents are US$10 a month each", edge: "elpino" },
          ...commonInboxRows,
        ],
      },
      {
        id: "channels",
        title: "Channels",
        intro: "Where customers can reach you. This is Crisp's clearest advantage today.",
        rows: [
          { feature: "Website chat", elpino: "Live today, with your logo and colours on a widget you embed with one snippet", them: "Chat widget on all plans", edge: "even" },
          { feature: "Email and contact form", elpino: "Verified visitors who left the chat can get your reply by email, and unanswered chats become tickets with an email follow-up", them: "Email and a contact form on paid plans", edge: "them" },
          { feature: "Messaging apps and phone", elpino: "Omnichannel is coming in November. There is no phone support", them: "WhatsApp, Instagram, SMS, Telegram, Messenger, X, Viber, Line and phone on Essentials and above", edge: "them" },
        ],
      },
      {
        id: "integrations",
        title: "Integrations and actions",
        intro: "What the AI can actually do for a customer.",
        rows: commonActionRows,
      },
      {
        id: "security",
        title: "Privacy and control",
        intro: "What reaches the AI model, and who is allowed to do what.",
        rows: commonPrivacyRows,
      },
      {
        id: "pricing",
        title: "Pricing and billing",
        intro: "What you pay, and how it grows.",
        rows: [
          { feature: "Plan structure", elpino: "Flat monthly plans. Seats are never part of the price", them: "Per workspace, with a seat allowance per plan", edge: "even" },
          { feature: "Free plan", elpino: ELPINO_FREE, them: "Yes: 2 seats, no AI agent", edge: "elpino" },
          { feature: "Cheapest plan with an AI agent", elpino: "Free, or Starter at $12 a month", them: "Essentials at US$95 a month", edge: "elpino" },
          { feature: "Adding a teammate", elpino: "Free of charge", them: "Included up to the plan's seat count, then US$10 a month per extra agent", edge: "elpino" },
        ],
      },
    ],
    cost: {
      title: "What it costs for a team with an AI agent",
      intro: "Crisp's AI agent starts on Essentials, so this compares the cheapest Crisp plan that has one with Elpino. Crisp prices are US dollars per workspace per month.",
      rows: [
        { scenario: "2 teammates", elpino: "Free ($0), with 100 AI messages a month", them: "Free ($0), but with no AI agent. Essentials at US$95 adds one" },
        { scenario: "4 teammates, with an AI agent", elpino: "Starter $12 a month, or Growth $59 for more AI credit", them: "Essentials, US$95 a month (10 seats included)" },
        { scenario: "15 teammates, with an AI agent", elpino: "$12 to $59 a month, with the same unlimited seats", them: "Essentials US$95 for 10 seats plus 5 extra agents at US$10 = US$145 a month" },
      ],
      note: "AI credit differs: Essentials includes about US$25 of AI credit, while Elpino Growth includes $40 and Starter $7. Crisp also includes many more channels. Taxes and add-ons are excluded.",
    },
    switching: migrationSteps("Crisp"),
    faqs: [
      { q: "Is Elpino a Crisp alternative?", a: "If your customers mostly use your website and you want an AI agent without a plan upgrade, yes. If you depend on WhatsApp, Instagram, SMS or phone in one inbox today, Crisp covers that and Elpino does not yet." },
      { q: "Does Elpino have a free plan with AI?", a: "Yes. Free includes 100 AI messages a month, unlimited seats, no card and no time limit. On Crisp, the free and Mini plans do not include an AI agent." },
      { q: "How many teammates can I add?", a: "As many as you like, on every plan, at no extra cost. Crisp includes a set number of seats per plan and charges US$10 a month for each extra agent." },
      { q: "Does Elpino support WhatsApp or Instagram?", a: "Not yet. Website chat is live today and omnichannel is coming in November." },
      { q: "Can a human take over from the AI?", a: "Yes. Every teammate gets a join alert when a customer asks for a person, the first to join takes it, and you can hand it back to the AI in one tap." },
      { q: "Is customer data sent to the AI?", a: "Names and emails are replaced with reference codes before the AI reads a conversation, and secrets are stripped out." },
    ],
  },

  // ------------------------------------------------------------ Intercom
  {
    slug: "intercom",
    name: "Intercom",
    oneLiner: "A polished per-seat helpdesk with the Fin AI agent, against an AI-first helpdesk with unlimited seats.",
    description:
      "Elpino vs Intercom: seat pricing, Fin AI agent pricing, inbox, channels and security compared side by side. See which fits a growing support team.",
    verified: "October 2026",
    verifiedIso: "2026-10-03",
    website: "https://www.intercom.com",
    pricingUrl: "https://www.intercom.com/pricing",
    tldr:
      "Intercom is a polished customer platform with a mature AI agent, Fin, plus in-app messages, banners and tooltips. It charges per seat, and Fin is billed per outcome on top, starting from US$0.99 each. Elpino is smaller in scope but simpler to budget: unlimited seats and an AI agent paid from a monthly credit, with a free plan. If you want in-app messaging and a battle-tested AI agent and can budget per seat and per outcome, Intercom is excellent. If your team is growing and you want predictable cost, Elpino is much lighter.",
    chooseElpino: [
      "You want a flat, predictable bill instead of per-seat plus per-outcome charges.",
      "You want to start free, with an AI agent included.",
      "Website chat is your main channel.",
      "You want the AI to check payments and orders within limits you set.",
      "You want names and secrets kept away from the AI model.",
    ],
    chooseThem: [
      "You want in-app messages, banners and tooltips alongside support.",
      "You need WhatsApp, SMS or phone alongside chat, at pay-as-you-go rates.",
      "You value Fin's maturity and are comfortable paying per resolved outcome.",
    ],
    glance: [
      { label: "Best for", elpino: "Growing teams that want predictable cost and an AI agent from day one", them: "Teams that want in-app messaging and a mature AI agent and budget per seat" },
      { label: "Pricing model", elpino: "Flat plans with unlimited seats. AI runs on a monthly credit", them: "Per seat per month, plus the Fin AI agent billed per outcome" },
      { label: "Starting price", elpino: ELPINO_START, them: "Essential US$29, Advanced US$85 and Expert US$132 per seat a month on monthly billing" },
      { label: "Free plan", elpino: ELPINO_FREE, them: "No free plan is listed. A 14-day trial is offered, with no card required" },
      { label: "Seats", elpino: ELPINO_SEATS, them: "Priced per seat, with a one full seat minimum. Advanced includes 20 free Lite seats and Expert 50" },
      { label: "AI agent cost", elpino: ELPINO_AI_COST, them: "Fin is listed from US$0.99 per outcome, and a monthly minimum applies when it is used with an existing helpdesk" },
      { label: "Channels", elpino: ELPINO_CHANNELS, them: "Live chat, email and in-app chat included. Email campaigns, SMS, WhatsApp and phone are pay-as-you-go" },
      { label: "Time to start", elpino: ELPINO_SETUP, them: "A 14-day trial to try the platform" },
    ],
    categories: [
      {
        id: "ai",
        title: "AI agent",
        intro: "How the AI answers, how much you can trust it, and what it costs to run.",
        rows: [
          { feature: "How the AI is priced", elpino: ELPINO_AI_COST, them: "Fin is billed per outcome, listed from US$0.99 each, so cost rises with volume", edge: "even" },
          { feature: "Included in plans", elpino: "Every plan, including Free", them: "Fin is included on every plan, with usage billed per outcome", edge: "even" },
          ...commonAnswerRows(),
        ],
      },
      {
        id: "knowledge",
        title: "Knowledge and training",
        intro: "Where the AI gets its answers from.",
        rows: commonKnowledgeRows,
      },
      {
        id: "inbox",
        title: "Inbox and teamwork",
        intro: "How your team picks up conversations the AI hands over.",
        rows: [
          { feature: "Seats", elpino: ELPINO_SEATS, them: "Per seat, with a one full seat minimum. Higher plans include free Lite seats (20 on Advanced, 50 on Expert)", edge: "elpino" },
          ...commonInboxRows,
          { feature: "In-app messages", elpino: "Not offered today", them: "In-app chats, banners and tooltips on every plan", edge: "them" },
        ],
      },
      {
        id: "channels",
        title: "Channels",
        intro: "Where customers can reach you.",
        rows: [
          { feature: "Website chat", elpino: "Live today, with your logo and colours on a widget you embed with one snippet", them: "Unlimited live chat is included on every plan", edge: "even" },
          { feature: "Email", elpino: "Verified visitors who left the chat can get your reply by email, and unanswered chats become tickets with an email follow-up", them: "Support email included", edge: "them" },
          { feature: "WhatsApp, SMS and phone", elpino: "Omnichannel is coming in November. There is no phone support", them: "Available on a pay-as-you-go basis", edge: "them" },
        ],
      },
      {
        id: "integrations",
        title: "Integrations and actions",
        intro: "What the AI can actually do for a customer.",
        rows: commonActionRows,
      },
      {
        id: "security",
        title: "Privacy and control",
        intro: "What reaches the AI model, and who is allowed to do what.",
        rows: commonPrivacyRows,
      },
      {
        id: "pricing",
        title: "Pricing and billing",
        intro: "What you pay, and how it grows.",
        rows: [
          { feature: "Plan structure", elpino: "Flat monthly plans. Seats are never part of the price", them: "Per seat per month, plus per-outcome AI charges", edge: "even" },
          { feature: "Free plan", elpino: ELPINO_FREE, them: "None listed. 14-day trial", edge: "elpino" },
          { feature: "Entry price per teammate", elpino: "$0, because seats are free", them: "US$29 per seat a month on Essential, monthly billing", edge: "elpino" },
          { feature: "Trial", elpino: "No trial needed: the free plan has no time limit", them: "14 days, no card required", edge: "even" },
        ],
      },
    ],
    cost: {
      title: "What seats and AI outcomes cost",
      intro: "Intercom bills per seat and per Fin outcome. This table uses the Essential plan at its monthly-billing list price. Annual billing is available and cheaper but is not shown as a separate figure on the pricing page.",
      rows: [
        { scenario: "3 teammates", elpino: "$59 a month on Growth ($49 on annual billing)", them: "3 × US$29 = US$87 a month, plus Fin outcomes" },
        { scenario: "10 teammates", elpino: "$59 a month, unchanged", them: "10 × US$29 = US$290 a month, plus Fin outcomes" },
        { scenario: "25 teammates", elpino: "$59 a month, unchanged", them: "25 × US$29 = US$725 a month, plus Fin outcomes" },
        { scenario: "500 AI-resolved conversations", elpino: "Covered by Growth's $40 monthly credit, which Elpino estimates at about 800 average conversations", them: "500 × US$0.99 = about US$495 at the listed starting rate, and a monthly minimum can apply" },
      ],
      note: "The last row is not a like-for-like comparison. Elpino spends credit per conversation whether or not the AI resolves it, while Intercom charges per resolved outcome. Intercom also has in-app messaging that Elpino does not. Taxes and add-ons are excluded.",
    },
    switching: migrationSteps("Intercom"),
    faqs: [
      { q: "Is Elpino an Intercom alternative?", a: "For website support with an AI agent and a shared inbox, yes, with a much simpler bill. If you rely on in-app messages, banners and tooltips, or on WhatsApp and SMS alongside chat, Intercom covers more." },
      { q: "How does AI pricing compare to Fin?", a: "Fin is billed per outcome, listed from US$0.99 each. Elpino runs the AI on a monthly credit included in the plan, so a short conversation costs less than a long one and there is no per-resolution fee." },
      { q: "Does Elpino charge per seat?", a: "No. Seats are unlimited on every plan, including Free." },
      { q: "Does Elpino support WhatsApp or SMS?", a: "Not yet. Website chat is live today and omnichannel is coming in November." },
      { q: "Can a human take over from the AI?", a: "Yes. Every teammate gets a join alert when a customer asks for a person, the first to join takes it, and you can hand it back to the AI in one tap." },
      { q: "Is customer data sent to the AI?", a: "Names and emails are replaced with reference codes before the AI reads a conversation, and secrets are stripped out." },
    ],
  },

  // ------------------------------------------------------------ Tidio
  {
    slug: "tidio",
    name: "Tidio",
    oneLiner: "A live-chat and flows tool with the Lyro AI add-on, against an AI-first helpdesk with unlimited seats.",
    description:
      "Elpino vs Tidio: plans, conversation limits, Lyro AI pricing, channels and features compared side by side. See which suits a small support team.",
    verified: "October 2026",
    verifiedIso: "2026-10-03",
    website: "https://www.tidio.com",
    pricingUrl: "https://www.tidio.com/pricing/",
    tldr:
      "Tidio is a friendly live-chat tool with visitor flows and an AI agent called Lyro, reaching Messenger, Instagram and WhatsApp as well as your site. It meters usage in billable conversations, and Lyro is priced as an add-on on top of the plan. Elpino counts neither seats nor conversations as the main limit: seats are unlimited and the AI runs on a monthly credit, with a free plan that includes it. If you want automated visitor flows and social channels, Tidio goes further today. If you want an AI agent that answers from your knowledge and takes real actions, Elpino is the more focused choice.",
    chooseElpino: [
      "You want the AI agent included in the plan, not bought as a separate add-on.",
      "You want unlimited seats rather than a fixed seat count.",
      "You want the AI to check payments and orders within limits you set.",
      "Website chat is your main channel.",
      "You want names and secrets kept away from the AI model.",
    ],
    chooseThem: [
      "You want automated visitor flows to engage people before they write.",
      "You need Messenger, Instagram and WhatsApp alongside your site chat.",
      "You prefer a conversation-count plan and a simple live-chat start.",
    ],
    glance: [
      { label: "Best for", elpino: "Teams that want an AI agent answering from their knowledge, with a team of any size", them: "Small shops that want live chat, visitor flows and social channels in one tool" },
      { label: "Pricing model", elpino: "Flat plans with unlimited seats. AI runs on a monthly credit", them: "Plans by billable conversations, with the Lyro AI agent and Flows as separate add-ons" },
      { label: "Starting price", elpino: ELPINO_START, them: "Free, then Starter from about US$24 a month and Growth from about US$49 a month on annual billing" },
      { label: "Free plan", elpino: ELPINO_FREE, them: "Yes: 50 billable conversations and 10 seats" },
      { label: "Seats", elpino: ELPINO_SEATS, them: "10 seats on the listed plans, with custom seats on Plus and Premium" },
      { label: "AI agent", elpino: "On every plan, including Free. Paid plans include $7, $40 or $240 of AI credit a month", them: "Lyro AI agent as an add-on, listed from US$32.50 a month for 50 conversations. Starter includes 50 Lyro conversations once" },
      { label: "Channels", elpino: ELPINO_CHANNELS, them: "Live chat, ticketing and email, plus Messenger, Instagram and WhatsApp" },
      { label: "Time to start", elpino: ELPINO_SETUP, them: "A free plan to start, with the AI agent bought separately" },
    ],
    categories: [
      {
        id: "ai",
        title: "AI agent",
        intro: "How the AI answers, how much you can trust it, and how it is bought.",
        rows: [
          { feature: "How the AI is bought", elpino: "Included on every plan. Paid plans include a monthly AI credit", them: "Lyro is an add-on, listed from US$32.50 a month for 50 conversations", edge: "elpino" },
          ...commonAnswerRows(),
          { feature: "Guaranteed AI outcomes", elpino: "No resolution-rate guarantee", them: "The Premium plan lists a guaranteed 50% Lyro resolution rate", edge: "them" },
        ],
      },
      {
        id: "knowledge",
        title: "Knowledge and training",
        intro: "Where the AI gets its answers from.",
        rows: commonKnowledgeRows,
      },
      {
        id: "inbox",
        title: "Inbox and teamwork",
        intro: "How your team picks up conversations the AI hands over.",
        rows: [
          { feature: "Seats", elpino: ELPINO_SEATS, them: "10 seats on the listed plans. Custom seat counts on higher plans", edge: "elpino" },
          ...commonInboxRows,
          { feature: "Visitor automation", elpino: "No separate flow builder", them: "Flows add-on, listed from US$24.17 a month, to engage visitors automatically", edge: "them" },
        ],
      },
      {
        id: "channels",
        title: "Channels",
        intro: "Where customers can reach you.",
        rows: [
          { feature: "Website chat", elpino: "Live today, with your logo and colours on a widget you embed with one snippet", them: "Live chat on all plans", edge: "even" },
          { feature: "Email", elpino: "Verified visitors who left the chat can get your reply by email, and unanswered chats become tickets with an email follow-up", them: "Ticketing and email management on all plans", edge: "them" },
          { feature: "Messenger, Instagram and WhatsApp", elpino: "Omnichannel is coming in November", them: "Included in the listed integrations", edge: "them" },
        ],
      },
      {
        id: "integrations",
        title: "Integrations and actions",
        intro: "What the AI can actually do for a customer.",
        rows: commonActionRows,
      },
      {
        id: "security",
        title: "Privacy and control",
        intro: "What reaches the AI model, and who is allowed to do what.",
        rows: commonPrivacyRows,
      },
      {
        id: "pricing",
        title: "Pricing and billing",
        intro: "What you pay, and how it grows.",
        rows: [
          { feature: "Plan structure", elpino: "Flat monthly plans. Seats are never part of the price", them: "By billable conversations, with Lyro and Flows priced separately", edge: "even" },
          { feature: "Free plan", elpino: ELPINO_FREE, them: "Yes: 50 billable conversations, 10 seats", edge: "even" },
          { feature: "AI on the free plan", elpino: "100 AI messages a month", them: "Lyro is listed as a separate add-on", edge: "elpino" },
          { feature: "Top end", elpino: "Scale at $299 a month, with $240 of AI credit", them: "Plus from US$300 a month plus usage, and custom Premium pricing", edge: "even" },
        ],
      },
    ],
    cost: {
      title: "What a team with an AI agent costs",
      intro: "Tidio sells its AI agent separately, so this adds the Lyro add-on to the plan. Tidio's prices are US dollars and annual-billing equivalents as shown on its pricing page.",
      rows: [
        { scenario: "Free, to try it", elpino: "$0 with 100 AI messages a month", them: "$0 with 50 billable conversations, with Lyro bought separately" },
        { scenario: "Starter plan with an AI agent", elpino: "Starter $12 a month, with a $7 AI credit", them: "About US$24 for Starter plus Lyro from US$32.50 = about US$57 a month" },
        { scenario: "Growth plan with an AI agent", elpino: "Growth $59 a month, with a $40 AI credit", them: "About US$49 for Growth plus Lyro from US$32.50 = about US$82 a month" },
      ],
      note: "Both columns are starting prices and the AI allowances are not equal, so treat this as a guide. Tidio's Lyro price grows with conversations, and Elpino's credit is spent as the AI works. Taxes and other add-ons are excluded.",
    },
    switching: migrationSteps("Tidio"),
    faqs: [
      { q: "Is Elpino a Tidio alternative?", a: "If you want an AI agent that answers from your own knowledge and can look up payments and orders, and a team of any size, yes. If you rely on automated visitor flows or Messenger, Instagram and WhatsApp in one tool, Tidio goes further today." },
      { q: "Is the AI agent included?", a: "On Elpino, yes, on every plan including Free. On Tidio, Lyro is sold as an add-on to the plan." },
      { q: "How many seats do I get?", a: "Unlimited, on every plan. Tidio lists 10 seats on its standard plans." },
      { q: "Does Elpino support Messenger, Instagram or WhatsApp?", a: "Not yet. Website chat is live today and omnichannel is coming in November." },
      { q: "Can a human take over from the AI?", a: "Yes. Every teammate gets a join alert when a customer asks for a person, the first to join takes it, and you can hand it back to the AI in one tap." },
      { q: "Is customer data sent to the AI?", a: "Names and emails are replaced with reference codes before the AI reads a conversation, and secrets are stripped out." },
    ],
  },
];

export const competitorBySlug = (slug: string) => competitors.find((c) => c.slug === slug);
