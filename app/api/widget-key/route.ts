// The public site key the marketing site's own chat widget loads with. Read from the service's environment when
// asked, not at build time: this site is prerendered, and a NEXT_PUBLIC_ value would be baked into the build
// instead of following the Cloud Run setting. Bracket access keeps the bundler from inlining it.
const NAMES = ["ELPINO_WIDGET_SITE_KEY", "WIDGET_SITE_KEY", "NEXT_PUBLIC_WIDGET_SITE_KEY"];
const KEY_FORMAT = /^rz_site_[a-z0-9]{8,64}$/;

export const dynamic = "force-dynamic";

export function GET() {
  for (const name of NAMES) {
    const value = process.env[name]?.trim();
    if (value && KEY_FORMAT.test(value)) return Response.json({ key: value }, { headers: { "cache-control": "no-store" } });
  }
  return Response.json({ key: null }, { headers: { "cache-control": "no-store" } });
}
