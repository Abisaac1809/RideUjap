import Fastify from "fastify";
import type { Money, Trip } from "@rideujap/shared";
import { describe, expect, it } from "vitest";

import { fareEstimateSchema, tripJsonSchema } from "./schemas";

const money: Money = { usd: 1.5, ves: 1332.18, rateDate: "2026-10-28", stale: false };

const trip: Trip = {
  id: "trip-1",
  direction: "outbound",
  pointText: "Naguanagua",
  pointLat: 10.25,
  pointLng: -68.01,
  departureTime: "2026-10-28T12:00:00.000Z",
  availableSeats: 2,
  totalSeats: 3,
  admissionMode: "auto",
  farePerPassenger: money,
  status: "active",
  driver: { id: "driver-1", name: "Lino", image: null },
};

async function serialize(schema: object, payload: unknown): Promise<unknown> {
  const app = Fastify();
  app.get("/", { schema: { response: { 200: schema } } }, async () => payload);
  const response = await app.inject({ method: "GET", url: "/" });
  await app.close();
  return response.json();
}

describe("tripJsonSchema", () => {
  it("serializes the fare as money", async () => {
    await expect(serialize(tripJsonSchema, trip)).resolves.toEqual(trip);
  });

  it("serializes a fare without bolivars", async () => {
    const withoutRate = {
      ...trip,
      farePerPassenger: { usd: 1.5, ves: null, rateDate: null, stale: false },
    };
    await expect(serialize(tripJsonSchema, withoutRate)).resolves.toEqual(withoutRate);
  });

  it("serializes a fare to be agreed", async () => {
    const toAgree = { ...trip, farePerPassenger: null };
    await expect(serialize(tripJsonSchema, toAgree)).resolves.toEqual(toAgree);
  });
});

describe("fareEstimateSchema", () => {
  it("serializes the suggested fare as money", async () => {
    const payload = { suggestedFare: { ...money, stale: true } };
    await expect(serialize(fareEstimateSchema.response[200], payload)).resolves.toEqual(payload);
  });
});
