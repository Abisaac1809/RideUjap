import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  caracasDate,
  effectiveValueDate,
  isRateCurrent,
  parseBcvHtml,
  parseRate,
  toMoney,
  toVes,
} from "./rules";

const fixture = readFileSync(new URL("./__fixtures__/bcv.html", import.meta.url), "utf8");

describe("parseRate", () => {
  it("reads a decimal comma", () => {
    expect(parseRate(" 888,11830000 ")).toBe(888.1183);
  });

  it("ignores the currency label", () => {
    expect(parseRate("  USD  36,12345678")).toBe(36.12345678);
  });

  it("drops thousand separators", () => {
    expect(parseRate("1.234,56789012")).toBe(1234.56789012);
  });

  it("rejects text without a number", () => {
    expect(() => parseRate("USD")).toThrow();
  });

  it("rejects zero", () => {
    expect(() => parseRate("0,00")).toThrow();
  });
});

describe("parseBcvHtml", () => {
  it("reads the USD and EUR rates with their value date from the real page", () => {
    expect(parseBcvHtml(fixture)).toEqual({
      valueDate: "2026-10-28",
      rates: { USD: 888.1183, EUR: 989.71903352 },
    });
  });

  it("fails when the dollar rate is missing", () => {
    const html = fixture.replace('id="dolar"', 'id="otro"');
    expect(() => parseBcvHtml(html)).toThrow();
  });

  it("fails when the euro rate is missing", () => {
    const html = fixture.replace('id="euro"', 'id="otro"');
    expect(() => parseBcvHtml(html)).toThrow();
  });

  it("fails when the value date is missing", () => {
    const html = fixture.replace('content="2026-10-28T00:00:00-04:00"', 'content=""');
    expect(() => parseBcvHtml(html)).toThrow();
  });

  it("fails on an invalid value date", () => {
    const html = fixture.replace("2026-10-28T00:00:00-04:00", "2026-13-45T00:00:00-04:00");
    expect(() => parseBcvHtml(html)).toThrow();
  });
});

describe("caracasDate", () => {
  it("uses the Venezuelan calendar day", () => {
    expect(caracasDate(new Date("2026-10-29T03:30:00Z"))).toBe("2026-10-28");
    expect(caracasDate(new Date("2026-10-29T04:30:00Z"))).toBe("2026-10-29");
  });
});

describe("isRateCurrent", () => {
  it("is current when the value date is today", () => {
    expect(isRateCurrent({ valueDate: "2026-10-28", checkedOn: "2026-10-27" }, "2026-10-28")).toBe(
      true,
    );
  });

  it("is current when it was synced today", () => {
    expect(isRateCurrent({ valueDate: "2026-10-23", checkedOn: "2026-10-25" }, "2026-10-25")).toBe(
      true,
    );
  });

  it("is outdated when it is from an earlier day and was not synced today", () => {
    expect(isRateCurrent({ valueDate: "2026-10-27", checkedOn: "2026-10-27" }, "2026-10-28")).toBe(
      false,
    );
  });
});

describe("effectiveValueDate", () => {
  it("prefers the latest value date on or before today", () => {
    expect(effectiveValueDate({ latestPast: "2026-10-28", earliestFuture: "2026-10-29" })).toBe(
      "2026-10-28",
    );
  });

  it("falls back to the next published value date when none applies yet", () => {
    expect(effectiveValueDate({ latestPast: null, earliestFuture: "2026-10-29" })).toBe(
      "2026-10-29",
    );
  });

  it("returns null when no rates are stored", () => {
    expect(effectiveValueDate({ latestPast: null, earliestFuture: null })).toBeNull();
  });
});

describe("toVes", () => {
  it("rounds only the result to cents", () => {
    expect(toVes(1.2, 888.1183)).toBe(1065.74);
    expect(toVes(2.5, 36.12345678)).toBe(90.31);
  });

  it("rounds half cents up", () => {
    expect(toVes(1, 10.005)).toBe(10.01);
  });
});

describe("toMoney", () => {
  it("converts with the given rate", () => {
    expect(toMoney(1.2, { rate: 888.1183, rateDate: "2026-10-28", stale: false })).toEqual({
      usd: 1.2,
      ves: 1065.74,
      rateDate: "2026-10-28",
      stale: false,
    });
  });

  it("keeps the stale flag", () => {
    expect(toMoney(2, { rate: 10, rateDate: "2026-10-25", stale: true })).toEqual({
      usd: 2,
      ves: 20,
      rateDate: "2026-10-25",
      stale: true,
    });
  });

  it("leaves bolivars empty without a rate", () => {
    expect(toMoney(2, null)).toEqual({ usd: 2, ves: null, rateDate: null, stale: false });
  });
});
