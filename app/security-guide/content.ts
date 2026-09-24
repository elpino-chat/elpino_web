// Content for the security guide. Every statement here was checked against the
// codebase (file names in the "where" tags are real components). If a control
// isn't implemented, it isn't listed: no certifications we don't hold, and no
// features that are only a stored setting.

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
    intro: "Sign-up, sign-in and every session after it. Passwords are never kept, codes are short-lived, and a session can be ended from the server.",
    stats: ["scrypt · 64-byte key", "10-minute codes", "5 attempts", "7-day sessions"],
    controls: [
      { id: "1.1", title: "Passwords are hashed, never stored", text: "Hashed with scrypt (64-byte key) and a fresh random 16-byte salt for each password. Comparison is constant-time, so timing can't leak how close a guess was.", where: "auth-service" },
      { id: "1.2", title: "Email verification codes", text: "New accounts prove their address with a 6-digit code from a cryptographically secure generator. Only a SHA-256 hash, bound to the email, is stored. A code lasts 10 minutes and allows 5 wrong attempts, and asking for a new one voids the old.", where: "auth-service" },
      { id: "1.3", title: "Google sign-in is checked on the server", text: "The Google popup runs in the browser, but the server verifies the Firebase ID token itself. It requires the Google provider and a verified email, and signs you in by email, so Google never creates a second, unlinked account for the same address.", where: "auth-service" },
      { id: "1.4", title: "Signed session tokens", text: "Sessions are HS256-signed tokens with the algorithm pinned, so a forged or algorithm-swapped token is rejected. Signatures are compared in constant time and tokens expire after 7 days.", where: "web" },
      { id: "1.5", title: "A locked-down session cookie", text: "The session cookie is httpOnly (page scripts can't read it), SameSite=Lax, and Secure in production.", where: "web" },
      { id: "1.6", title: "Sign out everywhere", text: "Each session carries a version number. Signing out raises it, so older tokens stop working. The check is cached for at most 30 seconds, and if it can't be made the request is refused rather than allowed.", where: "web + auth-service" },
      { id: "1.7", title: "Safe redirects", text: "After sign-in, the return address must be a path on our own site. Absolute URLs, double-slash and backslash tricks fall back to the dashboard.", where: "web" },
      { id: "1.8", title: "Team invitations", text: "Invitation links carry 192 bits of randomness and expire after 7 days. An expired invite no longer holds a seat, and the owner decides whether members are allowed to invite at all.", where: "auth-service" },
    ],
  },
  {
    id: "front-door", n: "02", title: "The front door", color: "#ffd84d", ink: true,
    kicker: "What the website does before a request goes any further.",
    intro: "The web app is the first thing a browser touches. It hardens the browser, limits abuse, and validates input before anything is passed on.",
    stats: ["No framing", "Shared rate limits", "Fail closed"],
    controls: [
      { id: "2.1", title: "Browser hardening headers", text: "Every page except the chat widget is sent with X-Frame-Options: DENY (no clickjacking), nosniff, a strict referrer policy, and camera, microphone and geolocation switched off. The widget is the one deliberate exception, because it has to live inside an iframe on your site.", where: "web" },
      { id: "2.2", title: "One rate limiter for every instance", text: "Public forms (contact, careers, newsletter) go through a limiter shared by every web instance: five contact messages per ten minutes per address, for example.", where: "web + gateway" },
      { id: "2.3", title: "It fails closed", text: "If the rate limiter can't be reached, the request is refused with a 503 rather than waved through.", where: "web" },
      { id: "2.4", title: "Validated, length-capped input", text: "Form bodies are checked on the server before anything is sent onward: required fields, a real email format, and hard limits (a message can be at most 10,000 characters).", where: "web" },
    ],
  },
  {
    id: "gateway", n: "03", title: "The gateway", color: "#7060bd",
    kicker: "One door for the backend, closed by default.",
    intro: "Every call to the backend goes through a single gateway. The rule is simple: if a route isn't explicitly public, it needs the internal secret.",
    stats: ["Closed by default", "Explicit public list", "Signed realtime tokens"],
    controls: [
      { id: "3.1", title: "Closed by default", text: "Every route requires an internal service secret unless it is marked public. If the secret isn't configured, the gateway refuses everything instead of failing open.", where: "gateway" },
      { id: "3.2", title: "A short, explicit public list", text: "Only callers that can't hold a secret are public: the chat widget, page analytics, the payment webhook and one-time secure links. Each one is marked route by route.", where: "gateway" },
      { id: "3.3", title: "Explicit origins only", text: "The API answers browsers only from an allowlist of origins, not from anywhere.", where: "gateway" },
      { id: "3.4", title: "Signed realtime tokens", text: "Live-view connections present an HMAC-SHA256 signed token scoped to one workspace, with an expiry. Anything else is dropped.", where: "gateway" },
      { id: "3.5", title: "Internal pushes are guarded too", text: "The endpoints services use to push live notifications to dashboards require the same secret, so nobody outside can ring a teammate's screen.", where: "gateway" },
    ],
  },
  {
    id: "visitors", n: "04", title: "Visitors & identity", color: "#fc7b33",
    kicker: "Telling a logged-in customer from someone who just typed an email.",
    intro: "A name, an email or an order number is not proof of who someone is. Account help unlocks only after a signed identity token or a one-time email code.",
    stats: ["5-minute assertions", "30-min idle · 8-h cap", "12-hour email verification"],
    controls: [
      { id: "4.1", title: "Guests stay guests", text: "A typed name, email, phone or payment reference never counts as proof. Guests can chat and leave contact details, but that unlocks no private tools and is never merged into anyone else's history.", where: "workspace-service" },
      { id: "4.2", title: "Signed identity from your own site", text: "For logged-in users, your server signs a short token (HS256) with a secret only you and Elpino hold: a stable account ID, an audience, a unique ID and a lifetime of at most five minutes. Emails and phones count only when flagged verified.", where: "widget" },
      { id: "4.3", title: "One exchange, one session", text: "Each token is exchanged once for a fresh random widget session. Only a SHA-256 hash of the session credential is stored, and the identity it proved is stored encrypted.", where: "workspace-service" },
      { id: "4.4", title: "Short-lived sessions", text: "A session ends after 30 minutes idle or 8 hours after sign-in, whichever comes first. The credential lives in widget memory, never in browser storage or URLs.", where: "widget" },
      { id: "4.5", title: "Rotation and logout", text: "Rotating your identity secret invalidates every session signed with the old one straight away. Logging out revokes the session on the server, and a sweeper deletes dead sessions.", where: "workspace-service" },
      { id: "4.6", title: "Email codes for guests", text: "A visitor can verify by email: a 6-digit code, hashed at rest, valid for 10 minutes, 5 attempts. At most 3 codes go out per conversation and 5 per address each hour. Success verifies that conversation for 12 hours.", where: "workspace-service" },
      { id: "4.7", title: "Every request is re-checked", text: "Each authenticated read and write re-checks the workspace, site, account, expiry and revocation. Payment and connected-system tools re-check the session too.", where: "workspace-service" },
    ],
  },
  {
    id: "ai", n: "05", title: "The AI's leash", color: "#1aa37a",
    kicker: "What the AI can and can't do, enforced by the backend, not by asking nicely.",
    intro: "The model proposes; the backend decides. Tools, identity, limits and money all live outside the model, where a clever message can't talk its way past them.",
    stats: ["8 rounds", "16 tool calls", "~2 minutes", "2nd-model review"],
    controls: [
      { id: "5.1", title: "One reply, one owner", text: "Before an AI reply is saved, the database confirms in a locked transaction that the conversation is still AI-owned, the run's lease is valid, and the customer's latest message is the one being answered. The AI can't talk over your team or answer a stale question.", where: "workspace-service" },
      { id: "5.2", title: "Bounded work", text: "Each AI turn is capped at 8 tool rounds, 16 tool calls and about two minutes. A stuck or looping run is cut off, not left running.", where: "ai-core" },
      { id: "5.3", title: "The backend chooses the tools", text: "Which tools the AI can use is decided from the workspace's setup and the customer's verification. The model can't grant itself a tool, declare data public or pick another workspace.", where: "ai-core" },
      { id: "5.4", title: "Account tools need a verified customer", text: "Payment lookups and connected systems appear only once the customer has proved who they are. The email searched is read from the customer record, never from what the model asks for.", where: "workspace-service" },
      { id: "5.5", title: "Messages are data, not instructions", text: "Customer messages, documents and tool results reach the model labeled as untrusted data. Instructions hidden inside them are not followed.", where: "ai-core" },
      { id: "5.6", title: "A second opinion", text: "A separate review step checks each draft against the evidence the AI gathered. Unsupported claims are sent back for a rewrite, and a draft that still fails escalates.", where: "ai-core" },
      { id: "5.7", title: "Money moves behind gates", text: "AI refunds are off until an owner switches them on, then limited by amount, payment age and one per conversation, all enforced on the server. Stripe refunds carry an idempotency key, so a retry can't refund twice. Cancelling a subscription only takes effect at the end of the paid period.", where: "workspace-service" },
      { id: "5.8", title: "An audit trail for every run", text: "Each AI run records which model answered, every tool it used and what it cost. Actions that touch money are logged as a team-only note in the conversation as well.", where: "workspace-service" },
    ],
  },
  {
    id: "private-data", n: "06", title: "Private data", color: "#d9508a",
    kicker: "What the model actually sees.",
    intro: "Before any model request, identifying details are swapped for random references. Try it below with your own text.",
    stats: ["128-bit references", "Secrets removed", "Same rules, every provider"],
    demo: "redaction",
    controls: [
      { id: "6.1", title: "Opaque references, not real details", text: "Names, emails, phone numbers, addresses, order and payment IDs become random references (128 bits) before any model request. The mapping stays on our servers and is restored only inside backend tool arguments, never in a prompt.", where: "ai-core + workspace-service" },
      { id: "6.2", title: "Secrets are discarded, not aliased", text: "API keys, bearer tokens, JWTs, passwords, one-time codes and CVVs are removed outright, so nothing can be mapped back to them.", where: "ai-core" },
      { id: "6.3", title: "Sensitive links are cleaned", text: "Links carrying tokens, emails, session or payment parameters are stripped before a model reads them.", where: "ai-core" },
      { id: "6.4", title: "Payment facts, not payment records", text: "Payment tools return status, dates and computed timelines with temporary references that expire. Raw payment details stay local, and free-text failure reasons are classified on our side into a few categories rather than sent to a model.", where: "workspace-service" },
      { id: "6.5", title: "The same rules for every model", text: "The same protection runs whichever AI provider answers, including a fallback when one is unavailable. Your conversations and documents don't train general models.", where: "ai-core" },
    ],
  },
  {
    id: "integrations", n: "07", title: "Integrations & outbound requests", color: "#3784ff",
    kicker: "When Elpino has to reach out to a URL you gave us.",
    intro: "Crawling your site, reading a page, or calling a connected system all mean fetching a URL a person typed in. Each of those fetches is locked down so it can't be turned against our own network.",
    stats: ["AES-256-GCM", "Address pinning", "1 MB · 15 s limits"],
    controls: [
      { id: "7.1", title: "Credentials are encrypted at rest", text: "Stripe, Razorpay and Trello keys and OAuth tokens are encrypted with AES-256-GCM, a fresh random 12-byte IV per record and an authentication tag. The key is derived (scrypt) from a secret that lives only in the service's environment, so a database dump alone can't recover them.", where: "workspace-service" },
      { id: "7.2", title: "The crawler can't be aimed inward", text: "Crawl URLs come from a workspace admin, so every fetch is resolved once and checked against private and special-use ranges (IPv4 and IPv6, including cloud metadata and IPv4-mapped tricks). The socket is pinned to the checked address, so DNS can't change between the check and the connection.", where: "workspace-service" },
      { id: "7.3", title: "Redirects are checked hop by hop", text: "Redirects are followed by hand so every hop is checked too. Only http and https are allowed, URLs with a username or password are refused, and in production only the standard ports work.", where: "workspace-service" },
      { id: "7.4", title: "Connected systems (MCP) under limits", text: "MCP connections use the same address checks, cap responses at 1 MB and time out after 15 seconds. A customer can set at most 10 custom headers, and none can replace the transport's own headers.", where: "workspace-service" },
      { id: "7.5", title: "Admins approve every tool", text: "Connected tools are off until an admin approves them. A tool that can change data is flagged, and needs a verified customer even when the server is otherwise public.", where: "workspace-service + ai-core" },
      { id: "7.6", title: "Disconnect means gone", text: "When you disconnect an integration, its stored tokens and credentials are wiped immediately.", where: "workspace-service" },
    ],
  },
  {
    id: "secure-links", n: "08", title: "Secure handovers", color: "#ffd84d", ink: true,
    kicker: "When a customer has to send something sensitive.",
    intro: "Never paste a key into a chat. A teammate can ask for it through a one-time link instead, and the chat only ever holds the link.",
    stats: ["32-byte token", "24-hour link", "Separate key", "Hourly wipe"],
    controls: [
      { id: "8.1", title: "The chat never holds the secret", text: "The notice in the conversation names what was asked for and carries a link, never a value.", where: "workspace-service" },
      { id: "8.2", title: "An unguessable, short-lived link", text: "The link token is 32 random bytes and is the customer's whole authorization, so it has to be. It expires after 24 hours, and a forwarded link doesn't stay a standing risk.", where: "workspace-service" },
      { id: "8.3", title: "Encrypted with its own key", text: "Submitted secrets are sealed with AES-256-GCM using a separate key from the one that protects your integration credentials, so one can be rotated, or leak, without touching the other.", where: "workspace-service" },
      { id: "8.4", title: "Capped and swept", text: "A submission is limited to 64 KB, so the endpoint can't be used as free storage. An hourly sweep, and one at every start-up, wipes expired ciphertext. The record survives as an audit row that holds no secret.", where: "workspace-service" },
    ],
  },
  {
    id: "money", n: "09", title: "Money & billing", color: "#7060bd",
    kicker: "Payments, renewals and the limits tied to them.",
    intro: "Anything that moves money is verified twice: once that the message really came from the payment provider, and once that it can't be applied twice.",
    stats: ["HMAC-SHA256", "Replay-safe", "Atomic recharge"],
    controls: [
      { id: "9.1", title: "Signed webhooks and checkouts", text: "Razorpay webhooks and checkout confirmations are accepted only with a valid HMAC-SHA256 signature, compared in constant time. A length mismatch is itself a rejection.", where: "workspace-service" },
      { id: "9.2", title: "Replays can't reset usage", text: "Renewal events are de-duplicated by the billing period they describe, so a replayed or overlapping delivery can't re-zero already-spent usage or re-grant credit.", where: "workspace-service" },
      { id: "9.3", title: "Auto-recharge is atomic", text: "The check that a recharge is within its cap and the reservation happen in one locked transaction, and only a confirmed, captured payment credits your balance.", where: "workspace-service" },
      { id: "9.4", title: "Every money movement is on record", text: "Money movements from the payment provider are written to an audit table from the webhook, and AI-initiated payment actions get their own log.", where: "workspace-service" },
      { id: "9.5", title: "Plan limits are enforced on the server", text: "Plan-gated features are checked in the backend, not just hidden in the interface, and seat limits are counted from real membership and pending invitations.", where: "workspace-service + auth-service" },
    ],
  },
  {
    id: "lifecycle", n: "10", title: "Data lifecycle", color: "#1aa37a",
    kicker: "Where data lives, how long, and how it goes away.",
    intro: "Your data is scoped to your workspace, expires when it should, and can be removed by you.",
    stats: ["Workspace-scoped", "Scheduled sweeps", "You can delete it"],
    controls: [
      { id: "10.1", title: "Scoped to your workspace", text: "Conversations, knowledge, customers and settings belong to a workspace, and every lookup is scoped to it.", where: "workspace-service" },
      { id: "10.2", title: "Team-only stays team-only", text: "Notes marked team-only are filtered out before a conversation is sent to the visitor's widget.", where: "workspace-service" },
      { id: "10.3", title: "Short-lived things expire", text: "Email verification codes are consumed or expired, widget sessions are deleted a day after they end, and secure-link ciphertext is wiped once it expires.", where: "all services" },
      { id: "10.4", title: "Delete your workspace", text: "Deleting a workspace cancels its subscription immediately and removes its records. The privacy policy sets a 30-day outer limit for full removal.", where: "workspace-service" },
      { id: "10.5", title: "Leave or delete your account", text: "People can leave a workspace, and an account can be deleted from Settings.", where: "auth-service" },
    ],
  },
  {
    id: "infrastructure", n: "11", title: "Infrastructure", color: "#fc7b33",
    kicker: "How the services themselves are run.",
    intro: "Plain, unglamorous hygiene that keeps an internal service from becoming a public one.",
    stats: ["Loopback-only ports", "Prod-only images", "Health-checked"],
    controls: [
      { id: "11.1", title: "Services listen on loopback only", text: "The gateway, auth, workspace and AI services and the database publish ports on 127.0.0.1 only. The reverse proxy is the only public entry point.", where: "docker-compose" },
      { id: "11.2", title: "Lean production images", text: "Images are built in stages and the runtime layer carries production dependencies only, with database migrations applied on start.", where: "Dockerfiles" },
      { id: "11.3", title: "Caps, health checks and logs", text: "Each container has CPU and memory limits, a health check and a restart policy, and logs are rotated so they can't fill the disk.", where: "docker-compose" },
      { id: "11.4", title: "Secrets stay out of source", text: "Keys and secrets come from per-service environment files kept out of the repository, with templates for the variable names. The Firebase service account is mounted read-only.", where: "repo + deploy" },
      { id: "11.5", title: "Repeatable deploys", text: "Deployment goes through a script and continuous-integration checks, so a release is the same steps every time.", where: "repo" },
    ],
  },
  {
    id: "verification", n: "12", title: "How we check our own work", color: "#d9508a",
    kicker: "The tests that try to break the rules above.",
    intro: "Security claims are only worth what tests back them. These are covered by automated tests in the repository.",
    stats: ["Forged tokens", "Replay", "Isolation"],
    controls: [
      { id: "12.1", title: "Identity regressions", text: "Tests cover forged tokens, missing account IDs, channel-ownership flags, expiry, replay, logout, secret rotation, workspace and site isolation, and session lifetimes.", where: "workspace-service tests" },
      { id: "12.2", title: "Outbound request tests", text: "The crawler's address checks and blocked-URL rules have their own tests.", where: "workspace-service tests" },
      { id: "12.3", title: "Privacy filter tests", text: "The redaction and reference-mapping code is tested, along with the payment-facts contract that limits what a model can be shown.", where: "ai-core + workspace-service tests" },
      { id: "12.4", title: "Billing correctness tests", text: "Renewal replays, period roll-over and signature checks are covered, so a billing fix can't quietly re-open a hole.", where: "workspace-service tests" },
    ],
  },
];

// The architecture diagram. Coordinates are on a 1000 x 560 canvas.
export type Node = {
  id: string; label: string; sub: string; x: number; y: number; w: number; h: number; color: string; ink?: boolean; chapter: string; guards: string;
};

export const NODES: Node[] = [
  { id: "widget", label: "Visitor", sub: "Chat widget", x: 10, y: 40, w: 140, h: 76, color: "#fc7b33", chapter: "visitors", guards: "Guests stay guests. Logged-in visitors prove themselves with a signed token or an email code, and the credential never leaves widget memory." },
  { id: "team", label: "Your team", sub: "Dashboard", x: 10, y: 250, w: 140, h: 76, color: "#3784ff", chapter: "accounts", guards: "Passwords hashed with scrypt, Google verified on the server, and signed httpOnly sessions you can revoke from anywhere." },
  { id: "web", label: "Web app", sub: "Next.js", x: 200, y: 130, w: 140, h: 96, color: "#ffd84d", ink: true, chapter: "front-door", guards: "Browser hardening headers, a shared rate limiter that fails closed, and validated, length-capped input." },
  { id: "gateway", label: "Gateway", sub: "One door", x: 390, y: 130, w: 140, h: 96, color: "#7060bd", chapter: "gateway", guards: "Closed by default: every route needs the internal secret unless it is explicitly public. Explicit origins only." },
  { id: "auth", label: "Auth service", sub: "Accounts", x: 590, y: 130, w: 140, h: 96, color: "#3784ff", chapter: "accounts", guards: "Accounts, verification codes, invitations and Google sign-in verification." },
  { id: "workspace", label: "Workspace", sub: "Conversations · billing", x: 770, y: 130, w: 140, h: 96, color: "#1aa37a", chapter: "lifecycle", guards: "Everything scoped to a workspace: conversations, knowledge, billing, secure links, identity sessions and audit trails." },
  { id: "ai", label: "AI core", sub: "The agent", x: 950, y: 130, w: 150, h: 96, color: "#d9508a", chapter: "ai", guards: "Runs the model loop under the leash: bounded rounds, backend-chosen tools, a second-model review and the privacy filter before every request." },
  { id: "google", label: "Google", sub: "Firebase sign-in", x: 590, y: 300, w: 140, h: 62, color: "#ffffff", ink: true, chapter: "accounts", guards: "Only the ID token is trusted, and only after the server verifies it." },
  { id: "pay", label: "Payments", sub: "Razorpay · Stripe", x: 770, y: 300, w: 140, h: 62, color: "#ffffff", ink: true, chapter: "money", guards: "Webhooks are accepted only with a valid HMAC-SHA256 signature, and replays can't reset usage." },
  { id: "models", label: "AI providers", sub: "Models", x: 950, y: 300, w: 150, h: 62, color: "#ffffff", ink: true, chapter: "private-data", guards: "They see references instead of real details, never secrets, and your data doesn't train general models." },
];

// Lines between nodes: [from, to]. The database is drawn as a plate under the services, not as a node.
export const LINKS: [string, string][] = [
  ["widget", "web"], ["team", "web"], ["web", "gateway"], ["gateway", "auth"], ["gateway", "workspace"],
  ["workspace", "ai"], ["auth", "google"], ["workspace", "pay"], ["ai", "models"],
];

export const SPECS: [string, string][] = [
  ["Passwords", "scrypt, 64-byte key, unique random 16-byte salt"],
  ["Email verification codes", "6 digits, SHA-256 hashed with the email, 10-minute expiry, 5 attempts"],
  ["Web sessions", "HS256 signed, algorithm pinned, 7 days, httpOnly + SameSite=Lax + Secure (production), revocable"],
  ["Widget identity assertions", "HS256, at most 5 minutes, exchanged once for a random session"],
  ["Widget sessions", "30 minutes idle, 8 hours absolute, credential stored only as a SHA-256 hash"],
  ["Visitor email verification", "10-minute codes, 5 attempts, 3 per conversation and 5 per address per hour, verified for 12 hours"],
  ["Credentials at rest", "AES-256-GCM, random 12-byte IV, authentication tag, scrypt-derived key held only by the service"],
  ["Secure-link secrets", "AES-256-GCM under a separate key, 32-byte tokens, 24 hours, 64 KB maximum"],
  ["Payment webhooks", "HMAC-SHA256, constant-time comparison, replay-safe renewals"],
  ["Realtime connections", "HMAC-SHA256 signed, workspace-scoped, expiring tokens"],
  ["Outbound fetches", "Resolved once, private and special ranges blocked, socket pinned, redirects checked, http(s) only"],
  ["Connected-system calls", "1 MB response cap, 15-second timeout, at most 10 custom headers"],
  ["AI turn limits", "8 tool rounds, 16 tool calls, about two minutes"],
  ["AI model training", "None. Providers are used under commercial API terms"],
  ["Data deletion", "Tokens wiped on disconnect, workspace records removed on deletion (30-day outer limit in the privacy policy)"],
];
