export type FieldErrors<K extends string> = Partial<Record<K, string>>;

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

export function maskTime(raw: string): string {
  const short = /^(\d):(\d{0,2})$/.exec(raw);
  if (short) return `0${short[1]}:${short[2]}`;
  const digits = raw.replace(/\D/g, "").slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
}

export function parseTime(value: string): { h: number; m: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (h > 23 || m > 59) return null;
  return { h, m };
}

export function nextFullHour(now: Date): { dayOffset: number; time: string } {
  const hour = now.getHours() + 1;
  return hour > 23 ? { dayOffset: 1, time: "07:00" } : { dayOffset: 0, time: `${pad(hour)}:00` };
}

export function maskDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length > 4) return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  if (digits.length > 2) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return digits;
}

/** Convierte "DD/MM/AAAA" a "AAAA-MM-DD"; `null` si no es una fecha real. */
export function parseDisplayDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, Number(d)));
  if (
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() !== Number(m) - 1 ||
    date.getUTCDate() !== Number(d)
  ) {
    return null;
  }
  return `${y}-${m}-${d}`;
}

export function isoToDisplayDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : iso;
}

export function todayIso(now = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Valida "DD/MM/AAAA" como fecha real, de hoy en adelante. Devuelve el error o el ISO. */
export function validateFutureDate(
  value: string,
): { ok: true; iso: string } | { ok: false; error: string } {
  if (!value.trim()) return { ok: false, error: "Indica la fecha de vencimiento." };
  const iso = parseDisplayDate(value);
  if (!iso) return { ok: false, error: "Escribe una fecha válida (DD/MM/AAAA)." };
  if (iso < todayIso()) return { ok: false, error: "La licencia está vencida." };
  return { ok: true, iso };
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Normaliza un teléfono venezolano a "04XXXXXXXXX"; `null` si no es válido. */
export function normalizeVePhone(value: string): string | null {
  let digits = value.replace(/[\s\-().]/g, "");
  if (digits.startsWith("+58")) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith("58") && digits.length === 12) digits = `0${digits.slice(2)}`;
  return /^04\d{9}$/.test(digits) ? digits : null;
}
