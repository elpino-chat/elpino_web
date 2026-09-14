import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Elpino collects, uses, and protects your data — customer conversations, OAuth tokens, retention, and your rights.",
  alternates: { canonical: `${SITE_URL}/privacy` },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="September 13, 2026"
      intro={
        <p>
          This policy explains what data Elpino collects, why we collect it, how it&apos;s
          protected, and the choices you have. The short version: we only access what you
          explicitly connect, we use it only to run the product for you, we never sell it, and we
          never use it to train AI models.
        </p>
      }
      sections={[
        {
          id: "data-we-collect",
          title: "Data We Collect",
          body: (
            <>
              <ul>
                <li>
                  <strong>Account data</strong> — your email address, name, and login credentials
                  (passwords are stored hashed; OAuth sign-in stores no password at all).
                </li>
                <li>
                  <strong>Customer conversation data</strong> — messages sent through your chat
                  widget or connected inbox, visitor identity fields your customers submit (name,
                  email), and any attachments shared in a conversation.
                </li>
                <li>
                  <strong>Knowledge base & workspace data</strong> — help center articles,
                  macros/canned replies, and other content you upload so the AI can answer
                  accurately on your behalf.
                </li>
                <li>
                  <strong>Connected-service data</strong> — when you link Google, Slack, Stripe,
                  Razorpay, or another connector, we access the data those connections authorize
                  (for example, your Google account identity for sign-in, or payment status from
                  Stripe/Razorpay).
                </li>
                <li>
                  <strong>Derived and usage data</strong> — product events, AI reply history,
                  handoff records, resolution outcomes, and AI-usage metering, so plan limits,
                  billing, support, and security monitoring work.
                </li>
                <li>
                  <strong>Payment data</strong> — handled by Razorpay. We never see or store your
                  full card details; we keep only subscription status, plan, and invoice records.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "how-we-use-it",
          title: "How We Use Your Data",
          body: (
            <>
              <p>We use your data solely to operate the Service for you:</p>
              <ul>
                <li>answering your customers instantly using your knowledge base and past conversations;</li>
                <li>handing a conversation off to a human teammate when the AI is uncertain or a customer asks for one;</li>
                <li>drafting suggested replies for your team to review and send;</li>
                <li>routing, tagging, and prioritizing conversations across your inbox;</li>
                <li>notifying you and your team about new or handed-off conversations;</li>
                <li>metering AI usage against your plan and processing billing;</li>
                <li>keeping the Service secure and debugging failures.</li>
              </ul>
              <p>
                <strong>We do not sell your data. We do not use your content to train AI models.</strong>{" "}
                We don&apos;t show ads, run targeted advertising, or use your data to determine
                creditworthiness or for lending.
              </p>
            </>
          ),
        },
        {
          id: "ai-processing",
          title: "AI Processing",
          body: (
            <>
              <p>
                To answer, summarize, and draft replies, relevant snippets of your content (for
                example the message a customer just sent, or the knowledge base article that
                answers it) are sent to third-party large-language-model providers over encrypted
                connections. Each provider processes that content under its own API terms.
              </p>
              <p>
                We route different tasks to different providers for quality and cost; no provider
                receives more than the specific content needed for the task at hand. Your
                customers&apos; email addresses and phone numbers are not included in what the AI
                agent sends to a model. The providers we may use are:
              </p>
              <ul>
                <li>
                  <strong>DeepSeek</strong> — the default model for AI replies. DeepSeek processes and
                  stores data in the People&apos;s Republic of China, and its published privacy policy
                  does not expressly exclude content submitted through its API from being used to
                  improve its models.
                </li>
                <li>
                  <strong>xAI</strong> (United States) — a backup when DeepSeek is unavailable, and the
                  model used for any conversation that has involved private account data such as a
                  payment lookup.
                </li>
                <li>
                  <strong>OpenAI</strong> (United States) — conversation memory, teammate summaries, and
                  translation.
                </li>
                <li>
                  <strong>Nomic</strong> (United States) — search embeddings for your knowledge base and
                  conversation history.
                </li>
              </ul>
              <p>
                Once a conversation has involved private account data, every later AI request for
                that conversation, including memory and summaries, is sent only to the private-data
                provider above, never to DeepSeek. If your organization requires AI processing to
                stay in a particular region, contact{" "}
                <a href="mailto:hello@elpino.chat">hello@elpino.chat</a> before enabling the AI agent.
              </p>
              <p>
                Raw, aggregated, anonymized, and derived data is not used to develop, improve, or
                train generalized AI or ML models. Elpino may use your data only to provide or
                improve the product features visible to you in your own account, such as
                AI-drafted replies, suggested articles, and handoff recommendations.
              </p>
            </>
          ),
        },
        {
          id: "google-user-data",
          title: "Google Sign-In Data",
          body: (
            <>
              <p>
                If you sign in with Google, Elpino&apos;s use of information received from Google
                APIs adheres to the{" "}
                <a
                  href="https://developers.google.com/terms/api-services-user-data-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google API Services User Data Policy
                </a>
                , including the Limited Use requirements.
              </p>
              <ul>
                <li>
                  <strong>Google identity data:</strong> we access your basic Google profile and
                  email address to identify which account completed the OAuth flow and to create
                  and label your account in your dashboard.
                </li>
                <li>
                  Google user data is used only to sign you in and identify your account — never
                  for advertising, never sold, and never transferred to third parties except as
                  necessary to provide the Service with your consent, for security, to comply with
                  law, or as part of a merger or acquisition after required notice or consent.
                </li>
                <li>
                  You can revoke access at any time from the Elpino dashboard or from your{" "}
                  <a
                    href="https://myaccount.google.com/permissions"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Google Account permissions
                  </a>
                  .
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "storage-security",
          title: "Storage & Security",
          body: (
            <>
              <ul>
                <li>OAuth tokens and connector secrets are encrypted at rest with AES-256-GCM.</li>
                <li>All data moves over TLS-encrypted connections.</li>
                <li>
                  Production access is limited to infrastructure and authorized personnel who need
                  it to operate, secure, debug, or support the Service.
                </li>
                <li>
                  Conversation history and AI reply logs are stored in our databases to power your
                  dashboard and let your team pick up any conversation with full context.
                </li>
                <li>
                  Elpino staff do not review customer conversation content unless you ask us to
                  support a specific issue, it is necessary for security or abuse investigation, or
                  we are legally required to do so.
                </li>
              </ul>
              <p>
                No system is perfectly secure. If we learn of a breach affecting your data, we will
                notify you without undue delay.
              </p>
            </>
          ),
        },
        {
          id: "retention-deletion",
          title: "Retention & Deletion",
          body: (
            <>
              <p>
                We keep your data while your account is active. When you disconnect a connector,
                we stop accessing that service immediately and delete its stored credentials. We may
                retain previously created conversations, AI reply logs, and handoff records so your
                dashboard and audit history continue to work unless you delete them or request
                deletion. You can permanently delete your account from Dashboard Settings. The
                deletion flow cancels active billing, disconnects integrations, removes queued
                work and active product data, and invalidates all sessions. We delete or anonymize
                personal data within 30 days, except records we must keep for legal, security,
                fraud-prevention, or accounting reasons (e.g., invoices); retained accounting
                records are detached from your account and pseudonymized.
              </p>
              <p>
                You can also request deletion or an export of your data anytime at{" "}
                <a href="mailto:hello@elpino.chat">hello@elpino.chat</a>.
              </p>
            </>
          ),
        },
        {
          id: "sharing",
          title: "When We Share Data",
          body: (
            <>
              <p>We share data only with:</p>
              <ul>
                <li>
                  <strong>Service providers</strong> that host and power Elpino (cloud
                  infrastructure, AI providers, email delivery, payments) — each bound to process
                  your data only on our instructions;
                </li>
                <li>
                  <strong>Connected services</strong> when you ask Elpino to take an action, such as
                  sending a reply through a connected channel or updating a linked record;
                </li>
                <li>
                  <strong>Authorities</strong>, when required by a valid legal request;
                </li>
                <li>
                  <strong>A successor</strong>, if Elpino is acquired or merged — your data remains
                  protected under this policy and you&apos;ll be notified.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "cookies-analytics",
          title: "Cookies & Analytics",
          body: (
            <>
              <p>
                Elpino sets one essential cookie: the session that keeps you signed in. It&apos;s
                required for the product to work and carries no tracking.
              </p>
              <p>
                If you choose &ldquo;Accept all&rdquo; in the cookie banner, we additionally load
                Google Analytics (aggregate usage and traffic statistics) and Microsoft Clarity
                (interaction analytics such as heatmaps and session recordings) to understand how
                Elpino is used and improve it. Neither loads if you choose &ldquo;Reject
                all&rdquo;, and you can change your mind at any time by clearing this site&apos;s
                data in your browser, which brings the banner back.
              </p>
            </>
          ),
        },
        {
          id: "your-rights",
          title: "Your Rights",
          body: (
            <>
              <p>
                Depending on where you live, you may have the right to access, correct, export,
                restrict, or delete your personal data, and to object to certain processing. You
                can exercise most of these directly from the dashboard (disconnect connectors,
                delete data) or by emailing{" "}
                <a href="mailto:hello@elpino.chat">hello@elpino.chat</a>. We respond to every
                request within 30 days.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to This Policy",
          body: (
            <p>
              We&apos;ll update this policy as the product evolves. Material changes are announced
              by email or in the product at least 14 days before they take effect, and the
              &ldquo;Last updated&rdquo; date above always reflects the current version.
            </p>
          ),
        },
      ]}
    />
  );
}
