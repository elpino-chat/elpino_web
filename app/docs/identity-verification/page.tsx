import Link from "next/link";
import { CodeBlock, ServerSnippetTabs } from "@/app/components/identity/CodeBlock";
import { AUTO_REFRESH_SNIPPET, IDENTITY_ERRORS, PAGE_SNIPPET, SPA_SNIPPET } from "@/lib/identity-snippets";
import { DocsShell } from "../_components/DocsShell";
import { docsMetadata } from "../_lib/docs";

const description = "Verify the identity of logged-in customers chatting with you, so the AI can safely look up their own orders, payments, and records.";
export const metadata = docsMetadata("/docs/identity-verification", "Identity verification", description);

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
    <DocsShell current="/docs/identity-verification" title="Identity verification" description={description}>
      <div className="py-14">
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
              <li><strong className="text-slate-900">Call $elpino.</strong> Pass the signed token to the SDK included in your chat tag. It sends the token to Elpino and starts the verified session. No endpoint URL is required; the secret stays on your server.</li>
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
              Generate a fresh token in your existing login handler or authenticated page and include it as <code className={code}>elpinoToken</code> in the response. Take the user from your authenticated session, never from request parameters. Do not cache responses containing tokens. You do not need a separate identity endpoint.
            </p>
            <ServerSnippetTabs />

            <h3 className="pt-4 text-lg text-black" style={{ fontWeight: 500 }}>3. Pass the token to the widget</h3>
            <p>
              Call this with the signed token from your server&apos;s page data or login response. Your existing Elpino tag includes the <code className={code}>$elpino</code> SDK, so no browser package or custom module is needed. Calls made before the tag loads are queued. Elpino exchanges the token immediately, even while chat is closed. Skip identify for guests. Use your framework&apos;s safe page-data serialization when rendering the token into HTML.
            </p>
            <CodeBlock title="HTML" code={PAGE_SNIPPET} />

            <h3 className="pt-4 text-lg text-black" style={{ fontWeight: 500 }}>4. Single-page apps: report login and logout</h3>
            <p>If users log in or out without a page reload, tell the widget right away. Logout clears the conversation from the screen so the next person on that device can&apos;t see it.</p>
            <CodeBlock title="JavaScript" code={SPA_SNIPPET} />
          </Section>

          <Section id="renewal" title="Optional: automatic renewal">
            <p>A token works once and must be exchanged within five minutes. The resulting chat session lasts up to eight hours, with a 30-minute idle limit. Token expiry does not end an active chat session. Generate a new token on each authenticated page load or login.</p>
            <p>For pages that stay open longer, the SDK emits <code className={code}>elpino:identity-required</code> when it needs a fresh token. Your app can supply one with the same identify call. Without a fresh token, an expired session continues as a guest.</p>
            <p>If you prefer the SDK to fetch fresh tokens automatically, optionally configure a same-origin endpoint. It must authenticate the user, return a new <code className={code}>{"{ token }"}</code> on each POST, return HTTP 401 for guests, and set <code className={code}>Cache-Control: no-store</code>. Apply your app&apos;s normal request protections. Redirects are refused.</p>
            <CodeBlock title="Optional JavaScript" code={AUTO_REFRESH_SNIPPET} />
          </Section>

          <Section id="claims" title="Token claims">
            <p>The Node.js helper handles these claims for you. These details are only needed when implementing a signer in another language. Sign with HS256. Any other algorithm is refused.</p>
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
    </DocsShell>
  );
}
