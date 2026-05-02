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
    if (digits.length < 8 || digits.length > 15) {
      return {
        ok: false,
        message: "International numbers must use + followed by 8–15 digits (country code + number).",
      };
    }
    if (digits.startsWith("1") && digits.length === 11) {
      return { ok: true, normalized: digits.slice(1) };
    }
    return { ok: true, normalized: `+${digits}` };
  }

  const digits = digitsOnly(s);
  if (digits.length === 10) return { ok: true, normalized: digits };
  if (digits.length === 11 && digits.startsWith("1")) {
    return { ok: true, normalized: digits.slice(1) };
  }
  return {
    ok: false,
    message: "Enter a 10-digit phone number, or include country code (e.g. +1 for US, +44 for UK).",
  };
}
