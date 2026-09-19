import type { Metadata } from "next";
import { LegalPage } from "../components/LegalPage";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Elpino — the simple AI customer support platform with real human backup.",
  alternates: { canonical: `${SITE_URL}/terms` },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="July 3, 2026"
      illustrationSrc="/images/terms-sloth.png"
      intro={
        <p>
          These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of Elpino — the
          website at elpino.chat, the Elpino dashboard, the Elpino chat widget, and any related
          services (together, the &ldquo;Service&rdquo;). By creating an account or using the
          Service, you agree to these Terms. If you don&apos;t agree, please don&apos;t use the
          Service.
        </p>
      }
      sections={[
        {
          id: "the-service",
          title: "The Service",
          body: (
            <>
              <p>
                Elpino is customer support, made simple. Install a chat widget or connect your
                support inbox, and Elpino&apos;s AI answers your customers instantly using your
                knowledge base and past conversations.
              </p>
              <p>
                <strong>Human when it matters.</strong> When the AI can&apos;t confidently resolve
                a conversation, it hands off to a real member of your team instead of guessing.
                You choose how and when that handoff happens, and you can always jump into any
                conversation yourself.
              </p>
            </>
          ),
        },
        {
          id: "accounts",
          title: "Accounts & Eligibility",
          body: (
            <>
              <p>
                You must be at least 18 years old and able to form a binding contract to use the
                Service. You agree to provide accurate account information and to keep it current.
              </p>
              <p>
                You are responsible for safeguarding your account credentials and for all activity
                that occurs under your account, including messages sent by teammates you invite to
                your workspace. Notify us immediately at{" "}
                <a href="mailto:hello@elpino.chat">hello@elpino.chat</a> if you suspect
                unauthorized access.
              </p>
            </>
          ),
        },
        {
          id: "subscriptions",
          title: "Subscriptions & Billing",
          body: (
            <>
              <p>
                New accounts start on the Free plan, which has no time limit and needs no payment
                method. Paid plans add AI resolution allowance, seats, and knowledge base capacity;
                you can move to a paid plan, or back to Free, at any time.
              </p>
              <ul>
                <li>
                  <strong>Billing.</strong> Paid plans are billed in advance on a recurring basis
                  through our payment processor, Razorpay. By subscribing you authorize recurring
                  charges until you cancel.
                </li>
                <li>
                  <strong>Cancellation.</strong> You can cancel anytime from the dashboard.
                  Cancellation takes effect at the end of the current billing period; you keep
                  access until then.
                </li>
                <li>
                  <strong>Refunds.</strong> Except where required by law, payments are
                  non-refundable. If you believe you were charged in error, contact us and
                  we&apos;ll make it right.
                </li>
                <li>
                  <strong>Price changes.</strong> We may change plan pricing with at least 30
                  days&apos; notice; changes apply from your next billing cycle.
                </li>
                <li>
                  <strong>Fair use.</strong> Each plan includes a monthly allowance of AI-resolved
                  conversations. If you exceed it, the Service may reduce or pause AI auto-replies
                  until the next cycle, or route conversations to your team instead.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: "acceptable-use",
          title: "Acceptable Use",
          body: (
            <>
              <p>You agree not to use the Service to:</p>
              <ul>
                <li>violate any law, or infringe anyone&apos;s rights;</li>
                <li>send spam, phishing, or otherwise deceptive or harmful communications;</li>
                <li>
                  probe, disrupt, or gain unauthorized access to the Service or anyone else&apos;s
                  data;
                </li>
                <li>
                  resell, sublicense, or provide the Service to third parties without our written
                  consent;
                </li>
                <li>
                  reverse-engineer the Service or use it to build a directly competing product.
                </li>
              </ul>
              <p>
                We may suspend or terminate accounts that violate these rules, with notice where
                practicable.
              </p>
            </>
          ),
        },
        {
          id: "third-party",
          title: "Third-Party Services & Integrations",
          body: (
            <>
              <p>
                The Service works by connecting to third-party services you authorize (for example
                Google, Slack, Stripe, or Razorpay) and by embedding a chat widget on your own
                website or app. Your use of those services is governed by their own terms and
                privacy policies. You can revoke Elpino&apos;s access at any time from the dashboard
                or from the third party&apos;s own security settings.
              </p>
              <p>
                We are not responsible for the availability or behavior of third-party services,
                and an outage or change on their side may limit what Elpino can do.
              </p>
            </>
          ),
        },
        {
          id: "ai-disclaimer",
          title: "AI Outputs & Human Handoff",
          body: (
            <>
              <p>
                Elpino uses large language models to answer, summarize, and draft replies to your
                customers. <strong>AI outputs can be wrong.</strong> Answers may omit context,
                drafts may contain errors, and the AI may occasionally be confidently incorrect.
                The Service is a support aid — not a substitute for human judgment, and not legal,
                financial, or professional advice.
              </p>
              <p>
                Elpino is designed to hand off to a human teammate when the AI is uncertain or a
                customer asks for one, but no handoff system is perfect. You are responsible for
                reviewing AI-handled conversations and for configuring handoff rules that fit your
                business.
              </p>
            </>
          ),
        },
        {
          id: "your-content",
          title: "Your Content & Our IP",
          body: (
            <>
              <p>
                <strong>Your content stays yours.</strong> You retain all rights to your customer
                conversations, knowledge base articles, and business data the Service processes on
                your behalf. You grant us a limited license to process that content solely to
                operate the Service for you. We do not use your content to train AI models.
              </p>
              <p>
                The Service itself — including its software, design, and branding — is owned by
                Elpino and protected by intellectual-property laws. These Terms don&apos;t grant you
                any rights to it beyond the right to use the Service.
              </p>
            </>
          ),
        },
        {
          id: "privacy",
          title: "Privacy",
          body: (
            <p>
              How we collect, use, and protect your data is described in our{" "}
              <a href="/privacy">Privacy Policy</a>, which forms part of these Terms.
            </p>
          ),
        },
        {
          id: "termination",
          title: "Termination",
          body: (
            <>
              <p>
                You may stop using the Service and delete your account at any time. We may suspend
                or terminate your access if you materially breach these Terms, if required by law,
                or if we discontinue the Service (with reasonable advance notice where possible).
              </p>
              <p>
                On termination, your right to use the Service ends and we will delete or anonymize
                your data as described in the Privacy Policy.
              </p>
            </>
          ),
        },
        {
          id: "disclaimers",
          title: "Disclaimers & Limitation of Liability",
          body: (
            <>
              <p>
                The Service is provided <strong>&ldquo;as is&rdquo;</strong> and{" "}
                <strong>&ldquo;as available&rdquo;</strong>, without warranties of any kind, express
                or implied — including fitness for a particular purpose, non-infringement, and
                uninterrupted or error-free operation.
              </p>
              <p>
                To the maximum extent permitted by law, Elpino will not be liable for indirect,
                incidental, special, consequential, or punitive damages, or for lost profits, data,
                or business opportunities. Our total liability for any claim relating to the
                Service is limited to the amount you paid us in the twelve months before the event
                giving rise to the claim.
              </p>
            </>
          ),
        },
        {
          id: "changes",
          title: "Changes to These Terms",
          body: (
            <p>
              We may update these Terms as the Service evolves. If a change is material, we will
              notify you by email or in the product at least 14 days before it takes effect.
              Continuing to use the Service after a change takes effect means you accept the
              updated Terms.
            </p>
          ),
        },
        {
          id: "governing-law",
          title: "Governing Law & Contact",
          body: (
            <>
              <p>
                These Terms are governed by the laws of India, and any dispute will be subject to
                the exclusive jurisdiction of the courts located in India, unless the law of your
                place of residence requires otherwise.
              </p>
              <p>
                Contact: <a href="mailto:hello@elpino.chat">hello@elpino.chat</a>
              </p>
            </>
          ),
        },
      ]}
    />
  );
}
