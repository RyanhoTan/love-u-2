import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSamePartnerChatMessagePayload } from "../src/ws/partnerChat.js";

describe("partner chat audio retry payloads", () => {
  it("accepts the original key and duration and rejects changed media", () => {
    const savedMessage = {
      message_type: "audio",
      text: null,
      audio_url: null,
      audio_object_key: "interact/9/voice-1.m4a",
      audio_duration_seconds: 8.4,
    } as const;
    const originalPayload = {
      messageType: "audio",
      audioObjectKey: savedMessage.audio_object_key,
      audioDurationSeconds: savedMessage.audio_duration_seconds,
    } as const;

    assert.equal(
      isSamePartnerChatMessagePayload(savedMessage, originalPayload),
      true,
    );
    assert.equal(
      isSamePartnerChatMessagePayload(savedMessage, {
        ...originalPayload,
        audioObjectKey: "interact/9/voice-2.m4a",
      }),
      false,
    );
    assert.equal(
      isSamePartnerChatMessagePayload(savedMessage, {
        ...originalPayload,
        audioDurationSeconds: 9.1,
      }),
      false,
    );
  });
});
