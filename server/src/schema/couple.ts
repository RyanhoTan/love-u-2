import { z } from "zod";

export const bindCoupleSchema = z.object({
  inviteCode: z
    .string()
    .trim()
    .min(6, "invite code must be at least 6 characters")
    .max(12, "invite code must be at most 12 characters")
    .regex(
      /^[A-Z0-9]+$/,
      "invite code must contain only uppercase letters and numbers"
    ),
});

export const updateCoupleProfileSchema = z.object({
  anniversaryDate: z
    .string()
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      "anniversaryDate must be in YYYY-MM-DD format"
    )
    .nullable(),
});

export type BindCoupleInput = z.infer<typeof bindCoupleSchema>;
export type UpdateCoupleProfileInput = z.infer<typeof updateCoupleProfileSchema>;
