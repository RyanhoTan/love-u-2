import { z } from "zod";

export const albumMediaTypeSchema = z.enum(["image", "video"]);
export const albumMediaSourceTypeSchema = z.enum([
  "wish_record",
  "story",
  "upload",
]);

export const createAlbumMediaSchema = z.object({
  mediaType: albumMediaTypeSchema,
  url: z.string().trim().min(1, "url is required"),
  thumbnailUrl: z.string().trim().optional().default(""),
  takenAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "takenAt must be in YYYY-MM-DD format")
    .optional(),
  locationName: z.string().trim().max(100).optional().default(""),
  latitude: z.number().min(-90).max(90).nullable().optional().default(null),
  longitude: z.number().min(-180).max(180).nullable().optional().default(null),
});

const storyMediaSchema = z.object({
  mediaType: albumMediaTypeSchema,
  url: z.string().trim().min(1, "media url is required"),
  thumbnailUrl: z.string().trim().optional().default(""),
  takenAt: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "takenAt must be in YYYY-MM-DD format")
    .optional(),
  locationName: z.string().trim().max(100).optional().default(""),
  latitude: z.number().min(-90).max(90).nullable().optional().default(null),
  longitude: z.number().min(-180).max(180).nullable().optional().default(null),
});

export const createAlbumStorySchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "title is required")
    .max(200, "title must be at most 200 characters"),
  description: z.string().trim().max(5000).optional().default(""),
  media: z.array(storyMediaSchema).max(99).default([]),
});

export type AlbumMediaType = z.infer<typeof albumMediaTypeSchema>;
export type AlbumMediaSourceType = z.infer<typeof albumMediaSourceTypeSchema>;
export type CreateAlbumMediaInput = z.infer<typeof createAlbumMediaSchema>;
export type CreateAlbumStoryInput = z.infer<typeof createAlbumStorySchema>;
