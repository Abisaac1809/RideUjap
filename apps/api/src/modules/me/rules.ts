import type { UpdateMeBody } from "@rideujap/shared";

export type UserUpdates = Partial<{ name: string; image: string | null; phone: string }>;

export type UpdateError = "no_changes" | "empty_name" | "empty_phone";

export type UpdatesResult = { ok: true; updates: UserUpdates } | { ok: false; error: UpdateError };

export function toUserUpdates(patch: UpdateMeBody): UpdatesResult {
  const updates: UserUpdates = {};

  if (patch.name !== undefined) {
    const name = patch.name.trim();
    if (!name) return { ok: false, error: "empty_name" };
    updates.name = name;
  }

  if (patch.phone !== undefined) {
    const phone = patch.phone.trim();
    if (!phone) return { ok: false, error: "empty_phone" };
    updates.phone = phone;
  }

  if (patch.image !== undefined) {
    updates.image = patch.image?.trim() || null;
  }

  if (Object.keys(updates).length === 0) return { ok: false, error: "no_changes" };

  return { ok: true, updates };
}
