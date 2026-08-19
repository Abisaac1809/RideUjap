import { describe, expect, it } from "vitest";

import { isUniqueViolation } from "./errors";

describe("isUniqueViolation", () => {
  it("reconoce el error del driver tal cual", () => {
    expect(isUniqueViolation(Object.assign(new Error("duplicate key"), { code: "23505" }))).toBe(
      true,
    );
  });

  it("reconoce el error envuelto por Drizzle", () => {
    const driverError = Object.assign(new Error("duplicate key"), { code: "23505" });
    const wrapped = new Error("Failed query", { cause: driverError });

    expect(isUniqueViolation(wrapped)).toBe(true);
  });

  it("ignora otros errores de Postgres", () => {
    const notNull = Object.assign(new Error("null value"), { code: "23502" });

    expect(isUniqueViolation(new Error("Failed query", { cause: notNull }))).toBe(false);
  });

  it("no explota con valores vacíos ni con cadenas muy profundas", () => {
    const deep = new Error("l5", {
      cause: new Error("l4", {
        cause: new Error("l3", {
          cause: new Error("l2", {
            cause: new Error("l1", {
              cause: Object.assign(new Error("duplicate key"), { code: "23505" }),
            }),
          }),
        }),
      }),
    });

    expect(isUniqueViolation(null)).toBe(false);
    expect(isUniqueViolation(undefined)).toBe(false);
    expect(isUniqueViolation("23505")).toBe(false);
    expect(isUniqueViolation(deep)).toBe(false);
  });
});
