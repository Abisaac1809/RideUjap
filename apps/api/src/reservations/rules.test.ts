import { describe, expect, it } from "vitest";

import { canDecide, canReserve, canRevealPhone, classifyMyTrip, type TripState } from "./rules";

const NOW = new Date("2026-08-19T10:00:00.000Z");
const IN_AN_HOUR = new Date("2026-08-19T11:00:00.000Z");
const AN_HOUR_AGO = new Date("2026-08-19T09:00:00.000Z");

const DRIVER = "driver-1";
const PASSENGER = "passenger-1";

function trip(overrides: Partial<TripState> = {}): TripState {
  return {
    driverId: DRIVER,
    status: "active",
    departureTime: IN_AN_HOUR,
    availableSeats: 2,
    admissionMode: "auto",
    ...overrides,
  };
}

describe("canReserve", () => {
  it("inscribe directo cuando el viaje es automático y quedan puestos", () => {
    expect(
      canReserve({ trip: trip(), passengerId: PASSENGER, existingStatus: null, now: NOW }),
    ).toEqual({
      ok: true,
      status: "enrolled",
      consumesSeat: true,
    });
  });

  it("crea una solicitud sin descontar puestos cuando el viaje es por solicitud", () => {
    const input = {
      trip: trip({ admissionMode: "request" }),
      passengerId: PASSENGER,
      existingStatus: null,
      now: NOW,
    };

    expect(canReserve(input)).toEqual({ ok: true, status: "requested", consumesSeat: false });
  });

  it("rechaza al conductor reservando su propio viaje", () => {
    const input = { trip: trip(), passengerId: DRIVER, existingStatus: null, now: NOW };

    expect(canReserve(input)).toEqual({ ok: false, reason: "own_trip" });
  });

  it("rechaza si el viaje no está activo", () => {
    for (const status of ["completed", "cancelled"] as const) {
      const input = {
        trip: trip({ status }),
        passengerId: PASSENGER,
        existingStatus: null,
        now: NOW,
      };

      expect(canReserve(input)).toEqual({ ok: false, reason: "closed" });
    }
  });

  it("rechaza si el viaje ya salió", () => {
    const input = {
      trip: trip({ departureTime: AN_HOUR_AGO }),
      passengerId: PASSENGER,
      existingStatus: null,
      now: NOW,
    };

    expect(canReserve(input)).toEqual({ ok: false, reason: "closed" });
  });

  it("rechaza la doble reserva del mismo pasajero", () => {
    for (const existingStatus of ["enrolled", "requested", "accepted"] as const) {
      const input = { trip: trip(), passengerId: PASSENGER, existingStatus, now: NOW };

      expect(canReserve(input)).toEqual({ ok: false, reason: "duplicate" });
    }
  });

  it("deja volver a reservar después de un rechazo", () => {
    const input = {
      trip: trip(),
      passengerId: PASSENGER,
      existingStatus: "rejected" as const,
      now: NOW,
    };

    expect(canReserve(input)).toEqual({ ok: true, status: "enrolled", consumesSeat: true });
  });

  it("rechaza si el viaje está lleno", () => {
    const input = {
      trip: trip({ availableSeats: 0 }),
      passengerId: PASSENGER,
      existingStatus: null,
      now: NOW,
    };

    expect(canReserve(input)).toEqual({ ok: false, reason: "full" });
  });

  it("reporta la doble reserva antes que el viaje lleno", () => {
    const input = {
      trip: trip({ availableSeats: 0 }),
      passengerId: PASSENGER,
      existingStatus: "enrolled" as const,
      now: NOW,
    };

    expect(canReserve(input)).toEqual({ ok: false, reason: "duplicate" });
  });
});

describe("canDecide", () => {
  const base = {
    trip: trip({ admissionMode: "request" }),
    reservationStatus: "requested" as const,
    actorId: DRIVER,
    decision: "accepted" as const,
    now: NOW,
  };

  it("acepta una solicitud y descuenta el puesto", () => {
    expect(canDecide(base)).toEqual({ ok: true, status: "accepted", consumesSeat: true });
  });

  it("rechaza una solicitud sin tocar los puestos", () => {
    expect(canDecide({ ...base, decision: "rejected" })).toEqual({
      ok: true,
      status: "rejected",
      consumesSeat: false,
    });
  });

  it("prohíbe decidir a quien no es el conductor del viaje", () => {
    expect(canDecide({ ...base, actorId: PASSENGER })).toEqual({ ok: false, reason: "forbidden" });
  });

  it("no vuelve a gestionar una reserva que ya no está en solicitada", () => {
    for (const reservationStatus of ["enrolled", "accepted", "rejected"] as const) {
      expect(canDecide({ ...base, reservationStatus })).toEqual({
        ok: false,
        reason: "already_handled",
      });
    }
  });

  it("no acepta si el viaje está lleno", () => {
    const input = { ...base, trip: trip({ admissionMode: "request", availableSeats: 0 }) };

    expect(canDecide(input)).toEqual({ ok: false, reason: "full" });
  });

  it("no acepta si el viaje ya no está abierto", () => {
    const input = { ...base, trip: trip({ admissionMode: "request", status: "cancelled" }) };

    expect(canDecide(input)).toEqual({ ok: false, reason: "closed" });
  });

  it("permite rechazar aunque el viaje esté lleno o cerrado", () => {
    const input = {
      ...base,
      decision: "rejected" as const,
      trip: trip({ admissionMode: "request", availableSeats: 0, departureTime: AN_HOUR_AGO }),
    };

    expect(canDecide(input)).toEqual({ ok: true, status: "rejected", consumesSeat: false });
  });
});

describe("canRevealPhone", () => {
  it("revela el teléfono solo en reservas confirmadas", () => {
    expect(canRevealPhone("enrolled")).toBe(true);
    expect(canRevealPhone("accepted")).toBe(true);
    expect(canRevealPhone("requested")).toBe(false);
    expect(canRevealPhone("rejected")).toBe(false);
  });
});

describe("classifyMyTrip", () => {
  it("cuenta como próximo un viaje activo que no ha salido", () => {
    expect(classifyMyTrip({ tripStatus: "active", departureTime: IN_AN_HOUR, now: NOW })).toBe(
      "upcoming",
    );
  });

  it("manda a historial un viaje activo cuya hora ya pasó", () => {
    expect(classifyMyTrip({ tripStatus: "active", departureTime: AN_HOUR_AGO, now: NOW })).toBe(
      "history",
    );
  });

  it("manda a historial los viajes completados y cancelados", () => {
    for (const tripStatus of ["completed", "cancelled"] as const) {
      expect(classifyMyTrip({ tripStatus, departureTime: IN_AN_HOUR, now: NOW })).toBe("history");
    }
  });

  it("manda a historial una reserva rechazada aunque el viaje sea futuro", () => {
    const result = classifyMyTrip({
      tripStatus: "active",
      departureTime: IN_AN_HOUR,
      reservationStatus: "rejected",
      now: NOW,
    });

    expect(result).toBe("history");
  });
});
