import { z } from "zod";
import { isSupportedTimeZone } from "../couple/calendar.js";
import { isValidCalendarDateOnly } from "./dateOnly.js";

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
    .refine(isValidCalendarDateOnly, "anniversaryDate must be a valid calendar date")
    .nullable()
    .optional(),
  timeZone: z
    .string()
    .trim()
    .max(64)
    .refine(isSupportedTimeZone, "timeZone must be a supported named timezone or UTC")
    .optional(),
}).refine(
  (payload) => payload.anniversaryDate !== undefined || payload.timeZone !== undefined,
  "at least one couple profile field is required",
);

export type BindCoupleInput = z.infer<typeof bindCoupleSchema>;
export type UpdateCoupleProfileInput = z.infer<typeof updateCoupleProfileSchema>;
