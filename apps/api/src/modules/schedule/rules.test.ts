import { describe, expect, it } from "vitest";

import { validateSchedule } from "./rules";

describe("validateSchedule", () => {
  it("accepts a valid schedule", () => {
    expect(
      validateSchedule([
        { weekday: 1, startTime: "07:00", endTime: "12:30" },
        { weekday: 3, startTime: "13:00", endTime: "18:00" },
      ]),
    ).toBeNull();
  });

  it("accepts an empty schedule", () => {
    expect(validateSchedule([])).toBeNull();
  });

  it("rejects a repeated weekday", () => {
    expect(
      validateSchedule([
        { weekday: 2, startTime: "07:00", endTime: "09:00" },
        { weekday: 2, startTime: "10:00", endTime: "12:00" },
      ]),
    ).toBe("duplicate_day");
  });

  it("rejects a start time after the end time", () => {
    expect(validateSchedule([{ weekday: 1, startTime: "14:00", endTime: "08:00" }])).toBe(
      "invalid_range",
    );
  });

  it("rejects equal start and end times", () => {
    expect(validateSchedule([{ weekday: 1, startTime: "08:00", endTime: "08:00" }])).toBe(
      "invalid_range",
    );
  });
});
