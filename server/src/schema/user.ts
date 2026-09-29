import { z } from "zod";

function isValidDateOnly(value: string) {
  const parsed = new Date(`${value}T00:00:00.000Z`);

  return (
    !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value
  );
}

export const authSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "username is required"),
  password: z
    .string()
    .min(1, "password is required"),
});

export type AuthInput = z.infer<typeof authSchema>;

export const updateUserProfileSchema = z.object({
  nickname: z
    .string()
    .trim()
    .max(30, "nickname must be at most 30 characters"),
  avatar: z
    .string()
    .trim()
    .max(2048, "avatar must be at most 2048 characters")
    .nullable(),
  signature: z
    .string()
    .trim()
    .max(200, "signature must be at most 200 characters"),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "birthday must be in YYYY-MM-DD format")
    .refine(isValidDateOnly, "birthday must be a valid date")
    .refine(
      (value) => value <= new Date().toISOString().slice(0, 10),
      "birthday cannot be in the future",
    )
    .nullable(),
});

export type UpdateUserProfileInput = z.infer<typeof updateUserProfileSchema>;
