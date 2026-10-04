// The plan picker's address. Opening it adds ?plans=open to whatever page you are on; closing removes it. That makes the
// picker linkable ("…/billing?plans=open"), survives a refresh, and lets the browser's Back button close it.

export const PLANS_PARAM = "plans";
export const PLANS_OPEN_VALUE = "open";

/** Whether a query string (location.search) asks for the picker to be open. */
export function plansOpenIn(search: string): boolean {
  return new URLSearchParams(search).get(PLANS_PARAM) === PLANS_OPEN_VALUE;
}

/** The same address with the picker's parameter added or removed. Everything else (path, other params, hash) is untouched. */
export function withPlansParam(href: string, open: boolean): string {
  const url = new URL(href);
  if (open) url.searchParams.set(PLANS_PARAM, PLANS_OPEN_VALUE);
  else url.searchParams.delete(PLANS_PARAM);
  return `${url.pathname}${url.search}${url.hash}`;
}
