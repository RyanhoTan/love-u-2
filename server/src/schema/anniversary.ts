import { z } from "zod";
import { isValidCalendarDateOnly } from "./dateOnly.js";

export const anniversaryTypeSchema = z.enum([
  "love",
  "birthday",
  "holiday",
  "custom",
]);

export const anniversaryRepeatTypeSchema = z.enum(["none", "yearly"]);

export const anniversaryPayloadSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "title is required")
    .max(100, "title must be at most 100 characters"),
  type: anniversaryTypeSchema,
  originalDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "originalDate must be in YYYY-MM-DD format")
    .refine(isValidCalendarDateOnly, "originalDate must be a valid calendar date"),
  repeatType: anniversaryRepeatTypeSchema,
  reminderDaysBefore: z
    .number()
    .int("reminderDaysBefore must be an integer")
    .min(0, "reminderDaysBefore must be at least 0")
    .max(30, "reminderDaysBefore must be at most 30"),
});

export const createAnniversarySchema = anniversaryPayloadSchema;
export const updateAnniversarySchema = anniversaryPayloadSchema;

export type CreateAnniversaryInput = z.infer<typeof createAnniversarySchema>;
export type UpdateAnniversaryInput = z.infer<typeof updateAnniversarySchema>;
