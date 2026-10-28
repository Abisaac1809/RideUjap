import { fetchBcvHtml } from "./bcv-client";
import { findEffectiveRates, upsertRates } from "./repository";
import { parseBcvHtml } from "./rules";
import { createExchangeRateService } from "./service";

export const exchangeRateService = createExchangeRateService({
  fetchHtml: fetchBcvHtml,
  parse: parseBcvHtml,
  repo: { upsertRates, findEffectiveRates },
  onError: (error) => console.warn("BCV exchange rate sync failed:", error),
});
