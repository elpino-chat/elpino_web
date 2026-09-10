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
        a: "It's a real plan, not a countdown — 50 AI resolutions a month and 2 seats, no credit card. Upgrade when your volume outgrows it, not on a deadline.",
      },
      {
        q: "Do I need a support team already?",
        a: "No. Solo founders run Free with just themselves as the one seat; the AI handles what it can and there's simply no one to escalate to until you invite a teammate.",
      },
      {
        q: "Can I customize what the AI sounds like?",
        a: "Yes — its name, avatar, and persona are set per workspace in Settings, and the greeting shown before a visitor starts chatting is fully customizable.",
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
        a: "It hands the conversation to your team with a written reason — what the customer needs and why it couldn't finish — and rounds-robins it to whoever's online. If nobody's free, it waits in the shared inbox instead of going silent.",
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
    ],
  },
  {
    name: "Integrations",
    items: [
      {
        q: "What does Elpino connect to?",
        a: "Stripe or Razorpay, so the AI can verify a real order before it answers a billing question — read-only, matched to the customer's email. And Trello, so an escalation that needs tracked follow-up becomes a real card.",
      },
      {
        q: "Is that it — just payments and tickets?",
        a: "For now. Elpino is early; the integration list grows from here. If there's a tool you need connected, tell us on the contact page.",
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
        a: "Free is $0. Monthly plans are Starter at $12.50 with 250 resolutions, Growth at $59 with 2,000, and Scale at $299 with 12,000. Annual billing saves 20%: Starter is $10/month ($120 billed annually), Growth is $47.20/month ($566.40 annually), and Scale is $239.20/month ($2,870.40 annually).",
      },
      {
        q: "What's a \"resolution\"?",
        a: "One conversation the AI closed on its own, without escalating — that's the whole meter. A ten-message back-and-forth the AI handles start to finish still counts as one.",
      },
      {
        q: "Do escalations cost anything?",
        a: "No. A conversation the AI hands off to a human is never billed as a resolution — that's the point of the meter existing at all.",
      },
      {
        q: "What happens if I go over my plan's resolutions?",
        a: "Free stops there and the AI hands new conversations straight to a human instead of answering. Paid plans keep answering and bill the extra at a per-resolution rate shown on the pricing page.",
      },
      {
        q: "How much does an extra teammate cost?",
        a: "$1 a month, on every plan including Free. Seats and resolutions are billed completely separately — adding a teammate never touches your AI allowance.",
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
