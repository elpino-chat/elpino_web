/** "Chrome on Windows" from a User-Agent string. Deliberately coarse: enough to recognise your own device. */
export function describeUserAgent(userAgent: string | null | undefined): { browser: string; os: string; label: string; mobile: boolean } {
  const ua = userAgent ?? "";
  // Order matters: Edge/Opera/Samsung UAs also contain "Chrome", Chrome's contains "Safari".
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\/|Opera/.test(ua) ? "Opera"
    : /SamsungBrowser/.test(ua) ? "Samsung Internet"
    : /Firefox\/|FxiOS/.test(ua) ? "Firefox"
    : /Chrome\/|CriOS/.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : "Browser";
  const os =
    /Windows/.test(ua) ? "Windows"
    : /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Android/.test(ua) ? "Android"
    : /Mac OS X|Macintosh/.test(ua) ? "macOS"
    : /CrOS/.test(ua) ? "ChromeOS"
    : /Linux/.test(ua) ? "Linux"
    : "";
  return { browser, os, label: os ? `${browser} on ${os}` : browser, mobile: /iPhone|iPod|Android.*Mobile|Mobile/.test(ua) };
}
