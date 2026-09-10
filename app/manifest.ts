import type { MetadataRoute } from "next";

// A minimal, correct manifest — the smallest thing that makes Lighthouse's
// "installable" audit and Search Console's PWA checks pass, and that a
// mobile browser's "Add to Home Screen" prompt can actually use. It reuses
// app/icon.png (the real favicon source, 512×512) rather than inventing a
// separate icon set: one asset, one thing to keep in sync.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Elpino",
    short_name: "Elpino",
    description:
      "One proactive operator for meetings, inboxes, and daily automations — reachable in Slack, Telegram, or Discord.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
