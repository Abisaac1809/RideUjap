import type { Currency, Money } from "@rideujap/shared";

import { caracasDate, isRateCurrent, toMoney, type BcvRates } from "./rules";

const RETRY_COOLDOWN_MS = 15 * 60 * 1000;

export type CurrentRate = {
  currency: Currency;
  rate: number;
  rateDate: string;
  stale: boolean;
};

export type ExchangeRateRepo = {
  upsertRates(rates: BcvRates): Promise<void>;
  findEffectiveRates(today: string): Promise<BcvRates | null>;
};

export type ExchangeRateDeps = {
  fetchHtml(): Promise<string>;
  parse(html: string): BcvRates;
  repo: ExchangeRateRepo;
  now?: () => Date;
  onError?: (error: unknown) => void;
};

type State = {
  checkedOn: string;
  stale: boolean;
  effective: BcvRates | null;
};

export function createExchangeRateService({
  fetchHtml,
  parse,
  repo,
  now = () => new Date(),
  onError = () => {},
}: ExchangeRateDeps) {
  let state: State | null = null;
  let pending: Promise<State | null> | null = null;
  let failedAt: number | null = null;

  async function sync(today: string): Promise<State | null> {
    try {
      await repo.upsertRates(parse(await fetchHtml()));
      failedAt = null;
      state = { checkedOn: today, stale: false, effective: await repo.findEffectiveRates(today) };
    } catch (error) {
      onError(error);
      failedAt = now().getTime();
      try {
        state = { checkedOn: today, stale: true, effective: await repo.findEffectiveRates(today) };
      } catch (fallbackError) {
        onError(fallbackError);
        if (state) state = { ...state, stale: true };
      }
    }
    return state;
  }

  async function currentState(): Promise<State | null> {
    const today = caracasDate(now());

    if (state && !state.stale) {
      const valueDate = state.effective?.valueDate ?? "";
      if (isRateCurrent({ valueDate, checkedOn: state.checkedOn }, today)) return state;
    }

    if (failedAt !== null && now().getTime() - failedAt < RETRY_COOLDOWN_MS) return state;

    pending ??= sync(today).finally(() => {
      pending = null;
    });
    return pending;
  }

  async function getCurrentRate(currency: Currency = "USD"): Promise<CurrentRate | null> {
    const current = await currentState();
    if (!current?.effective) return null;

    return {
      currency,
      rate: current.effective.rates[currency],
      rateDate: current.effective.valueDate,
      stale: current.stale,
    };
  }

  /** Conversor a `Money` con la tasa del día, para convertir varios montos con una sola consulta. */
  async function getConverter(): Promise<(usd: number) => Money> {
    const rate = await getCurrentRate("USD");
    return (usd) => toMoney(usd, rate);
  }

  async function toMoneyNow(usd: number): Promise<Money> {
    return (await getConverter())(usd);
  }

  return { getCurrentRate, getConverter, toMoney: toMoneyNow };
}

export type ExchangeRateService = ReturnType<typeof createExchangeRateService>;
