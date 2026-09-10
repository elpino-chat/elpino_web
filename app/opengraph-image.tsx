import { ImageResponse } from "next/og";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

export const alt = "Elpino, an AI customer support platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  // public/elpino-wordmark-white.png isn't committed to the repo yet — a
  // missing file here used to fail the entire production build (prerendering
  // this route throws ENOENT, which Next treats as fatal). Degrade to a
  // text-only card instead so a missing brand asset never blocks a deploy;
  // once the real wordmark exists, this falls back to using it automatically.
  const logoSrc = await readFile(join(process.cwd(), "public", "elpino-wordmark-white.png"), "base64")
    .then((data) => `data:image/png;base64,${data}`)
    .catch(() => null);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#0d0d0d",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 20% 0%, rgba(217,190,244,0.16), transparent)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "space-between",
          padding: "64px 80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {logoSrc ? (
          <img src={logoSrc} alt="" height={64} />
        ) : (
          <div style={{ fontSize: 28, fontWeight: 700, color: "#ffffff", letterSpacing: "-0.01em" }}>
            elpino
          </div>
        )}

        {/* main content */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              maxWidth: 820,
              letterSpacing: "-0.02em",
            }}
          >
            Support that answers itself
          </div>
          <div
            style={{
              fontSize: 24,
              color: "#a3a39e",
              maxWidth: 680,
              lineHeight: 1.5,
            }}
          >
            AI answers customers instantly from your knowledge base, and
            hands off to a human when it can&apos;t.
          </div>
        </div>

        {/* bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ fontSize: 18, color: "#8a8a85", fontWeight: 500 }}>
            elpino.chat
          </div>
          <div
            style={{
              background: "#D9BEF4",
              color: "#ffffff",
              fontSize: 16,
              fontWeight: 600,
              padding: "10px 24px",
              borderRadius: 8,
            }}
          >
            Start Free Trial
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
