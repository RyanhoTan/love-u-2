import { requestWithAuth } from "@/app/shared/api-client";

interface PartnerChatAudioUrlResponse {
  messageId: string;
  url: string;
  expiresIn?: number;
}

export async function getPartnerChatAudioUrl(
  messageId: string,
  token: string,
) {
  const response = await requestWithAuth<PartnerChatAudioUrlResponse>(
    `/partner-chat/messages/${encodeURIComponent(messageId)}/audio-url`,
    { method: "GET" },
    token,
  );

  return response.url;
}
