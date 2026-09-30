import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { partnerChatDeliveryAckSchema } from "../src/schema/partnerChat.js";
import { getPartnerChatDeliveryStatus } from "../src/ws/delivery-state.js";

describe("partner chat delivery acknowledgements", () => {
  it("accepts a positive safe server message ID and rejects malformed IDs", () => {
    assert.equal(
      partnerChatDeliveryAckSchema.safeParse({
        type: "delivered",
        messageId: "123",
      }).success,
      true,
    );
    for (const messageId of [
      "0",
      "-1",
      "1.5",
      "1e3",
      "9007199254740992",
      "abc",
      "123\n",
    ]) {
      assert.equal(
        partnerChatDeliveryAckSchema.safeParse({
          type: "delivered",
          messageId,
        }).success,
        false,
      );
    }
    assert.equal(
      partnerChatDeliveryAckSchema.safeParse({
        type: "delivered",
        messageId: "123",
        relationshipId: 7,
      }).success,
      false,
    );
  });

  it("distinguishes no delivery attempt, awaiting acknowledgement, and delivered", () => {
    const timestamp = new Date();
    assert.equal(
      getPartnerChatDeliveryStatus(
        { delivery_attempted_at: null, delivered_at: null },
        false,
      ),
      "partner_offline",
    );
    assert.equal(
      getPartnerChatDeliveryStatus(
        { delivery_attempted_at: timestamp, delivered_at: null },
        false,
      ),
      "sending",
    );
    assert.equal(
      getPartnerChatDeliveryStatus(
        { delivery_attempted_at: null, delivered_at: null },
        true,
      ),
      "sending",
    );
    assert.equal(
      getPartnerChatDeliveryStatus(
        { delivery_attempted_at: null, delivered_at: timestamp },
        false,
      ),
      "sent",
    );
  });
});
