import { z } from "zod";

export const wishStatusSchema = z.enum(["todo", "doing", "done"]);

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
  targetDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "targetDate must be in YYYY-MM-DD format"),
  locationName: z
    .string()
    .trim()
    .max(100, "locationName must be at most 100 characters")
    .optional()
    .default(""),
  latitude: z.number().min(-90).max(90).nullable().optional().default(null),
  longitude: z.number().min(-180).max(180).nullable().optional().default(null),
  budgetAmount: z.number().int().min(0).nullable().optional().default(null),
});

export const updateWishSchema = z.object({
  status: wishStatusSchema,
});

export const createWishRecordSchema = z.object({
  content: z
    .string()
    .trim()
    .max(1000, "content must be at most 1000 characters")
    .optional()
    .default(""),
  recordDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "recordDate must be in YYYY-MM-DD format"),
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
  mediaUrls: z
    .array(z.string().trim().min(1, "mediaUrls contains an invalid item"))
    .max(99, "mediaUrls must contain at most 99 items")
    .optional()
    .default([]),
});

export type WishStatus = z.infer<typeof wishStatusSchema>;
export type CreateWishInput = z.infer<typeof createWishSchema>;
export type UpdateWishInput = z.infer<typeof updateWishSchema>;
export type CreateWishRecordInput = z.infer<typeof createWishRecordSchema>;
