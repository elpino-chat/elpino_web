import type { Metadata } from "next";
import Link from "next/link";
import { CodeBlock, ServerSnippetTabs } from "@/app/components/identity/CodeBlock";
import { IDENTITY_ERRORS, PAGE_SNIPPET, SPA_SNIPPET } from "@/lib/identity-snippets";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Identity Verification",
  description: "Verify the identity of logged-in customers chatting with you, so the AI can safely look up their own orders, payments and records.",
  alternates: { canonical: `${SITE_URL}/docs/identity-verification` },
  openGraph: {
    title: "Identity Verification",
    description: "Verify logged-in customers in the Elpino chat widget.",
    url: `${SITE_URL}/docs/identity-verification`,
    type: "article",
  },
};

const CLAIMS: Array<{ name: string; required: boolean; description: string }> = [
  { name: "sub", required: true, description: "Your stable account ID for this user. Required even when an email is present." },
  { name: "aud", required: true, description: "Exactly \"elpino-widget\"." },
  { name: "jti", required: true, description: "A fresh random ID for every token, 16 to 128 URL-safe characters. A UUID works." },
  { name: "iat", required: true, description: "Issued-at time, in whole seconds since the Unix epoch." },
  { name: "exp", required: true, description: "Expiry, in whole seconds. At most five minutes after iat." },
  { name: "email", required: false, description: "The user's email. Omit the claim when there is none; null is rejected." },
  { name: "email_verified", required: false, description: "true only if your login system confirmed the user owns that address. Otherwise the email is ignored." },
  { name: "phone", required: false, description: "The user's phone number, ideally in E.164 form such as +919876543210." },
  { name: "phone_verified", required: false, description: "true only if your system confirmed ownership of that number." },
  { name: "name", required: false, description: "Display name shown to your team." },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-4 text-2xl text-black" style={{ fontWeight: 500 }}>{title}</h2>
      <div className="space-y-4 leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

const code = "rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em] text-slate-800";

export default function IdentityVerificationGuidePage() {
  return (
    <div className="flex flex-1 flex-col bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif' }}>
      <section className="border-b border-slate-200 px-4 pb-16 pt-20 sm:px-10 md:px-14">
        <div className="mx-auto max-w-3xl">
          <p className="mb-4 text-sm text-slate-500">Docs · Chat widget</p>
          <h1 className="mb-6 text-4xl leading-tight text-black md:text-5xl" style={{ fontWeight: 500, letterSpacing: "-0.01em" }}>
            Identity verification
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-700">
            Tell the chat widget who your logged-in user is, in a way nobody can fake. Verified customers can ask about their own orders, payments and account, and the AI only ever looks up that person&apos;s data.
          </p>
        </div>
      </section>

      <div className="px-4 py-16 sm:px-10 md:px-14">
        <div className="mx-auto max-w-3xl space-y-16">
          <Section id="why" title="Why you need it">
            <p>
              Anyone can type any email into a chat. Say Sam bought a laptop from your store and wants the shipping address changed. Without verification, a stranger can open the chat, type Sam&apos;s email, and ask for the same change. Your team, and the AI, have no way to tell them apart.
            </p>
            <p>
              With identity verification, your own login system vouches for Sam. When the real Sam is logged in, the conversation is marked verified. A stranger who only types Sam&apos;s email stays an unverified guest and gets no access to Sam&apos;s private data.
            </p>
          </Section>

          <Section id="how-it-works" title="How it works">
            <ol className="list-decimal space-y-3 pl-5">
              <li><strong className="text-slate-900">Your server signs.</strong> When a logged-in user loads your site, your backend creates a short-lived token (a JWT) signed with your workspace&apos;s identity secret.</li>
              <li><strong className="text-slate-900">Your page hands it over.</strong> The Elpino tag asks your page for that token and passes it to the chat. The secret itself never leaves your server.</li>
              <li><strong className="text-slate-900">Elpino verifies.</strong> We check the signature, expiry and claims. If they&apos;re valid, the visitor becomes a verified customer for that chat session.</li>
            </ol>
            <p>
              Only your server and Elpino know the secret, so only your server can create valid tokens. Each token expires within five minutes and can be used once, so a token that leaks into a log or screenshot is useless almost immediately.
            </p>
          </Section>

          <Section id="setup" title="Set it up">
            <h3 className="pt-2 text-lg text-black" style={{ fontWeight: 500 }}>1. Turn it on and copy your secret</h3>
            <p>
              In the Elpino dashboard, go to <Link href="/dashboard/settings/identity" className="text-[#428ce5] hover:underline">Settings → Identity Verification</Link> and click <strong className="text-slate-900">Turn on</strong>. Copy the secret (it starts with <code className={code}>elid_</code>) into your server configuration, for example as <code className={code}>ELPINO_IDENTITY_SECRET</code>.
            </p>

            <h3 className="pt-4 text-lg text-black" style={{ fontWeight: 500 }}>2. Sign a token on your server</h3>
            <p>
              Add an endpoint, such as <code className={code}>POST /api/chat-identity</code>, that returns a new token for the currently logged-in user. Take the user from your authenticated session, never from request parameters. Return <code className={code}>401</code> when nobody is logged in, and send <code className={code}>Cache-Control: no-store</code>.
            </p>
            <ServerSnippetTabs />

            <h3 className="pt-4 text-lg text-black" style={{ fontWeight: 500 }}>3. Pass the token to the widget</h3>
            <p>
              Add this script before your Elpino tag. The widget calls <code className={code}>getIdentityToken</code> whenever it needs a fresh token: when the chat opens, before a session reaches its limit, and after one ends.
            </p>
            <CodeBlock title="HTML" code={PAGE_SNIPPET} />

            <h3 className="pt-4 text-lg text-black" style={{ fontWeight: 500 }}>4. Single-page apps: report login and logout</h3>
            <p>If users log in or out without a page reload, tell the widget right away. Logout clears the conversation from the screen so the next person on that device can&apos;t see it.</p>
            <CodeBlock title="JavaScript" code={SPA_SNIPPET} />
          </Section>

          <Section id="claims" title="Token claims">
            <p>Sign with HS256. Any other algorithm is refused.</p>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-slate-50 text-slate-900">
                  <tr><th className="px-4 py-2 font-medium">Claim</th><th className="px-4 py-2 font-medium">Required</th><th className="px-4 py-2 font-medium">Meaning</th></tr>
                </thead>
                <tbody>
                  {CLAIMS.map((claim) => (
                    <tr key={claim.name} className="border-t border-slate-200 align-top">
                      <td className="px-4 py-2"><code className={code}>{claim.name}</code></td>
                      <td className="px-4 py-2">{claim.required ? "Yes" : "No"}</td>
                      <td className="px-4 py-2">{claim.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section id="security" title="Keep it secure">
            <ul className="list-disc space-y-2 pl-5">
              <li><strong className="text-slate-900">Never put the secret in front-end code.</strong> Anyone who has it can sign in as any of your users. Sign tokens only on your backend.</li>
              <li><strong className="text-slate-900">Only claim what you&apos;ve verified.</strong> Set <code className={code}>email_verified</code> to true only if your login system confirmed the address. A typed-in email must never be marked verified.</li>
              <li><strong className="text-slate-900">Mint a new token every time.</strong> Tokens are single-use and last five minutes. Don&apos;t cache them or render one token into a cached page.</li>
              <li><strong className="text-slate-900">Rotate if the secret leaks.</strong> Rotating in Settings immediately ends every session signed with the old secret. Update your server first to avoid downtime.</li>
              <li><strong className="text-slate-900">Call logout on sign-out.</strong> A session otherwise ends after 30 minutes idle or eight hours at most.</li>
            </ul>
          </Section>

          <Section id="troubleshooting" title="Troubleshooting">
            <p>
              When a token is refused, the visitor keeps chatting as a guest and your browser console shows <code className={code}>[Elpino] Identity token was not accepted: &lt;reason&gt;</code>. Find the reason below.
            </p>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              {IDENTITY_ERRORS.map((error, index) => (
                <div key={error.code} className={`grid gap-1 px-4 py-3 sm:grid-cols-[190px_1fr] sm:gap-4 ${index ? "border-t border-slate-200" : ""}`}>
                  <code className="font-mono text-sm text-slate-900">{error.code}</code>
                  <p className="text-sm">{error.fix}</p>
                </div>
              ))}
            </div>
            <p>
              To inspect a token, decode it at <a href="https://jwt.io" target="_blank" rel="noreferrer" className="text-[#428ce5] hover:underline">jwt.io</a>. Paste only test tokens there, never your secret. Still stuck? <Link href="/contact" className="text-[#428ce5] hover:underline">Contact us</Link>.
            </p>
          </Section>
        </div>
      </div>
    </div>
  );
}
