// Referral links look like elpino.chat/any-page?ref=<code>. The code is remembered in this cookie so a visitor who
// signs up days later is still credited to the partner who sent them.
export const REFERRAL_COOKIE = "elpino_ref";
export const REFERRAL_COOKIE_MAX_AGE = 60 * 24 * 60 * 60; // 60 days, in seconds

const CODE = /^[a-z0-9][a-z0-9-]{2,31}$/;

export function normalizeReferralCode(code: string | null | undefined): string | null {
  const value = code?.trim().toLowerCase() ?? "";
  return CODE.test(value) ? value : null;
}
