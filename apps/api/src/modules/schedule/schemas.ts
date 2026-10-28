import { TIME_PATTERN } from "@rideujap/shared";

const scheduleDay = {
  type: "object",
  additionalProperties: false,
  required: ["weekday", "startTime", "endTime"],
  properties: {
    weekday: { type: "integer", minimum: 1, maximum: 6 },
    startTime: { type: "string", pattern: TIME_PATTERN },
    endTime: { type: "string", pattern: TIME_PATTERN },
  },
};

const scheduleResponse = { type: "array", items: scheduleDay };

export const getScheduleSchema = {
  response: { 200: scheduleResponse },
};

export const updateScheduleSchema = {
  body: {
    type: "object",
    additionalProperties: false,
    required: ["days"],
    properties: {
      days: { type: "array", maxItems: 6, items: scheduleDay },
    },
  },
  response: { 200: scheduleResponse },
};
