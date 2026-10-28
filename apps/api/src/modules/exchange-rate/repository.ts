import type { Currency } from "@rideujap/shared";
import { inArray, lte, max, sql } from "drizzle-orm";

import { db } from "../../db/index";
import { exchangeRate } from "../../db/schema";
import type { BcvRates } from "./rules";

export async function upsertRates({ valueDate, rates }: BcvRates): Promise<void> {
  const fetchedAt = new Date();

  await db.transaction(async (tx) => {
    for (const currency of Object.keys(rates) as Currency[]) {
      await tx
        .insert(exchangeRate)
        .values({ currency, valueDate, rate: String(rates[currency]), fetchedAt })
        .onConflictDoUpdate({
          target: [exchangeRate.currency, exchangeRate.valueDate],
          set: { rate: sql`excluded.rate`, fetchedAt: sql`excluded.fetched_at` },
        });
    }
  });
}

/** Tasas de la Fecha Valor más reciente que no sea posterior a `today`. */
export async function findEffectiveRates(today: string): Promise<BcvRates | null> {
  const latest = db
    .select({ valueDate: max(exchangeRate.valueDate) })
    .from(exchangeRate)
    .where(lte(exchangeRate.valueDate, today));

  const rows = await db
    .select({
      currency: exchangeRate.currency,
      valueDate: exchangeRate.valueDate,
      rate: exchangeRate.rate,
    })
    .from(exchangeRate)
    .where(inArray(exchangeRate.valueDate, latest));

  const usd = rows.find((row) => row.currency === "USD");
  const eur = rows.find((row) => row.currency === "EUR");
  if (!usd || !eur) return null;

  return { valueDate: usd.valueDate, rates: { USD: Number(usd.rate), EUR: Number(eur.rate) } };
}
