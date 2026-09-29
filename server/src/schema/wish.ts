import { z } from "zod";
import { isValidCalendarDateOnly } from "./dateOnly.js";

export const wishStatusSchema = z.enum(["todo", "doing", "done"]);
const wishBudgetAmountSchema = z
  .number()
  .int()
  .min(0)
  .max(2_147_483_647)
  .nullable();

function wishDateOnlySchema(fieldName: "targetDate" | "recordDate") {
  return z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${fieldName} must be in YYYY-MM-DD format`)
    .refine(isValidCalendarDateOnly, `${fieldName} must be a valid calendar date`);
}

export const createWishSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "title is required")
    .max(100, "title must be at most 100 characters"),
  description: z
    .string()
    .trim()
    .max(1000, "description must be at most 1000 characters")
    .optional()
    .default(""),
  cover: z
    .string()
    .trim()
    .url("cover must be a valid URL")
    .optional()
    .or(z.literal(""))
    .default(""),
  targetDate: wishDateOnlySchema("targetDate"),
  locationName: z
    .string()
    .trim()
    .max(100, "locationName must be at most 100 characters")
    .optional()
    .default(""),
  latitude: z.number().min(-90).max(90).nullable().optional().default(null),
  longitude: z.number().min(-180).max(180).nullable().optional().default(null),
  budgetAmount: wishBudgetAmountSchema.optional().default(null),
});

export const updateWishSchema = z
  .object({
    status: wishStatusSchema.optional(),
    title: z
      .string()
      .trim()
      .min(1, "title is required")
      .max(100, "title must be at most 100 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(1000, "description must be at most 1000 characters")
      .optional(),
    targetDate: wishDateOnlySchema("targetDate").optional(),
    budgetAmount: wishBudgetAmountSchema.optional(),
  })
  .strict()
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "at least one wish field is required",
  });

export const createWishRecordSchema = z.object({
  content: z
    .string()
    .trim()
    .max(1000, "content must be at most 1000 characters")
    .optional()
    .default(""),
  recordDate: wishDateOnlySchema("recordDate"),
  mood: z
    .string()
    .trim()
    .max(50, "mood must be at most 50 characters")
    .optional()
    .default(""),
  locationName: z
    .string()
    .trim()
    .max(100, "locationName must be at most 100 characters")
    .optional()
    .default(""),
  latitude: z.number().min(-90).max(90).nullable().optional().default(null),
  longitude: z.number().min(-180).max(180).nullable().optional().default(null),
  budgetAmount: z.number().int().min(0).nullable().optional().default(null),
  media: z
    .array(
      z.object({
        url: z
          .string()
          .trim()
          .pipe(z.url({ message: "media url must be a valid URL" })),
        mediaType: z.enum(["image", "video"]),
        thumbnailUrl: z.string().trim().optional().default(""),
      }),
    )
    .max(99, "media must contain at most 99 items")
    .optional()
    .default([]),
});

export type WishStatus = z.infer<typeof wishStatusSchema>;
export type CreateWishInput = z.infer<typeof createWishSchema>;
export type UpdateWishInput = z.infer<typeof updateWishSchema>;
export type CreateWishRecordInput = z.infer<typeof createWishRecordSchema>;
