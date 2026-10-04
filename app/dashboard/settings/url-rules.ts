// Which pages show the chat widget. Mirrors matchesPattern / pathAllowed in app/tag.js/route.ts, which is what
// actually runs on a customer's site, so the preview on the Restrictions page never disagrees with the widget.

export type UrlRules = { show: string[]; hide: string[] };

/** "/docs/*" matches "/docs" and everything under it; a trailing "*" matches any path starting with that prefix; otherwise an exact path. */
export function matchesPattern(pattern: string, path: string): boolean {
  if (pattern.slice(-2) === "/*") {
    const prefix = pattern.slice(0, -2);
    return path === prefix || path.startsWith(`${prefix}/`);
  }
  if (pattern.slice(-1) === "*") return path.startsWith(pattern.slice(0, -1));
  return path === pattern;
}

export type WidgetVerdict =
  | { visible: true; reason: "everywhere" }
  | { visible: true; reason: "allowed"; rule: string }
  | { visible: false; reason: "hidden"; rule: string }
  | { visible: false; reason: "not-allowed" };

/** A hide match always wins. An empty show list means every page; a non-empty one is an allowlist. */
export function widgetVerdict(rules: UrlRules, path: string): WidgetVerdict {
  const hidden = rules.hide.find((pattern) => matchesPattern(pattern, path));
  if (hidden !== undefined) return { visible: false, reason: "hidden", rule: hidden };
  if (rules.show.length === 0) return { visible: true, reason: "everywhere" };
  const allowed = rules.show.find((pattern) => matchesPattern(pattern, path));
  if (allowed !== undefined) return { visible: true, reason: "allowed", rule: allowed };
  return { visible: false, reason: "not-allowed" };
}

/**
 * What a visitor's path would be for whatever was typed or pasted: a full URL is cut down to its path, the query string
 * and fragment are dropped (the widget only looks at the pathname), and a missing leading slash is added.
 */
export function normalizePath(input: string): string {
  let value = input.trim();
  if (!value) return "";
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) {
    try {
      value = new URL(value).pathname;
    } catch {
      return "";
    }
  }
  value = value.split(/[?#]/)[0];
  if (!value) return "/";
  return value.startsWith("/") ? value : `/${value}`;
}
