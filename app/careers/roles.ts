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
    location: "Remote",
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
    slug: "forward-deployed-engineer",
    title: "Forward Deployed AI Engineer",
    tagline: "Bridge frontier AI models with mission-critical customer workflows.",
    category: "Solutions",
    department: "Customer Engineering",
    location: "Remote",
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
];

export function getRole(slug: string): Role | undefined {
  return roles.find((role) => role.slug === slug);
}
