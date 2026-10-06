// Referral links look like elpino.chat/any-page?ref=<code>. The code is remembered in this cookie so a visitor who
// signs up days later is still credited to the partner who sent them.
export const REFERRAL_COOKIE = "elpino_ref";
export const REFERRAL_COOKIE_MAX_AGE = 60 * 24 * 60 * 60; // 60 days, in seconds
// Set for half an hour after a visit is counted, so reloads and moving around the site don't count it again.
export const REFERRAL_SEEN_COOKIE = "elpino_ref_seen";
// Set for a day after the dashboard credited the referral, so it isn't tried on every page.
export const REFERRAL_CREDITED_COOKIE = "elpino_ref_credited";

const CODE = /^[a-z0-9][a-z0-9-]{2,31}$/;

export function normalizeReferralCode(code: string | null | undefined): string | null {
  const value = code?.trim().toLowerCase() ?? "";
  return CODE.test(value) ? value : null;
}
