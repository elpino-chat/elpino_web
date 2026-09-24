import type { FaqCategory } from "./faq-client";

// Split out of page.tsx so the content is easy to find and update on its
// own — the page itself just wires this into the schema and the client.
export const categories: FaqCategory[] = [
  {
    name: "Getting started",
    items: [
      {
        q: "What do I need to get started?",
        a: "An email and about five minutes. Sign up, add your website as a site, paste a few articles or crawl your site into the knowledge base, and drop the embed snippet on your page. The widget is answering within minutes.",
      },
      {
        q: "How does the Free plan work?",
        a: "It's a real plan, not a countdown — 50 AI conversations a month and 2 seats, no credit card. Upgrade when your volume outgrows it, not on a deadline.",
      },
      {
        q: "Do I need a support team already?",
        a: "No. Solo founders run Free with just themselves as the one seat; the AI handles what it can and there's simply no one to escalate to until you invite a teammate.",
      },
      {
        q: "Can I customize what the AI sounds like?",
        a: "Yes — its name, avatar, and persona are set per workspace in Settings, and the greeting shown before a visitor starts chatting is fully customizable.",
      },
      {
        q: "Which language does it reply in?",
        a: "You choose. By default it matches the language the customer writes in, or you can fix a reply language in Settings. The greeting shown before a visitor starts chatting is your own text.",
      },
      {
        q: "Is website chat the only channel?",
        a: "Website chat is live today. Omnichannel is coming in November.",
      },
    ],
  },
  {
    name: "The AI & escalation",
    items: [
      {
        q: "How does the AI decide what to answer?",
        a: "It searches your knowledge base first. If it finds a relevant article, it answers and cites what it used. If it doesn't, it says so and escalates rather than guessing.",
      },
      {
        q: "What happens when it can't help?",
        a: "It says so and asks the customer first: “Would you like me to connect you with our team?” On a yes, every teammate gets a Join alert at the same moment, and the first to tap takes the chat with the reason, a summary and the whole thread. If nobody joins within 90 seconds, the customer is told, a ticket is filed automatically, and they get an email with a reference.",
      },
      {
        q: "Can I see what the AI actually did?",
        a: "Yes. Every run is logged — which articles it searched, what it found, what it replied — so if a customer disputes an answer, the record is right there instead of a guess about what the bot might have said.",
      },
      {
        q: "Can I mark a conversation resolved myself?",
        a: "Yes, from the Inbox. And it's reversible by design: if the customer writes back, the thread reopens on its own rather than staying marked closed.",
      },
      {
        q: "What's a \"secure request\"?",
        a: "A way to ask a customer for something too sensitive for chat — a password, a server detail. They get a single-use encrypted link; your team gets one look, then it's destroyed on the server for good.",
      },
      {
        q: "How does the AI know who it's talking to?",
        a: "It checks. A visitor can confirm with a one-time email code, or your own login system can vouch for them with a short-lived signed token, and they get a Verified badge. Names and emails are also replaced with reference codes before the AI model reads a conversation.",
      },
    ],
  },
  {
    name: "Integrations",
    items: [
      {
        q: "What does Elpino connect to?",
        a: "Stripe, Razorpay, Cashfree and Paystack for payments, Trello and Asana for tickets, and your own MCP servers for anything else. With Stripe or Razorpay connected, the AI can look up payments and subscriptions, send receipts and payment links, and cancel a subscription when asked. Refunds are off unless you turn them on.",
      },
      {
        q: "Is there a Shopify, Slack or HubSpot connector?",
        a: "Not as one-click connectors today. If your system has an MCP server, you can connect it and choose exactly which tools the AI may use. If there's a tool you'd like next, tell us on the contact page.",
      },
      {
        q: "What is MCP, and how many servers can I connect?",
        a: "The Model Context Protocol is a standard way for an AI to call tools on another system. You can connect up to five MCP servers and enable up to 15 tools on each. The AI only sees the tools you switch on, every call is checked again on the server, and tools that change data always need a verified customer.",
      },
      {
        q: "Can I disconnect something later?",
        a: "Anytime, from Settings → Integrations. Disconnecting deletes the stored, encrypted credentials for that provider immediately.",
      },
    ],
  },
  {
    name: "Billing & plans",
    items: [
      {
        q: "What do the plans cost?",
        a: "Free is $0. Monthly plans are Starter at $12 with $7 of AI credit each month, Growth at $59 with $40, and Scale at $299 with $240. Annual billing is two months free — you pay for ten months and get twelve: Starter is $120 a year ($10/month), Growth is $590 ($49.17/month), and Scale is $2,990 ($249.17/month).",
      },
      {
        q: "How does the AI allowance work?",
        a: "Free includes 50 AI conversations a month. A conversation the AI handles is counted once, however many messages it takes. Paid plans work differently: they include a monthly AI credit that the AI spends as it works, so a quick question uses less than a long back-and-forth. Starter's $7 covers about 140 typical conversations, Growth's $40 about 800, and Scale's $240 about 4,800 — an estimate, since real usage depends on conversation length.",
      },
      {
        q: "Do escalations cost anything?",
        a: "No extra charge. On Free, a conversation the AI hands off to a human doesn't count toward your 50. On paid plans, the handoff itself is free, and the AI stops spending credit the moment a person takes over.",
      },
      {
        q: "Can the AI issue refunds?",
        a: "Only if the workspace owner turns refunds on. They're off by default. Even with refunds off, the AI can look up the payment and offer to connect the customer with your team.",
      },
      {
        q: "What happens when I use up my AI allowance?",
        a: "The AI hands new conversations straight to your team instead of answering. On a paid plan you can top up credit at any time, or turn on automatic recharge so it never stops. Top-ups never expire. Your monthly credit resets each billing period.",
      },
      {
        q: "How much does an extra teammate cost?",
        a: "Extra seats come in packs on every plan including Free: 3 seats for $2 a month, or 5 for $3. Seats and AI credit are billed completely separately — adding a teammate never touches your AI allowance.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes, from Settings → Billing, no lock-in. Cancellation takes effect at the end of the current billing period, so you keep what you paid for until then.",
      },
      {
        q: "What happens if I stop paying?",
        a: "The workspace drops to the Free plan at the end of the period. Your knowledge base, conversation history, and settings all stay intact.",
      },
    ],
  },
  {
    name: "Data & security",
    items: [
      {
        q: "Is my data used to train AI models?",
        a: "No. Your knowledge base and conversations are used to run the product for your workspace, not to train models.",
      },
      {
        q: "How are my integration credentials stored?",
        a: "Encrypted at rest (AES-256-GCM) and only ever decrypted server-side to make the specific API call you authorized — never returned to the browser in plaintext.",
      },
      {
        q: "What about information a customer sends through a secure request?",
        a: "Encrypted the moment it's submitted, and the stored copy is destroyed the instant your team opens it — a second attempt to view it fails, by design, not by permission.",
      },
      {
        q: "Can I get my data removed?",
        a: "Yes — reach out through the contact page and we'll remove or export what you're asking for.",
      },
      {
        q: "Where can I read the details?",
        a: "The Privacy Policy covers data handling and the Security Policy covers vulnerability reporting — both linked in the footer.",
      },
    ],
  },
];
