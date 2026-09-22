export type RoleSloth = {
  src: string;
  width: number;
  height: number;
  alt: string;
};

export type Role = {
  slug: string;
  title: string;
  tagline: string;
  category: string;
  department: string;
  location: string;
  employmentType: string;
  datePosted: string;
  sloth: RoleSloth;
  overview: string;
  responsibilities: string[];
  requirements: string[];
  niceToHaves: string[];
  ninetyDayPlan: { period: string; goal: string }[];
};

export const roles: Role[] = [
  {
    slug: "senior-ai-engineer",
    title: "Senior AI Engineer",
    tagline: "Help us build the reasoning core of a truly proactive AI operator.",
    category: "Core Intelligence",
    department: "AI & Engineering",
    location: "San Francisco, CA (or Remote)",
    employmentType: "Full-time",
    datePosted: "2026-09-07",
    sloth: {
      src: "/images/blog/learning-sloth.png",
      width: 1200,
      height: 900,
      alt: "Sloth researching transformer reasoning models",
    },
    overview:
      "We are looking for an engineer obsessed with LLM reasoning and agentic workflows. We are in the early days of building the foundation that allows Elpino to triage, decide, and act on a customer and founder's behalf with superhuman precision.",
    responsibilities: [
      "Design and implement advanced reasoning loops and reflection cycles for the Elpino engine.",
      "Optimize the agent's ability to reason across customer knowledge bases, live ticketing signals, and CRM data.",
      "Build specialized verification tools the agent uses to fact-check its own suggestions before human handoff or auto-resolution.",
      "Experiment with new model architectures, prompt caches, and spec-decoding to push latency under 400ms.",
    ],
    requirements: [
      "5+ years of experience in software engineering.",
      "Deep understanding of LLMs, vector databases, and agentic frameworks.",
      "Expertise in TypeScript, Python, and Rust.",
      "A portfolio of high-impact AI projects or contributions to open-source AI tools.",
    ],
    niceToHaves: [
      "Experience building or fine-tuning classification models for high-volume text.",
      "Prior work on developer tools, copilots, or other agentic products.",
      "Contributions to open-source LLM tooling (LangChain, LlamaIndex, or similar).",
    ],
    ninetyDayPlan: [
      { period: "First 30 days", goal: "Ship your first improvement to the triage or drafting pipeline and understand the full reasoning loop end to end." },
      { period: "First 60 days", goal: "Own a full reasoning subsystem (e.g. multi-step tool verification or automated intent extraction)." },
      { period: "First 90 days", goal: "Propose and lead a new capability that measurably improves autonomous resolution rates above 80%." },
    ],
  },
  {
    slug: "staff-frontend-engineer",
    title: "Staff Frontend Engineer",
    tagline: "Craft the world's most fluid, responsive, and delightful AI support workspace.",
    category: "Core Intelligence",
    department: "AI & Engineering",
    location: "Remote (Global)",
    employmentType: "Full-time",
    datePosted: "2026-09-12",
    sloth: {
      src: "/images/busy-teams-sloth.png",
      width: 1200,
      height: 900,
      alt: "Sloth crafting UI micro-interactions on multiple monitors",
    },
    overview:
      "You will architect and lead the client-side experience of Elpino. From our real-time operator inbox to visual workflow builders and instant-load customer chat widgets, you will set the benchmark for frontend engineering craft.",
    responsibilities: [
      "Lead frontend architecture for our high-velocity Next.js, React 19, and Tailwind applications.",
      "Build micro-animations, keyboard-first navigation, and real-time streaming interfaces that feel instantaneous.",
      "Design and maintain our shared design system across marketing, dashboard, and embedded widget surfaces.",
      "Mentor engineers, run frontend performance profiling, and maintain strict accessibility standards.",
    ],
    requirements: [
      "6+ years building world-class web applications in React, TypeScript, and modern CSS.",
      "Deep mastery of browser rendering, web vitals optimization, and real-time WebSockets/SSE.",
      "Uncompromising eye for UI details, typography, spacing, and micro-interactions.",
      "Experience with complex state management and optimistic UI patterns.",
    ],
    niceToHaves: [
      "Experience building extensible canvas or flow-based visual editors.",
      "Familiarity with embeddable iframes and cross-origin communication security.",
      "Open-source contributions to major React or UI libraries.",
    ],
    ninetyDayPlan: [
      { period: "First 30 days", goal: "Audit and optimize inbox rendering latency; reduce bundle sizes across critical paths." },
      { period: "First 60 days", goal: "Ship the next generation of our live streaming response renderer with optimistic state." },
      { period: "First 90 days", goal: "Standardize the Elpino design token library and launch our new keyboard shortcut system." },
    ],
  },
  {
    slug: "product-designer",
    title: "Product Designer",
    tagline: "Define the visual language of approval-first automation and agentic software.",
    category: "UX & Brand",
    department: "Design & Product",
    location: "San Francisco, CA (or Remote)",
    employmentType: "Full-time",
    datePosted: "2026-09-07",
    sloth: {
      src: "/slotpointing.png",
      width: 800,
      height: 800,
      alt: "Sloth inspecting interface design details with a magnifying glass",
    },
    overview:
      "We need a designer who can turn a complex, high-trust AI system into an interface that feels effortless and calm. You'll shape how operators experience Elpino's daily briefs, human handoffs, approvals, and every touchpoint in between.",
    responsibilities: [
      "Own end-to-end product design for the web app, embedded chat surfaces, and mobile experiences.",
      "Design agentic approval flows that feel instant, trustworthy, and never cognitively overwhelming.",
      "Build and evolve the design system used across every Elpino surface.",
      "Partner directly with founders and engineering to prototype in code and ship weekly.",
    ],
    requirements: [
      "4+ years of product design experience, ideally on complex or data-dense products.",
      "A strong portfolio showing systems thinking, typography mastery, and elegant problem solving.",
      "Comfort working directly in code (Tailwind/React) or creating high-fidelity interactive prototypes.",
      "An obsession with reducing cognitive load for busy, high-stakes teams.",
    ],
    niceToHaves: [
      "Experience designing for chat or conversational interfaces.",
      "Background in B2B SaaS or fintech products with dense real-time data.",
      "Motion design skills for micro-interactions and state transitions.",
    ],
    ninetyDayPlan: [
      { period: "First 30 days", goal: "Redesign one high-friction flow (e.g. knowledge source syncing or handoff triage) and ship it." },
      { period: "First 60 days", goal: "Establish a documented design system spanning web, widgets, and mobile surfaces." },
      { period: "First 90 days", goal: "Own the end-to-end design roadmap and lead customer feedback design sessions." },
    ],
  },
  {
    slug: "backend-systems-architect",
    title: "Backend Systems Architect",
    tagline: "Scale the real-time agent engine to millions of concurrent conversations.",
    category: "Infrastructure",
    department: "AI & Engineering",
    location: "London, UK (or Remote)",
    employmentType: "Full-time",
    datePosted: "2026-09-07",
    sloth: {
      src: "/images/trust-sloth.png",
      width: 1200,
      height: 900,
      alt: "Sloth maintaining high availability infrastructure under umbrella",
    },
    overview:
      "Elpino ingests high-volume signals from knowledge bases, live customer chats, email inboxes, and external APIs every millisecond. We need an architect who can design distributed systems that stay sub-millisecond fast, resilient, and cost-effective at global scale.",
    responsibilities: [
      "Architect data pipelines and event buses that keep every integration in sync in sub-100ms real time.",
      "Build resilient distributed queuing, retry, and rate-limiting systems for third-party LLM and SaaS APIs.",
      "Own the reliability, telemetry, and uptime of the core gateway and worker services.",
      "Set architecture standards and database sharding strategies as customer traffic multiplies.",
    ],
    requirements: [
      "6+ years building distributed backend systems in production (Node.js/TypeScript, Go, or Rust).",
      "Deep experience with Redis, PostgreSQL, Kafka/BullMQ, and event-driven architecture.",
      "Strong track record operating systems under heavy production load (10k+ QPS).",
      "Comfort owning infrastructure decisions with minimal oversight.",
    ],
    niceToHaves: [
      "Experience with vector search indexing (pgvector, Pinecone, Qdrant) at scale.",
      "Background scaling OAuth-gated multi-tenant integrations.",
      "Familiarity with LLM compute spend optimization and inference caching.",
    ],
    ninetyDayPlan: [
      { period: "First 30 days", goal: "Deep-dive the gateway and worker architecture, ship a reliability fix in a live integration." },
      { period: "First 60 days", goal: "Own the scaling plan for the real-time event pipeline and knowledge retrieval cache." },
      { period: "First 90 days", goal: "Define and implement the multi-region failover standard the team uses going forward." },
    ],
  },
  {
    slug: "ai-research-scientist",
    title: "AI Research Scientist",
    tagline: "Push the frontier of task-oriented reasoning, evaluation, and grounding.",
    category: "Core Intelligence",
    department: "AI Research",
    location: "San Francisco, CA (or Remote)",
    employmentType: "Full-time",
    datePosted: "2026-09-15",
    sloth: {
      src: "/images/blog/learning-sloth.png",
      width: 1200,
      height: 900,
      alt: "Sloth researcher exploring reasoning-time compute",
    },
    overview:
      "Join the Elpino AI Research Group to advance how agentic models reason over complex company policies, extract unambiguous knowledge, and execute deterministic multi-step tool calls without hallucinations.",
    responsibilities: [
      "Conduct foundational research on agentic evaluation, reasoning-time search, and self-correction loops.",
      "Develop synthetic data pipelines for fine-tuning specialized lightweight reasoning models.",
      "Benchmark model behaviors across complex edge-cases and customer interaction topologies.",
      "Publish groundbreaking findings, write research blog posts, and contribute to open-source model evaluations.",
    ],
    requirements: [
      "PhD or MS in Computer Science, Machine Learning, or equivalent demonstrable research track record.",
      "Publication history in top-tier conferences (NeurIPS, ICML, ICLR, ACL) or top open-source LLM contributions.",
      "Hands-on experience with PyTorch, vLLM, Hugging Face, and synthetic data generation.",
      "Deep mathematical intuition for transformer architectures and reinforcement learning from AI feedback (RLAIF).",
    ],
    niceToHaves: [
      "Experience in retrieval-augmented generation (RAG) benchmarks and hallucination mitigation.",
      "Experience distilling large frontier models into cost-efficient sub-8B parameters.",
      "Interest in agent safety and alignment.",
    ],
    ninetyDayPlan: [
      { period: "First 30 days", goal: "Establish automated evaluation suites for multi-turn customer support dialogues." },
      { period: "First 60 days", goal: "Train and evaluate our first custom reasoning-adapter model for policy enforcement." },
      { period: "First 90 days", goal: "Publish a benchmark report and author an external research post on agent accuracy." },
    ],
  },
  {
    slug: "security-researcher",
    title: "Security Researcher",
    tagline: "Make Elpino the safest, most trusted AI operator an enterprise can deploy.",
    category: "Security & Trust",
    department: "Infrastructure",
    location: "Dublin, Ireland (or Remote)",
    employmentType: "Full-time",
    datePosted: "2026-09-07",
    sloth: {
      src: "/images/trust-sloth.png",
      width: 1200,
      height: 900,
      alt: "Sloth with cybersecurity shield and security audit checklist",
    },
    overview:
      "Elpino handles sensitive customer conversations, enterprise knowledge bases, and billing details. We need a security engineer obsessive about closing every attack vector, defeating prompt injection, and proving our approval-first architecture is unbreachable.",
    responsibilities: [
      "Audit every third-party integration, webhook, and permission scope Elpino requests.",
      "Design and enforce the zero-trust encryption, tenant isolation, and credential vaulting model.",
      "Run continuous red-team exercises against the AI agent's decision-making and tool-execution boundary.",
      "Lead enterprise compliance initiatives (SOC 2 Type II, ISO 27001, GDPR, HIPAA compliance).",
    ],
    requirements: [
      "5+ years in application or infrastructure security and penetration testing.",
      "Experience securing systems that integrate with third-party OAuth providers and cloud primitives.",
      "Deep understanding of LLM-specific vulnerabilities (prompt injection, jailbreaks, data exfiltration).",
      "A track record of discovering and remediating vulnerabilities in production web platforms.",
    ],
    niceToHaves: [
      "Experience executing SOC 2 Type II audits at high-growth startups.",
      "Active Bug Bounty or CTF leaderboard rankings.",
      "Familiarity with confidential computing or enclaves for LLM inference.",
    ],
    ninetyDayPlan: [
      { period: "First 30 days", goal: "Complete a full red-team audit of prompt sanitization and integration scopes." },
      { period: "First 60 days", goal: "Implement automated static and dynamic security scanning across all PR workflows." },
      { period: "First 90 days", goal: "Close out external penetration audit and publish our public Trust & Security whitepaper." },
    ],
  },
  {
    slug: "forward-deployed-engineer",
    title: "Forward Deployed AI Engineer",
    tagline: "Bridge frontier AI models with mission-critical customer workflows.",
    category: "Solutions",
    department: "Customer Engineering",
    location: "Berlin, Germany (or Remote)",
    employmentType: "Full-time",
    datePosted: "2026-09-18",
    sloth: {
      src: "/images/contact-support-sloth.png",
      width: 1234,
      height: 1275,
      alt: "Friendly sloth engineer collaborating with enterprise partners",
    },
    overview:
      "Work side-by-side with our most ambitious enterprise customers to design custom agentic integrations, build tailored workflow automations, and maximize autonomous resolution rates from day one.",
    responsibilities: [
      "Partner with CTOs, VP Support, and engineering leaders at high-growth companies during onboarding.",
      "Build custom connectors, webhooks, and tool definitions that integrate Elpino with bespoke internal systems.",
      "Analyze resolution performance data and fine-tune knowledge base taxonomy for peak accuracy.",
      "Feed frontline customer insights directly into the core product and engineering roadmap.",
    ],
    requirements: [
      "4+ years of full-stack software development experience (TypeScript, Node.js, Python).",
      "Exceptional technical communication and problem-solving skills with external stakeholders.",
      "Comfort navigating complex customer API architectures, authentication schemes, and edge cases.",
      "Curiosity and passion for delivering measurable business outcomes through AI.",
    ],
    niceToHaves: [
      "Prior experience in forward deployed engineering (Palantir, Scale AI, or similar) or technical solutions.",
      "Background in customer support tech stacks (Zendesk, Salesforce Service Cloud, Intercom).",
      "Experience writing technical documentation and integration guides.",
    ],
    ninetyDayPlan: [
      { period: "First 30 days", goal: "Lead deployment for 3 strategic customers from signup to 75%+ AI resolution rate." },
      { period: "First 60 days", goal: "Build two reusable integration templates for common enterprise CRM patterns." },
      { period: "First 90 days", goal: "Author the standard customer deployment playbook used by our expanding solutions team." },
    ],
  },
  {
    slug: "customer-success-architect",
    title: "Customer Success Architect",
    tagline: "Champion customer delight and human-in-the-loop operational excellence.",
    category: "Solutions",
    department: "Customer Success",
    location: "Chicago, IL (or Remote)",
    employmentType: "Full-time",
    datePosted: "2026-09-20",
    sloth: {
      src: "/images/revenue-sloth.png",
      width: 1145,
      height: 1374,
      alt: "Cheerful sloth with headset analyzing customer resolution growth",
    },
    overview:
      "At Elpino, customer success is not about responding to tickets—it is about empowering teams to transform their customer support into a calm, proactive growth engine powered by intelligent agents.",
    responsibilities: [
      "Manage relationships with high-value customer accounts and guide their AI transformation roadmap.",
      "Analyze agent resolution metrics, CSAT scores, and conversation transcripts to identify training opportunities.",
      "Conduct executive business reviews (QBRs) demonstrating ROI, cost savings, and quality improvements.",
      "Advocate for customer needs internally, influencing feature prioritization and product direction.",
    ],
    requirements: [
      "4+ years in customer success, technical account management, or support leadership in B2B SaaS.",
      "Strong analytical mindset; comfort working with dashboards, SQL/analytics, and KPIs.",
      "High emotional intelligence, empathy, and ability to build trust with both frontline agents and C-level execs.",
      "Passion for AI automation and modern customer service design.",
    ],
    niceToHaves: [
      "Experience at a high-growth SaaS startup during hyper-growth phase.",
      "Familiarity with contact center operations, ticketing workflows, and staffing metrics.",
      "Experience running customer advisory boards or user groups.",
    ],
    ninetyDayPlan: [
      { period: "First 30 days", goal: "Conduct onboarding check-ins with our top 25 accounts and map their adoption goals." },
      { period: "First 60 days", goal: "Launch our automated customer health scoring model to proactively prevent churn." },
      { period: "First 90 days", goal: "Deliver your first cohort of QBRs and establish our customer referral program." },
    ],
  },
];

export function getRole(slug: string): Role | undefined {
  return roles.find((role) => role.slug === slug);
}
