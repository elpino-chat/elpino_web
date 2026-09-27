// Content for the security guide. Every claim here is true of the product
// today — but deliberately describes outcomes and guarantees, not the exact
// mechanism behind them (specific algorithms, byte/bit sizes, or numeric
// thresholds). Two different audiences read this page: customers deciding
// whether to trust us, and anyone else looking for exactly how our defenses
// are tuned so they can copy the approach or work around it. The first
// audience needs "what's protected and how confident should you be";
// the second doesn't need the internals to get there.

export type Control = { id: string; title: string; text: string; where: string };
export type Chapter = {
  id: string;
  n: string;
  title: string;
  kicker: string;
  intro: string;
  color: string;
  ink?: boolean;
  stats: string[];
  controls: Control[];
  demo?: "redaction";
};

export const CHAPTERS: Chapter[] = [
  {
    id: "accounts", n: "01", title: "Accounts & sessions", color: "#3784ff",
    kicker: "Who is on your team, and how we know it's them.",
    intro: "Sign-up, sign-in and every session after it. Passwords are never kept in a readable form, verification codes expire quickly, and a session can be ended from the server at any time.",
    stats: ["Passwords hashed, never stored", "Codes expire quickly", "Sessions you can revoke"],
    controls: [
      { id: "1.1", title: "Passwords are hashed, never stored", text: "Your password is never kept anywhere in a form anyone could read back — not even us. Checking it can't leak how close a wrong guess was.", where: "auth-service" },
      { id: "1.2", title: "Email verification codes", text: "New accounts confirm their address with a short-lived code. Only a secure hash of it is stored, it expires quickly, and only a few wrong attempts are allowed before you need a fresh one.", where: "auth-service" },
      { id: "1.3", title: "Google sign-in is checked on the server", text: "The Google sign-in popup runs in your browser, but our server independently verifies it before trusting it, and always signs you into the same account by your verified email — never a second, unlinked one.", where: "auth-service" },
      { id: "1.4", title: "Signed session tokens", text: "Your session is a signed token our server can always verify on its own — it can't be forged, edited or replayed as something it isn't.", where: "web" },
      { id: "1.5", title: "A locked-down session cookie", text: "Your session cookie can't be read by page scripts, and only ever travels over a secure connection.", where: "web" },
      { id: "1.6", title: "Sign out everywhere", text: "Signing out invalidates every one of your sessions quickly. If we can't confirm a session is still valid, it's refused rather than let through.", where: "web + auth-service" },
      { id: "1.7", title: "Safe redirects", text: "After signing in, you're only ever sent to a page on our own site — never somewhere else, no matter how the link is crafted.", where: "web" },
      { id: "1.8", title: "Team invitations", text: "Invitation links are unguessable and expire automatically, and an owner decides whether members can invite others at all.", where: "auth-service" },
    ],
  },
  {
    id: "front-door", n: "02", title: "The front door", color: "#ffd84d", ink: true,
    kicker: "What the website does before a request goes any further.",
    intro: "The web app is the first thing a browser touches. It hardens the browser, limits abuse, and validates input before anything is passed on.",
    stats: ["No framing", "Abuse limited", "Fails closed"],
    controls: [
      { id: "2.1", title: "Browser hardening headers", text: "Every page except the chat widget is protected against clickjacking, guarded against content-type sniffing, and has sensitive device permissions like camera and location switched off by default. The widget is the one deliberate exception, since it has to live inside an iframe on your site.", where: "web" },
      { id: "2.2", title: "Shared abuse limits", text: "Public forms are protected by rate limits shared across every server we run, so abuse from one place can't slip through by simply hitting a different one.", where: "web + gateway" },
      { id: "2.3", title: "It fails closed", text: "If the abuse limiter can't be reached, the request is refused rather than waved through.", where: "web" },
      { id: "2.4", title: "Validated, length-capped input", text: "Every form is checked and size-limited on the server before anything is processed — never trusted just because the browser already validated it.", where: "web" },
    ],
  },
  {
    id: "gateway", n: "03", title: "The gateway", color: "#7060bd",
    kicker: "One door for the backend, closed by default.",
    intro: "Every call to the backend goes through a single gateway. The rule is simple: if a route isn't explicitly public, it needs to prove it belongs.",
    stats: ["Closed by default", "Explicit public list", "Verified live connections"],
    controls: [
      { id: "3.1", title: "Closed by default", text: "Every route requires proof it's an authorized internal call, unless it's explicitly marked public. If that check isn't configured, the gateway refuses everything rather than failing open.", where: "gateway" },
      { id: "3.2", title: "A short, explicit public list", text: "Only callers that genuinely can't hold internal credentials are public: the chat widget, page analytics, the payment webhook, and one-time secure links. Each one is marked deliberately, route by route.", where: "gateway" },
      { id: "3.3", title: "Explicit origins only", text: "The API answers browsers only from a known, approved list of origins — never from anywhere that happens to ask.", where: "gateway" },
      { id: "3.4", title: "Verified live connections", text: "Live-view connections require a verified, workspace-scoped credential with an expiry. Anything else is dropped immediately.", where: "gateway" },
      { id: "3.5", title: "Internal pushes are guarded too", text: "The endpoints services use to push live notifications to dashboards require the same internal proof, so nobody outside can ring a teammate's screen.", where: "gateway" },
    ],
  },
  {
    id: "visitors", n: "04", title: "Visitors & identity", color: "#fc7b33",
    kicker: "Telling a logged-in customer from someone who just typed an email.",
    intro: "A name, an email or an order number is not proof of who someone is. Account help unlocks only after real proof of identity, and that proof expires quickly.",
    stats: ["Real proof required", "Sessions expire automatically", "Time-limited verification"],
    controls: [
      { id: "4.1", title: "Guests stay guests", text: "A typed name, email, phone or payment reference never counts as proof of identity. Guests can chat and leave contact details, but that unlocks no private tools and is never merged into anyone else's history.", where: "workspace-service" },
      { id: "4.2", title: "Signed identity from your own site", text: "For logged-in customers, your own server vouches for who they are with a short-lived signed credential that only you and Elpino can create together. Contact details only count as verified when your system says they are.", where: "widget" },
      { id: "4.3", title: "One exchange, one session", text: "Each proof of identity is used once, then exchanged for a fresh session of its own — nothing reusable is kept lying around, and what is stored can't be turned back into the original.", where: "workspace-service" },
      { id: "4.4", title: "Short-lived sessions", text: "A session expires automatically after a period of inactivity, or a fixed time from sign-in — whichever comes first. It's held only in the widget's own memory, never in browser storage or a URL.", where: "widget" },
      { id: "4.5", title: "Rotation and logout", text: "Rotating your identity credential invalidates every session that used the old one immediately. Logging out revokes the session on our server, and old sessions are cleaned up automatically.", where: "workspace-service" },
      { id: "4.6", title: "Email codes for guests", text: "A visitor can also verify by email with a short one-time code, rate-limited to prevent abuse. Verifying only unlocks that one conversation, and only for a limited time.", where: "workspace-service" },
      { id: "4.7", title: "Every request is re-checked", text: "Every authenticated read and write independently re-checks who's asking, what workspace it's scoped to, and whether that access is still valid — nothing is trusted just because it was valid a moment ago.", where: "workspace-service" },
    ],
  },
  {
    id: "ai", n: "05", title: "The AI's leash", color: "#1aa37a",
    kicker: "What the AI can and can't do, enforced by the backend, not by asking nicely.",
    intro: "The model proposes; the backend decides. Tools, identity, limits and money all live outside the model, where a clever message can't talk its way past them.",
    stats: ["Bounded work", "Backend-controlled tools", "Independent review"],
    controls: [
      { id: "5.1", title: "One reply, one owner", text: "Before an AI reply is saved, the system independently confirms the conversation is still AI-owned and the question being answered is still the latest one. The AI can't talk over your team or answer something that's already moved on.", where: "workspace-service" },
      { id: "5.2", title: "Bounded work", text: "Every AI turn has a hard ceiling on how much it can do. A stuck or looping run is cut off automatically, never left running.", where: "ai-core" },
      { id: "5.3", title: "The backend chooses the tools", text: "Which tools the AI can use is decided entirely by your workspace's own setup and the customer's verification — the model can't grant itself a tool, declare data public, or reach into another workspace.", where: "ai-core" },
      { id: "5.4", title: "Account tools need a verified customer", text: "Payment lookups and connected systems only become available once the customer has proved who they are, and only ever act on the identity already on file — never on whatever the model is told.", where: "workspace-service" },
      { id: "5.5", title: "Messages are data, not instructions", text: "Customer messages, documents and tool results reach the model clearly labeled as untrusted information. Instructions hidden inside them are not followed.", where: "ai-core" },
      { id: "5.6", title: "A second opinion", text: "A separate, independent check reviews each draft reply against the evidence the AI actually gathered. An unsupported claim is sent back for a rewrite, and one that still fails gets handed to a person.", where: "ai-core" },
      { id: "5.7", title: "Money moves behind gates", text: "AI refunds are off until a workspace owner turns them on, and even then are limited and capped automatically. A retried refund can never be issued twice, and cancelling a subscription never cuts off time you've already paid for.", where: "workspace-service" },
      { id: "5.8", title: "An audit trail for every run", text: "Every AI run keeps a record of what it did and what it used to do it. Anything that touches money is also logged as a note your team can see.", where: "workspace-service" },
    ],
  },
  {
    id: "private-data", n: "06", title: "Private data", color: "#d9508a",
    kicker: "What the model actually sees.",
    intro: "Before any request reaches an AI model, identifying details are replaced with safe placeholders. Try it below with your own text.",
    stats: ["Details replaced first", "Secrets removed entirely", "Same rules, every provider"],
    demo: "redaction",
    controls: [
      { id: "6.1", title: "Real details never reach the model", text: "Names, emails, phone numbers, addresses and order or payment details are never sent to the AI model as-is. We swap them for safe placeholders first, and only restore the real value afterward, on our own servers — never inside anything the model sees.", where: "ai-core + workspace-service" },
      { id: "6.2", title: "Secrets are removed, not just hidden", text: "Passwords, API keys, tokens and one-time codes are stripped out entirely before anything reaches a model — not disguised, just gone.", where: "ai-core" },
      { id: "6.3", title: "Sensitive links are cleaned", text: "Links carrying access tokens or other sensitive parameters are cleaned before a model ever reads them.", where: "ai-core" },
      { id: "6.4", title: "Payment facts, not payment records", text: "Payment tools only ever return safe summaries — status and dates — never raw card or account details, and failure reasons are simplified rather than passed through as free text.", where: "workspace-service" },
      { id: "6.5", title: "The same rules for every model", text: "The same protection runs no matter which AI provider answers, including when we fall back to another one. Your conversations and documents are never used to train general-purpose models.", where: "ai-core" },
    ],
  },
  {
    id: "integrations", n: "07", title: "Integrations & outbound requests", color: "#3784ff",
    kicker: "When Elpino has to reach out to a URL you gave us.",
    intro: "Crawling your site, reading a page, or calling a connected system all mean fetching a URL a person typed in. Each of those requests is locked down so it can't be turned against our own network — or yours.",
    stats: ["Encrypted at rest", "Can't reach private networks", "Limited & time-boxed"],
    controls: [
      { id: "7.1", title: "Credentials are encrypted at rest", text: "Any key or token you connect — Stripe, Razorpay, Trello and the like — is encrypted before it's ever stored. A database copy alone can't recover them.", where: "workspace-service" },
      { id: "7.2", title: "Outbound requests can't be aimed inward", text: "When we fetch a URL on your behalf — crawling your site, calling a connected system — we make sure it can't be redirected at a private network or internal infrastructure instead, including ours.", where: "workspace-service" },
      { id: "7.3", title: "Redirects are checked every step", text: "We follow redirects carefully, checking each hop rather than trusting the final destination, and only ever over standard, secure connections.", where: "workspace-service" },
      { id: "7.4", title: "Connected systems are limited", text: "Connections to your own tools are capped in size and time, so they can't be used to pull unbounded data or hang indefinitely.", where: "workspace-service" },
      { id: "7.5", title: "Admins approve every tool", text: "Connected tools are off until an admin approves them. A tool that can change data is flagged separately, and still needs a verified customer even when the server itself is otherwise public.", where: "workspace-service + ai-core" },
      { id: "7.6", title: "Disconnect means gone", text: "When you disconnect an integration, its stored tokens and credentials are wiped immediately.", where: "workspace-service" },
    ],
  },
  {
    id: "secure-links", n: "08", title: "Secure handovers", color: "#ffd84d", ink: true,
    kicker: "When a customer has to send something sensitive.",
    intro: "Never paste a key into a chat. A teammate can ask for it through a one-time link instead, and the chat only ever holds the link.",
    stats: ["Unguessable link", "Expires automatically", "Separately encrypted"],
    controls: [
      { id: "8.1", title: "The chat never holds the secret", text: "The notice in the conversation names what was asked for and carries a link — never the value itself.", where: "workspace-service" },
      { id: "8.2", title: "An unguessable, short-lived link", text: "The link itself is the customer's entire proof of authorization, so it's made unguessable, and it expires automatically before it can become a standing risk.", where: "workspace-service" },
      { id: "8.3", title: "Encrypted with its own key", text: "Whatever's submitted is sealed using a key kept entirely separate from the one that protects your other credentials, so either can be rotated — or, worst case, exposed — without touching the other.", where: "workspace-service" },
      { id: "8.4", title: "Capped and swept", text: "Submissions are size-limited, and anything expired is automatically and permanently wiped on a regular schedule, leaving only a record that something happened — never what it was.", where: "workspace-service" },
    ],
  },
  {
    id: "money", n: "09", title: "Money & billing", color: "#7060bd",
    kicker: "Payments, renewals and the limits tied to them.",
    intro: "Anything that moves money is verified twice: once that the message really came from the payment provider, and once that it can't be applied twice.",
    stats: ["Verified signatures only", "Replay-safe", "Can't double-charge"],
    controls: [
      { id: "9.1", title: "Signed webhooks and checkouts", text: "Payment notifications are only accepted with a valid, verified signature from the provider — anything else, including a near-miss, is rejected outright.", where: "workspace-service" },
      { id: "9.2", title: "Replays can't reset usage", text: "A payment notification that arrives more than once — replayed, or simply delivered twice — can never re-zero already-spent usage or re-grant credit.", where: "workspace-service" },
      { id: "9.3", title: "Auto-recharge can't double-charge", text: "Checking that a recharge is within its limit and actually reserving it happen as one atomic step, and your balance is only ever credited once a payment is confirmed and captured.", where: "workspace-service" },
      { id: "9.4", title: "Every money movement is on record", text: "Every payment event from the provider is written to an audit trail, and any payment action the AI takes gets its own separate log.", where: "workspace-service" },
      { id: "9.5", title: "Plan limits are enforced on the server", text: "Plan-gated features are checked in the backend, not just hidden in the interface, and seat limits are counted from real membership — not from what the browser claims.", where: "workspace-service + auth-service" },
    ],
  },
  {
    id: "lifecycle", n: "10", title: "Data lifecycle", color: "#1aa37a",
    kicker: "Where data lives, how long, and how it goes away.",
    intro: "Your data is scoped to your workspace, expires when it should, and can be removed by you.",
    stats: ["Workspace-scoped", "Cleaned up automatically", "You can delete it"],
    controls: [
      { id: "10.1", title: "Scoped to your workspace", text: "Conversations, knowledge, customers and settings all belong to a workspace, and every lookup is scoped to it — nothing crosses over by accident.", where: "workspace-service" },
      { id: "10.2", title: "Team-only stays team-only", text: "Notes marked team-only are filtered out before a conversation is ever shown to the visitor's widget.", where: "workspace-service" },
      { id: "10.3", title: "Short-lived things expire", text: "Verification codes, session credentials and secure-link content are all automatically expired and cleaned up — nothing short-lived is kept around indefinitely.", where: "all services" },
      { id: "10.4", title: "Delete your workspace", text: "Deleting a workspace cancels its subscription immediately and removes its records, with a firm outer limit set in the privacy policy for full removal.", where: "workspace-service" },
      { id: "10.5", title: "Leave or delete your account", text: "People can leave a workspace, and an account can be deleted entirely from Settings.", where: "auth-service" },
    ],
  },
  {
    id: "infrastructure", n: "11", title: "Infrastructure", color: "#fc7b33",
    kicker: "How the services themselves are run.",
    intro: "Plain, unglamorous hygiene that keeps an internal service from becoming a public one.",
    stats: ["Not publicly reachable", "Minimal footprint", "Monitored"],
    controls: [
      { id: "11.1", title: "Internal services aren't publicly reachable", text: "Our backend services and database aren't exposed to the public internet at all — only a single, hardened entry point is.", where: "infrastructure" },
      { id: "11.2", title: "Lean production builds", text: "What actually runs in production carries nothing extra — no development tools, no unused dependencies.", where: "infrastructure" },
      { id: "11.3", title: "Limits, health checks and log rotation", text: "Every service runs with resource limits, automatic health checks and a restart policy, and logs are rotated so they can't grow unbounded.", where: "infrastructure" },
      { id: "11.4", title: "Secrets stay out of source", text: "Keys and secrets are never checked into our codebase — they're supplied to each service separately, and sensitive credential files are mounted read-only.", where: "infrastructure" },
      { id: "11.5", title: "Repeatable deploys", text: "Every deployment goes through the same automated checks, so a release is never a one-off manual process.", where: "infrastructure" },
    ],
  },
  {
    id: "verification", n: "12", title: "How we check our own work", color: "#d9508a",
    kicker: "The tests that try to break the rules above.",
    intro: "Security claims are only worth what tests back them. These are covered by automated tests in our own codebase.",
    stats: ["Forged-credential tests", "Replay tests", "Isolation tests"],
    controls: [
      { id: "12.1", title: "Identity regressions", text: "Automated tests cover forged credentials, expired and replayed sessions, logout, credential rotation, and that one workspace can never see another's data.", where: "workspace-service tests" },
      { id: "12.2", title: "Outbound request tests", text: "The checks that stop outbound requests from reaching internal networks have their own dedicated tests.", where: "workspace-service tests" },
      { id: "12.3", title: "Privacy filter tests", text: "The system that replaces private details before they reach a model, and the payment-facts rules that limit what it can be shown, are both directly tested.", where: "ai-core + workspace-service tests" },
      { id: "12.4", title: "Billing correctness tests", text: "Renewal replays and signature verification are covered by tests, so a billing fix can't quietly reopen a hole that was already closed.", where: "workspace-service tests" },
    ],
  },
];

// A conceptual map of where a request goes, not a diagram of our internal
// services — deliberately one box for "Elpino" rather than the actual
// service breakdown, so this stays a trust illustration, not a blueprint
// someone could build against.
export type Node = {
  id: string; label: string; sub: string; x: number; y: number; w: number; h: number; color: string; ink?: boolean; chapter?: string; guards: string;
};

export const NODES: Node[] = [
  { id: "widget", label: "Visitor", sub: "Chat widget", x: 10, y: 60, w: 160, h: 90, color: "#fc7b33", chapter: "visitors", guards: "Guests stay guests. Logged-in visitors prove themselves with a signed credential or an email code, held only in the widget's own memory." },
  { id: "team", label: "Your team", sub: "Dashboard", x: 10, y: 330, w: 160, h: 90, color: "#3784ff", chapter: "accounts", guards: "Passwords are never stored in readable form, Google sign-in is verified on our server, and you can end any session remotely." },
  { id: "elpino", label: "Elpino", sub: "Verifies, protects, answers", x: 330, y: 165, w: 300, h: 170, color: "#7060bd", guards: "Every request is checked before anything runs, private details are swapped out before an AI model ever sees them, and the AI operates inside limits it can't talk its way past." },
  { id: "google", label: "Google", sub: "Sign-in", x: 800, y: 60, w: 170, h: 80, color: "#ffffff", ink: true, chapter: "accounts", guards: "Only trusted after our own server independently verifies it." },
  { id: "pay", label: "Payments", sub: "Razorpay · Stripe", x: 800, y: 220, w: 170, h: 80, color: "#ffffff", ink: true, chapter: "money", guards: "Payment notifications are only accepted with a verified signature, and can never be replayed to reset your usage." },
  { id: "models", label: "AI providers", sub: "Models", x: 800, y: 380, w: 170, h: 80, color: "#ffffff", ink: true, chapter: "private-data", guards: "They see safe placeholders instead of real details, never secrets, and your data doesn't train general models." },
];

// Lines between nodes: [from, to].
export const LINKS: [string, string][] = [
  ["widget", "elpino"], ["team", "elpino"], ["elpino", "google"], ["elpino", "pay"], ["elpino", "models"],
];
