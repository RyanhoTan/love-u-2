import type { UpdateCoupleProfileInput } from "../schema/couple.js";

export function buildCoupleProfileUpdate(
  relationshipId: number,
  userId: number,
  payload: UpdateCoupleProfileInput,
) {
  const assignments: string[] = [];
  const values: (string | number | null)[] = [];
  if (payload.anniversaryDate !== undefined) {
    assignments.push("anniversary_date = ?");
    values.push(payload.anniversaryDate);
  }
  if (payload.timeZone !== undefined) {
    assignments.push("time_zone = ?");
    values.push(payload.timeZone);
  }
  assignments.push("updated_at = CURRENT_TIMESTAMP");
  return {
    sql: `UPDATE couple_relationships
      SET ${assignments.join(", ")}
      WHERE id = ?
        AND status = 'bound'
        AND (user_a_id = ? OR user_b_id = ?)`,
    values: [...values, relationshipId, userId, userId],
  };
}
