import type { Metadata } from "next";
import { BlogClient } from "./BlogClient";
import { posts } from "./data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://elpino.chat";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Guides, product notes and lessons from the Elpino team on AI customer support, human handoff and calmer support operations.",
  alternates: { canonical: `${SITE_URL}/blog` },
  openGraph: {
    title: "Blog",
    description:
      "Guides, product notes and lessons on AI customer support and calmer support operations.",
    url: `${SITE_URL}/blog`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog",
    description:
      "Guides, product notes and lessons on AI customer support and calmer support operations.",
  },
};

const blogListSchema = {
  "@context": "https://schema.org",
  "@type": "Blog",
  name: "elpino Blog",
  url: `${SITE_URL}/blog`,
  description: "Notes, guides, and technical updates from the elpino team.",
  blogPost: posts.map((post) => ({
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    url: `${SITE_URL}/blog/${post.slug}`,
    author: { "@type": "Organization", name: "Elpino", url: SITE_URL },
  })),
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
    { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
  ],
};

export default function BlogPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <BlogClient posts={posts} />
    </>
  );
}
