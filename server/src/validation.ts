import { ZodError, type ZodType } from "zod";
import { HttpError } from "./errors.js";

export function parseRequestBody<T>(schema: ZodType<T>, input: unknown): T {
  try {
    return schema.parse(input);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new HttpError(400, error.issues[0]?.message || "invalid request payload");
    }

    throw error;
  }
}
