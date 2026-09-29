import { requestWithAuth } from "@/api/client";

interface PartnerChatAudioUrlResponse {
  messageId: string;
  url: string;
  expiresIn?: number;
}

export interface PartnerChatHistoryMessageResponse {
  id: string;
  fromUserId: number;
  relationshipId: number;
  text: string;
  messageType: "text" | "audio";
  audioUrl?: string;
  audioDurationSeconds?: number;
  clientMessageId?: string;
  sentAt: string;
  deliveryStatus: "sent" | "partner_offline" | "read";
}

export interface PartnerChatHistoryPageResponse {
  relationshipId: number;
  messages: PartnerChatHistoryMessageResponse[];
  hasMore: boolean;
  nextBeforeId: string | null;
}

export async function getPartnerChatHistory(
  relationshipId: number,
  beforeId?: string,
) {
  const query = new URLSearchParams({
    relationshipId: String(relationshipId),
    limit: "50",
  });
  if (beforeId) {
    query.set("beforeId", beforeId);
  }

  return requestWithAuth<PartnerChatHistoryPageResponse>(
    `/partner-chat/messages?${query.toString()}`,
    { method: "GET" },
  );
}

export async function getPartnerChatAudioUrl(messageId: string) {
  const response = await requestWithAuth<PartnerChatAudioUrlResponse>(
    `/partner-chat/messages/${encodeURIComponent(messageId)}/audio-url`,
    { method: "GET" },
  );

  return response.url;
}
