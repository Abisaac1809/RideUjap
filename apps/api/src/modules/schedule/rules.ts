import type { ScheduleDay } from "@rideujap/shared";

export type ScheduleError = "duplicate_day" | "invalid_range";

export function validateSchedule(days: ScheduleDay[]): ScheduleError | null {
  if (new Set(days.map((day) => day.weekday)).size !== days.length) return "duplicate_day";
  if (days.some((day) => day.startTime >= day.endTime)) return "invalid_range";
  return null;
}
