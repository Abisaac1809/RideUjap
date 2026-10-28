import { describe, expect, it, vi } from "vitest";

import type { BcvRates } from "./rules";
import { createExchangeRateService } from "./service";

const BCV_HTML = "<html>bcv</html>";

function rates(valueDate: string, usd: number, eur = usd * 1.1): BcvRates {
  return { valueDate, rates: { USD: usd, EUR: eur } };
}

function setup(options: { stored?: BcvRates[]; scraped?: BcvRates | Error } = {}) {
  const stored = [...(options.stored ?? [])];
  let scraped = options.scraped ?? rates("2026-10-28", 36);
  let now = new Date("2026-10-28T14:00:00-04:00");

  const fetchHtml = vi.fn(async () => {
    if (scraped instanceof Error) throw scraped;
    return BCV_HTML;
  });
  const parse = vi.fn(() => scraped as BcvRates);
  const repo = {
    upsertRates: vi.fn(async (value: BcvRates) => {
      const index = stored.findIndex((row) => row.valueDate === value.valueDate);
      if (index >= 0) stored.splice(index, 1);
      stored.push(value);
    }),
    findEffectiveRates: vi.fn(async (today: string) => {
      const candidates = stored.filter((row) => row.valueDate <= today);
      candidates.sort((a, b) => b.valueDate.localeCompare(a.valueDate));
      return candidates[0] ?? null;
    }),
  };

  const service = createExchangeRateService({
    fetchHtml,
    parse,
    repo,
    now: () => now,
    onError: () => {},
  });

  return {
    service,
    fetchHtml,
    repo,
    stored,
    setNow: (iso: string) => (now = new Date(iso)),
    setScraped: (value: BcvRates | Error) => (scraped = value),
  };
}

describe("exchange rate service", () => {
  it("scrapes, stores and returns the rate of the day", async () => {
    const { service, repo } = setup();

    await expect(service.getCurrentRate()).resolves.toEqual({
      currency: "USD",
      rate: 36,
      rateDate: "2026-10-28",
      stale: false,
    });
    expect(repo.upsertRates).toHaveBeenCalledWith(rates("2026-10-28", 36));
  });

  it("returns the requested currency", async () => {
    const { service } = setup({ scraped: rates("2026-10-28", 36, 40) });

    await expect(service.getCurrentRate("EUR")).resolves.toMatchObject({
      currency: "EUR",
      rate: 40,
    });
  });

  it("shares one scrape between concurrent callers", async () => {
    const { service, fetchHtml } = setup();

    await Promise.all([service.getCurrentRate(), service.getCurrentRate("EUR")]);

    expect(fetchHtml).toHaveBeenCalledTimes(1);
  });

  it("serves the cache for the rest of the day", async () => {
    const { service, fetchHtml, setNow } = setup();

    await service.getCurrentRate();
    setNow("2026-10-28T23:00:00-04:00");
    await service.getCurrentRate();

    expect(fetchHtml).toHaveBeenCalledTimes(1);
  });

  it("scrapes again on a new day", async () => {
    const { service, fetchHtml, setNow, setScraped } = setup();

    await service.getCurrentRate();
    setNow("2026-10-29T08:00:00-04:00");
    setScraped(rates("2026-10-29", 37));

    await expect(service.getCurrentRate()).resolves.toMatchObject({
      rate: 37,
      rateDate: "2026-10-29",
    });
    expect(fetchHtml).toHaveBeenCalledTimes(2);
  });

  it("keeps using today's rate when the BCV already published tomorrow's", async () => {
    const { service } = setup({
      stored: [rates("2026-10-28", 36)],
      scraped: rates("2026-10-29", 37),
    });

    await expect(service.getCurrentRate()).resolves.toMatchObject({
      rate: 36,
      rateDate: "2026-10-28",
      stale: false,
    });
  });

  it("falls back to the latest stored rate marked as stale when scraping fails", async () => {
    const { service } = setup({
      stored: [rates("2026-10-25", 35)],
      scraped: new Error("timeout"),
    });

    await expect(service.getCurrentRate()).resolves.toEqual({
      currency: "USD",
      rate: 35,
      rateDate: "2026-10-25",
      stale: true,
    });
  });

  it("returns null when scraping fails and nothing is stored", async () => {
    const { service } = setup({ scraped: new Error("timeout") });

    await expect(service.getCurrentRate()).resolves.toBeNull();
  });

  it("waits for the cooldown before scraping again after a failure", async () => {
    const { service, fetchHtml, setNow, setScraped } = setup({
      stored: [rates("2026-10-25", 35)],
      scraped: new Error("timeout"),
    });

    await service.getCurrentRate();
    setScraped(rates("2026-10-28", 36));

    setNow("2026-10-28T14:10:00-04:00");
    await expect(service.getCurrentRate()).resolves.toMatchObject({ stale: true });
    expect(fetchHtml).toHaveBeenCalledTimes(1);

    setNow("2026-10-28T14:16:00-04:00");
    await expect(service.getCurrentRate()).resolves.toMatchObject({ rate: 36, stale: false });
    expect(fetchHtml).toHaveBeenCalledTimes(2);
  });

  it("does not store anything when the page cannot be parsed", async () => {
    const { service, repo } = setup();
    const failing = createExchangeRateService({
      fetchHtml: async () => BCV_HTML,
      parse: () => {
        throw new Error("missing rate");
      },
      repo,
      now: () => new Date("2026-10-28T14:00:00-04:00"),
      onError: () => {},
    });

    await service.getCurrentRate();
    repo.upsertRates.mockClear();

    await expect(failing.getCurrentRate()).resolves.toMatchObject({ stale: true });
    expect(repo.upsertRates).not.toHaveBeenCalled();
  });

  it("converts dollars with the current rate", async () => {
    const { service } = setup({ scraped: rates("2026-10-28", 36.5) });

    await expect(service.toMoney(2)).resolves.toEqual({
      usd: 2,
      ves: 73,
      rateDate: "2026-10-28",
      stale: false,
    });
  });
});
