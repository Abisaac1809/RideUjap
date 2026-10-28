import type { Currency, Money } from "@rideujap/shared";
import { load } from "cheerio";

export const CARACAS_TIME_ZONE = "America/Caracas";

export type BcvRates = {
  valueDate: string;
  rates: Record<Currency, number>;
};

export type RateInfo = {
  rate: number;
  rateDate: string;
  stale: boolean;
};

export function parseRate(text: string): number {
  const raw = text.replace(/[^\d.,]/g, "");
  const normalized = raw.includes(",") ? raw.replace(/\./g, "").replace(",", ".") : raw;
  const rate = Number(normalized);

  if (!normalized || !Number.isFinite(rate) || rate <= 0) {
    throw new Error(`Invalid BCV rate: "${text.trim()}"`);
  }
  return rate;
}

function parseValueDate(content: string | undefined): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(content ?? "");
  if (!match) throw new Error("BCV value date not found");

  const [isoDate, year, month, day] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.toISOString().slice(0, 10) !== isoDate) {
    throw new Error(`Invalid BCV value date: "${content}"`);
  }
  return isoDate;
}

/** Lee la tasa oficial del BCV (Bs por USD y por EUR) y su "Fecha Valor". */
export function parseBcvHtml(html: string): BcvRates {
  const $ = load(html);

  return {
    valueDate: parseValueDate(
      $(".pull-right.dinpro.center span.date-display-single").first().attr("content"),
    ),
    rates: {
      USD: parseRate($("#dolar strong").first().text()),
      EUR: parseRate($("#euro strong").first().text()),
    },
  };
}

/** Día calendario en Venezuela, en formato `YYYY-MM-DD`. */
export function caracasDate(now: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: CARACAS_TIME_ZONE }).format(now);
}

/**
 * La tasa vigente no cambia en el día: basta con que su Fecha Valor sea hoy o
 * con haber consultado al BCV hoy.
 */
export function isRateCurrent(
  cached: { valueDate: string; checkedOn: string },
  today: string,
): boolean {
  return cached.valueDate === today || cached.checkedOn === today;
}

export function toVes(amount: number, rate: number): number {
  return Math.round(Number((amount * rate * 100).toPrecision(12))) / 100;
}

export function toMoney(usd: number, rateInfo: RateInfo | null): Money {
  if (!rateInfo) return { usd, ves: null, rateDate: null, stale: false };

  return {
    usd,
    ves: toVes(usd, rateInfo.rate),
    rateDate: rateInfo.rateDate,
    stale: rateInfo.stale,
  };
}
