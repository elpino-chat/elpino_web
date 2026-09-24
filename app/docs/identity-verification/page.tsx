import Link from "next/link";
import { CodeBlock, ServerSnippetTabs } from "@/app/components/identity/CodeBlock";
import { AUTO_REFRESH_SNIPPET, IDENTITY_ERRORS, PAGE_SNIPPET, SPA_SNIPPET } from "@/lib/identity-snippets";
import { DocsShell } from "../_components/DocsShell";
import { docsMetadata } from "../_lib/docs";

const description = "Verify the identity of logged-in customers chatting with you, so the AI can safely look up their own orders, payments, and records.";
export const metadata = docsMetadata("/docs/identity-verification", "Identity verification", description);

const CLAIMS: Array<{ name: string; required: boolean; description: string }> = [
  { name: "sub", required: true, description: "Your stable account ID for this user." },
  { name: "aud", required: true, description: "Exactly \"elpino-widget\"." },
  { name: "jti", required: true, description: "A fresh random ID per token (16–128 URL-safe characters). A UUID works." },
  { name: "iat", required: true, description: "Issued-at time, in whole seconds." },
  { name: "exp", required: true, description: "Expiry, in whole seconds. At most 5 minutes after iat." },
  { name: "email", required: false, description: "Omit when there is none; null is rejected." },
  { name: "email_verified", required: false, description: "true only if your login system confirmed ownership." },
  { name: "phone", required: false, description: "E.164 form, e.g. +919876543210." },
  { name: "phone_verified", required: false, description: "true only if your system confirmed ownership." },
  { name: "name", required: false, description: "Display name shown to your team." },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="mb-3 text-2xl text-black" style={{ fontWeight: 500 }}>{title}</h2>
      <div className="space-y-3 leading-relaxed text-slate-600">{children}</div>
    </section>
  );
}

const code = "rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em] text-slate-800";

export default function IdentityVerificationGuidePage() {
  return (
    <DocsShell current="/docs/identity-verification" title="Identity verification" description={description}>
      <div className="py-14">
        <div className="mx-auto max-w-3xl space-y-12">
          <Section id="why" title="Why you need it">
            <p>
              Anyone can type any email into chat. Identity verification has your own login system vouch for the visitor, so the AI only shows private data (orders, payments, records) to the real account owner, not to someone who just typed their email.
            </p>
          </Section>

          <Section id="how-it-works" title="How it works">
            <ol className="list-decimal space-y-2 pl-5">
              <li>Your server signs a short-lived token (JWT) for the logged-in user.</li>
              <li>You pass that token to the Elpino tag already on your site.</li>
              <li>Elpino checks the signature and claims, then marks the chat verified.</li>
            </ol>
            <p>Only your server knows the signing secret. Each token expires in 5 minutes and works once.</p>
          </Section>

          <Section id="setup" title="Set it up">
            <h3 className="pt-2 text-lg text-black" style={{ fontWeight: 500 }}>1. Turn it on and copy your secret</h3>
            <p>
              <Link href="/dashboard/settings/identity" className="text-[#428ce5] hover:underline">Settings → Identity Verification</Link> → <strong className="text-slate-900">Turn on</strong>. Copy the secret (<code className={code}>elid_...</code>) into your server config as <code className={code}>ELPINO_IDENTITY_SECRET</code>.
            </p>

            <h3 className="pt-3 text-lg text-black" style={{ fontWeight: 500 }}>2. Sign a token on your server</h3>
            <p>
              In your existing login handler, generate a token for the authenticated user (never from request parameters) and return it as <code className={code}>elpinoToken</code>.
            </p>
            <ServerSnippetTabs />

            <h3 className="pt-3 text-lg text-black" style={{ fontWeight: 500 }}>3. Pass the token to the widget</h3>
            <p>Your existing Elpino tag already includes the SDK, no extra script needed:</p>
            <CodeBlock title="HTML" code={PAGE_SNIPPET} lang="markup" />

            <h3 className="pt-3 text-lg text-black" style={{ fontWeight: 500 }}>4. Single-page apps: report login and logout</h3>
            <p>Tell the widget right away when login state changes without a page reload:</p>
            <CodeBlock title="JavaScript" code={SPA_SNIPPET} lang="javascript" />
          </Section>

          <details id="renewal" className="group scroll-mt-24 rounded-lg border border-slate-200 p-4 open:pb-5">
            <summary className="cursor-pointer text-lg text-black" style={{ fontWeight: 500 }}>Optional: automatic renewal</summary>
            <div className="mt-3 space-y-3 leading-relaxed text-slate-600">
              <p>A token works once, within 5 minutes. The chat session itself lasts up to 8 hours (30-minute idle limit) and keeps running after the token expires.</p>
              <p>For long-lived pages, the SDK emits <code className={code}>elpino:identity-required</code> when it needs a fresh token, or configure an endpoint for automatic renewal:</p>
              <CodeBlock title="Optional JavaScript" code={AUTO_REFRESH_SNIPPET} lang="javascript" />
            </div>
          </details>

          <details id="claims" className="group scroll-mt-24 rounded-lg border border-slate-200 p-4 open:pb-5">
            <summary className="cursor-pointer text-lg text-black" style={{ fontWeight: 500 }}>Token claims reference</summary>
            <div className="mt-3 space-y-3 leading-relaxed text-slate-600">
              <p>The Node.js helper handles these for you. Only needed if you&apos;re signing tokens in another language. Sign with HS256.</p>
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
            </div>
          </details>

          <Section id="security" title="Keep it secure">
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Never put the secret in front-end code — sign tokens only on your backend.</li>
              <li>Only set <code className={code}>email_verified</code>/<code className={code}>phone_verified</code> to true if your own login actually confirmed it.</li>
              <li>Mint a new token every time; never cache one.</li>
              <li>Rotating the secret in Settings ends every session signed with the old one.</li>
              <li>Call <code className={code}>logout</code> on sign-out.</li>
            </ul>
          </Section>

          <details id="troubleshooting" className="group scroll-mt-24 rounded-lg border border-slate-200 p-4 open:pb-5">
            <summary className="cursor-pointer text-lg text-black" style={{ fontWeight: 500 }}>Troubleshooting</summary>
            <div className="mt-3 space-y-3 leading-relaxed text-slate-600">
              <p>
                A refused token falls back to guest chat, with <code className={code}>[Elpino] Identity token was not accepted: &lt;reason&gt;</code> in the browser console.
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
                Decode a token at <a href="https://jwt.io" target="_blank" rel="noreferrer" className="text-[#428ce5] hover:underline">jwt.io</a> (test tokens only, never your secret). Still stuck? <Link href="/contact" className="text-[#428ce5] hover:underline">Contact us</Link>.
              </p>
            </div>
          </details>
        </div>
      </div>
    </DocsShell>
  );
}
