import { describe, expect, it } from "vitest";

import { computeSuggestedFare, haversineKm, SUGGESTED_COMMISSION, UJAP } from "./fare";

describe("haversineKm", () => {
  it("is zero for identical points", () => {
    expect(haversineKm(UJAP, UJAP)).toBe(0);
  });

  it("grows with distance", () => {
    const near = haversineKm(UJAP, { lat: UJAP.lat + 0.01, lng: UJAP.lng });
    const far = haversineKm(UJAP, { lat: UJAP.lat + 0.05, lng: UJAP.lng });
    expect(far).toBeGreaterThan(near);
  });

  it("approximates ~1.11 km per 0.01 degree of latitude", () => {
    const km = haversineKm(UJAP, { lat: UJAP.lat + 0.01, lng: UJAP.lng });
    expect(km).toBeGreaterThan(1);
    expect(km).toBeLessThan(1.2);
  });
});

describe("computeSuggestedFare", () => {
  it("matches the plan example (~8 km road distance, 2 seats -> ~0.70)", () => {
    // A point whose straight-line distance * 1.3 ~ 8 km from UJAP.
    // 8 / 1.3 ~ 6.15 km straight line ~ 0.0554 deg of latitude.
    const point = { lat: UJAP.lat + 0.0554, lng: UJAP.lng };
    const fare = computeSuggestedFare({ ...point, seats: 2 });
    expect(fare).toBeGreaterThan(0.6);
    expect(fare).toBeLessThan(0.8);
  });

  it("floors at the commission when the point is UJAP itself", () => {
    expect(computeSuggestedFare({ ...UJAP, seats: 1 })).toBe(SUGGESTED_COMMISSION);
  });

  it("splits fuel cost across seats", () => {
    const point = { lat: UJAP.lat + 0.05, lng: UJAP.lng };
    const oneSeat = computeSuggestedFare({ ...point, seats: 1 });
    const fourSeats = computeSuggestedFare({ ...point, seats: 4 });
    expect(fourSeats).toBeLessThan(oneSeat);
    expect(fourSeats).toBeGreaterThan(SUGGESTED_COMMISSION);
  });

  it("rounds to two decimals", () => {
    const fare = computeSuggestedFare({ lat: UJAP.lat + 0.05, lng: UJAP.lng, seats: 3 });
    expect(fare).toBe(Math.round(fare * 100) / 100);
  });

  it("rejects invalid seat counts", () => {
    expect(() => computeSuggestedFare({ ...UJAP, seats: 0 })).toThrow();
    expect(() => computeSuggestedFare({ ...UJAP, seats: -1 })).toThrow();
    expect(() => computeSuggestedFare({ ...UJAP, seats: 1.5 })).toThrow();
  });
});
