import type { MetadataRoute } from "next";
import { posts } from "./blog/data";
import { roles } from "./careers/roles";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

function page(
  path: string,
  priority: number,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly",
  lastModified?: Date,
): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}${path}`,
    // Omitted rather than stamped with `new Date()` when we don't actually
    // know when a page last changed. A fake "modified today" on every single
    // build tells crawlers this content changes daily, which either wastes
    // the recrawl budget it earns or — worse — reads as a low-quality signal
    // once a search engine notices the date never correlates with any real
    // change. Missing lastModified is explicitly fine per the sitemap spec;
    // it just means "unknown", which is the honest answer here.
    ...(lastModified ? { lastModified } : {}),
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Only canonical, live pages. Legacy /solutions/* pages that describe
  // features Elpino doesn't have are deliberately left out.
  const staticPages: MetadataRoute.Sitemap = [
    page("", 1.0, "weekly"),
    page("/features", 0.9, "weekly"),
    page("/pricing", 0.9, "monthly"),
    page("/integrations", 0.8, "weekly"),
    page("/product/helpdesk", 0.8, "monthly"),
    page("/product/ai-agent", 0.8, "monthly"),
    page("/product/inbox", 0.8, "monthly"),
    page("/product/knowledge-hub", 0.8, "monthly"),
    page("/product/tickets", 0.8, "monthly"),
    page("/solutions/founders", 0.8, "monthly"),
    page("/solutions/busy-operators", 0.8, "monthly"),
    page("/solutions/developers", 0.8, "monthly"),
    page("/about", 0.7, "monthly"),
    page("/blog", 0.8, "weekly"),
    page("/careers", 0.7, "weekly"),
    page("/changelog", 0.6, "weekly"),
    page("/trust", 0.7, "monthly"),
    page("/security-guide", 0.6, "monthly"),
    page("/docs", 0.7, "weekly"),
    page("/docs/knowledge", 0.6, "monthly"),
    page("/docs/ai-answers", 0.6, "monthly"),
    page("/docs/chat-widget", 0.6, "monthly"),
    page("/docs/identity-verification", 0.6, "monthly"),
    page("/docs/inbox", 0.6, "monthly"),
    page("/docs/integrations", 0.6, "monthly"),
    page("/docs/billing", 0.5, "monthly"),
    page("/docs/security", 0.6, "monthly"),
    page("/docs/troubleshooting", 0.6, "monthly"),
    page("/security-policy", 0.5, "monthly"),
    page("/faq", 0.6, "monthly"),
    page("/contact", 0.6, "monthly"),
    page("/brand-kit", 0.4, "monthly"),
    page("/privacy", 0.3, "yearly"),
    page("/terms", 0.3, "yearly"),
  ];

  // Real dates, not guesses: post.date is authored per post, role.datePosted
  // is the same value the JobPosting schema on that role's own page uses —
  // so the sitemap and the structured data can never quietly disagree about
  // when a listing went up.
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const careerPages: MetadataRoute.Sitemap = roles.map((role) => ({
    url: `${BASE_URL}/careers/${role.slug}`,
    lastModified: new Date(role.datePosted),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...careerPages];
}
