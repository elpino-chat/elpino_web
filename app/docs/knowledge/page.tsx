import Link from "next/link";
import { DocSection, DocsShell, Note } from "../_components/DocsShell";
import { docsMetadata } from "../_lib/docs";
const description = "Add, organize, and publish trusted sources so Elpino can give accurate customer answers.";
export const metadata = docsMetadata("/docs/knowledge", "Knowledge base", description);
export default function Page(){return <DocsShell current="/docs/knowledge" title="Knowledge base" description={description}>
<DocSection id="sources" title="Create a reliable source of truth"><p>Add knowledge by crawling your website, uploading relevant files, importing a URL, or writing a help page. Keep each source focused on information a customer may actually need.</p><p>Publishing controls whether visitor-facing AI can use a source. Review imported content before making it available, especially pricing, policies, and product limits.</p></DocSection>
<DocSection id="quality" title="Write for accurate retrieval"><ul className="list-disc space-y-2 pl-5"><li>Use descriptive titles and one clear topic per page.</li><li>State exceptions and eligibility rules next to the main rule.</li><li>Remove duplicate or outdated versions of the same answer.</li><li>Use the customer&apos;s vocabulary for products and common problems.</li></ul><Note>After an important update, test the question in a new conversation. Existing conversation context may still reflect what was said earlier.</Note></DocSection>
<DocSection id="next" title="Next step"><p>Learn how Elpino uses these sources in <Link className="font-semibold text-[#6d469d] underline" href="/docs/ai-answers">AI answers</Link>.</p></DocSection>
</DocsShell>}
