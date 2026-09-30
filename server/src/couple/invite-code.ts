import { randomInt } from "node:crypto";

export const INVITE_CODE_LENGTH = 12;
export const INVITE_CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

type RandomIndex = (maxExclusive: number) => number;

export function generateInviteCode(
  nextRandomIndex: RandomIndex = randomInt
) {
  return Array.from({ length: INVITE_CODE_LENGTH }, () => {
    const index = nextRandomIndex(INVITE_CODE_ALPHABET.length);
    return INVITE_CODE_ALPHABET[index];
  }).join("");
}
