/** Mirrors backend `normalize_phone`: 10-digit US/local, +country code, or leading 1 + 10 digits. */

export type PhoneResult = { ok: true; normalized: string } | { ok: false; message: string };

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

export function normalizePhoneFlexible(raw: string): PhoneResult {
  const s = raw.trim();
  if (!s) return { ok: true, normalized: "" };

  if (s.startsWith("+")) {
    const digits = digitsOnly(s.slice(1));
    const n = digits.length;
    if (n < 8 || n > 15) {
      return {
        ok: false,
        message: `After "+", use 8–15 digits including country code (you entered ${n} digit${n === 1 ? "" : "s"}).`,
      };
    }
    if (digits.startsWith("1") && digits.length === 11) {
      return { ok: true, normalized: digits.slice(1) };
    }
    return { ok: true, normalized: `+${digits}` };
  }

  const digits = digitsOnly(s);
  const nd = digits.length;
  if (nd === 10) return { ok: true, normalized: digits };
  if (nd === 11 && digits.startsWith("1")) {
    return { ok: true, normalized: digits.slice(1) };
  }
  return {
    ok: false,
    message: `Without "+", use exactly 10 digits (you entered ${nd}). Or start with + and enter 8–15 digits after + (country code counts toward that total).`,
  };
}
