export const TIME_PATTERN = "^([01]\\d|2[0-3]):[0-5]\\d$";

export interface ScheduleDay {
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface UpdateScheduleBody {
  days: ScheduleDay[];
}
