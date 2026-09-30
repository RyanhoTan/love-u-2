export type PartnerChatDeliveryStatus = "sent" | "sending" | "partner_offline";

export function getPartnerChatDeliveryStatus(
  message: {
    delivery_attempted_at: unknown | null;
    delivered_at: unknown | null;
  },
  recipientSocketAccepted: boolean,
): PartnerChatDeliveryStatus {
  if (message.delivered_at != null) {
    return "sent";
  }

  if (message.delivery_attempted_at != null || recipientSocketAccepted) {
    return "sending";
  }

  return "partner_offline";
}
