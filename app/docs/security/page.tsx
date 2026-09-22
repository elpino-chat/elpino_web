import Link from "next/link";
import { DocSection, DocsShell, Note } from "../_components/DocsShell";
import { docsMetadata } from "../_lib/docs";
const description = "Protect customer information with verified identity, server-side tenancy, encrypted credentials, and privacy controls.";
export const metadata = docsMetadata("/docs/security", "Security", description);
export default function Page(){return <DocsShell current="/docs/security" title="Security" description={description}>
<DocSection id="boundaries" title="Trust boundaries"><p>Workspace authorization is checked on the server. Public site keys identify a widget installation but are not secret credentials. Private integration keys and identity-signing secrets must remain on trusted servers.</p></DocSection>
<DocSection id="credentials" title="Credentials and sensitive data"><p>Integration credentials and secure-vault content use dedicated encryption keys. Production deployments must provide and protect those keys, restrict access to runtime secrets, and rotate credentials after suspected exposure.</p><Note>Do not claim a customer is verified because they typed an email or phone number. Use <Link href="/docs/identity-verification" className="font-semibold underline">server-signed identity verification</Link>.</Note></DocSection>
<DocSection id="privacy" title="Privacy operations"><p>Keep collected contact data to what your team needs. Elpino provides privacy and deletion flows; validate retention and access policies against your organization&apos;s own legal requirements.</p><p>For the broader public overview, read the <Link href="/security-guide" className="font-semibold text-[#6d469d] underline">security guide</Link> and <Link href="/privacy" className="font-semibold text-[#6d469d] underline">privacy policy</Link>.</p></DocSection>
</DocsShell>}
