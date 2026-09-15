import { describe, expect, it } from "vitest";

import { effectiveSeats } from "./rules";

describe("effectiveSeats", () => {
  it("uses the requested seats when they fit the vehicle and the global cap", () => {
    expect(effectiveSeats(3, 4)).toBe(3);
  });

  it("caps at the vehicle's seat count when the request exceeds it", () => {
    expect(effectiveSeats(5, 4)).toBe(4);
  });

  it("caps at 8 even when the vehicle has more seats", () => {
    expect(effectiveSeats(10, 12)).toBe(8);
  });

  it("caps at 8 when both the request and the vehicle exceed it", () => {
    expect(effectiveSeats(9, 9)).toBe(8);
  });

  it("returns the requested seats when everything matches at 1", () => {
    expect(effectiveSeats(1, 1)).toBe(1);
  });
});
