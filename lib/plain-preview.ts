/**
 * A one-line, plain-text version of a markdown message, for places that
 * clamp or truncate it (the widget's new-reply popup, conversation rows).
 * Mirrors plainPreview in workspace-service so both sides read the same.
 */
export function plainPreview(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/```[\s\S]*?(```|$)/g, " ")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|>|[-*+]|\d+[.)])\s+/gm, "")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*\*|__)/g, "")
    .replace(/(^|[\s(])[*_]([^*_\n]+?)[*_](?=$|[\s).,!?:;])/g, "$1$2")
    .replace(/`([^`]*)`?/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}
