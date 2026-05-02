/** Best-effort first message from DRF / Axios error payloads. */

export function pickFirstApiError(err: unknown, fallback: string): string {
  if (!err || typeof err !== "object") return fallback;
  const ax = err as { response?: { data?: unknown } };
  const data = ax.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (!data || typeof data !== "object") return fallback;
  const d = data as Record<string, unknown>;
  if (typeof d.detail === "string" && d.detail.trim()) return d.detail;
  for (const v of Object.values(d)) {
    if (Array.isArray(v) && v.length && typeof v[0] === "string") return v[0];
    if (typeof v === "string") return v;
  }
  return fallback;
}
