import { describe, expect, it } from "vitest";

import { toUserUpdates } from "./rules";

describe("toUserUpdates", () => {
  it("trims the provided fields", () => {
    expect(toUserUpdates({ name: "  Lino  ", phone: " 0414-1234567 " })).toEqual({
      ok: true,
      updates: { name: "Lino", phone: "0414-1234567" },
    });
  });

  it("rejects a name that is blank after trimming", () => {
    expect(toUserUpdates({ name: "   " })).toEqual({ ok: false, error: "empty_name" });
  });

  it("rejects a phone that is blank after trimming", () => {
    expect(toUserUpdates({ phone: "      " })).toEqual({ ok: false, error: "empty_phone" });
  });

  it("clears the image when it is null", () => {
    expect(toUserUpdates({ image: null })).toEqual({ ok: true, updates: { image: null } });
  });

  it("clears the image when it is blank", () => {
    expect(toUserUpdates({ image: "  " })).toEqual({ ok: true, updates: { image: null } });
  });

  it("rejects a patch without fields", () => {
    expect(toUserUpdates({})).toEqual({ ok: false, error: "no_changes" });
  });
});
