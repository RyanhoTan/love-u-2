import { requestWithAuth } from "@/api/client";

interface PartnerChatAudioUrlResponse {
  messageId: string;
  url: string;
  expiresIn?: number;
}

export async function getPartnerChatAudioUrl(messageId: string) {
  const response = await requestWithAuth<PartnerChatAudioUrlResponse>(
    `/partner-chat/messages/${encodeURIComponent(messageId)}/audio-url`,
    { method: "GET" },
  );

  return response.url;
}
