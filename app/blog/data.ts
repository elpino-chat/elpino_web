export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  content: string;
  category: string;
  readTime: string;
  authorName: string;
  authorRole: string;
  authorAvatar: string;
};

type PostSeed = Omit<BlogPost, "readTime">;

const WORDS_PER_MINUTE = 220;

export function computeReadTime(content: string) {
  const words = content.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / WORDS_PER_MINUTE))} min read`;
}

const seeds: PostSeed[] = [
  {
    slug: "why-we-built-elpino",
    title: "Why we built Elpino",
    excerpt:
      "Most support questions are the same twenty questions. The hard part is the few that need a real answer from a real system, and knowing when a person should step in.",
    date: "2026-10-01",
    content:
      "Most support questions are the same twenty questions. The hard part is the few that need a real answer from a real system, and knowing when a person should step in.\n\nWe built Elpino after watching small teams drown in exactly that mix. A founder answers \"do you ship to Canada?\" for the fortieth time, then misses the customer whose payment went through but whose account never upgraded. The repeated questions eat the hours, and the important ones get the leftovers.\n\n## Chatbots answered the easy half\n\nThe first wave of support chatbots solved the easy half. They could recite a help article. But the questions that actually cost money sound like this: \"I paid, why am I still on the free plan?\", \"Where is my order?\", \"Can you cancel it, I picked the wrong size?\" A bot that only knows your help pages can't answer any of those. It either guesses, which is worse than silence, or it says \"let me connect you\", and now a person has to start the conversation from scratch.\n\n## What Elpino does differently\n\nElpino answers from the knowledge you approve: your website, your help pages, files you upload and pages you write. When it isn't there, it says so instead of making something up.\n\nFor the questions that need facts, it checks the real system. With Stripe or Razorpay connected it looks up the actual payment. With Shopify or WooCommerce connected it finds the actual order, its status and its tracking. Before it shares anything personal, the customer has to prove who they are, with a one-time email code or a signed token from your own app. Typing \"I'm Alex\" in a chat box is never enough.\n\nAnd when a person is needed, it doesn't just apologise. Every teammate gets a Join alert, the first to tap Join takes the chat, and they see the whole conversation and everything the AI already checked. If nobody joins in about 90 seconds, the customer is told, and a ticket is filed with an email follow-up so nothing is lost.\n\n## Priced so growing doesn't punish you\n\nWe also didn't want a tool that gets more expensive every time you hire. Every plan, including Free, has unlimited seats. The AI runs on a monthly credit on paid plans, so a quick question costs less than a long back-and-forth, and handing a chat to your team never costs anything extra. Free includes 100 AI messages a month with no card.\n\n## Who it's for\n\nElpino is for small and growing teams: founders who answer their own support, online stores, and SaaS companies whose inbox has outgrown one person. If your customers ask the same questions every day, and occasionally ask one that needs a real lookup, that's the job we built it for.\n\nYou can try it on your own site in a few minutes. Add your website, let Elpino read it, paste the widget snippet, and ask it the question your customers ask most.",
    category: "Company",
    authorName: "Elpino team",
    authorRole: "Elpino",
    authorAvatar: "EL",
  },
  {
    slug: "intercom-alternatives-small-teams",
    title: "Intercom alternatives for small teams in 2026",
    excerpt:
      "Intercom is a strong product, but per-seat pricing plus a per-outcome AI fee adds up fast for a small team. Here's how to choose an alternative, and what to check before you switch.",
    date: "2026-09-29",
    content:
      "Intercom is a strong product, but per-seat pricing plus a per-outcome AI fee adds up fast for a small team. Here's how to choose an alternative, and what to check before you switch.\n\n## Why small teams look elsewhere\n\nIntercom, which now brands itself Fin, charges for each teammate who logs in, and bills its AI agent per resolved outcome on top, starting from US$0.99 each. For a large support organisation that model can make sense. For a team of three to ten people it means every new hire raises the bill, and a busy month for the AI raises it again. The other common reason is scope: many small teams use a fraction of the platform and pay for all of it.\n\n## What to look for in an alternative\n\n**Pricing you can predict.** Look at how the tool charges for people and for AI separately. Per-seat pricing punishes hiring. Per-resolution pricing makes your bill depend on traffic you don't control. A fixed monthly AI allowance is easier to budget.\n\n**AI that answers from your content, and admits when it can't.** Ask every vendor what happens when the answer isn't in your knowledge base. The right answer is \"it says so and offers a person\", not \"it does its best\".\n\n**Real lookups, not just articles.** The questions that matter are about a specific payment, order or subscription. Check whether the AI can read Stripe, Razorpay, Shopify or WooCommerce, and whether it verifies the customer before it does.\n\n**A handoff that keeps the context.** When a person takes over, they should see the full conversation and what the AI already checked, not a blank thread.\n\n**Setup measured in minutes.** If onboarding needs a call with a solutions engineer, it's built for a bigger team than yours.\n\n## Where Elpino fits\n\nElpino is deliberately narrower than Intercom. It focuses on website chat with an AI agent, a shared team inbox, a knowledge base and integrations with payments, stores, HubSpot and ticket tools. It doesn't do in-app product tours or banners.\n\nWhat you get in exchange is a simpler bill. Every plan has unlimited seats, Free included. Paid plans are Starter at US$12 a month, Growth at US$59 and Scale at US$299, each with a monthly AI credit ($7, $40 and $240), and handing a chat to your team is always free. Free includes 100 AI messages a month without a card.\n\n## Questions to ask before you switch\n\nCan I import or recreate my help content quickly? Elpino can crawl your site from one link, up to 50 pages, or pull from your sitemap. Will my team's workflow change? Conversations land in one inbox with a clear owner. What happens to my data? Elpino swaps names and emails for reference codes before the AI reads a conversation, and stores connected credentials encrypted.\n\nFor a line-by-line comparison of features and pricing, see our Elpino vs Intercom page. If you're also weighing Zendesk, Crisp or Tidio, we compare those too.",
    category: "Guides",
    authorName: "Elpino team",
    authorRole: "Elpino",
    authorAvatar: "EL",
  },
  {
    slug: "ai-chatbot-for-shopify-store",
    title: "How to add an AI chatbot to your Shopify store",
    excerpt:
      "\"Where is my order?\" is the most common question an online store gets. Here's how to let AI answer it with the real order, safely, in about ten minutes.",
    date: "2026-09-24",
    content:
      "\"Where is my order?\" is the most common question an online store gets. Here's how to let AI answer it with the real order, safely, in about ten minutes.\n\n## Why a normal chatbot isn't enough for a store\n\nMost chatbots can answer \"what's your return policy?\" because the answer is on a page. They can't answer \"where's my order?\" because the answer lives in Shopify, and it's different for every customer. So the question still lands on a person, every time, all day.\n\nAn AI agent that can read your store changes that. It finds the customer's order, tells them its status and tracking, and, if you allow it, fixes the small things too.\n\n## Step 1: Teach it your store's policies\n\nCreate a free Elpino account and add your store's website. Elpino can start from your homepage and follow links through up to 50 pages, with help and policy pages first, so your shipping, returns and FAQ pages are covered. Pages built with JavaScript are rendered in a real browser before they're read. You can also upload PDFs or Word files, or write a page for anything that isn't on the site.\n\n## Step 2: Connect Shopify\n\nIn the Connect section of your dashboard, add your store address (your-store.myshopify.com) and an access token. Elpino checks them against Shopify before saving, and stores them encrypted. No code is needed. WooCommerce works the same way with your site address, consumer key and consumer secret, or in one click through the Elpino WordPress plugin.\n\n## Step 3: Decide what the AI may do\n\nLooking up orders is the safe part, and it only works for a verified customer: they confirm their email with a one-time code, or your site passes a signed token for a logged-in shopper. Elpino never shows one customer another customer's order.\n\nActions are off until you switch them on. With order actions enabled, the AI can cancel an order that hasn't shipped yet, or correct its shipping address, and nothing else. Each action uses a short-lived reference rather than the raw order, and your team sees a note of everything the AI did.\n\n## Step 4: Add the widget\n\nPaste one snippet into your theme, or use the WordPress plugin for WooCommerce stores. The widget takes your logo and colours, and replies in your customer's language.\n\n## What it looks like for your customer\n\nA shopper types \"Can you cancel my order #4821? I ordered the wrong size.\" Elpino confirms it's them, reads the order from your store, sees it hasn't shipped, cancels it, and tells them. Your team gets a note. Nobody had to open the Shopify admin.\n\nWhen the question is something the AI can't or shouldn't handle, like a damaged item or a refund outside your policy, it brings your team in with the full conversation attached.\n\n## What it costs\n\nElpino's Free plan includes 100 AI messages a month with unlimited seats and no card. Paid plans start at US$12 a month with a monthly AI credit, and handing a chat to a person never costs extra.",
    category: "Guides",
    authorName: "Elpino team",
    authorRole: "Elpino",
    authorAvatar: "EL",
  },
  {
    slug: "ai-support-wordpress-woocommerce",
    title: "Set up AI customer support on WordPress and WooCommerce",
    excerpt:
      "With the Elpino plugin, a WordPress site gets an AI chat widget in one click, and a WooCommerce store gets order lookups without copying API keys.",
    date: "2026-09-18",
    content:
      "With the Elpino plugin, a WordPress site gets an AI chat widget in one click, and a WooCommerce store gets order lookups without copying API keys.\n\n## Install the plugin\n\nUpload the Elpino Chat plugin to your WordPress site and activate it. You'll find Elpino in the admin sidebar. Choose Connect to Elpino, sign in or create a free account, and you're returned to WordPress with the widget live on every page. There's nothing to paste into your theme.\n\n## Teach it what your site knows\n\nIn your Elpino dashboard, the knowledge base is where the AI learns. The quickest start is to give it your site's address: Elpino follows links through up to 50 pages, help and policy pages first. You can also pull pages from your sitemap, upload PDF, Word, text and Markdown files, or write pages for things that aren't published anywhere. Each source has a visibility switch, so internal notes stay internal.\n\nThe AI answers only from what you approved. If the answer isn't there, it says so and offers a person rather than guessing.\n\n## Connect WooCommerce (optional)\n\nIf you run WooCommerce, choose Connect WooCommerce in the plugin and approve one screen. That's it: no consumer keys to copy. From then on the AI can look up order status and tracking for customers who are signed in to your store.\n\nTwo safety rules are built in. Customers can only see orders that belong to their own account, and guest orders aren't exposed through account lookup. Order actions, like cancelling an unshipped order or fixing an address, stay off until the workspace owner turns them on.\n\n## Let the AI know who's signed in\n\nThe plugin can pass a signed identity for logged-in WordPress users, using a server-side secret. That lets the AI treat a signed-in shopper as verified without asking for an email code. Visitors who aren't signed in can still verify with a one-time code sent to their email.\n\n## Make it yours\n\nIn Elpino's settings you choose the AI's name, avatar and persona, the greeting visitors see before they start chatting, and the widget's colours. You can let the AI see which page a visitor is on so it can answer in context, and choose whether it replies in the customer's language or a fixed one.\n\n## When a person is needed\n\nYour team works from one shared inbox. When a customer asks for a person, or the AI can't help, every teammate gets a Join alert and the first to join takes the chat. If nobody joins in about 90 seconds, the customer is told and a ticket is created with an email follow-up.\n\nThe Free plan includes 100 AI messages a month and unlimited seats, with no card required.",
    category: "Guides",
    authorName: "Elpino team",
    authorRole: "Elpino",
    authorAvatar: "EL",
  },
  {
    slug: "paid-but-plan-not-active",
    title: "\"I paid, but my plan isn't active\": answering payment questions with AI",
    excerpt:
      "Payment questions are where a guessing chatbot does real damage. Here's how Elpino answers them from Stripe and Razorpay, and what it will and won't do on its own.",
    date: "2026-09-12",
    content:
      "Payment questions are where a guessing chatbot does real damage. Here's how Elpino answers them from Stripe and Razorpay, and what it will and won't do on its own.\n\n## The question every SaaS gets\n\n\"I paid for the Growth plan but my account still says Free.\" It's urgent for the customer, it's easy for a person to check, and it's dangerous for a bot that can't. A generic chatbot will either apologise and promise someone will look into it, or worse, reassure the customer that the payment \"should appear soon\" without knowing whether it went through at all.\n\n## Facts first\n\nWith Stripe or Razorpay connected, Elpino looks the payment up instead of guessing. It checks whether the payment was captured, for how much, and what plan or subscription it belongs to. The answer it gives is the fact it found: the payment went through, it failed, or there's no payment from this customer.\n\nBefore any of that, the customer proves who they are, with a one-time code sent to their email or a signed token from your app. The AI never looks up payments for someone who has only typed a name into the chat.\n\n## What it can do about it\n\nLooking things up is only half the job. Depending on what it finds, Elpino can:\n\n- create a fresh, secure payment link when a payment needs another try,\n- find and send the receipt for a specific payment,\n- check a subscription's status, and cancel it when the customer asks.\n\nRefunds are different. They're off by default, and only the workspace owner can turn them on. Even with refunds off, the AI can look up the payment and offer to connect the customer with your team, who see everything it found.\n\n## The read-only key\n\nFor Stripe we recommend a restricted key with read access to customers and payments. Elpino tests every key against the provider before saving it, and stores it encrypted. Money only moves if you allow it.\n\n## What the AI actually reads\n\nEven during a lookup, the model doesn't see your customer's name or email. Elpino swaps personal details for reference codes before the AI reads anything, and swaps them back only for the customer's own reply. Card numbers and secrets are stripped out entirely.\n\n## A check before the customer sees it\n\nEvery draft reply is checked against the tool results before it's sent, so the AI can't claim a payment succeeded when the lookup said otherwise.\n\nThe result is the kind of answer a careful teammate would give, in seconds: \"Found it: your payment from this morning went through, and Growth is now active.\" And when the answer is \"this needs a person\", the person starts with the facts already in front of them.",
    category: "Product",
    authorName: "Elpino team",
    authorRole: "Elpino",
    authorAvatar: "EL",
  },
  {
    slug: "when-ai-should-hand-off-to-a-human",
    title: "When should an AI support agent hand off to a human?",
    excerpt:
      "The best AI agent isn't the one that never hands off. It's the one that hands off at the right moment, with everything the person needs.",
    date: "2026-09-05",
    content:
      "The best AI agent isn't the one that never hands off. It's the one that hands off at the right moment, with everything the person needs.\n\n## Containment is the wrong goal\n\nA lot of AI support tools are judged by how many conversations they \"contain\", meaning how many never reach a person. That number is easy to push up: make the bot reluctant to escalate. Customers notice. They end up arguing with a machine about a refund it can't give, and leave angrier than if they'd waited for a person.\n\nThe goal is resolution, and sometimes the fastest resolution is a person.\n\n## When the AI should step aside\n\n**When the answer isn't in your knowledge.** If the AI can't find it in what you approved, it should say so plainly, not improvise. Elpino is built to admit it doesn't know and offer a person.\n\n**When the customer asks for a person.** No arguing, no \"are you sure?\" loops.\n\n**When an action needs judgement or permission.** Refunds, exceptions to policy, anything involving money that the owner hasn't explicitly allowed the AI to do.\n\n**When the customer is upset.** Frustration is a signal that the next message should come from someone who can make a decision.\n\n**When identity can't be confirmed.** If a customer can't verify who they are, the AI shouldn't share account details, but a person may be able to help another way.\n\n## What a good handoff looks like\n\nA handoff fails when the person starts from zero. In Elpino, the teammate who joins sees the whole conversation, the customer's location, device and the page they were on, their earlier conversations, and what the AI already checked, like the payment it looked up or the order it found.\n\nThe mechanics matter too. When a handoff happens, every teammate gets a Join alert. The first to tap Join takes the chat, and the alert clears for everyone else, so two people never answer the same customer. The AI stops answering the moment a person takes over.\n\n## When nobody is free\n\nSmall teams can't watch the inbox all day. If nobody joins within about 90 seconds, Elpino tells the customer, creates a ticket automatically, and follows up by email. If you use Trello or Asana, the ticket can become a card or task with a summary and a link to the chat. Customers who verified their email and left can still get your reply by email.\n\n## Handoffs shouldn't cost you\n\nOn Elpino, handing a conversation to your team is free on every plan. On paid plans the AI only spends credit while it's answering, and stops the moment a person takes over. You should never be charged for the AI deciding, correctly, that it needed help.",
    category: "Guides",
    authorName: "Elpino team",
    authorRole: "Elpino",
    authorAvatar: "EL",
  },
  {
    slug: "keeping-customer-data-away-from-ai",
    title: "How Elpino keeps customer data away from the AI model",
    excerpt:
      "An AI agent can look up a customer's order without the model ever reading their name, email or card number. Here's how that works.",
    date: "2026-08-28",
    content:
      "An AI agent can look up a customer's order without the model ever reading their name, email or card number. Here's how that works.\n\n## The problem\n\nTo help with an account question, an AI support agent has to work with personal data: a name, an email, an order number, a payment. The simple approach is to paste all of it into the prompt. That means every detail of every customer conversation is sent to a language model provider, whether or not the answer needed it.\n\n## Reference codes instead of details\n\nElpino swaps personal details for reference codes before the AI reads a conversation. The customer's name becomes something like ref_name_..., their email becomes ref_email_..., and so on. The AI can still reason about them (\"this customer's order\", \"send the receipt to this email\"), and it can pass a reference back to a tool, but it never reads the real value.\n\nThe swap happens twice, once in the service that holds the conversation and again before the model call, so a mistake in one place is caught in the other.\n\n## Field by field for tool results\n\nResults from your connected systems are handled one field at a time. An order status, a date or an amount is sent as it is, because the AI needs it to answer. Names, emails, addresses and ids become references. Some values, like a customer's own order or tracking number, are shown to the customer in the reply but stay a reference for the model.\n\nFor tools you connect yourself over MCP, anything Elpino hasn't been told about is masked by default, so a new field in your system can't reach the model by accident.\n\n## Some things are never kept at all\n\nCard numbers, Aadhaar numbers, PAN and IBAN numbers are removed outright, not swapped for a reference, and only when their checksums say they're real, so ordinary numbers aren't mangled. Passwords, tokens, OTPs and API keys are stripped too. Links that carry tokens, emails or order ids are removed.\n\n## Sensitive details don't belong in chat\n\nWhen you need something sensitive from a customer, Elpino can send a one-time private form instead of asking in the chat, so the detail never sits in the conversation history.\n\n## Identity before anything personal\n\nNone of this matters if the AI talks to the wrong person. Before it shares account details, the customer confirms their email with a one-time code, or your site passes a signed token for a logged-in user. A name typed into the chat is never treated as proof.\n\n## And the rest\n\nConnected credentials, like your Stripe or Shopify keys, are stored encrypted, and verified with the provider before they're saved. The AI's drafts are checked against tool results before the customer sees them.\n\nPrivacy here isn't a setting you have to find. It's how every conversation runs, on every plan, Free included.",
    category: "Product",
    authorName: "Elpino team",
    authorRole: "Elpino",
    authorAvatar: "EL",
  },
  {
    slug: "ai-customer-support-pricing",
    title: "AI customer support pricing: per seat, per resolution, or credit?",
    excerpt:
      "Three pricing models dominate AI support tools, and each one changes your bill in a different way as you grow. Here's how to compare them honestly.",
    date: "2026-08-21",
    content:
      "Three pricing models dominate AI support tools, and each one changes your bill in a different way as you grow. Here's how to compare them honestly.\n\n## Per seat\n\nYou pay for every teammate who logs in. It's the oldest model in help desk software, and it's simple to understand. The catch is that it charges you for growth: every hire, every part-timer who covers weekends, every founder who wants to read the inbox, adds a line to the bill. Teams on per-seat plans often share logins or keep people out of the tool to save money, which defeats the purpose of a shared inbox.\n\n## Per resolution or per outcome\n\nYou pay each time the AI resolves a conversation. It sounds fair, because you only pay when it works. But your bill now depends on your traffic, which you don't control. A launch, an outage or a shipping delay can multiply it in a week. You also need to trust the vendor's definition of \"resolved\". Many tools combine this with per-seat pricing, so you pay both ways.\n\n## Monthly credit\n\nYou pay a fixed monthly price that includes an AI allowance. The AI spends it as it works, and a short question costs less than a long back-and-forth. When the allowance runs out you either top up or the AI hands new conversations to your team. Your maximum spend is known in advance.\n\n## How Elpino prices\n\nElpino uses the credit model and leaves seats out of the bill entirely. Every plan has unlimited seats, Free included, and adding a teammate never changes your price or your AI allowance.\n\n- **Free:** $0, with 100 AI messages a month.\n- **Starter:** $12 a month, with $7 of AI credit.\n- **Growth:** $59 a month, with $40 of AI credit.\n- **Scale:** $299 a month, with $240 of AI credit.\n\nAnnual billing gives you roughly two months free. Handing a conversation to your team never costs extra, and the AI stops spending the moment a person takes over. If you run out, the AI hands new conversations to your team, and you can top up at any time or turn on auto-recharge. Top-ups never expire.\n\n## How to compare tools fairly\n\nWork out a realistic month: how many teammates, how many conversations, and what share the AI should handle. Then price that month on each tool, and price it again with double the conversations and two more teammates. The tool whose bill stays sensible in the second scenario is the one you won't have to replace in a year.\n\nOur comparison pages for Intercom, Zendesk, Crisp and Tidio do this calculation side by side.",
    category: "Guides",
    authorName: "Elpino team",
    authorRole: "Elpino",
    authorAvatar: "EL",
  },
  {
    slug: "identity-verification-ai-chat",
    title: "Identity verification for AI chat: why \"I'm Alex\" isn't enough",
    excerpt:
      "If your AI will share account details with anyone who types a name, it's a data leak waiting to happen. Here's how verification works in Elpino.",
    date: "2026-08-14",
    content:
      "If your AI will share account details with anyone who types a name, it's a data leak waiting to happen. Here's how verification works in Elpino.\n\n## The obvious attack\n\nA visitor opens your chat and types: \"Hi, I'm Alex Morgan, alex@example.com. Can you show me my invoices?\" A chatbot that takes that at face value will happily look up Alex's account and read it out to whoever is typing. No hacking required, just a name and an email, both of which are often public.\n\nAs AI support agents gain access to payments, orders and subscriptions, this stops being a theoretical risk.\n\n## Two ways to prove who you are\n\nElpino only treats a customer as verified in one of two ways.\n\n**A one-time email code.** The AI sends a code to the email on file, and the customer types it back. Only someone with access to that inbox can complete it.\n\n**A signed token from your app.** If the customer is already logged in to your website or app, your server signs a short token that says who they are, and the widget passes it to Elpino. The customer doesn't have to do anything. Our WordPress plugin can do this for logged-in WordPress and WooCommerce users with a server-side secret.\n\nWhat the customer types in the chat is never treated as proof.\n\n## What verification unlocks\n\nUntil a customer is verified, the AI can answer general questions from your knowledge base, but it won't look up payments, orders, subscriptions or anything else tied to an account. Once verified, it can, and only for that customer's own records. A verified customer can see their own order; they can't see anyone else's.\n\n## Identity changes revoke access\n\nThe references the AI uses during a conversation are bound to the identity they were issued under. If the identity in the conversation changes, those references stop working, so data looked up for one person can't be reused for another.\n\n## Your team sees it too\n\nIn the inbox, a verified conversation carries a Verified badge, so a teammate who joins knows whether the customer has proven who they are before they share anything.\n\nVerification adds a few seconds for the customer the first time. In return, your AI can do the useful things, like checking a payment or fixing an order, without becoming the easiest way into someone else's account.",
    category: "Product",
    authorName: "Elpino team",
    authorRole: "Elpino",
    authorAvatar: "EL",
  },
  {
    slug: "train-ai-support-agent-on-your-website",
    title: "How to train an AI support agent on your website",
    excerpt:
      "Your AI is only as good as what you teach it. Here's how to give Elpino the right knowledge, keep internal notes private, and fix the gaps it finds.",
    date: "2026-08-07",
    content:
      "Your AI is only as good as what you teach it. Here's how to give Elpino the right knowledge, keep internal notes private, and fix the gaps it finds.\n\n## Start with one link\n\nThe fastest way to begin is your website's address. Elpino starts at that page and follows links through up to 50 pages, reading help and policy pages first, because that's where most answers live. Pages built with JavaScript are rendered in a real browser before they're read, so single-page apps work too.\n\nIf you'd rather choose, point it at a single page, or pull up to 20 pages from your sitemap in one go.\n\n## Add what isn't on your site\n\nA lot of support knowledge lives in documents and people's heads. Upload PDF, Word, text and Markdown files, and Elpino extracts the text. For anything that isn't written down anywhere, like how you handle exceptions or which plan suits which customer, write a page in the editor.\n\n## Keep internal notes internal\n\nEach knowledge source has a visibility switch. Internal notes can help your team without ever being quoted to a customer.\n\n## How the AI uses it\n\nWhen a customer asks something, Elpino finds the closest passages in what you taught it and answers from those, in the customer's language. If nothing relevant is there, it says it doesn't know and offers a person, instead of filling the gap with something plausible.\n\nThat's the behaviour you want, but it means gaps show up as handoffs. Treat them as your to-do list.\n\n## Fix the gaps\n\nRead the conversations the AI handed over because it couldn't answer confidently. Most fall into a few patterns: a policy that's only in someone's head, a page that's out of date, a product that changed. Write or update a page for each one. The next customer with that question gets an answer.\n\n## Give it context\n\nTwo settings make answers noticeably better. Let the AI see which page the visitor is on, so \"how much is this?\" on your pricing page gets the right answer. And give it a persona: a name, an avatar and a short description of how your brand talks.\n\n## Keep it fresh\n\nRe-crawl after you change your site, and remove pages that no longer apply. Old answers are worse than no answers.\n\nYou can do all of this on the Free plan, which includes 100 AI messages a month and unlimited seats, so you can test the AI on your own site before your customers see it.",
    category: "Guides",
    authorName: "Elpino team",
    authorRole: "Elpino",
    authorAvatar: "EL",
  },
];

export const posts: BlogPost[] = seeds.map((post) => ({ ...post, readTime: computeReadTime(post.content) }));

const STOP_WORDS = new Set([
  "the", "and", "are", "for", "with", "your", "you", "our", "that", "this", "how", "why", "what", "when", "from", "into", "over", "without", "their", "they", "its", "has", "have", "will", "can", "not", "but", "all", "any", "out", "who", "whom", "was", "were", "been", "being", "does", "did", "than", "then", "them", "there", "here", "where", "which", "while", "because", "about", "after", "before", "between", "through", "during", "above", "below", "each", "few", "more", "most", "other", "some", "such", "only", "own", "same", "too", "very", "just", "also", "get", "got", "one", "two", "per", "via", "use", "used", "using", "new",
]);

function keywords(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));
}

export function relatedPosts(post: BlogPost, pool: BlogPost[] = posts, count = 2): BlogPost[] {
  const reading = new Set(keywords(`${post.title} ${post.excerpt} ${post.category} ${post.content}`));
  return pool
    .filter((p) => p.slug !== post.slug)
    .map((p) => {
      let score = 0;
      for (const w of new Set(keywords(`${p.title} ${p.excerpt} ${p.category} ${p.content}`))) {
        if (reading.has(w)) score++;
      }
      if (p.category === post.category) score += 2;
      return { post: p, score };
    })
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date))
    .slice(0, count)
    .map((r) => r.post);
}

export function findPost(slug: string) {
  return posts.find((post) => post.slug === slug);
}
