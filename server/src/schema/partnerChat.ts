import { z } from "zod";

const audioObjectKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(2048)
  .regex(/^interact\/[1-9]\d*\/[A-Za-z0-9._-]+$/);

export const partnerChatAudioMessageSchema = z
  .object({
    type: z.literal("message"),
    messageType: z.literal("audio"),
    audioObjectKey: audioObjectKeySchema.optional(),
    audioUrl: z.string().trim().min(1).max(2048).optional(),
    audioDurationSeconds: z.number().positive().max(600).optional(),
    clientMessageId: z.string().trim().max(100).optional(),
  })
  .strict()
  .refine(
    (message) =>
      (message.audioObjectKey !== undefined) !==
      (message.audioUrl !== undefined),
    { message: "provide exactly one of audioObjectKey or audioUrl" },
  );

export function isInteractObjectKeyOwnedByUser(
  userId: number,
  objectKey: string,
) {
  return new RegExp(`^interact/${userId}/[A-Za-z0-9._-]+$`).test(objectKey);
}
